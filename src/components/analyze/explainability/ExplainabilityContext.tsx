'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ExplainFocus, ExplainabilityState, RecomputeScoresFn } from './types';

type ExplainabilityContextValue = {
  locale: ExplainabilityState['locale'];
  state: ExplainabilityState;
  recomputeScores: RecomputeScoresFn;
  isOpen: boolean;
  focus: ExplainFocus | null;
  open: () => void;
  close: () => void;
  setFocus: (focus: ExplainFocus | null) => void;
  openWithFocus: (focus: ExplainFocus) => void;
  focusField: (key: string, label?: string) => void;
  focusScore: (key: 'risk' | 'sleep' | 'adaptability', label?: string) => void;
  focusMetric: (key: string, label?: string) => void;
  focusSchedule: (label?: string) => void;
};

const ExplainabilityContext = createContext<ExplainabilityContextValue | null>(null);

export function ExplainabilityProvider({
  locale,
  state,
  recomputeScores,
  children,
}: {
  locale: ExplainabilityState['locale'];
  state: ExplainabilityState;
  recomputeScores: RecomputeScoresFn;
  children: React.ReactNode;
}) {
  const [isOpen, setOpen] = useState(false);
  const [focus, setFocusState] = useState<ExplainFocus | null>(null);

  const api = useMemo<ExplainabilityContextValue>(
    () => ({
      locale,
      state,
      recomputeScores,
      isOpen,
      focus,
      open: () => setOpen(true),
      close: () => setOpen(false),
      setFocus: (nextFocus) => setFocusState(nextFocus),
      openWithFocus: (nextFocus) => {
        setFocusState(nextFocus);
        setOpen(true);
      },
      focusField: (key, label) => setFocusState({ kind: 'field', key, label }),
      focusMetric: (key, label) => setFocusState({ kind: 'metric', key, label }),
      focusScore: (key, label) => setFocusState({ kind: 'score', key: `score.${key}`, label }),
      focusSchedule: (label) => setFocusState({ kind: 'schedule', key: 'schedule', label }),
    }),
    [focus, isOpen, locale, recomputeScores, state],
  );

  return <ExplainabilityContext.Provider value={api}>{children}</ExplainabilityContext.Provider>;
}

export function useExplainability() {
  const ctx = useContext(ExplainabilityContext);
  if (!ctx) throw new Error('useExplainability must be used inside ExplainabilityProvider');
  return ctx;
}
