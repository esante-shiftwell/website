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
          const isDone = state === 'done';
          const isCurrent = state === 'current';
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                border: `1px solid ${
                  isCurrent
                    ? 'rgba(121, 242, 234, 0.72)'
                    : isDone
                      ? 'rgba(121, 242, 234, 0.34)'
                      : 'rgba(166, 202, 255, 0.16)'
                }`,
                background:
                  isCurrent
                    ? 'linear-gradient(135deg, rgba(121, 242, 234, 0.18), rgba(255, 79, 163, 0.10))'
                    : isDone
                      ? 'rgba(121, 242, 234, 0.10)'
                      : 'rgba(255, 255, 255, 0.035)',
                color: isCurrent || isDone ? 'var(--ink-2)' : 'rgba(207, 221, 245, 0.72)',
                boxShadow: isCurrent ? '0 0 0 1px rgba(121, 242, 234, 0.12)' : 'none',
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
                    isDone
                      ? 'var(--primary)'
                      : isCurrent
                        ? 'rgba(238, 246, 255, 0.96)'
                        : 'rgba(255, 255, 255, 0.06)',
                  color: isDone ? '#04111f' : isCurrent ? '#07111f' : 'rgba(207, 221, 245, 0.74)',
                }}
              >
                {idx + 1}
              </div>
              <span className="small" style={{ fontWeight: isCurrent ? 800 : 600 }}>
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
          background: 'rgba(255, 255, 255, 0.08)',
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
