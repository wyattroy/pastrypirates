# Phase 2: Multiplayer Revival - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 2-multiplayer-revival
**Areas discussed:** The bake-off before Phase 4 · The ⏩ skip button · Where chat goes · How we prove
it works · The welcome screen · Old multiplayer todos

---

## Area selection

| Option | Description | Selected |
|--------|-------------|----------|
| The bake-off, before Phase 4 | A networked game reaching the ovens would run the guest's bake on the host's screen | ✓ |
| The ⏩ skip button | One player skipping narration others are still watching | ✓ |
| Where chat goes | The new stage switches the on-board speech bubbles off entirely | ✓ |
| How we prove it works | Two devices, 16-day voyage, and whether guest reconnect counts | ✓ |

**User's choice:** all four.

---

## The bake-off before Phase 4

| Option | Description | Selected |
|--------|-------------|----------|
| Skip it automatically online | Force the bake-off off room-wide; host's setting travels to the guest | ✓ *(later superseded)* |
| Keep Host/Join off the live build | Restore the cards but don't push to `/4` until Phase 4 | ✓ *(later superseded)* |
| Ship it as-is, host plays everyone's bake | Nothing to build; a guest watches somebody else play their finish | |

**User's choice:** this question was answered **three times** as new evidence arrived, and the third
answer is the one that stands.

1. First pass — "skip it automatically online."
2. After discovering the collision (below) — "keep Host/Join off the live build instead."
3. Final — *"you're making this more complicated than it needs to be — no one in the entire world is
   playing /4 except me. just push it to /4 so i can test, and stop overcomplicating it."*

**Notes — the collision that forced the re-ask.** Wyatt corrected a related question by pointing out
the one-lap final round is gone from the bake-off ruleset. That was verified true
(`4/src/orchestrator.js:877`) — but it also meant that forcing the bake-off **off** for online games
would put every crew game onto `runLiveDayClassic`, the retired path that still *has* the final
round. Both earlier answers existed to protect a stranger from a half-finished crew game, and there
are no strangers: `/4` is `noindex, nofollow` and `Disallow: /4/`. **Two gating schemes were designed
and both were waste.**

### Follow-up: should the game say the online ending differs?

| Option | Description | Selected |
|--------|-------------|----------|
| One quiet line in the lobby | "Crew games end at the docks for now" | |
| Say nothing | Nobody playing online has seen the bake-off ending anyway | ✓ |
| You decide | | |

**Notes:** moot under the final bake-off answer, but recorded — it stays "say nothing."

---

## The ⏩ skip button

| Option | Description | Selected |
|--------|-------------|----------|
| Hide it for everyone online | One rule, no exceptions | |
| Guests keep it, host loses it | Truest to what it does; breaks the consistency rule | |
| You decide | | |

**User's choice:** none of the above — *"there is no skip in a multiplayer game -- this was decided
earlier. skip is only for solo games."*

**Notes:** the question should never have been asked. The ruling was already in the code
(`4/src/ui/stage.js:425`, *"Wyatt's ruling, 2026-08-13: the skip is solo-only"*) and its reason was in
the git log (`348ccf4`, *"fast-forward through bot turns"* — the ⏩ exists to skip **bots**). A
CLAUDE.md §2 "read the graveyard" miss. Recovered by finding the ruling and re-framing the work as
one more term in the existing condition rather than a new behaviour.

The measurement gathered before asking was still useful and is carried into CONTEXT.md: a guest's ⏩
only speeds their own screen, but the host's shortens `sleep()` in the `runLiveNet` loop and drags the
whole table.

---

## Where chat goes

| Option | Description | Selected |
|--------|-------------|----------|
| Smallest honest version now | Ribbon button + slide-up sheet + unread dot | ✓ |
| Bring the ship bubbles back | Un-hide what's built; collides with narration | |
| Not this phase — note it and design it later | Keeps the phase tight; no way to talk during the test | |

