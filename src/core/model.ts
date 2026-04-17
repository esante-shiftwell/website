import type { Locale } from '@/i18n';

export type QuestionnaireMode = 'short' | 'long';
export type SegmentKind = 'work' | 'sleep';

export interface RawSegment {
  id: string;
  dayIndex: number;
  start: string;
  end: string;
  kind: SegmentKind;
}

export interface LongAnswers {
  fatigue?: number;
  sleepQuality?: number;
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
  sleepRegularityProxy: number;
}

export interface EvidenceRef {
  id: string;
  sourceType: 'workbook' | 'pdf' | 'article' | 'code';
  source: string;
  locator: string;
  note?: string;
}

export interface FactorEvaluation {
  key: string;
  label: string;
  value: number;
  bucket?: number;
  contribution?: number;
  formulaRef: string;
  evidenceRefs: string[];
  dependsOn: string[];
  status: 'implemented' | 'proxy' | 'missing' | 'disputed';
}

export interface ScoreEvaluation {
  key: 'riskScore' | 'sleepScore' | 'adaptabilityScore';
  label: string;
  value: number;
  formulaRef: string;
  evidenceRefs: string[];
  dependsOn: string[];
  status: 'implemented' | 'proxy' | 'missing' | 'disputed';
}

export interface ScoreTrace {
  scoringVersion: string;
  factors: FactorEvaluation[];
  scores: ScoreEvaluation[];
  evidence: EvidenceRef[];
}

export interface ScoreBundle {
  riskScore: number;
  sleepScore: number;
  adaptabilityScore: number;
  sliRaw: number;
  sliItemScores: Record<string, number>;
  derived: DerivedMetrics;
  explanations: string[];
  scoringVersion: string;
  trace: ScoreTrace;
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
