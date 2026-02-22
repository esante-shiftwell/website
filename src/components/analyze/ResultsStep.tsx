'use client';

import type { CollectorState, Locale } from '@/components/analyze/types';
import DerivedMetricsList from '@/components/analyze/DerivedMetricsList';
import ResultsExplanations from '@/components/analyze/ResultsExplanations';
import ScoreCard from '@/components/analyze/ScoreCard';
import { Field, FooterActions } from '@/components/analyze/FormBits';

export default function ResultsStep({
  t,
  locale,
  scores,
  derived,
  collector,
  setCollector,
  sendStatus,
  onSend,
  onCopyJson,
  onDownloadJson,
  onPrev,
  onResetAll,
}: {
  t: any;
  locale: Locale;
  scores: any;
  derived: any;
  collector: CollectorState;
  setCollector: (updater: (c: CollectorState) => CollectorState) => void;
  sendStatus: { state: 'idle' | 'sending' | 'success' | 'error'; message?: string };
  onSend: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  onPrev: () => void;
  onResetAll: () => void;
}) {
  return (
    <section className="card" style={{ padding: 16 }}>
      <h2 className="section-title" style={{ fontSize: 18 }}>
        {t.resultsTitle}
      </h2>
      <p className="section-subtitle">{t.resultsSubtitle}</p>

      <div className="grid grid-3">
        <ScoreCard
          label={t.scoreRisk}
          value={scores.risk}
          hint={t.riskHint}
          inverse={false}
          lowLabel={t.scoreScaleLow}
          highLabel={t.scoreScaleHigh}
        />
        <ScoreCard
          label={t.scoreSleep}
          value={scores.sleep}
          hint={t.sleepHint}
          inverse
          lowLabel={t.scoreScaleLow}
          highLabel={t.scoreScaleHigh}
        />
        <ScoreCard
          label={t.scoreAdapt}
          value={scores.adaptability}
          hint={t.adaptHint}
          inverse
          lowLabel={t.scoreScaleLow}
          highLabel={t.scoreScaleHigh}
          highlight
        />
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card soft" style={{ padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>{t.derived}</h3>
          <DerivedMetricsList metrics={derived} locale={locale} />
        </section>

        <section className="card soft" style={{ padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>{t.explanations}</h3>
          <ResultsExplanations metrics={derived} scores={scores} locale={locale} />
          <div className="notice" style={{ marginTop: 12 }}>
            <div className="small">
              <strong>Note.</strong> {t.notMedical}
            </div>
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 14, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t.contribution}</h3>

        <div className="grid grid-2">
          <Field label={t.endpoint}>
            <input
              className="input"
              placeholder={t.endpointPlaceholder}
              value={collector.endpoint}
              onChange={(e) => setCollector((c) => ({ ...c, endpoint: e.target.value }))}
            />
          </Field>

          <div style={{ display: 'grid', gap: 8, alignContent: 'start', marginTop: 22 }}>
            <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={collector.consent}
                onChange={(e) => setCollector((c) => ({ ...c, consent: e.target.checked }))}
              />
              {t.consentCheck}
            </label>

            <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={collector.includeAnonymousId}
                onChange={(e) =>
                  setCollector((c) => ({ ...c, includeAnonymousId: e.target.checked }))
                }
              />
              {t.anonId}
            </label>
          </div>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" onClick={onSend} disabled={sendStatus.state === 'sending'}>
            {sendStatus.state === 'sending' ? '…' : t.sendData}
          </button>
          <button type="button" className="btn" onClick={onCopyJson}>
            {t.copyJson}
          </button>
          <button type="button" className="btn" onClick={onDownloadJson}>
            {t.exportJson}
          </button>
        </div>

        {sendStatus.state !== 'idle' && (
          <div className="notice" style={{ marginTop: 10 }}>
            <div className="small">
              <strong>
                {sendStatus.state === 'success'
                  ? t.sentOk
                  : sendStatus.state === 'error'
                  ? t.sentError
                  : '…'}
              </strong>
              {sendStatus.message ? ` — ${sendStatus.message}` : null}
            </div>
          </div>
        )}
      </section>

      <FooterActions
        onPrev={onPrev}
        onNext={() => {}}
        prevLabel={t.previous}
        nextLabel={t.finish}
        canNext
        hideNext
        extra={
          <button type="button" className="btn ghost" onClick={onResetAll}>
            {t.resetAll}
          </button>
        }
      />
    </section>
  );
}