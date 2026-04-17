import type {
  AnalysisDraft,
  DerivedMetrics as CoreDerivedMetrics,
  LongAnswers,
  ParticipantProfile as CoreProfile,
  RawSegment,
} from '@/core/model';
import { calculateScores } from '@/core/scoring';
import type {
  Locale,
  ParticipantProfile as AnalyzeProfile,
  Scores,
  WeekSegment,
} from '@/components/analyze/types';

export type AnalyzeCoreResult = {
  draft: AnalysisDraft;
  derived: CoreDerivedMetrics;
  scores: Scores;
  scoreBundle: ReturnType<typeof calculateScores>;
};

function timeStringFromMinutes(min: number) {
  const value = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(value / 60);
  const m = value % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function toCoreProfile(profile: AnalyzeProfile, locale: Locale, timezone: string): CoreProfile {
  return {
    professionCategory: profile.profession || 'unknown',
    ageBand: profile.ageBand || 'unknown',
    sex: profile.sex || 'prefer_not_to_say',
    locale,
    timezone,
  };
}

function toLongAnswers(profile: AnalyzeProfile): LongAnswers {
  return {
    fatigue: profile.mode === 'long' ? profile.fatigue * 2 : undefined,
    sleepQuality: undefined,
    lateCaffeine: profile.mode === 'long' ? profile.caffeineCups >= 3 : undefined,
  };
}

function toRawSegments(kind: 'work' | 'sleep', segments: WeekSegment[]): RawSegment[] {
  return segments.map((segment) => ({
    id: segment.id,
    dayIndex: segment.day,
    start: timeStringFromMinutes(segment.startMin),
    end: timeStringFromMinutes(segment.endMin),
    kind,
  }));
}

export function buildAnalysisDraftFromUi(args: {
  locale: Locale;
  profile: AnalyzeProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];
  participantCode?: string;
  timezone?: string;
  updatedAt?: string;
}): AnalysisDraft {
  const timezone =
    args.timezone ??
    (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  const updatedAt = args.updatedAt ?? new Date().toISOString();

  return {
    participantCode: args.participantCode ?? 'local-preview',
    mode: args.profile.mode,
    profile: toCoreProfile(args.profile, args.locale, timezone),
    segments: [
      ...toRawSegments('work', args.workSegments),
      ...toRawSegments('sleep', args.sleepSegments),
    ],
    longAnswers: toLongAnswers(args.profile),
    updatedAt,
  };
}

export function analyzeUiSchedule(args: {
  locale: Locale;
  profile: AnalyzeProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];
  participantCode?: string;
  timezone?: string;
  updatedAt?: string;
}): AnalyzeCoreResult {
  const draft = buildAnalysisDraftFromUi(args);
  const scoreBundle = calculateScores(draft);

  return {
    draft,
    derived: scoreBundle.derived,
    scores: {
      risk: scoreBundle.riskScore,
      sleep: scoreBundle.sleepScore,
      adaptability: scoreBundle.adaptabilityScore,
    },
    scoreBundle,
  };
}
