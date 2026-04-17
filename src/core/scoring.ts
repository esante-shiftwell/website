import type {
  AnalysisDraft,
  DerivedMetrics,
  EvidenceLink,
  RawSegment,
  ScoreBundle,
  ScoreTrace,
} from './model';
import { EVIDENCE_IDS, getEvidenceRefs } from './evidence';

const MINUTES_PER_DAY = 1440;
const WEEK_MINUTES = 7 * MINUTES_PER_DAY;

export const SCORING_VERSION = 'shiftwell-proxy-v0.2';
export const CONSENT_NOTICE_VERSION = 'notice-v0.1';

type NormSegment = {
  startAbs: number; // minute in [0, WEEK_MINUTES]
  endAbs: number;
  kind: 'work' | 'sleep';
  dayIndex: number;
  id: string;
};

const REFERENCE_MEANS: Partial<{
  riskScore: number;
  sleepScore: number;
  adaptabilityScore: number;
}> = {
  // TODO: brancher une vraie moyenne (papier/cohorte) dès validation scientifique.
  // riskScore: 52,
  // sleepScore: 58,
  // adaptabilityScore: 55,
};

function hhmmToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
}

function normalizeSegments(rawSegments: RawSegment[]): NormSegment[] {
  const out: NormSegment[] = [];

  for (const seg of rawSegments) {
    const startMin = hhmmToMinutes(seg.start);
    const endMin = hhmmToMinutes(seg.end);

    const dayStart = seg.dayIndex * MINUTES_PER_DAY;
    const absStart = dayStart + startMin;
    const absEndSameDay = dayStart + endMin;

    if (endMin > startMin) {
      out.push({
        id: seg.id,
        kind: seg.kind,
        dayIndex: seg.dayIndex,
        startAbs: clamp(absStart, 0, WEEK_MINUTES),
        endAbs: clamp(absEndSameDay, 0, WEEK_MINUTES),
      });
    } else if (endMin < startMin) {
      // Crosses midnight: split in two segments
      out.push({
        id: seg.id + '_a',
        kind: seg.kind,
        dayIndex: seg.dayIndex,
        startAbs: clamp(absStart, 0, WEEK_MINUTES),
        endAbs: clamp(dayStart + MINUTES_PER_DAY, 0, WEEK_MINUTES),
      });

      const nextDayStart = (seg.dayIndex + 1) * MINUTES_PER_DAY;
      out.push({
        id: seg.id + '_b',
        kind: seg.kind,
        dayIndex: (seg.dayIndex + 1) % 7,
        startAbs: clamp(nextDayStart, 0, WEEK_MINUTES),
        endAbs: clamp(nextDayStart + endMin, 0, WEEK_MINUTES),
      });
    } else {
      // equal start/end => ignore (0 minute)
    }
  }

  return out
    .filter((s) => s.endAbs > s.startAbs)
    .sort((a, b) => a.startAbs - b.startAbs);
}

