import type {
  Locale,
  ParticipantProfile,
  WeekSegment,
  DerivedMetrics as AnalyzeDerivedMetrics,
} from '@/components/analyze/types';

export type Scores = { risk: number; sleep: number; adaptability: number };

// On réutilise le DerivedMetrics "source of truth" (celui de analyze/types)
export type DerivedMetrics = AnalyzeDerivedMetrics;

// Focus key convention:
// - score.*         ex: score.adaptability
// - profile.*       ex: profile.fatigue
// - derived.*       ex: derived.totalSleepHours
// - schedule        ex: schedule
export type ExplainFocus =
  | { kind: 'score'; key: `score.${'risk' | 'sleep' | 'adaptability'}`; label?: string }
  | { kind: 'field'; key: string; label?: string }
  | { kind: 'metric'; key: string; label?: string }
  | { kind: 'schedule'; key: 'schedule'; label?: string };

export type ExplainabilityState = {
  locale: Locale;
  scoringVersion: string;

  profile: ParticipantProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];

  derived: DerivedMetrics;
  scores: Scores;
};

export type ComputeScoresFn = (derived: DerivedMetrics, profile: ParticipantProfile) => Scores;