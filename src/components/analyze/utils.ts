import type {
  DerivedMetrics,
  Locale,
  ParticipantProfile,
  Scores,
  SegmentDraft,
  SegmentKind,
  WeekSegment,
} from './types';

export const MINUTES_PER_DAY = 24 * 60;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `seg_${Math.random().toString(36).slice(2, 10)}`;
}

export function snapTo30(minute: number): number {
  return clamp(Math.round(minute / 30) * 30, 0, 1439);
}

export function minutesToTime(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function timeToMinutes(v: string): number {
  const [h, m] = v.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return clamp(h * 60 + m, 0, 1439);
}

export function normalizeDraftToSegment(draft: SegmentDraft): WeekSegment {
  let overnight = draft.overnight;
  if (draft.endMin <= draft.startMin) overnight = true;

  return {
    id: uid(),
    day: clamp(draft.day, 0, 6),
    startMin: clamp(draft.startMin, 0, 1439),
    endMin: clamp(draft.endMin, 0, 1439),
    overnight,
  };
}

export function segmentDurationMinutes(seg: WeekSegment): number {
  if (seg.overnight) {
    return MINUTES_PER_DAY - seg.startMin + seg.endMin;
  }
  return Math.max(seg.endMin - seg.startMin, 0);
}

export function validateSegment(
  seg: WeekSegment,
  kind: SegmentKind,
): { ok: true } | { ok: false; message: string } {
  const duration = segmentDurationMinutes(seg);
  if (duration <= 0) return { ok: false, message: 'Durée invalide.' };

  const minDuration = 15;
  const maxDuration = kind === 'work' ? 16 * 60 : 16 * 60; // même limite volontaire (à ajuster si besoin)

  if (duration < minDuration) {
    return { ok: false, message: `Segment trop court (< ${minDuration} min).` };
  }
  if (duration > maxDuration) {
    return { ok: false, message: `Segment trop long (> ${maxDuration / 60} h).` };
  }

  return { ok: true };
}

export function splitSegmentForCalendar(seg: WeekSegment): {
  id: string;
  day: number;
  startMin: number;
  endMin: number;
}[] {
  if (!seg.overnight) {
    return [{ id: seg.id, day: seg.day, startMin: seg.startMin, endMin: seg.endMin }];
  }
  const currentDay = seg.day;
  const nextDay = (seg.day + 1) % 7;
  return [
    { id: seg.id, day: currentDay, startMin: seg.startMin, endMin: 1440 },
    { id: seg.id, day: nextDay, startMin: 0, endMin: seg.endMin },
  ];
}

function segmentToAbsoluteIntervals(seg: WeekSegment): Array<{ start: number; end: number }> {
  const start = seg.day * MINUTES_PER_DAY + seg.startMin;
  const end = start + segmentDurationMinutes(seg);
  return [{ start, end }];
}

function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const s = Math.max(aStart, bStart);
  const e = Math.min(aEnd, bEnd);
  return Math.max(0, e - s);
}

