'use client';

import { useMemo, useState } from 'react';

import { TEXT, isLocale } from '@/components/analyze/copy';
import type { Locale, WeekSegment } from '@/components/analyze/types';
import { getOrCreateAnonymousId, getProfileCompletion } from '@/components/analyze/utils';
import { analyzeUiSchedule } from '@/lib/analyzeCoreBridge';

import LocaleNav from './LocaleNav';
import AnalyzeHeaderCard from '@/components/analyze/AnalyzeHeaderCard';
import CombinedScheduleStep from '@/components/analyze/CombinedScheduleStep';
import ProfileStep from '@/components/analyze/ProfileStep';
import ResultsStep from '@/components/analyze/ResultsStep';

import type { DayPartSegment } from '@/components/analyze/calendar/scheduleUtils';
import { useAnalyzeDraft } from '@/components/analyze/useAnalyzeDraft';
import { useScheduleUi } from '@/components/analyze/useScheduleUi';

import { ExplainabilityProvider } from '@/components/analyze/explainability/ExplainabilityContext';
import ExplainabilityPanel from '@/components/analyze/explainability/ExplainabilityPanel';

type AnalyzeClientProps = {
  locale: string;
  dict?: unknown;
};

function dayPartsToWeekSegments(segs: DayPartSegment[]): WeekSegment[] {
  return segs.map((s) => ({
    id: s.id,
    day: s.day,
    startMin: s.startMin,
    endMin: s.endMin,
    overnight: false,
  }));
}

function copiedAlert(locale: Locale) {
  if (locale === 'fr') return 'JSON copiÃ©';
  if (locale === 'de') return 'JSON kopiert';
  return 'JSON copied';
}

function copyFailedAlert(locale: Locale) {
  if (locale === 'fr') return 'Copie impossible';
  if (locale === 'de') return 'Kopieren fehlgeschlagen';
  return 'Copy failed';
}

export default function AnalyzeClient({ locale }: AnalyzeClientProps) {
  const l: Locale = isLocale(locale) ? locale : 'en';
  const t = TEXT[l];

  const scheduleUi = useScheduleUi(l);

  const {
    stepIndex,
    setStepIndex,
    profile,
    setProfile,
    workSegments,
    setWorkSegments,
    sleepSegments,
    setSleepSegments,
    collector,
    setCollector,
    resetAll,
  } = useAnalyzeDraft(l);

  const stepLabels = useMemo(() => {
    const scheduleLabel = l === 'fr' ? 'Agenda' : l === 'de' ? 'Zeitplan' : 'Schedule';
    return [t.profileTitle, scheduleLabel, t.resultsTitle] as const;
  }, [l, t.profileTitle, t.resultsTitle]);

  const workWeekSegments = useMemo(() => dayPartsToWeekSegments(workSegments), [workSegments]);
  const sleepWeekSegments = useMemo(() => dayPartsToWeekSegments(sleepSegments), [sleepSegments]);

  const analysis = useMemo(
    () =>
      analyzeUiSchedule({
        locale: l,
        profile,
        workSegments: workWeekSegments,
        sleepSegments: sleepWeekSegments,
      }),
    [l, profile, sleepWeekSegments, workWeekSegments],
  );

  const derived = analysis.derived;
  const scores = analysis.scores;

  const profilePct = getProfileCompletion(profile);
  const schedulePct = useMemo(() => {
    const w = workSegments.length > 0 ? 50 : 0;
    const s = sleepSegments.length > 0 ? 50 : 0;
    return w + s;
  }, [workSegments.length, sleepSegments.length]);

  const resultsPct = stepIndex >= 2 ? 100 : 0;
  const overallPct = Math.round((profilePct + schedulePct + resultsPct) / 3);

  const canGoProfileNext = profilePct >= 60;
  const scoringVersion = analysis.scoreBundle.scoringVersion;

  const [createdAt] = useState(() => new Date().toISOString());

  const payload = useMemo(() => {
    const anonymousId = collector.includeAnonymousId ? getOrCreateAnonymousId() : null;

    return {
      project: 'shiftwell',
      scoringVersion,
      locale: l,
      createdAt,
      anonymousId,
      profile,
      workSegments: workWeekSegments,
      sleepSegments: sleepWeekSegments,
      derived,
      scores,
      trace: analysis.scoreBundle.trace,
    };
  }, [
    analysis.scoreBundle.trace,
    collector.includeAnonymousId,
    createdAt,
    derived,
    l,
    profile,
    scores,
    scoringVersion,
    sleepWeekSegments,
    workWeekSegments,
  ]);

  const recomputeScores = useMemo(
    () =>
      ({
        profile: nextProfile,
        workSegments: nextWorkSegments,
        sleepSegments: nextSleepSegments,
      }: {
        profile: typeof profile;
        workSegments: typeof workWeekSegments;
        sleepSegments: typeof sleepWeekSegments;
      }) =>
        analyzeUiSchedule({
          locale: l,
          profile: nextProfile,
          workSegments: nextWorkSegments,
          sleepSegments: nextSleepSegments,
        }).scores,
    [l],
  );

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      window.alert(copiedAlert(l));
    } catch {
      window.alert(copyFailedAlert(l));
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiftwell-${l}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <LocaleNav locale={l} />

      <AnalyzeHeaderCard
        badge={t.analyze}
        stepTitle={stepLabels[stepIndex] ?? t.analyze}
        helper={t.helper}
        saveVersionLabel={t.saveVersion}
        saveVersionValue={scoringVersion}
        labels={stepLabels}
        current={stepIndex}
        percent={overallPct}
        progressLabel={t.progress}
      />

      {stepIndex === 0 && (
        <ProfileStep
          t={t}
          profile={profile}
          setProfile={setProfile}
          onNext={() => setStepIndex(1)}
          canNext={canGoProfileNext}
        />
      )}

      {stepIndex === 1 && (
        <CombinedScheduleStep
          ui={scheduleUi}
          dayLabels={t.daysShort}
          workSegments={workSegments}
          setWorkSegments={setWorkSegments}
          sleepSegments={sleepSegments}
          setSleepSegments={setSleepSegments}
          onPrev={() => setStepIndex(0)}
          onNext={() => setStepIndex(2)}
        />
      )}

      {stepIndex === 2 && (
        <ExplainabilityProvider
          locale={l}
          recomputeScores={recomputeScores}
          state={{
            locale: l,
            scoringVersion,
            profile,
            workSegments: workWeekSegments,
            sleepSegments: sleepWeekSegments,
            derived,
            scores,
            trace: analysis.scoreBundle.trace,
          }}
        >
          <ResultsStep
            t={t}
            locale={l}
            scores={scores}
            scoringVersion={scoringVersion}
            payload={payload}
            collector={collector}
            setCollector={setCollector}
            onCopyJson={handleCopyJson}
            onDownloadJson={handleDownloadJson}
            onPrev={() => setStepIndex(1)}
            onResetAll={resetAll}
          />
          <ExplainabilityPanel />
        </ExplainabilityProvider>
      )}
    </div>
  );
}
