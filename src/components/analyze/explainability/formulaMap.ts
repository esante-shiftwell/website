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

export function buildFormulaMap(locale: Locale, t: any): FormulaMap {
  // labels: reuse your i18n where possible
  const title = (fr: string, en: string, de: string) => ({ fr, en, de } as const);
  const summary = (fr: string, en: string, de: string) => ({ fr, en, de } as const);

  // scores labels from your TEXT
  const L_ADAPT = t?.scoreAdapt ?? title('Adaptabilité', 'Adaptability', 'Anpassung')[locale];
  const L_SLEEP = t?.scoreSleep ?? title('Sommeil', 'Sleep', 'Schlaf')[locale];
  const L_RISK = t?.scoreRisk ?? title('Risque', 'Risk', 'Risiko')[locale];

  return {
    scoringVersion: 'proxy-v0.1',
    nodes: [
      // ---------------- Scores ----------------
      {
        key: 'score.adaptability',
        kind: 'score',
        title: title(L_ADAPT, L_ADAPT, L_ADAPT),
        summary: summary(
          'Score principal : compatibilité travail/sommeil sur 7 jours.',
          'Main score: work/sleep compatibility over 7 days.',
          'Hauptscore: Kompatibilität Arbeit/Schlaf über 7 Tage.',
        ),
        uses: ['score.sleep', 'score.risk'],
      },
      {
        key: 'score.sleep',
        kind: 'score',
        title: title(L_SLEEP, L_SLEEP, L_SLEEP),
        summary: summary(
          'Proxy sommeil basé sur durée + régularité.',
          'Sleep proxy based on duration + regularity.',
          'Schlaf-Proxy basierend auf Dauer + Regelmäßigkeit.',
        ),
        uses: ['derived.totalSleepHours', 'derived.sleepDays', 'derived.maxSleepGapHours'],
      },
      {
        key: 'score.risk',
        kind: 'score',
        title: title(L_RISK, L_RISK, L_RISK),
        summary: summary(
          'Proxy risque sensible à la nuit et aux gaps sans sommeil.',
          'Risk proxy sensitive to night work and long sleep gaps.',
          'Risiko-Proxy sensitiv für Nachtarbeit und lange Schlaflücken.',
        ),
        uses: ['derived.nightWorkHours', 'derived.totalWorkHours', 'derived.maxSleepGapHours'],
      },

      // ---------------- Derived metrics ----------------
      {
        key: 'derived.totalSleepHours',
        kind: 'metric',
        title: title('Sommeil total (h)', 'Total sleep (h)', 'Schlaf gesamt (h)'),
        summary: summary(
          'Somme des segments sommeil sur 7 jours.',
          'Sum of sleep segments over 7 days.',
          'Summe der Schlafsegmente über 7 Tage.',
        ),
        uses: ['schedule.sleepSegments'],
      },
      {
        key: 'derived.sleepDays',
        kind: 'metric',
        title: title('Jours avec sommeil', 'Days with sleep', 'Tage mit Schlaf'),
        summary: summary(
          'Nombre de jours (0..7) contenant au moins un segment sommeil.',
          'Number of days (0..7) with at least one sleep segment.',
          'Anzahl der Tage (0..7) mit mindestens einem Schlafsegment.',
        ),
        uses: ['schedule.sleepSegments'],
      },
      {
        key: 'derived.maxSleepGapHours',
        kind: 'metric',
        title: title('Max gap sans sommeil (h)', 'Max gap w/o sleep (h)', 'Max. Schlaflücke (h)'),
        summary: summary(
          'Plus longue période sans sommeil sur la semaine (cerculaire).',
          'Longest no-sleep gap over the week (circular).',
          'Längste Zeit ohne Schlaf über die Woche (zirkulär).',
        ),
        uses: ['schedule.sleepSegments'],
      },
      {
        key: 'derived.totalWorkHours',
        kind: 'metric',
        title: title('Travail total (h)', 'Total work (h)', 'Arbeit gesamt (h)'),
        summary: summary(
          'Somme des segments travail sur 7 jours.',
          'Sum of work segments over 7 days.',
          'Summe der Arbeitssegmente über 7 Tage.',
        ),
        uses: ['schedule.workSegments'],
      },
      {
        key: 'derived.nightWorkHours',
        kind: 'metric',
        title: title('Travail de nuit (h)', 'Night work (h)', 'Nachtarbeit (h)'),
        summary: summary(
          'Heures de travail la nuit (proxy selon découpage).',
          'Hours worked at night (proxy based on time window).',
          'Arbeitsstunden nachts (Proxy je Zeitfenster).',
        ),
        uses: ['schedule.workSegments'],
      },

      // ---------------- Inputs (profile / schedule) ----------------
      {
        key: 'schedule.workSegments',
        kind: 'input',
        title: title('Agenda travail', 'Work schedule', 'Arbeitsplan'),
        summary: summary(
          'Segments travail renseignés (clic semaine).',
          'Entered work segments (weekly click).',
          'Eingegebene Arbeitssegmente (Wochenklick).',
        ),
      },
      {
        key: 'schedule.sleepSegments',
        kind: 'input',
        title: title('Agenda sommeil', 'Sleep schedule', 'Schlafplan'),
        summary: summary(
          'Segments sommeil renseignés (clic semaine).',
          'Entered sleep segments (weekly click).',
          'Eingegebene Schlafsegmente (Wochenklick).',
        ),
      },
      {
        key: 'profile.fatigue',
        kind: 'input',
        title: title('Fatigue (0–5)', 'Fatigue (0–5)', 'Müdigkeit (0–5)'),
        summary: summary(
          'Champ profil (peut être peu utilisé en v0.1).',
          'Profile field (may be lightly used in v0.1).',
          'Profilfeld (evtl. wenig genutzt in v0.1).',
        ),
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