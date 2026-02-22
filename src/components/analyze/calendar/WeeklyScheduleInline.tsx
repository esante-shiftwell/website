'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DayPartSegment, Kind } from './scheduleUtils';
import { clamp, minutesToTime, overlaps, snap } from './scheduleUtils';
import type { ScheduleUi } from '../CombinedScheduleStep';

type Block = {
  kind: Kind;
  day: number;
  startMin: number;
  endMin: number;
  id: string;
};

const HOUR_HEIGHT = 34;

// ✅ caps
const MAX_SPAN_WORK_MIN = 48 * 60; // 48h
const MAX_SPAN_SLEEP_MIN = 24 * 60; // 24h

function topFor(min: number) {
  return (min / 60) * HOUR_HEIGHT;
}
function heightFor(startMin: number, endMin: number) {
  return Math.max(8, topFor(endMin) - topFor(startMin));
}
function formatTime(min: number) {
  return min === 1440 ? '24:00' : minutesToTime(min);
}
function overnightMarker(startMin: number, endMin: number) {
  if (endMin === 1440) return '↘';
  if (startMin === 0) return '↗';
  return '';
}
function codeFromLabel(label: string | undefined, fallback: string) {
  const first = (label ?? '').trim().slice(0, 1);
  return (first || fallback).toUpperCase();
}

// ✅ UID deterministic (avoid Math.random/Date.now for strict purity linters)
let __uidSeq = 0;
function uid() {
  __uidSeq += 1;
  return `seg_${__uidSeq}`;
}

function dayMinToAbs(day: number, min: number) {
  return clamp(day, 0, 6) * 1440 + clamp(min, 0, 1440);
}
function absToDayMin(abs: number) {
  const a = clamp(abs, 0, 7 * 1440);
  const day = clamp(Math.floor(a / 1440), 0, 6);
  const min = a - day * 1440;
  return { day, min };
}

/** Split a week-range into day parts. */
function buildPartsFromAbsRange(startAbs: number, endAbs: number, maxSpanMin: number) {
  let a = startAbs;
  let b = endAbs;

  if (a === b) return [];
  if (b < a) [a, b] = [b, a];

  if (b - a > maxSpanMin) b = a + maxSpanMin;

  const parts: Array<Omit<DayPartSegment, 'id'>> = [];
  while (a < b) {
    const { day } = absToDayMin(a);
    const dayStartAbs = day * 1440;
    const dayEndAbs = dayStartAbs + 1440;

    const segStart = a - dayStartAbs;
    const segEndAbs = Math.min(b, dayEndAbs);
    const segEnd = segEndAbs - dayStartAbs;

    if (segEnd > segStart) parts.push({ day, startMin: segStart, endMin: segEnd });

    a = segEndAbs;
  }

  return parts;
}

type Selection =
  | null
  | {
      kind: Kind;
      startAbs: number;
      currentAbs: number;
      valid: boolean;
    };

type UndoState = null | { kind: Kind; segs: DayPartSegment[] };

