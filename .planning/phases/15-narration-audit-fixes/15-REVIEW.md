---
phase: 15-narration-audit-fixes
reviewed: 2026-07-30T00:00:00Z
depth: deep
diff_base: de30047
head: aec5e57
files_reviewed: 17
files_reviewed_list:
  - index.html
  - src/net/writers.js
  - src/orchestrator.js
  - src/shared/index.js
  - src/ui/board.js
  - src/ui/flow.js
  - src/ui/lobby.js
  - src/ui/panel.js
  - src/ui/util.js
  - art-review/narration-core.js
  - scripts/lib/tiny_dom.mjs
  - scripts/lib/audit_page_headless.mjs
  - scripts/host_guest_parity_check.js
  - scripts/narration_audit_check.js
  - scripts/narration_flow_test.js
  - scripts/narration_test.js
  - scripts/ui_contract_check.js
findings:
  critical: 3
  warning: 14
  info: 4
  total: 21
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-07-30
**Depth:** deep (cross-file: coin-debit call chains, async ordering, gate reachability)
**Files Reviewed:** 17 of the 26 in the diff
**Status:** issues_found

## Summary

I read the shipped source and the gate scripts as code, against the four things the brief asked
about. `npm test` is green (23/23 assertion groups) and `src/engine/index.js` is byte-identical, so
nothing here threatens the determinism fixtures. Everything below is UI-tier or tooling.

**What holds up.** The G6 `coinShortfall()` helper is correct arithmetic (`Infinity` for a negative
or non-finite debit is the right call, and it is exercised by a real invariant sweep in
`narration_flow_test.js`). All eight COIN-AUDIT sites are guarded, and `asyncBattle`'s guard is
placed correctly — at the very top, before the opening broadcast, so no snapshot can be in flight.
The one place I expected the guard to be defeated (the `await flash()` between the check at
`orchestrator.js:414` and the debit at `:421`) is safe, because `withShotClock` calls
`stopShotClock()` the moment the preceding `ask()` resolves, so no clock is armed across that gap.
The host/guest parity gate is genuinely non-vacuous (7/7 tokens matched on both sides today) and its
drill mode is real.

**What does not.** Three findings are, in my reading, shipping defects rather than judgement calls:
one visual (the approved 800ms fade never runs — it is cut at 250ms by a stale belt timer, leaving
the box empty), one state-corruption (the G6 pass re-validated **coins** at the interleave sites but
not **crates**, and `humanTrade` has no `turnExpired` guard at all, so a timed-out partner
auto-accepts a trade whose crate the shot clock may have just confiscated), and one economy bug that
mints coins on every battle flee.

