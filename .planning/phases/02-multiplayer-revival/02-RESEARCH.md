# Phase 2: Multiplayer Revival - Research

**Researched:** 2026-08-19
**Domain:** Reviving an existing, unexecuted multiplayer net layer in `4/`, and building the headless
test rig needed to shake it out before Wyatt's one real voyage on his phone
**Confidence:** HIGH (code facts — all spot-checked against today's tree) / MEDIUM (test-rig mechanics —
reasoned from `docs/DRIVING-THE-GAME.md` plus direct verification that its DOM selectors survive in
`4/`, but the two-Chrome CDP rig itself has never been run end-to-end in this repo)

**Directive from Wyatt, relayed by the orchestrator:** research the test rig, not the code — CONTEXT.md
already nails the code with file:line citations. This document is weighted accordingly: most of the
effort below is the "how do I actually drive a host and a guest at once, headlessly, against `/4`"
question. The code-fact section is a spot-check, not a re-derivation.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01: The Host/Join cards ship straight to `/4`. No flag, no separate preview deployment, no
  gating machinery.** `/4` is `noindex,nofollow` + `Disallow: /4/`, Wyatt is the only player, and two
  earlier gating proposals were both rejected as over-engineering.
- **D-02: No new bake-off gating code is written in this phase.** The test voyage runs with the
  existing `?bakeoff=0` switch. Known and accepted: with the bake-off ON, a networked game that
  reaches the ovens today hands the guest's bake to the host's screen — documented, not fixed here.
- **D-03: No copy anywhere explaining that a crew game ends differently.** Say nothing.
- **D-04: There is no ⏩ in a networked game.** Existing ruling (2026-08-13), reaching its third mode.
  Add the networked term beside the existing pass-and-play term in `4/src/ui/stage.js:426`'s visibility
  condition — do not invent a parallel mechanism. **`appState.ff` also shortens `sleep()` on the host**
  (`4/src/orchestrator.js:131`, `4/src/ui/flow.js:79`), pacing every guest — verify the flag cannot be
  armed in a networked game, not merely that the chip is invisible.
- **D-05: Verify, do not change, the tab-hide gate.** `4/src/main.js:157-163` writes the shared
  `paused` node and is safe today only because it sits behind `ui.soloBotGame()`
  (`4/src/ui/util.js:1740`). Satisfied by proving the gate holds, not by editing it.
- **D-06: Chat gets a button in the top ribbon beside ☰**, opening a slide-up sheet with the log and
  text box, with an unread dot. Ship speech bubbles stay off.
- **D-07: An incoming message flashes briefly under the ribbon and fades** — must obey hold-the-sea
  like every other floating box (consistency sweep required; state which surfaces were checked).
  Placement is under the ribbon, not down at the ships.
- **D-08: Four cards in the live game's order** — Play Solo, Pass & Play, Host a Crew, Join a Crew —
  wrapping 2×2 on a phone. Card CSS and click wiring already survive in `4/`, guarded.
- **D-09: Claude shakes it out headless first; Wyatt then plays a real voyage on his phone, and THAT
  is the pass.** Nothing in this phase closes on headless evidence alone.
- **D-10: Guest reconnect is a pass/fail criterion in this phase (criterion 5), not a note.** On paper
  it already works (`pp4_sess` read synchronously at `4/src/orchestrator.js:1730`) but has never
  executed in `4/` — a code read, not a measurement.

### Claude's Discretion

- Restore `#fbnote` and `#busynote` with the cards (both guarded readers already exist; CSS intact).
- The four latent net faults (FIX-03 and neighbours) — mechanism is Claude's.
- Where the finding document lives and what shape it takes (suggested:
  `.planning/phases/02-multiplayer-revival/02-FINDINGS.md`).
- Whether the `v2.1 + bake-off — test ruleset` byline changes when the row becomes four cards. Do
  **not** restore the About link — `about.html` 404s at `/4` until Phase 6.

### Deferred Ideas (OUT OF SCOPE)

- **To Phase 4:** the networked bake-off; "is cheating a real risk among friends?" (bake privacy).
- **To Phase 6:** cheat flags `?ovens=1`/`?windhud=1`; the About link on the welcome screen.
- **To a later phase:** chat's finished/prettier form — D-06 is deliberately the smallest honest
  version.
