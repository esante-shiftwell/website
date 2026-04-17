'use client';

import type { CollectorState, Locale } from '@/components/analyze/types';
import ScoreCard from '@/components/analyze/ScoreCard';
import { FooterActions } from '@/components/analyze/FormBits';
import { useExplainability } from '@/components/analyze/explainability/ExplainabilityContext';
import ContributionBox from '@/components/analyze/contribution/ContributionBox';

type ResultsText = {
  resultsTitle: string;
  scoreAdapt: string;
  scoreSleep: string;
  scoreRisk: string;
  adaptHint: string;
  sleepHint: string;
  riskHint: string;
  scoreScaleLow: string;
  scoreScaleHigh: string;
  previous: string;
  finish: string;
  resetAll: string;
};

function copy(locale: Locale) {
  if (locale === 'fr') {
    return {
      studyTitle: "Cadre de l'etude",
      studyText:
        "Score calcule localement. Contribution a l'etude ensuite (opt-in, consentement explicite). Pas un avis medical. Les references externes restent des oeuvres tierces.",
      paper: 'Reference externe',
      explain: 'Explain',
      mainScore: 'Score principal',
      metricsTitle: 'Metriques cles',
      scheduleLabel: 'Agenda',
      formulaVersion: 'Version de formule',
      formulaNote: "Cette explicabilite correspond a la version runtime actuellement active.",
    };
  }
  if (locale === 'de') {
    return {
      studyTitle: 'Studienrahmen',
      studyText:
        'Score wird lokal berechnet. Optionaler Studienbeitrag danach (Opt-in, explizite Einwilligung). Keine medizinische Beratung. Externe Referenzen bleiben Drittquellen.',
      paper: 'Externe Referenz',
      explain: 'Explain',
      mainScore: 'Hauptscore',
      metricsTitle: 'Schlusselmetriken',
      scheduleLabel: 'Zeitplan',
      formulaVersion: 'Formelversion',
      formulaNote: 'Diese Erklarbarkeit entspricht der aktuell aktiven Runtime-Version.',
    };
  }
  return {
    studyTitle: 'Study context',
    studyText:
      'Local-first scoring. Optional study contribution afterwards (opt-in, explicit consent). Not medical advice. External references remain third-party works.',
    paper: 'External reference',
    explain: 'Explain',
    mainScore: 'Main score',
    metricsTitle: 'Key metrics',
    scheduleLabel: 'Schedule',
    formulaVersion: 'Formula version',
    formulaNote: 'This explainability view reflects the currently active runtime version.',
  };
}

function metricLabel(locale: Locale, key: string) {
  const fr: Record<string, string> = {
    'derived.totalWorkHours': 'Travail total (h)',
    'derived.totalSleepHours': 'Sommeil total (h)',
    'derived.nightShiftCount': 'Shifts de nuit',
    'derived.biologicalHoursLost': 'Heures biologiques perdues',
    schedule: 'Agenda',
  };
  const en: Record<string, string> = {
    'derived.totalWorkHours': 'Total work (h)',
    'derived.totalSleepHours': 'Total sleep (h)',
    'derived.nightShiftCount': 'Night shifts',
    'derived.biologicalHoursLost': 'Biological hours lost',
    schedule: 'Schedule',
  };
  const de: Record<string, string> = {
    'derived.totalWorkHours': 'Arbeit gesamt (h)',
    'derived.totalSleepHours': 'Schlaf total (h)',
    'derived.nightShiftCount': 'Nachtschichten',
    'derived.biologicalHoursLost': 'Biologische Stunden verloren',
    schedule: 'Zeitplan',
  };

  const map = locale === 'fr' ? fr : locale === 'de' ? de : en;
  return map[key] ?? key;
}

