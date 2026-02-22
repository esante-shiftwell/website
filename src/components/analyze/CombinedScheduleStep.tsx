'use client';

import { useMemo, useState } from 'react';
import type { DayPartSegment } from './calendar/scheduleUtils';
import DayMixedEditor from './calendar/DayMixedEditor';
import WeeklyScheduleInline from './calendar/WeeklyScheduleInline';

export type ScheduleUi = {
  title: string;
  subtitle: string;
  viewWeek: string;
  viewDay: string;
  prev: string;
  next: string;
  required: string;

  badgeWork: string;
  badgeSleep: string;
  clickDayToEdit: string;
  editDayTitle: string;
  overnightNotice: string;

  dayBadge: string;
  dayHelper: string;
  overlap: string;
  delete: string;
  undo: string;
  deleted: string;
  tip: string;

  // Validation / confirm (multilingue)
  sleepMissingTitle: string;
  sleepMissingBody: string;
  sleepMissingContinue: string;
  sleepMissingCancel: string;

  sleepMissingStatsDays: string;
  sleepMissingStatsTotal: string;
  sleepMissingStatsGap: string;
  sleepMissingStatsMissing: string;
  sleepMissingNoneMissing: string;
};

const MIN_SLEEP_DAYS = 4;
const MIN_SLEEP_HOURS = 24;
const MAX_NO_SLEEP_GAP_MIN = 24 * 60;
const WEEK_MIN = 7 * 1440;

function absIntervals(segments: DayPartSegment[]) {
  // segments are day parts (never cross midnight)
  const ints = segments
    .map((s) => ({
      start: Math.max(0, Math.min(WEEK_MIN, s.day * 1440 + s.startMin)),
      end: Math.max(0, Math.min(WEEK_MIN, s.day * 1440 + s.endMin)),
    }))
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  // merge overlaps
  const merged: Array<{ start: number; end: number }> = [];
  for (const i of ints) {
    const last = merged[merged.length - 1];
    if (!last || i.start > last.end) merged.push({ ...i });
    else last.end = Math.max(last.end, i.end);
  }
  return merged;
}

function sleepStats(dayLabels: readonly string[], sleepSegments: DayPartSegment[]) {
  const covered = new Array(7).fill(false);
  let totalMin = 0;

  for (const s of sleepSegments) {
    covered[s.day] = true;
    totalMin += Math.max(0, s.endMin - s.startMin);
  }

  const daysWithSleep = covered.filter(Boolean).length;
  const missingDays: string[] = [];
  for (let d = 0; d < 7; d++) if (!covered[d]) missingDays.push(dayLabels[d] ?? `D${d + 1}`);

  const merged = absIntervals(sleepSegments);

  let longestGap = WEEK_MIN; // if no sleep at all
  if (merged.length > 0) {
    longestGap = Math.max(merged[0].start - 0, WEEK_MIN - merged[merged.length - 1].end);
    for (let i = 1; i < merged.length; i++) {
      longestGap = Math.max(longestGap, merged[i].start - merged[i - 1].end);
    }
  }

  return { daysWithSleep, totalMin, longestGap, missingDays };
}

function fmtHours(min: number) {
  const h = min / 60;
  const rounded = Math.round(h * 10) / 10; // 1 decimal
  return `${rounded}h`;
}

