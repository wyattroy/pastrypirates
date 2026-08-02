# Phase 20: The Board Comes Alive - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-02
**Phase:** 20-the-board-comes-alive
**Workstream:** `board-wind`
**Areas discussed:** Wind dots (WIND-01), the rim arrows and whirlpool (WIND-02/03), the rim-sweep
warning (WIND-05), the scent line (WIND-04)

---

## Wind dots (WIND-01)

### Dots during a storm

| Option | Description | Selected |
|--------|-------------|----------|
| Fade out, fade back *(recommended)* | Ease away over ~1s as the storm arrives, ease back when it passes | ✓ |
| Cut instantly | Stop the moment the storm starts; most literal reading of "non-storm turns" | |
| Keep them running | What the prototype does today; contradicts WIND-01 as written | |

**Notes:** The prototype deliberately ran the dots through storms to prove the layer held while
storms came and went. That was a Phase 19 measurement choice, not the shipping rule.

### What survives from the prototype

| Option | Description | Selected |
|--------|-------------|----------|
| Strip it all out *(recommended)* | Delete the panel, 0–100 dial, readout, will-change toggle, frame meter and end-of-voyage summary; dots ship always-on at 5–10 | ✓ |
| Keep the meter behind the flag | Leave the dial and meter inert behind `?wind=1` as a future diagnostic | |
| Keep the dial only | Delete the meter, keep the dial for re-eyeballing density on a phone | |

**Notes:** Checked first — the game has no player settings menu at all, so a player-facing dots
toggle would mean inventing one. `prefers-reduced-motion` already covers the accessibility case.

### Dot appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Soft white specks, varied sizes *(recommended)* | Per-dot size ~4–10px with a soft edge, drawn from the seeded stream; no new art | ✓ |
| Leave them as they are | The identical flat 7px white circle that passed the Safari gate | |
| Something diegetic | Sea spray / flour dust / petals as a drawn sprite | |

### Dot layering

| Option | Description | Selected |
|--------|-------------|----------|
| Behind ships, over water and islands *(recommended)* | Boats never obstructed | |
| Over everything | Dots pass in front of islands and ships alike, as if blowing between the player and the board | ✓ |
| Water only | Clipped to the water shape — needs a mask, the family of effect that broke Safari once | |

**Notes:** Wyatt chose against the recommendation here.

### Behaviour on a wind direction change

**Raised unprompted by Wyatt mid-discussion:** *"the dots should also fade out when the wind
direction changes."*

| Option | Description | Selected |
|--------|-------------|----------|
| Out, then back on the new heading *(recommended)* | Fade away, re-aim invisibly, fade in on the new heading | |
| Out, back in, timed to the round line | Same fade, synced so dots die away as the new round line types out and return once it lands | ✓ |
| Fade out and stay gone briefly | A visible beat of still air before the new breeze | |

**Notes:** This is a **correction to shipped prototype behaviour.** The prototype rotates the whole
layer on a direction change — its own comment states "a direction change re-aims every dot with no
restart" — which would read on screen as the entire field swivelling in place. The chosen option
also creates a new coupling between `board.js` and the narration typewriter's timing.

### Sway character

**Raised unprompted by Wyatt:** *"i want the dots to slowly drift side to side as they go, as if the
breeze isn't consistent -- potentially like a sine wave, if that's cheap, or an approximation of it
if that's not. a cheap animation like blowing dust particles -- they don't all rush one way at once."*

**Finding reported back:** the sway already *is* a sine wave, but `WIND_WOBBLE_PERIOD_MS` is a single
shared constant (2600ms) — every dot sways on the same rhythm, differing only in starting phase and
amplitude. That is exactly the lockstep he described. Fix: draw a per-dot period from the seeded
stream, as `speed` and `wobbleAmp` already are.

### The tuning page

**Requested by Wyatt:** *"you can also spin up a version of rain.html for me to tweak and approve the
dots, please."*

| Option | Description | Selected |
|--------|-------------|----------|
| A gate — dots don't ship until approved *(recommended)* | Page built first; his numbers become the shipped constants; nothing in WIND-01 finishes until sign-off | ✓ |
| A tool, alongside the work | Dots ship with a best guess; page exists for later adjustment | |
| A gate, and it stays afterwards | Same gate, page kept permanently for the watercolor restyle | |

**Notes:** There is no `rain.html` in the repo. `lab.html` is a 121KB pre-refactor standalone that
does not load `src/ui/board.js` — the same trap Phase 19 recorded as D-08. The tuning page must
import the real dot functions.

---

## The rim arrows and the whirlpool (WIND-02 / WIND-03)

**Measured before asking:** the live grid is 15×15 — 177 water cells, 40 rim cells (36 arrows + 4
whirlpool swirls), all SVG `<image>` elements today.

### What "flowing" means