function mergeSegments(segments: NormSegment[]): NormSegment[] {
  if (!segments.length) return [];

  const sorted = [...segments].sort((a, b) => a.startAbs - b.startAbs);
  const merged: NormSegment[] = [];

  for (const current of sorted) {
    const prev = merged[merged.length - 1];
    if (!prev) {
      merged.push({ ...current });
      continue;
    }

    if (prev.kind === current.kind && current.startAbs <= prev.endAbs) {
      prev.endAbs = Math.max(prev.endAbs, current.endAbs);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function buildBiologicalWindows(): Array<[number, number]> {
  const windows: Array<[number, number]> = [];
  // Biological night window (proxy): 23:00 -> 07:00 every day
  for (let day = 0; day < 7; day++) {
    const dayStart = day * MINUTES_PER_DAY;
    windows.push([dayStart + 23 * 60, Math.min(WEEK_MINUTES, dayStart + MINUTES_PER_DAY)]);
    if (day < 6) {
      windows.push([(day + 1) * MINUTES_PER_DAY, (day + 1) * MINUTES_PER_DAY + 7 * 60]);
    } else {
      // Sunday -> Monday overflow clipped in current week
      windows.push([WEEK_MINUTES, WEEK_MINUTES]); // no-op
    }
  }
  return windows.filter(([s, e]) => e > s);
}

function buildSocialWindows(): Array<[number, number]> {
  const windows: Array<[number, number]> = [];
  // Proxy social time: weekdays 18:00-23:00, weekends 10:00-23:00
  for (let day = 0; day < 7; day++) {
    const dayStart = day * MINUTES_PER_DAY;
    const isWeekend = day >= 5;
    if (isWeekend) {
      windows.push([dayStart + 10 * 60, dayStart + 23 * 60]);
    } else {
      windows.push([dayStart + 18 * 60, dayStart + 23 * 60]);
    }
  }
  return windows;
}

function totalOverlapWithWindows(segments: NormSegment[], windows: Array<[number, number]>): number {
  let total = 0;
  for (const seg of segments) {
    for (const [wStart, wEnd] of windows) {
      total += overlapMinutes(seg.startAbs, seg.endAbs, wStart, wEnd);
    }
  }
  return total;
}

function computeDailySleep(mergedSleep: NormSegment[]): number[] {
  const daily = Array.from({ length: 7 }, () => 0);

  for (const seg of mergedSleep) {
    let cursor = seg.startAbs;
    while (cursor < seg.endAbs) {
      const dayIndex = Math.floor(cursor / MINUTES_PER_DAY);
      if (dayIndex < 0 || dayIndex > 6) break;
      const dayEnd = (dayIndex + 1) * MINUTES_PER_DAY;
      const chunk = Math.min(seg.endAbs, dayEnd) - cursor;
      daily[dayIndex] += chunk;
      cursor += chunk;
    }
  }

  return daily;
}

function computeSleepRegularityProxy(mergedSleep: NormSegment[]): number {
  // Proxy regularity: based on sleep onset / duration variability per day.
  // TODO: remplacer par SRI exact/validé si nécessaire dans protocole.
  const daySleep: { onset: number; duration: number }[] = [];

  for (let day = 0; day < 7; day++) {
    const dayStart = day * MINUTES_PER_DAY;
    const dayEnd = dayStart + MINUTES_PER_DAY;
    const segments = mergedSleep
      .filter((s) => s.startAbs < dayEnd && s.endAbs > dayStart)
      .map((s) => ({
        start: Math.max(s.startAbs, dayStart) - dayStart,
        end: Math.min(s.endAbs, dayEnd) - dayStart,
      }))
      .sort((a, b) => a.start - b.start);

    if (!segments.length) continue;

    const onset = segments[0].start;
    const duration = segments.reduce((acc, s) => acc + (s.end - s.start), 0);
    daySleep.push({ onset, duration });
  }

  if (daySleep.length < 2) return 0;

  const meanOnset = daySleep.reduce((a, b) => a + b.onset, 0) / daySleep.length;
  const meanDuration = daySleep.reduce((a, b) => a + b.duration, 0) / daySleep.length;

  const onsetStd = Math.sqrt(
    daySleep.reduce((acc, x) => acc + (x.onset - meanOnset) ** 2, 0) / daySleep.length
  );
  const durationStd = Math.sqrt(
    daySleep.reduce((acc, x) => acc + (x.duration - meanDuration) ** 2, 0) / daySleep.length
  );

  // Normalize with pragmatic caps (proxy)
  const onsetPenalty = clamp(onsetStd / 180, 0, 1); // 3h std => max penalty
  const durationPenalty = clamp(durationStd / 120, 0, 1); // 2h std => max penalty

  return Math.round((1 - 0.6 * onsetPenalty - 0.4 * durationPenalty) * 100);
}

function scoreBucketWorkbookBand(
  value: number,
  opts: {
    lowWhenLessThan?: number;
    highWhenGreaterThan?: number;
    lowWhenGreaterThan?: number;
    highWhenLessThan?: number;
  },
): number {
  if (opts.highWhenGreaterThan != null && value > opts.highWhenGreaterThan) return 2;
  if (opts.highWhenLessThan != null && value < opts.highWhenLessThan) return 2;
  if (opts.lowWhenLessThan != null && value < opts.lowWhenLessThan) return 0;
  if (opts.lowWhenGreaterThan != null && value > opts.lowWhenGreaterThan) return 0;
  return 1;
}

function clampScore100(n: number) {
  return Math.round(clamp(n, 0, 100));
}

function evidenceLink(refId: string, locator?: string, note?: string, quote?: string): EvidenceLink {
  return { refId, locator, note, quote };
}

function computeDerivedMetrics(draft: AnalysisDraft): DerivedMetrics {
  const normalized = normalizeSegments(draft.segments);
  const work = mergeSegments(normalized.filter((s) => s.kind === 'work'));
  const sleep = mergeSegments(normalized.filter((s) => s.kind === 'sleep'));

  const totalWorkMinutes = work.reduce((acc, s) => acc + (s.endAbs - s.startAbs), 0);
  const totalSleepMinutes = sleep.reduce((acc, s) => acc + (s.endAbs - s.startAbs), 0);

  const longShiftCount = work.filter((s) => s.endAbs - s.startAbs >= 10 * 60).length;

  let count24hBreaks = 0;
  let longestRecovery = 0;
  let shortBreaksCount = 0;
  if (work.length === 0) {
    count24hBreaks = Math.floor(WEEK_MINUTES / (24 * 60));
    longestRecovery = WEEK_MINUTES;
  } else {
    const edgeStartGap = Math.max(0, work[0].startAbs);
    const edgeEndGap = Math.max(0, WEEK_MINUTES - work[work.length - 1].endAbs);
    count24hBreaks += Math.floor(edgeStartGap / (24 * 60));
    count24hBreaks += Math.floor(edgeEndGap / (24 * 60));
    longestRecovery = Math.max(longestRecovery, edgeStartGap, edgeEndGap);

    for (let i = 0; i < work.length - 1; i++) {
      const gapMin = Math.max(0, work[i + 1].startAbs - work[i].endAbs);
      longestRecovery = Math.max(longestRecovery, gapMin);
      count24hBreaks += Math.floor(gapMin / (24 * 60));
      if (gapMin < 11 * 60) shortBreaksCount += 1; // proxy threshold
    }
  }

  const dailyWork = computeDailySleep(work);
  const restDaysCount = dailyWork.filter((m) => m === 0).length;
  const dailySleep = computeDailySleep(sleep);
  const fullyRestedDaysCount = dailySleep.filter((m) => m >= 7 * 60).length;

  const biologicalWindows = buildBiologicalWindows();
  const socialWindows = buildSocialWindows();

  const biologicalWorkMinutes = totalOverlapWithWindows(work, biologicalWindows);
  const socialWorkMinutes = totalOverlapWithWindows(work, socialWindows);

  // Count shifts overlapping biological window at least once
  const nightShiftCount = work.filter((s) =>
    biologicalWindows.some(([wStart, wEnd]) => overlapMinutes(s.startAbs, s.endAbs, wStart, wEnd) > 0)
  ).length;

  const avgSleepHours = totalSleepMinutes / 60 / 7;
  const sleepRegularityProxy = computeSleepRegularityProxy(sleep);

  return {
    totalWorkHours: round1(totalWorkMinutes / 60),
    longShiftCount,
    count24hBreaks,
    longestRecoveryHours: round1(longestRecovery / 60),
    shortBreaksCount,
    restDaysCount,
    fullyRestedDaysCount,
    nightShiftCount,
    biologicalHoursLost: round1(biologicalWorkMinutes / 60), // proxy: work encroachment on biological sleep window
    socialHoursLost: round1(socialWorkMinutes / 60), // proxy: work encroachment on social time
    avgSleepHours: round1(avgSleepHours),
    totalSleepHours: round1(totalSleepMinutes / 60),
    sleepRegularityProxy,
  };
}

function scoreSLIProxy(derived: DerivedMetrics) {
  const items = {
    workedHours: scoreBucketWorkbookBand(derived.totalWorkHours, {
      lowWhenLessThan: 40,
      highWhenGreaterThan: 48,
    }),
    longShifts: scoreBucketWorkbookBand(derived.longShiftCount, {
      lowWhenLessThan: 2,
      highWhenGreaterThan: 2,
    }),
    count24hBreaks: scoreBucketWorkbookBand(derived.count24hBreaks, {
      lowWhenGreaterThan: 1,
      highWhenLessThan: 1,
    }),
    shortBreaks: scoreBucketWorkbookBand(derived.shortBreaksCount, {
      lowWhenLessThan: 1,
      highWhenGreaterThan: 1,
    }),
    restDays: scoreBucketWorkbookBand(derived.restDaysCount, {
      lowWhenGreaterThan: 1,
      highWhenLessThan: 1,
    }),
    nightShifts: scoreBucketWorkbookBand(derived.nightShiftCount, {
      lowWhenLessThan: 1,
      highWhenGreaterThan: 2,
    }),
    biologicalHoursLost: scoreBucketWorkbookBand(derived.biologicalHoursLost, {
      lowWhenLessThan: 8,
      highWhenGreaterThan: 8,
    }),
    socialHoursLost: scoreBucketWorkbookBand(derived.socialHoursLost, {
      lowWhenLessThan: 6,
      highWhenGreaterThan: 13,
    }),
  };

  const sliRaw = Object.values(items).reduce((a, b) => a + b, 0); // 0..16
  const riskScore = clampScore100((sliRaw / 16) * 100);

  return { sliRaw, sliItemScores: items, riskScore };
}

function scoreSleepProxy(derived: DerivedMetrics): number {
  // duration target around 7.5h avg
  const durationDelta = Math.abs(derived.avgSleepHours - 7.5);
  const durationScore = clampScore100(100 - (durationDelta / 3) * 100); // 3h off => 0
  const regularityScore = clampScore100(derived.sleepRegularityProxy);

  return clampScore100(durationScore * 0.55 + regularityScore * 0.45);
}

function scoreAdaptabilityProxy(riskScore: number, sleepScore: number): number {
  // Proxy composite until residual-based model is calibrated from paper/protocol
  const inverseRisk = 100 - riskScore;
  return clampScore100(inverseRisk * 0.65 + sleepScore * 0.35);
}

function makeExplanations(derived: DerivedMetrics, sliItemScores: Record<string, number>) {
  const out: string[] = [];

  if (sliItemScores.nightShifts > 0) {
    out.push(`Night shifts detected (${derived.nightShiftCount})`);
  }
  if (sliItemScores.count24hBreaks > 0) {
    out.push(`Low 24h recovery count (${derived.count24hBreaks})`);
  }
  if (sliItemScores.shortBreaks > 0) {
    out.push(`Short recovery breaks between shifts (${derived.shortBreaksCount})`);
  }
  if (sliItemScores.restDays > 0) {
    out.push(`Low number of full rest days (${derived.restDaysCount})`);
  }
  if (sliItemScores.biologicalHoursLost > 0) {
    out.push(`Work overlaps biological sleep window (${derived.biologicalHoursLost}h)`);
  }
  if (derived.avgSleepHours < 7) {
    out.push(`Average sleep duration is below 7h (${derived.avgSleepHours}h)`);
  }
  if (derived.sleepRegularityProxy < 60) {
    out.push(`Sleep regularity is low (${derived.sleepRegularityProxy}/100)`);
  }
  if (!out.length) {
    out.push('No major penalty detected in this proxy scoring version');
  }

  return out;
}

function buildTrace(args: {
  derived: DerivedMetrics;
  sliRaw: number;
  sliItemScores: Record<string, number>;
  riskScore: number;
  sleepScore: number;
  adaptabilityScore: number;
}): ScoreTrace {
  const { derived, sliRaw, sliItemScores, riskScore, sleepScore, adaptabilityScore } = args;
  const durationDelta = Math.abs(derived.avgSleepHours - 7.5);
  const durationScore = clampScore100(100 - (durationDelta / 3) * 100);
  const regularityScore = clampScore100(derived.sleepRegularityProxy);
  const inverseRisk = 100 - riskScore;
  const traceEvidenceIds = [
    EVIDENCE_IDS.coreScoring,
    EVIDENCE_IDS.formulaDoc,
    EVIDENCE_IDS.workbookMatrix,
    EVIDENCE_IDS.workbookParams,
    EVIDENCE_IDS.frontiersArticle,
    EVIDENCE_IDS.sleepSyncPdf,
    EVIDENCE_IDS.song2025Pdf,
  ] as const;

  return {
    scoringVersion: SCORING_VERSION,
    evidence: getEvidenceRefs(traceEvidenceIds),
    factors: [
      {
        key: 'workedHours',
        label: 'Weekly work hours',
        value: derived.totalWorkHours,
        bucket: sliItemScores.workedHours,
        contribution: round1((sliItemScores.workedHours / 16) * 100),
        formulaRef: 'SLI proxy workload bucket',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> totalWorkHours; scoreSLIProxy -> workedHours'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Factor thresholds currently implemented -> workedHours'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!J4:K6 (J6 score, K6 raw)'),
          evidenceLink(EVIDENCE_IDS.workbookParams, 'Parametres score!E6,E8', 'Workbook thresholds for weekly hours appear at 40h and 48h.'),
        ],
        dependsOn: ['derived.totalWorkHours'],
        status: 'implemented',
      },
      {
        key: 'longShifts',
        label: 'Long shifts',
        value: derived.longShiftCount,
        bucket: sliItemScores.longShifts,
        contribution: round1((sliItemScores.longShifts / 16) * 100),
        formulaRef: 'Workbook-aligned long-shift bucket',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> longShiftCount; scoreSLIProxy -> longShifts'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Factor thresholds currently implemented -> longShifts'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!L4:M6 (L6 score, M6 raw)'),
          evidenceLink(EVIDENCE_IDS.workbookParams, 'Parametres score!C9,E9', 'Workbook aligns long shifts with a 10h duration rule and 0 / 1 / 2+ scoring around count 2.'),
        ],
        dependsOn: ['derived.longShiftCount'],
        status: 'implemented',
      },
      {
        key: 'count24hBreaks',
        label: '24h breaks',
        value: derived.count24hBreaks,
        bucket: sliItemScores.count24hBreaks,
        contribution: round1((sliItemScores.count24hBreaks / 16) * 100),
        formulaRef: 'Workbook-aligned 24h-break bucket',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> count24hBreaks; scoreSLIProxy -> count24hBreaks'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Factor thresholds currently implemented -> count24hBreaks'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!N4:O6 (N6 score, O6 raw)'),
          evidenceLink(EVIDENCE_IDS.workbookParams, 'Graphiques brut!N6:O6', 'Current runtime interprets 24h pauses as the count of full 24h blocks between work segments inside the week.'),
        ],
        dependsOn: ['derived.count24hBreaks'],
        status: 'implemented',
      },
      {
        key: 'shortBreaks',
        label: 'Short breaks',
        value: derived.shortBreaksCount,
        bucket: sliItemScores.shortBreaks,
        contribution: round1((sliItemScores.shortBreaks / 16) * 100),
        formulaRef: 'SLI proxy short-break bucket',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> shortBreaksCount; scoreSLIProxy -> shortBreaks'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Factor thresholds currently implemented -> shortBreaks'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!P4:Q6 (P6 score, Q6 raw)'),
          evidenceLink(EVIDENCE_IDS.workbookParams, 'Parametres score!C24,E24', 'Workbook references a <11h quick-return rule.'),
        ],
        dependsOn: ['derived.shortBreaksCount'],
        status: 'implemented',
      },
      {
        key: 'restDays',
        label: 'Rest days',
        value: derived.restDaysCount,
        bucket: sliItemScores.restDays,
        contribution: round1((sliItemScores.restDays / 16) * 100),
        formulaRef: 'Workbook-aligned rest-day bucket',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> restDaysCount; scoreSLIProxy -> restDays'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Factor thresholds currently implemented -> restDays'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!R4:S6 (R6 score, S6 raw)'),
        ],
        dependsOn: ['derived.restDaysCount'],
        status: 'implemented',
      },
      {
        key: 'nightShifts',
        label: 'Night shifts',
        value: derived.nightShiftCount,
        bucket: sliItemScores.nightShifts,
        contribution: round1((sliItemScores.nightShifts / 16) * 100),
        formulaRef: 'SLI proxy night-shift bucket',
        evidenceRefs: [
          EVIDENCE_IDS.coreScoring,
          EVIDENCE_IDS.formulaDoc,
          EVIDENCE_IDS.workbookMatrix,
          EVIDENCE_IDS.frontiersArticle,
        ],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> nightShiftCount; scoreSLIProxy -> nightShifts'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Factor thresholds currently implemented -> nightShifts'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!T4:U6 (T6 score, U6 raw)'),
          evidenceLink(EVIDENCE_IDS.frontiersArticle, undefined, 'Used as public scientific framing for night-work burden, not yet as a page-specific formula citation.'),
        ],
        dependsOn: ['derived.nightShiftCount'],
        status: 'implemented',
      },
      {
        key: 'biologicalHoursLost',
        label: 'Biological hours lost',
        value: derived.biologicalHoursLost,
        bucket: sliItemScores.biologicalHoursLost,
        contribution: round1((sliItemScores.biologicalHoursLost / 16) * 100),
        formulaRef: 'Workbook-aligned threshold on biological-hours proxy (proxy for optimal sleep hours lost)',
        evidenceRefs: [
          EVIDENCE_IDS.coreScoring,
          EVIDENCE_IDS.formulaDoc,
          EVIDENCE_IDS.workbookMatrix,
          EVIDENCE_IDS.frontiersArticle,
          EVIDENCE_IDS.sleepSyncPdf,
        ],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> biologicalHoursLost; scoreSLIProxy -> biologicalHoursLost'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Biological Window Proxy; Risk Score -> biologicalHoursLost'),
          evidenceLink(
            EVIDENCE_IDS.workbookMatrix,
            'Graphiques brut!V4:W6 (V6 score, W6 raw)',
            'Workbook wording is optimal sleep hours lost; runtime currently approximates it with work overlap in a fixed biological window.',
          ),
          evidenceLink(EVIDENCE_IDS.frontiersArticle, undefined, 'Public context only; not yet mapped to an exact page for factor 7.'),
          evidenceLink(EVIDENCE_IDS.sleepSyncPdf, 'SleepSync-1.txt extracted text header', 'Supporting sleep opportunity context; page mapping pending.'),
        ],
        dependsOn: ['derived.biologicalHoursLost'],
        status: 'proxy',
      },
      {
        key: 'socialHoursLost',
        label: 'Social hours lost',
        value: derived.socialHoursLost,
        bucket: sliItemScores.socialHoursLost,
        contribution: round1((sliItemScores.socialHoursLost / 16) * 100),
        formulaRef: 'Workbook-aligned threshold on social-hours proxy (metric semantics still proxy)',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeDerivedMetrics -> socialHoursLost; scoreSLIProxy -> socialHoursLost'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Social Window Proxy; Risk Score -> socialHoursLost'),
          evidenceLink(
            EVIDENCE_IDS.workbookMatrix,
            'Graphiques brut!X4:Y6 (X6 score, Y6 raw)',
            'Workbook thresholds are reused, but the runtime metric still approximates social time with fixed windows.',
          ),
        ],
        dependsOn: ['derived.socialHoursLost'],
        status: 'proxy',
      },
      {
        key: 'sleepDuration',
        label: 'Average sleep duration',
        value: derived.avgSleepHours,
        contribution: durationScore,
        formulaRef: 'Sleep proxy duration component',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.sleepSyncPdf, EVIDENCE_IDS.song2025Pdf],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'scoreSleepProxy -> durationScore'),
          evidenceLink(EVIDENCE_IDS.sleepSyncPdf, 'SleepSync-1.txt extracted text header', 'Sleep-related supporting source; page mapping pending.'),
          evidenceLink(EVIDENCE_IDS.song2025Pdf, 'Song2025 extracted text header', 'Sleep intervention context only; not an exact runtime formula citation.'),
        ],
        dependsOn: ['derived.avgSleepHours'],
        status: 'proxy',
      },
      {
        key: 'sleepRegularityProxy',
        label: 'Sleep regularity proxy',
        value: derived.sleepRegularityProxy,
        contribution: regularityScore,
        formulaRef: 'Sleep proxy regularity component',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.sleepSyncPdf],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'computeSleepRegularityProxy + scoreSleepProxy -> regularityScore'),
          evidenceLink(EVIDENCE_IDS.sleepSyncPdf, 'SleepSync-1.txt extracted text header', 'Supporting sleep regularity context; exact SRI mapping still pending.'),
        ],
        dependsOn: ['derived.sleepRegularityProxy'],
        status: 'proxy',
      },
    ],
    scores: [
      {
        key: 'riskScore',
        label: 'Risk score',
        value: riskScore,
        formulaRef: `sliRaw=${sliRaw}; riskScore=(sliRaw/16)*100`,
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.workbookMatrix],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'scoreSLIProxy -> sliRaw + riskScore'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Risk Score -> Risk aggregation'),
          evidenceLink(EVIDENCE_IDS.workbookMatrix, 'Graphiques brut!J6:X6', 'Workbook exposes item buckets; runtime normalizes sum to 0..100.'),
        ],
        dependsOn: [
          'workedHours',
          'longShifts',
          'count24hBreaks',
          'shortBreaks',
          'restDays',
          'nightShifts',
          'biologicalHoursLost',
          'socialHoursLost',
        ],
        status: 'proxy',
      },
      {
        key: 'sleepScore',
        label: 'Sleep score',
        value: sleepScore,
        formulaRef: 'durationScore*0.55 + regularityScore*0.45',
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc, EVIDENCE_IDS.sleepSyncPdf],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'scoreSleepProxy'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Sleep Score'),
          evidenceLink(EVIDENCE_IDS.sleepSyncPdf, 'SleepSync-1.txt extracted text header', 'Supporting sleep context only; exact formula comes from runtime code.'),
        ],
        dependsOn: ['sleepDuration', 'sleepRegularityProxy'],
        status: 'proxy',
      },
      {
        key: 'adaptabilityScore',
        label: 'Adaptability score',
        value: adaptabilityScore,
        formulaRef: `inverseRisk=${inverseRisk}; inverseRisk*0.65 + sleepScore*0.35`,
        evidenceRefs: [EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc],
        evidenceLinks: [
          evidenceLink(EVIDENCE_IDS.coreScoring, 'scoreAdaptabilityProxy'),
          evidenceLink(EVIDENCE_IDS.formulaDoc, 'Adaptability Score'),
        ],
        dependsOn: ['riskScore', 'sleepScore'],
        status: 'proxy',
      },
    ],
  };
}

