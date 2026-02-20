import { useMemo } from 'react';
import type { Locale, SegmentKind, WeekSegment } from './types';
import { HOURS, clamp, minutesToTime, splitSegmentForCalendar } from './utils';

export default function WeekCalendar({
  locale,
  dayLabels,
  kind,
  segments,
  onQuickCreate,
}: {
  locale: Locale;
  dayLabels: readonly string[];
  kind: SegmentKind;
  segments: WeekSegment[];
  onQuickCreate: (day: number, minute: number) => void;
}) {
  const hourHeight = 42;
  const bodyHeight = 24 * hourHeight;

  const splitSegments = useMemo(
    () => segments.flatMap((s) => splitSegmentForCalendar(s)),
    [segments],
  );

  return (
    <div className="calendar-shell">
      <div
        className="calendar-header"
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, minmax(92px, 1fr))',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <div />
        {dayLabels.map((d) => (
          <div
            key={d}
            className="calendar-col"
            style={{
              textAlign: 'center',
              padding: '8px 4px',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ maxHeight: 540, overflow: 'auto' }}>
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '56px repeat(7, minmax(92px, 1fr))',
            minHeight: bodyHeight,
          }}
        >
          <div style={{ position: 'relative' }}>
            {HOURS.map((h) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  top: h * hourHeight - 8,
                  right: 6,
                  fontSize: 11,
                  color: 'var(--muted)',
                }}
              >
                {`${String(h).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {Array.from({ length: 7 }, (_, day) => (
            <DayColumn
              key={`${locale}-${day}`}
              day={day}
              hourHeight={hourHeight}
              bodyHeight={bodyHeight}
              blocks={splitSegments.filter((b) => b.day === day)}
              kind={kind}
              onQuickCreate={onQuickCreate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  hourHeight,
  bodyHeight,
  blocks,
  kind,
  onQuickCreate,
}: {
  day: number;
  hourHeight: number;
  bodyHeight: number;
  blocks: { id: string; day: number; startMin: number; endMin: number }[];
  kind: SegmentKind;
  onQuickCreate: (day: number, minute: number) => void;
}) {
  return (
    <div
      className={`calendar-col ${day === 5 || day === 6 ? 'weekend' : ''}`}
      style={{
        position: 'relative',
        minHeight: bodyHeight,
      }}
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const minute = clamp(Math.round((y / hourHeight) * 60), 0, 1439);
        onQuickCreate(day, minute);
      }}
    >
      {HOURS.map((h) => (
        <div
          key={h}
          style={{
            position: 'absolute',
            top: h * hourHeight,
            left: 0,
            right: 0,
            borderTop: '1px solid rgba(148,163,184,0.35)',
          }}
        />
      ))}

      {HOURS.map((h) => (
        <div
          key={`${h}-30`}
          style={{
            position: 'absolute',
            top: h * hourHeight + hourHeight / 2,
            left: 0,
            right: 0,
            borderTop: '1px dashed rgba(148,163,184,0.22)',
          }}
        />
      ))}

      {blocks.map((b) => {
        const top = (b.startMin / 60) * hourHeight;
        const height = Math.max(((b.endMin - b.startMin) / 60) * hourHeight, 16);
        const cls = kind === 'work' ? 'calendar-block-work' : 'calendar-block-sleep';

        return (
          <div
            key={`${b.id}-${b.startMin}`}
            className={cls}
            style={{
              position: 'absolute',
              left: 4,
              right: 4,
              top,
              height,
              borderRadius: 8,
              padding: 4,
              fontSize: 10,
              overflow: 'hidden',
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
            }}
          >
            {minutesToTime(b.startMin)}–{minutesToTime(b.endMin)}
          </div>
        );
      })}
    </div>
  );
}