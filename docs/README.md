# 📚 Documentation

This folder contains Shiftwell-authored documentation, local review artifacts, and reference mappings used to support the Shiftwell MVP.

It does not make Shiftwell the author of third-party research documents that may also be stored here as working copies.

## 🧭 Read This First

If you are new to the repository, use this order:

1. [../README.md](../README.md)
2. [architecture.md](architecture.md)
3. [explainability.md](explainability.md)
4. [formula.md](formula.md)
5. [xlsm-vs-formula.md](xlsm-vs-formula.md)
6. [external-link.md](external-link.md)
7. [../src/core/scoring.ts](../src/core/scoring.ts)

## 🗺️ Document Map

| File | Why it exists |
| --- | --- |
| [architecture.md](architecture.md) | Explains how the app is structured and where contributors should work |
| [explainability.md](explainability.md) | Defines medically careful wording and factor-level explainability guidance |
| [formula.md](formula.md) | Describes the formulas currently implemented in the codebase |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | Highlights gaps between the Excel matrix and the current Markdown formula reference |
| [external-link.md](external-link.md) | Lists external references, provenance notes, and UI inspirations |
| [source-dictionary.md](source-dictionary.md) | Canonical source-id registry used by docs and code |
| [evidence-map.md](evidence-map.md) | Factor-to-source traceability matrix |

## 🧾 Provenance Rule

Use this distinction consistently:

| Category | Meaning |
| --- | --- |
| Shiftwell documentation | documentation authored for this repository |
| local working copy | a locally stored copy of an external source used for review |
| extracted text | a repository-generated artifact derived from an external source |
| external reference material | third-party material cited or reviewed by Shiftwell |

## 📎 Reference Materials

| File | Type | Role |
| --- | --- | --- |
| [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm) | Workbook | local working copy of a scoring reference workbook |
| [other_sources/SleepSync-1.pdf](other_sources/SleepSync-1.pdf) | PDF | locally stored external reference material |
| [other_sources/SleepSync-1.txt](other_sources/SleepSync-1.txt) | Text extraction | repository-generated extraction for search and review |
| [other_sources/Song2025_korean sleep intervention real time advice-1.pdf](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.pdf) | PDF | locally stored external reference material |
| [other_sources/Song2025_korean sleep intervention real time advice-1.txt](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.txt) | Text extraction | repository-generated extraction for search and review |

## 🧾 Generated Analysis Artifacts

| File | Purpose |
| --- | --- |
| [after/workbook-snapshot.md](after/workbook-snapshot.md) | Human-readable workbook snapshot |
| [after/workbook-snapshot.json](after/workbook-snapshot.json) | Machine-readable workbook snapshot |
| [after/next_param.png](after/next_param.png) | Image artifact currently stored in the doc set |

## 🛠️ Utilities

| File | Purpose |
| --- | --- |
| [../scripts/extract_docs_sources.py](../scripts/extract_docs_sources.py) | Re-extract PDF text and workbook snapshots |

## ✅ Documentation Principles

| Principle | Meaning |
| --- | --- |
| Describe current behavior first | Document what the app computes today before describing future targets |
| Separate evidence from interpretation | Keep workbook and external-source facts distinct from proxy implementation choices |
| Separate provenance from storage | A local copy in the repo is not the same thing as project authorship |
| Prefer tables for comparisons | Especially for thresholds, factors, and diff matrices |
| Be friendly to non-experts | Contributors should be able to help even without domain expertise |
| Keep medical tone careful | Avoid overstating what the MVP can claim scientifically |

## 👩‍🔬 Maintainer Note

When the scoring engine changes, update [formula.md](formula.md), [xlsm-vs-formula.md](xlsm-vs-formula.md), [evidence-map.md](evidence-map.md), and any impacted entries in [source-dictionary.md](source-dictionary.md) in the same change set.
