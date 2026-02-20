import type { Locale } from '@/i18n';

export type QuestionnaireMode = 'short' | 'long';
export type SegmentKind = 'work' | 'sleep';

export interface RawSegment {
  id: string;
  dayIndex: number; // 0..6
  start: string; // HH:MM
  end: string; // HH:MM
  kind: SegmentKind;
}

export interface LongAnswers {
  fatigue?: number; // 0..10
  sleepQuality?: number; // 0..10
  lateCaffeine?: boolean;
}

export interface ParticipantProfile {
  professionCategory: string;
  ageBand: string;
  sex: string;
  locale: Locale;
  timezone: string;
}

export interface AnalysisDraft {
  participantCode: string;
  mode: QuestionnaireMode;
  profile: ParticipantProfile;
  segments: RawSegment[];
  longAnswers: LongAnswers;
  updatedAt: string;
}

export interface DerivedMetrics {
  totalWorkHours: number;
  longShiftCount: number;
  longestRecoveryHours: number;
  shortBreaksCount: number;
  fullyRestedDaysCount: number;
  nightShiftCount: number;
  biologicalHoursLost: number;
  socialHoursLost: number;

  avgSleepHours: number;
  totalSleepHours: number;
  sleepRegularityProxy: number; // 0..100
}

export interface ScoreBundle {
  riskScore: number; // 0..100
  sleepScore: number; // 0..100
  adaptabilityScore: number; // 0..100
  sliRaw: number; // 0..16 (proxy)
  sliItemScores: Record<string, number>;
  derived: DerivedMetrics;
  explanations: string[];
  scoringVersion: string;
  referenceDelta?: {
    riskScore?: number;
    sleepScore?: number;
    adaptabilityScore?: number;
  };
}

export interface ContributionConsent {
  explicitStudyConsent: boolean;
  recontactConsent: boolean;
  consentNoticeVersion: string;
  consentAt: string;
}