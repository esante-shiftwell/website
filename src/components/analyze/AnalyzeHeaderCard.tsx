'use client';

import StepProgress from '@/components/analyze/StepProgress';

export default function AnalyzeHeaderCard({
  badge,
  title,
  stepTitle,
  helper,
  saveVersionLabel,
  saveVersionValue,
  currentStepLabel,
  assurances,
  labels,
  current,
  percent,
  progressLabel,
}: {
  badge: string;
  title: string;
  stepTitle: string;
  helper: string;
  saveVersionLabel: string;
  saveVersionValue: string;
  currentStepLabel: string;
  assurances: readonly string[];
  labels: readonly string[];
  current: number;
  percent: number;
  progressLabel: string;
}) {
  return (
    <section className="sw-analyze-hero">
      <div className="sw-analyze-hero-grid">
        <div className="sw-analyze-hero-copy">
          <div className="badge primary">{badge}</div>
          <h1 className="section-title sw-display-title" style={{ marginTop: 10, marginBottom: 6 }}>
            {title}
          </h1>
          <p className="small muted sw-analyze-hero-text" style={{ margin: 0 }}>
            {helper}
          </p>
          <div className="sw-analyze-assurances">
            {assurances.map((assurance) => (
              <span key={assurance}>{assurance}</span>
            ))}
          </div>
        </div>

        <div className="sw-analyze-hero-meta">
          <div className="small muted sw-analyze-hero-meta-label">{currentStepLabel}</div>
          <div className="sw-analyze-hero-step">{stepTitle}</div>
          <div className="small muted sw-analyze-hero-meta-label">{saveVersionLabel}</div>
          <div className="sw-analyze-hero-meta-value">{saveVersionValue}</div>
        </div>
      </div>

      <div className="sw-analyze-progress-shell">
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
