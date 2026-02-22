'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CollectorState, Locale, ParticipantProfile } from '@/components/analyze/types';
import type { DayPartSegment } from '@/components/analyze/calendar/scheduleUtils';
import { clamp } from '@/components/analyze/utils';

const STORAGE_KEY_SHARED = 'shiftwell:draft:v3:shared';
const storageKeyPerLocale = (locale: Locale) => `shiftwell:draft:v3:${locale}`;

// -------------------- defaults --------------------

function defaultProfile(): ParticipantProfile {
  return {
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
}

function defaultCollector(): CollectorState {
  return {
    endpoint: '',
    consent: false,
    includeAnonymousId: true,
  };
}

type Draft = {
  stepIndex: number;
  profile: ParticipantProfile;
  workSegments: DayPartSegment[];
  sleepSegments: DayPartSegment[];
  collector: CollectorState;
  lastLocale?: Locale;
};

function defaultDraft(locale: Locale): Draft {
  return {
    stepIndex: 0,
    profile: defaultProfile(),
    workSegments: [],
    sleepSegments: [],
    collector: defaultCollector(),
    lastLocale: locale,
  };
}

function safeParseDraft(raw: string | null, locale: Locale): Draft | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<Draft>;
    if (!d || typeof d !== 'object') return null;

    return {
      stepIndex: typeof d.stepIndex === 'number' ? clamp(d.stepIndex, 0, 2) : 0,
      profile: (d.profile as ParticipantProfile) ?? defaultProfile(),
      workSegments: Array.isArray(d.workSegments) ? (d.workSegments as DayPartSegment[]) : [],
      sleepSegments: Array.isArray(d.sleepSegments) ? (d.sleepSegments as DayPartSegment[]) : [],
      collector: (d.collector as CollectorState) ?? defaultCollector(),
      lastLocale: d.lastLocale ?? locale,
    };
  } catch {
    return null;
  }
}

// -------------------- hook --------------------

export function useAnalyzeDraft(locale: Locale) {
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => defaultDraft(locale));

  // ✅ setter helpers (stables)
  const setStepIndex = useMemo(() => {
    return (next: number | ((prev: number) => number)) => {
      setDraft((prev) => ({
        ...prev,
        stepIndex: typeof next === 'function' ? (next as (p: number) => number)(prev.stepIndex) : next,
      }));
    };
  }, []);

  const setProfile = useMemo(() => {
    return (next: ParticipantProfile | ((prev: ParticipantProfile) => ParticipantProfile)) => {
      setDraft((prev) => ({
        ...prev,
        profile: typeof next === 'function' ? (next as (p: ParticipantProfile) => ParticipantProfile)(prev.profile) : next,
      }));
    };
  }, []);

  const setWorkSegments = useMemo(() => {
    return (next: DayPartSegment[] | ((prev: DayPartSegment[]) => DayPartSegment[])) => {
      setDraft((prev) => ({
        ...prev,
        workSegments: typeof next === 'function' ? (next as (p: DayPartSegment[]) => DayPartSegment[])(prev.workSegments) : next,
      }));
    };
  }, []);

  const setSleepSegments = useMemo(() => {
    return (next: DayPartSegment[] | ((prev: DayPartSegment[]) => DayPartSegment[])) => {
      setDraft((prev) => ({
        ...prev,
        sleepSegments: typeof next === 'function' ? (next as (p: DayPartSegment[]) => DayPartSegment[])(prev.sleepSegments) : next,
      }));
    };
  }, []);

  // ✅ IMPORTANT: signature "updater-only" (comme tu utilises partout)
  const setCollector = useMemo(() => {
    return (updater: (c: CollectorState) => CollectorState) => {
      setDraft((prev) => ({ ...prev, collector: updater(prev.collector) }));
    };
  }, []);

  // Load (shared), sinon migration depuis la clé locale v3
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ⚠️ ESLint: pas de setState "synchrone" dans l'effect → on décale en microtask
    queueMicrotask(() => {
      const shared = safeParseDraft(localStorage.getItem(STORAGE_KEY_SHARED), locale);
      if (shared) {
        setDraft(shared);
        setHydrated(true);
        return;
      }

      const legacy = safeParseDraft(localStorage.getItem(storageKeyPerLocale(locale)), locale);
      if (legacy) {
        setDraft(legacy);
        try {
          localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify({ ...legacy, lastLocale: locale }));
          localStorage.removeItem(storageKeyPerLocale(locale));
        } catch {
          // ignore
        }
      }

      setHydrated(true);
    });
  }, [locale]);

  // Save (shared)
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;

    const toSave: Draft = { ...draft, lastLocale: locale };

    try {
      localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [draft, hydrated, locale]);

  function resetAll() {
    setDraft(defaultDraft(locale));
    try {
      localStorage.removeItem(STORAGE_KEY_SHARED);
    } catch {
      // ignore
    }
  }

  return {
    stepIndex: draft.stepIndex,
    setStepIndex,

    profile: draft.profile,
    setProfile,

    workSegments: draft.workSegments,
    setWorkSegments,

    sleepSegments: draft.sleepSegments,
    setSleepSegments,

    collector: draft.collector,
    setCollector,

    resetAll,
  };
}