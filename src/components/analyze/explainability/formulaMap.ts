import type { Locale } from '@/components/analyze/types';
import type { ScoreTrace } from '@/core/model';
import { EVIDENCE_DICTIONARY, EVIDENCE_IDS } from '@/core/evidence';

export type NodeKind = 'score' | 'metric' | 'input' | 'group';

export type FormulaEvidenceLink = {
  id: string;
  label: string;
  url?: string;
};

export type FormulaNode = {
  key: string;
  kind: NodeKind;
  title: Record<Locale, string>;
  summary?: Record<Locale, string>;
  uses?: string[];
  evidence?: FormulaEvidenceLink[];
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

const METHOD_EVIDENCE: FormulaEvidenceLink = {
  id: 'method:page',
  label: 'Method page',
  url: '/method/',
};

function sourceEvidence(...ids: string[]): FormulaEvidenceLink[] {
  return ids.map((id) => {
    const ref = EVIDENCE_DICTIONARY[id];
    return {
      id,
      label: ref?.title ?? id,
      url: ref?.href,
    };
  });
}

function traceEvidence(ids: string[]): FormulaEvidenceLink[] {
  return ids.map((id) => {
    const ref = EVIDENCE_DICTIONARY[id];
    return {
      id,
      label: ref?.title ?? id,
      url: ref?.href,
    };
  });
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

function factorTitle(key: string): Record<Locale, string> {
  const map: Record<string, Record<Locale, string>> = {
    workedHours: title('Heures travaillees', 'Worked hours', 'Arbeitsstunden') as Record<Locale, string>,
    longShifts: title('Shifts longs', 'Long shifts', 'Lange Schichten') as Record<Locale, string>,
    count24hBreaks: title('Pauses de 24h', '24h breaks', '24h-Pausen') as Record<Locale, string>,
    longestRecovery: title('Recuperation max', 'Longest recovery', 'Max. Erholung') as Record<Locale, string>,
    shortBreaks: title('Pauses <11h', 'Breaks <11h', 'Pausen <11h') as Record<Locale, string>,
    restDays: title('Jours de repos', 'Rest days', 'Ruhetage') as Record<Locale, string>,
    fullyRestedDays: title('Jours reposants', 'Rested days', 'Erholte Tage') as Record<Locale, string>,
    nightShifts: title('Shifts de nuit', 'Night shifts', 'Nachtschichten') as Record<Locale, string>,
    biologicalHoursLost: title('Heures biologiques perdues', 'Biological hours lost', 'Biologische Stunden verloren') as Record<Locale, string>,
    socialHoursLost: title('Heures sociales perdues', 'Social hours lost', 'Soziale Stunden verloren') as Record<Locale, string>,
    sleepDuration: title('Duree sommeil moyenne', 'Average sleep duration', 'Mittlere Schlafdauer') as Record<Locale, string>,
    sleepRegularityProxy: title('Regularite sommeil (proxy)', 'Sleep regularity (proxy)', 'Schlafregelmassigkeit (Proxy)') as Record<Locale, string>,
  };
  return map[key] ?? title(key, key, key);
}

function factorSummary(key: string): Record<Locale, string> | undefined {
  const map: Record<string, Record<Locale, string>> = {
    count24hBreaks: summary(
      'Nombre de pauses de 24h derive du planning hebdomadaire.',
      'Count of 24h breaks derived from the weekly schedule.',
      'Anzahl der 24h-Pausen aus dem Wochenplan.',
    ) as Record<Locale, string>,
    workedHours: summary(
      'Charge hebdomadaire de travail envoyee au bucket SLI proxy.',
      'Weekly workload sent to the proxy SLI bucket.',
      'Wochentliche Arbeitslast fur den Proxy-SLI-Bucket.',
    ) as Record<Locale, string>,
    restDays: summary(
      'Nombre de jours sans travail dans la semaine, aligne sur le workbook.',
      'Count of days without work in the week, aligned with the workbook.',
      'Anzahl der arbeitsfreien Tage in der Woche, am Workbook ausgerichtet.',
    ) as Record<Locale, string>,
    longestRecovery: summary(
      'Facteur actuellement dispute par rapport au workbook externe.',
      'Factor currently disputed against the external workbook.',
      'Faktor derzeit im Konflikt mit dem externen Workbook.',
    ) as Record<Locale, string>,
    fullyRestedDays: summary(
      'Facteur actuellement dispute par rapport au workbook externe.',
      'Factor currently disputed against the external workbook.',
      'Faktor derzeit im Konflikt mit dem externen Workbook.',
    ) as Record<Locale, string>,
    sleepRegularityProxy: summary(
      'Proxy runtime base sur la variabilite hebdomadaire du sommeil.',
      'Runtime proxy based on weekly sleep variability.',
      'Runtime-Proxy basierend auf wochentlicher Schlafvariabilitat.',
    ) as Record<Locale, string>,
  };
  return map[key];
}

function buildTraceBackedMap(locale: Locale, t: unknown, trace: ScoreTrace): FormulaMap {
  const overrides: FormulaCopyOverrides = {
    scoreAdapt: getString(t, 'scoreAdapt'),
    scoreSleep: getString(t, 'scoreSleep'),
    scoreRisk: getString(t, 'scoreRisk'),
  };

  const scoreTitleMap: Record<'riskScore' | 'sleepScore' | 'adaptabilityScore', Record<Locale, string>> = {
    adaptabilityScore: withLocaleOverride(
      title('Adaptabilite', 'Adaptability', 'Anpassung') as Record<Locale, string>,
      locale,
      overrides.scoreAdapt,
    ),
    sleepScore: withLocaleOverride(
      title('Sommeil', 'Sleep', 'Schlaf') as Record<Locale, string>,
      locale,
      overrides.scoreSleep,
    ),
    riskScore: withLocaleOverride(
      title('Risque', 'Risk', 'Risiko') as Record<Locale, string>,
      locale,
      overrides.scoreRisk,
    ),
  };

  const scoreNodes: FormulaNode[] = trace.scores.map((score) => ({
    key:
      score.key === 'riskScore'
        ? 'score.risk'
        : score.key === 'sleepScore'
          ? 'score.sleep'
          : 'score.adaptability',
    kind: 'score',
    title: scoreTitleMap[score.key],
    summary: summary(
      `Trace runtime: ${score.formulaRef}`,
      `Runtime trace: ${score.formulaRef}`,
      `Runtime-Trace: ${score.formulaRef}`,
    ) as Record<Locale, string>,
    uses: score.dependsOn.map((dep) =>
      dep === 'riskScore' ? 'score.risk' : dep === 'sleepScore' ? 'score.sleep' : dep === 'adaptabilityScore' ? 'score.adaptability' : dep.startsWith('derived.') ? dep : `derived.${dep}`,
    ),
    evidence: [METHOD_EVIDENCE, ...traceEvidence(score.evidenceRefs)],
  }));

  const factorNodes: FormulaNode[] = trace.factors.map((factor) => ({
    key: `derived.${factor.key}`,
    kind: 'metric',
    title: factorTitle(factor.key),
    summary:
      factorSummary(factor.key) ??
      (summary(
        `Trace runtime: ${factor.formulaRef}`,
        `Runtime trace: ${factor.formulaRef}`,
        `Runtime-Trace: ${factor.formulaRef}`,
      ) as Record<Locale, string>),
    uses: factor.dependsOn,
    evidence: [METHOD_EVIDENCE, ...traceEvidence(factor.evidenceRefs)],
  }));

  const inputNodes: FormulaNode[] = [
    {
      key: 'schedule.workSegments',
      kind: 'input',
      title: title('Agenda travail', 'Work schedule', 'Arbeitsplan') as Record<Locale, string>,
      summary: summary(
        'Segments travail saisis dans le calendrier hebdomadaire.',
        'Work segments entered in the weekly schedule.',
        'Arbeitssegmente im Wochenplan.',
      ) as Record<Locale, string>,
      evidence: [METHOD_EVIDENCE],
    },
    {
      key: 'schedule.sleepSegments',
      kind: 'input',
      title: title('Agenda sommeil', 'Sleep schedule', 'Schlafplan') as Record<Locale, string>,
      summary: summary(
        'Segments sommeil saisis dans le calendrier hebdomadaire.',
        'Sleep segments entered in the weekly schedule.',
        'Schlafsegmente im Wochenplan.',
      ) as Record<Locale, string>,
      evidence: [METHOD_EVIDENCE],
    },
  ];

  return {
    scoringVersion: trace.scoringVersion,
    nodes: [...scoreNodes, ...factorNodes, ...inputNodes],
  };
}

export function buildFormulaMap(locale: Locale, t: unknown, trace?: ScoreTrace): FormulaMap {
  if (trace) return buildTraceBackedMap(locale, t, trace);

  const overrides: FormulaCopyOverrides = {
    scoreAdapt: getString(t, 'scoreAdapt'),
    scoreSleep: getString(t, 'scoreSleep'),
    scoreRisk: getString(t, 'scoreRisk'),
  };

  const adaptTitle = withLocaleOverride(
    title('Adaptabilite', 'Adaptability', 'Anpassung') as Record<Locale, string>,
    locale,
    overrides.scoreAdapt,
  );
  const sleepTitle = withLocaleOverride(
    title('Sommeil', 'Sleep', 'Schlaf') as Record<Locale, string>,
    locale,
    overrides.scoreSleep,
  );
  const riskTitle = withLocaleOverride(
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
        title: adaptTitle,
        summary: summary(
          'Score principal de compatibilite travail/sommeil sur 7 jours.',
          'Main work/sleep compatibility score over 7 days.',
          'Hauptscore fur die Kompatibilitat von Arbeit und Schlaf uber 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['score.sleep', 'score.risk'],
        evidence: [METHOD_EVIDENCE, ...sourceEvidence(EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.formulaDoc)],
      },
      {
        key: 'score.sleep',
        kind: 'score',
        title: sleepTitle,
        summary: summary(
          'Proxy sommeil base sur la duree moyenne et la regularite.',
          'Sleep proxy based on average duration and regularity.',
          'Schlaf-Proxy auf Basis von durchschnittlicher Dauer und Regelmassigkeit.',
        ) as Record<Locale, string>,
        uses: ['derived.totalSleepHours', 'derived.avgSleepHours', 'derived.sleepRegularityProxy'],
        evidence: [
          METHOD_EVIDENCE,
          ...sourceEvidence(EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.sleepSyncPdf, EVIDENCE_IDS.song2025Pdf),
        ],
      },
      {
        key: 'score.risk',
        kind: 'score',
        title: riskTitle,
        summary: summary(
          'Proxy risque derive de la matrice SLI et des facteurs de charge.',
          'Risk proxy derived from the SLI matrix and burden factors.',
          'Risiko-Proxy aus der SLI-Matrix und den Belastungsfaktoren.',
        ) as Record<Locale, string>,
        uses: ['derived.totalWorkHours', 'derived.nightShiftCount', 'derived.shortBreaksCount'],
        evidence: [
          METHOD_EVIDENCE,
          ...sourceEvidence(
            EVIDENCE_IDS.coreScoring,
            EVIDENCE_IDS.formulaDoc,
            EVIDENCE_IDS.workbookMatrix,
            EVIDENCE_IDS.frontiersArticle,
          ),
        ],
      },
      {
        key: 'derived.totalSleepHours',
        kind: 'metric',
        title: title('Sommeil total (h)', 'Total sleep (h)', 'Schlaf gesamt (h)') as Record<Locale, string>,
        summary: summary(
          'Somme des segments sommeil sur 7 jours.',
          'Sum of sleep segments over 7 days.',
          'Summe der Schlafsegmente uber 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
        evidence: [METHOD_EVIDENCE, ...sourceEvidence(EVIDENCE_IDS.coreScoring)],
      },
      {
        key: 'derived.avgSleepHours',
        kind: 'metric',
        title: title('Sommeil moyen (h)', 'Average sleep (h)', 'Durchschnittsschlaf (h)') as Record<
          Locale,
          string
        >,
        summary: summary(
          'Duree moyenne de sommeil sur la semaine.',
          'Average sleep duration across the week.',
          'Durchschnittliche Schlafdauer uber die Woche.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
        evidence: [METHOD_EVIDENCE, ...sourceEvidence(EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.sleepSyncPdf)],
      },
      {
        key: 'derived.sleepRegularityProxy',
        kind: 'metric',
        title: title(
          'Regularite sommeil (proxy)',
          'Sleep regularity (proxy)',
          'Schlafregelmassigkeit (Proxy)',
        ) as Record<Locale, string>,
        summary: summary(
          'Proxy de regularite base sur la variabilite hebdomadaire du sommeil.',
          'Regularity proxy based on weekly sleep variability.',
          'Regularitats-Proxy auf Basis der wochentlichen Schlafvariabilitat.',
        ) as Record<Locale, string>,
        uses: ['schedule.sleepSegments'],
        evidence: [METHOD_EVIDENCE, ...sourceEvidence(EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.sleepSyncPdf)],
      },
      {
        key: 'derived.totalWorkHours',
        kind: 'metric',
        title: title('Travail total (h)', 'Total work (h)', 'Arbeit gesamt (h)') as Record<Locale, string>,
        summary: summary(
          'Somme des segments travail sur 7 jours.',
          'Sum of work segments over 7 days.',
          'Summe der Arbeitssegmente uber 7 Tage.',
        ) as Record<Locale, string>,
        uses: ['schedule.workSegments'],
        evidence: [METHOD_EVIDENCE, ...sourceEvidence(EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.workbookMatrix)],
      },
      {
        key: 'derived.nightShiftCount',
        kind: 'metric',
        title: title('Shifts de nuit', 'Night shifts', 'Nachtschichten') as Record<Locale, string>,
        summary: summary(
          'Nombre de shifts detectes comme nuit via une fenetre biologique proxy.',
          'Count of shifts detected as night shifts through a biological proxy window.',
          'Anzahl der als Nachtschicht erkannten Segmente uber ein biologisches Proxy-Fenster.',
        ) as Record<Locale, string>,
        uses: ['schedule.workSegments'],
        evidence: [
          METHOD_EVIDENCE,
          ...sourceEvidence(EVIDENCE_IDS.coreScoring, EVIDENCE_IDS.workbookMatrix, EVIDENCE_IDS.frontiersArticle),
        ],
      },
      {
        key: 'schedule.workSegments',
        kind: 'input',
        title: title('Agenda travail', 'Work schedule', 'Arbeitsplan') as Record<Locale, string>,
        summary: summary(
          'Segments travail saisis dans le calendrier hebdomadaire.',
          'Work segments entered in the weekly schedule.',
          'Arbeitssegmente im Wochenplan.',
        ) as Record<Locale, string>,
        evidence: [METHOD_EVIDENCE],
      },
      {
        key: 'schedule.sleepSegments',
        kind: 'input',
        title: title('Agenda sommeil', 'Sleep schedule', 'Schlafplan') as Record<Locale, string>,
        summary: summary(
          'Segments sommeil saisis dans le calendrier hebdomadaire.',
          'Sleep segments entered in the weekly schedule.',
          'Schlafsegmente im Wochenplan.',
        ) as Record<Locale, string>,
        evidence: [METHOD_EVIDENCE],
      },
      {
        key: 'profile.fatigue',
        kind: 'input',
        title: title('Fatigue (0-5)', 'Fatigue (0-5)', 'Mudigkeit (0-5)') as Record<Locale, string>,
        summary: summary(
          'Champ profil encore peu exploite dans la version proxy actuelle.',
          'Profile field still lightly used in the current proxy version.',
          'Profilfeld, das in der aktuellen Proxy-Version noch wenig genutzt wird.',
        ) as Record<Locale, string>,
        evidence: [METHOD_EVIDENCE],
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
