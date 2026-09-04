# PREDICTION — t216-baker-tiebreak (ruling RULING-20260903T213035Z-t216-baker-tiebreak)

**His ruling, verbatim:** "Change the game to match the page — record the day each captain lights
their ovens and rank on it; fairer, and it is the rule you clearly meant, but it touches the
end-of-voyage ranking."

**His solution, so it goes first:** stamp the day a captain lights the ovens, and rank the
Best-Baker tiebreak on that stamp instead of on seat order.

## What I expect, before measuring

1. `endBakeDay()` in `src/engine/index.js` fills `finishOrder` from
   `this.players.filter(q=>q.bakedToday)` — array order, i.e. seat order — for everyone who
   finishes baking on the same day. `bakeRank()`'s third comparator is
   `finishOrder.indexOf(a)-finishOrder.indexOf(b)`, so two same-day finishers are ranked by seat,
   not by who arrived (lit the ovens) first.
2. Adding `ovensDay:null` to the player object and stamping `p.ovensDay=this.round` inside
   `lightOvens()` will let `bakeRank()` compare arrival day directly: lower `ovensDay` wins the
   tie. I expect this to require touching exactly two functions (`lightOvens`, `bakeRank`) plus the
   player-init literal.
3. This should NOT touch the event stream (`ev()` calls) or consume any `r()` draws, so the
   determinism corpus (`scripts/determinism_baseline.js`, `scripts/bakeoff_baseline.js`, both hash
   `g.events`, not internal player fields) should stay byte-identical. `npm test`'s determinism
   gates should pass unchanged.
4. In classic (non-bakeoff) mode `ovensDay` never gets set (stays `null` for every player), so the
   new comparator returns 0 for everyone there and falls through to the existing
   `finishOrder.indexOf` tiebreak — behaviour in that mode should be provably unchanged, since
   bakeoff is what the ruling is about (his own rules page describes the bakeoff-era Best Baker
   scene).
5. A RED test: construct two players tied on crates and coins, have the LATER-seated one light
   ovens on an earlier round than the EARLIER-seated one, and finish baking the same day. On the
   current code the earlier seat wins (wrong). After the fix, the earlier-arriving captain (later
   seat) should win.

## What would prove me wrong

- If `lightOvens()` is not actually where every bakeoff-mode arrival happens (e.g. a second path
  also adds someone to baking without going through `lightOvens()`), the stamp would be missing
  for some players and the fix would silently do nothing for them.
- If the determinism gates fail after this change, my belief that `ovensDay` never touches the
  event stream is wrong and needs to be re-examined before shipping.
- If `endBakeDay()` or `bakeRank()` read player state in a way I haven't accounted for (e.g. a
  replay/scrub path that reconstructs players without going through the same init literal),
  `ovensDay` could be `undefined` there and break the comparison in an unexpected way.