function regularityFromStdDev(values: number[]): number {
  if (values.length <= 1) return 50;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  return clamp(100 - (std / 180) * 100, 0, 100);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeDerivedMetrics(
  workSegments: WeekSegment[],
  sleepSegments: WeekSegment[],
): DerivedMetrics {
  const totalWorkMin = workSegments.reduce((acc, s) => acc + segmentDurationMinutes(s), 0);
  const totalSleepMin = sleepSegments.reduce((acc, s) => acc + segmentDurationMinutes(s), 0);

  const longShiftCount = workSegments.filter((s) => segmentDurationMinutes(s) >= 10 * 60).length;
  const weekendWorkMin = workSegments
    .filter((s) => s.day === 5 || s.day === 6)
    .reduce((acc, s) => acc + segmentDurationMinutes(s), 0);

  const nightWorkMin = workSegments.reduce((acc, seg) => {
    const pieces = splitSegmentForCalendar(seg);
    let sum = 0;
    for (const p of pieces) {
      sum += overlapMinutes(p.startMin, p.endMin, 23 * 60, 24 * 60);
      sum += overlapMinutes(p.startMin, p.endMin, 0, 7 * 60);
    }
    return acc + sum;
  }, 0);

  const sleepStarts = sleepSegments.map((seg) => {
    const start = seg.startMin;
    return start >= 12 * 60 ? start : start + 24 * 60;
  });

  const sleepRegularity = sleepStarts.length >= 2 ? regularityFromStdDev(sleepStarts) : 50;

  const workAbs = workSegments.flatMap(segmentToAbsoluteIntervals).sort((a, b) => a.start - b.start);

  let minRecovery = Number.POSITIVE_INFINITY;
  for (let i = 1; i < workAbs.length; i += 1) {
    const gap = workAbs[i].start - workAbs[i - 1].end;
    if (gap >= 0) minRecovery = Math.min(minRecovery, gap);
  }

  const minRecoveryHours = Number.isFinite(minRecovery) ? round1(minRecovery / 60) : 24;

  return {
    totalWorkHours: round1(totalWorkMin / 60),
    totalSleepHours: round1(totalSleepMin / 60),
    avgSleepHours: sleepSegments.length > 0 ? round1(totalSleepMin / 60 / sleepSegments.length) : 0,
    sleepRegularity: Math.round(sleepRegularity),
    nightWorkHours: round1(nightWorkMin / 60),
    longShiftCount,
    minRecoveryHours,
    weekendWorkHours: round1(weekendWorkMin / 60),
  };
}

export function computeScores(metrics: DerivedMetrics, profile: ParticipantProfile): Scores {
  const totalWorkPenalty = clamp((metrics.totalWorkHours - 35) * 1.2, 0, 25);
  const nightPenalty = clamp(metrics.nightWorkHours * 3.5, 0, 30);
  const longShiftPenalty = clamp(metrics.longShiftCount * 7, 0, 20);
  const recoveryPenalty = clamp((11 - metrics.minRecoveryHours) * 5, 0, 25);
  const weekendPenalty = clamp(metrics.weekendWorkHours * 0.7, 0, 10);

  let risk =
    10 +
    totalWorkPenalty +
    nightPenalty +
    longShiftPenalty +
    recoveryPenalty +
    weekendPenalty;

  if (profile.mode === 'long') {
    risk += (profile.fatigue - 3) * 3;
    risk += (3 - profile.schedulePredictability) * 2;
    risk += clamp(profile.commuteMinutes / 20, 0, 8);
  }

  risk = clamp(Math.round(risk), 0, 100);

  const avgSleepTarget = 7.5;
  const durationPenalty = clamp(Math.abs(metrics.avgSleepHours - avgSleepTarget) * 14, 0, 45);
  const regularityBonus = metrics.sleepRegularity * 0.45;
  const durationBase = clamp(55 - durationPenalty, 5, 55);

  let sleep = durationBase + regularityBonus;

  if (profile.mode === 'long') {
    sleep -= clamp((profile.caffeineCups - 2) * 2, 0, 10);
    sleep += clamp(profile.napsPerWeek * 1.2, 0, 8);
    if (profile.chronotype === 'evening' && metrics.nightWorkHours > 0) sleep += 2;
    if (profile.chronotype === 'morning' && metrics.nightWorkHours > 0) sleep -= 4;
  }

  sleep = clamp(Math.round(sleep), 0, 100);

  let adaptability = (100 - risk) * 0.55 + sleep * 0.45;

  if (profile.mode === 'long') {
    adaptability += clamp((profile.schedulePredictability - 3) * 4, -8, 8);
    adaptability -= clamp((profile.fatigue - 3) * 3, -6, 10);
  }

  adaptability = clamp(Math.round(adaptability), 0, 100);

  return { risk, sleep, adaptability };
}

export function getProfileCompletion(profile: ParticipantProfile): number {
  let score = 0;
  if (profile.profession.trim()) score += 45;
  if (profile.ageBand) score += 35;
  if (profile.sex) score += 10;
  if (profile.chronotype) score += 10;

  if (profile.mode === 'long') {
    score = Math.min(100, score + 10);
  }

  return clamp(score, 0, 100);
}

export function getSegmentsCompletion(segments: WeekSegment[]): number {
  if (segments.length === 0) return 0;
  if (segments.length === 1) return 55;
  if (segments.length === 2) return 70;
  if (segments.length === 3) return 82;
  return Math.min(100, 82 + (segments.length - 3) * 4);
}

export function getDerivedRows(metrics: DerivedMetrics, locale: Locale) {
  const labels =
    locale === 'fr'
      ? {
          totalWorkHours: 'Heures travail (total semaine)',
          totalSleepHours: 'Heures sommeil (total semaine)',
          avgSleepHours: 'Sommeil moyen par segment',
          sleepRegularity: 'Régularité sommeil (proxy)',
          nightWorkHours: 'Heures de travail de nuit',
          longShiftCount: 'Nb shifts longs (≥10h)',
          minRecoveryHours: 'Récup minimale entre shifts',
          weekendWorkHours: 'Heures travail weekend',
        }
      : locale === 'de'
        ? {
            totalWorkHours: 'Arbeitsstunden (Woche)',
            totalSleepHours: 'Schlafstunden (Woche)',
            avgSleepHours: 'Ø Schlaf pro Segment',
            sleepRegularity: 'Schlafregelmäßigkeit (Proxy)',
            nightWorkHours: 'Nachtarbeitsstunden',
            longShiftCount: 'Lange Schichten (≥10h)',
            minRecoveryHours: 'Min. Erholung zw. Schichten',
            weekendWorkHours: 'Wochenendarbeitsstunden',
          }
        : {
            totalWorkHours: 'Work hours (weekly total)',
            totalSleepHours: 'Sleep hours (weekly total)',
            avgSleepHours: 'Average sleep per segment',
            sleepRegularity: 'Sleep regularity (proxy)',
            nightWorkHours: 'Night work hours',
            longShiftCount: 'Long shifts (≥10h)',
            minRecoveryHours: 'Minimum recovery gap',
            weekendWorkHours: 'Weekend work hours',
          };

  return [
    { label: labels.totalWorkHours, value: `${metrics.totalWorkHours} h` },
    { label: labels.totalSleepHours, value: `${metrics.totalSleepHours} h` },
    { label: labels.avgSleepHours, value: `${metrics.avgSleepHours} h` },
    { label: labels.sleepRegularity, value: `${metrics.sleepRegularity}/100` },
    { label: labels.nightWorkHours, value: `${metrics.nightWorkHours} h` },
    { label: labels.longShiftCount, value: String(metrics.longShiftCount) },
    { label: labels.minRecoveryHours, value: `${metrics.minRecoveryHours} h` },
    { label: labels.weekendWorkHours, value: `${metrics.weekendWorkHours} h` },
  ];
}

export function getExplanations(metrics: DerivedMetrics, scores: Scores, locale: Locale): string[] {
  const fr: string[] = [];
  const en: string[] = [];
  const de: string[] = [];

  if (scores.risk >= 70) {
    fr.push(
      "Le score de risque est élevé (travail de nuit, shifts longs ou récupérations courtes).",
    );
    en.push('Risk score is high (night work, long shifts or short recovery gaps).');
    de.push('Der Risikoscore ist hoch (Nachtarbeit, lange Schichten oder kurze Erholung).');
  } else if (scores.risk <= 35) {
    fr.push('Le score de risque est plutôt bas sur la semaine saisie.');
    en.push('Risk score is relatively low for the entered week.');
    de.push('Der Risikoscore ist für die eingegebene Woche eher niedrig.');
  }

  if (metrics.avgSleepHours < 6.5) {
    fr.push('La durée moyenne de sommeil est basse (proxy), ce qui dégrade le score sommeil.');
    en.push('Average sleep duration is low (proxy), which lowers the sleep score.');
    de.push('Die durchschnittliche Schlafdauer ist niedrig (Proxy), was den Schlafscore senkt.');
  } else if (metrics.avgSleepHours >= 7 && metrics.sleepRegularity >= 65) {
    fr.push('Sommeil globalement correct en durée + régularité (proxy).');
    en.push('Sleep looks relatively good in duration + regularity (proxy).');
    de.push('Schlaf wirkt insgesamt solide in Dauer + Regelmäßigkeit (Proxy).');
  }

  if (metrics.nightWorkHours > 0) {
    fr.push(
      `Le travail de nuit détecté (${metrics.nightWorkHours}h) pèse sur le score de risque.`,
    );
    en.push(`Detected night work (${metrics.nightWorkHours}h) weighs on the risk score.`);
    de.push(`Erkannte Nachtarbeit (${metrics.nightWorkHours}h) belastet den Risikoscore.`);
  }

  if (metrics.minRecoveryHours < 11) {
    fr.push(`Récupération minimale courte (${metrics.minRecoveryHours}h) entre deux shifts.`);
    en.push(`Short minimum recovery gap (${metrics.minRecoveryHours}h) between shifts.`);
    de.push(`Kurze minimale Erholungszeit (${metrics.minRecoveryHours}h) zwischen Schichten.`);
  }

  if (scores.adaptability >= 70) {
    fr.push("Le score d’adaptabilité est bon sur cette semaine (proxy v0.1).");
    en.push('Adaptability score is good for this week (proxy v0.1).');
    de.push('Der Anpassungsscore ist für diese Woche gut (Proxy v0.1).');
  } else if (scores.adaptability < 40) {
    fr.push("Le score d’adaptabilité est faible sur cette semaine (proxy v0.1).");
    en.push('Adaptability score is low for this week (proxy v0.1).');
    de.push('Der Anpassungsscore ist für diese Woche niedrig (Proxy v0.1).');
  }

  const fallback = {
    fr: 'Remplis davantage de segments pour enrichir la lecture du score.',
    en: 'Add more segments to improve score interpretation.',
    de: 'Füge mehr Segmente hinzu, um die Score-Interpretation zu verbessern.',
  } as const;

  const msgs = locale === 'fr' ? fr : locale === 'de' ? de : en;
  return msgs.length ? msgs : [fallback[locale]];
}

export function getOrCreateAnonymousId(): string {
  const key = 'shiftwell:anonymousId';
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const next = `anon_${uid().slice(0, 8)}`;
    localStorage.setItem(key, next);
    return next;
  } catch {
    return `anon_${uid().slice(0, 8)}`;
  }
}