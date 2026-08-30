# Handoff — Sunday 2026-08-30, written 12:10Z

## THE ONE-LINE STATE

**Staging is live and playable at `2026.08.30.1-staging@2cac247d`, and its game code is
byte-identical to the build that sailed as `2026.08.29.2`** — verified by `git diff`, comments only.
Production untouched: `origin/main` is still `a416af71` from 2026-08-27, and 240+ commits sit on
this branch that were never pushed to it.

**NET GAME-CODE CHANGE SINCE THE LAST DEPLOY: ZERO.** Four changes were written and all four
reverted. That is not a wasted night — see "what got reverted and why" — but it is the honest
headline and nobody should look for new behaviour on staging.

## WHAT A PLAYER GOT YESTERDAY THAT THEY DID NOT HAVE BEFORE

Already on staging, from the earlier part of the run:

- **Both screens work out who a line is about from the SAME rule.** `subjectOf` lives once in
  `src/shared/index.js`; host and guest both run it over the same event.
- **W4-2's other half, which had NEVER worked in a crew game.** Measured on the wire: before,
  **47 narration lines crossed and 0 carried a subject**; after, 4 of 80 carry one and none carries
  half of one. Cause: the bubble is drawn first, and drawing it *spends* the host's decision.
- Waves 4, 5 and 6 closed.

## WAVE 3, ITEM BY ITEM

| | state |
|---|---|
| W3-2 | done earlier (the bake-off pitch) |
| W3-4 | done earlier (the End of Voyage slam) |
| **W3-5** | **CLOSED, and the probe now fails on the bug it certifies gone.** See below. |
| **W3-3** | **Not reproduced on the ending. Still open on the approach.** See below. |
| **W3-1** | **Diagnosed to one line. Not fixed. Two attempts, both wrong, both reverted.** |

### W3-1 — the battle box. Diagnosed to the line; the fix is Wyatt's call.

Measured frame by frame:

```
frame 1   top=0px     inline=0px     tr=none
frame 2   top=396px   inline=UNSET   tr=yes
```

**The box carries a stale inline `top:0px` from the PREVIOUS prompt**, which wins for exactly one
frame until the battle branch clears it and adds `.centered`. The card never moves — its offset
inside `#apGridInner` is 0 in every frame; `#pp4Prompt` moves and the card rides it.

**The line:** `promptTick`'s `if (big || isBattle || !u){ box.classList.add("centered");
box.style.left = ""; box.style.top = ""; return; }` — `src/ui/stage.js:3437`. Correct code that
runs a frame too late, because `promptTick` runs on the tick.

**The fix shape, with a precedent 1200 lines above it:** run that placement synchronously when the
content is set, exactly as `enterCenterStage()` (`:2339`) already does — *"flip the prompt box to
centre-stage mode NOW, synchronously… Idempotent, exactly as the promptTick branch it was extracted
from."* Both key off content (`.bko` there, `.btl` here). **Idempotence is what answers rule 23's
two-directors hazard.** It means extracting a branch out of `promptTick` — structure, not a
one-liner — which is why it stopped here.

**Gate:** `scripts/qa/w31_battle_choreography.mjs`, RED today (three vertical positions while
visible). His ruling, from the question UI: **place it before painting** — he took it over the
safer "hold it hidden until placed".

### W3-3 — the drumroll. Not reproduced where it was looked for.

On the collab branch — **his branch, confirmed with 4 finishers** — the drumroll lands **1951ms
BEFORE** the winner is named. **But `?endcard=1` skips the entire day loop**, so the run-up he
actually played (final-round barrier, finish lines, bake-off) never happens. **It poses the ENDING,
not the APPROACH, and his sentence is about the approach.** The next measurement is a posed FINAL
DAY, not another ending.

### W3-5 — closed, with a probe that can now tell.

`scripts/qa/w35_sweep_preview_live.mjs`, matched pair on a posed board:

| tree | sequence | verdict |
|---|---|---|
| HEAD | 0 → 3 → **0** | PASS |
| bug reinstated | 0 → 3 → **3** | **FAIL** |

## W1-4 — the top backlog item. Its recorded cause was WRONG and is corrected.

Of the seven captures actually judged, **six failed and every one reads `covered 0`.** Nothing was
covering them. They are **off the screen edge** — including six at **x = −57 to −116, past the LEFT
edge**, which no entry had ever mentioned. **It is a FRAMING problem**, and `BACKLOG.md`'s entry now
says so. His ruling: **zoom out until they all fit.**

**And his trade-wind lead, answered:** trade-wind squares are NOT rendered differently — every
square of both kinds sits where its grid coordinate predicts, **to 0.0px**. But they ARE the rim by
construction, so they are the edge squares and fall off first. His observation was right; his
proposed cause was not.

## WHAT GOT REVERTED, AND WHY IT WAS STILL WORTH DOING

1. **The bubble candidate widening** — three full trials read **22 → 26 → 31** structural failures
   on the same ten legs. No benefit, and the flagged risk rose.
2. **The bubble tail in the cost box** — same trial series; coverings did not fall.
3. **W3-1's height fix** and **4. W3-1's clamp fix** — each measured dead in one run. "Identical
   result" was the tell both times.

**The rule that came out of it, now rule 26, at Wyatt's instruction and in his words:** *don't touch
bubble placement again without a posed comparison — the same seeded sail prompt, before and after,
two screenshots. Three probe runs and three 85-minute trials couldn't settle a question that two
pictures would have.* It is in `.claude/CLAUDE.md`, in the hook that fires at the first game-code
edit, in `src/ui/stage.js` at both edit sites, and in `docs/HARD-WON-LESSONS.md`.

## FOR WHOEVER PICKS THIS UP — five traps already paid for

- **A sea trial does not survive an idle session here.** Two died at 933s and 246s; the third
  completed 85 minutes because the session was held on a polling loop. Hold it.
- **`window.appState` is assigned NOWHERE.** Use `window.__pp_app_state_debug()` (`src/main.js:142`),
  which `scripts/mp_rig.mjs:244` already does. A probe reading the wrong one reports "unreachable"
  and looks exactly like a real finding.
- **No backticks in a comment inside a template literal** handed to the page. It ends the literal
  and throws. Cost three runs in one session.
- **An instrument must assert it touched its subject, in the same breath as its result.** A tap that
  lands on the sea and a tap that lands on a sail square produce the same number.
- **`.planning/CEO-REVIEWS.md` is newest-first.** Appending at the bottom made `ceo_brief.mjs` hand a
  reviewer a two-generation-stale verdict.

## THE HOURLY CHECK-IN ROUTINE IS STILL FIRING

`trig_01Xs4ApZNuYdm8tR8GXvMK1t` — the 8-hour close-out check-in, still going ~20 hours in. It is
Wyatt's routine, so it has been left alone rather than deleted; if he wants it off, that is one
call to `delete_trigger`.
