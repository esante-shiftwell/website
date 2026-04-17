# TODO

This file tracks the main remaining work for Shiftwell as an open-source, medically serious, explainable scoring project.

It is intentionally split into `Now`, `Next`, and `Later` so contributors can find the current frontier quickly.

## Now

- [x] Update [docs/formula.md](C:/workspace/shiftwell/docs/formula.md) to match the current runtime in [src/core/scoring.ts](C:/workspace/shiftwell/src/core/scoring.ts)
- [x] Update [docs/xlsm-vs-formula.md](C:/workspace/shiftwell/docs/xlsm-vs-formula.md) after the latest workbook-alignment changes
- [x] Add targeted core scoring tests for:
  - weekly hours buckets
  - long shifts bucket
  - `count24hBreaks`
  - `restDaysCount`
  - quick returns `<11h`
  - night shifts
  - biological/social hours thresholds
- [ ] Review factor 7 (`biologicalHoursLost`) against the workbook wording "optimal sleep hours lost"
- [ ] Review factor 8 (`socialHoursLost`) wording and evidence note so the UI states clearly that the threshold is workbook-aligned but the underlying metric is still proxy
- [x] Clean the 3 existing calendar warnings:
  - [src/components/analyze/calendar/DayMixedEditor.tsx](C:/workspace/shiftwell/src/components/analyze/calendar/DayMixedEditor.tsx)
  - [src/components/analyze/calendar/WeeklyScheduleInline.tsx](C:/workspace/shiftwell/src/components/analyze/calendar/WeeklyScheduleInline.tsx)
  - [src/components/analyze/calendar/WeeklyScheduleMobile.tsx](C:/workspace/shiftwell/src/components/analyze/calendar/WeeklyScheduleMobile.tsx)

## Next

- [ ] Extend `ScoreTrace` so more profile inputs can be marked as:
  - connected to scoring
  - collected but not connected yet
  - derived but disputed
- [ ] Replace more explainability fallback logic with trace-native data
- [ ] Add a lightweight evidence citation layer for external PDFs based on:
  - source id
  - locator
  - short note
  - optional short quote
- [ ] Add a contributor-facing architecture note for explainability data flow:
  - input
  - normalized schedule
  - derived metrics
  - factors
  - scores
  - evidence
  - UI rendering
- [ ] Add a small fixture set of weekly schedules for regression checking

## Later

- [ ] Introduce explicit formula families / versions in the core
  - `proxy-v0.x`
  - `xlsm-aligned-v0.x`
  - `research-v1-alpha`
- [ ] Let explainability switch cleanly by active formula version
- [ ] Decide whether factor 7 should remain proxy or become workbook-native
- [ ] Decide whether external article / PDF references need page-level locators everywhere
- [ ] Add a public changelog of scoring changes for open-source reviewers
- [ ] Add confidence / uncertainty metadata per factor and per score

## Product Notes

- [ ] Keep the long-mode profile inputs visibly marked `Coming soon` until they are actually connected to the runtime trace
- [ ] Keep provenance language strict:
  - external references remain third-party works
  - local copies are only working copies / extracted artifacts
  - Shiftwell documentation must not imply authorship of external material
