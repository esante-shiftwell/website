'use client';

import { useMemo, useRef, useState } from 'react';
import type { DayPartSegment, Kind } from './scheduleUtils';
import { clamp, minutesToTime, overlaps } from './scheduleUtils';
import type { ScheduleUi } from '../CombinedScheduleStep';
import type { Locale } from '../types';

type Block = DayPartSegment & { kind: Kind };

type Group = {
  kind: Kind;
  groupId: string;
  parts: DayPartSegment[];
  startAbs: number;
  endAbs: number;
};

type UndoState = null | { kind: Kind; segs: DayPartSegment[] };

const MAX_SPAN_WORK_MIN = 48 * 60; // 48h
const MAX_SPAN_SLEEP_MIN = 24 * 60; // 24h

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `seg_${Math.random().toString(36).slice(2, 10)}`;
}

function fmt(min: number) {
  return min === 1440 ? '24:00' : minutesToTime(min);
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

function groupIdOf(id: string) {
  return id.includes(':') ? id.split(':')[0] : id;
}

function inferLocaleFromDayLabels(dayLabels: readonly string[]): Locale | null {
  const a = (dayLabels[0] ?? '').toLowerCase();
  const b = (dayLabels[1] ?? '').toLowerCase();

  // ultra robuste : on check le 1er / 2e jour
  if (a.startsWith('lun') || b.startsWith('mar')) return 'fr';
  if (a === 'mon' || b === 'tue') return 'en';
  if (a === 'mo' || b === 'di') return 'de';

  // fallback
  const joined = dayLabels.join('|').toLowerCase();
  if (joined.includes('lun|') || joined.includes('|lun')) return 'fr';
  if (joined.includes('mon|') || joined.includes('|mon')) return 'en';
  if (joined.includes('mo|') || joined.includes('|mo')) return 'de';

  return null;
}

/** Split an absolute-range into day parts. Requires endAbs > startAbs. */
function buildPartsFromAbsRange(startAbs: number, endAbs: number, maxSpanMin: number) {
  let a = startAbs;
  let b = endAbs;

  if (a === b) return [];
  if (b < a) [a, b] = [b, a];

  const span = b - a;
  if (span > maxSpanMin) return null;

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

function sumHours(segs: DayPartSegment[], day: number) {
  let min = 0;
  for (const s of segs) if (s.day === day) min += Math.max(0, s.endMin - s.startMin);
  return Math.round((min / 60) * 10) / 10;
}

function percentLeft(min: number) {
  return `${(clamp(min, 0, 1440) / 1440) * 100}%`;
}
function percentWidth(startMin: number, endMin: number) {
  const w = clamp(endMin - startMin, 0, 1440);
  return `${(w / 1440) * 100}%`;
}

function mobileUi(locale: Locale) {
  if (locale === 'fr') {
    return {
      add: 'Ajouter un segment',
      kind: 'Type',
      work: 'Travail',
      sleep: 'Sommeil',
      start: 'Début',
      end: 'Fin',
      save: 'Ajouter',
      cancel: 'Annuler',
      invalidRange: 'Fin doit être après début (choisis le bon jour).',
      overlap: 'Chevauchement : ça recouvre déjà un segment.',
      tooLongWork: 'Segment trop long (max 48h).',
      tooLongSleep: 'Segment trop long (max 24h).',
      deleted: 'Segment supprimé.',
      undo: 'Annuler',
      none: 'Aucun segment ce jour.',
      hint: 'Sur mobile : ajoute/modifie via cette fiche (overnight géré via jour+heure).',
    };
  }
  if (locale === 'de') {
    return {
      add: 'Segment hinzufügen',
      kind: 'Typ',
      work: 'Arbeit',
      sleep: 'Schlaf',
      start: 'Start',
      end: 'Ende',
      save: 'Hinzufügen',
      cancel: 'Abbrechen',
      invalidRange: 'Ende muss nach Start liegen (richtigen Tag wählen).',
      overlap: 'Überlappung: überschneidet vorhandenes Segment.',
      tooLongWork: 'Zu lang (max 48h).',
      tooLongSleep: 'Zu lang (max 24h).',
      deleted: 'Segment gelöscht.',
      undo: 'Rückgängig',
      none: 'Keine Segmente an diesem Tag.',
      hint: 'Mobil: Bearbeite hier (Übernachtung via Tag+Uhrzeit).',
    };
  }
  return {
    add: 'Add segment',
    kind: 'Kind',
    work: 'Work',
    sleep: 'Sleep',
    start: 'Start',
    end: 'End',
    save: 'Add',
    cancel: 'Cancel',
    invalidRange: 'End must be after start (pick the correct day).',
    overlap: 'Overlap: this intersects an existing segment.',
    tooLongWork: 'Too long (max 48h).',
    tooLongSleep: 'Too long (max 24h).',
    deleted: 'Segment deleted.',
    undo: 'Undo',
    none: 'No segments for this day.',
    hint: 'On mobile: edit here (overnight via day+time).',
  };
}

function timeOptions(step = 15) {
  const out: Array<{ v: number; label: string }> = [];
  for (let m = 0; m <= 1440; m += step) {
    const label = m === 1440 ? '24:00' : minutesToTime(m);
    out.push({ v: m, label });
  }
  return out;
}

export default function WeeklyScheduleMobile({
  locale,
  ui,
  dayLabels,
  selectedDay,
  onSelectDay,
  workSegments,
  setWorkSegments,
  sleepSegments,
  setSleepSegments,
}: {
  locale?: Locale; // ✅ optionnel
  ui: ScheduleUi;
  dayLabels: readonly string[];
  selectedDay: number;
  onSelectDay: (day: number) => void;

  workSegments: DayPartSegment[];
  setWorkSegments: (next: DayPartSegment[]) => void;
  sleepSegments: DayPartSegment[];
  setSleepSegments: (next: DayPartSegment[]) => void;
}) {
  const effectiveLocale: Locale = locale ?? inferLocaleFromDayLabels(dayLabels) ?? 'en';
  const m = useMemo(() => mobileUi(effectiveLocale), [effectiveLocale]);
  const times = useMemo(() => timeOptions(15), []);

  const [sheetDay, setSheetDay] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [formKind, setFormKind] = useState<Kind>('work');
  const [startDay, setStartDay] = useState(0);
  const [startMin, setStartMin] = useState(8 * 60);
  const [endDay, setEndDay] = useState(0);
  const [endMin, setEndMin] = useState(16 * 60);

  const [msg, setMsg] = useState<null | { kind: 'warn' | 'err' | 'ok'; text: string }>(null);

  const [undo, setUndo] = useState<UndoState>(null);
  const undoTimerRef = useRef<number | null>(null);

  function listFor(kind: Kind) {
    return kind === 'work' ? workSegments : sleepSegments;
  }
  function otherFor(kind: Kind) {
    return kind === 'work' ? sleepSegments : workSegments;
  }
  function setListFor(kind: Kind, next: DayPartSegment[]) {
    if (kind === 'work') {
      setWorkSegments(next);
    } else {
      setSleepSegments(next);
    }
  }
  function maxSpanFor(kind: Kind) {
    return kind === 'work' ? MAX_SPAN_WORK_MIN : MAX_SPAN_SLEEP_MIN;
  }

  const blocksByDay: Record<number, Block[]> = useMemo(() => {
    const out: Record<number, Block[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const s of workSegments) out[s.day].push({ ...s, kind: 'work' });
    for (const s of sleepSegments) out[s.day].push({ ...s, kind: 'sleep' });
    for (let d = 0; d < 7; d++) out[d].sort((a, b) => a.startMin - b.startMin);
    return out;
  }, [sleepSegments, workSegments]);

  function openDay(day: number) {
    onSelectDay(day);
    setSheetDay(day);
    setAddOpen(false);
    setMsg(null);

    setStartDay(day);
    setEndDay(day);
    setFormKind('work');
    setStartMin(8 * 60);
    setEndMin(16 * 60);
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
    if (parts === null) {
      setMsg({ kind: 'warn', text: kind === 'work' ? m.tooLongWork : m.tooLongSleep });
      return;
    }
    if (!parts.length) return;

    if (!canPlace(kind, parts)) {
      setMsg({ kind: 'warn', text: m.overlap });
      return;
    }

    const group = uid();
    const created: DayPartSegment[] = parts.map((p, idx) => ({ ...p, id: `${group}:${idx}` }));
    setListFor(kind, [...listFor(kind), ...created]);
    setMsg(null);
  }

  function removeGroup(kind: Kind, anyId: string) {
    const group = groupIdOf(anyId);
    const current = listFor(kind);
    const removed = current.filter((s) => s.id === anyId || s.id.startsWith(`${group}:`));
    if (!removed.length) return;

    setListFor(
      kind,
      current.filter((s) => !(s.id === anyId || s.id.startsWith(`${group}:`))),
    );

    setUndo({ kind, segs: removed });
    setMsg({ kind: 'ok', text: m.deleted });

    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => setUndo(null), 6000);
  }

  function applyUndo() {
    setUndo((u) => {
      if (!u) return null;
      const cur = listFor(u.kind);
      const restored = u.segs.filter((s) => !cur.some((c) => c.id === s.id));
      if (!restored.length) return null;
      setListFor(u.kind, [...cur, ...restored]);
      return null;
    });
  }

  const groupsForSheet: Group[] = useMemo(() => {
    if (sheetDay == null) return [];
    const groups: Group[] = [];

    function collect(kind: Kind, segs: DayPartSegment[]) {
      const by: Record<string, DayPartSegment[]> = {};
      for (const s of segs) {
        const gid = groupIdOf(s.id);
        (by[gid] ??= []).push(s);
      }

      for (const [gid, parts] of Object.entries(by)) {
        const touches = parts.some((p) => p.day === sheetDay);
        if (!touches) continue;

        const absStarts = parts.map((p) => dayMinToAbs(p.day, p.startMin));
        const absEnds = parts.map((p) => dayMinToAbs(p.day, p.endMin));
        const startAbs = Math.min(...absStarts);
        const endAbs = Math.max(...absEnds);

        groups.push({
          kind,
          groupId: gid,
          parts: parts
            .slice()
            .sort((a, b) => dayMinToAbs(a.day, a.startMin) - dayMinToAbs(b.day, b.startMin)),
          startAbs,
          endAbs,
        });
      }
    }

    collect('work', workSegments);
    collect('sleep', sleepSegments);

    return groups.sort((a, b) => a.startAbs - b.startAbs);
  }, [sheetDay, sleepSegments, workSegments]);

  function labelAbs(abs: number) {
    const { day, min } = absToDayMin(abs);
    const d = dayLabels[day] ?? `D${day + 1}`;
    return `${d} ${fmt(min)}`;
  }

  function handleAdd() {
    if (sheetDay == null) return;
    setAddOpen(true);
    setMsg(null);

    if (formKind === 'sleep') {
      setStartDay(sheetDay);
      setStartMin(22 * 60);
      setEndDay((sheetDay + 1) % 7);
      setEndMin(6 * 60);
    } else {
      setStartDay(sheetDay);
      setStartMin(8 * 60);
      setEndDay(sheetDay);
      setEndMin(16 * 60);
    }
  }

  function submitAdd() {
    const a = dayMinToAbs(startDay, startMin);
    const b = dayMinToAbs(endDay, endMin);

    if (b <= a) {
      setMsg({ kind: 'warn', text: m.invalidRange });
      return;
    }

    commitRange(formKind, a, b);
    setAddOpen(false);
  }

  return (
    <>
      <div className="sw-mobile-week">
        <div className="notice" style={{ marginBottom: 10 }}>
          <div className="small">{m.hint}</div>
        </div>

        <div className="sw-daylist">
          {dayLabels.map((label, day) => {
            const w = sumHours(workSegments, day);
            const s = sumHours(sleepSegments, day);
            const blocks = blocksByDay[day] ?? [];

            return (
              <button
                key={`day-${day}`}
                type="button"
                className={`sw-dayrow card soft ${day === selectedDay ? 'is-active' : ''}`}
                onClick={() => openDay(day)}
              >
                <div className="sw-dayrow-top">
                  <div className="sw-dayrow-title">{label}</div>
                  <div className="sw-dayrow-meta">
                    <span className="sw-mini-pill is-work">W {w}h</span>
                    <span className="sw-mini-pill is-sleep">S {s}h</span>
                  </div>
                </div>

                <div className="sw-mini-timeline" aria-hidden="true">
                  {blocks.map((b) => (
                    <div
                      key={`${b.kind}-${b.id}`}
                      className={`sw-mini-block ${b.kind === 'work' ? 'is-work' : 'is-sleep'}`}
                      style={{
                        left: percentLeft(b.startMin),
                        width: percentWidth(b.startMin, b.endMin),
                      }}
                      title={`${b.kind.toUpperCase()} ${fmt(b.startMin)}–${fmt(b.endMin)}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {sheetDay != null ? (
        <div className="sw-sheet-overlay" onMouseDown={() => setSheetDay(null)}>
          <div className="sw-sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="badge secondary">{ui.dayBadge}</div>
                <div className="sw-dayeditor-title" style={{ marginTop: 6 }}>
                  {dayLabels[sheetDay] ?? ui.viewDay}
                </div>
              </div>

              <button type="button" className="btn ghost" onClick={() => setSheetDay(null)}>
                {m.cancel}
              </button>
            </div>

            <div className="divider" />

            {groupsForSheet.length === 0 ? (
              <div className="notice">
                <div className="small">{m.none}</div>
              </div>
            ) : (
              <div className="sw-sheet-list">
                {groupsForSheet.map((g) => (
                  <div key={`${g.kind}-${g.groupId}`} className="sw-sheet-item card soft">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className={`badge ${g.kind === 'work' ? 'warn' : 'primary'}`}>
                          {g.kind === 'work' ? ui.badgeWork : ui.badgeSleep}
                        </span>
                        <div style={{ marginTop: 6, fontWeight: 900, color: 'var(--ink-2)' }}>
                          {labelAbs(g.startAbs)} → {labelAbs(g.endAbs)}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => removeGroup(g.kind, `${g.groupId}:0`)}
                        aria-label={ui.delete}
                        title={ui.delete}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {undo ? (
              <div className="sw-undo">
                <div className="small">{m.deleted}</div>
                <button type="button" className="btn ghost" onClick={applyUndo}>
                  {m.undo}
                </button>
              </div>
            ) : null}

            {msg ? (
              <div
                className={`notice ${msg.kind === 'warn' ? 'warn' : msg.kind === 'err' ? 'error' : ''}`}
                style={{ marginTop: 10 }}
              >
                <div className="small">{msg.text}</div>
              </div>
            ) : null}

            <div className="divider" />

            {!addOpen ? (
              <button type="button" className="btn primary sw-week-add" onClick={handleAdd}>
                {m.add}
              </button>
            ) : (
              <div className="sw-sheet-form">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="small muted" style={{ fontWeight: 900 }}>
                    {m.add}
                  </div>
                  <button type="button" className="btn ghost" onClick={() => setAddOpen(false)}>
                    {m.cancel}
                  </button>
                </div>

                <div className="divider" />

                <div className="sw-sheet-grid">
                  <div>
                    <div className="small muted" style={{ fontWeight: 900, marginBottom: 6 }}>
                      {m.kind}
                    </div>
                    <div className="row">
                      <button
                        type="button"
                        className={`btn ${formKind === 'work' ? 'primary' : 'ghost'}`}
                        onClick={() => setFormKind('work')}
                      >
                        {m.work}
                      </button>
                      <button
                        type="button"
                        className={`btn ${formKind === 'sleep' ? 'primary' : 'ghost'}`}
                        onClick={() => setFormKind('sleep')}
                      >
                        {m.sleep}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="small muted" style={{ fontWeight: 900, marginBottom: 6 }}>
                      {m.start}
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <select className="input" value={startDay} onChange={(e) => setStartDay(Number(e.target.value))}>
                        {dayLabels.map((d, i) => (
                          <option key={`sd-${i}`} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>

                      <select className="input" value={startMin} onChange={(e) => setStartMin(Number(e.target.value))}>
                        {times.map((o) => (
                          <option key={`st-${o.v}`} value={o.v}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="small muted" style={{ fontWeight: 900, marginBottom: 6 }}>
                      {m.end}
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <select className="input" value={endDay} onChange={(e) => setEndDay(Number(e.target.value))}>
                        {dayLabels.map((d, i) => (
                          <option key={`ed-${i}`} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>

                      <select className="input" value={endMin} onChange={(e) => setEndMin(Number(e.target.value))}>
                        {times.map((o) => (
                          <option key={`et-${o.v}`} value={o.v}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="btn primary" onClick={submitAdd}>
                    {m.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
