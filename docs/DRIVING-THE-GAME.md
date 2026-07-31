# Driving Pastry Pirates from a browser session

How to make the game actually *play* under automation — for verifying a change end-to-end rather
than asserting about source. Written after three separate attempts stalled on the same two things.

`docs/VERIFICATION-CHECKLIST.md` says **what** to verify (it is Phase 12's scenario list and its
results). This says **how** to drive it. Read both before a browser pass.

---

## 1. Serve it, and use a port you have never loaded

```bash
python3 -m http.server 8421     # any port NOT used earlier in this session
```

**Chrome caches ES modules per URL.** Reusing a port that has already served an older build will
hand you the old `src/**/*.js` even after a hard reload, and you will "verify" code that is not on
disk. This has produced phantom bugs at least three times in this project — including once where a
fix appeared not to work and the fix was fine.

Kill the old servers when you move on, so a stale port cannot be reached by accident.

## 2. Clear saved state before starting

```js
localStorage.clear();   // then reload
```

`boot()` resumes an interrupted solo game from `pp_solo` and, historically, took an early return
before Firebase init. Leftover `pp_solo`/`pp_sess` from a previous run will silently put you in a
resumed game instead of the welcome screen.

Two tabs on the same origin share `localStorage`, so a second tab inherits the first tab's `pp_id`.
For a two-seat multiplayer test use a separate Chrome profile or an incognito window.

## 3. Start a solo game

```js
document.getElementById('pname').value = 'Wyatt';
document.getElementById('choiceSolo').click();
```

Hosting instead: `document.getElementById('choiceHost').click()` creates a real Firebase room on the
first click. **Delete the room afterwards** — `appState.db.ref('rooms/'+room).remove()` — or use the
back link on the room screen, which calls `abandonRoom()` and tears it down properly.

## 4. The turn loop — and the two things that stall every naive driver

### 4a. THE FLIP COIN IS ITS OWN BUTTON

This is the one that matters. There is **no separate FLIP button**: the flippenator coin
`#flipCoinWrap` *is* the control. When a flip is required it gains the class `active` and an
`onclick` handler (`setFlipActive`, `src/ui/board.js`).

It is **not** an `.apBtn`, so a driver that only clicks `#actionPanel .apBtn` will sit forever on
"Cast yer line – flip!" or a dock flip. Every stalled run in this project traced to this.

```js
const coin = document.getElementById('flipCoinWrap');
if (coin && coin.classList.contains('active') && coin.onclick) { coin.onclick(); }
```

### 4b. NEVER CLICK "← back"

The side-bet prompt's Back returns to re-pick the winner, so a driver that clicks the first button
loops there forever. Filter it out:

```js
[...document.querySelectorAll('#actionPanel .apBtn')].filter(b => !/back|←|‹/i.test(b.textContent))
```

### 4c. Sailing — derive the grid cell from the rect

Highlighted squares are `.sailCell` rects. Their geometry comes from `sailHighlightRect()`
(`src/ui/flow.js`), which insets by `SAIL_HL_SCALE`, so invert that to get board coordinates:

```js
const side  = parseFloat(rect.getAttribute('width'));
const px    = (side / 0.9) + 4;          // 0.9 === SAIL_HL_SCALE
const inset = (px - side) / 2;
const gx = Math.round((parseFloat(rect.getAttribute('x')) - inset) / px);
const gy = Math.round((parseFloat(rect.getAttribute('y')) - inset) / px);
```

### 4d. Battle prompts use `.btlBtn`, not `.apBtn`.

## 5. Reaching an end of voyage

**Random clicking will not finish a game.** One measured run reached 1 of 5 ingredients in 256
moves. Sail with intent instead — toward the island holding something you still need, then home:

```js
const need = game.needs(game.players[0]);
const target = need.length ? game.islandOf[need[0]] : game.home;
// then pick the .sailCell with the smallest Manhattan distance to `target`
```

Prefer `Dock` and `Fish` over passing when answering the action menu. Expect **several minutes** —
bot turns and narration holds dominate the wall clock, so poll rather than blocking.

**Do not shortcut by mutating live game state mid-turn.** Setting `game.winner` / `players[].ing`
while the loop is running wedges it — tried, and it cost a run. If you must shortcut, call the real
render functions directly (below) instead of editing state the loop is mid-way through reading.

## 6. Inspecting state

`window.__pp_app_state_debug()` returns a **shallow copy** of `appState` (`src/main.js`). Also
available: `__pp_module_ok`, `__pp_boot_count`, `__pp_net_debug`.

The live modules are importable in the page, which is the cleanest way to exercise one function:

```js
const board = await import('/src/ui/board.js');
const state = await import('/src/state/index.js');   // state.appState is the LIVE object
board.showStats();                                    // render the End of Voyage panel on demand
```

## 7. Watching an animation

`drawBoard()` wipes the board SVG on every render, so a `.pop` element created for inspection is
usually destroyed before you can sample it — which reads as "the animation never ran".

Read the composed keyframes off the running animation instead of sampling frames:

```js
const a = el.getAnimations()[0];
a.effect.getKeyframes();        // offsets, transforms, per-keyframe easing
a.effect.getTiming().duration;
```

That proves the curve. It does **not** prove how it feels — that stays a human check.

## 8. Blocking dialogs look like a hung tab

`alert()` blocks the renderer, and the browser tooling reports that as *"the renderer may be frozen
or unresponsive"*. Before diagnosing a freeze, stub it and re-run:

```js
window.__alerts = []; window.alert = m => window.__alerts.push(String(m));
```

An `alert()` on a failure path cost real time here once, presenting as a frozen tab when it was a
failed Firebase call.

## 9. Never verify against production

`playpastrypirates.com` serves whatever last merged to `main`. It can never prove anything about
work in progress. All browser verification targets the local server.
