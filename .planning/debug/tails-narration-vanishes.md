---
status: investigating
trigger: "Wyatt, solo, desktop Chrome, build 2026-08-20t, playpastrypirates.com/4: 'after flipping TAILS at a dock, a narration box popped up and immediately disappeared'; what was left on screen was the Buy prompt pill '⊗ TAILS — a turn on the docks. Buy some jugs of 🥛 Fresh Milk?' with petals 'Buy 🥛 −3' / 'Nah' beside his boat. His question: could D-30 (dockTails 2→1, dockHeads 5→3, commit 059bbe5) have caused it? Also: the pill overhangs the board's right edge by ~65px into the dark margin with no tail to the boat — same bug, second bug, or pre-existing?"
created: 2026-08-21T14:44:59Z
updated: 2026-08-21T14:44:59Z
---

## Current Focus

hypothesis: the flip-result narration (`.pp4Bub`, stage.js flash() called from flow.js:313 inside humanFlip) is the "narration box" that shows "{name} flips TAILS" for its scaled hold (floor 2550ms, *1.5 curve) then fades — this may be normal, by-design behaviour that just reads as "immediate" to a player glancing away, OR item 11's pendingReveal gate on the SEPARATE #pp4Prompt box (the flip-ask box that stays visible under the bubble) could be forcing a real display:none->block flash when the Buy prompt's panel() call lands. Need measurement to tell which.
test: instrument #pp4Prompt (style/class), #actionPanel (pendingReveal), and .pp4Bub add/remove/class in-page via MutationObserver + rAF sampler BEFORE a real mouse-driven flip; pose the engine RNG (g.r) to force TAILS so no wasted attempts; screenshot every 100ms across the 3.2s after the click; dump the timeline and read back what actually happened, frame by frame.
expecting: if #pp4Prompt or the popup wrapper genuinely blinks display:none mid-sequence with visible content on both sides, that is a real bug (same family as sail-prompt-premature-flash.md). If only the .pp4Bub bubble appears-then-fades on its normal schedule with #pp4Prompt/actionPanel content transitioning cleanly once (old prompt -> pendingReveal hide -> buy prompt reveal), this is working as designed and unrelated to D-30 pricing.
next_action: run scratchpad/tails_repro.mjs (self-contained Chrome+CDP driver at ports 8523/9523), read back timeline.json + screenshots, and separately bisect the SAME reproduction against pre-o/pre-s/pre-t trees extracted via git archive.

## Symptoms

expected: after a dock coin flip lands TAILS, the flip result is narrated once (a bubble near the boat, "X flips TAILS"), holds long enough to read, then the Buy prompt (radial pill + petals) appears — with no unexplained flash of an empty or wrong-content box in between, and the pill fully on-board with its tail pointing at the boat.
actual (per Wyatt): a narration box popped up and immediately disappeared; the Buy prompt pill was on screen afterward. Separately, the pill overhangs the board's right edge by ~65px into the dark margin and shows no tail to the boat.
errors: none reported — a timing/sequencing + layout symptom, not a JS exception.
reproduction (as reported): solo, desktop Chrome, dock at an island, flip the coin, land TAILS.
started: unknown — Wyatt asks whether D-30 (059bbe5, dockTails 2->1 / dockHeads 5->3) is the cause. Investigation will bisect pre-o / pre-s / pre-t / t.

## Eliminated

(none yet)

## Evidence

(pending first run)

## Resolution

root_cause: not yet identified
fix: none yet
verification: n/a
files_changed: []
