# Documentation

This folder contains the documentation and source material that support the Shiftwell MVP.

## Read This First

If you are new to the repository, use this order:

1. [../README.md](../README.md)
2. [formula.md](formula.md)
3. [xlsm-vs-formula.md](xlsm-vs-formula.md)
4. [external-link.md](external-link.md)
5. [../src/core/scoring.ts](../src/core/scoring.ts)

## What Is In This Folder

### [formula.md](formula.md)

Explains the scoring logic currently implemented in the codebase:

- interval normalization
- derived metrics
- proxy scoring
- known gaps between current code and research-oriented notes

### [external-link.md](external-link.md)

### [xlsm-vs-formula.md](xlsm-vs-formula.md)

Compares:

- the current Excel workbook logic
- the current Markdown formula reference
- the current application code direction

This is the best starting point when the scoring matrix needs to be updated.

Curated list of:

- scientific references
- local source documents included in the repo
- product and UX inspiration links

### PDF source material

- [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm)
- [other_sources/SleepSync-1.pdf](other_sources/SleepSync-1.pdf)
- [other_sources/SleepSync-1.txt](other_sources/SleepSync-1.txt)
- [other_sources/Song2025_korean sleep intervention real time advice-1.pdf](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.pdf)
- [other_sources/Song2025_korean sleep intervention real time advice-1.txt](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.txt)

### Extraction utility

- [../scripts/extract_docs_sources.py](../scripts/extract_docs_sources.py)

These PDFs are supporting materials. The current repository documentation does not claim that every formula or threshold is already fully derived from them in production code.

## Documentation Principles

As the repository moves toward open source, documentation should follow these rules:

- describe what is implemented today before describing future intent
- separate validated behavior from research goals
- keep references easy to audit
- make it obvious when the app uses proxy logic

## Maintainer Note

When the scoring engine changes, update [formula.md](formula.md) and [xlsm-vs-formula.md](xlsm-vs-formula.md) in the same change set so the public documentation stays aligned with the code.