export default function WeeklyScheduleInline({
  ui,
  dayLabels,
  selectedDay,
  onSelectDay,
  workSegments,
  setWorkSegments,
  sleepSegments,
  setSleepSegments,
}: {
  ui: ScheduleUi;
  dayLabels: readonly string[];
  selectedDay: number;
  onSelectDay: (day: number) => void;

  workSegments: DayPartSegment[];
  setWorkSegments: (next: DayPartSegment[]) => void;
  sleepSegments: DayPartSegment[];
  setSleepSegments: (next: DayPartSegment[]) => void;
}) {
  const [activeKind, setActiveKind] = useState<Kind>('work');
  const [selection, setSelection] = useState<Selection>(null);

  const [undo, setUndo] = useState<UndoState>(null);
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current != null) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  const workCode = codeFromLabel(ui.badgeWork, 'W');
  const sleepCode = codeFromLabel(ui.badgeSleep, 'S');

  const blocks: Block[] = useMemo(() => {
    const w = workSegments.map((s) => ({
      kind: 'work' as const,
      day: s.day,
      startMin: s.startMin,
      endMin: s.endMin,
      id: s.id,
    }));
    const sl = sleepSegments.map((s) => ({
      kind: 'sleep' as const,
      day: s.day,
      startMin: s.startMin,
      endMin: s.endMin,
      id: s.id,
    }));
    return [...w, ...sl];
  }, [sleepSegments, workSegments]);

  function listFor(kind: Kind) {
    return kind === 'work' ? workSegments : sleepSegments;
  }
  function otherFor(kind: Kind) {
    return kind === 'work' ? sleepSegments : workSegments;
  }
  function setListFor(kind: Kind, next: DayPartSegment[]) {
    kind === 'work' ? setWorkSegments(next) : setSleepSegments(next);
  }
  function maxSpanFor(kind: Kind) {
    return kind === 'work' ? MAX_SPAN_WORK_MIN : MAX_SPAN_SLEEP_MIN;
  }

  function canPlace(kind: Kind, parts: Array<Omit<DayPartSegment, 'id'>>) {
    const same = listFor(kind);
    const other = otherFor(kind);
    const prospective = parts.map((p) => ({ ...p, id: 'tmp' }));

    for (const p of prospective) {
      for (const e of same) if (overlaps(p, e)) return false;
      for (const e of other) if (overlaps(p, e)) return false;
    }
    return true;
  }

  function commitRange(kind: Kind, startAbs: number, endAbs: number) {
    const parts = buildPartsFromAbsRange(startAbs, endAbs, maxSpanFor(kind));
    if (parts.length === 0) return;
    if (!canPlace(kind, parts)) return;

    const groupId = uid();
    const created: DayPartSegment[] = parts.map((p, idx) => ({
      ...p,
      id: `${groupId}:${idx}`,
    }));

    setListFor(kind, [...listFor(kind), ...created]);
  }

  function scheduleUndoClear() {
    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    undoTimerRef.current = window.setTimeout(() => {
      setUndo(null);
      undoTimerRef.current = null;
    }, 6000);
  }

  function removeGroup(kind: Kind, id: string) {
    const group = id.includes(':') ? id.split(':')[0] : id;
    const current = listFor(kind);
    const removed = current.filter((s) => s.id === id || s.id.startsWith(`${group}:`));
    if (removed.length === 0) return;

    setListFor(
      kind,
      current.filter((s) => !(s.id === id || s.id.startsWith(`${group}:`))),
    );

    setUndo({ kind, segs: removed });
    scheduleUndoClear();
  }

  function applyUndo() {
    setUndo((u) => {
      if (!u) return null;
      const current = listFor(u.kind);
      const restored = u.segs.filter((s) => !current.some((c) => c.id === s.id));
      if (restored.length === 0) return null;

      setListFor(u.kind, [...current, ...restored]);

      if (undoTimerRef.current != null) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }

      return null;
    });
  }

  function getDayInnerFromEventTarget(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest('[data-sw-day-inner]') as HTMLElement | null;
  }

  function minuteFromPointer(dayInner: HTMLElement, clientY: number) {
    const rect = dayInner.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);
    const rawMin = (y / rect.height) * 1440;
    return snap(rawMin, 15);
  }

  function dayFromInner(dayInner: HTMLElement) {
    const raw = dayInner.getAttribute('data-sw-day-inner');
    const day = raw ? Number(raw) : NaN;
    if (!Number.isFinite(day)) return null;
    return clamp(day, 0, 6);
  }

  function formatAbs(abs: number) {
    const { day, min } = absToDayMin(abs);
    const d = dayLabels[day] ?? `D${day + 1}`;
    return `${d} ${formatTime(min)}`;
  }

  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement | null)?.closest('.sw-weekblock-del')) return;

    const inner = getDayInnerFromEventTarget(e.target);
    if (!inner) return;

    const day = dayFromInner(inner);
    if (day == null) return;

    onSelectDay(day);

    const min = minuteFromPointer(inner, e.clientY);
    const abs = dayMinToAbs(day, min);

    if (!selection) {
      setSelection({ kind: activeKind, startAbs: abs, currentAbs: abs, valid: true });
      return;
    }

    if (selection.kind !== activeKind) {
      setSelection({ kind: activeKind, startAbs: abs, currentAbs: abs, valid: true });
      return;
    }

    const parts = buildPartsFromAbsRange(selection.startAbs, abs, maxSpanFor(activeKind));
    const ok = parts.length === 0 ? true : canPlace(activeKind, parts);

    if (ok) commitRange(activeKind, selection.startAbs, abs);
    setSelection(null);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!selection || selection.kind !== activeKind) return;

    const inner = getDayInnerFromEventTarget(e.target);
    if (!inner) return;

    const day = dayFromInner(inner);
    if (day == null) return;

    const min = minuteFromPointer(inner, e.clientY);
    const abs = dayMinToAbs(day, min);

    const parts = buildPartsFromAbsRange(selection.startAbs, abs, maxSpanFor(activeKind));
    const ok = parts.length === 0 ? true : canPlace(activeKind, parts);

    setSelection((s) => (s ? { ...s, currentAbs: abs, valid: ok } : null));
  }

  const previewParts = useMemo(() => {
    if (!selection || selection.kind !== activeKind) return [];
    return buildPartsFromAbsRange(selection.startAbs, selection.currentAbs, maxSpanFor(activeKind));
  }, [activeKind, selection, workSegments, sleepSegments]);

  return (
    <section className="card soft" style={{ padding: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="badge secondary">{ui.badgeWork}</span>
          <span className="badge primary">{ui.badgeSleep}</span>
          <div className="small muted" style={{ whiteSpace: 'nowrap' }}>
            {ui.clickDayToEdit}
          </div>
        </div>

        <div className="sw-kindbar">
          <button
            type="button"
            className={`btn sw-kindbtn sw-kindbtn--work ${activeKind === 'work' ? 'is-active' : ''}`}
            onClick={() => setActiveKind('work')}
          >
            {ui.badgeWork}
          </button>
          <button
            type="button"
            className={`btn sw-kindbtn sw-kindbtn--sleep ${activeKind === 'sleep' ? 'is-active' : ''}`}
            onClick={() => setActiveKind('sleep')}
          >
            {ui.badgeSleep}
          </button>

          {selection ? (
            <div className={`sw-selection-pill ${selection.valid ? '' : 'is-invalid'}`}>
              {activeKind.toUpperCase()} · {formatAbs(selection.startAbs)} → {formatAbs(selection.currentAbs)}
              {!selection.valid ? ` · ${ui.overlap}` : ''}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sw-weekgrid" style={{ marginTop: 12 }}>
        <div className="sw-weekgrid-head">
          <div className="sw-weekgrid-head-left" />
          {dayLabels.map((d, i) => (
            <button
              key={`${d}-${i}`}
              type="button"
              className={`sw-weekgrid-head-day ${i === selectedDay ? 'is-active' : ''}`}
              onClick={() => onSelectDay(i)}
              title={ui.editDayTitle}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="sw-weekgrid-body" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
          <div className="sw-weekgrid-timecol" aria-hidden="true">
            <div className="sw-weekgrid-time-inner">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={`t-${h}`} className="sw-weekgrid-time" style={{ height: HOUR_HEIGHT }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          <div className="sw-weekgrid-days">
            {dayLabels.map((_, day) => (
              <div
                key={`col-${day}`}
                className={`sw-weekgrid-daycol ${day === selectedDay ? 'is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={ui.editDayTitle}
              >
                <div className="sw-weekgrid-day-inner" data-sw-day-inner={day}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={`line-${day}-${h}`} className="sw-weekgrid-line" style={{ top: h * HOUR_HEIGHT }} />
                  ))}

                  {previewParts
                    .filter((p) => p.day === day)
                    .map((p, idx) => (
                      <div
                        key={`prev-${day}-${idx}`}
                        className={`sw-weekpreview ${activeKind === 'work' ? 'is-work' : 'is-sleep'} ${
                          selection && !selection.valid ? 'is-invalid' : ''
                        }`}
                        style={{
                          top: topFor(p.startMin),
                          height: heightFor(p.startMin, p.endMin),
                          left: activeKind === 'work' ? 8 : 18,
                          right: activeKind === 'work' ? 18 : 8,
                        }}
                      />
                    ))}

                  {blocks
                    .filter((b) => b.day === day)
                    .map((b) => {
                      const mark = overnightMarker(b.startMin, b.endMin);
                      const code = b.kind === 'work' ? workCode : sleepCode;
                      const label = b.kind === 'work' ? ui.badgeWork : ui.badgeSleep;

                      return (
                        <div
                          key={`${b.kind}-${b.id}`}
                          className={`sw-weekblock ${b.kind === 'work' ? 'is-work' : 'is-sleep'}`}
                          style={{
                            top: topFor(b.startMin),
                            height: heightFor(b.startMin, b.endMin),
                            left: b.kind === 'work' ? 8 : 18,
                            right: b.kind === 'work' ? 18 : 8,
                          }}
                          title={`${label} ${formatTime(b.startMin)}-${formatTime(b.endMin)}`}
                        >
                          <span className="sw-weekblock-label">
                            {code} {formatTime(b.startMin)}–{formatTime(b.endMin)} {mark}
                          </span>

                          <button
                            type="button"
                            className="sw-weekblock-del"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              removeGroup(b.kind, b.id);
                            }}
                            aria-label={ui.delete}
                            title={ui.delete}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="notice" style={{ marginTop: 12 }}>
        <div className="small">{ui.overnightNotice}</div>
      </div>

      {undo ? (
        <div className="sw-undo">
          <div className="small">
            {ui.deleted} ({undo.kind === 'work' ? ui.badgeWork : ui.badgeSleep})
          </div>
          <button type="button" className="btn ghost" onClick={applyUndo}>
            {ui.undo}
          </button>
        </div>
      ) : null}
    </section>
  );
}