The gate scripts are better than the four vacuous checks caught this week, but I found four more
weak spots — two of them in the very assertion (`ui_contract_check` #6) written to prevent F11, and
two in `narration_audit_check`'s conditional assembly, where an assertion silently *disappears* from
the results list rather than failing when its input is missing.

I did **not** fully read `art-review/narration-audit.html` (3177 lines) or
`scripts/extract_narration_lines.js` (1315 lines); I exercised them through the headless harness and
grepped them, but a line-by-line read of those two is still owed.

---

## Critical Issues

### CR-01: The approved 800ms narration fade is truncated to 250ms, and the box goes empty

**File:** `src/ui/panel.js:264` (with `:241` and `index.html:289`)
**Severity:** BLOCKER

G28 lengthened the ghost fade from 180ms to 800ms in three places — `GHOST_FADE_MS=800`
(`panel.js:241`), the CSS `animation: apMsgFadeOut .8s` (`index.html:289`), and the reveal delay
that consumes `GHOST_FADE_MS` (`panel.js:285`). It did **not** update the belt timer:

```js
ghost.addEventListener("animationend",drop,{once:true});
// belt: animationend can be dropped entirely in a backgrounded tab...
// Comfortably clear of the 180ms animation.
setTimeout(drop,250);          // <-- still 250
```

`animationend` now fires at 800ms, so the 250ms `setTimeout` **always wins**. Every replaced
narration line is therefore ripped out of the DOM at 250ms, roughly 30% into an ease curve — it
pops away at about 70% opacity instead of fading. Meanwhile `typewriterReveal` is told to wait the
full `GHOST_FADE_MS=800` before its first tick.

**Failure scenario (every single replaced line, in every game):**
1. t=0 — `panel()` clones the outgoing line as a ghost, inserts the incoming line blanked, and
   schedules the incoming reveal for t=800.
2. t=250 — the belt fires. The ghost is removed mid-animation. The outgoing line disappears
   abruptly, which is the "cut" G8 and G28 both explicitly rejected.
3. t=250–800 — **the narration box is empty for 550ms.** F6's stated invariant is *"the blue box
   should never be empty"*, and G28's stated purpose for the longer fade was *"to let the player
   know that the text is about to leave, so they can hurry up and read it."* Neither happens.
4. t=800 — the incoming line starts typing.

So the change Wyatt watched and approved is not what ships. `narration_test.js:955` pins only the
CSS side (`.8s`), which is why this passed.

**Fix:**
```js
// derive the belt from the fade so the two cannot drift again
setTimeout(drop,GHOST_FADE_MS+70);
```
and re-word the comment, which currently says "Comfortably clear of the 180ms animation."

---

### CR-02: `humanTrade` settles a trade after a shot-clock expiry it never checks — a timed-out partner auto-accepts, and the wrong crate can move

**File:** `src/ui/flow.js:805`, `:875`, `:886–888` (and the same shape at `:839`, `:846–848`)
**Severity:** BLOCKER

The G6 pass re-validated **coins** after every interleaving `await`. It did not re-validate
**crates**, and `humanTrade` is the one prompt flow in the file with no `appState.turnExpired`
guard after its awaits at all — compare the bot-hail path, which does check
(`flow.js:1199`, `:1205`).

Two things happen inside `expireShotClock` (`orchestrator.js:224–262`), in this order:

```js
appState.turnExpired=true;
if(appState.shotClockForce){appState.shotClockForce();...}   // :238  resolves the pending ask()
...
if(p.ing.length){ lost=p.ing.splice(idx,1)[0]; ... }          // :246  confiscates a random crate
```

`shotClockForce()` only *resolves* a promise, so `humanTrade`'s continuation runs as a microtask —
after `expireShotClock` reaches its first `await` at `:251`, i.e. **after** the crate is already
gone. And `ask()` forces the default index `0` (`util.js:1065`, `withShotClock(seat,base,0)`), which
for the accept prompt is:

```js
accept=await ask(`${pn(q.idx)}: accept ${offerDisplay} for yer ${ilabelImg(want)}?`,
  [{label:`… Accept`,value:true},{label:`… Decline`,value:false}]);   // opts[0].value === true
```

**Failure scenario:**
1. Multiplayer, human-to-human trade. P offers a crate for Q's `vanilla`.
2. Q sits on the accept prompt for 30 seconds.
3. `expireShotClock` forces `accept = true` (Q "accepted" by doing nothing), then confiscates a
   random crate from Q — which may be the `vanilla` being traded.
4. `flow.js:875`'s guard passes (`accept` is true, coins are fine).
5. `flow.js:886` runs `q.ing.splice(q.ing.indexOf(want),1)`. `indexOf` returns **-1**, so
   `splice(-1,1)` removes Q's **last** crate — a different ingredient than the one negotiated.
   `p.ing.push(want)` then hands P the `vanilla` that no longer exists anywhere, and
   `game.tokens[]` is not adjusted, so the crate is created out of nothing.
6. If Q's hold is now empty, `splice(-1,1)` removes nothing at all and P still gets a free crate.

Even without the -1 case, step 3 alone is a bug: a player who times out has a trade *executed* on
their behalf rather than declined. That is strictly worse than the timeout forfeit itself.

The counter-offer branch (`:839–848`) has the identical shape on the giving side: the clock is armed
for P, and `p.ing.splice(p.ing.indexOf(give.ing),1)` at `:848` can be -1 if P's crate was the one
confiscated.

**Fix (two parts):**
```js
// after every ask() in humanTrade, matching every other prompt flow in the file
if(appState.turnExpired)return true;
// and, at each settlement, re-validate the crate the way G6 re-validates the coin
const wi=q.ing.indexOf(want); if(wi<0){ /* route to the existing decline path */ }
q.ing.splice(wi,1);
```
Extending G6's "re-validate after the await" rule from coins to crates would close the whole class,
not just this site.

---

### CR-03: A battle flee refunds a side-bet stake that was never taken — free coins, silently

**File:** `src/orchestrator.js:576` (with `src/ui/flow.js:1388`, `:1405`, `:1424–1426`)
**Severity:** BLOCKER

`collectSideBets` records a stake but **never debits it**:

```js
bets.push({idx:s.idx,on:who,amt});      // flow.js:1388 — no p.coins-= anywhere in this function
```

The stake is only ever taken at settlement, inside the delta:

```js
const delta=won?1+2*amt:-amt;
p.coins+=delta;                          // flow.js:1425-1426
```

But the flee path treats the stakes as if they had been escrowed:

```js
for(const bet of bets)appState.game.players[bet.idx].coins+=bet.amt; // no winner — refund side bets
fled=true;
...
if(fled)return;                          // orchestrator.js:590 — settleSideBets never runs
```

**Failure scenario:** three-plus players; a spectator backs a call with 5 coins (or "all in"). The
defender flips double-tails and pays 1 coin to flee. The bettor's purse goes **up by 5**. Nothing
was ever deducted, so this is pure minting. It also emits no `sidebet` event and no narration, so
the coins appear in the panel with no line explaining them — the same silent-drift property that let
F12 survive a whole playtest.

With four seats and three spectators betting up to their whole purse, a single flee can inject
double-digit coins into the economy.

**Fix:** either debit at collect time (and keep this line as a genuine refund), or delete the line
so a fled battle simply voids every stake:
```js
// stakes are only ever taken at settlement, so a voided battle needs no refund
```
Whichever way, `settleSideBets`'s `-amt` and this `+amt` must be describing the same escrow model;
today they describe two different ones.

---

## Warnings

### WR-01: `_lastSweptEvIdx` is module state that survives across games

**File:** `src/ui/flow.js:373–385`
**Severity:** WARNING

```js
let _lastSweptEvIdx=-1;
...
if(_lastSweptEvIdx===n-1)return;
_lastSweptEvIdx=n-1;
```

Nothing resets this on "Play again", on `resumeSoloGame`, or when `appState.game` is replaced. The
guard compares an absolute index into `game.events`. In a second game in the same tab, if a
`tradewind` event happens to land at exactly the index that was last swept in the previous game, the
sweep is silently skipped and the ship teleports — the exact symptom G14 exists to remove, appearing
nondeterministically and only after the first game.

**Fix:** key the guard on identity rather than index, or reset it wherever the game object is
replaced:
```js
let _sweptGame=null,_lastSweptEvIdx=-1;
if(_sweptGame!==g){_sweptGame=g;_lastSweptEvIdx=-1;}
```

### WR-02: The rim sweep has no supersession token — a guest's ship can be dragged backwards

**File:** `src/ui/flow.js:396–405`, driven from `src/orchestrator.js:974`
**Severity:** WARNING

`watchEvents`'s Firebase callback is `async` and `await`s the sweep. Firebase delivers the next
`child_added` immediately; that second invocation pushes its event, sets `evIdx`, and calls
`render()` — which repaints every ship from the *new* snapshot. The first invocation's loop is still
running:

```js
for(const c of path){ paintShipAt(seat,c); await sleep(RIM_SWEEP_STEP_MS); }
finally{ paintShipAt(seat,to); }        // `to` is the OLD event's position
```

Nothing checks whether the sweep has been superseded. So after `render()` snaps the ship to its true
square, the still-ticking loop paints it back onto the arc, and the `finally` block finishes by
pinning it at the *stale* `to`. The comment at `orchestrator.js:970-973` claims "an event arriving
mid-sweep harmlessly snaps the ship to its true square on the next paint" — true, but the sweep
un-snaps it on the very next tick, which is the opposite of harmless.

**Failure scenario:** a long arc (~10 squares ≈ 950ms) on a guest while the host is pushing events
quickly — a bot's rim escape followed immediately by the bot's dock/fish action. The guest sees the
ship arrive, jump back to the arc, and finish somewhere it is not.

**Fix:** capture the event count at entry and abort when it moves:
```js
const gen=g.events.length;
for(const c of path){ if(g.events.length!==gen)return; paintShipAt(seat,c); await sleep(...); }
finally{ if(g.events.length===gen)paintShipAt(seat,to); }
```

### WR-03: `narrateCurrent()` broadcasts every bot-driven event with no per-seat variants

**File:** `src/ui/util.js:1107`
**Severity:** WARNING

```js
if(e.t==="turn"){await netHandlers().onFlash(`🧭 ${pn(e.p)} takes the wheel…`,undefined,undefined,[{seat:e.p,html:...}]);return;}  // :1102 — variants
...
const L=appState.logLines[appState.evIdx];if(L)await netHandlers().onFlash(L.txt);                                                  // :1107 — NO variants
```

`logLines` is built with `NEUTRAL_VIEWER` (`syncLogLines`, `:773`), so `L.txt` is deliberately
third-person. Passing it to `flash()` with no `variants` array means **every event narrated on a
bot's turn is neutral for every seat** — including events that name a human (`blocked` with
`e.other`, `trade`, `battle`, `battleflee`, `parley`). `narrateLastEvent` (`panel.js:522-530`) does
compute `narrationVariants(e)` for the same event types on a human's turn.

