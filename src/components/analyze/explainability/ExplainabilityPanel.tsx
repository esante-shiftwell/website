'use client';

import { useMemo } from 'react';
import { useExplainability } from './ExplainabilityContext';
import { computeImpactForFocus } from './impact';

function uiStrings(locale: 'fr' | 'en' | 'de') {
  if (locale === 'fr') {
    return {
      title: 'Explicabilité',
      subtitle: 'Clique un champ, une métrique ou un score pour voir les impacts.',
      close: 'Fermer',
      focus: 'Focus',
      impacts: 'Impacts',
      simulated: 'Simulation',
      notUsed: 'Ce champ n’est pas (encore) utilisé par le scoring v0.1.',
      metric: (k: string) => {
        const map: Record<string, string> = {
          'profile.fatigue': 'Fatigue (auto)',
          'profile.schedulePredictability': 'Prévisibilité',
          'profile.commuteMinutes': 'Trajet',
          'schedule.workSegments': 'Segments travail',
          'schedule.sleepSegments': 'Segments sommeil',
          'derived.totalSleepHours': 'Sommeil total (h)',
          'derived.nightWorkHours': 'Travail de nuit (h)',
          'derived.sleepDays': 'Jours avec sommeil',
          'derived.maxSleepGapHours': 'Plus grand gap sans sommeil (h)',
          'score.risk': 'Score risque',
          'score.sleep': 'Score sommeil',
          'score.adaptability': 'Score adaptabilité',
        };
        return map[k] ?? k;
      },
      score: (k: 'risk' | 'sleep' | 'adaptability') =>
        k === 'risk' ? 'Risque' : k === 'sleep' ? 'Sommeil' : 'Adaptabilité',
      before: 'Avant',
      after: 'Après',
      delta: 'Δ',
      hint: 'Astuce : clique dans Résultats pour ouvrir sur le bon focus.',
    };
  }

  if (locale === 'de') {
    return {
      title: 'Erklärbarkeit',
      subtitle: 'Klicke ein Feld, eine Metrik oder einen Score, um Auswirkungen zu sehen.',
      close: 'Schließen',
      focus: 'Fokus',
      impacts: 'Auswirkungen',
      simulated: 'Simulation',
      notUsed: 'Dieses Feld wird (noch) nicht im Scoring v0.1 verwendet.',
      metric: (k: string) => {
        const map: Record<string, string> = {
          'profile.fatigue': 'Müdigkeit (selbst)',
          'profile.schedulePredictability': 'Planbarkeit',
          'profile.commuteMinutes': 'Pendeln',
          'schedule.workSegments': 'Arbeitssegmente',
          'schedule.sleepSegments': 'Schlafsegmente',
          'derived.totalSleepHours': 'Schlaf total (h)',
          'derived.nightWorkHours': 'Nachtarbeit (h)',
          'derived.sleepDays': 'Tage mit Schlaf',
          'derived.maxSleepGapHours': 'Längste Schlaflücke (h)',
          'score.risk': 'Risiko-Score',
          'score.sleep': 'Schlaf-Score',
          'score.adaptability': 'Anpassungs-Score',
        };
        return map[k] ?? k;
      },
      score: (k: 'risk' | 'sleep' | 'adaptability') =>
        k === 'risk' ? 'Risiko' : k === 'sleep' ? 'Schlaf' : 'Anpassung',
      before: 'Vorher',
      after: 'Nachher',
      delta: 'Δ',
      hint: 'Tipp: Klicke in Ergebnisse für den richtigen Fokus.',
    };
  }

  return {
    title: 'Explainability',
    subtitle: 'Click a field, a metric or a score to see impacts.',
    close: 'Close',
    focus: 'Focus',
    impacts: 'Impacts',
    simulated: 'Simulation',
    notUsed: 'This field is not (yet) used by scoring v0.1.',
    metric: (k: string) => {
      const map: Record<string, string> = {
        'profile.fatigue': 'Fatigue (self)',
        'profile.schedulePredictability': 'Predictability',
        'profile.commuteMinutes': 'Commute',
        'schedule.workSegments': 'Work segments',
        'schedule.sleepSegments': 'Sleep segments',
        'derived.totalSleepHours': 'Total sleep (h)',
        'derived.nightWorkHours': 'Night work (h)',
        'derived.sleepDays': 'Days with sleep',
        'derived.maxSleepGapHours': 'Longest sleep gap (h)',
        'score.risk': 'Risk score',
        'score.sleep': 'Sleep score',
        'score.adaptability': 'Adaptability score',
      };
      return map[k] ?? k;
    },
    score: (k: 'risk' | 'sleep' | 'adaptability') =>
      k === 'risk' ? 'Risk' : k === 'sleep' ? 'Sleep' : 'Adaptability',
    before: 'Before',
    after: 'After',
    delta: 'Δ',
    hint: 'Tip: click inside Results to open with the right focus.',
  };
}

