# Phase 22: The Front Door - Research

**Researched:** 2026-07-31
**Domain:** Vanilla HTML/CSS/JS front-end — modal UX, static multi-page site addition, SEO meta verification
**Confidence:** HIGH

## Summary

This phase touches three small, well-bounded surfaces of a static, no-build-step vanilla-JS game:
(1) the welcome-screen naming flow, (2) a brand-new second HTML page, and (3) verifying two lines
of already-shipped `<head>` markup survive. There are no external packages to add, no framework to
learn, and no server to configure — everything is direct edits to files that already exist, plus one
new file (`about.html`) that is a sibling of `index.html` on GitHub Pages-style static hosting.

The riskiest part is not visible in the UI-SPEC or CONTEXT.md: **`#pname` has more readers than the
two CONTEXT.md names, and there is no existing "last-used name" persistence to pre-fill the new modal
from.** Six call sites read the DOM value of `#pname` today (not two), and the two localStorage blobs
CONTEXT.md cites as backing D-04's pre-fill (`pp_sess`/`pp_solo`) are **both wiped on `leaveGame()`**
— i.e. exactly the moment a player finishes a game and would next want their name remembered. A new,
durable localStorage key is needed to actually deliver D-04. Both findings are laid out in detail
below with exact `path:line` citations so the planner can scope tasks precisely instead of
discovering the gap mid-implementation.

Also load-bearing: **`docs/DRIVING-THE-GAME.md`'s own solo-start recipe sets `#pname` directly**
(`docs/DRIVING-THE-GAME.md:40`, and again at `:190` for the guest-join recipe used by D-11's
screenshot capture) — once the field is removed per D-01, that exact snippet no longer works and
must be replaced before D-11's screenshot-driving session, or the first attempt at capturing
screenshots will silently stall on a modal it doesn't know exists.

**Primary recommendation:** Give the modal its own `.modalOverlay` div (matching `#kofiModal`'s
shape) rather than a fifth `showStep()` step inside `#lobby`'s existing card — this reuses the
existing dismissible-modal machinery (auto-injected `.modalX`, backdrop-click-to-close) almost for
free, but the dismiss handler must be hand-written for this one modal because D-02 makes X/Escape/
backdrop-click **confirm and proceed**, which is different from every other dismissible modal in the
codebase (they only ever close). Route every write of the confirmed name through one new function
(e.g. `saveLastName()`/a new `pp_lastName` key) and repoint all six `#pname` readers at it in the
same task, not incrementally — a partial rename is the exact failure mode CONTEXT.md's Implementation
Note 1 already warns about, just with a longer reader list than recorded there.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Name modal (open, pre-fill, confirm, persist) | Browser / Client (UI) | — | Pure DOM + localStorage; no network call, no engine involvement. Lives in `src/ui/lobby.js` + `src/ui/flow.js` (client-only tier per `src/module-contract.js`'s `ui` layer, which never imports `src/net/`). |
| Mode-button click interception (Solo/Host/Join/Pass&Play) | Browser / Client (UI) | — | `wireWelcome()` (`src/ui/flow.js:1687-1708`) already owns all four handlers; the modal inserts into this same function. |
| Room creation / join network calls | API / Backend-equivalent (Firebase RTDB) | Browser / Client | `createRoom()`/`joinRoom()` (`src/orchestrator.js:1110,1174`) are net-adjacent orchestration, downstream of the modal — untouched by this phase except for the one `$("pname")` read inside `createRoom()`. |
| About page content (rules copy, credits, screenshot) | CDN / Static | — | `about.html` is a static file with no data dependency, served identically to `index.html`/`lab.html` from the same static host. |
| Sitemap / robots / meta verification | CDN / Static | — | `sitemap.xml`, `robots.txt`, and `index.html`'s `<head>` are static files read by crawlers, not runtime code. |
| Persisted "last-used name" | Database / Storage (browser `localStorage`) | Browser / Client | New concern this phase introduces — see Common Pitfalls. No existing key durably serves this role today. |

## Standard Stack

**Not applicable in the conventional sense.** This project has zero `dependencies` and zero
`devDependencies` (`package.json:1-13`) by explicit design (`docs/VERIFICATION-CHECKLIST.md:40-41`,
D-01 of an earlier phase) and this phase introduces no new library, build tool, or CDN script. The
only two script tags in `<head>` are the existing pinned Firebase SDK (`index.html:30-31`, v12.15.0
compat), which this phase does not touch.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| — | — | — | No new library is introduced. Vanilla DOM APIs (`document.getElementById`, `localStorage`, `addEventListener`) are used throughout, matching the codebase's zero-dependency convention `[VERIFIED: package.json]`. |

### Supporting
None.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled `about.html` stylesheet | Reuse/extract `index.html`'s inline `<style>` block | Rejected by D-07 specifically to avoid colliding with Phase 18's concurrent edits to that block — not revisited here. |

**Installation:** None required.

## Package Legitimacy Audit

**Not applicable — this phase installs no packages.** No `npm install`/`pip install`/`cargo add` of
any kind occurs. Skip the legitimacy gate entirely.

## Architecture Patterns

### System Architecture Diagram

```
                     ┌─────────────────────────────────────────────┐
                     │  index.html (page load)                     │
                     │  boot() → src/orchestrator.js:1375           │
                     └───────────────────┬───────────────────────────┘
                                          │
                                wireWelcome() (flow.js:1687)
                                          │
        ┌───────────────┬────────────────┼────────────────┬───────────────┐
        ▼                ▼                ▼                ▼               │
  #choiceSolo      #choicePassPlay   #choiceHost      #choiceJoin          │
  (flow.js:1688)   (flow.js:1699)    (flow.js:1697)   (flow.js:1698)       │
        │                │                │                │               │
        └──────────┬─────┴────────────────┴────────┬───────┘               │
                   ▼                                ▼                      │
        ┌─────────────────────┐         [NEW] Name modal opens here        │
        │  requireName() today │◄──────  reads/writes ONE source of truth  │
        │  lobby.js:92-97      │         (currently: 6 separate #pname     │
        └─────────┬───────────┘         reads scattered across 3 files)   │
                   │ confirm/dismiss (D-02: same action)                   │
                   ▼                                                       │
   ┌───────────────┬────────────────┬────────────────┬────────────────┐   │
   ▼               ▼                ▼                ▼                │   │
startSinglePlayer  showStep         netHandlers()     $("joinName")    │   │
(flow.js:1709)     (stepPassPlay)   .onCreateRoom()   .value=... →     │   │
   │               │                → createRoom()    showStep         │   │
   │               │                (orchestrator.js  (stepJoin)       │   │
   │               │                :1110, own $("pname")     │        │   │
   │               │                 read at :1113)           ▼        │   │
   ▼               ▼                     ▼            joinRoom()       │   │
Firebase-free    startPassAndPlay   Firebase RTDB      (orchestrator.js│   │
solo Game()      (flow.js:1722)     room write         :1174, reads    │   │
                                                        #joinName only) │   │
                                                                        │   │
                     ┌──────────────────────────────────────────────┐  │   │
                     │  about.html  [NEW STATIC FILE]                │◄─┘   │
                     │  linked from #stepChoose (D-06) and           │      │
                     │  #footerRow (D-06) — both inside index.html   │      │
                     │  own stylesheet (D-07), no shared CSS/JS       │      │
                     └──────────────────────────────────────────────┘      │
                                                                             │
                     ┌──────────────────────────────────────────────┐      │
                     │  sitemap.xml — gains one <url> entry (D-05)   │◄─────┘
                     │  robots.txt — unchanged, already Allow:/       │
                     │  index.html:15,28 — robots meta + JSON-LD      │
                     │  image field (META-01, ALREADY SHIPPED)        │
                     └──────────────────────────────────────────────┘
```

### Recommended Project Structure

No new directories. New files only:

```
about.html                  # NEW — sibling of index.html, own <style> block (D-07)
sitemap.xml                 # EDIT — add one <url> entry for about.html (D-05)
assets/                     # candidate home for the About-page screenshot (D-10/D-11);
                             #   existing convention keeps game art here (board.png, dock.png,
                             #   logo.jpg all live at assets/ root or in a subfolder)
```

### Pattern 1: The four-card welcome screen and its click handlers

**What:** `wireWelcome()` (`src/ui/flow.js:1687-1708`) attaches one `onclick` per mode card. All
four currently either call `requireName()` (Solo, Host) or copy `#pname`'s raw value forward (Join,
Pass & Play) before proceeding.

