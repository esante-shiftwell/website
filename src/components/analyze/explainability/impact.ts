import type { RecomputeScoresFn, ExplainFocus, ExplainabilityState, Scores } from './types';

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

function addOneHourSleep(state: ExplainabilityState): ExplainabilityState['sleepSegments'] {
  const segments = [...state.sleepSegments];
  const first = segments[0];

  if (!first) {
    return [
      {
        id: 'sim_sleep',
        day: 0,
        startMin: 22 * 60,
        endMin: 23 * 60,
        overnight: false,
      },
    ];
  }

  if (!first.overnight && first.endMin <= 23 * 60) {
    segments[0] = { ...first, endMin: clamp(first.endMin + 60, 0, 1439) };
    return segments;
  }

  return [
    ...segments,
    {
      id: 'sim_sleep_extra',
      day: first.day,
      startMin: 21 * 60,
      endMin: 22 * 60,
      overnight: false,
    },
  ];
}

function simulateByTweak(
  focus: ExplainFocus,
  state: ExplainabilityState,
  recomputeScores: RecomputeScoresFn,
): Impact['simulatedDelta'] | null {
  const before = state.scores;
  const nextProfile = { ...state.profile };
  const profileRec = nextProfile as unknown as Record<string, unknown>;

  if (focus.kind === 'score' || focus.kind === 'schedule') {
    const after = recomputeScores({
      profile: nextProfile,
      workSegments: state.workSegments,
      sleepSegments: addOneHourSleep(state),
    });

    return {
      title: '+1h sleep (simulated through core pipeline)',
      before,
      after,
      delta: deltaScores(before, after),
      note: 'Exploratory simulation routed through the current core scoring pipeline.',
    };
  }

  if (focus.kind === 'field' && focus.key.startsWith('profile.')) {
    const key = focus.key.replace('profile.', '');
    const value = profileRec[key];

    if (typeof value === 'number') {
      const bump = key.includes('Minutes') ? 10 : 1;
      profileRec[key] = clamp(value + bump, 0, 9999);
      const after = recomputeScores({
        profile: nextProfile,
        workSegments: state.workSegments,
        sleepSegments: state.sleepSegments,
      });

      return {
        title: `${focus.key} + ${bump} (simulated through core pipeline)`,
        before,
        after,
        delta: deltaScores(before, after),
      };
    }
  }

  return null;
}

export function computeImpactForFocus(
  focus: ExplainFocus | null,
  state: ExplainabilityState,
  recomputeScores: RecomputeScoresFn,
  ui: {
    metric: (k: string) => string;
    score: (k: 'risk' | 'sleep' | 'adaptability') => string;
    notUsed: string;
  },
): Impact {
  if (!focus) return { scores: [], metrics: [] };

  const map: Record<string, { scores: Array<'risk' | 'sleep' | 'adaptability'>; metrics: string[] }> = {
    'score.adaptability': {
      scores: ['adaptability'],
      metrics: ['score.risk', 'score.sleep', 'derived.totalSleepHours', 'derived.biologicalHoursLost'],
    },
    'score.risk': {
      scores: ['risk', 'adaptability'],
      metrics: ['derived.totalWorkHours', 'derived.nightShiftCount', 'derived.shortBreaksCount'],
    },
    'score.sleep': {
      scores: ['sleep', 'adaptability'],
      metrics: ['derived.totalSleepHours', 'derived.avgSleepHours', 'derived.sleepRegularityProxy'],
    },
    'profile.fatigue': { scores: ['risk', 'adaptability'], metrics: ['profile.fatigue'] },
    'profile.schedulePredictability': {
      scores: ['risk', 'adaptability'],
      metrics: ['profile.schedulePredictability'],
    },
    'profile.commuteMinutes': { scores: ['risk'], metrics: ['profile.commuteMinutes'] },
    'derived.totalWorkHours': { scores: ['risk'], metrics: ['derived.totalWorkHours'] },
    'derived.totalSleepHours': { scores: ['sleep', 'adaptability'], metrics: ['derived.totalSleepHours'] },
    'derived.avgSleepHours': { scores: ['sleep', 'adaptability'], metrics: ['derived.avgSleepHours'] },
    'derived.longShiftCount': { scores: ['risk'], metrics: ['derived.longShiftCount'] },
    'derived.shortBreaksCount': { scores: ['risk'], metrics: ['derived.shortBreaksCount'] },
    'derived.nightShiftCount': { scores: ['risk', 'adaptability'], metrics: ['derived.nightShiftCount'] },
    'derived.biologicalHoursLost': {
      scores: ['risk', 'adaptability'],
      metrics: ['derived.biologicalHoursLost'],
    },
    'derived.socialHoursLost': { scores: ['risk'], metrics: ['derived.socialHoursLost'] },
    'derived.sleepRegularityProxy': {
      scores: ['sleep', 'adaptability'],
      metrics: ['derived.sleepRegularityProxy'],
    },
    schedule: {
      scores: ['risk', 'sleep', 'adaptability'],
      metrics: [
        'schedule.workSegments',
        'schedule.sleepSegments',
        'derived.totalWorkHours',
        'derived.totalSleepHours',
      ],
    },
  };

  const entry = map[focus.key] ?? null;

  if (!entry) {
    return {
      scores: [],
      metrics: [],
      warnings: [ui.notUsed],
      simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
    };
  }

  return {
    scores: entry.scores.map((key) => ({ key, label: ui.score(key) })),
    metrics: entry.metrics.map((key) => ({ key, label: ui.metric(key) })),
    simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
  };
}
