---
phase: 16-ui-polish-social-support
verified: 2026-07-31
status: passed
score: 9/10 requirements delivered — META-03 is not code and is deferred
requirements: [UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, META-01, META-02, KOFI-01]
---

# Phase 16 — Verification

Every criterion below was checked **in a running browser against the live rendered element**, not
inferred from source. Where a number appears, it was measured.

## Success criteria, from the roadmap

| # | Criterion | Result |
|---|---|---|
| 1 | Padding consistent across flippenator row, board, narrator, captains, footer *(UI-01)* | **PASS** — one 14px rhythm; computed gap 14, layout padding 14, `#actionPanel` margin `0 auto`, footer `0 14px 18px` |
| 2 | Icons hold 1s before fading; highlight 10% smaller; more distinct hover *(UI-02/03/04)* | **PASS** — highlight measured 38.67 → **34.8** (exactly 0.9×); pop rewritten to a burst after Wyatt judged the first version sluggish; hover outline screenshotted |
| 3 | Host a Crew goes straight to the lobby; no name doubling *(UI-05/06)* | **PASS** — one click creates a real Firebase room, `#stepHost` never shown, seat list reads `{name} — you` |
| 4 | Empty narration box hidden once the EOV summary appears *(UI-07)* | **PASS** — watched in a real finished game on **host and guest**; blue box `display:none`, gold banner carrying win line + recipe picture + Best Baker sentence |
| 5 | Shared links / search show a preview image; favicon served *(META-01/02)* | **PASS** for both; `max-image-preview:large` and the JSON-LD `image` field live, favicon confirmed in a real Google result |
| 6 | Ko-Fi button in footer and Credits *(KOFI-01)* | **PASS**, with a deviation recorded in 16-SUMMARY.md — the panel opens **in-page** rather than using the floating-chat embed, because that embed's button is in a cross-origin iframe |

## Cross-browser

Safari checks 1–5 of `17-SAFARI-CHECKLIST.md` all **PASS**, covering this phase's riskiest changes:
the pop animation (a CSS variable inside an SVG transform — the divergence flagged most likely to
fail silently in WebKit), the gold banner, and the Ko-Fi panel, which Safari's tracking prevention
could have blocked outright and does not.

## Not delivered — deliberate

**META-03** — verify the site in Google Search Console. Added mid-milestone, explicitly **not a code
change** and Wyatt's own action. Deferred to v1.3; nothing in this phase could have satisfied it.

## Things fixed that no criterion asked for

Recorded because a verification that only confirms the checklist hides what verifying actually found:

- a **guest-path crash** that would have taken down the whole End of Voyage screen
- the Best Baker sentence **clipped at both ends** of the gold banner
- `boot()` returning before `fbInit()`, leaving Host enabled with no database handle and an alert
  that blamed the server for a local condition

## One correction worth carrying forward

UI-07's first implementation was **inert**: `showStats()` hid the box and the very next `flash()`
re-showed it, so `ui_contract_check` assertion 9 passed while the feature did nothing. It was
caught only by watching a real finished game. A gate that pins the right call in the right function
still cannot see what the next line undoes — the same shape as 15-LEARNINGS #1's third dimension.
