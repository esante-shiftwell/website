'use client';

import { useMemo, useRef, useState } from 'react';
import type { DayPartSegment, Kind } from './scheduleUtils';
import {
  buildSegmentsFromSelection,
  clamp,
  minutesToTime,
  overlaps,
  snap,
  sortDaySegments,
  uid,
} from './scheduleUtils';
import type { ScheduleUi } from '../CombinedScheduleStep';

type Selection =
  | null
  | {
      kind: Kind;
      day: number;
      startMin: number;
      currentMin: number;
      valid: boolean;
    };

const HOUR_HEIGHT = 40;
const GRID_HEIGHT = 24 * HOUR_HEIGHT;

function yToMinute(y: number) {
  const minutes = (y / HOUR_HEIGHT) * 60;
  return clamp(minutes, 0, 1440);
}
function topFor(min: number) {
  return (min / 60) * HOUR_HEIGHT;
}
function heightFor(startMin: number, endMin: number) {
  return Math.max(10, topFor(endMin) - topFor(startMin));
}
function fmt(min: number) {
  return min === 1440 ? '24:00' : minutesToTime(min);
}

function codeFromLabel(label: string | undefined, fallback: string) {
  const first = (label ?? '').trim().slice(0, 1);
  return (first || fallback).toUpperCase();
}

