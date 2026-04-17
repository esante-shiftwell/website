# 🔬 Explainability Guide

## 🎯 Purpose

This document explains how Shiftwell should describe factors, formulas, and evidence in a medically careful way.

It is meant to help:

- contributors writing UI copy
- contributors improving formula documentation
- research collaborators reviewing the current MVP

## 🧾 Provenance Reminder

This file is Shiftwell-authored guidance.

When it mentions:

- a workbook
- an article
- a PDF
- extracted text

it is describing how Shiftwell should refer to those materials, not claiming authorship or ownership of them.

## 🧭 Reading Rule

| Statement type | How to present it |
| --- | --- |
| workbook-defined factor | as a source-backed burden factor |
| current runtime formula | as "currently implemented" |
| heuristic product composite | as proxy logic |
| uncertain research alignment | as provisional or pending validation |

## 📋 Factor Explainability Matrix

| Factor | What it means in plain language | Current implementation | Evidence currently available | Safe wording |
| --- | --- | --- | --- | --- |
| Weekly work hours | total work exposure across the week | implemented | workbook + app code | "weekly work-hour burden factor" |
| Long shifts | number of unusually long work periods | implemented, threshold mismatch | workbook + app code | "long-shift proxy, threshold alignment in progress" |
| 24h breaks | count of substantial recovery breaks | not yet represented directly in app score | workbook | "workbook factor not yet mirrored exactly in runtime code" |
| Quick returns `<11h` | short recovery between shifts | implemented as `shortBreaksCount` proxy | workbook + app code | "quick-return proxy" |
| Rest days | days without work | workbook concept differs from app sleep-based proxy | workbook + app code | "definition currently differs between workbook and runtime code" |
| Night duties | work during biologically disruptive times | implemented as biological-window overlap proxy | workbook + app code | "night-work proxy" |
| Optimal sleep hours lost | work intruding into biologically favorable sleep opportunity | approximated with biological overlap window | workbook + app code + external sleep references | "biological sleep-opportunity proxy" |
| Social hours lost | work intruding into socially typical time | implemented as social-window overlap proxy | workbook + app code | "social-time loss proxy" |
| Sleep regularity | consistency of sleep timing and duration | proxy, not exact SRI | app code + external-source mapping still pending | "sleep regularity proxy" |
| Adaptability | overall compatibility between work constraints and sleep profile | heuristic composite | app code | "product-level composite proxy" |

## 🧠 UI Explainability Style

| Do | Avoid |
| --- | --- |
| say "proxy" when the implementation is not fully aligned | implying the factor is clinically validated in the current MVP |
| separate "what this factor represents" from "how it is computed today" | merging conceptual meaning and exact runtime logic into one vague sentence |
| cite workbook/article/PDF when possible | generic "science says" wording |
| keep language accessible to non-experts | overly technical unexplained jargon |
| use provenance-aware wording | wording that implies Shiftwell owns third-party references |

## 🏥 Medical Tone Guidelines

| Preferred | Avoid |
| --- | --- |
| "research-oriented" | "medical score" |
| "indicator" or "proxy" | "diagnosis" |
| "burden factor" | "pathology detector" |
| "sleep opportunity" | "your body definitely needs" |
| "not medical advice" | wording that sounds prescriptive or clinical |

## 🗂 Evidence Inventory

| Evidence source | Type | Provenance note | Current usefulness |
| --- | --- | --- | --- |
| [Fatigue Index_scoring_system_15.xlsm](C:/workspace/shiftwell/docs/Fatigue%20Index_scoring_system_15.xlsm) | workbook | local working copy of an external workbook | strongest structured reference for the burden matrix |
| [SleepSync-1.pdf](C:/workspace/shiftwell/docs/other_sources/SleepSync-1.pdf) | PDF | locally stored third-party reference material | source material still needing fine-grained citation mapping |
| [SleepSync-1.txt](C:/workspace/shiftwell/docs/other_sources/SleepSync-1.txt) | extracted text | repository-generated extraction from a third-party source | searchable text support |
| [Song2025_korean sleep intervention real time advice-1.pdf](</C:/workspace/shiftwell/docs/other_sources/Song2025_korean sleep intervention real time advice-1.pdf>) | PDF | locally stored third-party reference material | supporting material, likely more useful for sleep-intervention context than burden matrix |
| [Song2025_korean sleep intervention real time advice-1.txt](</C:/workspace/shiftwell/docs/other_sources/Song2025_korean sleep intervention real time advice-1.txt>) | extracted text | repository-generated extraction from a third-party source | searchable text support |
| [Frontiers article currently linked in the app](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full) | public article | third-party public article | public-facing scientific context |

## 🧭 Source Dictionary

The canonical evidence registry now lives in:

- [docs/source-dictionary.md](C:/workspace/shiftwell/docs/source-dictionary.md)
- [src/core/evidence.ts](C:/workspace/shiftwell/src/core/evidence.ts)

The rule is simple:

| Need | Expected source of truth |
| --- | --- |
| runtime evidence ids | `src/core/evidence.ts` |
| contributor-facing citation table | `docs/source-dictionary.md` |
| factor-level explainability | `ScoreTrace.evidenceRefs` |

## 🛠 Next Documentation Upgrade

The next strong upgrade would be a source-cited table like this:

| Factor | Current formula | Workbook sheet/cells | External-source citation | UI wording |
| --- | --- | --- | --- | --- |
| example | documented formula | exact workbook location | page or section | end-user phrasing |

That would make the repo both:

- more medically credible
- more open-source friendly for contributors who need traceable evidence
