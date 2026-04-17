# 🧮 Formula Reference

## 🎯 Purpose

This document describes the formulas currently implemented in the repository.

Important references:

| Reference | Role |
| --- | --- |
| [../src/core/scoring.ts](../src/core/scoring.ts) | Runtime source of truth |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | Gap analysis between workbook logic and this document |
| [external-link.md](external-link.md) | Scientific references and local source inventory |

The safest reading rule is:

- this file documents what the app computes today
- it does not claim that every formula is already fully aligned with the workbook or PDFs

## 🚦 Formula Status

| Topic | Current status |
| --- | --- |
| Workload factors | Partially aligned with workbook |
| Biological and social loss | Proxy implementation |
| Sleep regularity | Proxy implementation, not exact SRI |
| Adaptability | Product-level composite proxy |
| Scientific calibration | Not finalized |

## 🧱 Data Model

The analysis starts from weekly intervals.

| Field | Meaning |
| --- | --- |
| `dayIndex` | day of week in `0..6` |
| `start` | start time in `HH:MM` |
| `end` | end time in `HH:MM` |
| `kind` | `work` or `sleep` |

Cross-midnight segments are split into two normalized intervals before scoring.

## ⚙️ Preprocessing

## 🕒 Interval Normalization

| Item | Current implementation |
| --- | --- |
| Day size | `1440` minutes |
| Week size | `10080` minutes |
| Same-day interval | kept as one interval |
| Cross-midnight interval | split into two intervals |
| Zero-length interval | ignored |

## 🔗 Merge Behavior

| Rule | Current implementation |
| --- | --- |
| Merge same-kind overlaps | yes |
| Merge across positive gap | no |
| Merge work and sleep together | no |

## 📏 Derived Metrics

## 📋 Metric Summary

| Metric | Current formula | Notes |
| --- | --- | --- |
| `totalWorkHours` | `sum(work duration) / 60` | rounded to 1 decimal |
| `totalSleepHours` | `sum(sleep duration) / 60` | rounded to 1 decimal |
| `avgSleepHours` | `totalSleepHours / 7` | rounded to 1 decimal |
| `longShiftCount` | count of work segments `>= 10h` | proxy threshold |
| `longestRecoveryHours` | max gap between consecutive work segments | not workbook-native factor in current form |
| `shortBreaksCount` | count of gaps between work segments `< 11h` | proxy for quick returns |
| `fullyRestedDaysCount` | count of days with sleep `>= 7h` | differs from workbook rest-day definition |
| `nightShiftCount` | count of work segments overlapping biological window | proxy |
| `biologicalHoursLost` | work overlap with biological windows | proxy |
| `socialHoursLost` | work overlap with social windows | proxy |
| `sleepRegularityProxy` | day-level onset and duration variability proxy | not exact SRI |

## 🌙 Biological Window Proxy

| Item | Current implementation |
| --- | --- |
| Window | `23:00 -> 07:00` |
| Computation | overlap between merged work segments and the biological windows |
| Output | `biologicalHoursLost` |
| Limitation | proxy for “optimal sleep opportunity lost”, not validated exact formula |

## 👥 Social Window Proxy

| Item | Current implementation |
| --- | --- |
| Weekdays | `18:00 -> 23:00` |
| Weekends | `10:00 -> 23:00` |
| Computation | overlap between merged work segments and social windows |
| Output | `socialHoursLost` |
| Limitation | may differ from workbook thresholds and formal social-time definition |

## 😴 Sleep Regularity Proxy

The current repository does not implement the exact Sleep Regularity Index.

| Step | Current logic |
| --- | --- |
| 1 | for each day with sleep, capture first sleep onset and total sleep duration |
| 2 | compute standard deviation of daily onset |
| 3 | compute standard deviation of daily duration |
| 4 | normalize penalties with practical caps |
| 5 | convert to a `0..100` proxy score |

Current proxy formula:

| Component | Formula |
| --- | --- |
| `onsetPenalty` | `clamp(onsetStd / 180, 0, 1)` |
| `durationPenalty` | `clamp(durationStd / 120, 0, 1)` |
| `sleepRegularityProxy` | `round((1 - 0.6 * onsetPenalty - 0.4 * durationPenalty) * 100)` |

If fewer than two days contain sleep, the proxy returns `0`.