export default function ResultsStep({
  t,
  locale,
  scores,
  scoringVersion,
  payload,
  collector,
  setCollector,
  onCopyJson,
  onDownloadJson,
  onPrev,
  onResetAll,
}: {
  t: ResultsText;
  locale: Locale;
  scores: { risk: number; sleep: number; adaptability: number };
  scoringVersion: string;
  payload: unknown;
  collector: CollectorState;
  setCollector: (updater: (c: CollectorState) => CollectorState) => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  onPrev: () => void;
  onResetAll: () => void;
}) {
  const c = copy(locale);
  const ex = useExplainability();

  const metricKeys = [
    'derived.totalWorkHours',
    'derived.totalSleepHours',
    'derived.nightShiftCount',
    'derived.biologicalHoursLost',
  ] as const;

  return (
    <section className="card" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="badge secondary">{c.studyTitle}</div>
          <h2 className="section-title" style={{ fontSize: 18, marginTop: 10 }}>
            {c.studyTitle}
          </h2>
          <p className="small muted" style={{ marginTop: 8 }}>
            {c.studyText}
          </p>
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <span className="badge warn">
              {c.formulaVersion}: {scoringVersion}
            </span>
            <span className="small muted">{c.formulaNote}</span>
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <a
            className="btn ghost"
            href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full"
            target="_blank"
            rel="noreferrer"
          >
            {c.paper}
          </a>

          <button
            type="button"
            className="btn"
            onClick={() =>
              ex.openWithFocus({
                kind: 'score',
                key: 'score.adaptability',
                label: t.scoreAdapt,
              })
            }
          >
            {c.explain}
          </button>
        </div>
      </div>

      <div className="divider" />

      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 900, color: 'var(--ink-2)' }}>{t.resultsTitle}</div>
        <div className="small muted">
          {c.mainScore}: {t.scoreAdapt}
        </div>
      </div>

      <div style={{ marginTop: 12 }} />

      <div
        onClick={() =>
          ex.openWithFocus({ kind: 'score', key: 'score.adaptability', label: t.scoreAdapt })
        }
        style={{ cursor: 'pointer' }}
      >
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

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div
          onClick={() => ex.openWithFocus({ kind: 'score', key: 'score.sleep', label: t.scoreSleep })}
          style={{ cursor: 'pointer' }}
        >
          <ScoreCard
            label={t.scoreSleep}
            value={scores.sleep}
            hint={t.sleepHint}
            inverse
            lowLabel={t.scoreScaleLow}
            highLabel={t.scoreScaleHigh}
          />
        </div>

        <div
          onClick={() => ex.openWithFocus({ kind: 'score', key: 'score.risk', label: t.scoreRisk })}
          style={{ cursor: 'pointer' }}
        >
          <ScoreCard
            label={t.scoreRisk}
            value={scores.risk}
            hint={t.riskHint}
            inverse={false}
            lowLabel={t.scoreScaleLow}
            highLabel={t.scoreScaleHigh}
          />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="small muted" style={{ fontWeight: 900, marginBottom: 8 }}>
          {c.metricsTitle}
        </div>

        <div className="row" style={{ gap: 8 }}>
          {metricKeys.map((key) => (
            <button
              key={key}
              type="button"
              className="btn ghost"
              onClick={() => ex.openWithFocus({ kind: 'metric', key, label: metricLabel(locale, key) })}
              title={key}
            >
              {metricLabel(locale, key)}
            </button>
          ))}

          <button
            type="button"
            className="btn ghost"
            onClick={() => ex.openWithFocus({ kind: 'schedule', key: 'schedule', label: c.scheduleLabel })}
            title="schedule"
          >
            {c.scheduleLabel}
          </button>
        </div>
      </div>

      <ContributionBox
        locale={locale}
        scoringVersion="proxy-v0.1"
        noticeVersion="v0.1"
        payload={payload}
        collector={collector}
        setCollector={setCollector}
        onCopyJson={onCopyJson}
        onDownloadJson={onDownloadJson}
        studyEmail="etude@etude.org"
      />

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
