'use client';

import type { CollectorState, Locale } from '@/components/analyze/types';
import type { ParticipantProfile, WeekSegment } from '@/components/analyze/types';
import ScoreCard from '@/components/analyze/ScoreCard';
import { FooterActions } from '@/components/analyze/FormBits';
import { useExplainability } from '@/components/analyze/explainability/ExplainabilityContext';
import ContributionBox from '@/components/analyze/contribution/ContributionBox';

function copy(locale: Locale) {
  if (locale === 'fr') {
    return {
      studyTitle: "Cadre de l'étude",
      studyText:
        "Score calculé localement. Contribution à l’étude ensuite (opt-in, consentement explicite). Pas un avis médical.",
      paper: 'Paper',
      explain: 'Explain',
      mainScore: 'Score principal',
      metricsTitle: 'Métriques clés',
      scheduleLabel: 'Agenda',
    };
  }
  if (locale === 'de') {
    return {
      studyTitle: 'Studienrahmen',
      studyText:
        'Score wird lokal berechnet. Optionaler Studienbeitrag danach (Opt-in, explizite Einwilligung). Kein medizinischer Rat.',
      paper: 'Paper',
      explain: 'Explain',
      mainScore: 'Hauptscore',
      metricsTitle: 'Schlüsselmetriken',
      scheduleLabel: 'Zeitplan',
    };
  }
  return {
    studyTitle: 'Study context',
    studyText:
      'Local-first scoring. Optional study contribution afterwards (opt-in, explicit consent). Not medical advice.',
    paper: 'Paper',
    explain: 'Explain',
    mainScore: 'Main score',
    metricsTitle: 'Key metrics',
    scheduleLabel: 'Schedule',
  };
}

function metricLabel(locale: Locale, key: string) {
  const fr: Record<string, string> = {
    'derived.totalSleepHours': 'Sommeil total (h)',
    'derived.nightWorkHours': 'Travail de nuit (h)',
    'derived.sleepDays': 'Jours avec sommeil',
    'derived.maxSleepGapHours': 'Plus grand gap sans sommeil (h)',
    schedule: 'Agenda',
  };
  const en: Record<string, string> = {
    'derived.totalSleepHours': 'Total sleep (h)',
    'derived.nightWorkHours': 'Night work (h)',
    'derived.sleepDays': 'Days with sleep',
    'derived.maxSleepGapHours': 'Longest sleep gap (h)',
    schedule: 'Schedule',
  };
  const de: Record<string, string> = {
    'derived.totalSleepHours': 'Schlaf total (h)',
    'derived.nightWorkHours': 'Nachtarbeit (h)',
    'derived.sleepDays': 'Tage mit Schlaf',
    'derived.maxSleepGapHours': 'Längste Schlaflücke (h)',
    schedule: 'Zeitplan',
  };

  const map = locale === 'fr' ? fr : locale === 'de' ? de : en;
  return map[key] ?? key;
}

export default function ResultsStep({
  t,
  locale,
  profile,
  workSegments,
  sleepSegments,
  scores,
  derived,
  payload,

  collector,
  setCollector,

  onCopyJson,
  onDownloadJson,

  onPrev,
  onResetAll,
}: {
  t: any;
  locale: Locale;

  profile: ParticipantProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];

  scores: { risk: number; sleep: number; adaptability: number };
  derived: any;

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
    'derived.totalSleepHours',
    'derived.nightWorkHours',
    'derived.sleepDays',
    'derived.maxSleepGapHours',
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

      {/* Scores */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 900, color: 'var(--ink-2)' }}>{t.resultsTitle}</div>
        <div className="small muted">
          {c.mainScore}: {t.scoreAdapt}
        </div>
      </div>

      <div style={{ marginTop: 12 }} />

      <div
        onClick={() => ex.openWithFocus({ kind: 'score', key: 'score.adaptability', label: t.scoreAdapt })}
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

      {/* Key metrics */}
      <div style={{ marginTop: 14 }}>
        <div className="small muted" style={{ fontWeight: 900, marginBottom: 8 }}>
          {c.metricsTitle}
        </div>

        <div className="row" style={{ gap: 8 }}>
          {metricKeys.map((k) => (
            <button
              key={k}
              type="button"
              className="btn ghost"
              onClick={() => ex.openWithFocus({ kind: 'metric', key: k, label: metricLabel(locale, k) })}
              title={k}
            >
              {metricLabel(locale, k)}
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

      {/* ✅ Contribution box */}
      <ContributionBox
        locale={locale}
        scoringVersion="proxy-v0.1"
        noticeVersion="v0.1"
        payload={payload}
        collector={collector}
        setCollector={setCollector}
        onCopyJson={onCopyJson}
        onDownloadJson={onDownloadJson}
        studyEmail={ "etude@etude.org"}
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