## 🧠 Score Computation

## 🚨 Risk Score

The current risk score is an SLI-style proxy with eight factors.

### Factor thresholds currently implemented

| Factor key | Low (`0`) | Medium (`1`) | High (`2`) | Notes |
| --- | --- | --- | --- | --- |
| `workedHours` | `< 40` | `>= 40` | `>= 48` | close to workbook |
| `longShifts` | `< 1` | `>= 1` | `>= 3` | differs from workbook |
| `longestRecovery` | `> 48` | `<= 48` | `<= 36` | current code factor, not workbook count-of-24h-breaks factor |
| `shortBreaks` | `< 1` | `>= 1` | `>= 3` | differs from workbook top threshold |
| `fullyRestedDays` | `> 3` | `<= 3` | `<= 1` | based on sleep-rich days, not no-work rest days |
| `nightShifts` | `< 1` | `>= 1` | `>= 3` | mostly close in spirit |
| `biologicalHoursLost` | `< 4` | `>= 4` | `>= 8` | proxy |
| `socialHoursLost` | `< 8` | `>= 8` | `>= 13` | differs from workbook |

### Risk aggregation

| Item | Formula |
| --- | --- |
| raw score | `sliRaw = sum(all 8 item scores)` |
| range | `0..16` |
| normalized score | `riskScore = round(clamp((sliRaw / 16) * 100, 0, 100))` |

## 🛌 Sleep Score

| Component | Formula | Notes |
| --- | --- | --- |
| duration target | `abs(avgSleepHours - 7.5)` | product-level proxy |
| duration score | `clamp(100 - (durationDelta / 3) * 100, 0, 100)` | 3h away from target drives score toward 0 |
| regularity score | `sleepRegularityProxy` | proxy |
| final score | `clamp(durationScore * 0.55 + regularityScore * 0.45, 0, 100)` | weighted blend |

## 🔄 Adaptability Score

| Component | Formula |
| --- | --- |
| inverse risk | `100 - riskScore` |
| final score | `clamp(inverseRisk * 0.65 + sleepScore * 0.35, 0, 100)` |

This score is currently a product-level composite proxy, not yet a cohort-calibrated research endpoint.

## 💬 Explainability Notes By Factor

| Factor | What it tries to represent | Current implementation quality | Main risk |
| --- | --- | --- | --- |
| weekly work hours | overall schedule load | fair | threshold alignment still provisional |
| long shifts | extended-duty burden | fair | workbook thresholds differ |
| longest recovery | longest time between work periods | weak as a matrix factor | may not belong in final burden matrix |
| short breaks | quick returns between shifts | fair | top threshold likely too loose |
| fully rested days | recovery opportunity | weak | currently defined with sleep, not no-work days |
| night shifts | circadian disruption exposure | fair | biological-night proxy only |
| biological hours lost | work encroachment into optimal sleep window | moderate | wording and formula still proxy |
| social hours lost | work encroachment into social time | moderate | threshold mismatch with workbook |
| sleep regularity proxy | consistency of sleep timing and duration | moderate | not exact SRI |
| adaptability | overall work/sleep compatibility | weak-to-moderate | heuristic composite, not final research model |

## 📐 Workbook Alignment Summary

| Topic | Current relation to workbook |
| --- | --- |
| weekly hours | mostly aligned |
| long shifts | threshold mismatch |
| 24h recovery breaks | not implemented as workbook count factor |
| quick returns | partially aligned |
| rest days | definition mismatch |
| night duty count | mostly aligned |
| optimal sleep hours lost | conceptually related but not identical |
| social hours lost | threshold mismatch |

For the detailed matrix, see [xlsm-vs-formula.md](xlsm-vs-formula.md).

## 📖 Source-Citation Plan

This file should evolve toward a source-cited factor table.

Target structure for the next iteration:

| Factor | Formula | Workbook evidence | PDF/article evidence | Code status |
| --- | --- | --- | --- | --- |
| example | current formula | workbook sheet/cell | page/section citation | implemented/proxy/missing |

That will make the repository much easier to review for both medical and open-source collaborators.

## ✅ Source of Truth

If this file and the code disagree, treat [../src/core/scoring.ts](../src/core/scoring.ts) as the authoritative runtime implementation and update this document.
