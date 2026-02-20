import type { DerivedMetrics, Locale } from './types';
import { getDerivedRows } from './utils';

export default function DerivedMetricsList({
  metrics,
  locale,
}: {
  metrics: DerivedMetrics;
  locale: Locale;
}) {
  const rows = getDerivedRows(metrics, locale);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'white',
          }}
        >
          <div className="small muted">{row.label}</div>
          <div className="small" style={{ fontWeight: 700 }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}