**Current behavior per mode**, verified by reading each handler directly:

| Mode | Handler (`src/ui/flow.js`) | Name handling today | What happens next |
|------|---------------------------|----------------------|--------------------|
| Solo | `:1688` `$("choiceSolo").onclick=()=>{if(!requireName())return;startSinglePlayer();}` | Calls `requireName()` (`lobby.js:92-97`), which reads `$("pname").value`, trims, defaults to `DEFAULT_NAMES[0]` if blank. **`requireName()` never returns falsy** — the `if(!requireName())return;` guard is dead code (a non-empty string is always returned) `[VERIFIED: src/ui/lobby.js:92-97]`. | `startSinglePlayer()` (`flow.js:1709`) builds the roster synchronously and starts the engine — no network call. |
| Pass & Play | `:1699` `$("choicePassPlay").onclick=()=>{$("ppName0").value=($("pname").value||"").trim();showStep("stepPassPlay");}` | Copies the (usually blank) `#pname` value into `#ppName0`, the first of **four** name fields already on the next screen (`index.html:867-870`). Does NOT call `requireName()`. | `showStep("stepPassPlay")` — a full 4-name form is shown; `#btnStartPassPlay` (`flow.js:1700-1706`) later reads all four `ppName*` fields directly, defaulting empties from `NAMES`. |
| Host a Crew | `:1697` `$("choiceHost").onclick=()=>{if($("choiceHost").classList.contains("disabled"))return;if(!requireName())return;netHandlers().onCreateRoom();}` | Same dead-code `requireName()` guard as Solo, but the mode's own network path independently reads `$("pname")` a SECOND time inside `createRoom()` (`orchestrator.js:1113`). | `createRoom()` shows `#lobbyRoom` optimistically (`orchestrator.js:1135`, before the Firebase write even resolves), then writes the room. |
| Join a Crew | `:1698` `$("choiceJoin").onclick=()=>{if($("choiceJoin").classList.contains("disabled"))return;$("joinName").value=$("pname").value;showStep("stepJoin");}` | Copies `#pname`'s raw (untrimmed) value into `#joinName`, no `requireName()` call. | `showStep("stepJoin")` shows the code-entry screen; `#btnJoin` → `joinRoom()` (`orchestrator.js:1174-1210`) reads `$("joinName")`, **not** `#pname`, trimmed and capped at 40 chars, falling back to `unusedDefaultName()` if blank. |

**When to use:** This table is the exact map of where the modal must intercept each click and what
each downstream flow already assumes has been set.

### Pattern 2: The existing dismissible-modal machinery

**What:** Six modals (`#howToPlayModal`, `#creditsModal`, `#logModal`, `#feedbackModal`,
`#recipeModal`, `#kofiModal`) are wired identically in one loop in `wireLobby()`
(`src/orchestrator.js:1322-1333`):

```js
// Source: src/orchestrator.js:1322-1333
["howToPlayModal","creditsModal","logModal","feedbackModal","recipeModal","kofiModal"].forEach(id=>{
  const ov=$(id);if(!ov)return;
  const card=ov.querySelector(".modalCard");
  if(card&&!card.querySelector(".modalX")){
    card.style.position="relative";
    const x=document.createElement("button");
    x.className="modalX";x.type="button";x.innerHTML=iconImg(CLOSE_X_IMG);x.setAttribute("aria-label","Close");
    x.onclick=()=>{ov.style.display="none";};
    card.insertBefore(x,card.firstChild);
  }
  ov.addEventListener("click",e=>{if(e.target===ov)ov.style.display="none";});
});
```

Every modal in this list is opened with `$(id).style.display="flex"` from a single-line handler in
the same function (e.g. `$("btnShowHow").onclick=()=>{$("howToPlayModal").style.display="flex";};`,
`orchestrator.js:1313`). None of the pre-game screens (`#lobby`, `#lobbyRoom`, `#passOverlay`) are in
this list — they gate the flow and are deliberately not dismissible this way (comment at
`orchestrator.js:1319-1321`).

