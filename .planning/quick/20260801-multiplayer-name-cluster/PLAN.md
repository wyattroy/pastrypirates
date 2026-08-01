---
quick_id: 260801-omv
slug: multiplayer-name-cluster
date: 2026-08-01
branch: integration/v1.3-phases-18-21-22
source_todo: .planning/todos/pending/2026-08-01-multiplayer-name-cluster.md
---

# Multiplayer name cluster — three bugs

Fix the two genuine name-correctness bugs Wyatt hit in two-window multiplayer. All three reports
were reproduced first in a real two-browser headless session (`docs/DRIVING-THE-GAME.md` §8a),
which corrected the todo's diagnosis on two of the three.

## What the measurement changed

The todo led with **(B) "back from the name modal dumps you home — MY REGRESSION"** and asked to fix
it first because it "creates the conditions for (C)". **That is not what happens.** Measured on all
three dismissal routes (✕, Escape, backdrop) from a fresh boot:

| Step | lobby | lobbyRoom | stepChoose | stepJoin | room |
|---|---|---|---|---|---|
| clicked Join | flex | none | block | none | null |
| clicked ✕ | flex | none | **block** | none | null |
| clicked Join again | flex | none | block | none | null |
| typed + confirmed | flex | none | none | **block** | null |

`cancelName()` → `showHome()` lands on `stepChoose` — which is the screen the modal opened over, so
the player is exactly where they started and can re-enter immediately. **Bug B as written does not
reproduce and needs no code change.**

The real "dumps you home" is **`#btnRoomBack`** — the room screen's "← back", wired to
`abandonRoom()` (`src/orchestrator.js:1374`). It is labelled like a step-back but it leaves the room.
That is a UX/labelling question for Wyatt, not a correctness bug, so it is **out of scope here** and
raised back to him rather than silently redesigned.

Likewise **(A) is not a race.** `netClaimSeat` is a genuine Firebase `transaction()`
(`src/net/readers.js:44-46`), so the seat map the updater sees is authoritative.

## The two real bugs

### A — every player is offered the same default name, and it counts as "typed"

`openNameModal()` prefills the input with `requireName()`, which for a player with no saved name
returns `unusedDefaultName(null, 0)` — computed against a **null** seat map, so it is the identical
string ("Davy Scones") for everybody. A player who accepts the prefill without typing sends a
**truthy** `typedName`, so `typedName||unusedDefaultName(s,i)` at `orchestrator.js:1242` never
consults the live seat map. The collision-safe helper is correct and simply never runs.

Measured: host prefill `"Davy Scones"`, guest prefill `"Davy Scones"`, resulting table
`[Davy Scones — you, Davy Scones, Dough Hook — bot, Flaky Jack — bot]`.

**Fix:** distinguish a name the player *chose* from a default they were merely *shown*. An
unchosen name is passed through as blank so the existing collision-safe fallback does its job
against the live transaction seat map, and is not persisted to `pp_lastName`.

### C — rejoining with a new name keeps the old one

`joinRoom` returns early when a seat already carries `appState.myId` (`orchestrator.js:1233`),
reusing the record verbatim and never writing the name just typed. The orphaned seat is what makes
this reachable: `abandonRoom()` calls `netLeaveRoom()`, which only detaches watchers
(`src/net/index.js:109-111`) — the seat record is never released.

Measured: guest joins as ALPHA → clicks room "← back" → host still shows ALPHA at seat 1 → guest
rejoins typing BRAVO → `pp_lastName` becomes BRAVO but **both** clients still show ALPHA.

**Fix:** write the resolved name on the rejoin path too, inside the same transaction, **only while
`r.status === "lobby"`**. A rejoin into a game already playing must keep the seat's existing name —
renaming mid-voyage would desync the roster against narration already broadcast.

## Tasks

1. `src/ui/lobby.js` — track whether the resolved name was chosen or auto-offered; expose it; stop
   persisting an auto default.
2. `src/orchestrator.js` — one seat-claim transaction that handles both claim and rejoin, resolving
   an unchosen name against the live seat map, guarded on lobby status.
3. Verify in a two-browser headless session: no duplicate defaults; rename-on-rejoin lands on both
   clients; a chosen name is still honoured verbatim.
4. `npm test` stays green (23/23).

## Out of scope (raised to Wyatt)

- `#btnRoomBack` labelled "← back" but abandoning the room.
- Freeing a guest's seat on leave — unsafe to change blind: mid-game reconnect depends on the seat
  persisting by `pp_id`.