export default function DayMixedEditor({
  ui,
  day,
  dayLabel,
  workSegments,
  setWorkSegments,
  sleepSegments,
  setSleepSegments,
}: {
  ui: ScheduleUi;
  day: number;
  dayLabel: string;
  workSegments: DayPartSegment[];
  setWorkSegments: (next: DayPartSegment[]) => void;
  sleepSegments: DayPartSegment[];
  setSleepSegments: (next: DayPartSegment[]) => void;
}) {
  const [activeKind, setActiveKind] = useState<Kind>('work');
  const [selection, setSelection] = useState<Selection>(null);

  const [undo, setUndo] = useState<null | { kind: Kind; seg: DayPartSegment }>(null);
  const undoTimerRef = useRef<number | null>(null);

  const workDay = useMemo(() => sortDaySegments(workSegments, day), [workSegments, day]);
  const sleepDay = useMemo(() => sortDaySegments(sleepSegments, day), [sleepSegments, day]);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const workCode = codeFromLabel(ui.badgeWork, 'W');
  const sleepCode = codeFromLabel(ui.badgeSleep, 'S');

  function listFor(kind: Kind) {
    return kind === 'work' ? workSegments : sleepSegments;
  }
  function otherListFor(kind: Kind) {
    return kind === 'work' ? sleepSegments : workSegments;
  }
  function setListFor(kind: Kind, next: DayPartSegment[]) {
    if (kind === 'work') {
      setWorkSegments(next);
    } else {
      setSleepSegments(next);
    }
  }

  function canPlace(kind: Kind, parts: Array<Omit<DayPartSegment, 'id'>>) {
    const same = listFor(kind);
    const other = otherListFor(kind);
    const prospective = parts.map((p) => ({ ...p, id: 'tmp' }));

    for (const p of prospective) {
      for (const e of same) if (overlaps(p, e)) return false;
      for (const e of other) if (overlaps(p, e)) return false;
    }
    return true;
  }

  function commit(kind: Kind, startMin: number, endMin: number) {
    const parts = buildSegmentsFromSelection(day, startMin, endMin);
    if (parts.length === 0) return;
    if (!canPlace(kind, parts)) return;

    const created = parts.map((p) => ({ ...p, id: uid() }));
    setListFor(kind, [...listFor(kind), ...created]);
  }

  function startOrFinish(minute: number) {
    const m = snap(minute, 15);

    if (!selection) {
      setSelection({ kind: activeKind, day, startMin: m, currentMin: m, valid: true });
      return;
    }

    if (selection.kind !== activeKind) {
      setSelection({ kind: activeKind, day, startMin: m, currentMin: m, valid: true });
      return;
    }

    const parts = buildSegmentsFromSelection(day, selection.startMin, m);
    const ok = parts.length === 0 ? true : canPlace(activeKind, parts);

    if (ok) commit(activeKind, selection.startMin, m);
    setSelection(null);
  }

  function onMove(minute: number) {
    if (!selection || selection.kind !== activeKind) return;

    const m = snap(minute, 15);
    const parts = buildSegmentsFromSelection(day, selection.startMin, m);
    const ok = parts.length === 0 ? true : canPlace(activeKind, parts);

    setSelection((s) => (s ? { ...s, currentMin: m, valid: ok } : null));
  }

  function remove(kind: Kind, id: string) {
    const seg = listFor(kind).find((s) => s.id === id);
    if (!seg) return;

    setListFor(
      kind,
      listFor(kind).filter((s) => s.id !== id),
    );

    setUndo({ kind, seg });

    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => setUndo(null), 6000);
  }

  function applyUndo() {
    setUndo((u) => {
      if (!u) return null;
      const current = listFor(u.kind);
      if (current.some((s) => s.id === u.seg.id)) return null;
      setListFor(u.kind, [...current, u.seg]);
      return null;
    });
  }

  function handlePointerDown(e: React.PointerEvent) {
    const sc = gridRef.current;
    if (!sc) return;
    const rect = sc.getBoundingClientRect();
    const y = e.clientY - rect.top + sc.scrollTop;
    startOrFinish(yToMinute(y));
  }

  function handlePointerMove(e: React.PointerEvent) {
    const sc = gridRef.current;
    if (!sc) return;
    const rect = sc.getBoundingClientRect();
    const y = e.clientY - rect.top + sc.scrollTop;
    onMove(yToMinute(y));
  }

  const mixed = useMemo(() => {
    const w = workDay.map((s) => ({ kind: 'work' as const, seg: s }));
    const sl = sleepDay.map((s) => ({ kind: 'sleep' as const, seg: s }));
    return [...w, ...sl].sort((a, b) => a.seg.startMin - b.seg.startMin);
  }, [workDay, sleepDay]);

  const preview =
    selection && selection.kind === activeKind
      ? buildSegmentsFromSelection(day, selection.startMin, selection.currentMin)
      : [];

  return (
    <section className="sw-dayeditor card soft">
      <div className="sw-dayeditor-head">
        <div>
          <div className="badge secondary">{ui.dayBadge}</div>
          <div className="sw-dayeditor-title">{dayLabel}</div>
          <div className="small muted">{ui.dayHelper}</div>
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
              {activeKind.toUpperCase()} · {fmt(selection.startMin)} → {fmt(selection.currentMin)}
              {!selection.valid ? ` · ${ui.overlap}` : ''}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="sw-grid sw-grid--mixed"
        ref={gridRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        role="application"
        aria-label={ui.editDayTitle}
      >
        <GridLines />

        {mixed.map(({ kind, seg }) => {
          const isWork = kind === 'work';
          const code = isWork ? workCode : sleepCode;

          return (
            <div
              key={`${kind}-${seg.id}`}
              className={`sw-seg ${isWork ? 'is-work' : 'is-sleep'}`}
              style={{
                top: topFor(seg.startMin),
                height: heightFor(seg.startMin, seg.endMin),
                left: isWork ? 10 : 26,
                right: isWork ? 26 : 10,
              }}
              title={`${isWork ? ui.badgeWork : ui.badgeSleep} ${fmt(seg.startMin)}-${fmt(seg.endMin)}`}
            >
              <div className="sw-seg-label">
                {code} · {fmt(seg.startMin)}–{fmt(seg.endMin)}
              </div>
              <button
                type="button"
                className="sw-seg-del"
                onClick={(ev) => {
                  ev.stopPropagation();
                  remove(kind, seg.id);
                }}
                aria-label={ui.delete}
                title={ui.delete}
              >
                ×
              </button>
            </div>
          );
        })}

        {preview.map((p, idx) => (
          <div
            key={`prev-${idx}`}
            className={`sw-preview ${activeKind === 'work' ? 'is-work' : 'is-sleep'} ${
              selection && !selection.valid ? 'is-invalid' : ''
            }`}
            style={{
              top: topFor(p.startMin),
              height: heightFor(p.startMin, p.endMin),
              left: activeKind === 'work' ? 10 : 26,
              right: activeKind === 'work' ? 26 : 10,
            }}
          />
        ))}
      </div>

      <div className="notice" style={{ marginTop: 12 }}>
        <div className="small">{ui.tip}</div>
      </div>

      {undo ? (
        <div className="sw-undo">
          <div className="small">
            {ui.deleted} ({undo.kind === 'work' ? ui.badgeWork : ui.badgeSleep}) — {fmt(undo.seg.startMin)}–
            {fmt(undo.seg.endMin)}
          </div>
          <button type="button" className="btn ghost" onClick={applyUndo}>
            {ui.undo}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function GridLines() {
  const hours = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="sw-lines" aria-hidden="true" style={{ height: GRID_HEIGHT }}>
      {hours.map((h) => (
        <div key={`h-${h}`} className="sw-line" style={{ top: h * HOUR_HEIGHT }}>
          <span className="sw-line-label">{h < 24 ? `${String(h).padStart(2, '0')}:00` : ''}</span>
        </div>
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <div key={`h30-${i}`} className="sw-line sw-line--half" style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
      ))}
    </div>
  );
}
