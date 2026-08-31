# PREDICTION — step 1, before any code

2026-08-31. Written first so it cannot be retrofitted.

## THE FINDING THAT RE-SIZES THE STEP, and I want it on the record before I build anything

**`sail` is already converged, so step 1 is NOT a fix. It is scaffolding.**

`src/orchestrator.js:1586` `consumeEvent(e)` is run by **every client** — the host drains into it,
and `watchEvents()` (`:1611`) feeds the guest's wire into the same function. Its body is already an
ordered list of beats:

```
guest state mirror → applyActiveSeat → syncLogLines → scrub → stormCamForEvent
→ animateRimSweepIfAny → animateSailRoute → render → spawnPops → playForEvent → applyEndMeta
```

`animateSailRoute` is beat 7, it rides the event being consumed, and it is idempotent through a
`WeakSet`, so the host's own call sites (`flow.js:2381,2489`) are no-ops after it. **The plan's
step 2 — "put the route on the event, delete the host-only animation call sites, the guest's boat
starts sailing the actual water" — has therefore already shipped.** The route is on the event as
`ev.draw.route`, and `flow.js:1277`'s comment records that it deliberately rides *any* event
carrying a baked route rather than `t==="sail"`.

**So what is left for step 1 is real but different from the billing:** that beat list is written as
INSTRUCTIONS, not as DATA. Nothing can read it, snapshot it, or compare it. Step 4's golden-file
parity gate has nothing to snapshot until it exists. **Step 1's value is making an already-correct
sequence inspectable — and I will say that to Wyatt in those words rather than as "first visible
win", because no player will see anything.**

## What I will build, smallest honest version

`present(event, snapshot) → beats[]` in `src/shared/storyboard.js` (L3, purity already gated).
`consumeEvent` consults it **for `sail` only**; every other kind keeps today's path. Strangler fig.

## What I predict, and what would prove me wrong

1. **The beat list is not uniform, and a naive extraction will break something.** Some beats are
   awaited and some are not; `stormCamForEvent` and `applyEndMeta` are self-guarded; the guest
   state mirror is `isHost`-branched. **If I find the sail beats are cleanly separable with no
   ordering coupling, I was too pessimistic and should say so.**
2. **`present()` cannot see `appState`** — CEO 31's condition, and the whole reason L3 is gated
   pure. So every input a beat needs must be passed in explicitly. **I predict the sail beat needs
   only `ev.p` and `ev.draw.route`, both already on the event.** If it turns out to need live
   render state, that is a finding that changes the plan's shape and goes to Wyatt, not into a
   convenient import.
3. **I predict this changes nothing a player can see.** If any screenshot differs, I have broken
   something, not improved it.

## The falsifier that matters most

**If `present()` for `sail` ends up being a one-entry list wrapping one existing call, the
abstraction is not earning its place yet and I should say so rather than dress it up.** The
justification would then rest entirely on step 4 being built immediately after — which is exactly
why the plan says to stand that gate up "as soon as two event kinds are converted, early enough
that it guards the rest of the migration rather than certifying it afterwards."
