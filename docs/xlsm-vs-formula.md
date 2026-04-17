# 🧾 XLSM vs Formula

## 🎯 Purpose

This document is a practical diff between:

- [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm)
- [formula.md](formula.md)

It is meant to answer:

- what the workbook appears to define
- what the Markdown formula reference currently claims
- what should probably change next in code or documentation

## 📋 Workbook Factor Map

The summary sheet `Graphiques brut` exposes an eight-factor burden matrix.

| Workbook factor | Workbook wording |
| --- | --- |
| 1 | Heures travaillées |
| 2 | # Postes longues durées |
| 3 | # Pauses de 24h |
| 4 | # Pauses moins de 11h |
| 5 | # Jours de repos |
| 6 | # Gardes de nuit |
| 7 | h Heures sommeil optimales perdues |
| 8 | h Heures sociales perdues |

## ⚔️ Diff Matrix

| Factor | Workbook definition | `formula.md` definition | Status | Recommended action |
| --- | --- | --- | --- | --- |
| Weekly hours worked | schedule load by total weekly hours | `workedHours` | mostly aligned | keep, but cite workbook cells and article source |
| Long shifts | count of shifts longer than `10h`; summary thresholds behave like `0 / 1 / 2+` | `longShiftCount` with thresholds `<1 / >=1 / >=3` | mismatch | align thresholds to workbook |
| 24h pauses | count of 24h breaks | replaced by `longestRecoveryHours` in current formula doc | conceptual mismatch | decide whether workbook count must replace current longest-gap factor |
| Pauses under 11h | count of quick returns under `11h` | `shortBreaksCount` with looser top bucket | mismatch | align thresholds to workbook |
| Rest days | days without work | `fullyRestedDaysCount` based on days with `>= 7h` sleep | major mismatch | redefine factor in code and docs |
| Night duties | count of night duties/shifts | `nightShiftCount` using biological-window overlap | mostly aligned | keep concept, improve wording and citation |
| Optimal sleep hours lost | workbook-specific burden factor | `biologicalHoursLost` as biological-window work overlap proxy | partial mismatch | clarify whether proxy is acceptable or replace with workbook logic |
| Social hours lost | social burden factor | `socialHoursLost` with different low threshold | mismatch | align threshold and cite source |

## 📏 Threshold Matrix

| Factor | Workbook threshold logic | Current `formula.md` threshold logic | Gap |
| --- | --- | --- | --- |
| Weekly hours | `<40 / 40-48 / >48` | `<40 / >=40 / >=48` | minor wording difference |
| Long shifts | `<2 / =2 / >2` | `<1 / >=1 / >=3` | real mismatch |
| 24h pauses | `>1 / =1 / <1` | not represented directly | structural mismatch |
| Quick returns `<11h` | `<1 / =1 / >1` | `<1 / >=1 / >=3` | real mismatch |
| Rest days | `>1 / =1 / <1` | `>3 / <=3 / <=1` on sleep-rich days | major mismatch |
| Night duties | `<1 / 1-2 / >2` | `<1 / >=1 / >=3` | mostly close |
| Optimal sleep hours lost | `<8 / =8 / >8` | `<4 / >=4 / >=8` on biological hours lost | conceptual and threshold mismatch |
| Social hours lost | `<6 / 6-13 / >13` | `<8 / >=8 / >=13` | real mismatch |

## 🔍 Interpretation Matrix

| Topic | Workbook orientation | Current app orientation |
| --- | --- | --- |
| Burden matrix | occupational schedule burden | mixed burden + product proxy |
| Recovery | count-based | partly count-based, partly longest-gap-based |
| Rest | no-work days | sleep-duration-based recovery proxy |
| Sleep disruption | “optimal sleep hours lost” | biological overlap proxy |
| Output philosophy | matrix-like score | matrix-like score plus sleep and adaptability composites |

## ✅ What Is Likely Safe To Keep

| Area | Why it is still useful |
| --- | --- |
| interval normalization | sound foundation for weekly schedule analysis |
| cross-midnight handling | needed for real shift-work schedules |
| work/sleep separation | good domain structure |
| local score computation | good privacy and product decision |
| multilingual documentation | important for participant-facing and open-source collaboration |

## 🔁 What Is Most Likely To Change

| Priority | Change |
| --- | --- |
| high | replace sleep-based “rested days” with no-work rest days |
| high | decide between `count24hBreaks` and `longestRecoveryHours` |
| high | align thresholds for long shifts and quick returns |
| high | clarify factor 7 using workbook and PDF/article evidence |
| medium | align social-hours threshold |
| medium | keep sleep/adaptability scores, but separate them from the workbook burden matrix more clearly |

## 🛠️ Practical Refactor Direction

| Step | Goal |
| --- | --- |
| 1 | keep the current normalization pipeline in [../src/core/scoring.ts](../src/core/scoring.ts) |
| 2 | rename factor concepts to match workbook vocabulary |
| 3 | implement workbook-native rest-day and 24h-break definitions |
| 4 | revise thresholds to match the workbook |
| 5 | update [formula.md](formula.md) with source-cited tables |
| 6 | update UI explainability so factors read like medically serious, auditable statements |

## 💡 Recommendation

Use the workbook as the reference for the burden matrix, and use [formula.md](formula.md) for:

- current runtime behavior
- implementation notes
- explicit disclosure of any proxy logic

In short:

| Document | Best use |
| --- | --- |
| [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm) | reference matrix |
| [formula.md](formula.md) | current implementation reference |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | change-planning document |