**Critically, there is NO Escape-key handling anywhere in the codebase** — verified by grepping the
entire `src/` tree and `index.html` for `keydown`/`Escape`/`keyCode` `[VERIFIED: grep, zero matches]`.
D-02's requirement that Escape also dismiss (and, uniquely for this modal, dismiss-as-confirm) is new
code, not a reused pattern. It must be added specifically for the new modal (a single `keydown`
listener checking `e.key==="Escape"` and only acting while the modal's overlay is visible), and should
not be silently generalized to the other six modals in this phase (out of scope, and D-02's dismiss-
equals-confirm semantics are specific to this one modal — the other six only ever close, they never
"confirm" anything).

**When to use:** Give the new name modal its own `.modalOverlay` div, structured like `#kofiModal`
(`index.html:970-975`) — a single `.modalCard` with the prompt/input/confirm content — rather than a
fifth entry in `#lobby`'s `showStep()` step machinery. Reasoning: `showStep()`'s four existing steps
are all non-dismissible by design (they gate a linear flow with no X/Escape/backdrop close), while
this modal must be dismissible per D-02. Reusing the `["howToPlayModal", ...]` forEach loop's
`.modalX`-injection and backdrop-click code is the free part; the **dismiss-equals-confirm** behavior
(D-02) is not free — it means this modal's dismiss handlers cannot use the generic
`ov.addEventListener("click",e=>{if(e.target===ov)ov.style.display="none";})` verbatim (that line
only *closes*), so this one modal needs its own X/backdrop/Escape handlers that all call the same
"confirm and proceed" function, not the generic close-only one.

### Pattern 3: `pname()` vs `#pname` — the naming collision (confirmed, not just flagged)

Two unrelated things share the string "pname":

1. **The DOM id `#pname`** (`index.html:817`) — the input field D-01 removes.
2. **The function `pname(i)`** (`src/ui/util.js:216-220`) — renders *seat i*'s escaped display name,
   consumed by `pn(i)` (`util.js:228`) and `poss(i)` (`util.js:230`), which are imported and used
   throughout `src/ui/lobby.js` and `src/orchestrator.js` for narration and the seat list
   (`lobby.js:129,132,181`; `orchestrator.js` narration lines throughout).

**Verified: nothing in `pname(i)`'s implementation reads the DOM at all** — it reads
`appState.roster[i].name`, a plain string already stored in application state, not the input element.
Removing `#pname` from the DOM cannot break `pname(i)`/`pn(i)`/`poss(i)` as long as `appState.roster`
continues to be populated correctly (which is `startSinglePlayer()`/`startPassAndPlay()`/
`createRoom()`/`joinRoom()`'s job, not the removed input's). Safe to remove `#pname` without touching
`src/ui/util.js`.

### Anti-Patterns to Avoid

- **Repointing only `requireName()` and `createRoom()`'s reads, per CONTEXT.md's Implementation Note
  1.** That note names two readers. There are **six** confirmed direct/derived reads of `#pname`'s
  value (see Common Pitfalls, "The `#pname` reader inventory is longer than recorded"). Missing any
  one leaves a `null` dereference the moment that code path runs (a `TypeError` from
  `$("pname").value` when `$("pname")` returns `null` for a removed element) — not a silent bug, a
  hard crash on click, but only on the path the tester didn't happen to exercise.
- **Assuming `pp_sess`/`pp_solo` already implement "last-used name" persistence, per CONTEXT.md
  D-04's phrasing.** Both are cleared on every `leaveGame()` call (`orchestrator.js:1295`,
  `clearSession()` + `clearSoloState()`), which fires from `btnPlayAgain` and `btnConfirmLeave`
  (`orchestrator.js:1309,1308`) — i.e. the two most common ways a session ends. A player who finishes
  a solo game and clicks "Play again" arrives back at a blank welcome screen with **no** last-used
  name available from either key. See Common Pitfalls below for the concrete fix.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal shell (card, backdrop, close X) | A new CSS component | `.modalOverlay`/`.modalCard`/`.modalX` (`index.html:669-680`) — verbatim reuse | Already shipped, already responsive (`index.html:683-686` narrow-screen override), already carries the `box-shadow`/border treatment the UI-SPEC's Color/Typography sections call out as the established look. |
| Captain-name defaults | A new name list | `DEFAULT_NAMES`/`unusedDefaultName()` (`src/shared/index.js:191-208`) | Already the single canonical pool; `unusedDefaultName()` already avoids seat collisions — this is precisely the "Crustbeard – Crustbeard" bug's fix mechanism and should not be reinvented for the modal's placeholder logic. |
| HTML escaping of a player-typed name | A new sanitizer | `escHtml` (used inside `pname()`, `src/ui/util.js:219`) | Already the codebase's one escaping chokepoint for names; the modal's confirmed value flows into `appState.roster[i].name`, which is already escaped at render time via `pname()` — no new escaping needed at the write site as long as the read site is unchanged. |
| Ko-Fi embed on the About page | A second Ko-Fi integration | `openKofi()`/`mountKofi()` (`src/ui/lobby.js:64-86`) and `#kofiModal`'s markup (`index.html:970-975`) | Already built for KOFI-01, already handles the cross-origin-iframe constraint and lazy-mounts on first open. About page's Ko-Fi button is a third `onclick=openKofi` pointer, not new integration work — but see note below on module boundaries. |

**Key insight:** Every piece of this phase — the modal shell, the default-name pool, the escaping, the
Ko-Fi panel — already exists and is imported/exported from `src/shared/`, `src/ui/lobby.js`, and
`src/ui/util.js`. The actual new work is orchestration (wiring one more entry point) and one new
static HTML file, not new UI primitives.

