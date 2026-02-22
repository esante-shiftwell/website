'use client';

import { useMemo, useState } from 'react';

import { TEXT, isLocale } from '@/components/analyze/copy';
import type { Locale, ParticipantProfile, WeekSegment } from '@/components/analyze/types';
import {
  computeDerivedMetrics,
  computeScores,
  getOrCreateAnonymousId,
  getProfileCompletion,
} from '@/components/analyze/utils';

import LocaleNav from './LocaleNav';
import AnalyzeHeaderCard from '@/components/analyze/AnalyzeHeaderCard';
import CombinedScheduleStep from '@/components/analyze/CombinedScheduleStep';
import ProfileStep from '@/components/analyze/ProfileStep';
import ResultsStep from '@/components/analyze/ResultsStep';

import type { DayPartSegment } from '@/components/analyze/calendar/scheduleUtils';
import { useAnalyzeDraft } from '@/components/analyze/useAnalyzeDraft';
import { useScheduleUi } from '@/components/analyze/useScheduleUi';

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

  const derived = useMemo(
    () => computeDerivedMetrics(workWeekSegments, sleepWeekSegments),
    [workWeekSegments, sleepWeekSegments],
  );

  const scores = useMemo(() => computeScores(derived, profile), [derived, profile]);

  const profilePct = getProfileCompletion(profile);
  const schedulePct = useMemo(() => {
    const w = workSegments.length > 0 ? 50 : 0;
    const s = sleepSegments.length > 0 ? 50 : 0;
    return w + s;
  }, [workSegments.length, sleepSegments.length]);

  const resultsPct = stepIndex >= 2 ? 100 : 0;
  const overallPct = Math.round((profilePct + schedulePct + resultsPct) / 3);

  const canGoProfileNext = profilePct >= 60;

  const payload = useMemo(() => {
    const anonymousId = collector.includeAnonymousId ? getOrCreateAnonymousId() : null;

    return {
      project: 'shiftwell',
      scoringVersion: 'proxy-v0.1',
      locale: l,
      createdAt: new Date().toISOString(),
      anonymousId,
      profile,
      workSegments: workWeekSegments,
      sleepSegments: sleepWeekSegments,
      derived,
      scores,
    };
  }, [collector.includeAnonymousId, derived, l, profile, scores, sleepWeekSegments, workWeekSegments]);

  const [sendStatus, setSendStatus] = useState<{
    state: 'idle' | 'sending' | 'success' | 'error';
    message?: string;
  }>({ state: 'idle' });

  async function handleSend() {
    if (!collector.consent) {
      setSendStatus({ state: 'error', message: t.consentCheck });
      return;
    }
    if (!collector.endpoint.trim()) {
      setSendStatus({
        state: 'error',
        message: l === 'fr' ? 'Endpoint requis.' : 'Endpoint required.',
      });
      return;
    }

    try {
      setSendStatus({ state: 'sending' });

      const res = await fetch(collector.endpoint.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSendStatus({ state: 'success', message: t.sentOk });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setSendStatus({ state: 'error', message: `${t.sentError}: ${msg}` });
    }
  }

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setSendStatus({ state: 'success', message: l === 'fr' ? 'JSON copié' : 'JSON copied' });
    } catch {
      setSendStatus({ state: 'error', message: l === 'fr' ? 'Copie impossible' : 'Copy failed' });
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
        saveVersionValue="proxy-v0.1"
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
        <ResultsStep
          t={t}
          locale={l}
          scores={scores}
          derived={derived}
          collector={collector}
          setCollector={setCollector}
          sendStatus={sendStatus}
          onSend={handleSend}
          onCopyJson={handleCopyJson}
          onDownloadJson={handleDownloadJson}
          onPrev={() => setStepIndex(1)}
          onResetAll={resetAll}
        />
      )}
    </div>
  );
}