'use client';

import { useMemo } from 'react';
import { useExplainability } from './ExplainabilityContext';
import { computeImpactForFocus } from './impact';

function uiStrings(locale: 'fr' | 'en' | 'de') {
  if (locale === 'fr') {
    return {
      title: 'ExplicabilitÃ©',
      subtitle: 'Clique un champ, une mÃ©trique ou un score pour voir les impacts.',
      close: 'Fermer',
      focus: 'Focus',
      impacts: 'Impacts',
      simulated: 'Simulation exploratoire',
      notUsed: 'Ce champ nâ€™est pas (encore) utilisÃ© par le scoring v0.1.',
      metric: (key: string) => {
        const map: Record<string, string> = {
          'profile.fatigue': 'Fatigue (auto)',
          'profile.schedulePredictability': 'PrÃ©visibilitÃ©',
          'profile.commuteMinutes': 'Trajet',
          'schedule.workSegments': 'Segments travail',
          'schedule.sleepSegments': 'Segments sommeil',
          'derived.totalWorkHours': 'Travail total (h)',
          'derived.totalSleepHours': 'Sommeil total (h)',
          'derived.avgSleepHours': 'Sommeil moyen (h)',
          'derived.longShiftCount': 'Shifts longs',
          'derived.shortBreaksCount': 'Pauses <11h',
          'derived.nightShiftCount': 'Shifts de nuit',
          'derived.biologicalHoursLost': 'Heures biologiques perdues',
          'derived.socialHoursLost': 'Heures sociales perdues',
          'derived.sleepRegularityProxy': 'RÃ©gularitÃ© sommeil (proxy)',
          'score.risk': 'Score risque',
          'score.sleep': 'Score sommeil',
          'score.adaptability': 'Score adaptabilitÃ©',
        };
        return map[key] ?? key;
      },
      score: (key: 'risk' | 'sleep' | 'adaptability') =>
        key === 'risk' ? 'Risque' : key === 'sleep' ? 'Sommeil' : 'AdaptabilitÃ©',
      before: 'Avant',
      after: 'AprÃ¨s',
      delta: 'Î”',
      hint: 'Astuce : clique dans RÃ©sultats pour ouvrir sur le bon focus.',
    };
  }

  if (locale === 'de') {
    return {
      title: 'ErklÃ¤rbarkeit',
      subtitle: 'Klicke ein Feld, eine Metrik oder einen Score, um Auswirkungen zu sehen.',
      close: 'SchlieÃŸen',
      focus: 'Fokus',
      impacts: 'Auswirkungen',
      simulated: 'Explorative Simulation',
      notUsed: 'Dieses Feld wird (noch) nicht im Scoring v0.1 verwendet.',
      metric: (key: string) => {
        const map: Record<string, string> = {
          'profile.fatigue': 'MÃ¼digkeit (selbst)',
          'profile.schedulePredictability': 'Planbarkeit',
          'profile.commuteMinutes': 'Pendeln',
          'schedule.workSegments': 'Arbeitssegmente',
          'schedule.sleepSegments': 'Schlafsegmente',
          'derived.totalWorkHours': 'Arbeit gesamt (h)',
          'derived.totalSleepHours': 'Schlaf total (h)',
          'derived.avgSleepHours': 'Ø Schlaf (h)',
          'derived.longShiftCount': 'Lange Schichten',
          'derived.shortBreaksCount': 'Pausen <11h',
          'derived.nightShiftCount': 'Nachtschichten',
          'derived.biologicalHoursLost': 'Biologische Stunden verloren',
          'derived.socialHoursLost': 'Soziale Stunden verloren',
          'derived.sleepRegularityProxy': 'SchlafregelmÃ¤ÃŸigkeit (Proxy)',
          'score.risk': 'Risiko-Score',
          'score.sleep': 'Schlaf-Score',
          'score.adaptability': 'Anpassungs-Score',
        };
        return map[key] ?? key;
      },
      score: (key: 'risk' | 'sleep' | 'adaptability') =>
        key === 'risk' ? 'Risiko' : key === 'sleep' ? 'Schlaf' : 'Anpassung',
      before: 'Vorher',
      after: 'Nachher',
      delta: 'Î”',
      hint: 'Tipp: Klicke in Ergebnisse fÃ¼r den richtigen Fokus.',
    };
  }

  return {
    title: 'Explainability',
    subtitle: 'Click a field, a metric or a score to see impacts.',
    close: 'Close',
    focus: 'Focus',
    impacts: 'Impacts',
    simulated: 'Exploratory simulation',
    notUsed: 'This field is not (yet) used by scoring v0.1.',
    metric: (key: string) => {
      const map: Record<string, string> = {
        'profile.fatigue': 'Fatigue (self)',
        'profile.schedulePredictability': 'Predictability',
        'profile.commuteMinutes': 'Commute',
        'schedule.workSegments': 'Work segments',
        'schedule.sleepSegments': 'Sleep segments',
        'derived.totalWorkHours': 'Total work (h)',
        'derived.totalSleepHours': 'Total sleep (h)',
        'derived.avgSleepHours': 'Average sleep (h)',
        'derived.longShiftCount': 'Long shifts',
        'derived.shortBreaksCount': 'Breaks <11h',
        'derived.nightShiftCount': 'Night shifts',
        'derived.biologicalHoursLost': 'Biological hours lost',
        'derived.socialHoursLost': 'Social hours lost',
        'derived.sleepRegularityProxy': 'Sleep regularity (proxy)',
        'score.risk': 'Risk score',
        'score.sleep': 'Sleep score',
        'score.adaptability': 'Adaptability score',
      };
      return map[key] ?? key;
    },
    score: (key: 'risk' | 'sleep' | 'adaptability') =>
      key === 'risk' ? 'Risk' : key === 'sleep' ? 'Sleep' : 'Adaptability',
    before: 'Before',
    after: 'After',
    delta: 'Î”',
    hint: 'Tip: click inside Results to open with the right focus.',
  };
}

