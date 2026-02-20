'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Dictionary, Locale } from '@/i18n';
import type { AnalysisDraft, ContributionConsent, RawSegment } from '../core/model';
import { calculateScores, CONSENT_NOTICE_VERSION } from '../core/scoring';
import { downloadJson } from '../lib/export';
import { submitContribution } from '../lib/collector';

type Props = {
  locale: Locale;
  dict: Dictionary;
};

const STORAGE_KEY = 'shiftwell:analysis-draft:v0.1';

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function defaultDraft(locale: Locale, dict: Dictionary): AnalysisDraft {
  return {
    participantCode: makeId(),
    mode: 'short',
    profile: {
      professionCategory: dict.analyze.professionOptions[0],
      ageBand: dict.analyze.ageBands[1],
      sex: dict.analyze.sexOptions[2],
      locale,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
    },
    segments: [],
    longAnswers: {
      fatigue: 5,
      sleepQuality: 5,
      lateCaffeine: false,
    },
    updatedAt: new Date().toISOString(),
  };
}

function createEmptySegment(dayIndex: number, kind: 'work' | 'sleep'): RawSegment {
  return {
    id: makeId(),
    dayIndex,
    kind,
    start: kind === 'work' ? '08:00' : '23:00',
    end: kind === 'work' ? '16:00' : '07:00',
  };
}

function scoreBadgeClass(score: number) {
  if (score >= 75) return 'badge danger';
  if (score >= 50) return 'badge warn';
  if (score >= 25) return 'badge secondary';
  return 'badge primary';
}

function inverseScoreBadgeClass(score: number) {
  // for positive scores like adaptability / sleep
  if (score >= 75) return 'badge secondary';
  if (score >= 50) return 'badge primary';
  if (score >= 25) return 'badge warn';
  return 'badge danger';
}

