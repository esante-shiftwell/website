import type { Locale } from '@/components/analyze/types';

export type NodeKind = 'score' | 'metric' | 'input' | 'group';

export type FormulaNode = {
  key: string; // ex: "score.adaptability", "derived.totalSleepHours", "profile.fatigue"
  kind: NodeKind;

  title: Record<Locale, string>;
  summary?: Record<Locale, string>;

  // relations (data-driven)
  uses?: string[]; // keys used by this node

  // optional evidence links (later you can expand)
  evidence?: Array<{ label: string; url: string }>;
};

export type FormulaMap = {
  scoringVersion: string;
  nodes: FormulaNode[];
};

type FormulaCopyOverrides = Partial<{
  scoreAdapt: string;
  scoreSleep: string;
  scoreRisk: string;
}>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getString(v: unknown, key: string): string | undefined {
  if (!isRecord(v)) return undefined;
  const x = v[key];
  return typeof x === 'string' ? x : undefined;
}

function title(fr: string, en: string, de: string) {
  return { fr, en, de } as const;
}

function summary(fr: string, en: string, de: string) {
  return { fr, en, de } as const;
}

function withLocaleOverride(
  base: Record<Locale, string>,
  locale: Locale,
  override?: string,
): Record<Locale, string> {
  if (!override) return base;
  return { ...base, [locale]: override } as Record<Locale, string>;
}

export function buildFormulaMap(locale: Locale, t: unknown): FormulaMap {
  const overrides: FormulaCopyOverrides = {
    scoreAdapt: getString(t, 'scoreAdapt'),
    scoreSleep: getString(t, 'scoreSleep'),
    scoreRisk: getString(t, 'scoreRisk'),
  };

  const L_ADAPT = withLocaleOverride(
    title('Adaptabilité', 'Adaptability', 'Anpassung') as Record<Locale, string>,
    locale,
    overrides.scoreAdapt,
  );
  const L_SLEEP = withLocaleOverride(
    title('Sommeil', 'Sleep', 'Schlaf') as Record<Locale, string>,
    locale,
    overrides.scoreSleep,
  );
  const L_RISK = withLocaleOverride(
    title('Risque', 'Risk', 'Risiko') as Record<Locale, string>,
    locale,
    overrides.scoreRisk,
  );

  return {
    scoringVersion: 'proxy-v0.1',
    nodes: [
      // ---------------- Scores ----------------
      {
        key: 'score.adaptability',
        kind: 'score',
        title: L_ADAPT,
        summary: summary(
          'Score principal : compatibilité travail/sommeil sur 7 jours.',
          'Main score: work/sleep compatibility over 7 days.',
          'Hauptscore: Kompatibilität Arbeit/Schlaf über 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['score.sleep', 'score.risk'],
      },
      {
        key: 'score.sleep',
        kind: 'score',
        title: L_SLEEP,
        summary: summary(
          'Proxy sommeil basé sur durée + régularité.',
          'Sleep proxy based on duration + regularity.',
          'Schlaf-Proxy basierend auf Dauer + Regelmäßigkeit.',
        ) as Record<Locale, string>,
        uses: ['derived.totalSleepHours', 'derived.sleepDays', 'derived.maxSleepGapHours'],
      },
      {
        key: 'score.risk',
        kind: 'score',
        title: L_RISK,
        summary: summary(
          'Proxy risque sensible à la nuit et aux gaps sans sommeil.',
          'Risk proxy sensitive to night work and long sleep gaps.',
          'Risiko-Proxy sensitiv für Nachtarbeit und lange Schlaflücken.',
        ) as Record<Locale, string>,
        uses: ['derived.nightWorkHours', 'derived.totalWorkHours', 'derived.maxSleepGapHours'],
      },

      // ---------------- Derived metrics ----------------
      {
        key: 'derived.totalSleepHours',
        kind: 'metric',
        title: title('Sommeil total (h)', 'Total sleep (h)', 'Schlaf gesamt (h)') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Somme des segments sommeil sur 7 jours.',
          'Sum of sleep segments over 7 days.',
          'Summe der Schlafsegmente über 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
      },
      {
        key: 'derived.sleepDays',
        kind: 'metric',
        title: title('Jours avec sommeil', 'Days with sleep', 'Tage mit Schlaf') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Nombre de jours (0..7) contenant au moins un segment sommeil.',
          'Number of days (0..7) with at least one sleep segment.',
          'Anzahl der Tage (0..7) mit mindestens einem Schlafsegment.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
      },
      {
        key: 'derived.maxSleepGapHours',
        kind: 'metric',
        title: title(
          'Max gap sans sommeil (h)',
          'Max gap w/o sleep (h)',
          'Max. Schlaflücke (h)',
        ) as Record<Locale, string>,
        summary: summary(
          'Plus longue période sans sommeil sur la semaine (circulaire).',
          'Longest no-sleep gap over the week (circular).',
          'Längste Zeit ohne Schlaf über die Woche (zirkulär).',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
      },
      {
        key: 'derived.totalWorkHours',
        kind: 'metric',
        title: title('Travail total (h)', 'Total work (h)', 'Arbeit gesamt (h)') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Somme des segments travail sur 7 jours.',
          'Sum of work segments over 7 days.',
          'Summe der Arbeitssegmente über 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['schedule.workSegments'],
      },
      {
        key: 'derived.nightWorkHours',
        kind: 'metric',
        title: title(
          'Travail de nuit (h)',
          'Night work (h)',
          'Nachtarbeit (h)',
        ) as Record<Locale, string>,
        summary: summary(
          'Heures de travail la nuit (proxy selon découpage).',
          'Hours worked at night (proxy based on time window).',
          'Arbeitsstunden nachts (Proxy je Zeitfenster).',
        ) as Record<Locale, string>,
        uses: ['schedule.workSegments'],
      },

      // ---------------- Inputs (profile / schedule) ----------------
      {
        key: 'schedule.workSegments',
        kind: 'input',
        title: title('Agenda travail', 'Work schedule', 'Arbeitsplan') as Record<Locale, string>,
        summary: summary(
          'Segments travail renseignés (clic semaine).',
          'Entered work segments (weekly click).',
          'Eingegebene Arbeitssegmente (Wochenklick).',
        ) as Record<Locale, string>,
      },
      {
        key: 'schedule.sleepSegments',
        kind: 'input',
        title: title('Agenda sommeil', 'Sleep schedule', 'Schlafplan') as Record<Locale, string>,
        summary: summary(
          'Segments sommeil renseignés (clic semaine).',
          'Entered sleep segments (weekly click).',
          'Eingegebene Schlafsegmente (Wochenklick).',
        ) as Record<Locale, string>,
      },
      {
        key: 'profile.fatigue',
        kind: 'input',
        title: title('Fatigue (0–5)', 'Fatigue (0–5)', 'Müdigkeit (0–5)') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Champ profil (peut être peu utilisé en v0.1).',
          'Profile field (may be lightly used in v0.1).',
          'Profilfeld (evtl. wenig genutzt in v0.1).',
        ) as Record<Locale, string>,
      },
    ],
  };
}

export function getNode(map: FormulaMap, key: string) {
  return map.nodes.find((n) => n.key === key) ?? null;
}

export function getUsedBy(map: FormulaMap, key: string) {
  const out: FormulaNode[] = [];
  for (const n of map.nodes) {
    if ((n.uses ?? []).includes(key)) out.push(n);
  }
  return out;
}