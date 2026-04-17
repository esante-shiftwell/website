# 🔗 External References

## 🎯 Purpose

This file inventories the external and local sources that help explain the Shiftwell MVP, its scoring model, and a few interface inspirations.

## 🧪 Scientific and Source Inventory

| Source | Type | Role in the repository |
| --- | --- | --- |
| [Frontiers in Public Health article currently linked in the app](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full) | public article | public-facing scientific context |
| [Fatigue Index_scoring_system_15.xlsm](Fatigue%20Index_scoring_system_15.xlsm) | local workbook | strongest structured source for the burden matrix |
| [other_sources/SleepSync-1.pdf](other_sources/SleepSync-1.pdf) | local PDF | supporting scientific source |
| [other_sources/SleepSync-1.txt](other_sources/SleepSync-1.txt) | extracted text | searchable version of `SleepSync-1.pdf` |
| [other_sources/Song2025_korean sleep intervention real time advice-1.pdf](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.pdf) | local PDF | supporting scientific source |
| [other_sources/Song2025_korean sleep intervention real time advice-1.txt](other_sources/Song2025_korean%20sleep%20intervention%20real%20time%20advice-1.txt) | extracted text | searchable version of the PDF |

## 🧠 Evidence Use Guidance

| Source | Best use today | Caution |
| --- | --- | --- |
| workbook | burden-factor structure, thresholds, factor names | runtime code is not fully aligned yet |
| Frontiers article | public scientific framing | not yet mapped line-by-line to every runtime formula |
| local PDFs | future citation and deeper explainability work | still need fine-grained page/section mapping |

## 🧾 Factor-to-Source Orientation

| Factor area | Best current source |
| --- | --- |
| weekly work burden | workbook |
| long shifts | workbook |
| quick returns / short breaks | workbook |
| rest days | workbook |
| night-duty burden | workbook |
| biological sleep opportunity | workbook + app proxy logic |
| social time loss | workbook + app proxy logic |
| sleep regularity | app code first, then PDF/article mapping later |
| adaptability composite | app code first |

## 🖥️ Product and UX Inspiration

These links are not authoritative scientific references. They are product inspiration only.

| Link | Why it matters |
| --- | --- |
| [Chronotype self-test example](https://chronotype-self-test.info/index.php/514565) | inspiration for questionnaire framing |
| [Scheduler UI example](https://javascript.daypilot.org/demo/scheduler/) | inspiration for schedule-entry interaction design |

## 🛠️ Open-Source Maintenance Guidance

| Rule | Why |
| --- | --- |
| keep this file concise | easier to audit |
| add a reason for every source | helps non-expert contributors understand relevance |
| separate evidence from inspiration | avoids scientific ambiguity |
| prefer local copies for important source material | makes the repo self-contained |
| move brainstorming links elsewhere | keeps public docs trustworthy |
