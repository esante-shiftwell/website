'use client';

import { useMemo } from 'react';
import type { FactorEvaluation, ScoreEvaluation } from '@/core/model';
import { useExplainability } from './ExplainabilityContext';
import { computeImpactForFocus } from './impact';

function uiStrings(locale: 'fr' | 'en' | 'de') {
  if (locale === 'fr') {
    return {
      title: 'Explicabilite',
      subtitle: 'Clique un champ, une metrique ou un score pour voir la trace, les dependances et les references.',
      close: 'Fermer',
      focus: 'Focus',
      impacts: 'Impacts',
      formula: 'Formule',
      evidence: 'References',
      evidenceNote: 'References runtime et copies locales de travail',
      status: 'Statut',
      simulated: 'Simulation exploratoire',
      notUsed: "Ce champ n'est pas (encore) utilise par le scoring v0.1.",
      traceSummary: 'Trace runtime',
      versionNote: "Cette vue explique uniquement la version active du moteur.",
      currentValue: 'Valeur actuelle',
      contribution: 'Contribution',
      bucket: 'Bucket',
      dependsOn: 'Dependances',
      downstream: 'Scores impactes',
      locator: 'Locator',
      source: 'Source',
      fallback: 'Fallback UI',
      traceBacked: 'Trace-backed',
      noDeps: 'Aucune dependance structuree.',
      noEvidence: 'Aucune reference attachee.',
      metric: (key: string) => {
        const map: Record<string, string> = {
          workedHours: 'Heures travaillees',
          longShifts: 'Shifts longs',
          count24hBreaks: 'Pauses de 24h',
          longestRecovery: 'Recuperation max',
          shortBreaks: 'Pauses <11h',
          restDays: 'Jours de repos',
          fullyRestedDays: 'Jours reposants',
          nightShifts: 'Shifts de nuit',
          biologicalHoursLost: 'Heures biologiques perdues',
          socialHoursLost: 'Heures sociales perdues',
          sleepDuration: 'Duree de sommeil moyenne',
          sleepRegularityProxy: 'Regularite sommeil (proxy)',
          'profile.fatigue': 'Fatigue (auto)',
          'profile.schedulePredictability': 'Previsibilite',
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
          'derived.sleepRegularityProxy': 'Regularite sommeil (proxy)',
          'score.risk': 'Score risque',
          'score.sleep': 'Score sommeil',
          'score.adaptability': 'Score adaptabilite',
          riskScore: 'Score risque',
          sleepScore: 'Score sommeil',
          adaptabilityScore: 'Score adaptabilite',
        };
        return map[key] ?? key;
      },
      score: (key: 'risk' | 'sleep' | 'adaptability') =>
        key === 'risk' ? 'Risque' : key === 'sleep' ? 'Sommeil' : 'Adaptabilite',
      before: 'Avant',
      after: 'Apres',
      delta: 'Delta',
      hint: 'Astuce : clique dans Resultats pour ouvrir sur le bon focus.',
    };
  }

  if (locale === 'de') {
    return {
      title: 'Erklarbarkeit',
      subtitle: 'Klicke auf Feld, Metrik oder Score, um Trace, Abhangigkeiten und Referenzen zu sehen.',
      close: 'Schliessen',
      focus: 'Fokus',
      impacts: 'Auswirkungen',
      formula: 'Formel',
      evidence: 'Referenzen',
      evidenceNote: 'Runtime-Referenzen und lokale Arbeitskopien',
      status: 'Status',
      simulated: 'Explorative Simulation',
      notUsed: 'Dieses Feld wird im Scoring v0.1 noch nicht verwendet.',
      traceSummary: 'Runtime-Trace',
      versionNote: 'Diese Ansicht erklart nur die aktive Engine-Version.',
      currentValue: 'Aktueller Wert',
      contribution: 'Beitrag',
      bucket: 'Bucket',
      dependsOn: 'Abhangigkeiten',
      downstream: 'Betroffene Scores',
      locator: 'Locator',
      source: 'Quelle',
      fallback: 'UI-Fallback',
      traceBacked: 'Trace-backed',
      noDeps: 'Keine strukturierten Abhangigkeiten.',
      noEvidence: 'Keine Referenzen verknupft.',
      metric: (key: string) => {
        const map: Record<string, string> = {
          workedHours: 'Arbeitsstunden',
          longShifts: 'Lange Schichten',
          count24hBreaks: '24h-Pausen',
          longestRecovery: 'Max. Erholung',
          shortBreaks: 'Pausen <11h',
          restDays: 'Ruhetage',
          fullyRestedDays: 'Erholte Tage',
          nightShifts: 'Nachtschichten',
          biologicalHoursLost: 'Biologische Stunden verloren',
          socialHoursLost: 'Soziale Stunden verloren',
          sleepDuration: 'Mittlere Schlafdauer',
          sleepRegularityProxy: 'Schlafregelmassigkeit (Proxy)',
          'profile.fatigue': 'Mudigkeit (selbst)',
          'profile.schedulePredictability': 'Planbarkeit',
          'profile.commuteMinutes': 'Pendeln',
          'schedule.workSegments': 'Arbeitssegmente',
          'schedule.sleepSegments': 'Schlafsegmente',
          'derived.totalWorkHours': 'Arbeit gesamt (h)',
          'derived.totalSleepHours': 'Schlaf total (h)',
          'derived.avgSleepHours': 'Durchschnittsschlaf (h)',
          'derived.longShiftCount': 'Lange Schichten',
          'derived.shortBreaksCount': 'Pausen <11h',
          'derived.nightShiftCount': 'Nachtschichten',
          'derived.biologicalHoursLost': 'Biologische Stunden verloren',
          'derived.socialHoursLost': 'Soziale Stunden verloren',
          'derived.sleepRegularityProxy': 'Schlafregelmassigkeit (Proxy)',
          'score.risk': 'Risiko-Score',
          'score.sleep': 'Schlaf-Score',
          'score.adaptability': 'Anpassungs-Score',
          riskScore: 'Risiko-Score',
          sleepScore: 'Schlaf-Score',
          adaptabilityScore: 'Anpassungs-Score',
        };
        return map[key] ?? key;
      },
      score: (key: 'risk' | 'sleep' | 'adaptability') =>
        key === 'risk' ? 'Risiko' : key === 'sleep' ? 'Schlaf' : 'Anpassung',
      before: 'Vorher',
      after: 'Nachher',
      delta: 'Delta',
      hint: 'Tipp: Klicke in Ergebnisse fur den richtigen Fokus.',
    };
  }

  return {
    title: 'Explainability',
    subtitle: 'Click a field, a metric or a score to inspect trace, dependencies, and references.',
    close: 'Close',
    focus: 'Focus',
    impacts: 'Impacts',
    formula: 'Formula',
    evidence: 'References',
    evidenceNote: 'Runtime references and local working copies',
    status: 'Status',
    simulated: 'Exploratory simulation',
    notUsed: 'This field is not (yet) used by scoring v0.1.',
    traceSummary: 'Runtime trace',
    versionNote: 'This view explains the active engine version only.',
    currentValue: 'Current value',
    contribution: 'Contribution',
    bucket: 'Bucket',
    dependsOn: 'Dependencies',
    downstream: 'Downstream scores',
    locator: 'Locator',
    source: 'Source',
    fallback: 'UI fallback',
    traceBacked: 'Trace-backed',
    noDeps: 'No structured dependencies.',
    noEvidence: 'No references attached.',
    metric: (key: string) => {
      const map: Record<string, string> = {
        workedHours: 'Worked hours',
        longShifts: 'Long shifts',
        count24hBreaks: '24h breaks',
        longestRecovery: 'Longest recovery',
        shortBreaks: 'Breaks <11h',
        restDays: 'Rest days',
        fullyRestedDays: 'Rested days',
        nightShifts: 'Night shifts',
        biologicalHoursLost: 'Biological hours lost',
        socialHoursLost: 'Social hours lost',
        sleepDuration: 'Average sleep duration',
        sleepRegularityProxy: 'Sleep regularity (proxy)',
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
        riskScore: 'Risk score',
        sleepScore: 'Sleep score',
        adaptabilityScore: 'Adaptability score',
      };
      return map[key] ?? key;
    },
    score: (key: 'risk' | 'sleep' | 'adaptability') =>
      key === 'risk' ? 'Risk' : key === 'sleep' ? 'Sleep' : 'Adaptability',
    before: 'Before',
    after: 'After',
    delta: 'Delta',
    hint: 'Tip: click inside Results to open with the right focus.',
  };
}

