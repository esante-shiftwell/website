import type { ComputeScoresFn, ExplainFocus, ExplainabilityState, Scores } from './types';

type Impact = {
  scores: Array<{ key: 'risk' | 'sleep' | 'adaptability'; label: string }>;
  metrics: Array<{ key: string; label: string }>;
  warnings?: string[];
  simulatedDelta?: {
    title: string;
    before: Scores;
    after: Scores;
    delta: Scores;
    note?: string;
  };
};

function deltaScores(before: Scores, after: Scores): Scores {
  return {
    risk: after.risk - before.risk,
    sleep: after.sleep - before.sleep,
    adaptability: after.adaptability - before.adaptability,
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function simulateByTweak(
  focus: ExplainFocus,
  state: ExplainabilityState,
  computeScores: ComputeScoresFn,
): Impact['simulatedDelta'] | null {
  const before = state.scores;

  // clones typés + accès dynamique safe
  const nextProfile: ExplainabilityState['profile'] = { ...state.profile };
  const nextDerived: ExplainabilityState['derived'] = { ...(state.derived ?? {}) };

  const profileRec = nextProfile as unknown as Record<string, unknown>;
  const derivedRec = nextDerived as Record<string, unknown>;

  // heuristiques simples (tu changes plus tard)
  if (focus.kind === 'score') {
    // simulate "more sleep" when focusing a score
    derivedRec.totalSleepHours = (Number(derivedRec.totalSleepHours) || 0) + 1;
    const after = computeScores(nextDerived, nextProfile);
    return {
      title: '+1h sleep (simulated)',
      before,
      after,
      delta: deltaScores(before, after),
      note: 'Simulation simple (pas une recommandation).',
    };
  }

  if (focus.kind === 'field' && focus.key.startsWith('profile.')) {
    const k = focus.key.replace('profile.', '');
    const v = profileRec[k];

    if (typeof v === 'number') {
      const bump = k.includes('Minutes') ? 10 : 1;
      profileRec[k] = clamp(v + bump, 0, 9999);
      const after = computeScores(nextDerived, nextProfile);
      return {
        title: `${focus.key} + ${bump} (simulated)`,
        before,
        after,
        delta: deltaScores(before, after),
      };
    }

    return null;
  }

  if (focus.kind === 'metric' || (focus.kind === 'field' && focus.key.startsWith('derived.'))) {
    const dk = focus.key.replace('derived.', '');
    const v = Number(derivedRec[dk]);
    if (Number.isFinite(v)) {
      derivedRec[dk] = v + 1;
      const after = computeScores(nextDerived, nextProfile);
      return {
        title: `${focus.key} + 1 (simulated)`,
        before,
        after,
        delta: deltaScores(before, after),
      };
    }
    return null;
  }

  if (focus.kind === 'schedule') {
    derivedRec.totalSleepHours = (Number(derivedRec.totalSleepHours) || 0) + 1;
    const after = computeScores(nextDerived, nextProfile);
    return {
      title: '+1h sleep (simulated)',
      before,
      after,
      delta: deltaScores(before, after),
      note: 'Simulation simple sur une métrique dérivée.',
    };
  }

  return null;
}

export function computeImpactForFocus(
  focus: ExplainFocus | null,
  state: ExplainabilityState,
  computeScores: ComputeScoresFn,
  ui: {
    metric: (k: string) => string;
    score: (k: 'risk' | 'sleep' | 'adaptability') => string;
    notUsed: string;
  },
): Impact {
  if (!focus) return { scores: [], metrics: [] };

  // mapping minimal (tu modifies ici plus tard)
  const map: Record<string, { scores: Array<'risk' | 'sleep' | 'adaptability'>; metrics: string[] }> = {
    // Scores
    'score.adaptability': {
      scores: ['adaptability'],
      metrics: ['score.risk', 'score.sleep', 'derived.totalSleepHours', 'derived.nightWorkHours'],
    },
    'score.risk': {
      scores: ['risk', 'adaptability'],
      metrics: ['derived.nightWorkHours', 'derived.maxSleepGapHours', 'profile.schedulePredictability'],
    },
    'score.sleep': {
      scores: ['sleep', 'adaptability'],
      metrics: ['derived.totalSleepHours', 'derived.sleepDays', 'derived.maxSleepGapHours'],
    },

    // Profile fields (examples)
    'profile.fatigue': { scores: ['risk', 'adaptability'], metrics: ['profile.fatigue'] },
    'profile.schedulePredictability': {
      scores: ['risk', 'adaptability'],
      metrics: ['profile.schedulePredictability'],
    },
    'profile.commuteMinutes': { scores: ['risk'], metrics: ['profile.commuteMinutes'] },

    // Derived
    'derived.totalSleepHours': { scores: ['sleep', 'adaptability'], metrics: ['derived.totalSleepHours'] },
    'derived.nightWorkHours': { scores: ['risk', 'adaptability'], metrics: ['derived.nightWorkHours'] },
    'derived.sleepDays': { scores: ['sleep', 'adaptability'], metrics: ['derived.sleepDays'] },
    'derived.maxSleepGapHours': {
      scores: ['risk', 'sleep', 'adaptability'],
      metrics: ['derived.maxSleepGapHours'],
    },

    // Schedule (global)
    schedule: {
      scores: ['risk', 'sleep', 'adaptability'],
      metrics: ['schedule.workSegments', 'schedule.sleepSegments', 'derived.totalSleepHours', 'derived.nightWorkHours'],
    },
  };

  const key = focus.key;
  const entry = map[key] ?? map[focus.kind === 'field' ? focus.key : ''] ?? null;

  if (!entry) {
    return {
      scores: [],
      metrics: [],
      warnings: [ui.notUsed],
      simulatedDelta: simulateByTweak(focus, state, computeScores) ?? undefined,
    };
  }

  const scores = entry.scores.map((k) => ({ key: k, label: ui.score(k) }));
  const metrics = entry.metrics.map((k) => ({ key: k, label: ui.metric(k) }));

  return {
    scores,
    metrics,
    simulatedDelta: simulateByTweak(focus, state, computeScores) ?? undefined,
  };
}