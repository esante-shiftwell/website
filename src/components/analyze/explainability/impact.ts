import type { EvidenceLink, EvidenceRef, FactorEvaluation, ScoreEvaluation } from '@/core/model';
import type { RecomputeScoresFn, ExplainFocus, ExplainabilityState, Scores } from './types';

type ImpactEvidence = EvidenceRef & {
  resolvedLocator: string;
  resolvedNote?: string;
  quote?: string;
};

type Impact = {
  scores: Array<{ key: 'risk' | 'sleep' | 'adaptability'; label: string }>;
  metrics: Array<{ key: string; label: string }>;
  warnings?: string[];
  formulaRef?: string;
  status?: string;
  evidence?: ImpactEvidence[];
  simulatedDelta?: {
    title: string;
    before: Scores;
    after: Scores;
    delta: Scores;
    note?: string;
  };
};

const SCHEDULE_INPUT_KEYS = ['schedule.workSegments', 'schedule.sleepSegments'] as const;

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
    return [{ id: 'sim_sleep', day: 0, startMin: 22 * 60, endMin: 23 * 60, overnight: false }];
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

function scoreKeyToUiKey(key: ScoreEvaluation['key']): 'risk' | 'sleep' | 'adaptability' {
  if (key === 'riskScore') return 'risk';
  if (key === 'sleepScore') return 'sleep';
  return 'adaptability';
}

function focusToTraceKeys(focus: ExplainFocus) {
  if (focus.kind === 'score') {
    return {
      score:
        focus.key === 'score.risk'
          ? 'riskScore'
          : focus.key === 'score.sleep'
            ? 'sleepScore'
            : 'adaptabilityScore',
    } as const;
  }

  if (focus.kind === 'metric') {
    const metricKey = focus.key.replace(/^derived\./, '');
    return { factor: metricKey } as const;
  }

  return null;
}

function resolveEvidence(refIds: string[], links: EvidenceLink[] | undefined, state: ExplainabilityState): ImpactEvidence[] {
  const evidenceMap = new Map(state.trace.evidence.map((item) => [item.id, item]));
  if (links?.length) {
    const resolved: ImpactEvidence[] = [];
    for (const link of links) {
      const item = evidenceMap.get(link.refId);
      if (!item) continue;
      resolved.push({
          ...item,
          resolvedLocator: link.locator ?? item.locator,
          resolvedNote: link.note ?? item.note,
          quote: link.quote,
        });
    }
    return resolved;
  }

  const resolved: ImpactEvidence[] = [];
  for (const id of refIds) {
    const item = evidenceMap.get(id);
    if (!item) continue;
    resolved.push({
        ...item,
        resolvedLocator: item.locator,
        resolvedNote: item.note,
      });
  }

  return resolved;
}

function uniqueByKey<T extends { key: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

function impactFromSchedule(
  state: ExplainabilityState,
  ui: {
    metric: (k: string) => string;
    score: (k: 'risk' | 'sleep' | 'adaptability') => string;
  },
): Pick<Impact, 'scores' | 'metrics' | 'warnings'> {
  const scores = state.trace.scores.map((score) => {
    const key = scoreKeyToUiKey(score.key);
    return { key, label: ui.score(key) };
  });

  const derivedDependencies = uniqueByKey(
    state.trace.factors.flatMap((factor) =>
      factor.dependsOn
        .filter((dep) => dep.startsWith('derived.'))
        .map((dep) => ({ key: dep, label: ui.metric(dep) })),
    ),
  );

  const metrics = [
    ...SCHEDULE_INPUT_KEYS.map((key) => ({ key, label: ui.metric(key) })),
    ...derivedDependencies,
  ];

  return {
    scores,
    metrics,
  };
}

function impactFromField(
  focus: ExplainFocus & { kind: 'field' },
  state: ExplainabilityState,
  ui: {
    metric: (k: string) => string;
    score: (k: 'risk' | 'sleep' | 'adaptability') => string;
    notUsed: string;
  },
): Pick<Impact, 'scores' | 'metrics' | 'warnings'> {
  const traceFactor = state.trace.factors.find((entry) => entry.dependsOn.includes(focus.key));
  if (traceFactor) {
    return impactFromFactor(traceFactor, state, ui);
  }

  return {
    scores: [],
    metrics: [{ key: focus.key, label: ui.metric(focus.key) }],
    warnings: [ui.notUsed],
  };
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

function impactFromScore(
  score: ScoreEvaluation,
  state: ExplainabilityState,
  ui: {
    metric: (k: string) => string;
    score: (k: 'risk' | 'sleep' | 'adaptability') => string;
  },
): Pick<Impact, 'scores' | 'metrics' | 'formulaRef' | 'status' | 'evidence'> {
  const scores = [scoreKeyToUiKey(score.key)].map((key) => ({ key, label: ui.score(key) }));
  const metrics = score.dependsOn.map((dep) => {
    const isScore = dep.endsWith('Score');
    const key = isScore
      ? dep === 'riskScore'
        ? 'score.risk'
        : dep === 'sleepScore'
          ? 'score.sleep'
          : 'score.adaptability'
      : dep.startsWith('derived.')
        ? dep
        : dep;
    return { key, label: isScore ? ui.score(scoreKeyToUiKey(dep as ScoreEvaluation['key'])) : ui.metric(key) };
  });

  return {
    scores,
    metrics,
    formulaRef: score.formulaRef,
    status: score.status,
    evidence: resolveEvidence(score.evidenceRefs, score.evidenceLinks, state),
  };
}

function impactFromFactor(
  factor: FactorEvaluation,
  state: ExplainabilityState,
  ui: {
    metric: (k: string) => string;
    score: (k: 'risk' | 'sleep' | 'adaptability') => string;
  },
): Pick<Impact, 'scores' | 'metrics' | 'formulaRef' | 'status' | 'evidence'> {
  const scoreDeps = state.trace.scores
    .filter((score) => score.dependsOn.includes(factor.key))
    .map((score) => ({ key: scoreKeyToUiKey(score.key), label: ui.score(scoreKeyToUiKey(score.key)) }));

  const metrics = factor.dependsOn.map((dep) => ({
    key: dep,
    label: ui.metric(dep),
  }));

  return {
    scores: scoreDeps,
    metrics,
    formulaRef: factor.formulaRef,
    status: factor.status,
    evidence: resolveEvidence(factor.evidenceRefs, factor.evidenceLinks, state),
  };
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

  const traceKeys = focusToTraceKeys(focus);

  if (traceKeys?.score) {
    const score = state.trace.scores.find((entry) => entry.key === traceKeys.score);
    if (score) {
      return {
        ...impactFromScore(score, state, ui),
        simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
      };
    }
  }

  if (traceKeys?.factor) {
    const factor = state.trace.factors.find(
      (entry) => entry.key === traceKeys.factor || `derived.${entry.key}` === focus.key,
    );
    if (factor) {
      return {
        ...impactFromFactor(factor, state, ui),
        simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
      };
    }
  }

  if (focus.kind === 'schedule') {
    return {
      ...impactFromSchedule(state, ui),
      simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
    };
  }

  if (focus.kind === 'field') {
    return {
      ...impactFromField(focus, state, ui),
      simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
    };
  }

  return {
    scores: [],
    metrics: [],
    warnings: [ui.notUsed],
    simulatedDelta: simulateByTweak(focus, state, recomputeScores) ?? undefined,
  };
}
