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
    <section className="card sw-analyze-hero" style={{ padding: 18, marginBottom: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="sw-analyze-hero-copy">
          <div className="badge primary">{badge}</div>
          <h1 className="section-title sw-display-title" style={{ marginTop: 10, marginBottom: 6 }}>
            {stepTitle}
          </h1>
          <p className="small muted sw-analyze-hero-text" style={{ margin: 0 }}>
            {helper}
          </p>
        </div>

        <div className="sw-analyze-hero-meta">
          <div className="small muted sw-analyze-hero-meta-label">{saveVersionLabel}</div>
          <div className="sw-analyze-hero-meta-value">{saveVersionValue}</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <StepProgress labels={labels} current={current} percent={percent} progressLabel={progressLabel} />
      </div>

      <div className="notice sw-progress-notice" style={{ marginTop: 12 }}>
        <div className="small">
          <strong>{percent}%</strong> - {progressLabel}
        </div>
      </div>
    </section>
  );
}
