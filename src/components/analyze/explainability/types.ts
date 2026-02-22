import type { Locale, ParticipantProfile, WeekSegment } from '@/components/analyze/types';

export type Scores = { risk: number; sleep: number; adaptability: number };

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

  derived: any;
  scores: Scores;
};

export type ComputeScoresFn = (derived: any, profile: ParticipantProfile) => Scores;