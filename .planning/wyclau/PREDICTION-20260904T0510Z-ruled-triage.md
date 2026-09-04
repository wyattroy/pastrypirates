# PREDICTION — triage the ## RULED table (move 3 for its 8 waiting rows)

Watch 2026-09-04T05:0xZ, `claude/cloud-handoff-planning-a9ay1u`.

## What happened just before this (rule: widen the time horizon)

`node scripts/qa/rulings_triage_check.mjs` FAILS right now, before I touch anything: the
`t220-shallow-green` row in `## RULED` has no `- [ ] Your ruling: …` checklist row, so it is on
no surface Wyatt can see. That row was created by whoever wrote his ruling quote for the
sea-trial-depth work, and the checklist-row step (move 2) was skipped for it — the exact fault
`rulings_triage_check.mjs` exists to catch. The prior watch (04:28–05:0x) closed the WORK item
that answers this exact ruling (`T-220`, the exit-code fix, CEO 201, commit `0fb2654c`) but never
touched the RULED-table lifecycle, because closing a work item and triaging a ruling are two
different mechanisms in this project.

## What I expect

All 8 rows in `## RULED` (empty `now` cell) can go straight to move 3 — **SETTLED, no further
watch work owed** — because I have independently verified each one, not taken the row's own
"Untriaged" label as evidence:

| qid | verdict | how verified |
|---|---|---|
| `t206-cookie-choice` | cookieless install is live in the tree | read `src/analytics.js`; ran `analytics_consent_check.mjs` — full PASS, all 8 clauses |
| `t206-which-pages` | 3 pages (index.html, about.html, rules.html), no others | same file + same gate — "all three pages he chose load the one analytics module" |
| `t220-shallow-green` | exit-code fix just landed this watch cycle | `close_item.mjs` output + CEO 201, commit `0fb2654c`, `npm test` 137/137 |
| `t102-search-console` | he did it himself ("Submitted successfully") | his own words are the whole verdict; nothing for code to do |
| `t102-sitemap-coverage` | sitemap page list is generated, not hand-typed | ran `sitemap_list_derived_check.mjs` — PASS |
| `t012-battle-card-clip` (T-207) | his answer is "Leave it." | no code implied by "leave it" |
| `t102-working-files-indexable` | robots.txt fences the 4 non-HTML folders | ran `crawl_intent_check.mjs` — PASS |
| `t121-drag-scope` | his answer is "note recorded on the Glass" | acknowledgment only, no ask for a fix |

**Predicted result:** moving all 8 to `## SETTLED RULINGS` in `CHART-LOG.md` and deleting their
7 checklist rows (t220-shallow-green has none to delete) turns
`rulings_triage_check.mjs` FAIL → PASS, and `npm test`'s other gates (chartkeeper_check,
chart_sweep_conserves_check, answered_question_retired_check) stay green — this is a same-shape
edit to the same two files those gates already exercise correctly for other rows.

## What would prove me wrong

- `rulings_triage_check.mjs` still fails after the edit (wrong row deleted, or the checklist-row
  regex it uses doesn't match how I built the new SETTLED rows).
- `npm test` regresses elsewhere because of a CHART.md/CHART-LOG.md edit I didn't anticipate
  touches (a row-counting gate, a stale-candidate scanner, chartkeeper's own re-render).
- One of the 8 "done" verdicts turns out wrong on a second look — e.g. if `t102-search-console`
  or `t121-drag-scope` actually asked for something beyond acknowledgment that I misread.