**User's choice:** smallest honest version now.

**Notes:** the argument that carried it was his own Phase-1 ruling — no shot clock, *because*
"multiplayer is played between friends, who can communicate through the chat." With no chat surface
that reasoning has nothing under it.

### Follow-up: does an incoming message show itself?

| Option | Description | Selected |
|--------|-------------|----------|
| Dot only — quiet | Never appears over the board uninvited | |
| Flash it briefly, then fade | Appears under the ribbon for a few seconds | ✓ |
| You decide | | |

**Notes:** approved against a rendered sketch. Placement is deliberately **under the ribbon**, not at
the ships — the ships' space is what narration took and why the chat bubbles were switched off.

---

## How we prove it works

| Option | Description | Selected |
|--------|-------------|----------|
| I shake it out first, then you play it for real | Headless until it stops crashing, then a real voyage on his phone | ✓ |
| You play it from the start | Fastest to a real answer; he becomes the crash detector | |
| Headless only, you read the findings | Costs him nothing; nothing ever judged by a person on a phone | |

**User's choice:** shake out first, then he plays it.

### Guest reconnect

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — make it a pass/fail here | Never executed once in `4/`; most likely real-world event | ✓ |
| No — just write down what happens | Keeps promises to what the roadmap says | |

**Notes:** closes an item Phase 1 explicitly deferred to Phase 2. Becomes criterion 5.

---

## The welcome screen

| Option | Description | Selected |
|--------|-------------|----------|
| Same as the live game | Solo · Pass & Play on top, Host · Join beneath | ✓ |
| Crew games on top | Puts the revived thing first; leads a stranger with the mode needing a friend | |
| You decide | | |

**User's choice:** live's order.

**Notes:** measured before asking — `.choiceRow` wraps and the cards have a 118px minimum, so four
cards form a 2×2 grid on a phone rather than a squeezed row. Also surfaced during the scout:
`#fbnote` and `#busynote` were deleted from `4/`'s welcome screen while their readers survived
(guarded, so nothing crashes) — restoring them with the cards was taken as Claude's discretion and
not put to him.

---

## Old multiplayer todos

| Option | Description | Selected |
|--------|-------------|----------|
| Guests never hear "one final turn each" | Recommended; he declined, and was right | |
| Guest battle sound drifts | Fires on data arrival, not render — "architectural, not a patch" | ✓ |
| Everyone can read everyone's recipe | Any player can read rivals' recipes from the console | |
| Pausing can't save the last second of a turn | Low; clock defaults off in `4/` | |

**User's choice:** the battle sound only.

**Notes:** the final-round item was re-put to him after verifying the narration line still exists in
`4/`. His answer — *"IT's not in the new build -- the bakeoff can be completed in as little as 1 turn
if the player is smart"* — is confirmed by the code: the line lives in `runLiveDayClassic`, and
`4/src/orchestrator.js:877` states *"The one-lap final round is gone: the baking days ARE the
catch-up window."* **He was right and the recommendation was wrong.** Chasing it down is what
exposed the bake-off collision above.

---

## Claude's Discretion

- Restoring `#fbnote` and `#busynote` alongside the two welcome cards.
- Mechanism for the four latent net faults (FIX-03 and neighbours).
- Where the phase's finding document lives and what shape it takes.
- Whether the `v2.1 + bake-off — test ruleset` byline changes when the card row becomes four.

## Deferred Ideas

- **"Is cheating a real risk among friends?"** — answer once in Phase 4, covering both the bake-off's
  private bench and `every-client-can-see-every-recipe.md`.
- **The cheat flags `?ovens=1` / `?windhud=1`** — offered for early closure, declined; stays Phase 6.
- **The About link on the welcome screen** — Phase 6, once `about.html` stops 404ing at `/4`.
- **Chat's finished form** — where it sits at rest, and whether the ship bubbles ever return.
