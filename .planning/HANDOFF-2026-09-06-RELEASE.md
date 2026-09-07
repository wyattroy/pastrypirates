# Handoff — 2026-09-06, the night two weeks of work shipped

**Read `.claude/CLAUDE.md` first. It is 222 lines now, not 1,359, and it is current.**

## Where everything stands

| | |
|---|---|
| production | `2026.09.06.2` — **live to real players**, verified page by page and sound by sound |
| staging | `2026.09.06.2-staging@a473be4b` — identical to production |
| branches | `dev` and `main` are level. 17 branches on GitHub, down from 46 |
| gates | `npm test` → 104, exit 0 |
| stranded work | none. Nothing uncommitted, nothing unpushed, no browsers running |

## What happened, in one paragraph

Wyatt arrived unable to understand his own repo: 46 branches, ~1,400 commits on a branch that
never merged, and a process system that had become a full-time job he was doing. Five live
branches were merged into one `dev`; the Glass/Bell/Watch/Chart/ledger/CEO-cadence machinery was
retired (360 files, 81,190 lines); he playtested; his findings were fixed; `dev` merged to `main`.
**Production had been on the 26 August build for eleven days and is now current.**

## THE FIVE THINGS THE NEXT SESSION MOST NEEDS

1. **He never played the build that shipped.** Two commits — `761f8728` (the Sound row wording)
   and `a473be4b` (the bump) — reached production without ever being on staging. That was my
   sequencing error: I merged to `main` and republished staging afterwards, instead of the other
   way round. **Pass & Play was not tested at all on 2026-09-06.** If he reports something odd,
   suspect these first; reverting that merge is one command.

2. **The Safari "no sound" saga was NEVER THE GAME.** Closing the tab entirely fixed it — Safari
   tab-scoped state, after tab-mute and Auto-Play were both ruled out on his screen. I chased it
   in code and was wrong three times. **Do not re-chase it.** Real fixes did come out of it and
   they stand: the audio unlock now retries on every tap until sound is confirmed running (a
   one-shot unverified unlock was a genuine hole), `applyMasterGain` now cancels and anchors its
   ramp like `fadeStorm` always did, and the Sound row now reports `blocked` / `nosamples` instead
   of always claiming ON.

3. **His own writing lives in `.planning/his-words/`.** The founding note, the 24 interview
   rulings, the Luis SFX brief, the game-architecture map. I deleted these by mistake during the
   machinery sweep and an independent audit caught it. **Never sweep that folder.**

4. **The machinery cut was asymmetric and is unfinished.** `.planning/` is still ~655 MB of 662 —
   SPEC-GLASS-*.md, GLASS-CHART.md, 28 handoff files, 12 root-level PREDICTION files, and 26
   tracked scratch probes under `scratchpad/` are still on disk. **He has NOT approved a second
   sweep.** Show him a list before touching anything; I over-cut his writing once already.

5. **Cloudflare is the next big piece, and he has asked for it twice.** Groundwork is already on
   the branch (`wrangler.toml`, `cloudflare-cutover.html`). The reason it matters, in his terms:
   staging is currently a *photocopy* published by hand into a second repo, because GitHub Pages
   serves one branch per repo. Nothing is automated — there are no GitHub workflows in this repo.
   Cloudflare makes `dev` → staging automatic and removes the manual step that caused item 1.

## Two standing rules he gave on 2026-09-06

- **Never ask him which item to do first.** *"don't ask me my preference for order: just do the
  work. Every time."* Sequencing is mine; taste is his. The ask-2-5-questions rule is about
  INTENT and was never about order.
- **Solve architecturally, in the one path both sides drain from.** *"not through driftable
  patches."* Said about audio; it is a general instruction.

## Still open, nothing blocking

- 7 branches hold unique commits nobody has triaged: printable rules, the ruleset work, island
  scenes, an art backup. He was told and has not ruled.
- The `100dvh` phone-layout fix is UNPROVEN on real Safari — I cannot drive his phone.
- 8 `safety-2026-09-06/*` tags on GitHub preserve every pre-merge branch tip. Safe to delete once
  he is confident, and not before.
