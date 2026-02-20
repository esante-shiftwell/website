'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import CalendarEditorStep from '@/components/analyze/CalendarEditorStep';
import { TEXT, isLocale } from '@/components/analyze/copy';
import DerivedMetricsList from '@/components/analyze/DerivedMetricsList';
import { Field, FooterActions, RangeInput } from '@/components/analyze/FormBits';
import ResultsExplanations from '@/components/analyze/ResultsExplanations';
import ScoreCard from '@/components/analyze/ScoreCard';
import StepProgress from '@/components/analyze/StepProgress';
import type {
  CollectorState,
  Locale,
  ParticipantProfile,
  SegmentDraft,
  WeekSegment,
} from '@/components/analyze/types';
import {
  clamp,
  computeDerivedMetrics,
  computeScores,
  getOrCreateAnonymousId,
  getProfileCompletion,
  getSegmentsCompletion,
} from '@/components/analyze/utils';
import LocaleNav from './LocaleNav';

type AnalyzeClientProps = {
  locale: string;
  dict?: unknown;
};

export default function AnalyzeClient({ locale }: AnalyzeClientProps) {
  const l: Locale = isLocale(locale) ? locale : 'en';
  const t = TEXT[l];

  const [stepIndex, setStepIndex] = useState(0);

  const [profile, setProfile] = useState<ParticipantProfile>({
    mode: 'short',
    profession: '',
    ageBand: '',
    sex: '',
    chronotype: '',
    fatigue: 3,
    schedulePredictability: 3,
    commuteMinutes: 0,
    napsPerWeek: 0,
    caffeineCups: 2,
  });

  const [workSegments, setWorkSegments] = useState<WeekSegment[]>([]);
  const [sleepSegments, setSleepSegments] = useState<WeekSegment[]>([]);

  const [workDraft, setWorkDraft] = useState<SegmentDraft>({
    day: 0,
    startMin: 8 * 60,
    endMin: 16 * 60,
    overnight: false,
  });

  const [sleepDraft, setSleepDraft] = useState<SegmentDraft>({
    day: 0,
    startMin: 22 * 60,
    endMin: 6 * 60,
    overnight: true,
  });

  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editingSleepId, setEditingSleepId] = useState<string | null>(null);

  const [collector, setCollector] = useState<CollectorState>({
    endpoint: '',
    consent: false,
    includeAnonymousId: true,
  });

  const [sendStatus, setSendStatus] = useState<{
    state: 'idle' | 'sending' | 'success' | 'error';
    message?: string;
  }>({ state: 'idle' });

  const draftStorageKey = `shiftwell:draft:v2:${l}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<{
        profile: ParticipantProfile;
        workSegments: WeekSegment[];
        sleepSegments: WeekSegment[];
        collector: CollectorState;
        stepIndex: number;
      }>;

      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.workSegments) setWorkSegments(parsed.workSegments);
      if (parsed.sleepSegments) setSleepSegments(parsed.sleepSegments);
      if (parsed.collector) setCollector(parsed.collector);
      if (typeof parsed.stepIndex === 'number') {
        setStepIndex(clamp(parsed.stepIndex, 0, 3));
      }
    } catch {
      // ignore
    }
  }, [draftStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          profile,
          workSegments,
          sleepSegments,
          collector,
          stepIndex,
        }),
      );
    } catch {
      // ignore
    }
  }, [collector, draftStorageKey, profile, sleepSegments, stepIndex, workSegments]);

  const derived = useMemo(
    () => computeDerivedMetrics(workSegments, sleepSegments),
    [workSegments, sleepSegments],
  );

  const scores = useMemo(() => computeScores(derived, profile), [derived, profile]);

  const profilePct = getProfileCompletion(profile);
  const workPct = getSegmentsCompletion(workSegments);
  const sleepPct = getSegmentsCompletion(sleepSegments);
  const resultsPct = stepIndex >= 3 ? 100 : 0;
  const overallPct = Math.round((profilePct + workPct + sleepPct + resultsPct) / 4);

  const canGoStep1 = profilePct >= 60;
  const canGoStep2 = workSegments.length > 0;
  const canGoStep3 = sleepSegments.length > 0;

  const payload = useMemo(() => {
    const anonymousId = collector.includeAnonymousId ? getOrCreateAnonymousId() : null;

    return {
      project: 'shiftwell',
      scoringVersion: 'proxy-v0.1',
      locale: l,
      createdAt: new Date().toISOString(),
      anonymousId,
      profile,
      workSegments,
      sleepSegments,
      derived,
      scores,
    };
  }, [collector.includeAnonymousId, derived, l, profile, scores, sleepSegments, workSegments]);

  async function handleSend() {
    if (!collector.consent) {
      setSendStatus({ state: 'error', message: t.consentCheck });
      return;
    }
    if (!collector.endpoint.trim()) {
      setSendStatus({ state: 'error', message: 'Endpoint requis pour envoyer.' });
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
      setSendStatus({ state: 'success', message: 'JSON copié' });
    } catch {
      setSendStatus({ state: 'error', message: 'Impossible de copier le JSON' });
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiftwell-${l}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetAll() {
    setProfile({
      mode: 'short',
      profession: '',
      ageBand: '',
      sex: '',
      chronotype: '',
      fatigue: 3,
      schedulePredictability: 3,
      commuteMinutes: 0,
      napsPerWeek: 0,
      caffeineCups: 2,
    });
    setWorkSegments([]);
    setSleepSegments([]);
    setEditingWorkId(null);
    setEditingSleepId(null);
    setWorkDraft({ day: 0, startMin: 8 * 60, endMin: 16 * 60, overnight: false });
    setSleepDraft({ day: 0, startMin: 22 * 60, endMin: 6 * 60, overnight: true });
    setCollector({ endpoint: '', consent: false, includeAnonymousId: true });
    setSendStatus({ state: 'idle' });
    setStepIndex(0);
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {
      // ignore
    }
  }

  return (
    <div>
 <LocaleNav locale={l}></LocaleNav>

      <section className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge primary">{t.analyze}</div>
            <h1 className="section-title" style={{ marginTop: 8, marginBottom: 4 }}>
              {t.steps[stepIndex]}
            </h1>
            <p className="small muted" style={{ margin: 0 }}>
              {t.helper}
            </p>
          </div>

          <div className="small muted">
            {t.saveVersion}: <strong>proxy-v0.1</strong>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <StepProgress
            labels={t.steps}
            current={stepIndex}
            percent={overallPct}
            progressLabel={t.progress}
          />
        </div>

        <div className="notice" style={{ marginTop: 12 }}>
          <div className="small">
            <strong>{overallPct}%</strong> — {t.progress}
          </div>
        </div>
      </section>

      {stepIndex === 0 && (
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {t.profileTitle}
          </h2>
          <p className="section-subtitle">{t.profileSubtitle}</p>

          <div className="row" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={`btn ${profile.mode === 'short' ? 'primary' : ''}`}
              onClick={() => setProfile((p) => ({ ...p, mode: 'short' }))}
            >
              {t.modeShort}
            </button>
            <button
              type="button"
              className={`btn ${profile.mode === 'long' ? 'primary' : ''}`}
              onClick={() => setProfile((p) => ({ ...p, mode: 'long' }))}
            >
              {t.modeLong}
            </button>
          </div>

          <div className="notice" style={{ marginBottom: 12 }}>
            <div className="small">
              {profile.mode === 'short' ? t.shortModeBlock : t.longModeBlock}
            </div>
          </div>

          <div className="grid grid-2">
            <Field label={t.profession} required>
              <input
                className="input"
                value={profile.profession}
                placeholder={t.professionPlaceholder}
                onChange={(e) => setProfile((p) => ({ ...p, profession: e.target.value }))}
              />
            </Field>

            <Field label={t.ageBand} required>
              <select
                className="input"
                value={profile.ageBand}
                onChange={(e) => setProfile((p) => ({ ...p, ageBand: e.target.value }))}
              >
                <option value="">{t.select}</option>
                {t.ages.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t.sex}>
              <select
                className="input"
                value={profile.sex}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, sex: e.target.value as ParticipantProfile['sex'] }))
                }
              >
                <option value="">{t.select}</option>
                {t.sexes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t.chronotype}>
              <select
                className="input"
                value={profile.chronotype}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    chronotype: e.target.value as ParticipantProfile['chronotype'],
                  }))
                }
              >
                <option value="">{t.select}</option>
                {t.chronotypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {profile.mode === 'long' && (
            <div className="grid grid-2" style={{ marginTop: 12 }}>
              <Field label={t.fatigue}>
                <RangeInput
                  min={1}
                  max={5}
                  value={profile.fatigue}
                  onChange={(v) => setProfile((p) => ({ ...p, fatigue: v }))}
                />
              </Field>

              <Field label={t.predictability}>
                <RangeInput
                  min={1}
                  max={5}
                  value={profile.schedulePredictability}
                  onChange={(v) =>
                    setProfile((p) => ({ ...p, schedulePredictability: v }))
                  }
                />
              </Field>

              <Field label={t.commute}>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={240}
                  value={profile.commuteMinutes}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      commuteMinutes: clamp(Number(e.target.value || 0), 0, 240),
                    }))
                  }
                />
              </Field>

              <Field label={t.naps}>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={21}
                  value={profile.napsPerWeek}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      napsPerWeek: clamp(Number(e.target.value || 0), 0, 21),
                    }))
                  }
                />
              </Field>

              <Field label={t.caffeine}>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={20}
                  value={profile.caffeineCups}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      caffeineCups: clamp(Number(e.target.value || 0), 0, 20),
                    }))
                  }
                />
              </Field>
            </div>
          )}

          <FooterActions
            onPrev={stepIndex > 0 ? () => setStepIndex((s) => s - 1) : undefined}
            onNext={() => setStepIndex(1)}
            prevLabel={t.previous}
            nextLabel={t.next}
            canNext={canGoStep1}
            requiredText={!canGoStep1 ? t.required : undefined}
          />
        </section>
      )}

      {stepIndex === 1 && (
        <CalendarEditorStep
          locale={l}
          title={t.workTitle}
          subtitle={t.calendarSubtitle}
          legend={t.workLegend}
          kind="work"
          segments={workSegments}
          setSegments={setWorkSegments}
          draft={workDraft}
          setDraft={setWorkDraft}
          editingId={editingWorkId}
          setEditingId={setEditingWorkId}
          labels={t}
          onPrev={() => setStepIndex(0)}
          onNext={() => setStepIndex(2)}
          canNext={canGoStep2}
        />
      )}

      {stepIndex === 2 && (
        <CalendarEditorStep
          locale={l}
          title={t.sleepTitle}
          subtitle={t.calendarSubtitle}
          legend={t.sleepLegend}
          kind="sleep"
          segments={sleepSegments}
          setSegments={setSleepSegments}
          draft={sleepDraft}
          setDraft={setSleepDraft}
          editingId={editingSleepId}
          setEditingId={setEditingSleepId}
          labels={t}
          onPrev={() => setStepIndex(1)}
          onNext={() => setStepIndex(3)}
          canNext={canGoStep3}
          tips={t.quickTips}
        />
      )}

      {stepIndex === 3 && (
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
              <DerivedMetricsList metrics={derived} locale={l} />
            </section>

            <section className="card soft" style={{ padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>{t.explanations}</h3>
              <ResultsExplanations metrics={derived} scores={scores} locale={l} />
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

              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  alignContent: 'start',
                  marginTop: 22,
                }}
              >
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
              <button
                type="button"
                className="btn primary"
                onClick={handleSend}
                disabled={sendStatus.state === 'sending'}
              >
                {sendStatus.state === 'sending' ? '…' : t.sendData}
              </button>
              <button type="button" className="btn" onClick={handleCopyJson}>
                {t.copyJson}
              </button>
              <button type="button" className="btn" onClick={handleDownloadJson}>
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
            onPrev={() => setStepIndex(2)}
            onNext={() => {}}
            prevLabel={t.previous}
            nextLabel={t.finish}
            canNext
            hideNext
            extra={
              <button type="button" className="btn ghost" onClick={resetAll}>
                {t.resetAll}
              </button>
            }
          />
        </section>
      )}
    </div>
  );
}