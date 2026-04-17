import type { Locale } from '@/components/analyze/types';

export type NodeKind = 'score' | 'metric' | 'input' | 'group';

export type FormulaNode = {
  key: string;
  kind: NodeKind;
  title: Record<Locale, string>;
  summary?: Record<Locale, string>;
  uses?: string[];
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

const PAPER_URL =
  'https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full';

function methodEvidence() {
  return [{ label: 'Method page', url: '/method/' }];
}

function paperEvidence() {
  return [{ label: 'Frontiers paper', url: PAPER_URL }];
}

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
    title('AdaptabilitÃ©', 'Adaptability', 'Anpassung') as Record<Locale, string>,
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
      {
        key: 'score.adaptability',
        kind: 'score',
        title: L_ADAPT,
        summary: summary(
          'Score principal : compatibilitÃ© travail/sommeil sur 7 jours.',
          'Main score: work/sleep compatibility over 7 days.',
          'Hauptscore: KompatibilitÃ¤t Arbeit/Schlaf Ã¼ber 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['score.sleep', 'score.risk'],
        evidence: [...methodEvidence(), ...paperEvidence()],
      },
      {
        key: 'score.sleep',
        kind: 'score',
        title: L_SLEEP,
        summary: summary(
          'Proxy sommeil basÃ© sur durÃ©e + rÃ©gularitÃ©.',
          'Sleep proxy based on duration + regularity.',
          'Schlaf-Proxy basierend auf Dauer + RegelmÃ¤ÃŸigkeit.',
        ) as Record<Locale, string>,
        uses: ['derived.totalSleepHours', 'derived.avgSleepHours', 'derived.sleepRegularityProxy'],
        evidence: methodEvidence(),
      },
      {
        key: 'score.risk',
        kind: 'score',
        title: L_RISK,
        summary: summary(
          'Proxy risque sensible Ã  la nuit et aux gaps sans sommeil.',
          'Risk proxy sensitive to night work and long sleep gaps.',
          'Risiko-Proxy sensitiv fÃ¼r Nachtarbeit und lange SchlaflÃ¼cken.',
        ) as Record<Locale, string>,
        uses: ['derived.totalWorkHours', 'derived.nightShiftCount', 'derived.shortBreaksCount'],
        evidence: [...methodEvidence(), ...paperEvidence()],
      },
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
          'Summe der Schlafsegmente Ã¼ber 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
        evidence: methodEvidence(),
      },
      {
        key: 'derived.avgSleepHours',
        kind: 'metric',
        title: title('Sommeil moyen (h)', 'Average sleep (h)', 'Ø Schlaf (h)') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Durée moyenne de sommeil sur la semaine.',
          'Average sleep duration across the week.',
          'Durchschnittliche Schlafdauer über die Woche.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
        evidence: methodEvidence(),
      },
      {
        key: 'derived.sleepRegularityProxy',
        kind: 'metric',
        title: title(
          'Régularité sommeil (proxy)',
          'Sleep regularity (proxy)',
          'Schlafregelmäßigkeit (Proxy)',
        ) as Record<Locale, string>,
        summary: summary(
          'Proxy de régularité basé sur le sommeil hebdomadaire.',
          'Regularity proxy based on weekly sleep timing.',
          'Regelmäßigkeits-Proxy auf Basis des Wochenschlafs.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
        evidence: methodEvidence(),
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
          'Summe der Arbeitssegmente Ã¼ber 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['schedule.workSegments'],
        evidence: methodEvidence(),
      },
      {
        key: 'derived.nightShiftCount',
        kind: 'metric',
        title: title('Shifts de nuit', 'Night shifts', 'Nachtschichten') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Nombre de shifts détectés comme nuit via une fenêtre biologique proxy.',
          'Count of shifts detected as night shifts through a biological proxy window.',
          'Anzahl als Nachtschicht erkannter Segmente via biologisches Proxy-Fenster.',
        ) as Record<Locale, string>,
        uses: ['schedule.workSegments'],
        evidence: [...methodEvidence(), ...paperEvidence()],
      },
      {
        key: 'schedule.workSegments',
        kind: 'input',
        title: title('Agenda travail', 'Work schedule', 'Arbeitsplan') as Record<Locale, string>,
        summary: summary(
          'Segments travail renseignÃ©s (clic semaine).',
          'Entered work segments (weekly click).',
          'Eingegebene Arbeitssegmente (Wochenklick).',
        ) as Record<Locale, string>,
        evidence: methodEvidence(),
      },
      {
        key: 'schedule.sleepSegments',
        kind: 'input',
        title: title('Agenda sommeil', 'Sleep schedule', 'Schlafplan') as Record<Locale, string>,
        summary: summary(
          'Segments sommeil renseignÃ©s (clic semaine).',
          'Entered sleep segments (weekly click).',
          'Eingegebene Schlafsegmente (Wochenklick).',
        ) as Record<Locale, string>,
        evidence: methodEvidence(),
      },
      {
        key: 'profile.fatigue',
        kind: 'input',
        title: title('Fatigue (0â€“5)', 'Fatigue (0â€“5)', 'MÃ¼digkeit (0â€“5)') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Champ profil (peut Ãªtre peu utilisÃ© en v0.1).',
          'Profile field (may be lightly used in v0.1).',
          'Profilfeld (evtl. wenig genutzt in v0.1).',
        ) as Record<Locale, string>,
        evidence: methodEvidence(),
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
