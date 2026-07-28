# Phase 15: Narration Audit & Fixes - Pattern Map

**Mapped:** 2026-07-27
**Files analyzed:** 8 (2 new, 6 modified)
**Analogs found:** 8 / 8

**Correction applied (per orchestrator instruction):** `art-review/gallery-islands.html` (cited in CONTEXT.md D-01) does not exist. The real analogs are `art-review/gallery.html`, `art-review/gallery-icons.html`, `art-review/gallery-batch2.html` — all self-contained classic-script pages with NO ESM imports. The new audit page must diverge from this pattern on exactly that axis (see below).

**Read-only reminder honored:** `src/engine/index.js` was read only as reference (battle spoil derivation, `asym` dead branch) — no pattern below proposes editing it.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `art-review/narration-audit.html` (NEW) | standalone review page | request-response (static, browser-rendered) | `art-review/gallery.html` / `gallery-icons.html` / `gallery-batch2.html` | role-match, imperfect on module system (see note) |
| `scripts/narr_gap_test.js` or extended `scripts/bot_storm_narration_test.js` (NEW/extended) | test | batch (DOM-free assertions) | `scripts/bot_storm_narration_test.js` | exact |
| `src/ui/util.js` (`EVENT_NARRATION` table, `describe()`, hold multipliers) | utility / data table | transform (event → text) | itself (existing conventions) | exact — edit in place |
| `src/ui/flow.js` (ad-hoc `flash()` sites, broke gates, `anchorHold` narrate) | controller (turn-flow) | event-driven | itself (existing `seatLocal()` ternary precedent at :531/:542/:570/:597/:602) | exact — edit in place |
| `src/ui/panel.js` (`flash()`, `showChatBubble`) | component/renderer | request-response (DOM paint) | itself | exact — edit in place |
| `src/orchestrator.js` (`netNarrate`, `watchNarr`, dup `shotclockskip` sites) | orchestration/controller | pub-sub (Firebase watch) | itself | exact — edit in place |
| `src/net/writers.js` (`netSetNarr`) | service (Firebase writer) | CRUD (single `.set`) | itself, sibling writers in same file (`netSetResponse`, `netPushChat`) | exact — edit in place |

## Pattern Assignments

### `art-review/narration-audit.html` (NEW)

**Analog:** `art-review/gallery.html` (+ `gallery-icons.html`, `gallery-batch2.html` for cross-check — all three share one structural convention)

**What the existing gallery pages do (structure/styling/serving), verified by reading `gallery.html:1-80`:**
- Single self-contained `<!doctype html>` file, no external CSS/JS files, everything inline in `<style>`/`<script>`.
- CSS custom properties for theming (`--bg`, `--card-bg`, `--border`, `--text`, `--muted`, `--accent`, `--warn`) — dark review-tool palette.
- `header` block (title + explanatory `<p>`) followed by a `.grid` of `.card` elements (`display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr))`).
- Each `.card` = `.card-img` (image) + `.card-body` (heading, filename, optional `.flag` callout, `<details>/<summary>` for extra info, a feedback `<textarea>`).
- A sticky `.toolbar` at `top:0` for page-level controls (confirmed pattern, not fully read but referenced at line 76-80).
- **Classic script, no ESM.** These pages are opened directly (or served) with plain `<script>` tags and no `import`/`export` — self-contained by design since they only display static prompt/image data, no live game state needed.

**What must differ for `narration-audit.html` (an ESM-importing page):**
1. **Must be served via `npm start` (http server), not `file://`.** RESEARCH.md confirmed ES module imports are CORS-blocked from `file:` origin in every major browser. The gallery pages tolerate `file://` because they have zero imports; this page cannot.
2. **`<script type="module">`** at the bottom of the page, importing directly from `src/ui/util.js`:
   ```js
   import { EVENT_NARRATION, describe, pn, poss } from "../src/ui/util.js";
   import { appState } from "../src/state/index.js";
   // Minimal bootstrap so pn()/builders that read appState.game.cfg don't throw outside a live game:
   appState.roster = [0,1,2,3].map(i => ({ id: "x", name: `Captain ${i}` }));
   appState.game = { cfg: { tradeBonus: true, sardine: true } };
   ```
   (Verified safe: `src/ui/util.js`'s only module-scope imports are `appState` — a plain mutable object — and `roundCfg`, a pure function; neither has import-time side effects. `scripts/module_graph_check.js`'s `SRC_DIR` scope check ignores any importer outside `src/`, so this page is invisible to that gate — zero risk of tripping it.)