Net effect: when a bot blocks you, attacks you, or trades with you, you read "Crustbeard spots Davy
Scones dead ahead"; when a human does the identical thing, you read "…ye spot…". D-18's rule is
"the only axis of variation is who's reading, never who acted" — this varies on who acted.

**Fix:**
```js
const e2=appState.game.events[appState.evIdx];
if(L)await netHandlers().onFlash(L.txt,undefined,undefined,narrationVariants(e2));
```
(and confirm with Wyatt, because a plausible alternative reading is that bot beats are meant to stay
neutral — in which case the D-18 comment needs correcting instead.)

### WR-04: `ui_contract_check` assertion 6a examines zero call sites, and its regex cannot see the bug it was written for

**File:** `scripts/ui_contract_check.js:484`
**Severity:** WARNING

Live output today: `co-reachability ... [3 explanation var(s), 0 chain(s), 5 disabled option(s)]`.
**Zero chains** — 6a currently checks nothing, because F11's fix converted the `else if` chain to
independent `if`s and 6a `continue`s when `chain.length === 0`.

That alone would be defensible as a regression guard. The problem is the regex:

```js
const armRe = new RegExp(`^\\s*(\\}?\\s*else\\s+)?if\\s*\\((.+?)\\)\\s*${name}\\s*=(?!=)`);
```

