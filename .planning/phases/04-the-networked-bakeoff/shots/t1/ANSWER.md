# Task 1 — the question that has been open since 2026-08-08, answered by measurement

**THE ANSWER: a guest's bake is PLAYED ON THE HOST'S SCREEN, by the host's own hands. It is not
forfeited, and the guest sees nothing at all — not a bench, not a waiting note, not a narration
line.**

Measured 2026-08-23 in one real two-browser Firebase room (`test1` hosting as seat 0, `test2`
joining as seat 1, `?ovens=1`, build `2026-08-23a`), by `4/scripts/crew_bake_probe.mjs`. Raw data in
`result.json`; the screenshots below were opened and read.

## How the baker was identified, without inferring anything

`.bkoCard` draws one icon per recipe step from the bake's own `order`, so the ingredient sequence on
a bench matches **exactly one** seat's `bake.order`. The probe reads both back and matches them.

| | |
|---|---|
| Bench on the HOST's screen (`cardIngs`) | `dairy, vanilla, wheat, spice, cocoa` |
| **Seat 1 — the GUEST's `bake.order`** | **`dairy, vanilla, wheat, spice, cocoa`  ← exact match** |
| Seat 0 — the HOST's own `bake.order` | `dairy, wheat, cocoa, spice, eggs` |
| Seat 2 | `eggs, sugar, spice, wheat, dairy` |
| Seat 3 | `cocoa, dairy, spice, eggs, wheat` |

The match is unique. It is corroborated twice more in the same screenshot:

- The CAPTAINS panel shows **test2 holding cocoa / dairy / spice / vanilla / wheat** — the recipe on
  the card. test1's hold is a different set (it carries an egg).
- Across the attempt, `players[1].bake.attempts` went **0 → 1 with 2 crates locked**, while
  `players[0].bake.attempts` stayed at **0**. The host had not baked at all yet.

So the very first bake of the voyage was **the guest's**, and it was played end to end on the host's
screen: intro card, study, shuffle, five taps, "Bake it!", reveal.

## What each captain saw, at the same instant (`02-first-bench-answerable-*.png`)

| | HOST (`test1`, seat 0) | GUEST (`test2`, seat 1 — the baker) |
|---|---|---|
| Bake-Off card | **VISIBLE, 364×323**, "attempt 1" | **absent** |
| Crates | **5**, all covered, badged 1–5 | **0** |
| Recipe on the card | the GUEST's five steps | — |
| Buttons | "Watch again 🌕1", "Bake it!" | none |
| Hint line | "Tap the crates in recipe order." | — |
| Action panel text | — | **empty** |
| Narration | — | **none** |
| Board | dimmed, centre stage, camera zoomed in | undimmed, full board |

The guest's screen is not merely missing a bench. It is missing **any acknowledgement that their own
bake is happening**. The two screens agree on DAY 1, the wind (`N↑ / E→`), all four captains, their
purses and the active-captain highlight — so this is not a desync. It is one captain's whole turn
drawn on somebody else's glass.

`03-first-verdict-host.png` shows the same card revealing the guest's verdict — crate 1 (dairy)
green, crates 2 and 3 pink — while `03-first-verdict-guest.png` is still a bare board.

## The red-proof, before any absence was believed

The same read, at the same moment, on the same expression: **it reported a bench where one existed**
(host: present, 5 bowls, painted 364×323, hit-tested at its own centre, attributed to a unique seat)
**and reported its absence where there was none** (guest: 0 bowls, no shell). Visibility is the
painted rectangle plus `elementFromPoint` — never `offsetParent`, which is null for every
`position:fixed` element and has condemned a working screen in this project before.

## What this changes for the fix

The plan predicted this from the code (`bakeTurnLive` sets `human = p.strategy==="human"`, true for
a remote human, so `bakeoffPrompt` runs on the host for the guest's seat). **It is now measured, and
the consequence stands: Task 2 must REMOVE a bench from the host's screen as well as add one to the
guest's.** A fix that only adds the guest's branch would leave two captains tapping the same crates.

## One thing observed, NOT measured, and not claimed as a defect

The active-captain highlight in the CAPTAINS panel sat on **Flaky Jack** (a bot) on both screens
while the guest's bake was being played. Whether the ribbon is supposed to follow a baking captain
is a separate question nobody has asked; it is recorded here because it was in the picture, not
because it is known to be wrong.

## Hygiene

The room was deleted; no voyage was driven to an end of voyage, so no permanent `gamelogs` row was
written. Every Chrome and server this probe started was killed before it returned (`pgrep` clean).
