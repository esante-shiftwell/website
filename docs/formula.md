# 🧮 Formula Reference

## 🎯 Purpose

This document describes the formulas currently implemented in the repository.

Important references:

| Reference | Role |
| --- | --- |
| [../src/core/scoring.ts](../src/core/scoring.ts) | Runtime source of truth |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | Gap analysis between workbook logic and this document |
| [external-link.md](external-link.md) | External references, provenance notes, and local review inventory |
| [evidence-map.md](evidence-map.md) | Factor-to-source traceability matrix |

The safest reading rule is:

- this file documents what the app computes today
- it does not claim that every formula is already fully aligned with every external source

## 🧾 Provenance Reminder

This file is Shiftwell-authored documentation.

It may refer to:

- an external workbook used as a scoring reference
- third-party external articles or PDFs
- local working copies or extracted artifacts stored for review

Those external materials remain external works. This file only documents how Shiftwell currently interprets or implements related concepts.

## 🚦 Formula Status

| Topic | Current status |
| --- | --- |
| Burden matrix thresholds | Mostly workbook-aligned in runtime |
| 24h breaks and rest days | Workbook-aligned in runtime |
| Biological hours lost | Threshold aligned, underlying metric still proxy |
| Social hours lost | Threshold aligned, underlying metric still proxy |
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

### 🕒 Interval Normalization

| Item | Current implementation |
| --- | --- |
| Day size | `1440` minutes |
| Week size | `10080` minutes |
| Same-day interval | kept as one interval |
| Cross-midnight interval | split into two intervals |
| Zero-length interval | ignored |

### 🔗 Merge Behavior

| Rule | Current implementation |
| --- | --- |
| Merge same-kind overlaps | yes |
| Merge across positive gap | no |
| Merge work and sleep together | no |

## 📏 Derived Metrics

### 📋 Metric Summary

| Metric | Current formula | Notes |
| --- | --- | --- |
| `totalWorkHours` | `sum(work duration) / 60` | rounded to 1 decimal |
| `totalSleepHours` | `sum(sleep duration) / 60` | rounded to 1 decimal |
| `avgSleepHours` | `totalSleepHours / 7` | rounded to 1 decimal |
| `longShiftCount` | count of work segments `>= 10h` | workbook-aligned duration rule |
| `count24hBreaks` | `sum(floor(gapBetweenWorkSegments / 24h))` | runtime interpretation of workbook factor 3 |
| `longestRecoveryHours` | max gap between consecutive work segments | derived support metric, not a risk factor anymore |
| `shortBreaksCount` | count of gaps between work segments `< 11h` | workbook-aligned threshold family |
| `restDaysCount` | count of week days with `0` work minutes | workbook-aligned factor 5 |
| `fullyRestedDaysCount` | count of days with sleep `>= 7h` | derived support metric, not a risk factor anymore |
| `nightShiftCount` | count of work segments overlapping biological window | workbook-aligned threshold family, proxy detection logic |
| `biologicalHoursLost` | work overlap with biological windows | proxy for workbook factor 7 |
| `socialHoursLost` | work overlap with social windows | proxy for workbook factor 8 |
| `sleepRegularityProxy` | day-level onset and duration variability proxy | not exact SRI |

### 🌙 Biological Window Proxy

| Item | Current implementation |
| --- | --- |
| Window | `23:00 -> 07:00` |
| Computation | overlap between merged work segments and the biological windows |
| Output | `biologicalHoursLost` |
| Limitation | proxy for "optimal sleep opportunity lost", not a validated exact formula |

### 👥 Social Window Proxy

| Item | Current implementation |
| --- | --- |
| Weekdays | `18:00 -> 23:00` |
| Weekends | `10:00 -> 23:00` |
| Computation | overlap between merged work segments and social windows |
| Output | `socialHoursLost` |
| Limitation | threshold is workbook-aligned, underlying social-time metric is still proxy |

### 😴 Sleep Regularity Proxy

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

### 🚨 Risk Score

The current risk score is an SLI-style matrix with eight runtime factors.

### Factor thresholds currently implemented