It requires the assignment to sit on the **same line, immediately after the closing paren, with no
brace**. Re-introducing F11 in any of the ordinary shapes evades it entirely:

```js
if(targets.length&&!canAfford){sub=`…`;}        // brace — no match
else if(tradeOpp.length&&!canTrade)             // newline before the assignment — no match
  sub=`…`;
```

So the assertion is both vacuous today and unable to catch a recurrence written naturally. The
`--drill` red-proof passes because the synthetic fixture is written in exactly the one shape the
regex accepts.

**Fix:** parse the if/else-if chain by brace balance rather than by line shape, or at minimum accept
`{`, a newline, and a following-line assignment. Also add a floor assertion so `0 chains` is
reported as a warning rather than a pass.

### WR-05: `ui_contract_check` assertion 6b silently skips `disabled:` options that are not written `!flag`

**File:** `scripts/ui_contract_check.js:522`
**Severity:** WARNING

```js
for (const m of line.matchAll(/disabled\s*:\s*!([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
```

The leading `!` is mandatory. There are six real `disabled:` option sites under `src/`; the gate
reports five. The one it skips is:

```js
opts.push({label:"Anchor safely (−1🌕)",value:"pay",disabled:broke});   // src/ui/flow.js:465
```

and the source comment two lines above it claims the opposite:

