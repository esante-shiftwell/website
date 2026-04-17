export type Locale = 'fr' | 'en' | 'de';

export type SegmentKind = 'work' | 'sleep';

export type WeekSegment = {
  id: string;
  day: number; // 0..6
  startMin: number; // 0..1439
  endMin: number; // 0..1439
  overnight: boolean;
};

export type ProfileMode = 'short' | 'long';

export type ParticipantProfile = {
  mode: ProfileMode;
  profession: string;
  ageBand: string;
  sex: '' | 'female' | 'male' | 'other' | 'prefer_not_to_say';
  chronotype: '' | 'morning' | 'intermediate' | 'evening';
  fatigue: number; // 1..5
  schedulePredictability: number; // 1..5
  commuteMinutes: number;
  napsPerWeek: number;
  caffeineCups: number;
};

export type DerivedMetrics = {
  totalWorkHours: number;
  longShiftCount: number;
  count24hBreaks: number;
  longestRecoveryHours: number;
  shortBreaksCount: number;
  restDaysCount: number;
  fullyRestedDaysCount: number;
  nightShiftCount: number;
  biologicalHoursLost: number;
  socialHoursLost: number;
  avgSleepHours: number;
  totalSleepHours: number;
  sleepRegularityProxy: number; // 0..100
};

export type Scores = {
  risk: number; // 0..100 (100 = risqué)
  sleep: number; // 0..100 (100 = bon)
  adaptability: number; // 0..100
};

export type CollectorState = {
  endpoint: string;
  consent: boolean;
  includeAnonymousId: boolean;
};

export type SegmentDraft = {
  day: number;
  startMin: number;
  endMin: number;
  overnight: boolean;
};
