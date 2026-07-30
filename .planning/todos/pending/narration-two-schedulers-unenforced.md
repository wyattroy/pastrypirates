---
id: narration-two-schedulers-unenforced
title: flash() and showNarration() are two hold/fade schedulers on one element — real, unenforced
status: pending
type: concern
severity: low
area: ui
created: 2026-07-30
source: Phase 15 verification (D-57 residue) + session-2 playtest (Wyatt, 2026-07-30)
resolves_phase: null
regression: false
---

## The concern

`flash()` (`src/ui/panel.js`) and `showNarration()` (same file) are **two independent hold-and-fade
schedulers writing the same `.apMsg` element**. Nothing coordinates them and nothing asserts they
agree.

The Phase 15 verifier's words: **"benign today but unenforced."** Both halves are true. It is benign
because the paths that reach each one do not currently interleave; it is unenforced because that is
a property of today's call graph, not of anything structural — and the four host/guest drifts are
the standing evidence for how long an unenforced property survives.

## Deliberately NOT fixed in the 2026-07-30 session-2 pass

Two reasons, both recorded at the time:

1. It is a refactor of **live narration timing**, not a copy or parity fix — a different class of
   change from everything else in that plan.
2. **G17 was already changing that exact code** in the same pass (the strict fade-then-show
   sequence: `GHOST_FADE_MS`, `typewriterReveal`'s start delay). Unifying two schedulers underneath
   a timing change landing in the same commit range is how a subtle regression gets in with nobody
   able to say which change caused it.

Recorded here so it is **visible rather than forgotten**, which is the whole point of this file.

## Where the four host/guest drifts now stand

This is the LAST of the four that is neither fixed nor gated:

| Drift | State as of 2026-07-30 |
|-------|------------------------|
| **F7** prompt delivery leak | ✅ gated — `ui_contract_check.js` assertion 7 flags viewer-branching broadcasts |
| **D-35** sail-prompt wording | ✅ structurally safe (the guest renders the host's `msg`) and now class-gated — `host_guest_parity_check.js` assertion 1 |
| **D-55** sail-highlight parity | ✅ FIXED (G25 — one shared `sailHighlightRect()`) and gated — assertion 2 |
| **D-57** two narration schedulers | ⚠️ **this file.** Patched, never unified, still unenforced |

## If it is taken up

Do it on its own, after G17's strict fade has been human-verified in a browser, and add the gate in
the same commit as the unification — `scripts/host_guest_parity_check.js` is the natural home, since
this is a host/guest presentation-parity concern of exactly the kind that gate exists for.
