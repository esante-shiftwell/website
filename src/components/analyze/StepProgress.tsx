export default function StepProgress({
  labels,
  current,
  percent,
  progressLabel,
}: {
  labels: readonly string[];
  current: number;
  percent: number;
  progressLabel: string;
}) {
  return (
    <div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {labels.map((label, idx) => {
          const state = idx < current ? 'done' : idx === current ? 'current' : 'todo';
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid var(--border)',
                background:
                  state === 'done'
                    ? 'rgba(42,157,143,0.12)'
                    : state === 'current'
                    ? 'rgba(30,42,68,0.08)'
                    : 'white',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  border: '1px solid var(--border)',
                  background:
                    state === 'done'
                      ? 'var(--primary)'
                      : state === 'current'
                      ? 'var(--ink)'
                      : 'white',
                  color:
                    state === 'done' || state === 'current' ? 'white' : 'var(--muted)',
                }}
              >
                {idx + 1}
              </div>
              <span className="small" style={{ fontWeight: state === 'current' ? 700 : 500 }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div
        aria-label={progressLabel}
        style={{
          width: '100%',
          height: 10,
          borderRadius: 999,
          border: '1px solid var(--border)',
          background: 'white',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 220ms ease',
          }}
        />
      </div>
    </div>
  );
}