> `// The reason is supplied ONLY when broke — ui_contract_check.js assertion 6 requires a`
> `// disabled option's reason to be reachable in the state it explains.`

It does not. G10's greyed anchor button is ungated, and the comment will keep a future reader from
noticing.

**Fix:** match `disabled\s*:\s*(!?)([A-Za-z_$][\w$]*)` and drive the reason search off the flag name
with the polarity taken from the captured `!`.

### WR-06: `narration_audit_check` assertions vanish from the results list instead of failing

**File:** `scripts/narration_audit_check.js:764–767`, `:1187`, `:1184`
**Severity:** WARNING

```js
if (opts.cards) results.push(checkCardText(opts.cards, opts.core));
if (opts.core) results.push(checkTableBaseline(opts.core, opts.baselineText));
if (opts.migration) results.push(checkMigration(opts.migration));
...
if (opts.headless) results.push(checkLiveRender(opts.headless, opts.cards || []));
```

and upstream:

```js
const dispositions = readJson(".planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json");
const migration = dispositions && aliases ? { ... } : null;     // :1187
```

`readJson` swallows every error and returns `null`. So if that `.planning/` file becomes unreadable,
**assertion 8 is not run and not reported** — the summary line simply changes from `23/23 PASS` to
`22/22 PASS`, and nothing pins the expected assertion count. This is the "a gate that cannot fail"
class, and its trigger is not hypothetical: `.planning/` is archived by this project's own
`/gsd-cleanup` and stripped by `/gsd-pr-branch`.

Two more instances in the same area:
- `exportEraInventory` is read via `git show ddefa8f:art-review/narration-inventory.json`
  (`:1184`) inside a `try/catch → null`, and `checkMigration` then does `if (exportEraInventory)`
  (`:578`). On a shallow clone, a filtered PR branch, or after any history rewrite, the reciprocal
  half of assertion 8 — the half the comment calls "the RECIPROCAL, which prose alone cannot
  enforce" — silently disappears while the assertion still reports PASS.
- `checkLiveRender(opts.headless, opts.cards || [])` passes an **empty** core-card list when the
  card build failed, and the coverage test is `coreIds.filter(id => !rendered.has(id))` — empty in,
  zero missing out, PASS.

**Fix:** assert the results array length against an expected constant, and turn each `if (opts.x)`
into an explicit failing assertion when `x` is absent, exactly the way
`checkStormRainSeeded` already refuses to skip when it cannot find its anchors
(`ui_contract_check.js:718-723` — that one is the right pattern; copy it).

### WR-07: Nothing gates `GHOST_FADE_MS` against the CSS duration it is required to equal

**File:** `src/ui/panel.js:241`, `index.html:277`, `scripts/narration_test.js:955`
**Severity:** WARNING

Both source files carry a shouted comment — *"THIS NUMBER LIVES IN EXACTLY TWO PLACES … MOVE THEM
TOGETHER"* — and `narration_test.js` pins only the CSS half:

```js
checkTrue("G28: the fade runs at .8s …", /animation:\s*apMsgFadeOut\s+\.8s/.test(fadeRule));
```

There is no assertion that `GHOST_FADE_MS` matches it. A change to either one alone ships green,
which is the precise failure the comment predicts. (It is also how CR-01 got in: the third dependent
constant, the 250ms belt, has no assertion either.)

**Fix:**
```js
const ms = Number(/apMsgFadeOut\s+([\d.]+)s/.exec(fadeRule)[1]) * 1000;
check("G28: GHOST_FADE_MS equals the CSS fade duration", ghostFadeMsFromSource, ms);
check("G28: the ghost-removal belt outlasts the fade", beltMsFromSource > ms, true);
```

