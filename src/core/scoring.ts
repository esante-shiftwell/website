import type { AnalysisDraft, DerivedMetrics, RawSegment, ScoreBundle } from './model';

const MINUTES_PER_DAY = 1440;
const WEEK_MINUTES = 7 * MINUTES_PER_DAY;

export const SCORING_VERSION = 'shiftwell-proxy-v0.1';
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

function scoreBucketHigherIsWorse(value: number, warnThreshold: number, dangerThreshold: number): number {
  if (value >= dangerThreshold) return 2;
  if (value >= warnThreshold) return 1;
  return 0;
}

function scoreBucketLowerIsWorse(value: number, warnThreshold: number, dangerThreshold: number): number {
  // Example: longest recovery / fully rested days
  if (value <= dangerThreshold) return 2;
  if (value <= warnThreshold) return 1;
  return 0;
}

function clampScore100(n: number) {
  return Math.round(clamp(n, 0, 100));
}

function computeDerivedMetrics(draft: AnalysisDraft): DerivedMetrics {
  const normalized = normalizeSegments(draft.segments);
  const work = mergeSegments(normalized.filter((s) => s.kind === 'work'));
  const sleep = mergeSegments(normalized.filter((s) => s.kind === 'sleep'));

  const totalWorkMinutes = work.reduce((acc, s) => acc + (s.endAbs - s.startAbs), 0);
  const totalSleepMinutes = sleep.reduce((acc, s) => acc + (s.endAbs - s.startAbs), 0);

  const longShiftCount = work.filter((s) => s.endAbs - s.startAbs >= 10 * 60).length;

  let longestRecovery = 0;
  let shortBreaksCount = 0;
  if (work.length > 1) {
    for (let i = 0; i < work.length - 1; i++) {
      const gapMin = Math.max(0, work[i + 1].startAbs - work[i].endAbs);
      longestRecovery = Math.max(longestRecovery, gapMin);
      if (gapMin < 11 * 60) shortBreaksCount += 1; // proxy threshold
    }
  }

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
    longestRecoveryHours: round1(longestRecovery / 60),
    shortBreaksCount,
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
  // TODO: aligner strictement les seuils avec le tableau de l'article + protocole.
  const items = {
    workedHours: scoreBucketHigherIsWorse(derived.totalWorkHours, 40, 48),
    longShifts: scoreBucketHigherIsWorse(derived.longShiftCount, 1, 3),
    longestRecovery: scoreBucketLowerIsWorse(derived.longestRecoveryHours, 48, 36),
    shortBreaks: scoreBucketHigherIsWorse(derived.shortBreaksCount, 1, 3),
    fullyRestedDays: scoreBucketLowerIsWorse(derived.fullyRestedDaysCount, 3, 1),
    nightShifts: scoreBucketHigherIsWorse(derived.nightShiftCount, 1, 3),
    biologicalHoursLost: scoreBucketHigherIsWorse(derived.biologicalHoursLost, 4, 8),
    socialHoursLost: scoreBucketHigherIsWorse(derived.socialHoursLost, 8, 13),
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
  if (sliItemScores.shortBreaks > 0) {
    out.push(`Short recovery breaks between shifts (${derived.shortBreaksCount})`);
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

export function calculateScores(draft: AnalysisDraft): ScoreBundle {
  const derived = computeDerivedMetrics(draft);
  const sli = scoreSLIProxy(derived);
  const sleepScore = scoreSleepProxy(derived);
  const adaptabilityScore = scoreAdaptabilityProxy(sli.riskScore, sleepScore);

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
    referenceDelta: delta,
  };
}