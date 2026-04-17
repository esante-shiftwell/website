# 🩺 Shiftwell

Shiftwell is a multilingual web application for exploring how weekly work schedules interact with sleep patterns in people with atypical hours.

It is designed as a research-oriented, medically adjacent open-source project:

- medically serious in tone and documentation
- transparent about formulas, assumptions, and limitations
- friendly to contributors who are not sleep-science experts
- accessible to multilingual users and collaborators

Shiftwell is not a medical device and does not provide diagnosis, treatment, or clinical recommendations.

## 🎯 Why This Repository Exists

Shiftwell helps structure weekly work and sleep schedules, compute interpretable scores locally in the browser, and support an explicit-consent research workflow.

The project is useful for:

- chronobiology and shift-work exploration
- transparent schedule-based scoring experiments
- multilingual patient-facing or participant-facing prototypes
- open-source collaboration between product, research, and engineering contributors

## 📌 Project Snapshot

| Area | Current state |
| --- | --- |
| Product | MVP web app |
| Audience | People with atypical schedules and research collaborators |
| Languages | French, English, German |
| Scoring | Proxy model in production |
| Research basis | Workbook + PDFs + article references in `docs/` |
| Contribution model | Optional, explicit-consent, opt-in |

## 🧪 Medical and Research Positioning

| Topic | Position |
| --- | --- |
| Clinical use | Not for diagnosis or treatment |
| Scientific ambition | Make the scoring model explainable and reviewable |
| Data collection | Minimal MVP, participant-entered schedule data |
| Transparency | Formula and source documents are stored in the repo |
| Current limitation | Runtime scoring still uses proxy logic in several places |

## 📚 Documentation

Start with [docs/README.md](docs/README.md).

Recommended reading order:

1. [docs/README.md](docs/README.md)
2. [docs/architecture.md](docs/architecture.md)
3. [docs/formula.md](docs/formula.md)
4. [docs/xlsm-vs-formula.md](docs/xlsm-vs-formula.md)
5. [docs/external-link.md](docs/external-link.md)
6. [src/core/scoring.ts](src/core/scoring.ts)

Key documents:

| File | Purpose |
| --- | --- |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/architecture.md](docs/architecture.md) | Technical and product architecture overview |
| [docs/formula.md](docs/formula.md) | Current implemented formulas and explainability notes |
| [docs/xlsm-vs-formula.md](docs/xlsm-vs-formula.md) | Matrix of differences between workbook logic and current Markdown formula reference |
| [docs/external-link.md](docs/external-link.md) | Sources, references, and UI inspirations |

Primary source material in the repository:

| Source | Type |
| --- | --- |
| [docs/Fatigue Index_scoring_system_15.xlsm](docs/Fatigue%20Index_scoring_system_15.xlsm) | Scoring workbook |
| [docs/other_sources/SleepSync-1.pdf](docs/other_sources/SleepSync-1.pdf) | Research source PDF |
| [docs/other_sources/SleepSync-1.txt](docs/other_sources/SleepSync-1.txt) | Extracted text |
| [docs/other_sources/Song2025_korean sleep intervention real time advice-1.pdf](docs/other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.pdf) | Research source PDF |
| [docs/other_sources/Song2025_korean sleep intervention real time advice-1.txt](docs/other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.txt) | Extracted text |

## 🖥️ Product Overview

Today, a participant can:

1. choose a language
2. enter a weekly profile
3. fill work and sleep intervals across 7 days
4. compute scores locally
5. optionally export or contribute data with explicit consent

Supporting pages already exist for methodology, study framing, consent, legal information, and project background.

## 🧮 Scoring Overview

The scoring engine currently lives in [src/core/scoring.ts](src/core/scoring.ts).

The app currently computes three user-facing scores:

| Score | Current meaning |
| --- | --- |
| `riskScore` | SLI-style weekly load proxy |
| `sleepScore` | Sleep duration + sleep regularity proxy |
| `adaptabilityScore` | Composite proxy based on inverse risk and sleep |

Important:

- the current code is not yet a final research-grade implementation of the workbook
- some thresholds and factor definitions still diverge from the Excel model
- the workbook and PDF sources are stored in the repo to make the model auditable

## 🌍 Multilingual Support

Shiftwell is intentionally multilingual.

Current locales:

| Locale | Status |
| --- | --- |
| `fr` | Implemented |
| `en` | Implemented |
| `de` | Implemented |

Localization lives primarily in [src/i18n.ts](src/i18n.ts) and locale-aware app routes under [src/app](src/app).

This matters for open source because contributors can help on:

- translation quality
- medical/research wording
- consistency of consent and explanation text
- future locale additions

## 🤝 Contributing

You do not need to be a sleep researcher to contribute usefully.

Good first contribution areas:

| Area | Examples |
| --- | --- |
| Documentation | clarify formulas, add citations, improve onboarding |
| UX | improve schedule entry, reduce ambiguity in the form |
| Localization | review French, English, and German wording |
| Frontend | improve explainability panels and page structure |
| Research alignment | compare code with workbook and source PDFs |

If you are not confident with the science, you can still help by improving:

- readability
- wording
- tables and diagrams
- UI flow
- code organization
- tests and validation helpers

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| App framework | Next.js |
| UI runtime | React |
| Language | TypeScript |
| Deployment target | static web app |

## 🚀 Getting Started

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

## 🗂️ Repository Structure

```text
src/
  app/          App Router pages
  components/   UI and analysis flow
  core/         data model and scoring logic
  lib/          export and contribution helpers
docs/           methodology notes, references, source material
scripts/        documentation and extraction utilities
public/         static assets
```

## 🌱 Open-Source Direction

The long-term goal is to make Shiftwell:

- medically credible in presentation
- rigorous in formula documentation
- explicit about what is implemented versus aspirational
- easy to understand for non-expert contributors
- easy to inspect for research collaborators

The best next-stop documents for contributors are [docs/architecture.md](docs/architecture.md), [docs/formula.md](docs/formula.md), and [docs/xlsm-vs-formula.md](docs/xlsm-vs-formula.md).
