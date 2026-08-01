---
phase: 22-the-front-door
plan: 05
subsystem: ui
tags: [about-page, copy, register, static-html, seo]

requires:
  - phase: 22-the-front-door (plan 01)
    provides: name modal (prompt, label, placeholder, confirm button)
  - phase: 22-the-front-door (plan 02)
    provides: about.html draft copy (title, hero blurb, rules, credits, Ko-Fi)
  - phase: 22-the-front-door (plan 03)
    provides: welcome-screen and footer About links
  - phase: 22-the-front-door (plan 04)
    provides: the shipped hero screenshot the copy sign-off reviews alongside

provides:
  - "Every player-visible string Phase 22 ships is recorded against .planning/todos/pending/copy-shipped-vs-approved-gate.md with a Phase 22 approvals section"
  - "Both TODO(D-09) markers removed from about.html and index.html"
  - "About page restructured per Wyatt's nine-item playtesting review: primary Play CTA, interspersed screenshots, example recipes, testimonials, parley->trade rename, rules-note paragraph removed"
  - "'Parley' renamed to 'Trade' across every player-visible rules surface (in-game How-To-Play modal, RULES.md, Rules_boardgame.md, .planning/how-to-play-pastry-pirates.md prose) while engine cfg.parley and the narration event-type key t:'parley' are left untouched"
affects: [front-door, about-page, rules-docs]

tech-stack:
  added: []
  patterns:
    - "About-page rule rows: an in-game screenshot paired with its explanation via a flex row (.abtRuleRow), reversing on alternate rows, stacking to a single column at 480px"
    - "Primary/secondary CTA pairing on a static page: accent-orange filled button for the primary action, teal-outline button for the secondary — reassigns UI-SPEC's earlier single-CTA accent-color rule to the new top-of-page Play link"

key-files:
  created: []
  modified:
    - about.html
    - index.html
    - RULES.md
    - Rules_boardgame.md
    - .planning/how-to-play-pastry-pirates.md
    - .planning/todos/pending/copy-shipped-vs-approved-gate.md

key-decisions:
  - "Wyatt's inline playtesting feedback (nine items) stood in for the Task-1 review-sheet + Task-2 checkpoint:decision flow — his message already constituted a completed review of every shipped string, so both plan gates (D-09 and D-11) were resolved by direct instruction rather than a live checkpoint round-trip."
  - "UI-SPEC's accent-orange assignment ('reserved for the modal confirm button, and on about.html the Ko-Fi button only if styled as the page's one primary CTA') is superseded: the new top-of-page 'Play Pastry Pirates' link is now the primary CTA and carries the accent orange; Ko-Fi is restyled as a teal-outline secondary action. Recorded here since it changes an approved UI-SPEC rule rather than merely extending it."
  - "The .abtRulesNote paragraph and its CSS rule were deleted outright per Wyatt's explicit instruction, even though it existed to satisfy D-08's 'the About page points readers at the in-game How to play screen for the full rules' framing — the paragraph's job is now implicitly carried by the page simply being the shorter version; no replacement sentence was added since none was requested."

requirements-completed: [ABOUT-01]

coverage:
  - id: D1
    description: "Both TODO(D-09) draft-copy markers removed from about.html and index.html; the copy is Wyatt-reviewed"
    requirement: ABOUT-01
    verification:
      - kind: other
        ref: "grep -rn 'TODO(D-09)' about.html index.html returns no lines"
        status: pass
    human_judgment: false
  - id: D2
    description: "Phase 22 approvals section appended to .planning/todos/pending/copy-shipped-vs-approved-gate.md, one row per shipped string, quoted from a fresh post-edit read of source"
    requirement: ABOUT-01
    verification:
      - kind: other
        ref: "grep -c 'Phase 22' .planning/todos/pending/copy-shipped-vs-approved-gate.md == 3"
        status: pass
    human_judgment: false
  - id: D3
    description: "'Parley' renamed to 'Trade' in every player-visible rules surface; engine cfg.parley and narration event key t:'parley' untouched"
    requirement: ABOUT-01
    verification:
      - kind: other
        ref: "grep -rin 'parley' about.html index.html RULES.md Rules_boardgame.md returns nothing; git diff --stat src/engine/index.js is empty"
        status: pass
    human_judgment: false
  - id: D4
    description: "All nine of Wyatt's playtesting feedback items implemented on the About page (primary CTA, hero swap, interspersed images, trade rename, example recipes, rules-note removal, testimonials, TODO removal, copy-gate record)"
    requirement: ABOUT-01
    verification: []
    human_judgment: true
    rationale: "Whether the restructured page reads well, the interspersed images land at the right spots, and the testimonials land as the intended light-touch in-joke are visual/editorial judgments only Wyatt can make. No browser-automation tool was available this session to even screenshot it — see Issues Encountered."
  - id: D5
    description: "index.html's <style> block stays byte-identical to HEAD (Phase 18 concurrent-edit boundary honored); named script gates (no_undef_check, module_graph_check, ui_contract_check, state_contract_check, determinism_baseline --verify) all exit 0"
    requirement: ABOUT-01
    verification:
      - kind: other
        ref: "awk '/^<style>/,/^<\\/style>/' index.html | wc -l matches git show HEAD:index.html equivalent (764 == 764); node scripts/{no_undef_check,module_graph_check,ui_contract_check,state_contract_check,determinism_baseline --verify}.js all exit 0"
        status: pass
    human_judgment: false

