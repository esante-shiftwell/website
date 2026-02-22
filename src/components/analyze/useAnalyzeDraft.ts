'use client';

import { useEffect, useState } from 'react';
import type { CollectorState, Locale, ParticipantProfile } from '@/components/analyze/types';
import type { DayPartSegment } from '@/components/analyze/calendar/scheduleUtils';
import { clamp } from '@/components/analyze/utils';

const DRAFT_KEY = 'shiftwell:draft:v3';

const DEFAULT_PROFILE: ParticipantProfile = {
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
};

const DEFAULT_COLLECTOR: CollectorState = {
  endpoint: '',
  consent: false,
  includeAnonymousId: true,
};

type DraftShape = Partial<{
  profile: ParticipantProfile;
  workSegments: DayPartSegment[];
  sleepSegments: DayPartSegment[];
  collector: CollectorState;
  stepIndex: number;
}>;

export function useAnalyzeDraft(_locale: Locale) {
  const [hydrated, setHydrated] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfileState] = useState<ParticipantProfile>(DEFAULT_PROFILE);
  const [workSegments, setWorkSegments] = useState<DayPartSegment[]>([]);
  const [sleepSegments, setSleepSegments] = useState<DayPartSegment[]>([]);
  const [collector, setCollectorState] = useState<CollectorState>(DEFAULT_COLLECTOR);

  // LOAD (modern only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as DraftShape;

      if (parsed.profile) setProfileState(parsed.profile);
      if (Array.isArray(parsed.workSegments)) setWorkSegments(parsed.workSegments);
      if (Array.isArray(parsed.sleepSegments)) setSleepSegments(parsed.sleepSegments);
      if (parsed.collector) setCollectorState(parsed.collector);
      if (typeof parsed.stepIndex === 'number') setStepIndex(clamp(parsed.stepIndex, 0, 2));
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  // SAVE (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
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
  }, [collector, hydrated, profile, sleepSegments, stepIndex, workSegments]);

  // helpers with “updater function” signature (nice for components)
  const setProfile = (updater: (p: ParticipantProfile) => ParticipantProfile) => {
    setProfileState((p) => updater(p));
  };

  const setCollector = (updater: (c: CollectorState) => CollectorState) => {
    setCollectorState((c) => updater(c));
  };

  function resetAll() {
    setProfileState(DEFAULT_PROFILE);
    setWorkSegments([]);
    setSleepSegments([]);
    setCollectorState(DEFAULT_COLLECTOR);
    setStepIndex(0);

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  return {
    hydrated,

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
  };
}