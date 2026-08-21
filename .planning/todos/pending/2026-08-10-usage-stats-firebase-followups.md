---
id: usage-stats-firebase-followups
title: Usage stats follow-ups — verify reads, maybe add rules, allow firebaseio in the Claude environment
status: pending
type: task
severity: medium
area: infrastructure
created: 2026-08-10
source: Wyatt, 2026-08-10, on mobile ("add all these steps and context to backlog for when i get around a computer again")
resolves_phase: null
regression: false
---

## Context — what already shipped and works without any of this

Usage tracking is LIVE as of the 2026-08-10 merges. Every build (`/`, `/v2`, `/v2bakeoff`, `/3`)
fires three anonymous REST pings from the player's own browser (`src/ui/usage.js` in each build):

- `visits/<ts>-<pid>` — one per page boot
- `starts/<ts>-<pid>` — one per NEW voyage (solo / pass&play / net-host; resumes and replays never
  write); the key doubles as the voyage's gid
- `fins/<gid>` — one per completed voyage; **starts minus fins = unfinished games**

The identifier is `pp_id` (the per-browser id the game has always minted, shared across builds) —
deliberately NOT an IP: a page cannot see its own IP without a third-party echo service, and a
per-browser id beats an address that lumps households together and hops with a phone. Pings fire
only on playpastrypirates.com, are fire-and-forget, and swallow every failure.

**playpastrypirates.com/stats.html** (noindexed, robots-disallowed) reads it all back: per-day
unique visitors, boots, starts, finishes, unfinished, builds, captain names — and answers
"besides me" automatically by reading this device's own `pp_id`, with tap-to-toggle chips to mark
other devices (the laptop) as also-you. Counters begin 2026-08-10; earlier days show only finished
games from the long-standing `gamelogs/` node.

Known wrinkle: private/incognito tabs mint a fresh `pp_id` per tab, so private-tab testing shows
up as one-visit strangers under "others".

## Step 1 — the 30-second check that may end this todo (do FIRST)

Open **playpastrypirates.com/stats.html** on anything.

- Numbers appear → the database rules already allow public reads (test-mode rules). **Steps 2 is
  unnecessary — skip it.** Only step 3 remains, and only if wanted.
- A red "Permission denied" box appears → the pings are (probably) writing but reads are locked.
  Do step 2. (If the box names a different error, read it — the page prints the exact failure.)

## Step 2 — add read/write rules for the four nodes (60 seconds, needs the console)

Firebase console → project **pastry-pirates** → **Realtime Database** → **Rules** tab.

**Do NOT replace the existing rules** — `rooms`, `presence`, etc. are load-bearing for
multiplayer. ADD these four entries inside the existing top-level `"rules": { ... }` object:

```json
"visits":   { ".read": true, ".write": true },
"starts":   { ".read": true, ".write": true },
"fins":     { ".read": true, ".write": true },
"gamelogs": { ".read": true, ".write": true }
```

Then **Publish**. (`gamelogs` almost certainly already has `.write`; it may lack `.read`, which
stats.html needs for captain names.)

## Step 3 — let Claude sessions query the database directly (optional, approved 2026-08-10)

Wyatt approved adding the Firebase domain to the Claude Code cloud environment so future sessions
can pull the numbers instead of pointing at stats.html. A session cannot edit its own environment;
this is a claude.ai UI action, and **there is no direct URL** — the docs say so explicitly
("There's no settings page or direct URL for the selector"). The path:

1. Open **claude.ai/code** (works in the mobile app too).
2. In the row **directly above the message box**, tap the **cloud chip showing the environment
   name** (likely "Default").
3. Tap the **settings gear** on the environment.
4. **Network access** → **Custom** → add one line to **Allowed domains**:
   `pastry-pirates-default-rtdb.firebaseio.com`
   — and keep the option that **includes the default Trusted domains**, or GitHub/npm access
   breaks. (Lazier alternative: pick **Full** — any domain, nothing to maintain, less locked-down.)
5. Save. **Takes effect for NEW sessions only.**

## Step 4 — only if rule changes should become Claude's job (probably skip)

Ruled out for now unless rules need changing often: it means minting a **database secret**
(console → Project settings → Service accounts) and pasting it into the environment's
**Environment variables** box. Tradeoff stated 2026-08-10: env vars are not a secrets store —
visible to every session in that environment — and the secret grants full read/write to the whole
database. Revocable in the console at any time. Step 2 being a one-time paste makes this rarely
worth it.

