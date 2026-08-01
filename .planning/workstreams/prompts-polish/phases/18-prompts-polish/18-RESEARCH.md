# Phase 18: Prompts & Polish - Research

**Researched:** 2026-07-31
**Domain:** Vanilla JS/CSS narration-panel layout & timing, plus 7 independent copy/CSS fixes
**Confidence:** HIGH (all findings verified directly against current source, not against the todo notes)

## Summary

This phase has one hard piece of work — FIX-03/FIX-10/FIX-16, all three living inside
`src/ui/panel.js`'s `panel()`/`resizePanel()` — and seven small, independent CSS/copy fixes. Every
file:line reference in the ten source todos was checked against the CURRENT tree. Several have
drifted (documented below); the interlocking group's core claims (line numbers, constants, the
measure-once mechanism, the ghost-fade-out-of-flow cause) are all **confirmed accurate**.

**The single most valuable finding for planning:** every `.apBtn`/`.apBack` render site in the
codebase (there are 4: `src/ui/flow.js` localAsk, `src/orchestrator.js` watchDraftPrompt,
`src/orchestrator.js` remote-prompt rerender, and the flip+back branch inside the same function)
funnels through the ONE shared `panel()` function in `src/ui/panel.js`. Battle prompts (`.btlBtn`)
do **not** — they render through a separate path (`renderBattle()`) that never puts an `.apMsg`
into the DOM, so they never go through `typewriterReveal()` at all and are correctly out of scope
for FIX-03. This means FIX-03/10/16 can be implemented **entirely inside `src/ui/panel.js` plus one
CSS block in `index.html`**, without editing `src/ui/flow.js`'s or `src/orchestrator.js`'s
button-markup code at all — a narrower footprint than the Boundaries doc's widened-ownership list
anticipated (it flagged `src/ui/flow.js:96` as a likely edit site; a panel()-centered fix does not
need to touch it).

**Also load-bearing:** the FIX-10 todo's "second path" theory (an unsized inline `<img>` or a web
font causing a late reflow that resizePanel() measured too early) does **not apply to the current
codebase**. Every inline icon in narration/panel text routes through `iconImg()`/`ilabelImg()`,
both of which emit `<img class="narrIcon">`, and `.narrIcon` has explicit fixed
`width:18px;height:18px` in CSS (`index.html:198`) — the box occupies that size immediately, before
the image decodes. The project also loads no web fonts (system font stack only). **The confirmed
bug is exclusively path 1: the resize/orientationchange listener in `src/main.js` never re-runs
`resizePanel()`.** Do not spend plan effort mitigating unsized images or FOUT — reproduce and fix
only the resize-listener gap.

**Primary recommendation:** implement FIX-03+FIX-10+FIX-16 as one `panel.js`/`index.html` change:
(a) hide `.apBtns`/`.apBack` via a CSS class gated by `visibility:hidden` (never `display:none`),
toggled off in a `.then()` on the existing `_revealDone` promise; (b) wire the existing
rAF-debounced `resize`/`orientationchange` listener in `src/main.js:161-168` to also call
`resizePanel()`; (c) replace the ghost's `inset:0` with an explicitly captured `top`/`left`/`width`
snapshot of the outgoing message's real position, and hold the row at
`Math.max(newContentHeight, ghostHeight)` until the ghost's fade timer fires, at which point apply
the already-known `newContentHeight` directly (no second DOM reflow-probe). Full code sketch below.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Panel button reveal timing (FIX-03) | Browser/Client (`src/ui/panel.js`) | — | Pure DOM/CSS timing; no server round-trip, no game-state change |
| Panel height measurement (FIX-10, FIX-16) | Browser/Client (`src/ui/panel.js`, `index.html` CSS) | — | Layout measurement is inherently client-side; Safari-specific perf constraint lives here |
| Resize/orientation re-measure (FIX-10) | Browser/Client (`src/main.js`) | — | Existing debounced listener owns all viewport-size-driven re-renders |
| Bribe/empty-hold narration (FIX-07) | Browser/Client orchestration (`src/orchestrator.js`) + Client render (`src/ui/util.js`) | — | Deliberately NOT the engine tier — see milestone constraint 1 |
| Win-banner article (FIX-08) | Client render (`src/ui/recipe.js` data + `src/ui/board.js` one-line consumer) | — | Static per-recipe data; no server round-trip |
| Button/CSS restyle, chip layout, dot removal (FIX-06, FIX-09, FIX-17) | Browser/Client (`index.html` CSS block) | — | Pure presentation, zero logic |
| Narration line-break control (FIX-21) | Client render (`src/ui/util.js`, `src/ui/flow.js`, `src/ui/board.js`) | — | String-formatting concern at the same call sites that already build narration text |

