# 🔗 External References

## 🎯 Purpose

This file inventories third-party external references, local working copies, and product inspiration links used around the Shiftwell MVP.

It should not be read as a claim that Shiftwell authored, owns, or controls those third-party materials.

## 🧾 Attribution And Provenance

| Rule | Meaning |
| --- | --- |
| external reference material stays external | a cited article, workbook, or PDF remains a third-party work |
| local storage does not imply authorship | copying a file into the repo does not make it Shiftwell documentation |
| extracted text is a review artifact | `.txt` files generated from PDFs are repository artifacts, not original publications |
| Shiftwell docs describe usage, not ownership | repository docs should explain how a source is used, not imply possession of its authorship |

## 🧪 Scientific And Reference Inventory

| Source | Type | Provenance note | Role in the repository |
| --- | --- | --- | --- |
| [Frontiers in Public Health article currently linked in the app](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full) | public article | third-party public article | public-facing scientific context |
| [Fatigue Index_scoring_system_15.xlsm](C:/workspace/shiftwell/docs/Fatigue%20Index_scoring_system_15.xlsm) | local workbook copy | local working copy of an external scoring reference | strongest structured reference for the burden matrix |
| [SleepSync-1.pdf](C:/workspace/shiftwell/docs/other_sources/SleepSync-1.pdf) | local PDF copy | locally stored third-party reference material | supporting scientific context |
| [SleepSync-1.txt](C:/workspace/shiftwell/docs/other_sources/SleepSync-1.txt) | extracted text | repository-generated extraction from a third-party source | searchable review artifact |
| [Song2025_korean sleep intervention real time advice-1.pdf](</C:/workspace/shiftwell/docs/other_sources/Song2025_korean sleep intervention real time advice-1.pdf>) | local PDF copy | locally stored third-party reference material | supporting scientific context |
| [Song2025_korean sleep intervention real time advice-1.txt](</C:/workspace/shiftwell/docs/other_sources/Song2025_korean sleep intervention real time advice-1.txt>) | extracted text | repository-generated extraction from a third-party source | searchable review artifact |

## 🧠 Evidence Use Guidance

| Source | Best use today | Caution |
| --- | --- | --- |
| workbook working copy | burden-factor structure, thresholds, factor names | runtime code is not fully aligned yet |
| Frontiers article | public scientific framing | not yet mapped line-by-line to every runtime formula |
| `Song2025` local PDF copy | physiology and individualized sleep-scheduling framing | supports concepts, not workbook factor thresholds |
| `SleepSync` local PDF copy | weak contextual backup only | current extraction is too coarse for factor-level citation |

## 🧭 Source Dictionary Link

For stable source ids and runtime mapping, use:

- [docs/source-dictionary.md](C:/workspace/shiftwell/docs/source-dictionary.md)

This keeps the repository public-friendly:

- `external-link.md` stays as a readable provenance-aware inventory
- `source-dictionary.md` becomes the traceable citation map

## 🧾 Factor-To-Source Orientation

| Factor area | Best current source |
| --- | --- |
| weekly work burden | workbook working copy |
| long shifts | workbook working copy |
| quick returns / short breaks | workbook working copy |
| rest days | workbook working copy |
| night-duty burden | workbook working copy |
| biological sleep opportunity | workbook working copy + app proxy logic + `Song2025` for physiology framing |
| social time loss | workbook working copy + app proxy logic |
| sleep regularity | app code first, then external-source mapping later |
| adaptability composite | app code first |

## 🖥 Product And UX Inspiration

These links are not authoritative scientific references. They are product inspiration only.

| Link | Why it matters |
| --- | --- |
| [Chronotype self-test example](https://chronotype-self-test.info/index.php/514565) | inspiration for questionnaire framing |
| [Scheduler UI example](https://javascript.daypilot.org/demo/scheduler/) | inspiration for schedule-entry interaction design |

## 🛠 Open-Source Maintenance Guidance

| Rule | Why |
| --- | --- |
| keep this file concise | easier to audit |
| add a provenance note for every external source | helps avoid accidental appropriation language |
| separate evidence from inspiration | avoids scientific ambiguity |
| separate storage from ownership | a local file path is not an authorship claim |
| move brainstorming links elsewhere | keeps public docs trustworthy |