### WR-08: `captions()` is dead — and every `caps:` entry with it

**File:** `src/ui/util.js:792` (and ~20 `caps:[…]` entries at `:327–684`)
**Severity:** WARNING

```js
export function captions(e){ const fn=EVENT_NARRATION[e.t];if(!fn)return []; const r=fn(e,NO_AT); return (r&&r.caps)||[]; }
```

`captions` has **zero callers** anywhere in `src/`, `index.html`, `scripts/` or `art-review/` — only
comments referring to it. Its sole purpose is to read the `caps` field, so every `caps:` array in
`EVENT_NARRATION` is dead too: `"⛵ sails −1🌕"`, `"⚫T aground! 💥 −half 🌕"`,
`"⚔️ wins! +${spoilText}"`, and about twenty more. That is player-facing copy that renders nowhere,
is not in the audit inventory, and is being maintained in step with live wording (G3 explicitly
updated the battle caption at `:636`).

This is exactly the class D-33/D-34/D-40 are cited throughout the file to prevent, and it is
awkward for a phase whose subject is auditing copy.

**Fix:** either delete `captions()` and every `caps:` field, or restore the mini-log surface that
consumed them. This is Wyatt's call, not mine — but it should not stay in limbo while wording passes
keep updating it.

### WR-09: `describe()` output is broadcast verbatim, and assertion 7 cannot see it

**File:** `src/orchestrator.js:794`, `:818`; comment at `src/ui/util.js:695–701`
**Severity:** WARNING

```js
await flash(describe(appState.game.events[appState.game.events.length-1]).txt,900);
```

`describe(e)` is `describeFor(e, undefined)`, which resolves each builder's viewer branch against
the **live `appState.mySeat`** — i.e. the host's own seat. `flash()` broadcasts its first argument to
every client. That is F7's exact shape.

It is safe *today* only because both call sites narrate `newround`, which D-09 deliberately excludes
from viewer branching. It is not structurally safe, and the comment that governs it points the wrong
way:

> `// describe()'s remaining callers are the message-box round-header flashes, which should stay addressed.`

If those flashes ever *were* addressed, they would be a delivery bug. Assertion 7 in
`ui_contract_check.js` cannot catch it: `LOCAL_VIEWER_RE` tests the literal text of the content
argument, and the branching is hidden one call deep inside `describe()`.

**Fix:** use `describeFor(e, NEUTRAL_VIEWER)` at both sites (byte-identical output today, since
`newround` has no branch), delete the misleading sentence, and — if `describe()` then has no callers
— retire it. Optionally extend assertion 7 to flag `describe(` inside a broadcast content argument.

### WR-10: Battle narration can read "Ye give up all ye have: 0🌕."

**File:** `src/ui/util.js:606–633`, fed by `src/orchestrator.js:606`
**Severity:** WARNING

```js
if(mode==="coins"){const take=Math.min(5,lose.coins);lose.coins-=take;win.coins+=take;spoil=take+" coins";}
```

`mode` falls through to `"coins"` whenever the loser has no crates, regardless of purse. A loser
with 0 coins and an empty hold yields `spoil === "0 coins"`, which `spoilText` (`:571`) renders as
`"0🌕"` — truthy, so the guard at `:615`/`:632` appends it:

> ⚔️ Crustbeard wins 2–1 — ye give up all ye have: 0🌕.

Reachable in ordinary play (a player who has just been shipwrecked or cleaned out and is then
attacked). G3 did not introduce it — it read `: 0 coins` before — but G3's whole subject was this
clause, so it is the right moment to close it.

**Fix:** treat a zero take as no spoil:
```js
const spoilText=e.spoilIng?ilabelImg(e.spoilIng):(spoilN===0?"":(/ coins/.test(e.spoil)?fmtItem(e.spoil):e.spoil));
```

### WR-11: `tiny_dom` will throw on re-parenting a text node, and its innerHTML round-trip is not exact