export default function CombinedScheduleStep({
  ui,
  dayLabels,
  workSegments,
  setWorkSegments,
  sleepSegments,
  setSleepSegments,
  onPrev,
  onNext,
}: {
  ui: ScheduleUi;
  dayLabels: readonly string[];
  workSegments: DayPartSegment[];
  setWorkSegments: (next: DayPartSegment[]) => void;
  sleepSegments: DayPartSegment[];
  setSleepSegments: (next: DayPartSegment[]) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasWork = workSegments.length > 0;
  const hasSleep = sleepSegments.length > 0;
  const canNextMin = hasWork && hasSleep;

  const stats = useMemo(() => sleepStats(dayLabels, sleepSegments), [dayLabels, sleepSegments]);

  const strictOk =
    canNextMin &&
    stats.daysWithSleep >= MIN_SLEEP_DAYS &&
    stats.totalMin >= MIN_SLEEP_HOURS * 60 &&
    stats.longestGap < MAX_NO_SLEEP_GAP_MIN;

  const selectedLabel = dayLabels[selectedDay] ?? ui.viewDay;

  function handleNext() {
    if (!canNextMin) return;
    if (strictOk) return onNext();
    setConfirmOpen(true);
  }

  const showSoftWarn = canNextMin && !strictOk;

  const missingText =
    stats.missingDays.length > 0 ? stats.missingDays.join(', ') : ui.sleepMissingNoneMissing;

  const confirmBody =
    `${ui.sleepMissingBody}\n\n` +
    `${ui.sleepMissingStatsDays}: ${stats.daysWithSleep}/7 (≥ ${MIN_SLEEP_DAYS})\n` +
    `${ui.sleepMissingStatsTotal}: ${fmtHours(stats.totalMin)} (≥ ${MIN_SLEEP_HOURS}h)\n` +
    `${ui.sleepMissingStatsGap}: ${fmtHours(stats.longestGap)} (< 24h)\n` +
    `${ui.sleepMissingStatsMissing}: ${missingText}`;

  return (
    <section className="card" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {ui.title}
          </h2>
          <p className="section-subtitle">{ui.subtitle}</p>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className={`btn ${view === 'week' ? 'primary' : 'ghost'}`}
            onClick={() => setView('week')}
          >
            {ui.viewWeek}
          </button>
          <button
            type="button"
            className={`btn ${view === 'day' ? 'primary' : 'ghost'}`}
            onClick={() => setView('day')}
          >
            {ui.viewDay}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {view === 'week' ? (
          <WeeklyScheduleInline
            ui={ui}
            dayLabels={dayLabels}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            workSegments={workSegments}
            setWorkSegments={setWorkSegments}
            sleepSegments={sleepSegments}
            setSleepSegments={setSleepSegments}
          />
        ) : (
          <DayMixedEditor
            ui={ui}
            day={selectedDay}
            dayLabel={selectedLabel}
            workSegments={workSegments}
            setWorkSegments={setWorkSegments}
            sleepSegments={sleepSegments}
            setSleepSegments={setSleepSegments}
          />
        )}
      </div>

      {!canNextMin ? (
        <div className="notice warn" style={{ marginTop: 12 }}>
          <div className="small">{ui.required}</div>
        </div>
      ) : null}

      {showSoftWarn ? (
        <div className="notice warn" style={{ marginTop: 12 }}>
          <div className="small">
            <strong>{ui.sleepMissingTitle}</strong>
            <span className="muted">
              {' '}
              — {stats.daysWithSleep}/7 · {fmtHours(stats.totalMin)} · max gap {fmtHours(stats.longestGap)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
        <button type="button" className="btn" onClick={onPrev}>
          {ui.prev}
        </button>

        <button
          type="button"
          className="btn primary"
          onClick={handleNext}
          disabled={!canNextMin}
          title={!canNextMin ? ui.required : undefined}
        >
          {ui.next}
        </button>
      </div>

      {confirmOpen ? (
        <ConfirmDialog
          title={ui.sleepMissingTitle}
          body={confirmBody}
          cancelLabel={ui.sleepMissingCancel}
          confirmLabel={ui.sleepMissingContinue}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            onNext();
          }}
        />
      ) : null}
    </section>
  );
}

function ConfirmDialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(15, 23, 42, 0.35)',
        display: 'grid',
        placeItems: 'center',
        padding: 12,
      }}
      onMouseDown={onCancel}
    >
      <div
        className="card"
        style={{
          width: 'min(560px, 100%)',
          padding: 14,
          borderRadius: 16,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="section-title" style={{ fontSize: 18 }}>
          {title}
        </div>

        <p className="small muted" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
          {body}
        </p>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
          <button type="button" className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}