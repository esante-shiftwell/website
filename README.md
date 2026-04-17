# Shiftwell

Shiftwell is a multilingual Next.js application for exploring how weekly work schedules interact with sleep patterns in people with atypical hours.

The current repository is an MVP focused on:

- 7-day work and sleep schedule entry
- local score computation in the browser
- transparent, explainable proxy metrics
- optional opt-in research contribution flow

Shiftwell is a research-oriented pre-analysis tool. It is not a medical device and does not provide clinical advice.

## Project Status

This repository is being prepared for open-source release.

What is already in place:

- static web app built with Next.js
- localized experience in French, English, and German
- weekly schedule analysis flow
- proxy scoring model for risk, sleep, and adaptability
- consent-oriented contribution flow

What is still intentionally provisional:

- scientific calibration of thresholds and weights
- exact alignment with the reference protocol/paper
- cohort-based benchmarking
- full research-grade documentation of every formula variant

## Documentation

Start with [docs/README.md](docs/README.md).

Key documents:

- [docs/README.md](docs/README.md): documentation index and source material overview
- [docs/formula.md](docs/formula.md): implemented scoring logic and research alignment notes
- [docs/external-link.md](docs/external-link.md): curated external references and supporting resources
- [docs/xlsm-vs-formula.md](docs/xlsm-vs-formula.md): comparison between the Excel scoring workbook and the current Markdown formula reference

Included source material:

- [docs/Fatigue Index_scoring_system_15.xlsm](docs/Fatigue%20Index_scoring_system_15.xlsm)
- [docs/other_sources/SleepSync-1.pdf](docs/other_sources/SleepSync-1.pdf)
- [docs/other_sources/SleepSync-1.txt](docs/other_sources/SleepSync-1.txt)
- [docs/other_sources/Song2025_korean sleep intervention real time advice-1.pdf](docs/other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.pdf)
- [docs/other_sources/Song2025_korean sleep intervention real time advice-1.txt](docs/other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.txt)

## Product Overview

Shiftwell lets a participant:

1. choose a locale
2. enter a weekly profile
3. fill work and sleep intervals across 7 days
4. compute scores locally
5. optionally export or contribute data with explicit consent

The app exposes supporting pages for methodology, study framing, consent, legal information, and project background.

## Scoring Summary

The scoring engine currently lives in [src/core/scoring.ts](src/core/scoring.ts).

Today the repository implements a proxy model, not a final validated research model:

- `riskScore`: derived from an SLI-style weekly load proxy
- `sleepScore`: derived from average sleep duration and a sleep regularity proxy
- `adaptabilityScore`: composite score combining inverse risk and sleep quality

The formulas documented in `docs/formula.md` are the reference for the open-source repository documentation.

## Tech Stack

- Next.js
- React
- TypeScript
- static deployment target

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Lint the codebase:

```bash
npm run lint
```

## Repository Structure

```text
src/
  app/          App Router pages
  components/   UI and analysis flow
  core/         data model and scoring logic
  lib/          export and contribution helpers
docs/           methodology notes, references, and source documents
public/         static assets
```

## Open-Source Direction

The goal of the repository is to make the product logic inspectable:

- what the app computes today
- what comes from the research basis
- where the current MVP still uses proxy logic
- how contributors can help improve clarity, rigor, and implementation quality

If you are onboarding through the codebase, read [docs/README.md](docs/README.md) first, then [docs/formula.md](docs/formula.md), then [docs/xlsm-vs-formula.md](docs/xlsm-vs-formula.md), and finally [src/core/scoring.ts](src/core/scoring.ts).