**File:** `scripts/lib/tiny_dom.mjs:330–342`, `:226–231`, `:423–429`
**Severity:** WARNING

Three defects in the hand-rolled shim, all tooling-only but all capable of turning a real page
regression into a confusing harness crash:

1. **`TextNode` has no `remove()`.**
   ```js
   appendChild(node){ if (node.parentNode) node.remove(); ... }   // :331
   insertBefore(node, ref){ ... if (node.parentNode) node.remove(); ... }   // :338
   ```
   `class TextNode` (`:216–224`) defines only `textContent`. Moving an already-parented text node
   throws `node.remove is not a function`. The page does not do this today; the day it does, the
   gate reports a fatal that looks like a page bug.

2. **`serialize()` does not escape attribute values.**
   ```js
   const attrs = Object.entries(node.attrs).map(([k, v]) => ` ${k}="${v}"`).join("");   // :228
   ```
   The header claims *"`innerHTML` round-trips exactly"*, which the page's D-38 sign-rule regex scan
   depends on. Any attribute value containing `"` produces malformed HTML on the way back out.

3. **`Document.querySelector`/`getElementById` never test `documentElement` itself.** `_walk`
   (`:367–373`) visits children only, so `document.querySelector("html")` and an id on `<html>`
   return `null`.

**Fix:** add `remove()` to `TextNode`, escape `&"<>` in `serialize`'s attribute values, and have the
`Document` helpers test `documentElement` before walking.

### WR-12: `windLeg` silently converts a chosen "Anchor safely" into a forced coin flip

**File:** `src/ui/flow.js:508`
**Severity:** WARNING (judgement call — flagged, not asserted as wrong)

```js
if(v==="pay"&&!coinShortfall(1,p.coins)){p.coins--;...}
else{ const h=await humanFlip(p,"Flip to dodge!"); ... }
```

The comment says this is deliberate: *"a shortfall falls through to the EXISTING flip branch below,
which is what a captain with no coin gets anyway."* True mechanically, but the player **clicked
"Anchor safely (−1🌕)"** and is then handed a coin flip that can run them aground, with no line
explaining why their choice was not honoured. `brokeAnchorLine` was already flashed *before* the
prompt in the broke case — but this path is specifically the case where they were *not* broke when
the prompt was built.

The dock-buy site has the identical shape (`:714-715`, falls through to taking 3🌕) and the same
question.

I cannot tell whether this is intended UX or an oversight; it needs Wyatt's word. If it is intended,
the existing `brokeAnchorLine` copy could be re-flashed on the fall-through at no new-copy cost.

### WR-13: `host_guest_parity_check` assertion 1 is symmetric-only, with no presence floor

**File:** `scripts/host_guest_parity_check.js:110–118`
**Severity:** WARNING

```js
const hostSet = new Set(PANEL_CLASS_VOCAB.filter((t) => hostRegion.includes(t)));
const guestSet = new Set(PANEL_CLASS_VOCAB.filter((t) => guestRegion.includes(t)));
```

Only asymmetry fails. If a refactor drops `apDisabled` from **both** renderers, greyed buttons stop
rendering greyed on every seat and the gate stays green with `0 token(s) on the host, 0 on the
guest`. The note line reports the counts but nothing asserts them.

Today it reads 7/7, so this is a hardening request rather than a live defect.

**Fix:** `if (hostSet.size !== PANEL_CLASS_VOCAB.length) fail(...)` — the vocabulary is a declared
list of classes the CSS styles, so full coverage is a legitimate requirement, not an accident.

### WR-14: Stale numbers in three load-bearing comments

**File:** `src/ui/panel.js:243–247`, `index.html:274`, `src/ui/util.js:907`, `src/ui/util.js:988–992`
**Severity:** WARNING

In a codebase that treats comments as project memory, four of them now contradict the code:

- `panel.js:243-247` — *"It stays 180ms: the value Wyatt already looked at this morning … THIS
  NUMBER LIVES IN TWO PLACES: here, and the `.18s` in index.html"*. The constant two lines above it
  is `800`, and the CSS is `.8s`. This is the comment block a reader consults before touching CR-01.