export default function AnalyzeClient({ locale, dict }: Props) {
  const [draft, setDraft] = useState<AnalysisDraft>(() => defaultDraft(locale, dict));
  const [hydrated, setHydrated] = useState(false);

  const [explicitConsent, setExplicitConsent] = useState(false);
  const [recontactConsent, setRecontactConsent] = useState(false);

  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AnalysisDraft;
        setDraft((prev) => ({
          ...prev,
          ...parsed,
          profile: {
            ...prev.profile,
            ...parsed.profile,
            locale, // enforce current route locale for UI
          },
        }));
      }
    } catch {
      // no-op
    } finally {
      setHydrated(true);
    }
  }, [locale]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...draft,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // no-op
    }
  }, [draft, hydrated]);

  const scores = useMemo(() => calculateScores(draft), [draft]);

  const daySegments = useMemo(() => {
    return Array.from({ length: 7 }, (_, dayIndex) => ({
      dayIndex,
      work: draft.segments.filter((s) => s.dayIndex === dayIndex && s.kind === 'work'),
      sleep: draft.segments.filter((s) => s.dayIndex === dayIndex && s.kind === 'sleep'),
    }));
  }, [draft.segments]);

  function updateProfile<K extends keyof AnalysisDraft['profile']>(
    key: K,
    value: AnalysisDraft['profile'][K]
  ) {
    setDraft((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: value },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateLongAnswer<K extends keyof AnalysisDraft['longAnswers']>(
    key: K,
    value: AnalysisDraft['longAnswers'][K]
  ) {
    setDraft((prev) => ({
      ...prev,
      longAnswers: { ...prev.longAnswers, [key]: value },
      updatedAt: new Date().toISOString(),
    }));
  }

  function addSegment(dayIndex: number, kind: 'work' | 'sleep') {
    setDraft((prev) => ({
      ...prev,
      segments: [...prev.segments, createEmptySegment(dayIndex, kind)],
      updatedAt: new Date().toISOString(),
    }));
  }

  function patchSegment(id: string, patch: Partial<RawSegment>) {
    setDraft((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      updatedAt: new Date().toISOString(),
    }));
  }

  function removeSegment(id: string) {
    setDraft((prev) => ({
      ...prev,
      segments: prev.segments.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  }

  function exportReport() {
    const payload = {
      app: 'Shiftwell',
      generatedAt: new Date().toISOString(),
      locale,
      scoringVersion: scores.scoringVersion,
      consentNoticeVersion: CONSENT_NOTICE_VERSION,
      data: draft,
      result: scores,
      disclaimer:
        'Research / pre-analysis tool. Does not replace medical advice.',
    };

    downloadJson(`shiftwell-report-${draft.participantCode}.json`, payload);
  }

  async function onSendContribution() {
    setSendStatus(null);
    setSendError(null);

    if (!explicitConsent) return;

    const consent: ContributionConsent = {
      explicitStudyConsent: explicitConsent,
      recontactConsent,
      consentNoticeVersion: CONSENT_NOTICE_VERSION,
      consentAt: new Date().toISOString(),
    };

    const payload = {
      app: 'Shiftwell',
      schemaVersion: 'shiftwell-collector-v0.1',
      submittedAt: new Date().toISOString(),
      participantCode: draft.participantCode,
      profile: {
        professionCategory: draft.profile.professionCategory,
        ageBand: draft.profile.ageBand,
        sex: draft.profile.sex,
        locale: draft.profile.locale,
        timezone: draft.profile.timezone,
      },
      mode: draft.mode,
      segments: draft.segments,
      longAnswers: draft.mode === 'long' ? draft.longAnswers : {},
      result: scores,
      consent,
    };

    setSending(true);
    try {
      await submitContribution(payload);
      setSendStatus(dict.analyze.contributionOk);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'UNKNOWN_ERROR';
      if (msg.includes('MISSING_COLLECTOR_ENDPOINT')) {
        setSendError(dict.analyze.collectorMissing);
      } else {
        setSendError(dict.analyze.contributionError);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <div className="brand-name">Shiftwell</div>
            <div className="small muted">{dict.tagline}</div>
          </div>
        </div>

        <div className="row">
          <Link className="btn ghost" href={`/${locale}/`}>
            {dict.common.home}
          </Link>
          <Link className="btn ghost" href="/fr/analyze/">
            FR
          </Link>
          <Link className="btn ghost" href="/en/analyze/">
            EN
          </Link>
          <Link className="btn ghost" href="/de/analyze/">
            DE
          </Link>
        </div>
      </div>

      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h1 className="section-title">{dict.analyze.title}</h1>
        <p className="section-subtitle">{dict.analyze.subtitle}</p>
        <div className="notice" style={{ marginTop: 12 }}>
          <div className="small">{dict.analyze.scientificNote}</div>
        </div>
      </section>

      <div className="grid grid-2">
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {dict.analyze.profileTitle}
          </h2>

          <div className="grid" style={{ gap: 12 }}>
            <div>
              <label className="label">{dict.analyze.modeLabel}</label>
              <div className="row">
                <button
                  className={`btn ${draft.mode === 'short' ? 'primary' : ''}`}
                  onClick={() => setDraft((p) => ({ ...p, mode: 'short' }))}
                  type="button"
                >
                  {dict.common.shortMode}
                </button>
                <button
                  className={`btn ${draft.mode === 'long' ? 'primary' : ''}`}
                  onClick={() => setDraft((p) => ({ ...p, mode: 'long' }))}
                  type="button"
                >
                  {dict.common.longMode}
                </button>
              </div>
            </div>

            <div>
              <label className="label">{dict.analyze.profession}</label>
              <select
                className="select"
                value={draft.profile.professionCategory}
                onChange={(e) => updateProfile('professionCategory', e.target.value)}
              >
                {dict.analyze.professionOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-2">
              <div>
                <label className="label">{dict.analyze.ageBand}</label>
                <select
                  className="select"
                  value={draft.profile.ageBand}
                  onChange={(e) => updateProfile('ageBand', e.target.value)}
                >
                  {dict.analyze.ageBands.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{dict.analyze.sex}</label>
                <select
                  className="select"
                  value={draft.profile.sex}
                  onChange={(e) => updateProfile('sex', e.target.value)}
                >
                  {dict.analyze.sexOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div>
                <label className="label">{dict.analyze.locale}</label>
                <input className="input" value={draft.profile.locale} readOnly />
              </div>
              <div>
                <label className="label">{dict.analyze.timezone}</label>
                <input
                  className="input"
                  value={draft.profile.timezone}
                  onChange={(e) => updateProfile('timezone', e.target.value)}
                />
              </div>
            </div>

            {draft.mode === 'long' && (
              <div className="card soft" style={{ padding: 12 }}>
                <div className="small" style={{ fontWeight: 700, marginBottom: 10 }}>
                  {dict.analyze.longQuestions.title}
                </div>

                <div className="grid grid-2">
                  <div>
                    <label className="label">{dict.analyze.longQuestions.fatigue}</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="input"
                      value={draft.longAnswers.fatigue ?? 5}
                      onChange={(e) => updateLongAnswer('fatigue', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="label">{dict.analyze.longQuestions.sleepQuality}</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="input"
                      value={draft.longAnswers.sleepQuality ?? 5}
                      onChange={(e) => updateLongAnswer('sleepQuality', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label className="row small">
                    <input
                      type="checkbox"
                      checked={!!draft.longAnswers.lateCaffeine}
                      onChange={(e) => updateLongAnswer('lateCaffeine', e.target.checked)}
                    />
                    {dict.analyze.longQuestions.lateCaffeine}
                  </label>
                </div>
              </div>
            )}

            <div className="small muted">
              {hydrated ? dict.analyze.localDraftSaved : '...'}
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {dict.analyze.resultsTitle}
          </h2>

          <div className="grid grid-3" style={{ marginTop: 8 }}>
            <div className="card soft score-card">
              <div className="small muted">{dict.analyze.scores.adaptability}</div>
              <div className="score-value">{scores.adaptabilityScore}</div>
              <div className={inverseScoreBadgeClass(scores.adaptabilityScore)} style={{ marginTop: 8 }}>
                {scores.adaptabilityScore >= 75
                  ? 'High'
                  : scores.adaptabilityScore >= 50
                  ? 'Moderate'
                  : scores.adaptabilityScore >= 25
                  ? 'Low'
                  : 'Very low'}
              </div>
            </div>

            <div className="card soft score-card">
              <div className="small muted">{dict.analyze.scores.risk}</div>
              <div className="score-value">{scores.riskScore}</div>
              <div className={scoreBadgeClass(scores.riskScore)} style={{ marginTop: 8 }}>
                SLI raw: {scores.sliRaw}/16
              </div>
            </div>

            <div className="card soft score-card">
              <div className="small muted">{dict.analyze.scores.sleep}</div>
              <div className="score-value">{scores.sleepScore}</div>
              <div className={inverseScoreBadgeClass(scores.sleepScore)} style={{ marginTop: 8 }}>
                {scores.derived.avgSleepHours}h avg
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="small muted">
            {dict.analyze.scoreVersionLabel}: <strong>{scores.scoringVersion}</strong>
          </div>

          <div style={{ marginTop: 10 }}>
            {scores.referenceDelta ? (
              <div className="small">
                <strong>{dict.analyze.referenceDelta}:</strong>{' '}
                ΔRisk {scores.referenceDelta.riskScore ?? '—'} · ΔSleep{' '}
                {scores.referenceDelta.sleepScore ?? '—'} · ΔAdapt{' '}
                {scores.referenceDelta.adaptabilityScore ?? '—'}
              </div>
            ) : (
              <div className="small muted">{dict.analyze.noReferenceConfigured}</div>
            )}
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button type="button" className="btn primary" onClick={exportReport}>
              {dict.common.exportReport}
            </button>
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          {dict.analyze.scheduleTitle}
        </h2>
        <p className="small muted">{dict.analyze.scheduleHelp}</p>

        <div className="grid" style={{ gap: 12 }}>
          {daySegments.map((day) => (
            <div className="day-card" key={day.dayIndex}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{dict.days[day.dayIndex]}</strong>
                <div className="row">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => addSegment(day.dayIndex, 'work')}
                  >
                    + {dict.analyze.workSegments}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => addSegment(day.dayIndex, 'sleep')}
                  >
                    + {dict.analyze.sleepSegments}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div className="small" style={{ fontWeight: 700 }}>
                  {dict.analyze.workSegments}
                </div>
                {!day.work.length && <div className="small muted">—</div>}
                {day.work.map((seg) => (
                  <div className="segment-row" key={seg.id}>
                    <input
                      type="time"
                      className="input"
                      value={seg.start}
                      onChange={(e) => patchSegment(seg.id, { start: e.target.value })}
                      aria-label={`${dict.analyze.segmentStart} ${dict.analyze.workSegments}`}
                    />
                    <input
                      type="time"
                      className="input"
                      value={seg.end}
                      onChange={(e) => patchSegment(seg.id, { end: e.target.value })}
                      aria-label={`${dict.analyze.segmentEnd} ${dict.analyze.workSegments}`}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={() => removeSegment(seg.id)}
                      title={dict.analyze.delete}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <div className="small" style={{ fontWeight: 700 }}>
                  {dict.analyze.sleepSegments}
                </div>
                {!day.sleep.length && <div className="small muted">—</div>}
                {day.sleep.map((seg) => (
                  <div className="segment-row" key={seg.id}>
                    <input
                      type="time"
                      className="input"
                      value={seg.start}
                      onChange={(e) => patchSegment(seg.id, { start: e.target.value })}
                      aria-label={`${dict.analyze.segmentStart} ${dict.analyze.sleepSegments}`}
                    />
                    <input
                      type="time"
                      className="input"
                      value={seg.end}
                      onChange={(e) => patchSegment(seg.id, { end: e.target.value })}
                      aria-label={`${dict.analyze.segmentEnd} ${dict.analyze.sleepSegments}`}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={() => removeSegment(seg.id)}
                      title={dict.analyze.delete}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {dict.analyze.metricsTitle}
          </h2>

          <div className="grid grid-2">
            <Metric label="Work hours" value={`${scores.derived.totalWorkHours}h`} />
            <Metric label="Long shifts" value={scores.derived.longShiftCount} />
            <Metric label="Longest recovery" value={`${scores.derived.longestRecoveryHours}h`} />
            <Metric label="Short breaks" value={scores.derived.shortBreaksCount} />
            <Metric label="Fully rested days" value={scores.derived.fullyRestedDaysCount} />
            <Metric label="Night shifts" value={scores.derived.nightShiftCount} />
            <Metric label="Biological hours lost" value={`${scores.derived.biologicalHoursLost}h`} />
            <Metric label="Social hours lost" value={`${scores.derived.socialHoursLost}h`} />
            <Metric label="Avg sleep" value={`${scores.derived.avgSleepHours}h`} />
            <Metric label="Sleep regularity" value={`${scores.derived.sleepRegularityProxy}/100`} />
          </div>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {dict.analyze.explanationsTitle}
          </h2>

          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {scores.explanations.map((exp) => (
              <li key={exp} className="small" style={{ marginBottom: 8 }}>
                {exp}
              </li>
            ))}
          </ul>

          <div className="divider" />

          <h3 style={{ marginTop: 0 }}>{dict.analyze.consentTitle}</h3>
          <p className="small muted">{dict.analyze.consentBody}</p>

          <label className="row small" style={{ alignItems: 'flex-start', marginTop: 8 }}>
            <input
              type="checkbox"
              checked={explicitConsent}
              onChange={(e) => setExplicitConsent(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>{dict.analyze.explicitConsent}</span>
          </label>

          <label className="row small" style={{ alignItems: 'flex-start', marginTop: 8 }}>
            <input
              type="checkbox"
              checked={recontactConsent}
              onChange={(e) => setRecontactConsent(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>{dict.analyze.recontactConsent}</span>
          </label>

          <div className="small muted" style={{ marginTop: 8 }}>
            {dict.analyze.consentNoticeVersion}: {CONSENT_NOTICE_VERSION}
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn primary"
              onClick={onSendContribution}
              disabled={!explicitConsent || sending}
            >
              {sending ? dict.common.loading : dict.analyze.sendContribution}
            </button>
          </div>

          {sendStatus && <div className="success small" style={{ marginTop: 8 }}>{sendStatus}</div>}
          {sendError && <div className="error small" style={{ marginTop: 8 }}>{sendError}</div>}
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card soft" style={{ padding: 10 }}>
      <div className="small muted">{label}</div>
      <div style={{ fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}