export default function ScoreCard({
  label,
  value,
  hint,
  inverse,
  lowLabel,
  highLabel,
  highlight,
}: {
  label: string;
  value: number;
  hint: string;
  inverse: boolean;
  lowLabel: string;
  highLabel: string;
  highlight?: boolean;
}) {
  const rounded = Math.round(value);
  const tone = inverse
    ? rounded >= 70
      ? 'good'
      : rounded >= 40
      ? 'mid'
      : 'bad'
    : rounded >= 70
    ? 'bad'
    : rounded >= 40
    ? 'mid'
    : 'good';

  const bg =
    tone === 'good'
      ? 'rgba(16,185,129,0.08)'
      : tone === 'mid'
      ? 'rgba(245,158,11,0.08)'
      : 'rgba(239,68,68,0.08)';

  const border =
    tone === 'good'
      ? 'rgba(16,185,129,0.20)'
      : tone === 'mid'
      ? 'rgba(245,158,11,0.20)'
      : 'rgba(239,68,68,0.20)';

  return (
    <div
      className="card"
      style={{
        padding: 14,
        background: highlight
          ? 'radial-gradient(circle at 10% 15%, rgba(42,157,143,0.12), transparent 45%), white'
          : 'white',
      }}
    >
      <div className="small muted">{label}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        {rounded}
        <span style={{ fontSize: 14, marginLeft: 4 }}>/100</span>
      </div>
      <div className="small muted" style={{ marginTop: 2 }}>
        {hint}
      </div>

      <div
        style={{
          marginTop: 10,
          border: `1px solid ${border}`,
          borderRadius: 999,
          height: 10,
          background: bg,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${rounded}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
          }}
        />
      </div>

      <div
        className="row"
        style={{
          marginTop: 6,
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--muted)',
        }}
      >
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}