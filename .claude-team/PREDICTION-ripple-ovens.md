# PREDICTION — the ripple ring is drawn from two places that disagree during a bake

Written 2026-08-31 BEFORE any change or measurement.

## Wyatt's ruling, which decides the answer

**"no ripple ring in the ovens."** The active-turn ring stays with whoever last took the wheel. It
does not move to the captain who has stepped up to bake.

## What I claim, with citations

Two sites draw that ring, and they pass DIFFERENT event lists to the same walk:

| site | list passed | so during a bake the ring… |
|---|---|---|
| `src/ui/board.js:1532` `activeTurnSeat()` → used by the live-ships path at `:1479` | `TURN_ONLY` = `["turn"]` | **stays** with the last captain to take the wheel — obeys the ruling |
| `src/ui/board.js:1776` — `render()`'s own | the DEFAULT, `TURN_ESTABLISHING` = `["turn","ovens","bake"]` | **moves** to the captain at the ovens — breaks the ruling |

`src/shared/storyboard.js:25-29` records why `ovens`/`bake` were ever added: *"a bake is not a turn
— the engine emits {t:'ovens',p} when a captain steps up… so during a bake the most recent `turn`
was still the PREVIOUS captain's and the ring pointed at them."* Somebody read that as a bug and
widened one of the two sites. Wyatt has now ruled it is not a bug.

## What happens BEFORE the bug (rule: widen the time horizon)

Nothing races here. This is not a timing fault — it is two constants. The ring's behaviour during a
bake depends on **which drawing path last ran**, which is decided by whether the ship list came from
the live/net renderer or from `render()`. That is the same shape as the host/guest divergence: one
thing a player looks at, two answers, kept in step by nobody.

## What would prove me WRONG

1. **If the two sites cannot both draw the ring in one session** — e.g. `:1776` only ever runs
   before a game starts, or the live path always runs last and overwrites it. Then there is one
   effective answer and this is dead code, not a divergence.
2. **If a bake never coexists with the ring being visible at all** — if the ring is hidden while the
   bake-off card is up, neither site's answer is seen and the whole question is moot on screen.
3. If `TURN_ESTABLISHING`'s `ovens`/`bake` entries are load-bearing for some OTHER consumer of
   `:1776`'s `active` value, so narrowing it changes something besides the ring.

**If any of those hold I say so and do not "fix" it.** Falsifier 2 is the one I most expect to bite,
and it is exactly the shape that caught me out three times on the last item: TRUE OF THE CODE, and
I have not yet looked at what the game PRODUCES.

## So the gate comes first, and it must go RED before anything changes

A check that asserts both ring sites derive the seat from the same event list. On the tree as it
stands it must FAIL, naming the two lists. If it passes now, my reading of the code is wrong.