## Where the pieces live

- Pings: `src/ui/usage.js` (and the same file under `v2/`, `v2bakeoff/`, `3/`) — header comment
  documents the record shapes and the guards.
- Dashboard: `stats.html` at repo root — source comment repeats the rules snippet.
- Wiring: each build's `orchestrator.js` (boot → visit, startGame → net start, writeGameLog → fin)
  and `ui/flow.js` (solo + pass&play starts).

---

## MEASURED 2026-08-20 — step 1 is answered, and the answer is "yes, the rules are needed"

Wyatt hit the console error himself on the live site (Safari, `/4`): a red
`401 (Unauthorized)` on `https://pastry-pirates-default-rtdb.firebaseio.com/visits/<ts>-<pid>.json`,
on every page boot. Probed each node directly with curl against the live database:

| node | read | write | |
|---|---|---|---|
| `rooms` | 200 | 200 | multiplayer — fine |
| `gamelogs` | 200 | 200 | the long-standing completed-voyage log — fine |
| `visits` | **401** | **401** | one ping per page boot |
| `starts` | **401** | **401** | one per new voyage |
| `fins` | **401** | **401** | one per completed voyage |

**So the three usage nodes have never recorded anything.** The rules grant `rooms` and `gamelogs`
and nothing else. `stats.html` reads all four, so its usage panels have been empty since the
2026-08-10 merge, and its own header comment (lines 21-26) already names the exact fix.

**Gameplay is unaffected and always was** — `usage.js` is fire-and-forget with every failure
swallowed. The red console line is the browser reporting a failed request; no code change can
suppress that, and suppressing it would be the wrong instinct anyway.

**The fix is not in this repo.** Firebase console -> Realtime Database -> Rules, add alongside the
existing `rooms`/`gamelogs` entries:

```json
"visits": { ".read": true, ".write": true },
"starts": { ".read": true, ".write": true },
"fins":   { ".read": true, ".write": true }
```

Same public posture `rooms` and `gamelogs` already have — worth stating out loud rather than
slipping in, since it is a deliberate no-auth design and not an oversight.

**And a mess I made and cannot clear up.** Probing write access, I PUT a throwaway
`gamelogs/claude-probe = {"probe":1}`. `gamelogs` turns out to be create-only — DELETE and
`PUT null` both return 401 — which is the same property the 02.15 handoff records as "writeGameLog's
entries are permanent and unremovable by anyone, Wyatt included". It is inert (`stats.html:119`
skips any entry with no `names` field) but it is permanent, and I should not have written a probe to
an append-only node. **Probe `rooms`, never `gamelogs`.**

---

## RESOLVED 2026-08-20 — steps 1 and 2 are done and VERIFIED END TO END

Wyatt added the rules from the console the same evening. Measured immediately after, against the
live database:

| check | result |
|---|---|
| `visits` / `starts` / `fins` readable | **200** (were 401) |
| a real page load writes a visit row | **PASS** — `1787280662894-claude-verify-20260820` = `"v4"` |
| create-only refuses a rewrite of that key | **PASS** — HTTP 401, value unchanged |
| `stats.html` renders without the read-error banner | **PASS** — table, captains and devices panels all populate |

**He took the stricter shape, not the blanket one.** The three new nodes use
`"$id": {".write": "!data.exists()"}` — the same create-only pattern `gamelogs` and `feedback`
already had — rather than `".write": true`. Checked before recommending it: `usage.js`'s `put()`
takes `keepalive` as its third argument, not an overwrite flag, and every key is a unique
`<ts>-<pid>`, so nothing ever needs to rewrite a row. The upshot is that nobody can wipe or tamper
with the stats, only add to them — proven by the 401 above.

**His pasted JSON did not parse** — a missing comma after the `presence` block. Worth remembering
that rules are pasted by hand into a console with no linter: parse the JSON before handing it over.

**One row in `visits` is mine**, keyed `…-claude-verify-20260820`, written deliberately to prove the
pipeline and labelled so it cannot be mistaken for a player. It is permanent by the same create-only
rule. `stats.html`'s device chips can mark it as "also you" to keep it out of the "others" count.

**Counters therefore begin 2026-08-20, not 2026-08-10** — the ten days in between recorded nothing,
because the rules were never added. Nothing was lost that was ever captured; it simply never was.

**Steps 3 and 4 remain open and optional** (letting a session query the database directly; making
rule changes Claude's job). Neither is needed now that reads are public — this session queried
everything above with plain `curl`.