export default function ExplainabilityPanel() {
  const ex = useExplainability();
  const ui = useMemo(() => uiStrings(ex.locale), [ex.locale]);

  const impact = useMemo(
    () =>
      computeImpactForFocus(ex.focus, ex.state, ex.computeScores, {
        metric: ui.metric,
        score: ui.score,
        notUsed: ui.notUsed,
      }),
    [ex.focus, ex.state, ex.computeScores, ui],
  );

  const sim = impact.simulatedDelta;

  if (!ex.isOpen) return null;

  return (
    <div className="sw-explain-overlay" onMouseDown={ex.close} role="presentation">
      <aside
        className="sw-explain-panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sw-explain-head">
          <div>
            <div className="sw-explain-title">{ui.title}</div>
            <div className="sw-explain-sub">{ui.subtitle}</div>
          </div>
          <button type="button" className="btn ghost" onClick={ex.close}>
            {ui.close}
          </button>
        </div>

        <div className="divider" />

        <section className="sw-explain-block">
          <div className="sw-explain-k">{ui.focus}</div>
          <div className="sw-explain-v">
            {ex.focus ? (
              <>
                <span className="badge secondary">{ex.focus.kind}</span>
                <span className="sw-explain-strong">{ex.focus.label ?? ex.focus.key}</span>
                <div className="small muted" style={{ marginTop: 6 }}>
                  scoring: <strong>{ex.state.scoringVersion}</strong>
                </div>
              </>
            ) : (
              <div className="small muted">{ui.hint}</div>
            )}
          </div>
        </section>

        <section className="sw-explain-block">
          <div className="sw-explain-k">{ui.impacts}</div>
          <div className="sw-explain-v">
            {impact.scores.length ? (
              <div className="sw-explain-chips">
                {impact.scores.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className="sw-explain-chip"
                    onClick={() =>
                      ex.setFocus({
                        kind: 'score',
                        key: `score.${s.key}` as const,
                        label: s.label,
                      })
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : null}

            {impact.metrics.length ? (
              <div className="sw-explain-chips" style={{ marginTop: 10 }}>
                {impact.metrics.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className="sw-explain-chip ghost"
                    onClick={() => ex.setFocus({ kind: 'metric', key: m.key, label: m.label })}
                    title={m.key}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            ) : null}

            {impact.warnings?.length ? (
              <div className="notice warn" style={{ marginTop: 10 }}>
                <div className="small">{impact.warnings.join(' ')}</div>
              </div>
            ) : null}
          </div>
        </section>

        {sim ? (
          <section className="sw-explain-block">
            <div className="sw-explain-k">{ui.simulated}</div>
            <div className="sw-explain-v">
              <div className="badge primary">{sim.title}</div>

              <div className="sw-explain-table">
                <div className="sw-explain-row head">
                  <div />
                  <div>{ui.before}</div>
                  <div>{ui.after}</div>
                  <div>{ui.delta}</div>
                </div>

                {(['risk', 'sleep', 'adaptability'] as const).map((k) => (
                  <div key={k} className="sw-explain-row">
                    <div className="sw-explain-strong">{ui.score(k)}</div>
                    <div>{sim.before[k].toFixed(1)}</div>
                    <div>{sim.after[k].toFixed(1)}</div>
                    <div className={sim.delta[k] === 0 ? 'muted' : sim.delta[k] > 0 ? 'text-success' : 'text-danger'}>
                      {sim.delta[k] > 0 ? '+' : ''}
                      {sim.delta[k].toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>

              {sim.note ? (
                <div className="small muted" style={{ marginTop: 10 }}>
                  {sim.note}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}