**Module-boundary note for `about.html`'s Ko-Fi button:** `openKofi()`/`mountKofi()` live in
`src/ui/lobby.js`, an ES module imported by `src/main.js` for `index.html`'s script graph. `about.html`
per D-07 is a wholly separate file with no shared JS (only a shared-by-eye stylesheet). If the About
page's Ko-Fi button is meant to open the *same in-page embedded panel* pattern, it cannot literally
`import` from `src/ui/lobby.js` without pulling in that module's full dependency chain (`appState`,
`src/shared/index.js`, `src/ui/board.js` — see `lobby.js:36-45`'s own imports) into a page that has
none of the surrounding game markup those modules assume exists (e.g. `mountKofi()` calls
`$("kofiPanel")`, which only exists if `about.html` reproduces `#kofiModal`'s markup). The pragmatic
options, for the planner to choose between: (a) `about.html`'s Ko-Fi button reuses only the embed URL
constant and iframe-mount logic as duplicated markup/inline script (small, self-contained, matches
D-07's "duplication is accepted" precedent), or (b) it is a plain `<a href="https://ko-fi.com/wyattroy" target="_blank">`
link instead of an in-page embed on this one page only (simpler, but diverges from the "opens the
widget, not the website" preference Wyatt recorded for the footer/Credits buttons — that preference
was recorded specifically about *those* buttons, not stated to cover a hypothetical About-page
button). This is not resolved by CONTEXT.md or the UI-SPEC and should be a planning decision, not an
executor improvisation.

## Common Pitfalls

### Pitfall 1: The `#pname` reader inventory is longer than CONTEXT.md records

**What goes wrong:** CONTEXT.md's Implementation Note 1 names exactly two readers —
`requireName()` and `createRoom()`'s inline read. A grep of the whole tree finds **six** distinct
places that read `#pname`'s value, three of them not mentioned anywhere in CONTEXT.md or the
UI-SPEC:

| # | Location | What it does |
|---|----------|---------------|
| 1 | `src/ui/lobby.js:93` | `requireName()` — used (uselessly, see Pattern 1) by Solo and Host. |
| 2 | `src/orchestrator.js:1113` | `createRoom()`'s own independent read, used by Host. |
| 3 | `src/orchestrator.js:1337` | **Not in CONTEXT.md.** The Feedback modal's submit handler: `name:($("pname").value||"").trim()||null` — attaches the player's typed name (or `null`) to a feedback record written to Firebase. |
| 4 | `src/ui/flow.js:1698` | **Not in CONTEXT.md.** `choiceJoin`'s handler copies `$("pname").value` into `$("joinName").value` before showing `#stepJoin`. |
| 5 | `src/ui/flow.js:1699` | **Not in CONTEXT.md.** `choicePassPlay`'s handler copies `($("pname").value||"").trim()` into `$("ppName0").value` before showing `#stepPassPlay`. |
| 6 | `docs/DRIVING-THE-GAME.md:40,190` | **Automation, not app code**, but load-bearing for D-11's screenshot capture — see Pitfall 3. |

**Why it happens:** CONTEXT.md's discovery pass (during `/gsd-discuss-phase`) evidently found the two
most obvious call sites (the ones that gate mode selection) but not the two `wireWelcome()` pre-fill
lines or the Feedback modal's unrelated use of the same field.

**How to avoid:** Treat sites 1-5 as one atomic rename in a single task: introduce one function (e.g.
`getPlayerName()`) and one setter (e.g. `setPlayerName(v)`/`saveLastName(v)`) backed by a new
localStorage key (see Pitfall 2), and change all five call sites to go through it. Site 6 is a
separate, non-app-code task — see Pitfall 3.

**Warning signs:** A `TypeError: Cannot read properties of null (reading 'value')` in the browser
console the moment a mode card is clicked (if `#pname` is removed from the DOM but any of sites 1-5
still calls `$("pname")` directly) — this is the exact failure `no_undef_check.js` **cannot catch**
(see Pitfall 4), so it will only surface via manual click-through or `read_console_messages`.

### Pitfall 2: There is no existing durable "last-used name" — D-04's pre-fill needs a new key

**What goes wrong:** CONTEXT.md D-04 says the modal is "pre-filled with the player's last-used name,
remembered in browser storage (the game already persists `pp_sess` / `pp_solo` / `pp_id`)." This
undersells what those three keys actually are:

- **`pp_id`** (`src/ui/util.js:1390-1394`) is a random anonymous device identifier
  (`"u"+Math.random().toString(36).slice(2,10)`) — never a name, and "structurally excluded" from
  ever being cleared (comment at `util.js:1387`), but it carries no name information at all.
- **`pp_sess`** (`util.js:1396-1397`) stores `{v, room, mySeat, isHost}` for multiplayer resume — no
  name field exists in this blob at all.
- **`pp_solo`** (`util.js:1406-1410`) stores `{v, ...appState.soloMeta, dlog}`, and `soloMeta` DOES
  include `name` (solo) or `names` (pass & play) — see `startSinglePlayer()` (`flow.js:1717`,
  `appState.soloMeta={name,strategies,seed}`) and `startPassAndPlay()` (`flow.js:1728`). **But this
  blob is deleted the moment the game ends or is left** — `clearSoloState()` is called from
  `leaveGame()` (`orchestrator.js:1295`), which fires from both `btnPlayAgain.onclick` and
  `btnConfirmLeave.onclick` (`orchestrator.js:1308-1309`). A player who finishes one game and starts
  the next — the single most common return-visitor path — has `pp_solo` already cleared by the time
  the welcome screen (and the new modal) next renders.

**Why it happens:** `pp_sess`/`pp_solo` were designed for one purpose — resuming an *interrupted*
session on reload (CLOCK-01's schema-versioning comments at `util.js:1381-1387` make this explicit) —
not for remembering a player's identity across separate games. D-04 is asking for a second, unrelated
concern that happens to be adjacent in the same file.

**How to avoid:** Add one new, small, **never-cleared** localStorage key (matching the `pp_id`
precedent of "structurally excluded" from the schema-version clearing mechanism) — e.g. `pp_lastName`
— written every time the modal confirms a name (D-02: including on dismiss, since dismiss = confirm),
and read by the modal's pre-fill logic. Fall back to `unusedDefaultName()`/`DEFAULT_NAMES[0]`
(`src/shared/index.js:199-208`) only when this new key has never been set (first-time visitor, per
D-04's own second sentence). This key should NOT be namespaced under `pp_sess`/`pp_solo`'s schema-
version mechanism (`SESSION_SCHEMA_V`/`SOLO_SCHEMA_V`, `util.js:1388-1389`) since it isn't
resumable-game-state — it is closer in kind to `pp_id`, and should be documented as such if a future
schema-version bump ever touches this area.

**Warning signs:** If the executor wires the modal's pre-fill to `pp_solo`/`pp_sess` per CONTEXT.md's
literal text, the demo will work the FIRST time (mid-game state exists) but the pre-fill will silently
regress to the anonymous default on the very next game — a bug that will not show up in a single
click-through and needs an explicit "finish a game, click Play Again, open the modal again" test step
(see Validation Architecture below).

### Pitfall 3: `docs/DRIVING-THE-GAME.md`'s own automation snippets set `#pname` directly

**What goes wrong:** The project's required browser-automation reference document sets the removed
field directly, twice:

```js
// docs/DRIVING-THE-GAME.md:40 (§3, "Start a solo game")
document.getElementById('pname').value = 'Wyatt';
document.getElementById('choiceSolo').click();

// docs/DRIVING-THE-GAME.md:190 (§5c, "Driving a GUEST seat while a human hosts")
document.getElementById('pname').value = 'Claude';
document.getElementById('choiceJoin').click();
```

Once D-01 removes `#pname`, both lines throw (`document.getElementById('pname')` returns `null`,
`.value = ...` on `null` throws a `TypeError`) and any driver script copy-pasted from this doc — which
is the project's own mandated procedure for D-11's screenshot capture — will fail at the very first
step.

**Why it happens:** This doc predates the phase and was not updated as part of CONTEXT.md/UI-SPEC
authoring (neither references it as a file this phase edits).

**How to avoid:** As part of this phase's own execution (not a separate follow-up), update
`docs/DRIVING-THE-GAME.md:40` and `:190` to drive the new modal instead of the removed field — e.g.
click the mode card first, then interact with whatever the new modal's confirm control resolves to
(its exact id is a planning decision, not yet fixed). This doc is explicitly named in CONTEXT.md's
own canonical references as required reading for D-11's screenshot-capture session — capturing
screenshots is the OTHER blocking use of this exact recipe, so if the doc isn't fixed first, D-11
cannot proceed with the doc's own workflow.

**Warning signs:** The screenshot-capture session (D-11) hangs on the welcome screen instead of
starting a game — this was the exact symptom described in `docs/DRIVING-THE-GAME.md`'s own opening
line ("written after three separate attempts stalled") for a different but analogous trap, so budget
for a quick doc fix before the actual capture session, not during it.

### Pitfall 4: `npm test`'s automated gates will NOT catch a leftover `$("pname")` reference

**What goes wrong:** It is tempting to trust `npm test`'s 19-script chain (`package.json:6`) as a
safety net for this rename. It largely is not, for this specific class of bug.

**Why it happens:** `scripts/no_undef_check.js` — the closest thing to a static-analysis gate — is
explicitly scoped to **undeclared identifiers used as function calls** (`NAME(`), verified by reading
its own header comment (`scripts/no_undef_check.js:53-58`). `$("pname")` is a call to the *declared,
imported* function `$`, with the string `"pname"` as an ordinary string-literal argument — there is
no identifier named `pname` for the tool to flag as undeclared. The tool is, by its own explicit
design, "OVER-PERMISSIVE, never under-permissive" for exactly this reason
(`no_undef_check.js:20-22`). None of the other 18 scripts in the `npm test` chain inspect DOM-id
strings against the live markup either (they cover determinism, engine purity, module graph shape,
narration content, and net-watcher inventory — verified by reading each script name in
`package.json:6` against `docs/VERIFICATION-CHECKLIST.md:16-27`'s own description of the same chain).

**How to avoid:** After removing `#pname` from `index.html`, run a plain text search —
`grep -rn '"pname"' index.html src/` — and confirm every remaining hit is either (a) the seat-name
function `pname(i)`/`pn(i)`/`poss(i)` in `src/ui/util.js` (safe, unrelated — see Pattern 3) or (b) a
DOM id `pname0`-style seat-row id (`src/ui/util.js:111,121` render `pname${i}` for seat 0-3's colored
name spans — a different, unrelated id family that happens to share the `pname` prefix and must NOT
be touched). Then confirm via an actual browser click-through (Chrome-MCP or manual) of all four mode
cards with the console open — `npm test` passing green is not evidence this rename is complete.

**Warning signs:** `npm test` reports all-green immediately after the rename — this is expected and
does not mean the rename is correct; it means this particular class of bug is outside this test
suite's coverage.

### Pitfall 5: RULES.md's world-building has already drifted from the shipped How-To-Play copy

**What goes wrong:** `RULES.md:12` says "sail home and dock at **Barbados**." The live in-game
How-To-Play modal (`index.html:913`) says "sail home and dock at the **Isle of Tortuga**." These are
two different in-fiction homeports for the same mechanic, in two of the four existing "rules" copies
CONTEXT.md's D-08 already counts (How-To-Play modal, `RULES.md`, `Rules_boardgame.md`,
`.planning/how-to-play-pastry-pirates.md`).

**Why it happens:** `RULES.md` is a repo-root doc that has not been kept in sync with in-game copy
edits (e.g. whatever changed the homeport's name to Tortuga did not propagate back to `RULES.md`).

**How to avoid:** This is direct, concrete evidence supporting D-08's decision to write fresh,
independent About-page copy rather than pull from any existing source — pulling from `RULES.md` in
particular would have imported a stale place-name contradicting the shipped game. No action is needed
beyond being aware of this when drafting the About page's rules section (D-09's draft pass) so the new
copy uses "Isle of Tortuga," matching the live modal, not "Barbados."

**Warning signs:** None at runtime — this is a copy-accuracy concern for the human drafting/approving
About-page text, not a code bug.

## Code Examples

### The existing modal-open/dismiss pattern (for a modal that only ever closes)

```js
// Source: src/orchestrator.js:1313-1332 — reference pattern; NOT copy-pasteable as-is for the
// name modal, because D-02 requires dismiss to ALSO confirm, not just close. Shown here so the
// planner/executor can see exactly what "matches the existing pattern" means and where it diverges.
$("btnShowHow").onclick=()=>{$("howToPlayModal").style.display="flex";};
// ...
["howToPlayModal","creditsModal","logModal","feedbackModal","recipeModal","kofiModal"].forEach(id=>{
  const ov=$(id);if(!ov)return;
  const card=ov.querySelector(".modalCard");
  if(card&&!card.querySelector(".modalX")){
    card.style.position="relative";
    const x=document.createElement("button");
    x.className="modalX";x.type="button";x.innerHTML=iconImg(CLOSE_X_IMG);x.setAttribute("aria-label","Close");
    x.onclick=()=>{ov.style.display="none";};              // <-- for the name modal this must also confirm
    card.insertBefore(x,card.firstChild);
  }
  ov.addEventListener("click",e=>{if(e.target===ov)ov.style.display="none";}); // <-- same divergence
});
```

### `unusedDefaultName()` — the collision-safe default the modal's placeholder should draw from

```js
// Source: src/shared/index.js:199-208
function unusedDefaultName(seats,preferIdx){
  const taken=new Set();
  Object.keys(seats||{}).forEach(k=>{
    const s=seats[k]||{};
    const nm=s.id?(s.name||"").trim():DEFAULT_NAMES[+k];
    if(nm)taken.add(nm);
  });
  if(preferIdx!=null&&!taken.has(DEFAULT_NAMES[preferIdx]))return DEFAULT_NAMES[preferIdx];
  return DEFAULT_NAMES.find(nm=>!taken.has(nm))||DEFAULT_NAMES[preferIdx||0];
}
```

### The already-shipped META-01 markup (verify these two lines survive this phase's edits)

```html
<!-- Source: index.html:15 -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

<!-- Source: index.html:28 -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"VideoGame","name":"Pastry Pirates on the Sugar Seas","url":"https://playpastrypirates.com/","description":"A free browser pirate board game — sail the Caribbean, collect baking ingredients, battle rival captains, and race home to become the Best Baker.","image":"https://playpastrypirates.com/og-image.jpg","genre":"Board Game","gamePlatform":"Web Browser","numberOfPlayers":"2-4","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Name typed once on the welcome screen, above the mode buttons | Name confirmed via modal, after mode selection | This phase (FIX-01) | Removes the field currently at `index.html:816-817`; six call sites need repointing (see Common Pitfalls). |
| `og:image`/`twitter:image` assumed to drive Google's result thumbnail | `robots` meta `max-image-preview:large` + JSON-LD `image` field are the actual levers; OG tags serve chat-app link previews only | 2026-07-31, quick task `20260731-google-preview-logo` | Already shipped (`index.html:15,28`); this phase only verifies survival and supplies the missing in-page screenshot (ABOUT-01) that those levers were waiting on. |

**Deprecated/outdated:** `RULES.md`'s "Barbados" homeport reference — superseded in-game by "Isle of
Tortuga" but never updated in the doc itself (see Pitfall 5). Not in this phase's scope to fix, but
should not be treated as a source of truth when drafting About-page copy.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The new name modal should be its own `.modalOverlay` div (matching `#kofiModal`'s shape) rather than a fifth `showStep()` step inside `#lobby` | Architecture Patterns → Pattern 2 | If the planner instead nests it in `showStep()`, the dismiss-machinery reuse this research recommends doesn't apply the same way, and D-02's dismiss-equals-confirm behavior still needs custom wiring either way — the two approaches differ mainly in file/DOM structure, not in the hardest part (custom dismiss handling). Low risk either way, flagged as a recommendation, not a locked decision, since UI-SPEC's own Implementation Note 3 explicitly leaves this open. |
| A2 | A new localStorage key (e.g. `pp_lastName`) is needed for D-04's pre-fill, distinct from `pp_sess`/`pp_solo` | Common Pitfalls → Pitfall 2 | High confidence — directly verified by reading `leaveGame()`, `clearSoloState()`, and `clearSession()`'s call sites; this is not a guess. Flagged as an "assumption" only in the sense that the *exact key name* is Claude's/the planner's choice, not because the underlying gap is speculative. |
| A3 | The About page's Ko-Fi button needs either duplicated embed markup/script or a plain outbound link, not a shared JS import from `src/ui/lobby.js` | Don't Hand-Roll → module-boundary note | If wrong (e.g. a lighter-weight shared module extraction is actually viable), the phase ships slightly more duplicated code than strictly necessary — not a functional risk, a style/maintenance one, and it is explicitly flagged as a planning decision rather than resolved here. |

**If this table is empty:** N/A — see rows above. All three are grounded in direct file reads (not
speculation about behavior), but are marked ASSUMED/flagged because they resolve open questions the
UI-SPEC and CONTEXT.md explicitly left to the planner/executor rather than locking.

## Open Questions

1. **What id/name does the new modal's confirm control use, and does `docs/DRIVING-THE-GAME.md`'s
   fix reference it directly?**
   - What we know: The modal needs a text input (pre-filled, `maxlength="40"`, matching `.nameLabel
     input`'s existing 16px-to-avoid-iOS-zoom rule per UI-SPEC Typography) and a confirm button
     labeled "Aye, that's me name" per the UI-SPEC Copywriting Contract (draft, pending D-09
     wording).
   - What's unclear: The exact DOM id, since this modal doesn't exist yet.
   - Recommendation: Whatever id the planner assigns, the `docs/DRIVING-THE-GAME.md` fix (Pitfall 3)
     should be written against the SAME plan/task that creates the modal, so the doc and the modal
     never drift out of sync from day one.

2. **Does Pass & Play's `#ppName0` field stay visible on `stepPassPlay` after the modal has already
   named seat 0?**
   - What we know: D-03 mandates the same modal appears before all four modes "in the same position
     in the flow," and Pass & Play's existing `stepPassPlay` screen independently collects up to 4
     names including seat 0's (`index.html:867-870`). The current handler pre-fills `#ppName0` from
     whatever `#pname` held (`flow.js:1699`) — after this phase, it would pre-fill from the modal's
     confirmed value instead, so the field is never blank, just potentially redundant-looking (asking
     "what's your name" twice in immediate succession for Pass & Play specifically).
   - What's unclear: Whether this redundancy is acceptable (matches D-03's "consistency over saving a
     click" reasoning) or should be smoothed by, e.g., hiding/relabeling `#ppName0` specifically for
     the modal-confirmed seat.
   - Recommendation: Not resolved by CONTEXT.md or the UI-SPEC's five-surface probe (E1-E5 do not
     include this specific interaction). Flag for the planner to make an explicit call — likely
     "leave `#ppName0` as-is, pre-filled and editable," matching D-03's literal wording, but worth a
     one-line PLAN.md decision rather than silent default.

## Environment Availability

Not applicable in the conventional sense — this phase has no external service/tool dependency beyond
what already runs the rest of the game. For completeness:

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Firebase RTDB (already configured) | Host/Join flows downstream of the modal (unchanged by this phase) | ✓ (existing, pinned SDK) | 12.15.0 compat (`index.html:30-31`) | — |
| Static file hosting (GitHub Pages / Netlify-style, no build step) | Serving `about.html` as a sibling of `index.html` | ✓ (already how `index.html`/`lab.html` are served) | — | — |
| A local HTTP server for verification | Manual/browser-driven checks below | Use `python3 -m http.server <port>` per `docs/DRIVING-THE-GAME.md:11-22`, a fresh port not previously used this session (Chrome ES-module caching gotcha) | — | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None — nothing is missing.

## Validation Architecture

This phase is browser-only, static, and has no relevant unit-test framework for its own new surface
(the existing `npm test` chain covers engine/net/narration invariants this phase does not touch, per
Pitfall 4 above — it is not a substitute for browser verification here). Validation is manual/
browser-driven, following the project's own established procedure (`docs/DRIVING-THE-GAME.md`,
`docs/VERIFICATION-CHECKLIST.md`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (no Playwright/Puppeteer/Jest — zero-dependency project by design). Browser automation via Chrome-MCP tooling, per `docs/VERIFICATION-CHECKLIST.md:11`. |
| Config file | none |
| Quick run command | `npm test` (regression-only; does not exercise this phase's new UI — see caveat above) |
| Full suite command | `npm test` (same 19-script chain) + manual browser pass described below |

### Phase Requirement → Verification Map

| Req ID | Success criterion | Verification approach | Evidence |
|--------|--------------------|------------------------|----------|
| FIX-01 (SC1) | Clicking any of the four mode buttons opens the name modal, pre-filled, confirming proceeds into that mode's flow | Local server + browser click-through of all four cards in sequence (fresh `localStorage.clear()` first, per `docs/DRIVING-THE-GAME.md:24-28`), screenshot/console check per click | `read_console_messages` zero errors; visual confirmation the modal appears before each mode's downstream screen (`#stepJoin`/`#stepPassPlay`/room screen/live game) renders |
| FIX-01 (SC2) | Exactly one naming surface; modal writes to the single source of truth the lobby reads from; no name-doubling | Start a game with a modal-confirmed name, inspect `appState.roster[0].name` via `window.__pp_app_state_debug()`, and visually confirm the captains panel shows the name once, not twice (the exact regression UI-06 already fixed for a different code path — re-verify it holds here) | Debug-hook read matches the typed name exactly once; no "Name – Name" pattern in the rendered captains panel |
| ABOUT-01 (SC3) | `about.html` contains rules, a mid-game screenshot, credits, and the Ko-Fi button | Load `about.html` directly in a browser (both as a full navigation and via the About link), visually confirm all four elements render, confirm the screenshot is the D-11-selected mid-game frame (not a placeholder), confirm the Ko-Fi button opens something (embed or link per the module-boundary decision, Open Question resolved by planner) | Screenshot of the rendered page; console error check |
| ABOUT-01 (SC4) | About page's rules are deliberately distinct copy, not a third divergent accidental copy | Read-diff the About page's rules section against the How-To-Play modal's text (`index.html:912-936`) — confirm they differ deliberately (D-08) and that the About copy uses "Isle of Tortuga," not "Barbados" (Pitfall 5) | Manual text comparison; D-09 sign-off recorded per `copy-shipped-vs-approved-gate.md` |
| ABOUT-02 (SC5) | About page reachable by its own link from the homepage | From a fresh `index.html` load, click the welcome-screen About link (D-06) and separately the footer About link (D-06, requires being past the welcome screen since `#footerRow` is inside `#game`, `index.html:1077`, `display:none` until a game starts) | Both links navigate to `about.html` with a 200 response, confirmed via Network tab or `curl -I` against the local server |
| META-01 (SC6) | `robots` meta (`max-image-preview:large`) and JSON-LD `image` field survive this phase's markup edits | `grep -n 'max-image-preview\|"image":' index.html` after all edits land, confirm still at (or near) `index.html:15` and `:28` with unchanged content | Exact grep match against the baseline captured in this document's Code Examples section |

### Sampling Rate

- **Per task commit:** Quick grep-based checks (`grep -n '"pname"' index.html src/**/*.js`,
  `grep -n 'max-image-preview\|"image":' index.html`) — near-instant, catch the two highest-risk
  regressions (dangling `#pname` reads, lost META-01 markup) before a browser pass is even needed.
- **Per wave merge:** Full `npm test` (regression floor — proves this phase didn't break engine/net/
  narration invariants, even though it doesn't exercise the new UI) + one full browser click-through
  of all four mode cards with `localStorage.clear()` first.
- **Phase gate:** All six success-criterion checks above, run against a local server (never
  `playpastrypirates.com` — `docs/DRIVING-THE-GAME.md:336-339`), plus the two blocking approval gates
  (D-09 About-page copy sign-off, D-11 screenshot selection) recorded as complete before the phase is
  marked done.

### Wave 0 Gaps

- No test file gaps — there is no test framework this phase's new surface plugs into. The "Wave 0"
  equivalent here is procedural: **fix `docs/DRIVING-THE-GAME.md:40,190` before attempting D-11's
  screenshot-capture session** (Pitfall 3), since that doc's own recipe is what the capture session
  will follow, and it currently references the field this phase removes.
- No shared fixtures needed.
- No framework install needed (by design — this project has zero dependencies).

## Security Domain

`security_enforcement` is not referenced in `.planning/config.json` for this workstream in a way that
disables it, so treat as enabled — but there is very little surface here. This phase adds no
authentication, no session management beyond what already exists (`pp_sess`/`pp_id`, unchanged), and
no new user input beyond a name field that already existed and already flows through the same
`escHtml`-based rendering path (`src/ui/util.js:216-220`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth exists or is added; `pp_id` is an anonymous device identifier, unchanged by this phase. |
| V3 Session Management | No | `pp_sess`/`pp_solo` mechanics are read, not modified in shape, by this phase (a new adjacent key is added — see Pitfall 2 — but it carries only a display name, not session/auth state). |
| V4 Access Control | No | No access-controlled resource is introduced. `about.html` is a public static page, same trust level as `index.html`. |
| V5 Input Validation | Yes | The name field's existing constraints carry forward unchanged: `maxlength="40"` (already on `#pname`, should be applied identically to the new modal's input), trimmed via `.trim()`, and rendered only through `escHtml` (`util.js:219`) — never via `innerHTML` with the raw value. No new validation logic should be introduced; reuse the existing constraint exactly. |
| V6 Cryptography | No | Not applicable — no cryptographic operation in this phase's scope. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Stored/reflected XSS via a player-typed name rendered into the DOM | Tampering / Elevation of Privilege | Already mitigated by the existing `escHtml`-through-`pname()` chokepoint (`util.js:216-220`) — the modal's confirm handler must write the RAW (unescaped) typed string into whatever storage backs `appState.roster[i].name` / the new `pp_lastName` key, and rely on the render-time `escHtml` call, exactly as the removed `#pname` flow already did. Do not add a second, competing escaping step at write time (double-escaping would corrupt legitimate names containing `&`, `<`, etc., though rare for pirate captain names, is still a correctness bug). |
| Open redirect / unintended navigation via the new About link | Spoofing | Not applicable — `about.html` is a same-origin relative link (`<a href="about.html">`), not a parameterized or user-controlled URL. |
| Cross-origin data leak via the Ko-Fi iframe embed (if `about.html` duplicates the embed) | Information Disclosure | Already mitigated in the existing pattern via the `sandbox="allow-scripts allow-forms allow-popups allow-same-origin"` attribute and lazy (first-open-only) `src` assignment (`src/ui/lobby.js:71-79`) — if `about.html` duplicates this markup (see module-boundary note under Don't Hand-Roll), it must duplicate the same `sandbox` attribute, not a looser one. |

## Sources

### Primary (HIGH confidence — direct file reads, this session)
- `index.html` (full file, 1094 lines) — welcome screen markup, all modal markup, `<head>` meta/JSON-LD block, footer, CSS for `.modalOverlay`/`.modalCard`/`.choiceCard`/`.footerBtn`.
- `src/ui/lobby.js` (full file) — `requireName()`, `showStep()`, `openKofi()`/`mountKofi()`.
- `src/ui/flow.js` (relevant excerpt, lines 1670-1750) — `wireWelcome()`, `startSinglePlayer()`, `startPassAndPlay()`.
- `src/orchestrator.js` (relevant excerpts, lines 1095-1440) — `createRoom()`, `joinRoom()`, `abandonRoom()`, `wireLobby()`, `boot()`, `leaveGame()`.
- `src/ui/util.js` (relevant excerpts, lines 200-230, 1375-1420) — `pname()`/`pn()`/`poss()`, session/solo-state persistence functions.
- `src/shared/index.js` (full file) — `DEFAULT_NAMES`, `unusedDefaultName()`, `NAMES`.
- `docs/DRIVING-THE-GAME.md` (full file) — automation recipes, including the two now-stale `#pname` references.
- `docs/VERIFICATION-CHECKLIST.md` (excerpt) — established verification procedure and tooling.
- `scripts/no_undef_check.js` (header comment) — scope/limits of the closest static-analysis gate.
- `package.json` — confirms zero dependencies, full `npm test` script chain.
- `sitemap.xml`, `robots.txt` — current contents, confirmed one homepage entry / no About-page-relevant disallow.
- `RULES.md` (excerpt) — confirmed "Barbados" vs. in-game "Isle of Tortuga" drift.
- `og-image.jpg`, `assets/logo.jpg` (via `sips`/`file`) — confirmed actual pixel dimensions (1200×663 / 900×502).

### Secondary (MEDIUM confidence)
- `.planning/workstreams/front-door/phases/22-the-front-door/22-CONTEXT.md` — 11 locked decisions (D-01…D-11), treated as authoritative for scope but cross-checked against source where it made specific code claims (two gaps found: reader inventory, `pp_solo`/`pp_sess` persistence — see Common Pitfalls).
- `.planning/workstreams/front-door/phases/22-the-front-door/22-UI-SPEC.md` — approved design contract, treated as authoritative for visual/interaction shape.
- `.planning/quick/20260731-google-preview-logo/SUMMARY.md` / `PLAN.md` — confirms META-01's already-shipped half and its stated limits.

### Tertiary (LOW confidence)
- None — no unverified web claims were needed for this phase; it is entirely internal-codebase research with no external library or documentation lookup required.

## Metadata

**Confidence breakdown:**
- Standard stack: N/A (no new dependencies) — HIGH confidence in "nothing to add," verified via `package.json`.
- Architecture: HIGH — every claim traced to an exact `path:line` read this session, not inferred.
- Pitfalls: HIGH — all five pitfalls are grounded in direct code reads (grep + file reads), not speculation; two (reader inventory, persistence gap) directly correct/extend CONTEXT.md's own claims with cited evidence.

**Research date:** 2026-07-31
**Valid until:** Effectively indefinite for the codebase facts cited (static file reads of a repo at a
fixed commit) — but re-verify the exact `index.html` line numbers cited here if Phase 18's concurrent
CSS-block edits or any other in-flight branch work lands first, since line numbers below the `<style>`
block (everything in the Architecture Patterns/Pitfalls sections) could shift by the time this phase
executes. The `<head>` block (lines 1-32, before `<style>`) is more stable, since Phase 18's scope is
explicitly the CSS block only (D-07's stated coordination boundary).