All seven capabilities are client-tier only. Nothing in this phase touches the API/engine tier
(`src/engine/index.js`) or any storage tier — consistent with milestone constraint 1.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIX-03 | Buttons wait for typewriter to finish | Confirmed single choke point: `panel()` in `src/ui/panel.js`. Design in "The Interlocking Group" below. |
| FIX-04 | Remove "{captain} is blown by the storm" line | Confirmed at `src/ui/util.js:327` (exact line match). Both viewer variants confirmed on one line. |
| FIX-06 | Restyle 12 solid-orange buttons | Confirmed exact rule (`index.html:125-126`), all 12 button sites re-located (2 line-number drifts documented), footer-button target pattern confirmed. |
| FIX-07 | Empty-hold loser gets "gives up 5🌕", not bribe framing | Confirmed all 3 code sites (`orchestrator.js:622-650`, `util.js:595-635`, `engine/index.js:566-581`); confirmed the fix stays out of the engine tier. |
| FIX-08 | Win banner only prints "a" for singular recipe names | **Confirmed line drift**: line now `src/ui/board.js:772`, not `src/orchestrator.js:887` as recorded. All 21 titles enumerated; 8 plurals confirmed. Fallback path (`recipeTitle()`) confirmed and handled. |
| FIX-09 | Ingredient chips stay readable on narrow mobile | Confirmed pure-CSS scope (`.prowTop` grid, `index.html:165-174`, `.chip`, `index.html:192`). Confirmed chips are NOT interactive (no onclick) — removes the tap-target objection to shrinking them. |
| FIX-10 | Narrow window never clips the action button | Confirmed root cause (missing re-measure on resize, `src/main.js:161-168`). Confirmed the "late-loading image" second-path theory does NOT apply to current code. |
| FIX-16 | Narration fade doesn't jump left; box doesn't shrink early | Confirmed single cause at `index.html:308` (`.apMsg.fadeOut{position:absolute;inset:0}`) and `src/ui/panel.js:228`'s own comment admitting the height-measurement gap. |
| FIX-17 | Remove coloured circles beside captain names, everywhere | Confirmed 3 sites: `src/ui/util.js:110` (Captains box — line drifted from 96), `src/ui/lobby.js:180` (lobby — a different file than the todo's `index.html:576` claim), CSS at `index.html:188` and `index.html:758` (also drifted from 576). |
| FIX-21 | No orphaned coins/brackets; awards keep quantity+unit together | Confirmed `.nobrk` mechanism exists and works at 2 sites; **found 4 additional unwrapped sites** the todo didn't enumerate, including the exact "quantity+unit" award-card case Wyatt described. |
</phase_requirements>

## Standard Stack

**N/A — no new dependencies.** This is a zero-build vanilla HTML/CSS/JS project (per CLAUDE.md);
every fix in this phase is implemented with native browser APIs already used elsewhere in the
codebase: DOM `classList`, `getComputedStyle`, `offsetHeight`/`offsetTop`/`offsetLeft`, CSS Grid,
CSS `transition`, and `Promise`/`setTimeout`. No package install, no `npm view` check needed, no
Package Legitimacy Audit applies.

## Package Legitimacy Audit

N/A — this phase installs no packages.

## Architecture Patterns

### The measure-once contract (read before touching anything)

`resizePanel()` (`src/ui/panel.js:308-318`) is BUG-01's Safari near-crash fix. It works by
temporarily forcing `grid-template-rows: max-content`, reading `inner.offsetHeight` **once**, then
snapping back and animating a plain `.18s` CSS transition to that one measured px value. The
original crash was **continuous** re-measurement — once per typewriter character/frame. The literal
constraint is "do not force a `max-content` reflow-probe on every tick," not "call `resizePanel()`
exactly once in the function's lifetime." This distinction matters for FIX-16's design below: a
**second**, cheap height-application (using an ALREADY-KNOWN number, no new reflow-probe) 800ms
after the first is safe and does not reproduce BUG-01. A second `max-content` **probe** triggered by
something other than a real user resize event would not be safe.

### System flow: how a prompt reaches the screen

```
Game logic (orchestrator.js / flow.js)
        │  builds `msg` text + `opts` (button labels/values)
        ▼
armClock(seat)  ──────────────► starts the 30s shot clock, BEFORE any rendering
        │
        ▼
ask() (util.js) ──► localAsk() (flow.js, host/local)  OR  remote prompt paths (orchestrator.js,
        │              guest browsers: watchDraftPrompt / the general remote-prompt rerender)
        │           all three build near-identical HTML: `<div class="apMsg">msg</div>
        │           <div class="apBtns">...buttons...</div>`
        ▼
panel(html, needsAction=true)   ◄── THE ONE CHOKE POINT — src/ui/panel.js:252
        │
        ├─► inner.innerHTML = html          (buttons + text, both fully in DOM)
        ├─► resizePanel(true)               (measures ONCE, animates box to final height)
        ├─► msgEl = querySelector(".apMsg:not(.fadeOut)")
        └─► msgEl._revealDone = typewriterReveal(msgEl, 20ms/char, startDelay)
                    │
                    ▼
        typewriterReveal walks msgEl's text nodes char-by-char, resolves _revealDone
        when the LAST character is on screen (NOT a guessed duration)
                    │
                    ▼ (FIX-03 hooks here)
        buttons become visible/clickable
```

Guest browsers reach the exact same `panel()` call (via `watchDraftPrompt`/the general remote
prompt rerender in `src/orchestrator.js`), so a fix inside `panel()` covers host AND guest
rendering with zero duplicated logic.

### Recommended file map for this phase

```
src/ui/panel.js      # FIX-03 (button hide/reveal), FIX-16 (ghost position + height hold)
src/main.js           # FIX-10 (wire resizePanel() into the existing resize/orientationchange listener)
index.html (CSS only) # FIX-03 (.pendingReveal rule), FIX-16 (.apMsg.fadeOut no more inset:0),
                       # FIX-06 (button.primary), FIX-09 (.prowTop + .chip @media rules),
                       # FIX-17 (.prowTop grid-template-columns/-areas, .seat .dot removed)
src/ui/util.js         # FIX-04 (windmove), FIX-07 (isBribe + new empty-hold branch),
                       # FIX-17 (buildPlayerRows dot span), FIX-21 (nobrk sites)
src/orchestrator.js    # FIX-07 (canCoins&&hasIng branch, new spoilChosen field + battle event)
src/ui/recipe.js       # FIX-08 (article field on RECIPE_BOOK + recipeArticle() helper)
src/ui/board.js        # FIX-08 (ONE line — coordinate with board-wind), FIX-21 (award stat+unit)
src/ui/lobby.js        # FIX-17 (lobby .dot span removal)
src/ui/flow.js         # FIX-21 (turn-order draw consolation line)
scripts/bot_storm_narration_test.js  # FIX-04 (update the windmove assertion)
scripts/narration_test.js            # FIX-07 (re-point the "5-coin spoil renders bribe" assertion)
```

### The Interlocking Group: FIX-03 + FIX-10 + FIX-16 design

#### FIX-03 — buttons wait for the typewriter, without a second render site to maintain

Add ONE CSS class and toggle it from inside `panel()` itself:

```css
/* index.html, near .apBtns/.apBack rules (~index.html:334) */
#actionPanel.pendingReveal .apBtns,
#actionPanel.pendingReveal .apBack { visibility: hidden; }
```

```js
// src/ui/panel.js, inside panel() — reduced must be computed BEFORE this point (move the
// existing `reduced` read up, it currently sits at line 300, after resizePanel() runs; order vs.
// resizePanel() does not matter for correctness — visibility:hidden never changes offsetHeight —
// but it must be computed before we decide whether to add the class)
const reduced = typeof window!=="undefined" && window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasButtons = needsAction && $("actionPanel").querySelector(".apBtns,.apBack");
$("actionPanel").classList.toggle("pendingReveal", !!hasButtons && !reduced);
...
const msgEl=$("actionPanel").querySelector(".apMsg:not(.fadeOut)");
const revealDone = msgEl
  ? typewriterReveal(msgEl,REVEAL_MS_PER_CHAR,(ghost&&!reduced)?GHOST_FADE_MS:0)
  : Promise.resolve();
if(msgEl)msgEl._revealDone=revealDone;
if(hasButtons && !reduced) revealDone.then(()=>{
  $("actionPanel").classList.remove("pendingReveal");
});
```

**Why `visibility:hidden`, and why this never breaks resizePanel()'s measurement:** the full HTML
(text + buttons) is inserted into the DOM at `inner.innerHTML=html`, BEFORE `resizePanel()` runs.
`visibility:hidden` — unlike `display:none` — still occupies its box in layout, so
`inner.offsetHeight` measures the buttons' full space whether the class is present or not, at any
point before or after the class is toggled. This is exactly the property the FIX-03 todo's
constraint demands.

**Why this is safe against a second-render-site race:** because `#actionPanel.pendingReveal`'s
class is scoped to a SINGLE shared element and toggled from a `.then()` on a promise created fresh
for THIS specific `panel()` invocation, a stale `.then()` from an interrupted earlier reveal
(`typewriterReveal`'s own `_revealTimer` continues ticking on a now-detached node after a new
`panel()` call replaces the DOM — confirmed by reading `typewriterReveal`: it only clears
`msgEl._revealTimer` for the NEW element being walked, never the old one) could in principle resolve
LATE and remove `pendingReveal` from a NEWER prompt's still-hidden buttons. **Mitigate this
explicitly**: capture the specific `hasButtons` DOM reference at call time and toggle its own
`classList` directly (`hasButtons.classList.remove("pendingReveal")` style, scoped to the captured
node) rather than re-querying `$("actionPanel")` inside the `.then()` — removing a class from a
detached node is inert, so an interrupted earlier reveal can never affect a newer render. Recommend
per-node classing over the shared-class sketch above if a plan wants to fully close this race; the
shared-class version is simpler and the race window is narrow (only matters if a NEW prompt renders
inside a HELD-not-yet-resolved earlier typewriter run, which in practice only happens on a
re-render before the previous prompt was answered — rare, but worth the belt).

**Scope confirmed via `.btlBtn` exclusion**: `renderBattle()` (`src/orchestrator.js:316-339`) also
calls `panel(html, !!o.prompt)`, but its HTML has NO `.apMsg` element at all (it's a `.btl`
scoreboard structure) — `querySelector(".apMsg:not(.fadeOut)")` returns null for it, so
`typewriterReveal` never runs and battle buttons are unaffected by this change, matching
`docs/DRIVING-THE-GAME.md §4d`'s note that battle prompts are a separate mechanism.

#### FIX-10 — re-measure on resize/orientationchange (confirmed root cause; only root cause)

```js
// src/main.js, replacing the current resize listener (~line 161-168)
window.addEventListener("resize", () => {
  if (stateNs.appState.syncBoardRAF) return;
  stateNs.appState.syncBoardRAF = requestAnimationFrame(() => {
    stateNs.appState.syncBoardRAF = null;
    ui.syncBoardSizing();
    const inner = document.getElementById("apGridInner");
    if (inner) ui.resizePanel(!!inner.innerHTML);
  });
});
window.addEventListener("orientationchange", () => {
  ui.syncBoardSizing();
  const inner = document.getElementById("apGridInner");
  if (inner) ui.resizePanel(!!inner.innerHTML);
});
```

`resizePanel` is already exported from `panel.js` and already reachable as `ui.resizePanel` (main.js
does `import * as ui from "./ui/index.js"`, and `src/ui/index.js:12` does
`export * from "./panel.js"`) — no new import needed.

**Reused, not duplicated, debounce**: `stateNs.appState.syncBoardRAF` is the SAME rAF-batch flag
`syncBoardSizing()` already uses (this is the exact precedent the FIX-10 todo pointed at). Both
calls land in one rAF callback per resize burst — no new per-frame hazard is introduced, and this
only fires on genuine `resize`/`orientationchange` DOM events, never per-character or per-frame
during a normal typewriter reveal.

**ResizeObserver was considered and is NOT recommended** — see Common Pitfalls below for the
specific feedback-loop hazard.

**Path 2 (late-image / web-font measurement gap) is NOT present in current code** — see Summary.
Do not build a mitigation for it; it would be solving a problem the current source doesn't have.

#### FIX-16 — pin the ghost's real position; hold height until the fade completes

Root cause confirmed exactly as recorded: `.apMsg.fadeOut{position:absolute;inset:0}`
(`index.html:308`) both re-anchors the ghost to the padding-box corner (losing whatever offset it
had in flow → the jump) and takes it out of the DOM flow that `resizePanel()`'s
`inner.offsetHeight` reads (`src/ui/panel.js:228`'s own comment says so) → the box shrinks to the
INCOMING message's height alone while the OUTGOING (taller) ghost is still fading on top, and
`#apGridInner`'s `overflow:hidden` clips it rather than merely overlapping it.

```js
// src/ui/panel.js — panel(), BEFORE inner.innerHTML=html wipes the outgoing element
const outgoing = html ? inner.querySelector(".apMsg:not(.fadeOut)") : null;
const ghost = outgoing ? outgoing.cloneNode(true) : null;
// capture the REAL position, relative to #apGridInner's padding box, before it leaves flow
const ghostRect = outgoing ? {
  top: outgoing.offsetTop, left: outgoing.offsetLeft,
  width: outgoing.offsetWidth, height: outgoing.offsetHeight,
} : null;
inner.innerHTML = html;
if (ghost) {
  ghost.classList.add("fadeOut");
  ghost.style.top = ghostRect.top + "px";
  ghost.style.left = ghostRect.left + "px";
  ghost.style.width = ghostRect.width + "px";   // pins wrap width too, not just position
  inner.appendChild(ghost);
  const drop = () => {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    // cheap: re-apply the ALREADY-KNOWN new-content height — no new max-content reflow-probe
    resizePanel(!!inner.innerHTML);
  };
  ghost.addEventListener("animationend", drop, { once: true });
  setTimeout(drop, GHOST_FADE_MS + 70);
}
$("actionPanel").style.display = html ? "" : "none";
$("actionPanel").classList.toggle("needsAction", !!needsAction);
resizePanel(!!html, ghostRect ? ghostRect.height : 0);   // hold at the taller of the two
```

```js
// src/ui/panel.js — resizePanel() gains an optional floor, callers omitting it are unaffected
export function resizePanel(hasContent, minHeight = 0) {
  const grid=$("apGrid"),inner=$("apGridInner");if(!grid)return;
  if(!hasContent){grid.style.gridTemplateRows="0px";return;}
  const from=getComputedStyle(grid).gridTemplateRows;
  grid.style.transition="none";
  grid.style.gridTemplateRows="max-content";
  const h=Math.max(inner.offsetHeight, minHeight);
  grid.style.gridTemplateRows=from;
  void grid.offsetHeight;
  grid.style.transition="";
  grid.style.gridTemplateRows=h+"px";
}
```

```css
/* index.html:308 — remove inset:0, keep everything else */
.apMsg.fadeOut { animation: apMsgFadeOut .8s ease both; position: absolute; pointer-events: none; }
```

**Why the second `resizePanel()` call inside `drop()` is safe** (re-read the measure-once contract
above): it happens exactly once, ~800ms after the swap, triggered by a real timer/animationend —
never per character, never per frame. It also doesn't force a second `max-content` reflow-probe
against a MOVING target — it re-derives `inner.offsetHeight` at that point, which at that moment
holds only the (already-settled) new content, since the ghost has just been removed. This satisfies
criterion 4's spirit ("measures the finished height once per message" meaning "not once per
character/frame") without literally forbidding the one-time deferred shrink FIX-16 requires.

**Interaction with FIX-10's resize listener — a real edge case to design for.** If a window resize
fires WHILE a ghost is actively fading (rare but possible — e.g., a phone rotation mid-swap), the
resize-triggered `resizePanel()` call must ALSO respect the still-fading ghost's height floor, or it
will re-clip the ghost via the resize path, reintroducing FIX-16's bug through a different door.
Recommend tracking the active floor as module state in `panel.js` (e.g.,
`let activeGhostFloor = 0;` set when a ghost is created, cleared in `drop()`) and have the exported
`resizePanel(hasContent)` (the one `main.js` calls) read it: `resizePanel(hasContent)` internally
becomes `resizePanel(hasContent, activeGhostFloor)`, so both callers share one floor value.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting "content grew after I measured it" | A `MutationObserver`/`ResizeObserver` watching `#apGridInner` | The existing `resize`/`orientationchange` listener, extended | `#apGridInner`'s own box height is DRIVEN BY `resizePanel()`'s own writes (it's a stretched grid item under `#apGrid`'s pinned row) — observing it creates a feedback loop where resizePanel's own CSS transition fires the observer repeatedly during the .18s animation, exactly reproducing BUG-01's per-frame-remeasure hazard. See Common Pitfalls. |
| Coin/parenthetical line-break protection | Re-deriving a nowrap rule per call site each time a new narration line ships | A single small formatting helper (e.g., `coinDelta(n)` returning `<span class="nobrk">(${n>=0?"+":""}${n}🌕)</span>`) called from every site that builds a trailing signed-coin chunk | This is literally why Wyatt is confused that FIX-21 "still happens" — `.nobrk` already exists and already works at 2 of 6 sites; it was never applied everywhere because each site hand-builds its own string. A helper makes the correct thing the default, matching the `fmtItem()`/`ilabelImg()` precedent already in the file. |
| Pluralization detection for the win-banner article | A regex/heuristic (`/s$/`, vowel-letter check) | An explicit per-recipe `article` field on `RECIPE_BOOK`, exactly as the FIX-08 todo already specifies | Confirmed correct via the actual 21 titles: "Pots de Crème" is plural with no trailing s; "Chocolate Genoise Sponge Cake" is singular; any heuristic gets some of these wrong. A curated 21-item list is small enough that an explicit field is strictly simpler AND strictly more correct. |

**Key insight:** every non-trivial problem in this phase already has an existing, working mechanism
somewhere in this codebase (the `.nobrk` class, the `_revealDone` promise contract, the
rAF-debounced resize listener, `RECIPE_BOOK`'s per-recipe data pattern). The actual work is
**applying the existing mechanism everywhere it needs to be**, not inventing a new one — this
matches the pattern behind every one of the 10 fixes in this phase.

## Common Pitfalls

### Pitfall 1: ResizeObserver on `#apGridInner` creates a feedback loop
**What goes wrong:** `#apGridInner` is a grid item that stretches to fill `#apGrid`'s single pinned
row. `resizePanel()` sets that row's height directly via `grid-template-rows`. Observing
`#apGridInner`'s own box means observing a value `resizePanel()` itself controls.
**Why it happens:** `ResizeObserver` fires on every rendered-box-size change, including the ~180ms
CSS transition `resizePanel()` triggers on every message swap. That's 1 fire per animation frame of
the height transition — the exact per-frame remeasure shape that caused BUG-01's original Safari
crash, now on a different trigger.
**How to avoid:** Do not observe `#apGridInner`. If a future need genuinely requires watching for
content-driven (not resizePanel-driven) height changes, observe a wrapper that is NOT stretched by
the grid row (i.e., one with intrinsic/auto height, unaffected by the parent's pinned px value) —
no such wrapper currently exists, and building one is out of scope for this phase given the
resize-listener fix already covers the confirmed bug.
**Warning signs:** jank or a visible double-resize/flash on Safari specifically during message swaps
if this is attempted.

### Pitfall 2: the "late-loading image" theory is a red herring in the CURRENT codebase
**What goes wrong:** time spent building a fix for unsized `<img>` measurement gaps that don't exist.
**Why it happens:** the FIX-10 todo raised it as an unverified hypothesis ("verify before choosing
this remedy"). It was written before this research pass confirmed every inline icon in panel content
routes through `.narrIcon` (fixed CSS `18px × 18px`), and the project loads no web fonts.
**How to avoid:** don't build for it. If a NEW inline image is added later WITHOUT the `.narrIcon`
class (or a similarly fixed-size class), this could resurface — worth a one-line comment at the
`iconImg()`/`ilabelImg()` definitions noting the size-class dependency, but not a task for this phase.
**Warning signs:** a resize bug reproduces at a FIXED width with a cold cache but NOT after a resize
— if that combination is ever seen, revisit this pitfall.

### Pitfall 3: recurrence-by-omission is this phase's actual root cause for FIX-21 and FIX-04
**What goes wrong:** a fix that patches only the 1-2 sites a human happened to notice ships, and a
near-identical unpatched sibling site reports the same bug again later — this is EXACTLY what
already happened once with `.nobrk` (2 of 6 sites got it, 4 didn't) and is the shape of Wyatt's own
complaint ("I thought we fixed it in a different batch").
**Why it happens:** this codebase's narration strings are hand-built per call site with no shared
formatting helper and no static gate preventing a new site from omitting the wrapper class.
**How to avoid:** for FIX-21, sweep ALL sites (enumerated below in Code Examples), not just the two
Wyatt reported this time, and prefer a helper over a class applied ad hoc at each site.
**Warning signs:** grep for the pattern before considering the item done —
`grep -rn "🌕)" src/ui/*.js src/orchestrator.js | grep -v nobrk` should return nothing once fixed.

## Runtime State Inventory

Not applicable — this phase is not a rename/refactor/migration. No stored data, live service
config, OS-registered state, secrets, or build artifacts are affected by any of the 10 fixes.

## Code Examples

### FIX-04 — remove the windmove line, keep the capsule (option 1, per the todo's own recommendation)

```js
// src/ui/util.js:327 — CURRENT
windmove:(e,at,cellPx,viewerSeat)=>({txt:isLocalTo(e.p,viewerSeat)?`${pn(e.p)} — yer blown by the storm`:`${pn(e.p)} is blown by the storm`,caps:[[e.p,"🌬️ drifts"]]}),

// AFTER — drop txt, keep the capsule so the captains box still marks the drift
windmove:(e,at,cellPx,viewerSeat)=>({caps:[[e.p,"🌬️ drifts"]]}),
```
Verify what `describe()`'s default renders for an event with no `txt` key before shipping — the
todo flags this explicitly as needing a check, not an assumption. Also update
`scripts/bot_storm_narration_test.js` (it asserts storm narration strings byte-identically) and
record the removal against `copy-shipped-vs-approved-gate.md` (both viewer variants removed
together, per D-07/NARR-05).

### FIX-07 — the new empty-hold branch and the orchestrator-only field

```js
// src/orchestrator.js:622-650 — add spoilChosen, only true inside the genuine-choice branch
let spoil,spoilIng=null,spoilChosen=false;
...
if(canCoins&&hasIng){
  spoilChosen=true;   // <-- NEW: only reachable here, i.e. only a genuine bribe
  if(lose.strategy==="human"){ ... }
  else{ ... }
}else if(hasIng)mode="ing";else mode="coins";
...
appState.game.ev({t:"battle",a:att.idx,d:def.idx,rounds,winner:win.idx,spoil,spoilIng,spoilChosen});
```

```js
// src/ui/util.js:594-595 — replace the proxy test with the real one, absent-field-safe
const spoilN=e.spoilIng?null:parseInt(e.spoil,10);
const isBribe=e.spoilIng==null&&e.spoilChosen===true;   // was: spoilN>=5 (the proxy)
const isEmptyHoldFive=e.spoilIng==null&&!e.spoilChosen&&Number.isFinite(spoilN)&&spoilN>=5; // NEW
```

Add the new clause (neutral/winner and loser-addressed siblings, ruled verbatim by Wyatt):
```js
else if(isEmptyHoldFive)spoilClause=viewerIsLoser?`Ye give up ${spoilText}.`:`${pn(loser)} gives up ${spoilText}.`;
```
and the matching branch inside the loser-addressed composite (`util.js:625-634`)'s `if/else` chain.

**Absent-field default, engine/replay/simulator/31-fixture safety:** `e.spoilChosen===true` is a
strict check — any event without the field (every engine-generated event, since
`src/engine/index.js` is deliberately left untouched) evaluates `isBribe` to `false` and
`isEmptyHoldFive` to `Number.isFinite(spoilN)&&spoilN>=5`, which is exactly the OLD proxy behavior
for those events. This is the "claims least" safe default the todo specifies, and it means the
engine-only simulator path keeps its pre-existing (known, accepted-until-the-re-record) behavior
byte-for-byte — no fixture hash changes, because nothing in `src/engine/index.js` changes.

Update `scripts/narration_test.js:301-306` — the assertion "battle: 5-coin spoil renders the bribe
framing" currently encodes the bug (it doesn't distinguish empty-hold from genuine-bribe). Split it
into two cases: one fabricated event with `spoilChosen:true` (bribe) and one without (empty-hold →
new line), and re-point rather than delete, per the todo's own gate note.

### FIX-08 — the article field and the one-line banner consumer

```js
// src/ui/recipe.js — add `article` to each RECIPE_BOOK entry (default "a"; "" for the 8 plurals:
// Churros, Brownies, Cinnamon Snaps, Snickerdoodle Bites, Crispy Cocoa Snaps, Dark Chocolate Cream
// Puffs, French Pots de Crème, Mexican Chocolate Pots)
{ings:[...], title:"Cinnamon-Sugar Churros", article:"", desc:..., real:{...}},
{ings:[...], title:"Molten Chocolate Lava Cake", article:"a", desc:..., real:{...}},
// ...all 21 get an explicit article field, "a" or ""

// new helper, alongside recipeTitle()/winRecipeSpan() (src/ui/recipe.js:298-312)
export function recipeArticle(recipe){
  const info=recipeInfo(recipe);
  return info ? info.article : "a";   // the non-standard fallback ("Captain's X & Y Bake") is
}                                      // always singular — see recipeTitle()'s own fallback branch
```

```js
// src/ui/board.js:772 — the ONE line, coordinate with board-wind before touching (cross-workstream)
const article=recipeArticle(appState.game.players[w].recipe);
const victoryLine=!winRecipe?"":`<div class="victoryText">${pn(w)} baked ${article?`${article} `:""}${winRecipeSpan(w)} and won <b>Best Baker in the Caribbean!</b></div>`;
```
`import { recipeArticle } from "./recipe.js"` is added to `src/ui/board.js`'s existing import from
`./recipe.js` (it already imports `recipeTitle, recipeInfo, winRecipeSpan` at line 88).

Do NOT touch: `src/ui/board.js:525` (captains-box prow label), `src/ui/recipe.js:318`/`:327`
(recipe modal), `:374` (email subject), or `PASTRY_FILES`'s order (`src/ui/recipe.js:286-291`) —
all confirmed unaffected by an added `article` field, since it's a new key on existing object
literals, not a reorder.

### FIX-21 — the sites confirmed unwrapped (in addition to the 2 already correct)

```js
// src/ui/util.js:452 (aground) — currently unwrapped
const lossTag=lost!=null?` <span class="nobrk">(−${lost}🌕)</span>`:"";

// src/ui/util.js:530-531 (sidebet won) — currently unwrapped, 2 sites
`... 1🌕 + double yer bet <span class="nobrk">(+${e.delta}🌕)</span>`
`... <span class="nobrk">(+${e.delta}🌕)</span>`

// src/ui/util.js:533-534 (sidebet lost) — currently unwrapped, 2 sites
`... <span class="nobrk">(−${e.amt}🌕)</span>`

// src/ui/flow.js:1500 (turn-order draw consolation, the G27 line) — currently unwrapped
const rest=order.slice(1).map((i,k)=>`${pn(i)} <span class="nobrk">(+${k+1}🌕)</span>`).join(", ");

// src/ui/board.js:785 — THIS is the exact "quantity+unit" award case Wyatt described (def.unit
// values carry a LEADING SPACE — " sq", " rounds", " tails", " heads" — so the number and unit are
// currently two separately-breakable words inside one <b> tag)
<div class="awardStat">${b.def.stat}${b.value!=null?` — <b><span class="nobrk">${b.value}${b.def.unit||""}</span></b>`:""}</div>
```
Already correct, no change needed: `src/ui/util.js:645-647` (battleflee), `:654-655` (fishing).

**Recommended, not required this phase:** a small `coinDelta(n)` helper in `src/shared/index.js`
(alongside `iconImg`/`ilabelImg`) that every future signed-coin narration site calls instead of
hand-building the parenthetical, plus a static grep-style gate (matching the
`checkStormRainSeeded`-style "refuse rather than skip" pattern already in `scripts/ui_contract_check.js`)
asserting no `🌕)` pattern in `src/ui/*.js`/`src/orchestrator.js` appears outside a `.nobrk` span.
This directly answers Wyatt's "why does this keep happening" — worth raising as a discretionary
addition, not blocking the 5 required fixes above.

### FIX-06, FIX-09, FIX-17 — CSS-only, exact current locations

```css
/* FIX-06 — index.html:125-126, the one rule that drives all 12 buttons */
/* CURRENT: */
button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
button.primary:hover { filter: brightness(1.1); }
/* TARGET (footer-button recipe, index.html:146-147): */
button.primary { border: 1.5px solid #e89827; background: #fdf3e3; color: #8a5a12; }
button.primary:hover { background: #fae7cb; }
/* ALSO update index.html:334 or it reintroduces solid orange on hover for items 10-12: */
.apBtn.primary:hover { background: var(--accent); filter: brightness(1.1); }  /* -> match footer hover */
```
Re-check `.ahoyGlow` (`index.html:347`) visually on items 10-12 once the fill is pale — it was tuned
against a solid fill. Consider `.footerLeave`'s red recipe (`border:#b56464;background:#f8eaea;
color:#7e3535`) for "Aye, leave the game" (`index.html:1015`, drifted from the todo's `:871` note)
rather than orange, per the destructive-action design intent documented at `index.html:1012-1013`
(also drifted from `:869-870`).

```css
/* FIX-09 — index.html:165-166, .prowTop; index.html:192, .chip. Chips confirmed NOT clickable
   (no onclick anywhere in src/ui/board.js or util.js), so shrinking them has no tap-target cost. */
@media (max-width: 480px) {
  .prowTop { grid-template-areas: "dot name coins chips" ".   recipe recipe recipe"; }
  /* option A (least disruptive): shrink chips */
  .chip { width: 26px; height: 26px; }
  /* option B (matches the recipe row's own precedent, costs one row of height): */
  /* .prowTop { grid-template-areas: "dot name coins" ".  recipe recipe" "chips chips chips"; } */
}
```
This is a visual call Wyatt should see either way — present both live before locking one in.

```css
/* FIX-17 — 3 confirmed sites, 2 with drifted line numbers from the todo */
/* src/ui/util.js:110 — remove this span from buildPlayerRows() */
/* <span class="dot" style="background:${HEXCOL[i]}"></span>  <-- delete */

/* index.html:165-166 and :173 — drop the "dot" column AND area name in BOTH layouts */
.prowTop { grid-template-columns: 106px 40px 1fr; gap: 6px 6px;
  grid-template-areas: ".    .     recipe" "name coins chips"; align-items: center; }
@media (max-width: 480px) {
  .prowTop { grid-template-areas: "name coins chips" ". recipe recipe"; }
}
/* index.html:188 — the now-dead rule */
/* .player-row .dot { ... }  <-- delete */

/* src/ui/lobby.js:180 — remove the span (NOT index.html:576 as the todo recorded — the lobby's
   dot markup is generated in JS, in this file, not static HTML) */
/* <span class="dot" style="background:${HEXCOL[i]}"></span>  <-- delete */
/* index.html:758 (drifted from :576) — the now-dead rule */
/* .seat .dot { ... }  <-- delete */
```
`.seat` is a flex row (`display:flex;gap:10px`, `index.html:757`), not a grid — removing the dot
closes the gap automatically, no column bookkeeping needed there (unlike `.prowTop`).
**Check with Wyatt before shipping the lobby half**: the lobby dot may be the only seat-identifying
color before names lock in — his "everywhere" instruction (2026-08-01) overrides V13-17's earlier
"don't touch the lobby" carve-out, but the todo itself flags this as worth one confirming question.

## State of the Art

Not applicable in the conventional sense (no library/framework version drift to track) — every
mechanism this phase touches (`_revealDone` promise contract, ghost-fade, measure-once resize) was
built and tuned within the last several days of this same project (G8/G17/G28/BUG-01), and the
current code IS the state of the art for this codebase. The only "old approach → current approach"
worth recording is internal to this project:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `.apMsg.fadeOut` snapping to `inset:0` | Explicit captured `top`/`left`/`width` per-instance | This phase (FIX-16) | Removes the jump-left; makes the ghost's position independent of any future `#actionPanel`/`#apGridInner` padding change |
| `resize`/`orientationchange` only calling `syncBoardSizing()` | Also calling `resizePanel()` | This phase (FIX-10) | Closes the confirmed narrow-window/rotation clipping bug |
| `spoilN>=5` as a proxy for "chose to bribe" | An explicit `spoilChosen` field set only inside the real choice branch | This phase (FIX-07) | Removes the empty-hold false positive without touching the engine |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Option A (shrink chips to ~26px) vs. Option B (give chips their own full-width row) for FIX-09 — no visual mockup was rendered in this research pass, so which reads better on a real 320-390px phone is not verified here. | Code Examples, FIX-09 | Low — both are cheap CSS changes; picking the "wrong" one costs a follow-up CSS tweak, not a rework. Chips confirmed non-interactive removes the one real risk (broken tap targets). |
| A2 | The lobby `.seat .dot` removal (FIX-17) assumes seat color is not the ONLY way players distinguish an unnamed seat before names lock in. This research did not verify what other seat-identifying UI exists in the lobby besides the dot and the name text. | Code Examples, FIX-17 | Medium — if wrong, removing it makes the lobby harder to read before names are set. The FIX-17 todo itself already flags this as worth a direct question to Wyatt before shipping. |
| A3 | Whether the shot clock should start at reveal-completion rather than at prompt-render (currently `armClock(seat)` fires before `panel()` is even called) is presented as an open design question, not resolved here — Wyatt's own D-01 ruling ("shorten REVEAL_MS_PER_CHAR, don't re-couple") suggests leaving it as-is is the lower-risk default, but this is an inference from an adjacent ruling, not a direct statement about clock-start timing. | Open Questions | Low-Medium — worst case measured is ~2.8s (long prompt + ghost-fade delay) out of a 30s window; moving the clock start would also require deciding how to render a frozen countdown during the reveal, a UI question of its own. |

## Open Questions

1. **Should the shot clock start at reveal-completion instead of prompt-render?**
   - What we know: `armClock(seat)` (`src/ui/util.js:1157-1161`, called from `ask()`) fires and sets
     `shotClockDeadline=Date.now()+30000` BEFORE `panel()`/`localAsk()` ever render the prompt —
     strictly before the typewriter reveal begins. The longest realistic prompt text measured in
     this research (~100 visible characters, e.g. the side-bet invitation) takes `100 × 20ms =
     2000ms` to fully reveal; add `GHOST_FADE_MS=800ms` if this prompt REPLACES a prior line, for a
     worst-case ~2.8s of the 30s window (about 14% of the 20s pre-penalty grace window) spent before
     buttons are even clickable.
   - What's unclear: whether that cost is acceptable as-is, given Wyatt's D-01 ruling was about
     button-timing generally ("shorten `REVEAL_MS_PER_CHAR`, don't re-couple the buttons") and did
     not explicitly address the clock-start moment. Moving `armClock()` to fire from inside the same
     reveal-completion callback would also mean the shot-clock UI (`setClockUI()`,
     `src/ui/panel.js:51`) needs to render SOMETHING sane (a frozen "30" rather than a ticking
     number) during the 0-2.8s reveal window, which is a small UI design decision of its own.
   - Recommendation: keep the clock starting at prompt-render (no code change) as the default,
     consistent with D-01's spirit and the modest measured cost — but flag this explicitly for
     Wyatt at plan-review time rather than silently deciding it. If he wants the change, it's a
     one-line move of `armClock(seat)` plus a `setClockUI()` display tweak, not a structural change.

2. **FIX-09: shrink chips vs. give them their own row — which reads better?**
   - What we know: both are viable, pure-CSS, low-risk (chips confirmed non-clickable). Option B
     matches the precedent already set by the recipe row's own narrow-screen treatment in the same
     file.
   - What's unclear: the actual visual result on a real 320-390px device — not rendered in this
     research pass.
   - Recommendation: build both as a quick side-by-side (or default to Option B for consistency with
     the existing recipe-row pattern) and confirm with Wyatt during/after implementation rather than
     guessing; this is exactly the kind of small visual call the FIX-09 todo itself deferred.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3 (`python3 -m http.server`) | Local dev server for browser verification | Not probed this session — assume available per CLAUDE.md's documented workflow | — | None needed; this is the project's only serving mechanism |
| Chrome | Automatable browser verification (all 13 criteria except #1's Safari half) | Assumed available (standard dev machine) | — | — |
| Safari | Criterion 1 (narrow-window clipping) — explicitly requires a human on REAL Safari per ROADMAP.md | Human-only, cannot be probed by this agent | — | None — this criterion cannot be closed without Wyatt on his own Safari, matching the v1.2 Phase 17 precedent (`docs/DRIVING-THE-GAME.md` is Chrome/automation-oriented; Safari verification is explicitly out of its scope) |

**Missing dependencies with no fallback:** none that block implementation. Safari verification is a
human-required step, not a missing tool — flagged in Validation Architecture below, not here.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — custom `check(name, actual, expected)` / `checkTrue(name, actual)` harness, no assertion library, `process.exit(failures?1:0)`. Pattern used identically across all `scripts/*_test.js`/`*_check.js` files. |
| Config file | none — `package.json`'s `"test"` script chains 19 scripts with `&&` |
| Quick run command | `node scripts/narration_test.js` (FIX-04/FIX-07 text logic) or `node scripts/bot_storm_narration_test.js` (FIX-04) — each runs in well under a second, DOM-free |
| Full suite command | `npm test` (chains all 19 scripts, includes `determinism_baseline.js --verify` — MUST stay green per milestone constraint 1) |

**No browser/DOM test runner exists in this project** (confirmed: no `node_modules`, no
`jsdom`/`playwright`/`puppeteer` in `package.json`). Anything touching actual layout, CSS, or
in-browser timing (FIX-03, FIX-06, FIX-09, FIX-10, FIX-16, FIX-17) cannot be asserted by the
existing test harness — it requires a driven browser session per `docs/DRIVING-THE-GAME.md`, or a
manual visual check.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIX-04 | windmove narration has no txt, both variants removed together | unit (DOM-free) | `node scripts/bot_storm_narration_test.js` | ✅ (needs the assertion updated, not created) |
| FIX-07 | Empty-hold 5-coin loser gets the new line, not bribe framing; genuine bribe unaffected | unit (DOM-free) | `node scripts/narration_test.js` | ✅ (needs the assertion split, not created) |
| FIX-08 | Article omitted for the 8 plural recipes, present for the other 13 + the fallback | unit (DOM-free) — NEW, small: assert `recipeArticle()` against all 21 `RECIPE_BOOK` entries plus a fabricated non-standard recipe | none yet | ❌ Wave 0 gap — a ~15-line addition to `scripts/narration_test.js` or a new tiny script |
| FIX-21 | No unwrapped `(±N🌕)` chunk in narration source; award stat+unit wrapped | static source check — NEW | `grep -rn "🌕)" src/ui/*.js src/orchestrator.js \| grep -v nobrk` (manual) or a proper `scripts/*_check.js` in the `checkStormRainSeeded` style | none yet | ❌ Wave 0 gap if the "build a permanent gate" recommendation is taken up; otherwise a one-time manual grep suffices for this phase |
| FIX-03 | Buttons invisible (not display:none) until `_revealDone` resolves; visible immediately under reduced-motion | manual/driven-browser — read the class + `getComputedStyle(btn).visibility` mid-reveal via a driven Chrome session (`docs/DRIVING-THE-GAME.md §6`, `window.__pp_app_state_debug()`/direct module import) | none (browser-only) | ❌ no automated coverage possible in this project |
| FIX-10 | Resize/rotate at 320/375/390 never clips the button | **manual, Safari required for criterion 1** — Chrome half can be driven (resize the window via CDP/devtools, click `.sailCell`, read `getBoundingClientRect()` on `.apBtn`) | none (browser-only) | ❌ Chrome half automatable via a driven session; Safari half is human-only |
| FIX-16 | No jump on fade-start; no clip before fade completes | manual/driven-browser — `docs/DRIVING-THE-GAME.md §7`'s `el.getAnimations()[0].effect.getKeyframes()` technique can verify the ANIMATION curve/timing objectively; the VISUAL "did it jump" judgment is a human check | none (browser-only) | ❌ timing verifiable via driven session; visual judgment is human |
| FIX-06, FIX-09, FIX-17 | Visual restyle correctness | manual/visual, screenshots via a driven browser session at the relevant widths | none (browser-only) | ❌ no automated coverage; this is inherent to a CSS-only visual change with no snapshot-testing infra in this project |

### Sampling Rate
- **Per task commit:** `node scripts/narration_test.js && node scripts/bot_storm_narration_test.js`
  (fast, covers FIX-04/FIX-07/FIX-08's text-logic surface)
- **Per wave merge:** `npm test` (full 19-script suite — MUST stay green; this is the determinism
  guard per milestone constraint 1)
- **Phase gate:** full suite green, PLUS a driven-Chrome pass exercising FIX-03/10/16's timing
  (per `docs/DRIVING-THE-GAME.md`), PLUS Wyatt on real Safari for criterion 1 (cannot be
  substituted or automated — this project's own history is explicit that Safari is where the
  original near-crash happened and where it must be re-verified)

### Wave 0 Gaps
- [ ] A small article-mapping test for FIX-08 (`scripts/narration_test.js` addition or a new
      script) — covers the 21-entry `RECIPE_BOOK` + fallback case
- [ ] A static `.nobrk`-coverage check for FIX-21 if the "permanent gate" recommendation is taken up
      (discretionary — not required to close the 5 required fix sites, only to prevent a 4th
      recurrence)
- [ ] No framework install needed — this project deliberately has none

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase touches no auth surface |
| V3 Session Management | No | Phase touches no session/room logic |
| V4 Access Control | No | Phase touches no permission logic |
| V5 Input Validation | Marginal — the win-banner article and all narration text render into `innerHTML` | Existing `escHtml()` (`src/ui/recipe.js:24`) already escapes recipe titles at every render site including the new `winRecipeSpan()` call; no NEW user-controlled input is introduced by any of the 10 fixes (article field is static data, spoilChosen is a boolean derived from existing game state, not user text) |
| V6 Cryptography | No | Not applicable |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| HTML injection via unescaped narration text | Tampering/Information Disclosure | Already mitigated project-wide via `escHtml()`/`pname()`'s escaping chain; this phase adds no new unescaped interpolation point — `spoilChosen` is a boolean, `article` is a static per-recipe string authored in source, not derived from any player-supplied text |

This phase has effectively no new attack surface: it is copy, CSS, and one new internally-derived
boolean event field. No new user input, no new network payload shape beyond the additive
`spoilChosen` field (which follows the exact same optional/additive-field precedent already used
for `holdMs`/`variants` in `flash()`).

## Sources

### Primary (HIGH confidence — direct source read this session)
- `src/ui/panel.js` (full file) — `panel()`, `resizePanel()`, `typewriterReveal()`, `GHOST_FADE_MS`,
  `REVEAL_MS_PER_CHAR`, the entire G8/G17/G28/BUG-01 comment history
- `src/orchestrator.js` — `asyncBattle`'s spoil branch (622-650), `renderBattle`/`battleFooter`
  wiring (310-352), `watchDraftPrompt`/remote-prompt rerender (970-1075), the final-round barrier
  (840)
- `src/ui/util.js` — `EVENT_NARRATION` table (300+), `isBribe`/spoil clauses (585-635),
  `buildPlayerRows` (80-115), `msgHoldMs`/`HOLD_*` constants (942-951), `armClock`/`startShotClock`
  (1157-1246), `aground`/`sidebet` narration (440-535)
- `src/ui/recipe.js` (full file) — `RECIPE_BOOK`, `recipeTitle`, `winRecipeSpan`, all 21 titles
- `src/ui/board.js` — the win-banner line (772), `syncBoardSizing` (831+)
- `src/ui/flow.js` — `localAsk` (73-101), `netIntroBarrier`/`showTurnOrderIntro` (1441-1504)
- `src/ui/lobby.js` — `renderSeatList`'s `.dot` markup (180)
- `src/main.js` — the resize/orientationchange listener (155-168), module wiring
- `index.html` (CSS block) — `#actionPanel`/`#apGrid`/`#apGridInner`/`.apMsg.fadeOut`/`.nobrk`
  (260-395), `.prowTop`/`.chips`/`.chip` (149-200), `.seat .dot` (745-762), all 8 static
  `button.primary` sites (845-1026)
- `src/engine/index.js` — the simulator-only spoil branch (566-581)
- `scripts/narration_test.js`, `scripts/determinism_baseline.js`, `scripts/ui_contract_check.js` —
  test-harness conventions, the "refuse rather than skip" gate pattern
- `package.json` — confirmed test-runner shape, zero dependencies
- `docs/DRIVING-THE-GAME.md` (full file) — driving/verification technique constraints

### Secondary (MEDIUM confidence)
- The 11 per-item todo notes in `.planning/todos/pending/` — used as the starting hypotheses for
  this research; every file:line claim in them was independently re-verified against current
  source (see Phase Requirements table above for the confirmed drifts)

### Tertiary (LOW confidence)
- None — this phase required no external/web research; it is entirely internal-codebase archaeology

## Metadata

**Confidence breakdown:**
- Standard stack: N/A — no dependencies
- Architecture (the interlocking group's design): HIGH — every claim traced to a specific
  currently-read line, the measure-once contract's actual constraint (not just its literal wording)
  is understood, and the ResizeObserver/late-image hazards were reasoned through against the real
  DOM structure rather than assumed
- Pitfalls: HIGH for the two technical ones (ResizeObserver feedback loop, late-image non-issue) —
  both derived from reading the actual CSS/markup, not speculation
- FIX-09/FIX-17 visual calls: MEDIUM — code-level facts (grid structure, non-interactivity of chips)
  are HIGH confidence; the actual "which option looks better" is unverified without a rendered
  screenshot, correctly logged as Open Questions rather than asserted

**Research date:** 2026-07-31
**Valid until:** this codebase changes fast (multiple same-day revisions to the exact code this
phase touches, per the G8/G17/G28 history in `panel.js`'s own comments) — treat line numbers as
valid for ~7 days; re-verify against current source before executing any task in this phase if
planning is delayed.