- `index.html:274` — *"The hold was cut to pay for it (msgHoldMs, src/ui/util.js: ceiling 3200ms),
  so the worst case on screen is 3200 + 800 = 4000ms"*. `HOLD_CEILING_MS` is **2000**; the worst
  case is 2800.
- `util.js:907` — *"Keeping it would have made his 3200 ceiling render as 2304 and his 1200 floor
  as 864"*. Same 3200/2000 mismatch; the commit message says 2000.
- `util.js:988-992` — *"Same base/per-char/pause formula and the same 1200/7000 clamp as the shared
  narration curve"*. The shared curve is now 800/2000 with different base and per-char constants;
  `chatBubbleHoldMs` no longer shares any of them.

**Fix:** correct the four numbers. WR-07's gate would keep the first one honest mechanically.

---

## Info

### IN-01: `narration-core.js` executes source expressions with `new Function`

**File:** `art-review/narration-core.js:521`, `:549`, `:618`, `:628`

`resolveLocal()` lifts an expression's source text out of `src/**` and evaluates it. The input is the
repository's own trusted source and the module is gated out of `src/` in both directions, so this is
not an injection surface in any realistic sense. Worth recording because the audit **page** does this
in a browser against files it `fetch`es — if that page is ever served from a host where those paths
are writable by anyone else, the trust assumption changes.

### IN-02: `narration-core.js` mutates the shared `appState` at import time, and a production-tier gate imports it

**File:** `art-review/narration-core.js:44–76`; imported by `scripts/ui_contract_check.js`

The module assigns `appState.roster` and a synthetic `appState.game` as an import side effect. That
is documented and load-order-sensitive (`audit_page_headless.mjs`'s header explains the subprocess
isolation it forced). `ui_contract_check.js` imports it purely for `PIRATE_RE`. Each gate is its own
process so nothing breaks today, but a shipped-code gate now depends on review tooling that clobbers
global game state — worth a one-line re-export of `PIRATE_RE` from a side-effect-free module.

### IN-03: Two `count === 0` assertions would pass over an empty file

**File:** `scripts/narration_flow_test.js:253`, `:268`

```js
check("no flash( call in src/ui/flow.js still selects its message with an inline seatLocal( ternary", flashSeatLocalLines.length, 0);
check("T-15-02: no raw ${...name} interpolation in src/ui/flow.js …", rawNameLines.length, 0);
```

Both are "grep found nothing, and nothing is what we wanted" — the shape that produced four vacuous
checks this week. Mitigated in practice by the sibling assertion at `:256`
(`variantsFormLines.length >= 8`), which proves the file was actually loaded and contains flash
sites. Recording it so the mitigation is deliberate rather than lucky.

### IN-04: `audit_page_headless.mjs`'s CLI always exits 0

**File:** `scripts/lib/audit_page_headless.mjs:279`

The subprocess entry point calls `process.exit(0)` unconditionally, including when `result.fatal` is
set. The parent recovers correctly (it parses the JSON and reads `fatal`), so this is not a live
defect — but running the harness by hand for a fatal render prints `FATAL:` to stderr and still
reports success to the shell.

---

## Notes on scope

- `src/engine/index.js` is unchanged and none of the above lives in it. `determinism_baseline
  --verify` passes.
- `ING_ALL` shrinking from 9 to 7 (`src/shared/index.js`) does **not** move the RNG stream:
  `src/engine/index.js:94` slices `ING_ALL.slice(0, cfg.nIslands)` with `nIslands === 7`, so the
  same seven ingredients are dealt in the same order. No finding.
- CR-02 and CR-03 are, as far as I can trace, **pre-existing** rather than introduced by Phase 15.
  They are reported here because both sit inside files this phase rewrote, both are the coin/state
  class the phase's own COIN-AUDIT set out to close, and CR-02 is specifically the half of the
  interleave window G6 did not cover.

---

_Reviewed: 2026-07-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
