---
created: 2026-07-31T16:30:00.000Z
title: The bribe narration fires even when the loser has nothing in their hold
area: narration
severity: major
files:
  - src/ui/util.js:595 (isBribe)
  - src/ui/util.js:614 (neutral/winner spoil clause)
  - src/ui/util.js:631 (loser-addressed composite)
  - src/orchestrator.js:626-635 (asyncBattle — the live spoil path)
  - src/engine/index.js:571-574 (simulator-only spoil path, same flaw)
---

## Problem

Wyatt, during the Phase 17 playtest (2026-07-31): **the bribe narration appears even when the
bot/player has nothing in their hold. It shouldn't — because they have nothing in their hold, so
they give only money.**

The line reads *"{captain} bribes their way out of giving away a crate with 5🌕"* — but they never
had a crate to give away. There was nothing to bribe their way out of.

## Root cause — the test is a proxy that stopped standing in for the real thing

`src/ui/util.js:595`:

```js
const isBribe=e.spoilIng==null&&Number.isFinite(spoilN)&&spoilN>=5;
```

The reasoning recorded in the comment above it (NARR-04/D-12) is that both spoil paths clamp the coin
take to at most 5, so *"when the loser holds no crate and the leading number in `e.spoil` reached
that full 5, they had a full purse and chose to pay rather than give one up: a genuine bribe."*

**The "chose to pay" inference is what breaks.** Look at the live path,
`src/orchestrator.js:626-635`:

```js
const canCoins=lose.coins>=5,hasIng=lose.ing.length>0;
let mode;
if(canCoins&&hasIng){ … }              // a real choice — human is prompted, bot weighs it
else if(hasIng)mode="ing";
else mode="coins";                      // <-- NO CRATE. Not a choice. Still pays 5.
if(mode==="coins"){const take=Math.min(5,lose.coins); … spoil=take+" coins";}
```

A loser with **an empty hold and 5+ coins** lands on `mode="coins"` with `take===5`, producing
`spoil==="5 coins"` and `spoilIng===null` — **byte-identical to a genuine bribe.** The UI cannot
tell the two apart, so it renders the bribe framing for both.

So the real condition for a bribe is `canCoins && hasIng` — the loser had **both** and picked coins.
`spoilN>=5` was only ever a proxy for that, and it is wrong precisely in the empty-hold case.

The same flaw exists in the simulator path (`src/engine/index.js:571`): the `spoil="5 coins"` branch
tests `lose.coins>=5 && !wanted.length` and never checks `lose.ing.length`.

## The fix — and why it does NOT force a determinism re-record

The event carries no signal for this. Today's battle event is
`{t:"battle",a,d,rounds,winner,spoil,spoilIng}` (`src/orchestrator.js:650`) — nothing about the
loser's hold. **A new field is needed**, e.g. `spoilChosen:true` when the loser genuinely chose coins
over a crate (only reachable inside the `canCoins&&hasIng` branch).

**Checked, and this is the important part: adding that field in `src/orchestrator.js` does not touch
the determinism corpus.** `scripts/determinism_baseline.js` captures via `loadEngine()` and
serializes `g.events` from **`src/engine/index.js` only** — the async orchestrator never runs in the
harness. Fixtures hash `JSON.stringify(e)` per event, so a field added to the *engine's* battle event
would change every hash and force the one-time re-record; a field added to the *orchestrator's* would
not.

**Therefore: fix it in `src/orchestrator.js` + `src/ui/util.js` and leave `src/engine/index.js`
alone.** That keeps this item inside v1.3 rather than exiling it to the gated re-record batch. The
engine's simulator-only path can be corrected later, in that batch, when the door is opened anyway.

The UI must then treat the new field as **optional** — engine-generated events (replays, the
simulator, the 31 fixtures) will not carry it. Choose the absent-field default deliberately: falling
back to the **non-bribe** framing is the safer default, since it is the one that claims less, which is
the same principle the existing guard already follows for absent/non-numeric spoils.

## What the empty-hold case says instead — RULED by Wyatt, 2026-07-31

> **"they give up 5 🌕"**

So the empty-hold loser gets a **third line of its own**, not the existing cleaned-out fallback:

| Viewer | Line |
|---|---|
| Neutral / winner | `{loser} gives up 5🌕.` |
| Loser (addressed) | `Ye give up 5🌕.` |

**And when they hold fewer than 5 coins, it falls through to the existing "all they have" branch**
— Wyatt, 2026-07-31: *"if they have less than 5, it should add on, 'all they have' — I think there's
already a branch for this."* **He is right, it already exists** (`src/ui/util.js:615-617`):

```js
else if(viewerIsLoser)spoilClause=`Ye give up all ye have${spoilText?`: ${spoilText}`:""}.`;
else if(viewerIsWinner)spoilClause=`Ye take all ${pn(loser)} has${spoilText?`: ${spoilText}`:""}.`;
else spoilClause=`${pn(loser)} gives up all they have${spoilText?`: ${spoilText}`:""}.`;
```

### So the full decision table becomes

| Loser's situation | Coin take | Line |
|---|---|---|
| Had a crate **and** 5+ coins, chose to pay | 5 | **bribe** — unchanged, exactly as approved |
| **Empty hold**, 5+ coins | 5 | **NEW:** *"{loser} gives up 5🌕."* / *"Ye give up 5🌕."* |
| **Empty hold**, fewer than 5 coins | all of them | **existing:** *"gives up all they have: 3🌕."* |

That is a tidy outcome: **the new line is only needed for the exact-5 empty-hold case.** The
under-5 case keeps already-approved copy, and the bribe wording is untouched. Nothing else moves.

Two notes on applying it:

- **The addressed variant is a mechanical person-swap of his own words, not new copy** — the
  D-07/NARR-05 contract is that these render as siblings, so shipping only the neutral form would
  show for some viewers and not others. It still gets confirmed at the copy gate rather than assumed.
- The under-5 branch is reached today by the `spoilN>=5` test failing. Once `isBribe` also requires
  "had a crate", make sure the under-5 empty-hold case still lands on the cleaned-out branch and does
  not accidentally fall into the new exact-5 line.

## Gates

- `scripts/narration_test.js:280-305` asserts the bribe-vs-cleaned-out split directly, including
  *"battle: 5-coin spoil renders the bribe framing"*. **That assertion encodes the bug** — a 5-coin
  spoil should render the bribe framing only when a crate was actually forgone. Expect to update the
  test to distinguish the two cases, and make sure it is genuinely re-pointed rather than deleted.
- Copy changes fall inside the inventory tracked by `copy-shipped-vs-approved-gate`.
- D-12 / NARR-04 is Wyatt's own approved split. This does not overturn it — the bribe wording stays
  exactly as approved; it just stops firing in a case it was never meant to cover.

**Source:** Wyatt, 2026-07-31, during the v1.2 Phase 17 playtest.
