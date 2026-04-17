import type {
  AnalysisValidity,
  Locale,
  ParticipantProfile,
  WeekSegment,
  DerivedMetrics as AnalyzeDerivedMetrics,
} from '@/components/analyze/types';
import type { ScoreTrace } from '@/core/model';

export type Scores = { risk: number; sleep: number; adaptability: number };

export type DerivedMetrics = AnalyzeDerivedMetrics;

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
  validity: AnalysisValidity;
  trace: ScoreTrace;
};

export type RecomputeScoresFn = (args: {
  profile: ParticipantProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];
}) => Scores;
