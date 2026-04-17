# 📚 Documentation

This folder contains the documentation, workbook, PDFs, and extraction artifacts that support the Shiftwell MVP.

## 🧭 Read This First

If you are new to the repository, use this order:

1. [../README.md](../README.md)
2. [architecture.md](architecture.md)
3. [formula.md](formula.md)
4. [xlsm-vs-formula.md](xlsm-vs-formula.md)
5. [external-link.md](external-link.md)
6. [../src/core/scoring.ts](../src/core/scoring.ts)

## 🗺️ Document Map

| File | Why it exists |
| --- | --- |
| [architecture.md](architecture.md) | Explains how the app is structured and where contributors should work |
| [formula.md](formula.md) | Describes the formulas currently implemented in the codebase |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | Highlights gaps between the Excel matrix and the current Markdown formula reference |
| [external-link.md](external-link.md) | Lists scientific references, local source documents, and UI inspirations |

## 📎 Source Material

| File | Type | Role |
| --- | --- | --- |
| [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm) | Workbook | Main scoring matrix reference |
| [other_sources/SleepSync-1.pdf](other_sources/SleepSync-1.pdf) | PDF | Source material |
| [other_sources/SleepSync-1.txt](other_sources/SleepSync-1.txt) | Text extraction | Easier search and quoting |
| [other_sources/Song2025_korean sleep intervention real time advice-1.pdf](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.pdf) | PDF | Source material |
| [other_sources/Song2025_korean sleep intervention real time advice-1.txt](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.txt) | Text extraction | Easier search and quoting |

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
| Separate evidence from interpretation | Keep workbook/PDF facts distinct from proxy implementation choices |
| Prefer tables for comparisons | Especially for thresholds, factors, and diff matrices |
| Be friendly to non-experts | Contributors should be able to help even without domain expertise |
| Keep medical tone careful | Avoid overstating what the MVP can claim scientifically |

## 🧑‍🔬 Maintainer Note

When the scoring engine changes, update [formula.md](formula.md), [xlsm-vs-formula.md](xlsm-vs-formula.md), and any impacted citations in [external-link.md](external-link.md) in the same change set.
