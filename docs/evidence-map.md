# 🧾 Evidence Map

## 🎯 Purpose

This file maps runtime factors and scores to traceable evidence locators.

It is the bridge between:

- an external scoring reference workbook
- the current Shiftwell runtime formula
- the explainability UI

## 🧾 Provenance Reminder

This file maps how Shiftwell uses external materials.

It does not mean:

- the external workbook is authored by Shiftwell
- locally stored PDFs are part of Shiftwell-authored documentation
- extracted text artifacts replace the original external works

## 🧱 Reading Rule

| Column | Meaning |
| --- | --- |
| Runtime key | the key used by `ScoreTrace` |
| Workbook locator | the best workbook location currently identified |
| Runtime locator | the exact code/doc area used today |
| Precision | how exact the current citation is |
| Status | whether the runtime concept is aligned, proxy, or disputed |

## 📊 Factor Matrix

| Runtime key | Workbook locator | Runtime locator | Precision | Status |
| --- | --- | --- | --- | --- |
| `workedHours` | `Graphiques brut!J4:K6`, thresholds `Parametres score!E6,E8` | `src/core/scoring.ts -> computeDerivedMetrics.totalWorkHours + scoreSLIProxy.workedHours` | high | implemented |
| `longShifts` | `Graphiques brut!L4:M6`, hints in `Parametres score!C9,E9` | `src/core/scoring.ts -> longShiftCount + scoreSLIProxy.longShifts` | medium-high | implemented |
| `count24hBreaks` | `Graphiques brut!N4:O6` | `src/core/scoring.ts -> count24hBreaks + scoreSLIProxy.count24hBreaks` | medium-high | implemented |
| `shortBreaks` | `Graphiques brut!P4:Q6`, threshold hint `Parametres score!C24,E24` | `src/core/scoring.ts -> shortBreaksCount + scoreSLIProxy.shortBreaks` | high | implemented |
| `restDays` | `Graphiques brut!R4:S6` | `src/core/scoring.ts -> restDaysCount + scoreSLIProxy.restDays` | high | implemented |
| `nightShifts` | `Graphiques brut!T4:U6` | `src/core/scoring.ts -> nightShiftCount + scoreSLIProxy.nightShifts` | high for thresholds, medium for detection semantics | implemented |
| `biologicalHoursLost` | `Graphiques brut!V4:W6` | `src/core/scoring.ts -> biologicalHoursLost + scoreSLIProxy.biologicalHoursLost` | high for thresholds, medium for concept alignment | proxy |
| `socialHoursLost` | `Graphiques brut!X4:Y6` | `src/core/scoring.ts -> socialHoursLost + scoreSLIProxy.socialHoursLost` | high for thresholds, medium for concept alignment | proxy |
| `sleepDuration` | no workbook-native factor | `src/core/scoring.ts -> scoreSleepProxy.durationScore` | high for runtime, low for external evidence | proxy |
| `sleepRegularityProxy` | no workbook-native factor | `src/core/scoring.ts -> computeSleepRegularityProxy + scoreSleepProxy` | high for runtime, low for external evidence | proxy |

## 📈 Score Matrix

| Runtime key | Workbook locator | Runtime locator | Precision | Status |
| --- | --- | --- | --- | --- |
| `riskScore` | burden items exposed in `Graphiques brut!J6:X6` | `src/core/scoring.ts -> scoreSLIProxy` | medium | proxy |
| `sleepScore` | no workbook-native endpoint | `src/core/scoring.ts -> scoreSleepProxy` | high for runtime | proxy |
| `adaptabilityScore` | no workbook-native endpoint | `src/core/scoring.ts -> scoreAdaptabilityProxy` | high for runtime | proxy |

## 🔗 Source Ids Used In Code

| Source id | Provenance | Main usage |
| --- | --- | --- |
| `code:core-scoring` | Shiftwell-authored code | runtime formula and trace |
| `code:formula-doc` | Shiftwell-authored documentation | human-readable explanation of current implementation |
| `workbook:fatigue-matrix` | local working copy of an external workbook | eight-factor burden matrix |
| `workbook:fatigue-params` | local working copy of an external workbook | threshold hints and workbook parameters |
| `article:frontiers-2025` | third-party public article | public health framing only |
| `pdf:sleepsync` | locally stored third-party PDF | weak contextual support only |
| `pdf:song2025` | locally stored third-party PDF | physiology and individualized scheduling context |

## 🔬 Precision Notes For Factors 7 And 8

| Factor | What the workbook gives us | What external sources currently add | What remains unresolved |
| --- | --- | --- | --- |
| `biologicalHoursLost` | stable factor name and thresholds from `Graphiques brut!V4:W6` | `pdf:song2025` supports the idea that alertness depends on sleep pressure, circadian phase, and physiologically feasible sleep timing | the workbook does not yet expose a public formal definition of how “optimal sleep hours lost” should be reconstructed from schedule data |
| `socialHoursLost` | stable factor name and thresholds from `Graphiques brut!X4:Y6` | no strong external source in the current repo defines a canonical social-hours-loss formula | the runtime still uses fixed social windows, so semantics remain a practical proxy rather than a source-backed formula |

## 🛠 Next Upgrade

The next evidence-map upgrade should add:

| Upgrade | Why |
| --- | --- |
| workbook cell ranges per factor sheet | move from summary-sheet traceability to factor-sheet traceability |
| PDF page numbers | avoid coarse PDF citations |
| per-link alignment notes | explain why a source is conceptual vs formula-defining |
| small compliant excerpts | make audits easier without overquoting |
