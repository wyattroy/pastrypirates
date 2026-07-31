---
phase: 15-narration-audit-fixes
plan: 05
subsystem: ui
tags: [narration, copy-review, audit-page, es-modules]

requires:
  - phase: 15-02
    provides: viewer-aware narration (D-10 neutral-plus-variants mechanism)
  - phase: 15-03
    provides: DRAFT ad-hoc line conversions (brokeSailLine, brokeAnchorLine, stormIntroClause)
  - phase: 15-04
    provides: DRAFT battle-opener/second-person conversions
provides:
  - "art-review/narration-audit.html: browser review page rendering every narration surface as a player sees it"
  - "art-review/narration-inventory.json: script-generated, self-cross-checked line inventory"
  - "15-COPY-APPROVED.md: Wyatt's 209 reviewed dispositions, verbatim, as the input contract for plan 15-06"
affects: [15-06]

tech-stack:
  added: []
  patterns:
    - "Throwaway review page imports real EVENT_NARRATION/describe/pn/poss as ES modules so the audit can never drift from shipped code (same pattern as art-review/gallery-*.html)"
    - "localStorage-plus-JSON-export capture of human review dispositions, extended over multiple sessions (D-25/D-26/D-27 iterations) until Wyatt reached 209/209 reviewed"

key-files:
  created:
    - .planning/phases/15-narration-audit-fixes/15-COPY-APPROVED.md
  modified: []

key-decisions:
  - "The 15-CONTEXT.md review addenda (D-16 through D-60) recorded 44 additional decisions discovered DURING the review pass itself — icon preservation, ye/yer pirate voice, action-prompt/button coverage, host/guest wording forks, merge-target resolution, em-dash normalisation, and more. These are binding on plan 15-06, not just this plan's checkpoint."
  - "15-COPY-APPROVED.md is generated programmatically from 15-DISPOSITIONS-FINAL.json rather than hand-transcribed, to guarantee verbatim fidelity across 209 rows — manual transcription at this volume is exactly the kind of paraphrase risk the plan's authority_rule forbids."
  - "16 rows are tagged merge with an empty mergeInto field in the export; per 15-CONTEXT.md D-36/D-44/D-49/D-52/D-60 their targets are resolved by Claude reading Wyatt's question fields and the decision record, not guessed — the resolution is recorded in 15-06-SUMMARY.md, not in this file, so 15-COPY-APPROVED.md stays a pure transcription."

requirements-completed: [NARR-01]

coverage:
  - id: D1
    description: "15-COPY-APPROVED.md exists, is committed, and transcribes all 209 reviewed rows verbatim from 15-DISPOSITIONS-FINAL.json with no paraphrase"
    verification:
      - kind: other
        ref: "node -e verified row count (209) and reviewed:true count (209) equal the JSON source; diff of generated content against JSON source fields"
        status: pass
    human_judgment: false

duration: N/A (resumed after human review gate; work was writing/committing the approved-record transcription only)
completed: 2026-07-29
status: complete
---

# Phase 15 Plan 05: Narration Audit & Approval Gate Summary

**Wyatt completed his single review pass over all 209 narration surfaces on the audit page — 209/209 reviewed, dispositions exported and transcribed verbatim into `15-COPY-APPROVED.md`, closing NARR-01's approval gate.**

## Performance

- **Duration:** N/A — this continuation only closes the checkpoint (transcribe + commit); Tasks 1-2 (extraction script, audit page) were completed and committed in prior sessions of this plan.
- **Completed:** 2026-07-29
- **Tasks:** 3/3 (Task 3, the checkpoint, closes with this SUMMARY)
- **Files modified:** 1 (`15-COPY-APPROVED.md`, new)

## Accomplishments

