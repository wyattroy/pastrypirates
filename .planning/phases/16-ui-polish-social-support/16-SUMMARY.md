---
phase: 16-ui-polish-social-support
plan: (none — see below)
status: complete
completed: 2026-07-31
requirements: [UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, META-01, META-02, KOFI-01]
subsystem: ui
---

# Phase 16 — UI/UX Polish, Social Preview & Support

## Why there is no PLAN.md

**This phase was built directly, not through discuss → plan → execute.** Wyatt asked for the
remaining milestone work to be done overnight while he slept, and it was carried out as a single
continuous session against the roadmap's success criteria rather than a written plan.

Recording that plainly because the absence of a plan is otherwise indistinguishable from a phase
that was skipped, and because the archive should not imply a process that was not followed. The
evidence below is the commit trail and live browser verification, not a task checklist.

## What shipped

| Req | Delivered | Evidence |
|---|---|---|
| **UI-01** | One 14px rhythm. `#actionPanel`'s `margin: 8px` was being *added* to `#layout`'s `gap: 14px`, so the narration box alone sat 22px from its neighbours; `#footerRow` is a grid *sibling*, so its 4px top stacked on the grid's 14px bottom padding. | measured: gap 14, padding 14, margin `0 auto`, footer `0 14px 18px` |
| **UI-02** | Icon pop rewritten twice. First a 1s full-opacity hold; then, on Wyatt's note that it looked "sluggish" and paused mid-flight, rebuilt as a burst — scale 0 → 1.5 in ~140ms, damped bounce, ~620ms hold, anticipation lift, ease-in into the hull. | keyframes read from the live running animation |
| **UI-03** | Sail highlight 10% smaller, applied in G25's **shared** builder so host and guest cannot diverge. | cell 42.67 → side 38.67 → **34.8** |
| **UI-04** | Hover gains a white outline + two-stage glow. A transform is not available: `animation-play-state: paused` freezes the bounce keyframe and it wins. | screenshotted |
| **UI-05** | "Host a Crew" creates the room outright. Also removed a **1002ms dead interval** — measured — where the click blocked for 2ms and the room screen did not appear for a full second. Plus a back link, moved into the Captains card after Wyatt found it "almost impossible to see". | room created, lobby rendered, `#stepHost` never shown |
| **UI-06** | Already landed via F1/F2 before this phase. | seat list read `ClaudeHost — you`, no doubling |
| **UI-07** | Narration box collapses at end of voyage. **The first implementation was inert** — `showStats()` hid the box and the next `flash()` re-showed it. Fixed by moving the win into the gold banner and playing a drumroll in the blue box instead. | watched in a real finished game, host **and** guest |
| **META-01** | Revised mid-milestone from "Open Graph preview" to "Google shows a large preview image" — `robots` meta with `max-image-preview:large` plus a JSON-LD `image` field. | live: 2 occurrences on playpastrypirates.com |
| **META-02** | Already satisfied; no code change. | favicon serving 200, confirmed in a live Google result |
| **KOFI-01** | Footer button + Credits twin, both opening Ko-Fi's donation panel **inside a modal**. | panel renders in-page, both doors share one iframe |

## Deviations from the requirement text, stated explicitly

**KOFI-01 says "using the provided Ko-Fi embed".** The embed Wyatt first supplied was the
floating-chat overlay, which draws its **own** permanent button inside a **cross-origin** iframe —
verified in a browser, `contentDocument` throws. Nothing on our page can trigger it, so "our button
opens their widget" was not achievable that way. His actual requirement was *"i don't want this
button to open up the kofi website; ideally, i want it to open up the kofi widget"*, and that is
what shipped: Ko-Fi's own panel, in one of our modals, loaded on first open and sandboxed without
top-navigation.

**META-03 is NOT delivered and is not code** — verifying the site in Google Search Console is
Wyatt's own action. It remains open against v1.3.

## Beyond the roadmap

Three defects were found and fixed while verifying, none of them on the punch list:

- **A guest-path crash.** Moving `recipeInfo()` into `showStats()` put it on the guest render path,
  where a guest without drafted recipes threw and lost the *entire* End of Voyage screen.
- **Text clipped at both ends.** The Best Baker sentence overflowed the gold banner.
- **`boot()` returned before `fbInit()`** on a solo resume, leaving Host/Join enabled with no
  database handle — and the resulting alert blamed the server for a local condition. Fixed, with
  Wyatt's own new copy for the honest case.

Also delivered: `docs/DRIVING-THE-GAME.md`, and the copy/taste review log
(`.planning/COPY-AND-TASTE-REVIEW.md`) itemising every taste call and the one invented string.

## Gates

`npm test` green throughout. The suite grew 17 → 19 gate scripts across the milestone.
`scripts/economy_guard_test.js` is new; `ui_contract_check` gained assertions 9, 10 and 11;
`host_guest_parity_check` assertion 2 was extended to cover sail-highlight **geometry**, not just the
shared builder. Every new assertion was red-proofed against real pre-fix code.

`src/engine/index.js` is byte-identical to `9ddd214` throughout this phase.
