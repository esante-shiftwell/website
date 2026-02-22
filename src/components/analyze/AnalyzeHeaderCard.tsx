'use client';

import StepProgress from '@/components/analyze/StepProgress';

export default function AnalyzeHeaderCard({
  badge,
  stepTitle,
  helper,
  saveVersionLabel,
  saveVersionValue,
  labels,
  current,
  percent,
  progressLabel,
}: {
  badge: string;
  stepTitle: string;
  helper: string;
  saveVersionLabel: string;
  saveVersionValue: string;
  labels: readonly string[];
  current: number;
  percent: number;
  progressLabel: string;
}) {
  return (
    <section className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="badge primary">{badge}</div>
          <h1 className="section-title" style={{ marginTop: 8, marginBottom: 4 }}>
            {stepTitle}
          </h1>
          <p className="small muted" style={{ margin: 0 }}>
            {helper}
          </p>
        </div>

        <div className="small muted">
          {saveVersionLabel}: <strong>{saveVersionValue}</strong>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <StepProgress labels={labels} current={current} percent={percent} progressLabel={progressLabel} />
      </div>

      <div className="notice" style={{ marginTop: 12 }}>
        <div className="small">
          <strong>{percent}%</strong> — {progressLabel}
        </div>
      </div>
    </section>
  );
}