- Wyatt reviewed every one of 209 narration surfaces on `art-review/narration-audit.html` — the `EVENT_NARRATION` table (50 rows), ad-hoc `flash()` lines (31), action prompts (28), button labels (41), and a `misc` category covering battle blow-by-blow lines, multiplayer errors, and other categories surfaced by the D-30/D-32 scope corrections (56), plus 3 `sub` helper-text rows.
- The review pass surfaced 44 additional decisions (D-16 through D-60 in `15-CONTEXT.md`'s review addenda) that go well beyond copy: icon preservation rules, a global "you→ye / your→yer" pirate-voice conversion, missing action-prompt/button coverage, three separate host/guest wording forks, dead-copy detection (unreachable fallbacks, structural markers, config-gated branches), merge-target resolution for cards that pointed nowhere or in a cycle, em-dash normalisation, signed parenthetical amounts, and a guest-narration fade fix. All of these are binding inputs to plan 15-06, not just the copy dispositions.
- `15-COPY-APPROVED.md` transcribes all 209 rows verbatim — id, tag, reviewed state, final neutral text, addressed text, second-party addressed text, question field, and merge target as exported — generated programmatically from `15-DISPOSITIONS-FINAL.json` rather than hand-copied, so there is no paraphrase risk across 209 rows.
- 16 rows are tagged `merge` with `mergeInto` left empty in the export (Wyatt used the free-text `question` field or prose in `notes`/`addressedNotes` to describe the target instead of the page's merge-target selector on these). Per `15-CONTEXT.md` D-36/D-44/D-49/D-52/D-60, those targets are resolvable from his own words and the decision record; the resolution work itself belongs to plan 15-06 (it touches source, not this transcription), so it is deferred there rather than injected into this file.

## Task Commits

1. **Task 1: Extraction script and the generated line inventory** — completed in a prior session of this plan (`scripts/extract_narration_lines.js`, `art-review/narration-inventory.json`).
2. **Task 2: The audit page** — completed in a prior session of this plan (`art-review/narration-audit.html`), subsequently extended across the D-16–D-60 review addenda (icon fidelity, ye/yer live conversion, prompt/button coverage, flow-chart layout, per-card reviewed state) as issues were found during Wyatt's own review sessions.
3. **Task 3: Wyatt's review pass and the transcription** — `a3cf604` (docs(15-05): transcribe Wyatt's approved narration dispositions verbatim)

**Plan metadata:** this commit (docs: complete 15-05 plan)

## Files Created/Modified

- `.planning/phases/15-narration-audit-fixes/15-COPY-APPROVED.md` — Wyatt's 209 reviewed dispositions, verbatim, one section per row (id, tag, reviewed, final text, addressed text ×2, question, merge target as exported)

## Decisions Made

See key-decisions in frontmatter. The substantive decisions from this plan's review pass live in `15-CONTEXT.md`'s `<review_addendum>` and `<review_addendum_2>` blocks (D-16 through D-60) — they were captured there as they were found, across Wyatt's multiple review sessions, rather than duplicated here.

## Deviations from Plan

None for Task 3 itself — the task's job was to transcribe the approved dispositions into a committed file and it did exactly that. The much larger-than-anticipated volume of mid-review findings (D-16 through D-60) is not a deviation from this plan; it is exactly what the plan's own `<how-to-verify>` step 4 anticipated ("Use the notes field for rewrites... the pass can be done in more than one sitting") and is captured in `15-CONTEXT.md`, the canonical location for phase decisions, rather than in this plan's task history.

## Issues Encountered

None for the transcription itself. Two structural properties of the export are worth flagging for plan 15-06, not because they are defects in this plan but because they are exactly what 15-06 must read carefully:

1. **16 `merge` rows have no `mergeInto` value** — Wyatt used free text (`question`, or prose inside `notes`/`addressedNotes`) to say where a line should merge, rather than the page's dedicated selector, on these particular rows. `15-CONTEXT.md` resolves every one of them explicitly (D-19/D-36/D-44/D-49/D-52/D-60) except `misc:battleLine:src/ui/flow.js:967`, whose row carries no question and no notes — plan 15-06 must locate that line in source and either find a defensible target or stop and ask, per its own `<authority_rule>`.
2. **One row's tag is superseded by a later decision.** `misc:mpError:src/orchestrator.js:1012` is tagged `merge` in the export (with a question asking to fold it into `:945`), but `15-CONTEXT.md` D-60 records Wyatt's explicit answer — *"good catch on 1012 — keep 1012 on its own"* — which supersedes the row's own tag. Plan 15-06 must apply D-60's `keep`, not the export's `merge`, since decisions recorded after an export are later and the task brief for 15-06 states decisions win where they and a plan/record differ.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

`15-COPY-APPROVED.md` is committed and is the complete, verbatim input contract for plan 15-06. Plan 15-06 additionally needs `15-CONTEXT.md`'s full review addenda (D-16–D-60) as binding decisions that extend past pure copy — merge-target resolution, the ye/yer conversion, dead-copy handling, the three host/guest forks (one in scope for 15-06, two deferred to Phase 16), the guest-narration fade fix, and the several small behavior changes (Parley/Attack/coins-only button gating, storm-flip button real-loss display) that are presentation-tier and therefore in 15-06's scope per Wyatt's own confirmations.

---
*Phase: 15-narration-audit-fixes*
*Completed: 2026-07-29*

## Self-Check: PASSED
- FOUND: .planning/phases/15-narration-audit-fixes/15-COPY-APPROVED.md
- FOUND: a3cf604 (commit exists in git log)
