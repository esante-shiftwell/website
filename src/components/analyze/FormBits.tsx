import type { ReactNode } from 'react';

export function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="small" style={{ fontWeight: 600 }}>
        {label}
        {required ? <span style={{ color: '#b91c1c' }}> *</span> : null}
      </span>
      {children}
    </label>
  );
}

export function RangeInput({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="row" style={{ gap: 10, alignItems: 'center' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <div
        style={{
          minWidth: 28,
          textAlign: 'center',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '4px 6px',
          fontSize: 12,
          background: 'white',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function FooterActions({
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  canNext,
  requiredText,
  rightMeta,
  hideNext,
  extra,
}: {
  onPrev?: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
  canNext: boolean;
  requiredText?: string;
  rightMeta?: string;
  hideNext?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      {requiredText && !canNext && (
        <div className="notice" style={{ marginBottom: 10 }}>
          <div className="small">{requiredText}</div>
        </div>
      )}

      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div className="row">
          {onPrev ? (
            <button type="button" className="btn" onClick={onPrev}>
              {prevLabel}
            </button>
          ) : null}
          {!hideNext ? (
            <button
              type="button"
              className="btn primary"
              onClick={onNext}
              disabled={!canNext}
            >
              {nextLabel}
            </button>
          ) : null}
          {extra}
        </div>

        {rightMeta ? <div className="small muted">{rightMeta}</div> : null}
      </div>
    </div>
  );
}