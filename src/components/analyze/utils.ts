import type {
  DerivedMetrics,
  Locale,
  ParticipantProfile,
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
  if (duration <= 0) return { ok: false, message: 'DurÃ©e invalide.' };

  const minDuration = 15;
  const maxDuration = kind === 'work' ? 16 * 60 : 16 * 60;

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
          avgSleepHours: 'Sommeil moyen (h)',
          sleepRegularityProxy: 'RÃ©gularitÃ© sommeil (proxy)',
          nightShiftCount: 'Nb shifts de nuit',
          longShiftCount: 'Nb shifts longs (â‰¥10h)',
          longestRecoveryHours: 'RÃ©cupÃ©ration la plus longue',
          shortBreaksCount: 'Nb pauses <11h',
          fullyRestedDaysCount: 'Nb jours repos/sommeil',
          biologicalHoursLost: 'Heures biologiques perdues',
          socialHoursLost: 'Heures sociales perdues',
        }
      : locale === 'de'
        ? {
            totalWorkHours: 'Arbeitsstunden (Woche)',
            totalSleepHours: 'Schlafstunden (Woche)',
            avgSleepHours: 'Ø Schlaf (h)',
            sleepRegularityProxy: 'SchlafregelmÃ¤ÃŸigkeit (Proxy)',
            nightShiftCount: 'Nachtschichten',
            longShiftCount: 'Lange Schichten (â‰¥10h)',
            longestRecoveryHours: 'LÃ¤ngste Erholung',
            shortBreaksCount: 'Pausen <11h',
            fullyRestedDaysCount: 'Ruhetage',
            biologicalHoursLost: 'Biologische Stunden verloren',
            socialHoursLost: 'Soziale Stunden verloren',
          }
        : {
            totalWorkHours: 'Work hours (weekly total)',
            totalSleepHours: 'Sleep hours (weekly total)',
            avgSleepHours: 'Average sleep (h)',
            sleepRegularityProxy: 'Sleep regularity (proxy)',
            nightShiftCount: 'Night shifts',
            longShiftCount: 'Long shifts (â‰¥10h)',
            longestRecoveryHours: 'Longest recovery',
            shortBreaksCount: 'Breaks <11h',
            fullyRestedDaysCount: 'Rested days',
            biologicalHoursLost: 'Biological hours lost',
            socialHoursLost: 'Social hours lost',
          };

  return [
    { label: labels.totalWorkHours, value: `${metrics.totalWorkHours} h` },
    { label: labels.totalSleepHours, value: `${metrics.totalSleepHours} h` },
    { label: labels.avgSleepHours, value: `${metrics.avgSleepHours} h` },
    { label: labels.sleepRegularityProxy, value: `${metrics.sleepRegularityProxy}/100` },
    { label: labels.nightShiftCount, value: String(metrics.nightShiftCount) },
    { label: labels.longShiftCount, value: String(metrics.longShiftCount) },
    { label: labels.longestRecoveryHours, value: `${metrics.longestRecoveryHours} h` },
    { label: labels.shortBreaksCount, value: String(metrics.shortBreaksCount) },
    { label: labels.fullyRestedDaysCount, value: String(metrics.fullyRestedDaysCount) },
    { label: labels.biologicalHoursLost, value: `${metrics.biologicalHoursLost} h` },
    { label: labels.socialHoursLost, value: `${metrics.socialHoursLost} h` },
  ];
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
