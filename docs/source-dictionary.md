# 🧭 Source Dictionary

## 🎯 Purpose

This file is the canonical source dictionary for Shiftwell citations.

It exists to prevent:

- untraceable scientific claims
- duplicate source labels across code and docs
- UI explanations that cite a paper or workbook without a stable identifier
- ambiguous wording that could imply ownership of third-party materials

## 🧾 Provenance Rule

Every source entry in this file must be read with the following distinction:

| Category | Meaning |
| --- | --- |
| Shiftwell-authored artifact | code, docs, notes, or generated files authored for this repository |
| local working copy | a locally stored copy of a third-party source used for review |
| extracted artifact | a repository-generated derivative such as `.txt` extraction or workbook snapshot |
| third-party source | an external work that remains owned and authored outside Shiftwell |

## 🧱 Dictionary Rules

| Rule | Why it matters |
| --- | --- |
| each source gets one stable `id` | code, docs, and UI can point to the same evidence |
| each `id` has one clear locator | contributors can audit the claim path |
| source meaning and runtime usage stay separate | avoids overstating scientific validation |
| provenance must be explicit | avoids implying that local storage means project authorship |
| PDFs stay as archive material unless mapped precisely | keeps explainability lighter and more honest |

## 📚 Canonical Source Table

| Source id | Type | Artifact | Provenance | Locator | Role |
| --- | --- | --- | --- | --- | --- |
| `code:core-scoring` | code | [src/core/scoring.ts](C:/workspace/shiftwell/src/core/scoring.ts) | Shiftwell-authored runtime code | `calculateScores + buildTrace` | current runtime source of truth |
| `code:formula-doc` | code | [docs/formula.md](C:/workspace/shiftwell/docs/formula.md) | Shiftwell-authored documentation | factor tables and gap matrix | human-readable formula and alignment guide |
| `workbook:fatigue-matrix` | workbook | [docs/Fatigue Index_scoring_system_15.xlsm](C:/workspace/shiftwell/docs/Fatigue%20Index_scoring_system_15.xlsm) | local working copy of an external workbook | `Graphiques brut` | primary burden-matrix reference |
| `workbook:fatigue-params` | workbook | [docs/Fatigue Index_scoring_system_15.xlsm](C:/workspace/shiftwell/docs/Fatigue%20Index_scoring_system_15.xlsm) | local working copy of an external workbook | `Parametres score` | threshold and workbook-interpretation reference |
| `article:frontiers-2025` | article | [Frontiers in Public Health](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full) | third-party public article | DOI `10.3389/fpubh.2025.1679296` | high-level shift-work health framing |
| `pdf:sleepsync` | pdf | [SleepSync-1.pdf](C:/workspace/shiftwell/docs/other_sources/SleepSync-1.pdf) | locally stored third-party reference material | coarse extracted text in [SleepSync-1.txt](C:/workspace/shiftwell/docs/other_sources/SleepSync-1.txt) | weak contextual support only |
| `pdf:song2025` | pdf | [Song2025 PDF](</C:/workspace/shiftwell/docs/other_sources/Song2025_korean sleep intervention real time advice-1.pdf>) | locally stored third-party reference material | extracted text in [Song2025 TXT](</C:/workspace/shiftwell/docs/other_sources/Song2025_korean sleep intervention real time advice-1.txt>) | physiology and individualized-scheduling context |

## 🧩 Mapping Strategy

| Layer | What it should reference |
| --- | --- |
| `src/core/evidence.ts` | canonical source dictionary |
| `ScoreTrace.evidence` | only the subset actually used by the current calculation |
| `FactorEvaluation.evidenceRefs` | stable source ids, never free text |
| explainability UI | resolved evidence objects from the trace |
| docs tables | same ids when describing factors and gaps |

## 🔎 Current Precision Level

| Source id | Current precision |
| --- | --- |
| `code:core-scoring` | function-level |
| `code:formula-doc` | section-level |
| `workbook:fatigue-matrix` | sheet + summary-cell-range level |
| `workbook:fatigue-params` | sheet + parameter-cell level |
| `article:frontiers-2025` | article-level only |
| `pdf:sleepsync` | extracted-text-level only, weak |
| `pdf:song2025` | extracted-text-level with usable section clusters |

## 🛠 Next Upgrade

The next stronger version of this dictionary should add:

| Field | Purpose |
| --- | --- |
| page or section number | precise PDF/article citation |
| workbook sheet and cell range | exact spreadsheet traceability |
| alignment status | `implemented`, `proxy`, `missing`, `disputed` at source-reference level |
| quote excerpt | tiny auditable citation snippet when legally and scientifically appropriate |
