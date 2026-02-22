'use client';

import type { ParticipantProfile } from '@/components/analyze/types';
import { clamp } from '@/components/analyze/utils';
import { Field, FooterActions, RangeInput } from '@/components/analyze/FormBits';

type ProfileStepCopy = {
  profileTitle: string;
  profileSubtitle: string;

  modeShort: string;
  modeLong: string;
  shortModeBlock: string;
  longModeBlock: string;

  profession: string;
  professionPlaceholder: string;

  ageBand: string;
  select: string;
  ages: ReadonlyArray<string>;

  sex: string;
  sexes: ReadonlyArray<readonly [value: ParticipantProfile['sex'] | string, label: string]>;

  chronotype: string;
  chronotypes: ReadonlyArray<
    readonly [value: ParticipantProfile['chronotype'] | string, label: string]
  >;

  fatigue: string;
  predictability: string;
  commute: string;
  naps: string;
  caffeine: string;

  previous: string;
  next: string;
  required: string;
};

export default function ProfileStep({
  t,
  profile,
  setProfile,
  onNext,
  canNext,
}: {
  t: ProfileStepCopy;
  profile: ParticipantProfile;
  setProfile: (updater: (p: ParticipantProfile) => ParticipantProfile) => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
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
        <div className="small">{profile.mode === 'short' ? t.shortModeBlock : t.longModeBlock}</div>
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
              <option key={String(value)} value={String(value)}>
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
              <option key={String(value)} value={String(value)}>
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
              onChange={(v) => setProfile((p) => ({ ...p, schedulePredictability: v }))}
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
        onPrev={undefined}
        onNext={onNext}
        prevLabel={t.previous}
        nextLabel={t.next}
        canNext={canNext}
        requiredText={!canNext ? t.required : undefined}
      />
    </section>
  );
}