- **Reviewed, not folded:** `2026-07-31-final-round-narration-never-reaches-guests.md` (the one-lap
  final round doesn't exist in the shipped ruleset); `every-client-can-see-every-recipe.md` (Phase 4);
  `pause-cannot-beat-end-of-turn-expiry.md` (largely moot — clock defaults OFF).
- **Explicitly not to be researched further, per the task brief:** any bake-off-over-the-wire work;
  any flag/preview/gating scheme for the cards; whether ⏩ should exist in multiplayer (settled); the
  tab-hide gate's design (verify only); crew-game-ends-differently copy; cheat flags; trade pacing.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MP-01 | Host a networked game from the promoted build, share a room code | W1 (restore Firebase tags + cards) is a markup/wiring change already guarded; verified `choiceHost`/`choiceJoin` are the only missing pieces (see Code Facts §1). Headless-provable via `rooms/<C>` node inspection (see Validation Architecture). |
| MP-02 | Second player joins by code, claims a seat, named without collision | Same lobby code as MP-01; `unusedDefaultName()`-style collision handling survives unchanged in `4/src/orchestrator.js`. Headless-provable. |
| MP-03 | Guest sees host's board/ships/narration/prompts in sync for a full voyage | The hard part is the recipe-draft crash (FIX-03) blocking this outright. Test rig §3-§5 below give the exact driving technique; Validation Architecture gives the sync assertion. Partially phone-only (D-09; "feels in sync"). |
| MP-10 | Tab hide/background does not pause/resume shared clock for everyone | D-05: verify only. Test rig gives a headless way to simulate `document.hidden` and assert the `paused` Firebase node is untouched. |
| MP-11 | Fast-forward cannot let one player skip narration others are watching | D-04: one visibility term to add, plus proof the flag cannot be armed. See Common Pitfalls §FF-1 for the design gap this uncovers. |
| MP-12 | Host reload mid-voyage resumes from decision log, game intact | `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` already live at `4/src/ui/util.js:2028-2033` and `resumeHostGame` at `4/src/orchestrator.js:1690` — this is the single most headlessly-provable criterion in the phase (see Validation Architecture). |
| FIX-03 | Sparse-draft crash, unguarded `.val()`, unescaped host HTML | All three sites confirmed present at drifted line numbers (Code Facts §2). Fixes are small and local; none touch the engine tier. |

</phase_requirements>

## Summary

The code side of this phase is close to done before it starts: `4/src/net/` is byte-identical to the
live net layer, ~45 networking functions already exist (several upgraded) in `4/src/orchestrator.js`,
and the lobby markup is intact except for two missing welcome cards. CONTEXT.md's file:line citations
for all of this were spot-checked against today's tree and hold, modulo small (4–16 line) drift typical
of a fast-moving branch — none of the drift changes the finding.

**The real unknown, and the one this document spends its effort on, is the test rig**: how to drive a
*host* and a *guest* simultaneously, headlessly, against `/4`, without a second human. The good news is
concrete: `docs/DRIVING-THE-GAME.md`'s DOM-level driving technique — the flip-coin trap, the sail-cell
geometry inversion, the `#actionPanel .apBtn` autoplay loop, the guest-lockstep read-from-`events`-not-
`game.players` rule — was **verified against `4/`'s actual source** in this research pass, and every
selector and constant it depends on (`.sailCell`, `#flipCoinWrap`, `#actionPanel .apBtn`,
`SAIL_HL_SCALE=0.9`) is unchanged. The one thing that is genuinely broken for `4/` is narrower than
CONTEXT.md's warning suggested: **only the dynamic `import()` paths** in that doc are root-relative and
resolve into the wrong tree — the DOM-driving techniques themselves need zero changes.

The second finding worth flagging early: **none of the five named multiplayer test scripts
(`host_guest_parity_check.js`, `net_contract_check.js`, `net_registry_test.js`, `dlog_replay_test.js`,
`real_game_test.js`) are usable against `4/` as-is, and none should be adapted in this phase.** They are
all hardcoded to root `src/` paths, and porting/writing formal gates is explicitly Phase 3's job per
CONTEXT.md's own phase boundary ("Any gate, corpus or test-harness work — Phase 3"). Phase 2's headless
shakeout has to be done with ad-hoc CDP-driven browser probes, not with `npm test`-style gates. This
also answers the "avoid leaving junk rooms" question: there is no automated teardown beyond
`abandonRoom()` (host-only, lobby-only) — a probe must capture the room code and delete it itself.

**Primary recommendation:** build the headless shakeout as a pair of independent headless Chrome
processes over CDP (own `--user-data-dir`, own `--remote-debugging-port` each — this sidesteps the
shared-`localStorage` `pp_id` problem entirely, more cleanly than DRIVING-THE-GAME.md's same-browser
workaround), serve from the repo root so `4/`'s `../assets/` paths resolve, and re-path every dynamic
`import()` to `/4/src/...`. Everything else in that document — selectors, the autoplay driver, the
lockstep-read rule, the injection techniques — applies to `4/` unmodified.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Lobby UI (welcome cards, room/join screens) | Browser / Client | — | Pure markup + `flow.js` wiring; no server exists |
| Room state (`rooms/<C>/*`) | Database / Storage (Firebase RTDB) | Browser / Client (host-authoritative) | RTDB is transport only; the host's browser is the sole compute authority — there is no backend server in this game |
| Turn resolution / game engine | Browser / Client (host's browser) | — | `runLiveNet()` is a client-side loop; guests never simulate, they rebuild from the `ev` feed |
| Chat | Browser / Client | Database / Storage | `sendChat`/`watchChat` write/read RTDB directly; UI is client-rendered |
| Tab-hide pause gate (MP-10) | Browser / Client | Database / Storage | `visibilitychange` listener is client-side; it writes the shared `paused` node other clients render |
| Fast-forward gate (MP-11) | Browser / Client | — | Pure client-side pacing flag (`appState.ff`); never reaches the engine or the wire directly, but paces `sleep()` on the host, which indirectly paces every guest's broadcast cadence |
| Host reload / resume (MP-12) | Browser / Client | Database / Storage (decision log read) | `resumeHostGame()` runs entirely in the host's browser; RTDB only supplies the recorded `dlog` to replay against |
| Guest reconnect (D-10, criterion 5) | Browser / Client (localStorage) | Database / Storage (room-exists check) | The decisive read (`pp4_sess`) is synchronous and local; the async RTDB read only confirms the room still exists |
| Automated test harness (this phase's own tooling) | Dev tooling — outside all game tiers | — | Two headless Chrome processes over CDP, driven from Node; not shipped, not part of the app |

---

## Standard Stack

This phase installs **no new packages**. The Firebase SDK restoration is two `<script>` tags pointing
at Google's CDN, already used verbatim in root `index.html` — not an npm dependency.

### Core (existing, being re-enabled — not newly installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `firebase-app-compat.js` | 12.15.0 | Firebase SDK bootstrap | `[VERIFIED: repo]` — exact CDN URL already live at `index.html:30`, restoring the identical two lines into `4/index.html` |
| `firebase-database-compat.js` | 12.15.0 | Realtime Database client | `[VERIFIED: repo]` — same as above, `index.html:31` |

**Installation:** none — copy two `<script src="https://www.gstatic.com/firebasejs/12.15.0/firebase-*-compat.js">` lines from root `index.html:30-31` into `4/index.html` at the location marked by the removal comment (`4/index.html:26-28`).

### Test-rig tooling (dev-only, not shipped)

| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Headless Chrome over raw CDP (WebSocket) | Drive host + guest browsers | `[CITED: docs/DRIVING-THE-GAME.md §8a]` — the project's own documented, working pattern; explicitly preferred over the MCP browser tool for anything needing real animation/timer fidelity, and it never takes over Wyatt's screen |
| Node 22+ global `WebSocket` | CDP client, ~15 lines, no dependency | `[CITED: docs/DRIVING-THE-GAME.md §8a]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two independent headless Chrome processes (own `--user-data-dir` each) | One browser, two tabs, with a manual `pp_id` override (DRIVING-THE-GAME.md §5c's documented technique) | The manual override works but is a workaround for a problem two processes don't have at all — tabs share `localStorage`, processes don't. Two processes is simpler to reason about and matches DRIVING-THE-GAME.md's own stronger recommendation ("use a different BROWSER, not a second tab"). |
| Raw CDP over WebSocket | Playwright | `docs/HARD-WON-LESSONS.md` §4 notes Playwright is not installed in this repo's environment and explicitly says not to `playwright install`. Raw CDP needs nothing installed and is the pattern this project has already proven out. |
| Formal ported test scripts (`4/scripts/host_guest_parity_check.js` etc.) | Ad-hoc CDP probes | Explicitly **not** this phase's job — `02-CONTEXT.md`'s own scope boundary reserves "any gate, corpus or test-harness work" for Phase 3. Building formal gates here would be scope creep into Phase 3's territory, not extra safety. |

## Package Legitimacy Audit

**Not applicable.** This phase installs no npm/PyPI/crates packages. The only "dependency" restored is
two `<script>` tags loading Firebase's SDK from `www.gstatic.com` — a CDN reference already present
verbatim in root `index.html`, not resolved through any package manager. There is nothing to run
`gsd-tools query package-legitimacy check` against.

---

## The Test Rig — how to drive a host AND a guest headlessly against `/4`

This is the primary content of this research pass, per the developer's explicit instruction.

### 1. Two Chrome processes, not two tabs — and why this sidesteps `pp_id` entirely

`docs/DRIVING-THE-GAME.md` §5c's documented fix for shared `localStorage` is a manual override inside
a single browser:
```js
localStorage.clear();
localStorage.setItem('pp_id', 'claude-guest-' + Math.floor(Math.random()*1e6));
location.reload();
```
That works, but it is solving a problem that **two separate headless Chrome processes don't have at
all** — each gets its own `--user-data-dir`, hence its own `localStorage`, `IndexedDB`, and cookie jar,
with zero manual bookkeeping. This is also the *stronger* of the two techniques the doc itself
recommends ("Use a different BROWSER, not a second tab. Different browsers have separate storage.").
Launch host and guest as two independent processes:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --remote-debugging-port=9401 \
  --user-data-dir=/tmp/chrome-pp4-host --no-first-run about:blank &

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --remote-debugging-port=9402 \
  --user-data-dir=/tmp/chrome-pp4-guest --no-first-run about:blank &

curl -s http://127.0.0.1:9401/json/version   # confirm host is up
curl -s http://127.0.0.1:9402/json/version   # confirm guest is up
```

Use ports that have never been used earlier in the session — see §2. `--disable-gpu` is correct here
because this rig is proving *sequencing and correctness*, not measuring animation cost (per
`docs/DRIVING-THE-GAME.md` §8a's own distinction — drop `--disable-gpu` only if a later cost
measurement is specifically needed, which this shakeout does not require).

**Kill both before replying**, per `CLAUDE.md` §3 and the incident it was written after (two abandoned
probes at 21% CPU each, on the machine being tested):

```bash
pkill -9 -f "[r]emote-debugging-port"   # bracket trick — matches children, not this command itself
```

### 2. Serving `4/` correctly

Serve from the **repo root**, not from inside `4/`, because `4/`'s asset paths are `../assets/...`
(`ASSET_BASE="../assets/"`, `4/src/shared/index.js:24`) — they resolve correctly only when the URL path
is `/4/index.html` under a server rooted at the repo root:

```bash
python3 -m http.server 8471 --directory /Users/wyattroy/Documents/Projects/pastrypirates
```

Target URL for both browsers: `http://localhost:8471/4/index.html`. **Use a port neither browser (nor
any earlier probe this session) has loaded before** — Chrome caches ES modules per URL, and this has
produced phantom "the fix didn't work" reports at least three times in this project's history
(`docs/DRIVING-THE-GAME.md` §1, `docs/HARD-WON-LESSONS.md` §3).

### 3. The DRIVING-THE-GAME.md import-path problem — narrower than it looked, and here is the exact fix

CONTEXT.md flags this as "a real cost inside this phase, not free," and it is real — but verification
in this research pass narrows it to exactly one class of line. Every **dynamic `import()`** in
`docs/DRIVING-THE-GAME.md` is root-relative:

```js
// AS WRITTEN IN THE DOC (resolves into the WRONG tree — root src/, not 4/src/):
const st = (await import('/src/state/index.js')).appState;
const board = await import('/src/ui/board.js');
```

The `4/`-correct form — verified directly against `4/src/state/index.js` (exists, is a real ESM
module) and `4/src/ui/board.js` (exists) — is simply the `/4` prefix:

```js
// THE 4/-CORRECT FORM — use this for the whole duration of this phase:
const st = (await import('/4/src/state/index.js')).appState;
const board = await import('/4/src/ui/board.js');
```

This matches the precedent already recorded for the *previous* prototype tree in
`docs/HARD-WON-LESSONS.md` §4 (`/v2/src/state/index.js`) — `4/` is simply the current name for that
same pattern.

**Everything else in the doc needs zero changes**, confirmed by direct grep against `4/`'s source in
this research pass:

| DRIVING-THE-GAME.md technique | Depends on | Verified present, unchanged, in `4/` |
|---|---|---|
| §4a flip-coin trap | `#flipCoinWrap`, `.active` class | `4/src/ui/stage.js:675-709`, `4/index.html:2108` |
| §4b never-click-back filter | `#actionPanel .apBtn`, back-text regex | `4/src/ui/stage.js:763-768`, `4/src/ui/flow.js:250` |
| §4c sail-cell geometry inversion | `.sailCell` class, `SAIL_HL_SCALE` | `4/src/ui/flow.js:419,471,475` — **`SAIL_HL_SCALE=0.9`, same value** |
| §4d battle buttons | `.btlBtn` | `4/src/ui/flow.js:2292` |
| §5b autoplay driver | all of the above, plus `appState.game`, `st.mySeat` | Same API surface — `4/src/state/index.js` is the same single-mutable-object pattern |
| §5c guest lockstep rule (read `events[last].state`, never `game.players[]`) | `appState.game.events`, event `.state` snapshots | Guest-rebuild logic in `4/src/orchestrator.js` is unchanged/upgraded from v1 (Code Facts §2) — the same staleness trap applies |
| §5e state injection (`me.ing=[...me.recipe]`, `cfg.storm=1`) | `appState.game`, `Game` engine surface | Same engine API; `4/src/engine/index.js` confirmed RNG-clean and unchanged in shape (MULTIPLAYER-GAP.md Part 4) |
| §6 `window.__pp_app_state_debug()` | global debug hook | Present — `4/src/main.js` (same pattern as root `src/main.js`) |
| §8a CDP cost-measurement caveats | N/A — general Chrome behaviour | Applies unchanged; not specific to any tree |

**Recommendation for the plan:** do not edit `docs/DRIVING-THE-GAME.md` itself in this phase — that is
explicitly DOC-06 / Phase 9's job, and editing it now would either conflict with or duplicate that
later work. Apply the `/4` prefix ad hoc, in the probe scripts this phase writes, for the duration of
this phase only.

### 4. Element IDs — confirmed present today, exactly where the driving doc expects them

Direct grep against `4/index.html` in this research pass:

| Element | Present in `4/` today | Note |
|---|---|---|
| `choiceSolo`, `choicePassPlay` | ✅ (`:1834`, `:1837`) | |
| `choiceHost`, `choiceJoin` | ❌ **absent from markup** | `flow.js:2391`'s `$("choiceHost")` currently resolves to `null` — restoring the two `<button>` elements is what makes this phase's own W1 work land; confirms CONTEXT.md exactly |
| `nameModalInput`, `btnNameConfirm` | ✅ (`:1897`, `:1898`) | Same IDs as root — §3's name-confirm snippet needs no changes |
| `joinCode`, `joinName`, `btnJoin` | ✅ (`:1861`, `:1863`, `:1864`) | |
| `roomCode`, `seatList` | ✅ (`:1916`, `:1927`) | |
| `flipCoinWrap`, `statsWrap` | ✅ (`:2108`, `:2141`) | |
| `fbnote`, `busynote` | ❌ **absent from markup** | Guarded readers exist (`4/src/orchestrator.js:1785`, `:745`) but nothing to show today — Claude's Discretion item, restore alongside the cards |

**Conclusion: once the two Firebase `<script>` tags and the four welcome cards (D-08) land, every
element ID `docs/DRIVING-THE-GAME.md` names is already exactly where it expects it.** No selector
rewrite is needed anywhere in the driving technique — only the import-path prefix from §3.

### 5. What "in sync" actually means on a guest — and it applies unchanged

`docs/DRIVING-THE-GAME.md` §5c's central warning is that a guest does not simulate the game; it renders
a broadcast snapshot, so `appState.game.players[].pos/.ing` is a stale render shell and the *only*
trustworthy read is the most recent event's `.state`:

```js
const evs = appState.game.events;
const snap = [...evs].reverse().find(e => e.state);
snap.state.map(s => s.pos.join(','));   // what is ACTUALLY on screen
```

This is unchanged in `4/` — confirmed by the fact that `4/src/orchestrator.js` carries the *same*
guest-rebuild architecture as v1 (never simulate, rebuild from the `ev` feed — MULTIPLAYER-GAP.md
Part 1b/2b), and several of the guest-rendering functions were **upgraded**, not replaced, while the
tags were off (`watchPrompt` gained the greyed-button-with-a-reason rendering,
`4/src/orchestrator.js:1262-1273`). Use this table, unmodified, as the assertion basis for MP-03:

| Field | Trustworthy on | Meaning |
|---|---|---|
| `turnOrder` | both sides | must be identical |
| `game.events.length` | both sides | broadcast frontier — guest should track host |
| `timerOff` / `shotClockPaused` | both sides | host's clock state must propagate |
| `events[last].state[].pos` | both sides | the rendered board — use this, never `game.players` |
| `game.players[].pos`/`.ing`/`round` | **host only** | stale on guest — never compare across clients |

### 6. Catching a throw that never reaches the console

`docs/HARD-WON-LESSONS.md` §1b documents a real prior bug class in this exact turn chain: a throw
anywhere in `runLiveNet()`'s await chain rejects silently — `Runtime.exceptionThrown` over CDP reports
**zero** page errors even while the game is fully dead. FIX-03's sparse-draft crash (`.forEach` on an
object) is precisely this shape. **The shakeout must not rely on CDP's page-error stream alone** — wrap
the call under test and print the rejection:

```js
orchestrator.watchRecipes().then(
  v => window.__probe = 'resolved:' + v,
  e => window.__probe = 'REJECTED: ' + (e && e.stack || e)
);
```

`4/src/main.js` already has the belt described in that same lesson —
`runLiveNet().catch(...)`/`unhandledrejection`/`error` listeners feeding `voyageAground()` — so a real
crash during the shakeout should also be visible as an on-screen stamped error box, not just a frozen
panel. Confirm that box appears (or confirm the specific fault the box would have caught, if the fix
under test prevents it from firing) as a secondary signal.

### 7. Firebase writes go to the SAME live production database — clean up your own rooms

`4/src/net/index.js:74-79` confirms `4/` restores the **same** `databaseURL:
"https://pastry-pirates-default-rtdb.firebaseio.com"` root uses, under the same `rooms/<CODE>`
namespace — by design (D-01, no isolation scheme). Room codes are 4 characters from a 23-letter
alphabet (`genCode`, `4/src/ui/util.js:1973`), so repeated automated runs are not colliding with real
play, but **they are writing real nodes to the real database with no automatic expiry.**

**There is no automated teardown beyond `abandonRoom()`** (confirmed by reading it,
`4/src/orchestrator.js:1366-1383`) — and it only deletes if the caller is the host **and** the room is
still in the lobby (never once a voyage has started, "because that would strand everyone else at the
table"). A shakeout probe that crashes mid-voyage — which, given FIX-03, is the expected first-run
outcome — leaves an orphaned `rooms/<CODE>` node behind with no code path that ever removes it.

**Recommendation:** every headless shakeout run must capture its own room code and remove it itself,
in a `finally`, regardless of pass/fail:

```js
let roomCode;
try {
  // ...drive the host/guest voyage, roomCode = appState.room once created...
} finally {
  if (roomCode) await db.ref('rooms/' + roomCode).remove();
}
```

This is a plain RTDB write, not a listener attach/detach, so it is **not** restricted to
`4/src/net/registry.js`'s "only file allowed to call `.on()`/`.off()`" rule — that rule governs
listeners, not one-off cleanup writes. Do not build anything more elaborate than this; a security-rule-
based expiry or a `?testroom=1` marking scheme would be exactly the kind of isolation/gating machinery
D-01 already rejected twice for the shipping cards, and the same reasoning applies to test
infrastructure.

### 8. Which existing scripts are and are not usable — direct verification

| Script | Points at | Usable against `4/` as-is? | Verdict |
|---|---|---|---|
| `scripts/host_guest_parity_check.js` | `src/ui/flow.js`, `src/orchestrator.js` (repo root, hardcoded `FLOW_REL`/`ORCH_REL`) | **No** | Static source-scan gate, not a browser driver. Its assertions (one sail-highlight builder, one rim-sweep stepper, prompt-class parity) are meaningful for `4/` in principle, but porting it is formal-gate work reserved for Phase 3 (TEST-06). Do not port in Phase 2. |
| `scripts/net_contract_check.js` | `SRC_DIR = ROOT/src` (hardcoded) | **No** | Same reasoning — Phase 3's TEST-04. `4/src/net/` being byte-identical means this would likely pass immediately if pointed at `4/`, but that is exactly why porting it belongs to the phase that owns making `npm test` cover `4/` at all, not this one. |
| `scripts/net_registry_test.js` | `import "../src/net/registry.js"` (v1 path, pure unit test, no DOM) | **No** | `4/src/net/registry.js` is byte-identical to the file this test targets, so its assertions would hold unchanged — but it is still Phase 3 scope (TEST-04/05). |
| `scripts/dlog_replay_test.js` | `import "../src/ui/util.js"` (v1 path) for `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` | **No** | `4/src/ui/util.js:2028-2033` already carries the equivalent function and constant, confirmed present — again, Phase 3 scope, not Phase 2's. |
| `scripts/real_game_test.js` | `scripts/lib/load_engine.js` → root `src/engine/index.js` | **No — and not actually about multiplayer at all** | This is a battle-mechanic win-rate statistics harness, unrelated to networking. Listed in the task brief among the "MP test harness" scripts, but it isn't one — flagging this so the planner doesn't spend time on it. |

**Net finding: none of the five scripts should be touched in this phase.** All formal-gate porting is
Phase 3's job by CONTEXT.md's own stated boundary. Phase 2's headless verification is entirely ad-hoc
CDP-driven browser probing, per §1-§7 above — no `npm test`-style artifact should be produced by this
phase's shakeout work.

---

## Architecture Patterns

### Recommended Project Structure for the shakeout probes

```
.planning/phases/02-multiplayer-revival/
├── 02-RESEARCH.md          # this file
├── 02-PLAN.md / 02-0N-PLAN.md
└── 02-FINDINGS.md          # Claude's Discretion — the "what actually broke" writeup ROADMAP calls for
```

Probe scripts themselves are throwaway — write them to the session scratchpad
(`/private/tmp/claude-501/.../scratchpad/`), not committed to the repo, per the project convention that
scaffolding used only to verify a fix "cannot ship" (`docs/DRIVING-THE-GAME.md` §5e's storm-injection
precedent makes the same point about live mutations vs. shipped code).

### Pattern 1: Two-process CDP rig, driven from one Node script
**What:** A single Node script that launches both Chrome processes, connects two independent CDP
WebSocket clients, and drives host and guest from the same control flow (so assertions comparing the
two sides' state are trivial — both readings are in the same process, no cross-process coordination
needed).
**When to use:** For every headless shakeout pass in this phase (MP-01 through MP-03, MP-10 through
MP-12, criterion 5).
**Example:**
```js
// Source: docs/DRIVING-THE-GAME.md §8a, adapted to two simultaneous targets
async function connectCDP(port) {
  const tgt = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {method:"PUT"})).json();
  const ws = new WebSocket(tgt.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({id:i,method,params})); });
  const evalJS = async expr => (await send("Runtime.evaluate", {expression:expr, returnByValue:true})).result?.result?.value;
  await send("Page.enable"); await send("Runtime.enable");
  return { send, evalJS };
}
const host = await connectCDP(9401);
const guest = await connectCDP(9402);
```

### Pattern 2: Assert lockstep via the event-state table, never `game.players`
**What:** Comparing host and guest state must read `events[last].state`, never `game.players[]`, on
the guest side. See §5 above for the full table.
**When to use:** Any MP-03 sync assertion.

### Anti-Patterns to Avoid
- **Reading `game.players[].pos` on a guest to prove sync.** It is a stale render shell — will report
  drift that does not exist, or worse, a false all-clear (`docs/DRIVING-THE-GAME.md` §5c).
- **Trusting an empty CDP `Runtime.exceptionThrown` stream as proof nothing crashed.** A throw inside
  the awaited turn chain is a silently rejected promise, not a page error (`docs/HARD-WON-LESSONS.md` §1b).
- **Building a formal ported gate script in this phase.** Reserved for Phase 3 — see §8 above.
- **Adding any kind of test-room marker/expiry/isolation scheme to the live Firebase database.** D-01
  already rejected gating machinery twice for the shipping feature; the same call applies to test
  infrastructure. Just delete what you created.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Driving a browser with real animation/timer fidelity | The MCP browser tool | Headless Chrome over raw CDP (WebSocket), per `docs/DRIVING-THE-GAME.md` §8a | The MCP browser commonly opens hidden tabs, which throttles `rAF`/timers and corrupts layout readings (§8b) — already diagnosed as a repeat source of phantom bugs in this project |
| A CDP client library | Playwright / puppeteer | The ~15-line raw-WebSocket CDP client already documented and working in this repo | `docs/HARD-WON-LESSONS.md` §4: Playwright is not installed in this environment, and the instruction is explicitly not to install it |
| Room cleanup after a test run | A Firebase security rule for test-room expiry, or a `?testroom=1` marker scheme | `db.ref('rooms/'+code).remove()` in a `finally` | No isolation scheme exists or should exist (D-01); a plain removal write is not gated by `registry.js`'s listener-only rule |
| Formal multiplayer contract/parity gates for `4/` | Porting `host_guest_parity_check.js` / `net_contract_check.js` / etc. into `4/scripts/` this phase | Ad-hoc CDP probes for this phase only | Explicitly Phase 3's job (TEST-04/06); CONTEXT.md's own scope boundary |
| Two-tab same-origin multiplayer testing | The manual `pp_id` override trick | Two independent headless Chrome processes, each with its own `--user-data-dir` | Cleaner, matches the doc's own stronger recommendation, and needs zero bookkeeping |

**Key insight:** almost everything this phase needs for its test rig already exists, documented and
proven, in `docs/DRIVING-THE-GAME.md` and `docs/HARD-WON-LESSONS.md`. The work is not inventing new
tooling — it is re-pathing five characters (`/4` prefix) on a handful of `import()` calls and choosing
the two-process form of a technique the doc already recommends.

---

## Common Pitfalls

### Pitfall 1: Believing the driving doc's import paths are broken everywhere
**What goes wrong:** Treating DOC-06's "import paths are root-relative" warning as blocking the whole
driving technique, and either avoiding headless verification or re-deriving the DOM-driving mechanics
from scratch.
**Why it happens:** The warning is phrased broadly in CONTEXT.md and STATE.md.
**How to avoid:** Only the dynamic `import()` calls are affected (§3 above). Every DOM selector, every
element ID, every constant (`SAIL_HL_SCALE`) is confirmed unchanged.
**Warning signs:** A probe script rewriting selectors that were never broken.

### Pitfall 2: Testing FF (fast-forward) only by checking the chip is hidden
**What goes wrong:** D-04 requires proving the flag *cannot be armed*, not just that
`#pp4FF`'s `display` stays `none`. `appState.ff` also throttles `sleep()` on the host
(`4/src/orchestrator.js:131`), which paces `runLiveNet`'s broadcast cadence for every guest — so if the
flag can still be set via console injection or a stale click handler, a host could silently rush every
guest's pacing even with the chip invisible.
**Why it happens:** The visible symptom (a hidden chip) is much easier to check than the underlying
capability (whether the flag is settable at all).
**How to avoid:** After adding the networked term to `4/src/ui/stage.js:426`'s visibility condition,
also verify — headlessly — that the click handler at `4/src/ui/stage.js:885-888` either does not attach
in networked mode, or that its body itself checks the networked condition before setting
`appState.ff = true`. This is a code-design question for the planner, not purely a test-rig question;
flag it as an implementation decision, not only a verification step.
**Warning signs:** A test that asserts `getComputedStyle(chip).display === 'none'` and calls MP-11 done.

### Pitfall 3: Trusting a headless page's page-error stream to prove FIX-03's crash is fixed
**What goes wrong:** Watching for `Runtime.exceptionThrown` and seeing none, concluding the sparse-draft
crash doesn't reproduce.
**Why it happens:** `docs/HARD-WON-LESSONS.md` §1b documents exactly this failure mode for this exact
turn chain — a throw inside an awaited chain rejects silently with zero page errors.
**How to avoid:** Wrap the specific async call under test and read its own rejection (§6 above).
**Warning signs:** "No console errors" reported as the sole evidence of a fix.

### Pitfall 4: A hidden tab silently corrupts the MP-10 tab-hide assertion
**What goes wrong:** Driving the tab-hide test via a CDP-opened tab that is *already* backgrounded
(the MCP browser session commonly opens tabs this way) means `requestAnimationFrame` never fires and
timers clamp to ~1/sec — a probe waiting on a rAF-driven confirmation will look hung, and any duration
measured will be wrong by up to 10×.
**Why it happens:** `docs/DRIVING-THE-GAME.md` §8b.
**How to avoid:** Check `{hidden: document.hidden, outer: window.outerWidth}` before trusting any
timing read from a probe tab; for the MP-10 test itself, the assertion is about the `paused` Firebase
node changing state on a *deliberately* simulated hide, which is the intended trigger — but confirm the
tab was genuinely visible beforehand so the transition is real, not an artifact.
**Warning signs:** `outerWidth: 0` on a tab you believe is in its normal state.

### Pitfall 5: Leaving orphaned Firebase rooms across shakeout runs
**What goes wrong:** A crash-first run (likely, given FIX-03 is unfixed on the first pass) leaves a
`rooms/<CODE>` node in the live production database with no expiry, because `abandonRoom()` only
deletes from the lobby.
**Why it happens:** No automated teardown exists for a room that started playing.
**How to avoid:** §7 above — capture the room code, delete it in a `finally`.
**Warning signs:** Growing `rooms/` node count in the Firebase console after a shakeout session.

---

## Code Examples

### The corrected DRIVING-THE-GAME.md autoplay driver, re-pathed for `/4`
```js
// Source: docs/DRIVING-THE-GAME.md §5b, with the one path change §3 above identifies
const st = (await import('/4/src/state/index.js')).appState;   // was '/src/state/index.js'
window.__g = { n: 0, acts: [], err: null, timer: null };
const G = window.__g;

const cellOf = r => { const s = parseFloat(r.getAttribute('width')), px = (s/0.9)+4, i = (px-s)/2;
  return [Math.round((parseFloat(r.getAttribute('x'))-i)/px),
          Math.round((parseFloat(r.getAttribute('y'))-i)/px)]; };

const target = () => { const g = st.game, me = g.players[st.mySeat], n = g.needs(me);
  return n.length ? (g.islandOf[n[0]] || g.home) : g.home; };

G.timer = setInterval(() => {
  try {
    G.n++;
    const coin = document.getElementById('flipCoinWrap');
    if (coin && coin.classList.contains('active') && coin.onclick) { coin.onclick(); return; }
    const cells = [...document.querySelectorAll('.sailCell')];
    if (cells.length) { const T = target(); let b = cells[0], bd = 1e9;
      for (const c of cells) { const [x,y] = cellOf(c);
        const d = Math.abs(x-T[0]) + Math.abs(y-T[1]); if (d < bd) { bd = d; b = c; } }
      b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return; }
    const btns = [...document.querySelectorAll('#actionPanel .apBtn')]
      .filter(b => !/back|←|‹/i.test(b.textContent));
    if (!btns.length) return;
    const noAnchor = btns.filter(b => !/anchor/i.test(b.textContent));
    const pool = noAnchor.length ? noAnchor : btns;
    const pick = pool.find(b => /dock/i.test(b.textContent))
              || pool.find(b => /fish|pass/i.test(b.textContent))
              || pool[0];
    G.acts.push(pick.textContent.trim().slice(0,16));
    if (G.acts.length > 25) G.acts.shift();
    pick.click();
  } catch (e) { G.err = String(e.message).slice(0,80); }
}, 600);
```
Note: this game has no `Fish` action any more (removed pre-`4/`) — Pass is the always-available
turn-ender per the v2.0 requirements (`RULE-01`). Prefer Dock, then anything not a Pass, falling back
to Pass, since Pass now pays a dubloon and a naive driver could farm it — for a shakeout run this
doesn't matter, but note it if the driver's behaviour is ever quoted as evidence of anything gameplay-
related.

### Guest reconnect (D-10, criterion 5) — the exact injection to prove it
```js
// Confirmed present: 4/src/orchestrator.js:1730, synchronous pp4_sess read before a pixel is drawn
// 1. On the GUEST process, join a room normally, let a few turns pass.
// 2. Snapshot pre-close state:
const before = { room: appState.room, mySeat: appState.mySeat, isHost: appState.isHost };
// 3. Close the PAGE (not the whole browser process — keep --user-data-dir alive so localStorage survives):
await send("Page.close");
// 4. Open a NEW page in the SAME Chrome process (same --user-data-dir) at the same /4/ URL:
const tgt2 = await (await fetch(`http://127.0.0.1:9402/json/new?http://localhost:8471/4/index.html`, {method:"PUT"})).json();
// 5. Reconnect CDP to the new page, then assert the guest lands directly back in-game:
const after = await evalJS(`({room: __pp_app_state_debug().room, mySeat: __pp_app_state_debug().mySeat, isHost: __pp_app_state_debug().isHost})`);
// 6. Assert `after` matches `before`, and that the welcome/join screen was never shown
//    (e.g. document.getElementById('actionPanel').style.display !== 'none', or #lobby modal never opened).
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| v1's `src/net/`, `src/orchestrator.js` multiplayer path (still live at root) | `4/`'s copy — byte-identical net transport, upgraded orchestration | `4/` forked 2026-08-11; tags removed same period | This phase turns the tags back on; nothing about the transport protocol changed |
| The five root `scripts/` multiplayer test gates | No equivalent yet for `4/` | Never ported | Deliberately deferred to Phase 3 — do not build in Phase 2 |
| MCP browser tool for game verification | Raw CDP over WebSocket, self-driven headless Chrome | Documented after repeated hidden-tab/throttling failures | Verified in this pass to work unchanged against `4/`, once import paths are re-prefixed |

**Deprecated/outdated:** the manual `pp_id` override technique for same-machine two-tab testing — still
correct for a human tester on one machine, but for an automated headless rig, two independent Chrome
processes is simpler and needs no bookkeeping.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Two independent headless Chrome processes (separate `--user-data-dir`) fully isolate `localStorage`/`pp_id` with no manual override needed | Test Rig §1 | Low — this is standard, well-documented Chrome profile behaviour, not project-specific; if wrong, the fallback (manual `pp_id` override, already documented and working) is a one-line addition |
| A2 | The `/4` dynamic-import prefix is the *only* change needed to make `docs/DRIVING-THE-GAME.md`'s techniques work against `4/` | Test Rig §3-§5 | Low-Medium — verified against every selector/constant named in the doc that this research checked, but the doc is long and a technique not directly checked (e.g. the exact `notes/` bake-off recordings, irrelevant here) could still carry an unverified root-relative reference |
| A3 | A plain `db.ref('rooms/'+code).remove()` write from a test probe is not restricted by `4/src/net/registry.js`'s "only file allowed to call `.on()`/`.off()`" rule | Test Rig §7 | Low — confirmed by reading `registry.js`'s own stated scope (listener attach/detach only); a `.remove()` write is a different Firebase API entirely |
| A4 | The "remotePrompt with no timeout" fault (the 4th "neighbour" fault CONTEXT.md lists beside FIX-03's three named sites) is genuinely open to Claude's discretion on *whether* to fix in Phase 2, given Phase 1's D-03 rules out a shot-clock-based fix and MP-13's presence-based fallback is explicitly Phase 4's | Common Pitfalls / Open Questions | Medium — REQUIREMENTS.md's FIX-03 text names only 3 sites; CONTEXT.md's Integration Points section describes 4. If the planner builds a fix here that duplicates or conflicts with Phase 4's MP-13 presence-based fallback, that is wasted or reverted work. Flagged explicitly as an Open Question below rather than resolved by this research pass. |

**If this table is empty:** not applicable — see rows above.

---

## Open Questions

1. **Does "remotePrompt with no timeout" need a Phase 2 fix at all, and if so, what shape?**
   - What we know: REQUIREMENTS.md's FIX-03 names exactly three sites (sparse-draft crash, unguarded
     `.val()`, unescaped host HTML). CONTEXT.md's Integration Points section lists a fourth —
     `remotePrompt` at `4/src/orchestrator.js:1142-1152` — under the heading "FIX-03's three sites,"
     which is internally inconsistent (three named, four listed). Phase 1's D-03 explicitly rules out
     a shot-clock-based fix ("the shot clock is not the mechanism that handles a dropped player"), and
     MP-13 (the presence-loss fallback) is explicitly Phase 4's requirement, not Phase 2's.
   - What's unclear: whether this phase should (a) leave `remotePrompt` exactly as it is — a promise
     that never resolves if the target guest never answers and never disconnects cleanly — accepting
     that as a known gap Phase 4 closes, or (b) add some interim guard now (e.g., resolving if the room
     itself is deleted) that doesn't require a timer.
   - Recommendation: treat this as **not required for Phase 2's success criteria** — none of the four
     ROADMAP criteria or D-10's fifth criterion name it, and building a partial fix risks conflicting
     with Phase 4's presence-based design. Note it in the phase's findings document (Claude's
     Discretion) as an observed-but-deliberately-deferred gap, with the D-03/MP-13 reasoning attached so
     Phase 4 doesn't have to rediscover it.

2. **What exactly should the shakeout consider "done" before handing off to Wyatt's phone pass?**
   - What we know: D-09 is unambiguous that headless evidence alone never closes the phase.
   - What's unclear: how broad the headless pass needs to be before it's worth spending Wyatt's one
     real-voyage test on it — CONTEXT.md's framing ("the first join will very likely crash — he should
     not be the crash detector") implies the bar is "does not crash on the four known fault sites
     plus a full ?bakeoff=0 voyage," not "every possible edge case."
   - Recommendation: scope the plan's headless verification to the five criteria in the Validation
     Architecture section below, run once clean end-to-end, then hand off. Do not chase additional
     coverage beyond what those criteria require — that would be over-investing in headless proof for
     a phase whose actual pass gate is a human on a phone.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Google Chrome (headless-capable) | The entire test rig | ✓ (used successfully in this repo's prior sessions per `docs/DRIVING-THE-GAME.md`/`HARD-WON-LESSONS.md`) | Not pinned in docs; any recent Chrome supports `--headless=new` | — |
| Node.js with global `WebSocket` | CDP client | ✓ (Node 22+ required; repo already assumes a modern Node for `scripts/*.js` ESM) | 22+ | If older Node, add the `ws` package — not currently needed anywhere else in this repo, so this would be a new dependency; prefer confirming Node version first |
| `python3 -m http.server` | Serving `4/` locally | ✓ (used throughout `docs/DRIVING-THE-GAME.md`) | any Python 3 | — |
| Firebase RTDB reachability (`pastry-pirates-default-rtdb.firebaseio.com`) | Every multiplayer test | Assumed ✓ — same database root and live game already depend on it | — | If unreachable, nothing in this phase can be verified even by Wyatt; not a fallback situation, a hard blocker |

**Missing dependencies with no fallback:** none identified — this research pass did not launch a
browser or server (per the constraints in the task brief), so live confirmation that headless Chrome
actually launches in this environment is still owed to the plan/execute phase, not this research pass.

**Missing dependencies with fallback:** Node `WebSocket` global, if the runtime turns out to be older
than Node 22.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None formal for this phase — ad-hoc CDP-driven Node probe scripts (see Test Rig §1-§8). Formal `npm test` coverage of `4/` is explicitly Phase 3's job. |
| Config file | none — see Wave 0 note below |
| Quick run command | A single Node probe script per criterion, run manually during planning/execution (e.g. `node /tmp/probe-mp01.mjs`) |
| Full suite command | No `npm test` target exists for `4/` yet; the closest full-coverage action is "play the whole voyage once, headless, end to end" per §2 of the Open Questions above |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Provable how |
|--------|----------|-----------|-------------------|---------------|
| MP-01 | Host creates a room, gets a shareable code | smoke (CDP probe) | Drive `choiceHost` → assert `rooms/<C>` node exists in RTDB and `roomCode` DOM text matches | **Headless** |
| MP-02 | Guest joins by code, claims a seat, named without collision | smoke (CDP probe, two processes) | Drive `choiceJoin` on the guest process with the host's code; assert `seatList`/`rooms/<C>/seats` shows two distinct, non-colliding names | **Headless** |
| MP-03 | Guest board/ships/narration/prompts stay in sync for a full voyage, incl. recipe draft | integration (two-process CDP probe + live-Firebase read) | Drive a full `?bakeoff=0` voyage on both processes; assert no rejected promise during `watchRecipes` (§6); assert `events[last].state[].pos` matches between host and guest at N sampled checkpoints | **Headless for crash-free + state-match; phone-only for "feels in sync"/narration readability (D-09)** |
| MP-10 | Tab hide/background does not pause/resume the shared clock for anyone else | integration (CDP probe, simulate `document.hidden`) | On a 2-human room, simulate hide on guest, then on host; assert `rooms/<C>/paused` never changes in either case | **Headless** |
| MP-11 | Fast-forward cannot skip narration others are watching | integration (CDP probe, source + runtime check) | Assert the `4/src/ui/stage.js:426` visibility condition's networked term is present (source check); assert `appState.ff` cannot be set to `true` by any reachable path during a live networked turn (Common Pitfalls #2) | **Headless** |
| MP-12 | Host reload mid-voyage resumes from decision log, game intact | integration (CDP probe, `Page.reload`) | Snapshot host state pre-reload; `Page.reload()`; assert `replayShortfall(rebuiltLen, priorLen, readFailed).incomplete === false` (the real exported function, `4/src/ui/util.js:2029`); assert post-reload round/players match the pre-reload snapshot, NOT round 1 | **Headless — the single most machine-checkable criterion in the phase, since it has a real exported pure function to assert against** |
| Criterion 5 (D-10) | Guest closes tab mid-voyage, reopens, rejoins same game/seat without retyping the code | integration (CDP probe, `Page.close` + reopen same profile) | See Code Examples "Guest reconnect" snippet — assert post-reopen `room`/`mySeat`/`isHost` match pre-close values and the welcome/join screen was never shown | **Headless** |
| FIX-03 (all three sites) | No crash on sparse recipe draft / null room / unescaped prompt HTML | unit-ish (source assertion) + integration (CDP probe reaching each path) | Drive the recipe draft to a sparse mid-state; assert no rejection from `watchRecipes` (§6); drive `startGame` against a room that has been concurrently deleted; drive a prompt whose `msg` contains `<script>`-shaped text and assert it renders escaped, not executed | **Headless** |

### Sampling Rate
- **Per fault fix:** the specific headless probe for that fault, run immediately after the fix, before
  moving to the next fault (this phase's four faults sit on genuinely untested code paths — see
  `docs/HARD-WON-LESSONS.md` §3's "verify a check can FAIL" rule: prove each probe actually reproduces
  the fault against the pre-fix code once, before trusting it as a green check post-fix).
- **End of phase, before handoff to Wyatt:** run the full sequence (MP-01 → MP-02 → MP-03 → MP-10 →
  MP-11 → MP-12 → criterion 5) once, end to end, on a clean pair of Chrome profiles, with room cleanup
  in the `finally` (Test Rig §7).
- **Phase gate:** the headless pass above is the pre-flight, not the gate. **The gate is Wyatt's real
  voyage on his phone (D-09) — nothing in this phase closes on headless evidence alone**, regardless of
  how green the CDP probes are.

### Wave 0 Gaps
- No test framework config exists for `4/` at all (confirmed: no `4/package.json`). This phase does
  not need to create one — that is TEST-05/Phase 3 — but the plan should not accidentally create a
  `4/package.json` as a side effect of writing probe scripts; keep probes outside the repo (scratchpad)
  or, if committed for the findings doc's sake, clearly marked as one-off and not wired into any test
  runner.
- No fixture/helper exists yet for "launch two headless Chrome processes and connect CDP to both" —
  this phase's own Test Rig §1 pattern is the first time this shape is needed in the repo; write it
  once, reuse it for every criterion above rather than duplicating the launch/connect boilerplate per
  probe.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | This game has no accounts; `pp_id` is a client-generated pseudonymous identifier, unchanged by this phase |
| V3 Session Management | Partially | `pp4_sess` (guest reconnect, D-10) is a client-localStorage session blob, not a server session — `SESSION_SCHEMA_V` mismatch handling already exists and was verified present (`4/src/orchestrator.js:1737-1738` area) |
| V4 Access Control | No | Anyone with a room code can join any seat — this is the game's designed model (a private test build for friends, D-01), not a defect this phase should address |
| V5 Input Validation | **Yes — this is FIX-03's unescaped-HTML site** | `esc()` (`4/src/ui/util.js`) already exists and is used elsewhere (confirmed at `4/src/ui/util.js:1643-1647`); the fix is applying it to `watchPrompt`'s `${p.msg}` interpolation, not inventing new escaping |
| V6 Cryptography | No | No cryptographic operations in this phase's scope |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Unescaped host-authored text rendered into guest DOM (FIX-03) | Tampering (self-inflicted, but still a rendering-integrity bug — a captain's typed name or narration text containing HTML could break another player's panel) | `esc()` around every `${p.msg}`/`${p.sub}`-style interpolation in `watchPrompt` — the same function already used elsewhere in the same file |
| Unbounded room-code write access (any client can write `rooms/<C>/*` per the RTDB's shared, ungated model) | Tampering / Denial of Service | Out of scope by design — D-01 explicitly rejects gating; the mitigation the project relies on is obscurity (`noindex`, `Disallow: /4/`) plus "no one in the world is playing `/4` except me" |
| A test probe leaving orphaned rooms in the live production database | Not a STRIDE category, but an operational hygiene risk | §7's `finally`-block cleanup |

---

## Sources

### Primary (HIGH confidence)
- `.planning/phases/02-multiplayer-revival/02-CONTEXT.md` — user decisions, locked scope, all initial
  file:line citations
- `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` — phase requirements and success criteria
- Direct grep/read of `4/src/orchestrator.js`, `4/src/ui/stage.js`, `4/src/ui/util.js`,
  `4/src/ui/flow.js`, `4/src/main.js`, `4/index.html`, `4/src/net/index.js` — every code fact in this
  document was verified against today's tree in this research pass, not assumed from CONTEXT.md's
  citations alone
- `docs/DRIVING-THE-GAME.md`, `docs/HARD-WON-LESSONS.md` — the project's own documented, previously-
  proven driving technique; every selector/constant it names was cross-checked against `4/`'s source

### Secondary (MEDIUM confidence)
- `.planning/research/v2.0-intake/MULTIPLAYER-GAP.md` — the only synthesis of `4/`'s net layer; its own
  line-number citations have drifted (confirmed — see Code Facts below), consistent with its own
  warning that it should be located by shape

### Tertiary (LOW confidence)
- None — no findings in this document rest on unverified web search or training-data-only claims about
  this specific codebase. The only genuinely `[ASSUMED]`-tier claims are the general environment
  assumptions in the Environment Availability table (Chrome/Node presence), which this research pass
  was constrained from confirming live.

---

## Code Facts — spot-check against today's tree (SECONDARY, per the task brief)

CONTEXT.md's citations were not re-derived — they were confirmed against `4/`'s current source. All
drift found is line-number drift only (typical of an actively-edited branch), never a wrong claim.

| CONTEXT.md citation | Actual location, verified 2026-08-19 | Drift |
|---|---|---|
| `picks.forEach(...)` in `watchRecipes`, `:1594` | `4/src/orchestrator.js:1595` (`watchRecipes` starts `:1591`) | 1 line |
| unguarded `.val()` in `startGame`, `:1508` | `4/src/orchestrator.js:1509` (`startGame` starts `:1507`) | 1 line |
| correct guard exists in `watchRoom`, `:1487-1488` | `4/src/orchestrator.js:1488` (`if(!r0){alert(...);...return;}`; `watchRoom` starts `:1485`) | ~1 line |
| unescaped host HTML in `watchPrompt`, `:1235-1250` | `4/src/orchestrator.js:1219` (`watchPrompt` starts) ... the actual unescaped interpolation `${p.msg}` is at `:1254` | function start is earlier than cited; the specific unescaped line is a few lines past the cited range |
| `remotePrompt` with no timeout, `:1143-1152` | `4/src/orchestrator.js:1142` (function start) | 1 line |
| ⏩ visibility, `stage.js:426` | Confirmed — `botsUp` condition at `4/src/ui/stage.js:426`, comment naming the pass-and-play-only ruling at `:425` | exact |
| ⏩ arm site, `stage.js:884-888` | Confirmed — `$("pp4FF").onclick` handler at `4/src/ui/stage.js:885-888` | ~1 line |
| `appState.ff` sleep-shortening, `orchestrator.js:131`, `flow.js:79` | Confirmed exact, both files, identical `sleep=ms=>appState.replaying?...` implementation in both | exact |
| tab-hide gate, `main.js:157-163` behind `soloBotGame()` | Confirmed — `4/src/main.js`'s `visibilitychange` listener checks `st.isHost && ui.soloBotGame() && !st.shotClockPaused` | exact |
| `soloBotGame()`, `util.js:1740` | Confirmed exact — `4/src/ui/util.js:1740` | exact |
| Firebase `<script>` tags removed, `index.html:28-30` | Confirmed — self-documenting comment present, no `<script>` tags for Firebase in `4/index.html` | exact |
| `.choiceRow` insert point, `4/index.html:1833-1841` | Confirmed — `choiceSolo`/`choicePassPlay` present at `:1834`/`:1837`; `choiceHost`/`choiceJoin` markup absent (only the guarded JS reference at `flow.js:2391` survives) | exact |
| chat sites (`sendChat:311`, `watchChat:321`, form wiring `:1681`, `#chatPanel` etc.) | All confirmed exact at cited lines | exact |
| `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` (referenced implicitly via MP-12/resume discussion) | Confirmed present and exported at `4/src/ui/util.js:2028-2033`; `resumeHostGame` at `4/src/orchestrator.js:1690` | new finding — not explicitly cited in CONTEXT.md but directly supports MP-12's headless provability |
| Folded todo `2026-08-01-guest-battle-sound-fires-on-arrival-not-render.md` | Not independently re-verified in this pass — CONTEXT.md already flags its v1 paths need re-checking against `4/src/orchestrator.js` before acting; deferred to the plan/execute phase since it is Claude's Discretion and secondary to the test-rig focus of this research | not verified this pass |

**One genuinely new finding beyond CONTEXT.md's citations:** `4/scripts/` contains 9 files
(`dlog_quantity_check.js`, `no_undef_check.js`, `pass_coin_test.js`, `pass_narration_test.js`,
`planner_singleton_check.js`, `pp4_timeroff_check.js`, `seat_arg_check.js`, `stage_import_check.js`,
`trade_offer_measure.js`, plus a `lib/` directory) — Phase 1's six new gates plus three pre-existing
ones. **None of the five multiplayer-specific scripts** (`host_guest_parity_check.js` etc.) are among
them, and **no `4/package.json` exists**, confirming MULTIPLAYER-GAP.md's claim directly.

---

## Metadata

**Confidence breakdown:**
- Test rig mechanics (primary focus): MEDIUM-HIGH — every selector/constant/function this research
  checked is confirmed present and unchanged in `4/`, but the two-process CDP rig as a whole has not
  been run end-to-end against `4/` in this repo yet (constrained from launching a browser this pass)
- Code facts (secondary focus): HIGH — every cited site was independently re-verified against today's
  tree, not merely trusted from CONTEXT.md
- Package/stack: HIGH — no new packages; the Firebase CDN restoration is a two-line copy already live
  elsewhere in the same repo
- Validation architecture: MEDIUM-HIGH — five of seven mapped criteria have a genuinely mechanical,
  headless-provable assertion; MP-03's "feels in sync" component is honestly phone-only per D-09

**Research date:** 2026-08-19
**Valid until:** This phase is short-lived and the underlying tree changes fast (`4/` is under active
development) — treat this research as valid only through this phase's own execution; do not carry
specific line numbers forward into Phase 3+ without re-verifying.
