# Handoff — 2026-08-29 morning

**Branch:** `claude/cloud-handoff-planning-a9ay1u`  ·  **Staging:** `2026.08.29.1-staging@0fb6d710`, verified
serving over the wire.  ·  **Gates:** 46, `npm test` exit 0.

> **ASSUME A SECOND SESSION IS ON THIS BRANCH** (rule 16). `git pull --rebase` before every commit;
> claim an item in `CTO-LEDGER.md` before editing it. `.planning/SEA-TRIAL.md` is the authoritative
> report path — a run that is not the authoritative one writes its own with `--report=`.

## What shipped tonight, and what it was

| item | his words | what was actually wrong |
|---|---|---|
| **W5-2** | call buttons sit on the boats, often the wrong one | the offset was a literal `ay + 26` — a constant standing in for half a boat, and a boat is drawn `cell` wide. 0–5% of the hull covered at 390px, 12% at 1200, 27% at 768. The wrong-boat half was D-48's Pass-goes-lowest rule **swapping two spots** that name captains: at 768px "Call Captain 2" landed 425px from Captain 2, on Captain 1's hull. Fires whenever the attacker's boat is right of the defender's. |
| **W5-1** | the coin flip is low-res | the ceremony drew a 76px raster and stretched it 2.2×. **Half the item only** — see Q-19. |
| **W3-4** | the End of Voyage card SLAMS | one 4px trackpad notch threw it 688px in 250ms and bounced 28px past the captains box. |

## THE THREE THINGS THE NEXT SESSION SHOULD READ FIRST

1. **A gate that reads source text may only claim things about source text.** CEO Review 21's rule,
   and the fault it names has now been found EIGHT reviews running. Reviews 21–23 between them
   walked three of my gates past sixteen working breakages. All sixteen are closed, but the habit
   is the thing to watch: write the pass line as *"the text I found says X"*, never *"the game
   does Y"*. The picture is a browser probe's job.
2. **A measurement can be right and the picture still wrong.** The WebP re-export decoded at
   768×768 in Chromium AND WebKit — and put a hard black square behind the flippenator. Rule 19 is
   not a formality; it is the only check that caught it.
3. **`/classic` reads the ROOT `assets/` folder** through its own `ASSET_BASE="../assets/"`.
   Deleting an asset the v2 tree has stopped using breaks the frozen v1 that real players are on.
   This was one command from happening tonight.

## Open, in the order I would take them

- **W3-1** — the battle box choreography, "in ALL modes". The biggest remaining item and the one
  with architectural risk; read `.planning/CTO-QUESTIONS.md` Q-18 first.
- **W3-2** — the bake-off boxes jitter after being shuffled. `src/ui/bakeoff.js`.
- **Q-19 / Q-20** — waiting on Wyatt, do not decide for him.
- **W3-3** — parked, with a lead. **The lead in the W3-3 ledger row is WRONG** and is corrected two
  rows below it: `?endcard=1` is not gated behind `devHost()` and works on every run.

## The loop that is working, so don't drop it

`/gsd-quick` → claim it in the ledger → **write the prediction down before measuring** → gate RED
first → fix → same gate green → matched-pair screenshots → fresh-context CEO per item, appended
verbatim to `.planning/CEO-REVIEWS.md`. The predictions caught two wrong answers tonight and the
CEOs caught four things I would have shipped.
