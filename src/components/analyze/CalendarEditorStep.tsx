import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { AnalyzeText } from './copy';
import type { Locale, SegmentDraft, SegmentKind, WeekSegment } from './types';
import {
  MINUTES_PER_DAY,
  minutesToTime,
  normalizeDraftToSegment,
  snapTo30,
  timeToMinutes,
  uid,
  validateSegment,
} from './utils';
import { Field, FooterActions } from './FormBits';
import WeekCalendar from './WeekCalendar';

export default function CalendarEditorStep({
  locale,
  title,
  subtitle,
  legend,
  kind,
  segments,
  setSegments,
  draft,
  setDraft,
  editingId,
  setEditingId,
  labels,
  onPrev,
  onNext,
  canNext,
  tips,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  legend: string;
  kind: SegmentKind;
  segments: WeekSegment[];
  setSegments: Dispatch<SetStateAction<WeekSegment[]>>;
  draft: SegmentDraft;
  setDraft: Dispatch<SetStateAction<SegmentDraft>>;
  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  labels: AnalyzeText;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
  tips?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const sortedSegments = useMemo(
    () =>
      [...segments].sort((a, b) => {
        const aAbs = a.day * MINUTES_PER_DAY + a.startMin;
        const bAbs = b.day * MINUTES_PER_DAY + b.startMin;
        return aAbs - bAbs;
      }),
    [segments],
  );

  function commitDraft() {
    const normalized = normalizeDraftToSegment(draft);
    const validation = validateSegment(normalized, kind);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setError(null);

    if (editingId) {
      setSegments((prev) =>
        prev.map((s) => (s.id === editingId ? { ...normalized, id: editingId } : s)),
      );
      setEditingId(null);
    } else {
      setSegments((prev) => [...prev, normalized]);
    }

    setDraft((d) => ({
      ...d,
      day: normalized.day,
      startMin: normalized.startMin,
      endMin: normalized.endMin,
      overnight: normalized.overnight,
    }));
  }

  function editSegment(seg: WeekSegment) {
    setEditingId(seg.id);
    setDraft({
      day: seg.day,
      startMin: seg.startMin,
      endMin: seg.endMin,
      overnight: seg.overnight,
    });
  }

  function duplicateSegment(seg: WeekSegment) {
    setSegments((prev) => [...prev, { ...seg, id: uid() }]);
  }

  function removeSegment(id: string) {
    setSegments((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function resetDraft() {
    setEditingId(null);
    setError(null);
    setDraft((d) => ({
      ...d,
      overnight: d.endMin <= d.startMin ? true : d.overnight,
    }));
  }

  function handleGridQuickCreate(day: number, minute: number) {
    const startMin = snapTo30(minute);
    const defaultDuration = 8 * 60;
    const rawEnd = startMin + defaultDuration;

    if (rawEnd >= MINUTES_PER_DAY) {
      setDraft({
        day,
        startMin,
        endMin: rawEnd - MINUTES_PER_DAY,
        overnight: true,
      });
    } else {
      setDraft({
        day,
        startMin,
        endMin: rawEnd,
        overnight: false,
      });
    }
    setEditingId(null);
  }

  return (
    <section className="card" style={{ padding: 16 }}>
      <h2 className="section-title" style={{ fontSize: 18 }}>
        {title}
      </h2>
      <p className="section-subtitle">{subtitle}</p>

      <div className="grid grid-2">
        <section className="card soft" style={{ padding: 12 }}>
          <div className="small muted" style={{ marginBottom: 8 }}>
            {legend}
          </div>

          <WeekCalendar
            locale={locale}
            dayLabels={labels.daysShort}
            kind={kind}
            segments={segments}
            onQuickCreate={handleGridQuickCreate}
          />
        </section>

        <section className="card soft" style={{ padding: 12 }}>
          <div className="small muted" style={{ marginBottom: 8 }}>
            {labels.segments}
          </div>

          <div className="grid" style={{ gap: 10 }}>
            <div className="grid" style={{ gap: 8 }}>
              <div className="grid grid-2">
                <Field label={labels.day}>
                  <select
                    className="input"
                    value={draft.day}
                    onChange={(e) => setDraft((d) => ({ ...d, day: Number(e.target.value) }))}
                  >
                    {labels.daysShort.map((dayLabel, idx) => (
                      <option key={dayLabel} value={idx}>
                        {dayLabel}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={labels.overnight}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      minHeight: 40,
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '0 10px',
                      background: 'white',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.overnight}
                      onChange={(e) => setDraft((d) => ({ ...d, overnight: e.target.checked }))}
                    />
                    <span className="small">{draft.overnight ? 'Yes' : 'No'}</span>
                  </label>
                </Field>
              </div>

              <div className="grid grid-2">
                <Field label={labels.start}>
                  <input
                    className="input"
                    type="time"
                    value={minutesToTime(draft.startMin)}
                    onChange={(e) => {
                      const startMin = timeToMinutes(e.target.value);
                      setDraft((d) => ({
                        ...d,
                        startMin,
                        overnight: d.endMin <= startMin ? true : d.overnight,
                      }));
                    }}
                  />
                </Field>

                <Field label={labels.end}>
                  <input
                    className="input"
                    type="time"
                    value={minutesToTime(draft.endMin)}
                    onChange={(e) => {
                      const endMin = timeToMinutes(e.target.value);
                      setDraft((d) => ({
                        ...d,
                        endMin,
                        overnight: endMin <= d.startMin ? true : d.overnight,
                      }));
                    }}
                  />
                </Field>
              </div>

              <div className="row">
                <button type="button" className="btn primary" onClick={commitDraft}>
                  {editingId ? labels.updateSegment : labels.addSegment}
                </button>
                <button type="button" className="btn" onClick={resetDraft}>
                  {labels.resetDraft}
                </button>
              </div>

              {tips ? <div className="small muted">{tips}</div> : null}
              {error ? (
                <div className="notice">
                  <div className="small" style={{ color: '#991b1b' }}>
                    {error}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                background: 'white',
                maxHeight: 320,
                overflow: 'auto',
              }}
            >
              {sortedSegments.length === 0 ? (
                <div className="small muted" style={{ padding: 10 }}>
                  {labels.noSegments}
                </div>
              ) : (
                sortedSegments.map((seg) => (
                  <div
                    key={seg.id}
                    style={{
                      padding: 10,
                      borderBottom: '1px solid var(--border)',
                      display: 'grid',
                      gap: 6,
                    }}
                  >
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <div className="small" style={{ fontWeight: 700 }}>
                        {labels.daysShort[seg.day]} · {minutesToTime(seg.startMin)} →{' '}
                        {minutesToTime(seg.endMin)}
                        {seg.overnight ? ' (+1)' : ''}
                      </div>
                      <span
                        className={`badge ${kind === 'work' ? 'warn' : 'secondary'}`}
                        style={{ fontSize: 11 }}
                      >
                        {kind}
                      </span>
                    </div>

                    <div className="row" style={{ gap: 6 }}>
                      <button type="button" className="btn ghost" onClick={() => editSegment(seg)}>
                        {labels.edit}
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => duplicateSegment(seg)}
                      >
                        {labels.duplicate}
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => removeSegment(seg.id)}
                      >
                        {labels.delete}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <FooterActions
        onPrev={onPrev}
        onNext={onNext}
        prevLabel={labels.previous}
        nextLabel={labels.next}
        canNext={canNext}
        requiredText={!canNext ? labels.required : undefined}
      />
    </section>
  );
}