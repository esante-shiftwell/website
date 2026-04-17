# 🏗️ Architecture

## 🎯 Purpose

This document explains how Shiftwell is organized so contributors can quickly find the right place to work.

It is written for:

- developers who know React/Next.js
- contributors who are strong in writing or product but weaker in code
- research collaborators who want to understand where the scoring logic lives

## 🧱 High-Level Architecture

| Layer | Responsibility | Main locations |
| --- | --- | --- |
| Routing | locale-aware pages and navigation | [../src/app](../src/app) |
| UI flow | multi-step analysis experience | [../src/components](../src/components) |
| Domain model | schedule and score types | [../src/core/model.ts](../src/core/model.ts) |
| Scoring engine | interval normalization, derived metrics, score computation | [../src/core/scoring.ts](../src/core/scoring.ts) |
| Localization | dictionaries and supported locales | [../src/i18n.ts](../src/i18n.ts) |
| Export and contribution | JSON export and optional submission | [../src/lib](../src/lib) |
| Documentation and sources | workbook, PDFs, formula notes | [../docs](../docs) |

## 🔄 User Flow

| Step | What happens | Main files |
| --- | --- | --- |
| Locale selection | user lands on a language-aware route | [../src/app/page.tsx](../src/app/page.tsx), [../src/app/[locale]/page.tsx](../src/app/[locale]/page.tsx) |
| Context pages | methodology, study, consent, legal, about | [../src/app/[locale]](../src/app/[locale]) |
| Analysis entry | user fills weekly work and sleep schedule | [../src/components/AnalyzeClient.tsx](../src/components/AnalyzeClient.tsx) |
| Score computation | local scoring runs in browser-side app logic | [../src/core/scoring.ts](../src/core/scoring.ts) |
| Explainability | score and factor explanations are rendered | [../src/components/analyze/explainability](../src/components/analyze/explainability) |
| Contribution | optional consented payload can be exported or sent | [../src/lib/export.ts](../src/lib/export.ts), [../src/lib/collector.ts](../src/lib/collector.ts) |

## 🗺️ Code Map

## 🛣️ App Routes

| Path area | Purpose |
| --- | --- |
| [../src/app/page.tsx](../src/app/page.tsx) | initial locale redirect |
| [../src/app/[locale]/page.tsx](../src/app/[locale]/page.tsx) | locale home page |
| [../src/app/[locale]/analyze/page.tsx](../src/app/[locale]/analyze/page.tsx) | main analysis experience |
| [../src/app/[locale]/method/page.tsx](../src/app/[locale]/method/page.tsx) | methodology page |
| [../src/app/[locale]/study/page.tsx](../src/app/[locale]/study/page.tsx) | study framing page |
| [../src/app/[locale]/consent/page.tsx](../src/app/[locale]/consent/page.tsx) | participant information and consent |
| [../src/app/[locale]/about/page.tsx](../src/app/[locale]/about/page.tsx) | project context |

## 🧩 Analysis UI

| Folder | Purpose |
| --- | --- |
| [../src/components/analyze](../src/components/analyze) | step-by-step analysis interface |
| [../src/components/analyze/calendar](../src/components/analyze/calendar) | schedule entry helpers and weekly calendar UI |
| [../src/components/analyze/explainability](../src/components/analyze/explainability) | factor map and explanation surfaces |
| [../src/components/analyze/contribution](../src/components/analyze/contribution) | optional contribution sharing and messaging |

## 🧮 Core Scoring

| File | Purpose |
| --- | --- |
| [../src/core/model.ts](../src/core/model.ts) | typed data structures for schedule input and scores |
| [../src/core/scoring.ts](../src/core/scoring.ts) | current proxy scoring implementation |

## 🌍 Localization

Shiftwell is intentionally multilingual.

| Locale | Current status |
| --- | --- |
| `fr` | implemented |
| `en` | implemented |
| `de` | implemented |

Main localization file:

- [../src/i18n.ts](../src/i18n.ts)

This is a strong beginner-friendly contribution area because many useful changes do not require touching the scoring engine.

## 📚 Documentation and Research Sources

| File | Role |
| --- | --- |
| [formula.md](formula.md) | current app formula reference |
| [xlsm-vs-formula.md](xlsm-vs-formula.md) | workbook vs Markdown diff matrix |
| [external-link.md](external-link.md) | source and reference inventory |
| [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm) | workbook matrix |
| [other_sources](other_sources) | PDFs and text extractions |

## 🛠️ Where To Change What

| If you want to... | Start here |
| --- | --- |
| improve the landing pages | [../src/app/[locale]](../src/app/[locale]) |
| improve the weekly form | [../src/components/analyze](../src/components/analyze) |
| improve the schedule editor logic | [../src/components/analyze/calendar](../src/components/analyze/calendar) |
| improve translations | [../src/i18n.ts](../src/i18n.ts) |
| improve formula explanations | [formula.md](formula.md), [../src/components/analyze/explainability](../src/components/analyze/explainability) |
| align code with workbook logic | [xlsm-vs-formula.md](xlsm-vs-formula.md), [../src/core/scoring.ts](../src/core/scoring.ts) |
| improve source traceability | [external-link.md](external-link.md) |

## ⚖️ Current Architectural Tension

The biggest architectural tension today is between:

| Concern | Current state |
| --- | --- |
| workbook scoring matrix | rich source reference in `docs/` |
| production code | proxy implementation in `src/core/scoring.ts` |
| explainability | partially product-oriented, not yet fully source-cited |
| schedule entry UX | functional MVP, but still open to redesign for better employment schedule entry |

That means future work will likely happen in this order:

1. improve factor explainability and citations
2. simplify or strengthen schedule entry UX
3. realign scoring formulas with workbook and source material
4. update docs and UI language together

## 🌱 Good First Contributions

| Skill level | Good tasks |
| --- | --- |
| beginner | improve wording, tables, docs, translations |
| intermediate | improve form UX, validation, or explainability components |
| advanced | refactor scoring logic and align it with workbook definitions |
