# Formula Reference

## Purpose

This document describes the formulas currently implemented in the repository.

Important:

- the source of truth for runtime behavior is [../src/core/scoring.ts](../src/core/scoring.ts)
- the current implementation is a proxy scoring model
- some older research notes and draft formulas are stricter or more ambitious than the code currently shipped
- the Excel workbook comparison lives in [xlsm-vs-formula.md](xlsm-vs-formula.md)

For open-source readers, this file should answer one question first:

"What does Shiftwell calculate today?"

## Data Model

The analysis starts from a weekly list of intervals:

- `work` segments
- `sleep` segments

Each segment contains:

- `dayIndex` in `0..6`
- `start` in `HH:MM`
- `end` in `HH:MM`
- `kind` in `work | sleep`

Cross-midnight segments are split into two normalized intervals before scoring.

## Preprocessing

### 1. Normalize intervals

Each segment is converted into absolute minutes over a 7-day window:

- `MINUTES_PER_DAY = 1440`
- `WEEK_MINUTES = 10080`

If `end > start`, the interval stays on the same day.

If `end < start`, the interval is split across midnight:

- segment A: `start -> end_of_day`
- segment B: `start_of_next_day -> end`

Zero-length segments are ignored.

### 2. Merge overlapping intervals

Intervals are merged when:

- they are of the same kind
- they overlap in time

Current implementation does not merge same-kind intervals across a positive gap.

## Derived Metrics

## Work and sleep totals

`totalWorkMinutes = sum(work.endAbs - work.startAbs)`

`totalSleepMinutes = sum(sleep.endAbs - sleep.startAbs)`

`totalWorkHours = round(totalWorkMinutes / 60, 1)`

`totalSleepHours = round(totalSleepMinutes / 60, 1)`

`avgSleepHours = round((totalSleepMinutes / 60) / 7, 1)`

## Long shifts

`longShiftCount = count(work segment duration >= 10 hours)`

## Recovery and short breaks

For each consecutive pair of merged work segments:

`gapMin = next.startAbs - current.endAbs`

Then:

- `longestRecoveryHours = max(gapMin) / 60`
- `shortBreaksCount = count(gapMin < 11 hours)`

Note:

- this is based on merged work segments
- if there is only one work segment, longest recovery stays at `0`

## Fully rested days

Current implementation uses sleep, not no-work days.

For each calendar day:

`dailySleepMinutes[day] = total sleep overlapping that day`

Then:

`fullyRestedDaysCount = count(dailySleepMinutes >= 7 hours)`

This differs from some earlier notes where a "full rest day" meant a day with no official work interval.

## Biological window overlap

The app uses a proxy biological night window:

- every day from `23:00` to `24:00`
- next morning from `00:00` to `07:00`

The total overlap between merged work segments and those windows is:

`biologicalWorkMinutes = sum(overlap(work, biologicalWindows))`

Then:

`biologicalHoursLost = round(biologicalWorkMinutes / 60, 1)`

Night shifts are counted as:

`nightShiftCount = count(work segment overlapping any biological window)`

## Social window overlap

The app uses a proxy social availability window:

- weekdays: `18:00 -> 23:00`
- weekends: `10:00 -> 23:00`

The overlap between merged work segments and those windows is:

`socialWorkMinutes = sum(overlap(work, socialWindows))`

Then:

`socialHoursLost = round(socialWorkMinutes / 60, 1)`

## Sleep regularity proxy

The current repository does not implement the exact Sleep Regularity Index.

Instead it uses a proxy based on day-level variability:

For each day with sleep:

- `onset = first sleep minute of the day`
- `duration = total sleep minutes in the day`

Then compute:

- standard deviation of sleep onset
- standard deviation of sleep duration

Penalties are normalized with practical caps:

- `onsetPenalty = clamp(onsetStd / 180, 0, 1)`
- `durationPenalty = clamp(durationStd / 120, 0, 1)`

Final proxy:

`sleepRegularityProxy = round((1 - 0.6 * onsetPenalty - 0.4 * durationPenalty) * 100)`

If fewer than 2 days contain sleep, the proxy returns `0`.

## Score Computation

## 1. Risk score

The current risk score is based on an SLI-style proxy with eight items.

Each item is bucketed into:

- `0` low concern
- `1` moderate concern
- `2` higher concern

### Item thresholds

`workedHours`

- `0` if `< 40`
- `1` if `>= 40`
- `2` if `>= 48`

`longShifts`

- `0` if `< 1`
- `1` if `>= 1`
- `2` if `>= 3`

`longestRecovery`

- `0` if `> 48`
- `1` if `<= 48`
- `2` if `<= 36`

`shortBreaks`

- `0` if `< 1`
- `1` if `>= 1`
- `2` if `>= 3`

`fullyRestedDays`

- `0` if `> 3`
- `1` if `<= 3`
- `2` if `<= 1`

`nightShifts`

- `0` if `< 1`
- `1` if `>= 1`
- `2` if `>= 3`

`biologicalHoursLost`

- `0` if `< 4`
- `1` if `>= 4`
- `2` if `>= 8`

`socialHoursLost`

- `0` if `< 8`
- `1` if `>= 8`
- `2` if `>= 13`

### Raw SLI proxy

`sliRaw = sum(all 8 item scores)`

Range:

- minimum `0`
- maximum `16`

### Risk normalization

`riskScore = round(clamp((sliRaw / 16) * 100, 0, 100))`

## 2. Sleep score

The sleep score combines sleep duration and sleep regularity proxy.

Duration target:

`durationDelta = abs(avgSleepHours - 7.5)`

`durationScore = clamp(100 - (durationDelta / 3) * 100, 0, 100)`

Regularity component:

`regularityScore = sleepRegularityProxy`

Final sleep score:

`sleepScore = clamp(durationScore * 0.55 + regularityScore * 0.45, 0, 100)`

## 3. Adaptability score

The adaptability score is currently a composite proxy.

`inverseRisk = 100 - riskScore`

`adaptabilityScore = clamp(inverseRisk * 0.65 + sleepScore * 0.35, 0, 100)`

## Explanations Shown in the UI

The app also generates short explanation strings when some conditions are met, for example:

- night shifts detected
- short recovery breaks detected
- work overlaps biological sleep window
- average sleep below 7 hours
- low sleep regularity proxy

These are qualitative explanations, not extra formula inputs.

## Differences Between This File and Older Draft Notes

Older notes may mention:

- commute-expanded work intervals
- exact biological sleep opportunity accounting
- official shifts merged when gap < 30 minutes
- exact SRI minute-by-minute matching
- full rest days defined as days without work

Those ideas are useful research references, but they are not fully implemented in the current app.

For open-source contributors, the safe rule is:

- document the code as implemented
- keep research targets clearly separated from current runtime behavior

## Research Alignment Notes

The repository already points to a scientific basis, but the product code still uses proxy logic in several places.

Main gaps to close in future iterations:

- align thresholds with the final validated article/protocol
- decide whether "fully rested day" should be based on sleep, no-work day, or another research definition
- implement a stricter shift-merging rule if needed
- replace the regularity proxy with an exact SRI implementation if the protocol requires it
- calibrate the adaptability score against cohort data rather than a fixed heuristic composite

## Source of Truth

If this file and the code ever disagree, treat [../src/core/scoring.ts](../src/core/scoring.ts) as the authoritative implementation and update this document.