3. **Table-driven lines (~25 entries) are rendered by calling the REAL `EVENT_NARRATION[key](fabricatedEvent, atStub)` directly** — zero-drift by construction, no hand-transcription. Group by moment (round header / storm / docking / battle / trade & parley / fishing / shot clock / end of voyage) per D-01.
4. **Ad-hoc `flash()` lines (~24) cannot be imported as functions** — they're string literals embedded in imperative flow code (`src/ui/flow.js`, `src/orchestrator.js`, `src/ui/util.js:660`). Catalog these via a small extraction script (see below) rather than hand-copying, so the "did we miss a line?" question (D-05) stays mechanically answerable.
5. Reuse the gallery pages' `.card`/`.flag`/`<details>`/`<textarea>` visual conventions for consistency with what Wyatt already knows how to review, but repurpose `.flag` (or a new `.tag`) for the keep/cut/merge/rewrite recommendation label (D-02) instead of an art-QA flag, and the `<textarea>` for Wyatt's free-text notes per line.
6. Group heading structure: reuse gallery's `header`+`.grid` shell, but nest cards under `<h2>` moment-group headers (round header / storm / docking / battle / trade & parley / fishing / shot clock / end of voyage) rather than one flat grid, since D-01 requires grouping by moment.

**Optional companion — `scripts/extract_flash_lines.js` (Claude's Discretion, D-05):**
No direct analog exists (first grep-based extraction script in the repo), but it should follow the repo's plain-Node, no-dependency convention used by every other `scripts/*.js` file (see `scripts/bot_storm_narration_test.js` header for the house style: `#!/usr/bin/env node`, plain `console.log`, no assertion library). Grep `src/ui/flow.js` (18 sites: lines 110, 274, 308, 326, 336, 373, 477, 484, 531, 534, 542, 570, 597, 602, 659, 854, 855, 881) and `src/orchestrator.js` (6 sites: 247, 252, 379, 687, 708, 742, 746) for `flash(`/`onFlash(` literal-string call sites, plus `src/ui/util.js:660`'s `narrateCurrent()` turn-banner line, and emit JSON the audit page can `fetch()`/inline at build time.

---

### `scripts/narr_gap_test.js` (NEW, or extend `scripts/bot_storm_narration_test.js`)

**Analog:** `scripts/bot_storm_narration_test.js` (full file read this session — copy its skeleton exactly)

**Exact skeleton to copy** (lines 1-40 of the analog):
```js
#!/usr/bin/env node
// scripts/narr_gap_test.js
//
// [header comment explaining WHAT invariant this proves and WHY it's DOM-free — follow the
// analog's convention: state what's being proven, why it's safe to test without flow.js/DOM,
// and cross-reference the CONTEXT.md decision(s) it locks in (NARR-02/03/04/05/06 style refs).]
//
// Convention (matches determinism_baseline.js/hail_ranking_test.js/storm_moored_reason_test.js/
// bot_storm_narration_test.js): no assertion library, a local check(name, actual, expected)
// counter, plain console.log, process.exit(failures?1:0).

import { loadEngine } from "./lib/load_engine.js";
import { EVENT_NARRATION, describe, movedSinceTurnStart /* + whatever new exports NARR work adds */ } from "../src/ui/util.js";
import { appState } from "../src/state/index.js";

const { Game, roundCfg } = await loadEngine();

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

function freshGame(seed) {
  return new Game(roundCfg(["pirate", "balanced", "trader", "rusher"]), seed, true);
}
```

**Direct-table-call assertion pattern (for NARR-04's bribe split), copy from analog lines 266-277:**
```js
{
  const at = () => [0, 0];
  const f = EVENT_NARRATION.battle;
  // fabricate the two coin-spoil shapes, no engine/DOM needed — mirrors the analog's
  // EVENT_NARRATION.moored direct-call style exactly
  const genuine = f({ t: "battle", spoil: "5 coins", spoilIng: null /* ...other required fields per real event shape... */ }, at).txt;
  const cleaned = f({ t: "battle", spoil: "2 coins", spoilIng: null }, at).txt;
  checkTrue("battle: genuine-bribe wording differs from cleaned-out wording", genuine !== cleaned);
}
```

**Engine-level construction pattern (for NARR-02's `anchorHold`/broke gates, if exercised via constructed `Game` state), copy from analog lines 316-345** — `appState.game = g` then directly poke `p.pos`/`p.coins`, call `g.ev({t:"turn",...})`, then the code path under test, then assert on `g.events[g.events.length-1]`.

**Convention notes to carry over exactly:**
- No assertion library — `check()`/`checkTrue()` local helpers only.
- `process.exit(failures ? 1 : 0)` as the final line.
- Seed-search over a small range (e.g., `for (let s = 12345; s < 12345+80; s++)`) when a geometric precondition (specific board layout) is needed — never hardcode board coordinates against one frozen seed (see analog's `findOpenRun`/`findFreeIslandApproach` helpers as the template if NARR-02's broke-gates need a specific board state).
- `console.log` a one-line summary before the checks, `console.log` a PASS/FAIL summary at the end.

**Wire into `npm test`:** add the new script's `node scripts/narr_gap_test.js` invocation alongside the other 12 gates in `package.json`'s `"test"` script (same list `bot_storm_narration_test.js` is already part of).

---

### `src/ui/util.js` — `EVENT_NARRATION` table, `describe()`, hold multipliers (MODIFIED, not new)

**Convention to match (already established in-file):**

**Table entry shape** (`src/ui/util.js:318`, `anchorHold` — the pattern every entry follows):
```js
anchorHold:(e,at)=>({txt:`${pn(e.p)}'s anchor already down — it holds fast, no need to pay twice in one storm ⚓`,pops:[[at(e.p),"⚓"]]}),
```
Every entry is `key:(e,at[,cellPx])=>({txt:..., pops:[...], caps:[...], cls:...})`. For NARR-04's bribe split, extend `battle:(e,at,cellPx=0)=>{...}` (`:358`) by branching on the numeric prefix of `e.spoil` (see Bribe-vs-cleaned-out derivation below) — do NOT add a new event field.

**Bribe-vs-cleaned-out derivation (NARR-04/D-12) — copy verbatim from RESEARCH.md, verified against both live code paths:**
```js
// Both real spoil-generation paths clamp to at most 5:
//   orchestrator.js:527 (LIVE PLAY): take = Math.min(5, lose.coins); spoil = take + " coins";
//   engine/index.js:571,574 (SIMULATOR ONLY, never runs in a real game)
// So for BOTH paths: spoilIng===null && leading number in e.spoil === 5  => genuine bribe
//                     spoilIng===null && leading number in e.spoil  <  5  => cleaned out
const spoilAmount = e.spoilIng ? null : parseInt(e.spoil, 10);
const isGenuineBribe = e.spoilIng === null && spoilAmount != null && spoilAmount >= 5;
```
Note: the `"(all they had)"` suffix (`engine/index.js`) never appears in live play — parse the leading number, not any substring.

**Existing second-person precedent (the literal pattern D-07/D-08 extends), `src/ui/flow.js:531/542/570/597/602`:**
```js
seatLocal(p.idx)?`${pn(p.idx)} — your turn!`:`${poss(p.idx)} turn!`
```
This `seatLocal(seat)?"...you...":"...pn(seat)..."` ternary is the exact shape to replicate for every new second-person branch, both in `EVENT_NARRATION` table entries and ad-hoc `flow.js` lines.

**Broadcast-path `viewerSeat` extension (D-10, for the live-box "you" mechanism) — proposed addition alongside `seatLocal`/`decisionIsLocal` (`src/ui/util.js:667-671`):**
```js
export function seatLocal(s){return s===appState.mySeat;}
export function decisionIsLocal(s){return (appState.passAndPlay&&appState.game.players[s].strategy==="human")||seatLocal(s);}
// NEW — viewerSeat undefined falls back to seatLocal()'s live global read, i.e. today's behavior
// is EXACTLY preserved when unset (Pitfall 2 safety: bot_storm_narration_test.js never sets
// appState.mySeat, so this must default to seatLocal()'s current false-when-null result)
export function isLocalTo(seat, viewerSeat){
  return viewerSeat!=null ? seat===viewerSeat : seatLocal(seat);
}
```
Table builders that need a broadcast-safe "you" branch take an extra optional trailing param: `key:(e,at,cellPx,viewerSeat)=>...` calling `isLocalTo(e.p, viewerSeat)` instead of `seatLocal(e.p)` directly.

**Timing constants (NARR-06/D-14), exact current values to change — `src/ui/util.js:533` and `:568`:**
```js
const MSG_HOLD_MULTIPLIER=0.8;      // -> proposed 0.72 (10% off, per D-14's literal reading)
export const BOT_MSG_HOLD_MULTIPLIER=0.5;  // -> proposed 0.45
```
Both are named constants already purpose-built (Phase 14's D-10) specifically so this kind of tuning never needs a code hunt — change the two numbers only, do not touch `REVEAL_MS_PER_CHAR` (`src/ui/panel.js:289`, out of scope per D-14).

**New chat-bubble-specific hold function (D-15) — mirror `botMsgHoldMs()`'s exact shape** (`src/ui/util.js:568-575`, same base/per-char/pause formula, own named multiplier constant):
```js
export const CHAT_BUBBLE_HOLD_MULTIPLIER=1.0; // deliberately UNCHANGED from today's baked-in behavior
export function chatBubbleHoldMs(text){
  text=text||"";
  const base=1000,charTime=50;
  let raw=base+text.length*charTime;
  const body=text.replace(/[.,!?]+$/,"");
  const pauses=(body.match(/[,!?.]/g)||[]).length;
  raw+=pauses*300;
  return Math.round(Math.min(Math.max(raw,1200),7000)*CHAT_BUBBLE_HOLD_MULTIPLIER);
}
```
Confirmed only 2 call sites of the shared `msgHoldMs()` exist codebase-wide (`panel.js:335` `showChatBubble`, `panel.js:383` `flash()`'s default) — repoint `showChatBubble` to the new function, leave `flash()` on `msgHoldMs()`.

---

### `src/ui/flow.js` — ad-hoc `flash()` sites, broke gates, `anchorHold` narrate bug (MODIFIED)

**Analog:** itself — the file's own 6 existing second-person precedent lines (`:531,542,570,597,602`, plus `:274` per RESEARCH.md's exhaustive grep) are the pattern every new/edited line in this file must match. Exact ternary shape shown above under `util.js`.

**D-13 fix — `anchorHold` missing `narrateLastEvent()` (`src/ui/flow.js:220-224`, exact current code, verified this session):**
```js
const reason=appState.game.mooredReason(p);
if(reason){appState.game.ev({t:"moored",p:p.idx,reason});await narrateLastEvent();liveRender();return;}
// a storm only ever charges (coins or a coin flip) once per turn — a second leg that
// also hits an island is a free pass, already-paid anchor holding fast
if(dodgedOnce.v){appState.game.ev({t:"anchorHold",p:p.idx});liveRender();return;}
//                                                          ^^^^^^^^^^^^ MISSING: await narrateLastEvent()
```
The `moored` branch immediately above is the exact pattern to copy for the fix: `ev()` → `await narrateLastEvent()` → `liveRender()`. Existing copy for `anchorHold` already exists (`src/ui/util.js:318`, shown above) — this is purely the missing call, no new wording.

**D-11 case 1 — broke-can't-sail gates, human (`src/ui/flow.js:595-603`, verified) and bot (`:675-678`, corrected line number per RESEARCH.md):**
Human path, current comment explicitly declines to narrate (reasoning holds only for humans, per D-11):
```js
if(p.coins>0){
  ... // sail logic
} // no coins to sail — the action prompt right after already explains it, no need for a second box
```
Bot path (no equivalent prompt exists — this is the gap D-11 must close):
```js
if((dist>1||(dist===1&&exact))&&p.coins>0){
  p.coins--;const b=[...p.pos];g.stepToward(p,target,g.sailBudget(p));
  if(p.pos[0]!==b[0]||p.pos[1]!==b[1]){g.ev({t:"sail",p:p.idx});await botBeat();}else p.coins++;
}
```
Pattern to add: an `else if(p.coins===0){await flash(seatLocal(p.idx)?"...you're broke, no sailing...":"...pn(p.idx) is broke, no sailing...",...)}` branch on BOTH paths, using the same `seatLocal()` ternary shape as the 6 precedent lines. This is a new `flash()` call site, not a table entry — matches Pattern 2 (ad-hoc) from RESEARCH.md.

**D-11 case 2 — broke-can't-anchor gate (`src/ui/flow.js:226`, verified — full storm-anchor block read `:215-240`):**
```js
const opts=[];
if(p.coins>=1)opts.push({label:"Pay 1🌕 to anchor",value:"pay"});
```
When `p.coins<1`, no anchor option appears; the prompt (`:233-237`, `promptMsg` built from `trueShipwreck`) hints at consequence but never states the anchor is unavailable. Pattern to add: an explicit `flash()`/prompt-text branch stating "ye can't afford to anchor" when `p.coins<1`, following the same `seatLocal()` ternary + `pn(p.idx)` third-person fallback shape.

---

### `src/ui/panel.js` — `flash()`, `showChatBubble` (MODIFIED)

**Analog:** itself. `flash()` full text read (`:335-400`).

**Current `flash()` signature and hold-selection logic (`:374` onward, verified):**
```js
export async function flash(msg,ms,holdMs){
  const _nh=netHandlers();
  if(_nh.onBroadcast)_nh.onBroadcast(msg);
  const el=$("actionPanel").querySelector(".apMsg");
  if(el&&el._revealDone)await el._revealDone;
  const text=el?el.textContent:msg;
  await sleep(typeof holdMs==="number"?holdMs:msgHoldMs(text));
  ...
}
```
For D-10 (widened `narr` payload), extend `flash()`'s signature additively — a 4th `variants` param, forwarded to `_nh.onBroadcast(msg, variants)` — never break the existing 2/3-arg call sites (D-10's "purely additive" requirement, same spirit as `holdMs`'s own additive 3rd-param precedent noted in the file's own comment at `:365-368`).

**`showChatBubble` (`:335`, D-15 fix):** currently calls the shared `msgHoldMs(text)` — repoint to the new `chatBubbleHoldMs(text)` (defined in `util.js` above) so NARR-06's cut to `MSG_HOLD_MULTIPLIER` does not silently affect bubbles.

---

### `src/orchestrator.js` — `netNarrate`, `watchNarr`, duplicate `shotclockskip` sites (MODIFIED)

**Analog:** itself. Exact current code (verified this session):
```js
export function netNarrate(html){if(appState.replaying)return;showNarration(html);if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"));}
export function netBroadcast(html){if(appState.replaying)return;if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"));}
```
```js
export function watchNarr(){
  netWatchNarr(appState.db,appState.room,s=>{const v=s.val();
    if(v&&!appState.spectatingBattle&&!appState.inBattlePrompt)showNarration(v.html);});
}
```

**D-10 extension — recommended shape (from RESEARCH.md, prescriptive):**
```js
export function netNarrate(html, variants){
  if(appState.replaying)return;
  showNarration(html); // host's OWN screen — always the ordinary seatLocal()-computed string, unchanged pattern
  if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"),variants);
}
export function watchNarr(){
  netWatchNarr(appState.db,appState.room,s=>{const v=s.val();
    if(v&&!appState.spectatingBattle&&!appState.inBattlePrompt){
      const mine=v.variants&&v.variants.find(x=>x.seat===appState.mySeat);
      showNarration(mine?mine.html:v.html);
    }
  });
}
```
Backward-compat property (must hold both directions): an OLD guest reading a NEW payload ignores `variants` (only ever reads `v.html`) → shows today's third-person text. A NEW guest reading an OLD payload (no `variants` field) falls back to `v.html` the same way. **Pitfall 5 warning:** the host's own local render (`showNarration(html)` inside `netNarrate`) must keep using the ordinary `seatLocal()`-computed string via the `html`/`msg` argument — never delivered via `variants`, which is for OTHER seats only.

**Duplicate `shotclockskip` finding (Pitfall 1, `:247`/`:252`) — NOT a new pattern, a cleanup:** these hand-write text byte-identical to `EVENT_NARRATION.shotclockskip` (`src/ui/util.js:386`). NARR-01 audit tag: cut, replace both call sites with `narrateLastEvent()` (the existing wrapper, already used elsewhere — see `src/ui/panel.js:358`'s `flash(L.txt)` inside `narrateLastEvent()` for the pattern being converged toward) so the duplicate can never drift again.

---

### `src/net/writers.js` — `netSetNarr` (MODIFIED)

**Analog:** itself, plus sibling one-function-per-write conventions in the same file (`netSetResponse`, `netPushChat`).

**Current exact shape (verified):**
```js
export function netSetNarr(db, room, html, onError) {
  return withReporter(db.ref("rooms/" + room + "/narr").set({ html, t: Date.now() }), onError);
}
```

**D-10 extension — additive 5th param, common case unchanged (RECOMMENDED shape from RESEARCH.md):**
```js
export function netSetNarr(db, room, html, onError, variants) {
  const payload = variants && variants.length ? { html, t: Date.now(), variants } : { html, t: Date.now() };
  return withReporter(db.ref("rooms/" + room + "/narr").set(payload), onError);
}
```
Matches the file's own stated convention exactly ("Each performs exactly one `set`... with the caller's own error reporter attached... Nothing else") — the only change is an optional field on the payload object, no new function, no new write call.

## Shared Patterns

### Second-person ternary (D-07/D-08)
**Source:** `src/ui/flow.js:531,542,570,597,602` (6 existing precedent lines)
**Apply to:** Every new/edited `EVENT_NARRATION` table entry and every new/edited ad-hoc `flash()` line that needs a "you" variant.
```js
seatLocal(p.idx) ? `${pn(p.idx)} — your turn!` : `${poss(p.idx)} turn!`
```
For the broadcast (non-local) path use `isLocalTo(seat, viewerSeat)` instead of `seatLocal(seat)` (see `src/ui/util.js` section above) so the same string-building code serves both the host's own render and the per-guest `variants` array.

### DOM-free narration test skeleton
**Source:** `scripts/bot_storm_narration_test.js` (full file, house convention)
**Apply to:** Any new narration unit-test script (NARR-02/03/04/05/06 assertions).
`check()`/`checkTrue()` local helpers, no assertion library, `process.exit(failures?1:0)`, direct `import { EVENT_NARRATION, describe, ... } from "../src/ui/util.js"`, seed-search for geometric preconditions rather than hardcoded coordinates.

### Named pacing constants, never hardcoded literals
**Source:** `src/ui/util.js:533` (`MSG_HOLD_MULTIPLIER`), `:568` (`BOT_MSG_HOLD_MULTIPLIER`), `:551-553` (`SHIP_GLIDE_MS`/`STORM_STEP_MS`/`BOT_STORM_STEP_MS`)
**Apply to:** D-14's timing cut and D-15's new chat-bubble curve — always a single named constant, never an inline number, per the established Phase 14 convention explicitly built for exactly this kind of tuning.

### Additive, backward-compatible Firebase payload widening
**Source:** `src/net/writers.js:85` (`netSetNarr`'s current `{html,t}` shape), the file's own header comment ("one function per Firebase write... nothing else")
**Apply to:** D-10's `variants` field — always optional, always omitted from the written object in the common case, always read defensively (`v.variants && v.variants.find(...)`) on the watch side so an old/new client pairing degrades to today's `html`-only behavior in both directions.

## No Analog Found

None — every file in scope has a strong in-file or in-repo analog (see table above). The one imperfect match (`narration-audit.html` vs. the classic-script `gallery-*.html` pages, on the ESM-import axis) is documented in detail in its own Pattern Assignment section above rather than listed here, since a partial/documented-divergence match is more useful to the planner than a "no analog" entry.

## Metadata

**Analog search scope:** `art-review/`, `scripts/`, `src/ui/`, `src/net/`, `src/orchestrator.js`, `src/engine/index.js` (read-only reference)
**Files scanned:** `art-review/gallery.html` (partial, structure), `scripts/bot_storm_narration_test.js` (full), `src/ui/util.js` (targeted sections: header, `pn`/`poss`/`pname`, `EVENT_NARRATION` header + `anchorHold`/`battle`/`shotclockskip` entries, `msgHoldMs`/`botMsgHoldMs`, `seatLocal`/`decisionIsLocal`), `src/ui/panel.js` (header + `flash`/`narrateLastEvent`), `src/ui/flow.js` (header + turn-banner block, broke-sail human/bot gates, storm-anchor block), `src/orchestrator.js` (header, `netNarrate`/`netBroadcast`, `watchNarr`), `src/net/writers.js` (header, `netSetNarr`)
**Pattern extraction date:** 2026-07-27

---
*Phase: 15-narration-audit-fixes*