| Factor key | Low (`0`) | Medium (`1`) | High (`2`) | Notes |
| --- | --- | --- | --- | --- |
| `workedHours` | `< 40` | `40..48` | `> 48` | workbook-aligned |
| `longShifts` | `< 2` | `= 2` | `> 2` | workbook-aligned |
| `count24hBreaks` | `> 1` | `= 1` | `< 1` | workbook-aligned interpretation |
| `shortBreaks` | `< 1` | `= 1` | `> 1` | workbook-aligned |
| `restDays` | `> 1` | `= 1` | `< 1` | workbook-aligned |
| `nightShifts` | `< 1` | `1..2` | `> 2` | workbook-aligned threshold family |
| `biologicalHoursLost` | `< 8` | `= 8` | `> 8` | threshold aligned, metric still proxy |
| `socialHoursLost` | `< 6` | `6..13` | `> 13` | threshold aligned, metric semantics still proxy |

### Risk aggregation

| Item | Formula |
| --- | --- |
| raw score | `sliRaw = sum(all 8 item scores)` |
| range | `0..16` |
| normalized score | `riskScore = round(clamp((sliRaw / 16) * 100, 0, 100))` |

### 🛌 Sleep Score

| Component | Formula | Notes |
| --- | --- | --- |
| duration target | `abs(avgSleepHours - 7.5)` | product-level proxy |
| duration score | `clamp(100 - (durationDelta / 3) * 100, 0, 100)` | 3h away from target drives score toward 0 |
| regularity score | `sleepRegularityProxy` | proxy |
| final score | `clamp(durationScore * 0.55 + regularityScore * 0.45, 0, 100)` | weighted blend |

### 🔄 Adaptability Score

| Component | Formula |
| --- | --- |
| inverse risk | `100 - riskScore` |
| final score | `clamp(inverseRisk * 0.65 + sleepScore * 0.35, 0, 100)` |

This score is currently a product-level composite proxy, not yet a cohort-calibrated research endpoint.

## 💬 Explainability Notes By Factor

| Factor | What it tries to represent | Current implementation quality | Main risk |
| --- | --- | --- | --- |
| weekly work hours | overall schedule load | good | still needs scientific calibration |
| long shifts | extended-duty burden | good | still proxy-normalized into a 0..100 risk score |
| 24h breaks | large recovery opportunities | fair-to-good | exact workbook semantics may still need confirmation |
| short breaks | quick returns between shifts | good | still depends on schedule normalization assumptions |
| rest days | no-work days in the week | good | none beyond schedule completeness |
| night shifts | circadian disruption exposure | fair | biological-night proxy only |
| biological hours lost | work encroachment into optimal sleep opportunity | moderate | workbook wording is stronger than the current proxy metric |
| social hours lost | work encroachment into a fixed social-time window | moderate | threshold is aligned, but the metric definition still uses a runtime proxy |
| sleep regularity proxy | consistency of sleep timing and duration | moderate | not exact SRI |
| adaptability | overall work/sleep compatibility | weak-to-moderate | heuristic composite, not final research model |

## 📐 Workbook Alignment Summary

In this file, "workbook" refers to an external scoring reference that Shiftwell compares itself against through a local working copy.

| Topic | Current relation to workbook |
| --- | --- |
| weekly hours | aligned |
| long shifts | aligned |
| 24h recovery breaks | aligned in runtime interpretation |
| quick returns | aligned |
| rest days | aligned |
| night duty count | threshold aligned, detection still proxy |
| optimal sleep hours lost | threshold aligned, concept still proxy |
| social hours lost | threshold aligned, concept still proxy |

For the detailed matrix, see [xlsm-vs-formula.md](xlsm-vs-formula.md).

## 📖 Source-Citation Plan

This file should continue evolving toward a source-cited factor table.

Target structure:

| Factor | Formula | Workbook evidence | External-source evidence | Code status |
| --- | --- | --- | --- | --- |
| example | current formula | workbook sheet/cell | page/section citation | implemented/proxy/missing |

That makes the repository easier to review for both medical and open-source collaborators.

## ✅ Source of Truth

If this file and the code disagree, treat [../src/core/scoring.ts](../src/core/scoring.ts) as the authoritative runtime implementation and update this document.
