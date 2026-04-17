# XLSM vs Formula

## Purpose

This document is a practical diff between:

- [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm)
- [formula.md](formula.md)

It is meant to answer:

- what the Excel workbook appears to model
- what the Markdown documentation currently says
- where the two do not match

## Workbook Snapshot

The workbook contains factor-oriented sheets for the main scoring matrix:

- `1. Heures totales`
- `2. Duree poste`
- `3. Pauses 24h`
- `4. Heures nocturnes`
- `5. Jours sans travailler`
- `6. Postes nuit`
- `7. Pause minimal`
- `8. Heures sociales`
- `9. Score precedent`

The summary sheet `Graphiques brut` labels the active scoring dimensions as:

1. Heures travaillées
2. # Postes longues durées
3. # Pauses de 24h
4. # Pauses moins de 11h
5. # Jours de repos
6. # Gardes de nuit
7. h Heures sommeil optimales perdues
8. h Heures sociales perdues

This aligns with an eight-factor SLI-style model.

## Thresholds Visible in the Workbook

From the workbook formulas and parameter sheet:

### Factor 1. Weekly hours worked

Workbook logic on `Graphiques brut`:

- `0` if `< 40`
- `1` if between `40` and `48`
- `2` if `> 48`

This matches the spirit of [formula.md](formula.md).

### Factor 2. Long shifts

Workbook parameter sheet indicates:

- shift is considered long when duration is `> 10h`
- aggregate score uses:
  - `0` if `< 2`
  - `1` if `= 2`
  - `2` if `> 2`

Current [formula.md](formula.md) says:

- `0` if `< 1`
- `1` if `>= 1`
- `2` if `>= 3`

Status:

- mismatch

### Factor 3. Number of 24h breaks

Workbook summary logic:

- `0` if `> 1`
- `1` if `= 1`
- `2` if `< 1`

Workbook parameter sheet also exposes a `>= 2`, `= 1`, `= 0` pattern.

Current [formula.md](formula.md) does not describe this factor as a count of 24h pauses. It instead documents:

- `longestRecoveryHours`

Status:

- conceptual mismatch

### Factor 4. Number of pauses shorter than 11h

Workbook summary logic:

- `0` if `< 1`
- `1` if `= 1`
- `2` if `> 1`

Workbook parameter sheet confirms the `11h` threshold.

Current [formula.md](formula.md) says:

- `0` if `< 1`
- `1` if `>= 1`
- `2` if `>= 3`

Status:

- mismatch

### Factor 5. Number of rest days

Workbook summary logic:

- `0` if `> 1`
- `1` if `= 1`
- `2` if `< 1`

Current [formula.md](formula.md) documents `fullyRestedDaysCount` as:

- days with at least `7h` sleep

This is not the same thing as:

- days without work
- rest days in a schedule-based occupational health matrix

Status:

- major definition mismatch

### Factor 6. Night duties / night shifts

Workbook summary logic:

- `0` if `< 1`
- `1` if between `1` and `2`
- `2` if `> 2`

Current [formula.md](formula.md) says:

- `0` if `< 1`
- `1` if `>= 1`
- `2` if `>= 3`

These are close in intent and differ only in wording of the middle bucket.

Status:

- mostly aligned

### Factor 7. Optimal sleep hours lost

Workbook summary logic:

- `0` if `< 8`
- `1` if `= 8`
- `2` if `> 8`

Current [formula.md](formula.md) uses:

- `biologicalHoursLost`
- computed as work overlap with a fixed `23:00 -> 07:00` window

This looks directionally related, but it is not the same documented concept:

- workbook wording: optimal sleep hours lost
- app wording: biological work overlap proxy

Status:

- partial conceptual alignment, implementation unclear

### Factor 8. Social hours lost

Workbook summary logic:

- `0` if `< 6`
- `1` if between `6` and `13`
- `2` if `> 13`

Current [formula.md](formula.md) says:

- `0` if `< 8`
- `1` if `>= 8`
- `2` if `>= 13`

Status:

- mismatch

## Main Differences with the Current App Documentation

## 1. Excel is centered on work-schedule burden factors

The workbook is very clearly organized around an SLI-style occupational schedule matrix.

The current app documentation adds:

- sleep duration proxy
- sleep regularity proxy
- adaptability score

Those layers are useful product additions, but they are not the same as the workbook matrix.

## 2. Recovery is modeled differently

The workbook appears to distinguish:

- `# Pauses de 24h`
- `# Pauses moins de 11h`

Current [formula.md](formula.md) includes:

- `longestRecoveryHours`
- `shortBreaksCount`

This means the app currently mixes:

- one direct count-based factor from the matrix
- one extra longest-gap metric that may not belong to the workbook scoring table

## 3. Rest days are not defined the same way

This is the clearest mismatch.

Workbook:

- rest day means a day without work

Current app formula reference:

- rested day means a day with at least `7h` sleep

These two definitions will produce very different scores.

## 4. Social-hours threshold differs

Workbook points to:

- low concern below `6h` lost

Current app docs say:

- low concern below `8h` lost

This should be reconciled before claiming matrix fidelity.

## 5. Long shifts and quick returns are stricter in the workbook

Workbook thresholding looks closer to:

- long shifts: `0 / 1 / 2+`
- quick returns: `0 / 1 / 2+`

Current app documentation is looser for the highest bucket on some factors.

## What This Means for the Next Update

If the workbook is the preferred source for the scoring matrix, the next implementation pass should likely:

1. keep the current preprocessing and interval normalization foundations
2. rename the factors in code to match the workbook vocabulary
3. replace `longestRecoveryHours` as a scoring factor with `count24hBreaks` if that is the intended matrix input
4. redefine rest days as no-work days, not sleep-rich days
5. align thresholds for long shifts, quick returns, and social hours lost
6. separate the SLI-style matrix from any additional product-level sleep/adaptability scores

## Recommendation

Use the workbook as the reference for the burden matrix, and use [formula.md](formula.md) for:

- exact app behavior today
- implementation notes
- future extensions beyond the matrix

In practice:

- `xlsm-vs-formula.md` should drive the refactor discussion
- `formula.md` should be updated after the code changes land