duration: ~90min
completed: 2026-08-01
status: complete
---

# Phase 22 Plan 05: About-page copy sign-off and Wyatt's playtesting pass Summary

**Applied Wyatt's full nine-item About-page playtesting review (primary Play CTA, interspersed screenshots, example recipes, testimonials, parley->trade rename, rules-note removal) and recorded every shipped player-visible string against the copy approval gate, closing D-09.**

## Performance

- **Duration:** ~90 min (combined session also covering 22-04 Task 3)
- **Started:** 2026-08-01 (session start)
- **Completed:** 2026-08-01
- **Tasks:** Wyatt's review sheet (normally Task 1) and sign-off (normally Task 2) were superseded by his direct inline feedback in this session's prompt — treated as the completed review-and-decide step. Task 3 (apply edits, clear markers, record approvals) executed as planned.
- **Files modified:** 6

## Accomplishments
- **Primary CTA added.** "⚓ Play Pastry Pirates" link now sits above the hero as the page's obvious first action, styled with the accent orange the UI-SPEC reserves for primary CTAs; the Ko-Fi button is restyled as a teal-outline secondary action, and its CSS comment no longer claims to be the page's single primary CTA.
- **Hero swapped** to `assets/about-screenshot.jpg` (see 22-04-SUMMARY.md for the image-install detail); `TODO(D-11)` removed.
- **Rules interspersed with screenshots.** `assets/about-cocoa-island.jpg` sits beside "The goal" (ingredients/islands); `assets/about-flippenator.jpg` sits beside "Your turn" (the coin-flip/turn-clock mechanic) — both via a new `.abtRuleRow` flex pattern that reverses on alternating rows and stacks to one column at 480px.
- **"Parley" renamed to "Trade"** in the About rules paragraph, the in-game How-To-Play modal (`index.html:938`), `RULES.md`, and `Rules_boardgame.md` (4 occurrences), plus the prose passages in `.planning/how-to-play-pastry-pirates.md` — the engine's `cfg.parley` config flag and the narration event-type key `t:"parley"` are unchanged by design.
- **Example recipes section added** using `assets/about-recipes.jpg`, introduced with one line of copy so the image isn't bare.
- **The `.abtRulesNote` paragraph deleted** (and its now-unused CSS rule removed) per Wyatt's explicit request.
- **Testimonials section added**, quoting the four default bot captains verbatim as Wyatt supplied them, presented plainly (no explanation of the in-joke).
- **Both `TODO(D-09)` markers removed** from `about.html`.
- **Copy recorded against the gate**: a dated `## Phase 22 approvals` section appended to `.planning/todos/pending/copy-shipped-vs-approved-gate.md`, one row per shipped string (About page, name modal, welcome/footer About links, data-collection notice, the Trade rename), each quoted from a fresh post-edit read of source per that file's own anti-drift rule.
- All five named script gates (`no_undef_check`, `module_graph_check`, `ui_contract_check`, `state_contract_check`, `determinism_baseline --verify`) pass, including the D-29 pirate-register check across the reworded "Trade" line.
- `index.html`'s `<style>` block confirmed byte-identical to HEAD (764 lines both sides) — the one `index.html` edit was a single `<p>` line inside the How-To-Play modal body, outside Phase 18's concurrent CSS-block ownership.

## Task Commits

1. **About page: images, copy, and structure** — `b2395ec` (`feat(22-04,22-05): ship the About page with Wyatt's reviewed images and copy`)
2. **In-game How-To-Play modal rename** — `f7972ff` (`fix(22-05): rename Parley to Trade in the in-game How-To-Play modal`)
3. **Rules-document rename** — `1b42931` (`docs(22-05): rename Parley to Trade across rules documents`)
4. **Copy-gate approval record** — `882019b` (`docs(22-05): record Phase 22 copy against the approval gate (D-09)`)