| Option | Description | Selected |
|--------|-------------|----------|
| Specks ride the channel, arrows hold still *(recommended)* | Arrows stay as signage; small specks travel through them, spiral into the whirlpool and vanish; reuses the dot machinery | ✓ |
| The arrows themselves march | Each arrow slides along the ring; 36 images moving continuously | |
| A pulse of light chases round | Arrows brighten in sequence like runway lights; cheapest, but a signal more than a current | |

### Whirlpool rotation

| Option | Description | Selected |
|--------|-------------|----------|
| Slow constant clockwise turn *(recommended)* | ~1 revolution every 8–12s on all four, matching the channel | ✓ |
| Slow, quickening when a ship is swept in | Spins up hard for the length of a sweep, then settles | |
| Faster, always | ~1 revolution every 2–3s; unmissable but competes with the ships | |

### The rim during a storm

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — the trade winds never stop *(recommended)* | Specks and whirlpools keep running; the rim is a permanent board feature, not this turn's weather | ✓ |
| No — everything calms but the rain | Rim flow fades out with the dots | |
| Whirlpools keep turning, specks stop | Middle ground | |

**Notes:** Deliberately the opposite rule to the dots — the two layers behave differently in a storm
on purpose.

---

## The rim-sweep warning (WIND-05)

**Checked before asking:** picking a square is one tap that commits immediately (`localPickCell` —
the highlight's own click handler resolves the move; there is no confirm step), and there is no hover
on a phone. Any preview-on-hover design would serve desktop only.

### How the warning is delivered

| Option | Description | Selected |
|--------|-------------|----------|
| Rim squares look different, landing square marked *(recommended)* | Warning treatment on rim highlights plus the drop-off square marked; no extra tap, no hover | ✓ |
| Rim squares just look different | Stops the surprise, but leaves "roughly where it'll come out" unanswered | |
| A confirm step on rim squares only | Impossible to do by accident, but the only square on the board taking two taps | |

### How the landing square is shown

| Option | Description | Selected |
|--------|-------------|----------|
| A ghost of your boat on the landing square *(recommended)* | Faded version of the player's own ship; reuses existing art; two ghosts if two arcs are in range | ✓ |
| Ghost boat plus a dotted trail | Shows the whole arc, but competes with the channel's own arrows and specks | |
| A marker on the landing square | Quieter, but needs the player to work out that the marker means "you, later" | |

### Storm pushes

| Option | Description | Selected |
|--------|-------------|----------|
| No — chosen moves only *(recommended)* | A storm push is meant to happen *to* you; the sweep animation already shows the ride | ✓ |
| Yes — mark the rim when a storm could reach it | Useful, but needs predicting a push before it resolves | |
| Yes, but only after the fact | Ghost appears once the push happens, before the sweep animates | |

---

## The scent line (WIND-04)

### Decorative or tied to the round

| Option | Description | Selected |
|--------|-------------|----------|
| Purely decorative *(recommended)* | Any of the 35 lines, chosen from the round number, no category twice in a row; all 7 categories in even rotation | ✓ |
| The downwind island's smell | Deterministic and doable, but a few categories would dominate | |
| Nudged toward missing recipe ingredients | Characterful, but different players at the same table would smell different things on the same round | |

**Notes:** This closes the open question the todo explicitly reserved for Wyatt.

### Storm rounds

| Option | Description | Selected |
|--------|-------------|----------|
| No — storm rounds keep their own line *(recommended)* | The storm line already carries two directions | ✓ |
| Yes — the storm carries a scent too | More of the library gets used | |
| Only when the storm first arrives | A rare treat rather than a habit | |

### Where the scent sits in the line

| Option | Description | Selected |
|--------|-------------|----------|
| Inside the existing em-dashes *(recommended)* | `— Round 3: wind is blowin' north, wafting clouds of cotton candy —` | ✓ |
| Exactly as originally sketched | Full stop, no em-dashes; visibly breaks the header pattern | |
| The scent on its own beat | A second line after the header; doubles the round announcement | |

**Notes:** Wyatt's original sketch used the full-stop form. He chose the em-dash form knowingly in
discussion, so the difference is not a transcription error.

---

## Claude's Discretion

- The mechanism for the channel specks (element pool, own layer, or path-following)
- The mechanism for whirlpool rotation, given SVG transform animation is ruled out
- Exact fade durations for the storm and direction-change fades, subject to the tuning gate
- How the rim highlight is styled differently — swirl, tint, or both
- How the scent's round-number derivation and no-repeat rule are computed
- Whether the tuning page is deleted at the end of the phase or left uncommitted

## Deferred Ideas

- A player-facing settings menu (surfaced while deciding what to strip from the prototype)
- A whirlpool that spins up when a ship is swept into it
- Warning a player that a storm push could carry them onto the rim
- A dotted trail tracing the sweep arc
- Tying the scent to game state (downwind island, or missing recipe ingredients)
- Keeping the smoothness meter as a permanent diagnostic
