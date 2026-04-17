import type { EvidenceRef } from './model';

export const EVIDENCE_IDS = {
  coreScoring: 'code:core-scoring',
  formulaDoc: 'code:formula-doc',
  workbookMatrix: 'workbook:fatigue-matrix',
  workbookParams: 'workbook:fatigue-params',
  frontiersArticle: 'article:frontiers-2025',
  sleepSyncPdf: 'pdf:sleepsync',
  song2025Pdf: 'pdf:song2025',
} as const;

export const EVIDENCE_DICTIONARY: Record<string, EvidenceRef> = {
  [EVIDENCE_IDS.coreScoring]: {
    id: EVIDENCE_IDS.coreScoring,
    sourceType: 'code',
    title: 'Core scoring runtime',
    source: 'src/core/scoring.ts',
    locator: 'computeDerivedMetrics + scoreSLIProxy + scoreSleepProxy + scoreAdaptabilityProxy + buildTrace',
    note: 'Current runtime source of truth for derived metrics, factor buckets, proxy score outputs, and trace assembly.',
    tags: ['runtime', 'single-source-of-truth', 'proxy'],
  },
  [EVIDENCE_IDS.formulaDoc]: {
    id: EVIDENCE_IDS.formulaDoc,
    sourceType: 'code',
    title: 'Formula documentation',
    source: 'docs/formula.md',
    locator: 'Derived Metrics + Risk Score + Sleep Score + Workbook Alignment Summary',
    note: 'Human-readable documentation of the current formula, known gaps, and workbook alignment status.',
    tags: ['documentation', 'mapping', 'open-source'],
  },
  [EVIDENCE_IDS.workbookMatrix]: {
    id: EVIDENCE_IDS.workbookMatrix,
    sourceType: 'workbook',
    title: 'External workbook reference (local copy)',
    source: 'docs/Fatigue Index_scoring_system_15.xlsm',
    locator: 'Graphiques brut!J4:Y6',
    note: 'Local working copy of an external workbook used to trace the 8-factor burden matrix, including factor labels, raw metrics, and score buckets.',
    tags: ['primary', 'workbook', 'matrix'],
  },
  [EVIDENCE_IDS.workbookParams]: {
    id: EVIDENCE_IDS.workbookParams,
    sourceType: 'workbook',
    title: 'External workbook parameters (local copy)',
    source: 'docs/Fatigue Index_scoring_system_15.xlsm',
    locator: 'Parametres score!B6:E26',
    note: 'Local working copy area used to trace thresholds, shift duration rules, and scoring interpretation.',
    tags: ['primary', 'workbook', 'thresholds'],
  },
  [EVIDENCE_IDS.frontiersArticle]: {
    id: EVIDENCE_IDS.frontiersArticle,
    sourceType: 'article',
    title: 'External public article on shift-work health burden',
    source: 'Frontiers in Public Health, DOI 10.3389/fpubh.2025.1679296',
    locator: 'DOI 10.3389/fpubh.2025.1679296',
    href: 'https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full',
    note: 'Third-party public article used for high-level shift-work health framing only; it does not define the workbook thresholds or the runtime factor formulas.',
    tags: ['public', 'article', 'context'],
  },
  [EVIDENCE_IDS.sleepSyncPdf]: {
    id: EVIDENCE_IDS.sleepSyncPdf,
    sourceType: 'pdf',
    title: 'External PDF reference (local copy)',
    source: 'docs/other_sources/SleepSync-1.pdf',
    locator: 'SleepSync-1.txt extracted text lines 1-17',
    note: 'Locally stored third-party reference material. Current extraction is too coarse for factor-level citation and is retained only as light contextual support.',
    tags: ['pdf', 'sleep', 'supporting'],
  },
  [EVIDENCE_IDS.song2025Pdf]: {
    id: EVIDENCE_IDS.song2025Pdf,
    sourceType: 'pdf',
    title: 'External SleepWake article (local PDF copy)',
    source: 'docs/other_sources/Song2025_korean sleep intervention real time advice-1.pdf',
    locator:
      'Song2025_korean sleep intervention real time advice-1.txt lines 24-33, 167-203, 974-975',
    note: 'Locally stored third-party article used to support statements about personalized sleep scheduling, sleep pressure, circadian alignment, and alertness. It informs physiology framing, not the workbook thresholds.',
    tags: ['pdf', 'sleep', 'supporting'],
  },
};

export function getEvidenceRef(id: string): EvidenceRef | undefined {
  return EVIDENCE_DICTIONARY[id];
}

export function getEvidenceRefs(ids: readonly string[]): EvidenceRef[] {
  return ids
    .map((id) => EVIDENCE_DICTIONARY[id])
    .filter((item): item is EvidenceRef => Boolean(item));
}