export default function ExplainabilityPanel() {
  const ex = useExplainability();
  const ui = useMemo(() => uiStrings(ex.locale), [ex.locale]);

  const impact = useMemo(
    () =>
      computeImpactForFocus(ex.focus, ex.state, ex.recomputeScores, {
        metric: ui.metric,
        score: ui.score,
        notUsed: ui.notUsed,
      }),
    [ex.focus, ex.recomputeScores, ex.state, ui],
  );

  const sim = impact.simulatedDelta;

  if (!ex.isOpen) return null;

  return (
    <div className="sw-explain-overlay" onMouseDown={ex.close} role="presentation">
      <aside
        className="sw-explain-panel"
        onMouseDown={(event) => event.stopPropagation()}
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
                {impact.scores.map((score) => (
                  <button
                    key={score.key}
                    type="button"
                    className="sw-explain-chip"
                    onClick={() =>
                      ex.setFocus({
                        kind: 'score',
                        key: `score.${score.key}` as const,
                        label: score.label,
                      })
                    }
                  >
                    {score.label}
                  </button>
                ))}
              </div>
            ) : null}

            {impact.metrics.length ? (
              <div className="sw-explain-chips" style={{ marginTop: 10 }}>
                {impact.metrics.map((metric) => (
                  <button
                    key={metric.key}
                    type="button"
                    className="sw-explain-chip ghost"
                    onClick={() => ex.setFocus({ kind: 'metric', key: metric.key, label: metric.label })}
                    title={metric.key}
                  >
                    {metric.label}
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

                {(['risk', 'sleep', 'adaptability'] as const).map((key) => (
                  <div key={key} className="sw-explain-row">
                    <div className="sw-explain-strong">{ui.score(key)}</div>
                    <div>{sim.before[key].toFixed(1)}</div>
                    <div>{sim.after[key].toFixed(1)}</div>
                    <div
                      className={
                        sim.delta[key] === 0
                          ? 'muted'
                          : sim.delta[key] > 0
                            ? 'text-success'
                            : 'text-danger'
                      }
                    >
                      {sim.delta[key] > 0 ? '+' : ''}
                      {sim.delta[key].toFixed(1)}
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