**Plan metadata:** committed separately after this summary lands (see the workflow's final-commit step).

## Files Created/Modified
- `about.html` - primary CTA, hero swap, interspersed rule-row images, example recipes section, testimonials section, rules-note paragraph removed, both TODO(D-09)/TODO(D-11) markers removed, Ko-Fi restyled/re-commented
- `index.html` - one line in the How-To-Play modal: "Parley" -> "Trade" (no CSS-block changes)
- `RULES.md` - "Parley" -> "Trade" (1 occurrence)
- `Rules_boardgame.md` - "Parley" -> "Trade" (4 occurrences, including a heading and one instance reworded to avoid "Trade (buy or trade for it)" repetition)
- `.planning/how-to-play-pastry-pirates.md` - "Parley" -> "Trade" in 3 prose occurrences; the `cfg.parley` code quotation at lines 157-158 deliberately left untouched (it quotes engine source verbatim)
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` - new `## Phase 22 approvals` section, dated 2026-08-01, one row per shipped string

## Decisions Made
- Wyatt's inline playtesting feedback stood in for the plan's Task-1 review-sheet + Task-2 checkpoint round-trip — his message already constituted a completed, itemized review of every shipped string (including exact replacement text for the testimonials and explicit instructions for structural additions), so both D-09 and D-11 were resolved by direct instruction in this session rather than a live blocking checkpoint.
- UI-SPEC's accent-orange assignment is reassigned from the Ko-Fi button to the new top-of-page Play CTA, per Wyatt's explicit instruction that the play link "is the page's primary action" and Ko-Fi is not. This supersedes rather than extends the approved UI-SPEC Color section — recorded as a deviation below.
- The `.abtRulesNote` paragraph was deleted outright with no replacement sentence, even though it was the About page's explicit pointer at the in-game How-To-Play screen for full rules (a D-08 must-have). No replacement text was requested, so none was added — flagged as a deviation below since it touches a must-have from 22-05's own frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 4 - already resolved by direct human instruction] UI-SPEC's accent-orange CTA assignment reassigned to a new top-of-page Play link**
- **Found during:** implementing feedback item 1 (top CTA)
- **Issue:** `22-UI-SPEC.md`'s Color section reserves accent orange for "the modal's confirm button, and on about.html, the Ko-Fi button only if it is styled as the page's one primary CTA" — an approved, checker-passed design contract. Wyatt's feedback item 1 explicitly asks for a new "Play Pastry Pirates" link as the page's primary action, styled with that same accent orange, with Ko-Fi demoted to secondary.
- **Resolution:** Implemented as directed — new `.abtPlayBtn` carries `var(--accent)`; `#aboutKofiBtn` restyled to a teal-outline secondary button; its CSS comment rewritten to state the change and the reason. This is a direct instruction from Wyatt (the same person who approved the original UI-SPEC), so it supersedes rather than violates that contract — no separate checkpoint was needed since the instruction was unambiguous and already given.
- **Files modified:** `about.html`
- **Verification:** Visual review pending — no browser-automation tool available this session (see Issues Encountered). Structurally verified: exactly one element (`.abtPlayBtn`) uses `var(--accent)` as a background/border color on the page; `#aboutKofiBtn` no longer does.
- **Committed in:** `b2395ec`

**2. [Rule 4 - already resolved by direct human instruction] The About-page rules-note paragraph deleted with no replacement**
- **Found during:** implementing feedback item 6
- **Issue:** `22-05-PLAN.md`'s own must-haves require "the About page's rules read as a shorter introduction... they state that the in-game How to play screen carries the full rules" (D-08). The deleted `.abtRulesNote` paragraph was the explicit sentence carrying that statement.
- **Resolution:** Wyatt asked for the paragraph "gone entirely" with no caveat about replacing its function, so it was deleted outright per his instruction — Rule 4 would normally require asking before removing something that satisfies a stated must-have, but the instruction to remove it was already explicit and unambiguous in this session's prompt. Flagging here so a later audit does not mistake the gap for an oversight: the About page no longer states in its own text that the in-game How-To-Play screen carries the full rules.
- **Files modified:** `about.html`
- **Verification:** `grep -c 'abtRulesNote' about.html` returns 0 (both the HTML element and its CSS rule are gone).
- **Committed in:** `b2395ec`

---

**Total deviations:** 2, both direct human instructions rather than autonomous fixes — recorded because each touches an approved design contract (UI-SPEC's color assignment) or a plan must-have (D-08's rules-note framing), not because either was a defect.
**Impact on plan:** Both are deliberate, Wyatt-directed changes. No scope creep beyond what his review explicitly requested.

## Issues Encountered
- **No browser-automation tool was available this session.** The plan's `<human-check>` verification steps for both 22-04 Task 3 and 22-05 Task 3 ("reload the About page... confirm the chosen frame renders... confirm the final approved wording appears...") could not be run. Logged to `.planning/WINDOWS.md` as an `unrun-verify` entry per this plan's `<browser_verification_rules>` — the coordinator has Chrome tools and will run the visual pass.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both Phase 22 human gates (D-09 copy sign-off, D-11 screenshot pick) are now resolved.
- Outstanding: the coordinator's browser-driven visual pass over `about.html` (both the new sections and responsive behavior at 320-480px) and the name modal, since no browser-automation tool was available in this session.
- Phase 22 is otherwise feature-complete: FIX-01, ABOUT-01, ABOUT-02, META-01 (its non-Google-recrawl half) all have shipped work.

---
*Phase: 22-the-front-door*
*Completed: 2026-08-01*

## Self-Check: PASSED

All created/modified files verified to exist; commits `b2395ec`, `f7972ff`, `1b42931`, `882019b` all verified present in git log.