function statusTone(status?: string) {
  if (status === 'implemented') return 'primary';
  if (status === 'proxy') return 'secondary';
  return 'warn';
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatTraceValue(key: string, value: number) {
  const lower = key.toLowerCase();
  if (lower.includes('score') || lower.includes('regularity')) return formatNumber(value);
  if (lower.includes('hours') || lower.includes('duration') || lower.includes('recovery')) {
    return `${formatNumber(value)}h`;
  }
  return formatNumber(value);
}

function getDependencyValue(key: string, state: ReturnType<typeof useExplainability>['state']) {
  if (key === 'riskScore') return formatNumber(state.scores.risk);
  if (key === 'sleepScore') return formatNumber(state.scores.sleep);
  if (key === 'adaptabilityScore') return formatNumber(state.scores.adaptability);

  if (key.startsWith('derived.')) {
    const derivedKey = key.replace('derived.', '');
    const record = state.derived as unknown as Record<string, unknown>;
    const value = record[derivedKey];
    return typeof value === 'number' ? formatTraceValue(key, value) : '--';
  }

  if (key === 'schedule.workSegments') return String(state.workSegments.length);
  if (key === 'schedule.sleepSegments') return String(state.sleepSegments.length);

  const factor = state.trace.factors.find((item) => item.key === key);
  if (factor) return formatTraceValue(factor.key, factor.value);

  return '--';
}

function toUiScoreKey(key: ScoreEvaluation['key']): 'risk' | 'sleep' | 'adaptability' {
  if (key === 'riskScore') return 'risk';
  if (key === 'sleepScore') return 'sleep';
  return 'adaptability';
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

  const activeTrace = useMemo(() => {
    if (!ex.focus) return null;
    if (ex.focus.kind === 'score') {
      const scoreKey =
        ex.focus.key === 'score.risk'
          ? 'riskScore'
          : ex.focus.key === 'score.sleep'
            ? 'sleepScore'
            : 'adaptabilityScore';
      return ex.state.trace.scores.find((entry) => entry.key === scoreKey) ?? null;
    }

    if (ex.focus.kind === 'metric') {
      const metricKey = ex.focus.key.replace(/^derived\./, '');
      return (
        ex.state.trace.factors.find(
          (entry) => entry.key === metricKey || `derived.${entry.key}` === ex.focus?.key,
        ) ?? null
      );
    }

    return null;
  }, [ex.focus, ex.state.trace.factors, ex.state.trace.scores]);

  const dependencyRows = useMemo(() => {
    if (!activeTrace) return [];
    return activeTrace.dependsOn.map((dep) => ({
      key: dep,
      label: dep.endsWith('Score') ? ui.metric(dep) : ui.metric(dep),
      value: getDependencyValue(dep, ex.state),
      focus:
        dep === 'riskScore'
          ? ({ kind: 'score', key: 'score.risk', label: ui.score('risk') } as const)
          : dep === 'sleepScore'
            ? ({ kind: 'score', key: 'score.sleep', label: ui.score('sleep') } as const)
            : dep === 'adaptabilityScore'
              ? ({ kind: 'score', key: 'score.adaptability', label: ui.score('adaptability') } as const)
              : dep.startsWith('derived.')
                ? ({ kind: 'metric', key: dep, label: ui.metric(dep) } as const)
                : null,
    }));
  }, [activeTrace, ex.state, ui]);

  const downstreamRows = useMemo(() => {
    if (!activeTrace || 'value' in activeTrace === false) return [];
    if ('label' in activeTrace && 'formulaRef' in activeTrace && 'dependsOn' in activeTrace) {
      if ((activeTrace as ScoreEvaluation).key) {
        const score = activeTrace as ScoreEvaluation;
        return [
          {
            key: score.key,
            label: ui.score(toUiScoreKey(score.key)),
            value: formatNumber(score.value),
            focus: {
              kind: 'score' as const,
              key: `score.${toUiScoreKey(score.key)}` as const,
              label: ui.score(toUiScoreKey(score.key)),
            },
          },
        ];
      }
    }

    const factor = activeTrace as FactorEvaluation;
    return ex.state.trace.scores
      .filter((score) => score.dependsOn.includes(factor.key))
      .map((score) => ({
        key: score.key,
        label: ui.score(toUiScoreKey(score.key)),
        value: formatNumber(score.value),
        focus: {
          kind: 'score' as const,
          key: `score.${toUiScoreKey(score.key)}` as const,
          label: ui.score(toUiScoreKey(score.key)),
        },
      }));
  }, [activeTrace, ex.state.trace.scores, ui]);

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
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span className="badge secondary">{ex.focus.kind}</span>
                  {activeTrace ? (
                    <span className={`badge ${statusTone(activeTrace.status)}`}>{activeTrace.status}</span>
                  ) : null}
                  {activeTrace ? <span className="badge ghost">{ui.traceBacked}</span> : null}
                </div>
                <div className="sw-explain-strong" style={{ marginLeft: 0, marginTop: 8 }}>
                  {ex.focus.label ?? ex.focus.key}
                </div>
                <div className="small muted" style={{ marginTop: 6 }}>
                  scoring: <strong>{ex.state.scoringVersion}</strong>
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>
                  {ui.versionNote}
                </div>
              </>
            ) : (
              <div className="small muted">{ui.hint}</div>
            )}
          </div>
        </section>

        {activeTrace ? (
          <section className="sw-explain-block">
            <div className="sw-explain-k">{ui.traceSummary}</div>
            <div className="sw-explain-v">
              <div className="sw-explain-summary-grid">
                <div className="sw-explain-summary-card">
                  <div className="small muted">{ui.currentValue}</div>
                  <div className="sw-explain-summary-value">
                    {formatTraceValue(activeTrace.key, activeTrace.value)}
                  </div>
                </div>

                {'contribution' in activeTrace && activeTrace.contribution != null ? (
                  <div className="sw-explain-summary-card">
                    <div className="small muted">{ui.contribution}</div>
                    <div className="sw-explain-summary-value">{formatNumber(activeTrace.contribution)}</div>
                  </div>
                ) : null}

                {'bucket' in activeTrace && activeTrace.bucket != null ? (
                  <div className="sw-explain-summary-card">
                    <div className="small muted">{ui.bucket}</div>
                    <div className="sw-explain-summary-value">{activeTrace.bucket}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="sw-explain-block">
          <div className="sw-explain-k">{ui.impacts}</div>
          <div className="sw-explain-v">
            {downstreamRows.length ? (
              <div className="sw-explain-list">
                {downstreamRows.map((score) => (
                  <button
                    key={score.key}
                    type="button"
                    className="sw-explain-list-row"
                    onClick={() => ex.setFocus(score.focus)}
                  >
                    <span className="sw-explain-list-main">{score.label}</span>
                    <span className="sw-explain-list-side">{score.value}</span>
                  </button>
                ))}
              </div>
            ) : impact.scores.length ? (
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
                <div className="small" style={{ fontWeight: 700, marginBottom: 4 }}>
                  {ui.fallback}
                </div>
                <div className="small">{impact.warnings.join(' ')}</div>
              </div>
            ) : null}
          </div>
        </section>

        {activeTrace?.dependsOn?.length ? (
          <section className="sw-explain-block">
            <div className="sw-explain-k">{ui.dependsOn}</div>
            <div className="sw-explain-v">
              <div className="sw-explain-list">
                {dependencyRows.map((dep) => (
                  <button
                    key={dep.key}
                    type="button"
                    className="sw-explain-list-row"
                    onClick={() => dep.focus && ex.setFocus(dep.focus)}
                    disabled={!dep.focus}
                  >
                    <span className="sw-explain-list-main">{dep.label}</span>
                    <span className="sw-explain-list-side">{dep.value}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : activeTrace ? (
          <section className="sw-explain-block">
            <div className="sw-explain-k">{ui.dependsOn}</div>
            <div className="sw-explain-v">
              <div className="small muted">{ui.noDeps}</div>
            </div>
          </section>
        ) : null}

        {impact.formulaRef ? (
          <section className="sw-explain-block">
            <div className="sw-explain-k">{ui.formula}</div>
            <div className="sw-explain-v">
              <div className="small">
                <code>{impact.formulaRef}</code>
              </div>
              {impact.status ? (
                <div className="small muted" style={{ marginTop: 8 }}>
                  {ui.status}: <strong>{impact.status}</strong>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="sw-explain-block">
          <div className="sw-explain-k">{ui.evidence}</div>
          <div className="sw-explain-v">
            {impact.evidence?.length ? (
              <>
                <div className="small muted" style={{ marginBottom: 8 }}>
                  {ui.evidenceNote}
                </div>
                <div className="grid" style={{ gap: 8 }}>
                  {impact.evidence.map((item) => (
                    <div key={item.id} className="card soft" style={{ padding: 10 }}>
                      <div className="small" style={{ fontWeight: 700 }}>
                        {item.title}
                      </div>
                      <div className="small muted" style={{ marginTop: 4 }}>
                        {ui.source}: {item.sourceType} · {item.source}
                      </div>
                      <div className="small muted" style={{ marginTop: 4 }}>
                        {ui.locator}: {item.resolvedLocator}
                      </div>
                      {item.href ? (
                        <div className="small" style={{ marginTop: 4 }}>
                          <a href={item.href} target="_blank" rel="noreferrer">
                            {item.href}
                          </a>
                        </div>
                      ) : null}
                      {item.resolvedNote ? (
                        <div className="small muted" style={{ marginTop: 4 }}>
                          {item.resolvedNote}
                        </div>
                      ) : null}
                      {item.quote ? (
                        <div className="small muted" style={{ marginTop: 4 }}>
                          <code>{item.quote}</code>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="small muted">{ui.noEvidence}</div>
            )}
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