export function calculateScores(draft: AnalysisDraft): ScoreBundle {
  const derived = computeDerivedMetrics(draft);
  const sli = scoreSLIProxy(derived);
  const sleepScore = scoreSleepProxy(derived);
  const adaptabilityScore = scoreAdaptabilityProxy(sli.riskScore, sleepScore);
  const trace = buildTrace({
    derived,
    sliRaw: sli.sliRaw,
    sliItemScores: sli.sliItemScores,
    riskScore: sli.riskScore,
    sleepScore,
    adaptabilityScore,
  });

  const delta =
    REFERENCE_MEANS.riskScore == null &&
    REFERENCE_MEANS.sleepScore == null &&
    REFERENCE_MEANS.adaptabilityScore == null
      ? undefined
      : {
          riskScore:
            REFERENCE_MEANS.riskScore != null ? round1(sli.riskScore - REFERENCE_MEANS.riskScore) : undefined,
          sleepScore:
            REFERENCE_MEANS.sleepScore != null ? round1(sleepScore - REFERENCE_MEANS.sleepScore) : undefined,
          adaptabilityScore:
            REFERENCE_MEANS.adaptabilityScore != null
              ? round1(adaptabilityScore - REFERENCE_MEANS.adaptabilityScore)
              : undefined,
        };

  return {
    riskScore: sli.riskScore,
    sleepScore,
    adaptabilityScore,
    sliRaw: sli.sliRaw,
    sliItemScores: sli.sliItemScores,
    derived,
    explanations: makeExplanations(derived, sli.sliItemScores),
    scoringVersion: SCORING_VERSION,
    trace,
    referenceDelta: delta,
  };
}
