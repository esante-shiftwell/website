export type Kind = 'work' | 'sleep';

export type DayPartSegment = {
  id: string;
  day: number; // 0..6
  startMin: number; // 0..1440
  endMin: number; // 0..1440
};

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function snap(min: number, step = 15) {
  return clamp(Math.round(min / step) * step, 0, 1440);
}

export function minutesToTime(min: number): string {
  // attention: 1440 doit afficher 24:00 dans certaines vues
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `seg_${Math.random().toString(36).slice(2, 10)}`;
}

export function durationMinutes(s: DayPartSegment) {
  return Math.max(0, s.endMin - s.startMin);
}

export function overlaps(a: DayPartSegment, b: DayPartSegment) {
  if (a.day !== b.day) return false;
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/**
 * Build segments from a user selection.
 * If end < start => split across midnight:
 * - day D: [start, 1440]
 * - day D+1: [0, end]
 */
export function buildSegmentsFromSelection(
  day: number,
  startMin: number,
  endMin: number,
): Array<Omit<DayPartSegment, 'id'>> {
  if (endMin === startMin) return [];

  if (endMin > startMin) {
    return [{ day, startMin, endMin }];
  }

  const nextDay = (day + 1) % 7;
  return [
    { day, startMin, endMin: 1440 },
    { day: nextDay, startMin: 0, endMin },
  ];
}

export function totalHoursForDay(segs: DayPartSegment[], day: number) {
  const mins = segs.filter((s) => s.day === day).reduce((acc, s) => acc + durationMinutes(s), 0);
  return Math.round((mins / 60) * 10) / 10;
}

export function countForDay(segs: DayPartSegment[], day: number) {
  return segs.filter((s) => s.day === day).length;
}

export function sortDaySegments(segs: DayPartSegment[], day: number) {
  return segs
    .filter((s) => s.day === day)
    .slice()
    .sort((a, b) => a.startMin - b.startMin);
}

/* ========================= NEW: week-range selection ========================= */

export function dayMinToAbs(day: number, min: number) {
  return clamp(day, 0, 6) * 1440 + clamp(min, 0, 1440);
}

export function absToDayMin(abs: number) {
  const a = clamp(abs, 0, 7 * 1440);
  const day = clamp(Math.floor(a / 1440), 0, 6);
  const min = a - day * 1440;
  return { day, min };
}

/**
 * Build day-part segments from an absolute range within the week.
 * Handles cross-day ranges naturally.
 *
 * We also cap the max span to avoid accidental “giant” ranges (MVP guard).
 */
export function buildSegmentsFromWeekAbsRange(
  startAbs: number,
  endAbs: number,
  maxSpanMin = 24 * 60,
): Array<Omit<DayPartSegment, 'id'>> {
  let a = startAbs;
  let b = endAbs;

  if (a === b) return [];
  if (b < a) [a, b] = [b, a];

  // guard
  if (b - a > maxSpanMin) b = a + maxSpanMin;

  const parts: Array<Omit<DayPartSegment, 'id'>> = [];

  while (a < b) {
    const { day } = absToDayMin(a);
    const dayStartAbs = day * 1440;
    const dayEndAbs = dayStartAbs + 1440;

    const segStart = a - dayStartAbs;
    const segEndAbs = Math.min(b, dayEndAbs);
    const segEnd = segEndAbs - dayStartAbs;

    if (segEnd > segStart) {
      parts.push({ day, startMin: segStart, endMin: segEnd });
    }

    a = segEndAbs;
  }

  return parts;
}