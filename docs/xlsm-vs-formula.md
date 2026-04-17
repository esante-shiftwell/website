# 🧾 XLSM vs Formula

## 🎯 Purpose

This document is a practical diff between:

- a local working copy of [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm)
- [formula.md](formula.md)

It is meant to answer:

- what the workbook appears to define
- what the Markdown formula reference currently claims
- what should probably change next in code or documentation

## 🧾 Provenance Reminder

In this file, the workbook is treated as an external scoring reference examined through a local working copy stored in the repository.

This document does not claim that:

- the workbook was authored by Shiftwell
- the local file is itself Shiftwell documentation
- the repository owns the original workbook content

## 📋 Workbook Factor Map

The summary sheet `Graphiques brut` exposes an eight-factor burden matrix.

| Workbook factor | Workbook wording |
| --- | --- |
| 1 | Heures travaillees |
| 2 | # Postes longues durees |
| 3 | # Pauses de 24h |
| 4 | # Pauses moins de 11h |
| 5 | # Jours de repos |
| 6 | # Gardes de nuit |
| 7 | h Heures sommeil optimales perdues |
| 8 | h Heures sociales perdues |

## ⚔️ Diff Matrix

| Factor | Workbook definition | Current runtime definition | Status | Recommended action |
| --- | --- | --- | --- | --- |
| Weekly hours worked | schedule load by total weekly hours | `workedHours` | aligned | keep and maintain evidence precision |
| Long shifts | count of shifts longer than `10h` with `0 / 1 / 2+` logic around `2` | `longShiftCount` with workbook-aligned thresholds | aligned | keep |
| 24h pauses | count of 24h breaks | `count24hBreaks` derived from full 24h blocks between work segments | mostly aligned | keep, but confirm semantic interpretation with source owners |
| Pauses under 11h | count of quick returns under `11h` | `shortBreaksCount` | aligned | keep |
| Rest days | days without work | `restDaysCount` | aligned | keep |
| Night duties | count of night duties/shifts | `nightShiftCount` using biological-window overlap | threshold aligned, metric proxy | keep, document proxy detection |
| Optimal sleep hours lost | workbook-specific burden factor | `biologicalHoursLost` as biological-window work overlap proxy | partial mismatch | keep as explicit proxy until a better workbook-native interpretation is implemented |
| Social hours lost | social burden factor | `socialHoursLost` with workbook-aligned thresholds but proxy time windows | partial mismatch | keep as explicit proxy until better source definition is available |

## 📏 Threshold Matrix

| Factor | Workbook threshold logic | Current runtime threshold logic | Gap |
| --- | --- | --- | --- |
| Weekly hours | `<40 / 40-48 / >48` | `<40 / 40-48 / >48` | aligned |
| Long shifts | `<2 / =2 / >2` | `<2 / =2 / >2` | aligned |
| 24h pauses | `>1 / =1 / <1` | `>1 / =1 / <1` | aligned in runtime interpretation |
| Quick returns `<11h` | `<1 / =1 / >1` | `<1 / =1 / >1` | aligned |
| Rest days | `>1 / =1 / <1` | `>1 / =1 / <1` | aligned |
| Night duties | `<1 / 1-2 / >2` | `<1 / 1-2 / >2` | aligned |
| Optimal sleep hours lost | `<8 / =8 / >8` | `<8 / =8 / >8` | threshold aligned, concept still proxy |
| Social hours lost | `<6 / 6-13 / >13` | `<6 / 6-13 / >13` | threshold aligned, concept still proxy |

## 🔍 Interpretation Matrix

| Topic | Workbook orientation | Current app orientation |
| --- | --- | --- |
| Burden matrix | occupational schedule burden | closer to workbook burden matrix than before |
| Recovery | count-based | count-based for risk, max-gap kept only as support metric |
| Rest | no-work days | no-work days for risk, sleep-rich days kept only as support metric |
| Sleep disruption | "optimal sleep hours lost" | biological overlap proxy |
| Output philosophy | matrix-like score | matrix-like risk score plus sleep and adaptability composites |

## ✅ What Is Likely Safe To Keep

| Area | Why it is still useful |
| --- | --- |
| interval normalization | sound foundation for weekly schedule analysis |
| cross-midnight handling | needed for real shift-work schedules |
| work/sleep separation | good domain structure |
| local score computation | good privacy and product decision |
| multilingual documentation | important for participant-facing and open-source collaboration |
| single runtime scoring pipeline | avoids multiple competing truths |

## 🔁 What Is Most Likely To Change Next

| Priority | Change |
| --- | --- |
| high | refine factor 7 beyond the current biological-window proxy |
| high | add regression tests around workbook-aligned thresholds |
| medium | clarify whether `count24hBreaks` matches workbook semantics exactly |
| medium | strengthen evidence locators for external PDFs and workbook sheets |
| medium | separate workbook burden matrix and product-level sleep/adaptability wording even more clearly |

## 🛠️ Practical Refactor Direction

| Step | Goal |
| --- | --- |
| 1 | keep the current normalization pipeline in [../src/core/scoring.ts](../src/core/scoring.ts) |
| 2 | keep workbook vocabulary in runtime factors where possible |
| 3 | keep explicit proxy labels where the metric is still inferred |
| 4 | add tests before any further formula changes |
| 5 | improve source-cited tables in [formula.md](formula.md) |
| 6 | continue making UI explainability read like medically serious, auditable statements |

## 💡 Recommendation

Use the workbook as the reference for the burden matrix, and use [formula.md](formula.md) for:

- current runtime behavior
- implementation notes
- explicit disclosure of any proxy logic

In short:

| Document | Best use |
| --- | --- |
| [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm) | external reference workbook examined through a local working copy |
| [formula.md](formula.md) | current implementation reference |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | change-planning and gap-tracking document |
