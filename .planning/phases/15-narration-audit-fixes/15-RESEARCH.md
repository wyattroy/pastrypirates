# Phase 15: Narration Audit & Fixes - Research

**Researched:** 2026-07-27
**Domain:** Client-side narration/copy system (event-driven text table + ad-hoc flash messages), live multiplayer broadcast personalization, UI-tier timing constants. Vanilla ES modules, no framework.
**Confidence:** HIGH — every claim below is grounded in a direct file:line read of the actual repo on this branch (not `index.html`'s old monolith; the codebase has since been split into `src/**` ES modules — `.planning/codebase/ARCHITECTURE.md` is stale on this point, see Assumptions Log A1).

## Summary

This phase edits copy and two timing constants in a fully-modularized, DOM-free-testable presentation layer. The two narration surfaces (`EVENT_NARRATION` table in `src/ui/util.js` and ad-hoc `flash()` calls in `src/ui/flow.js`, plus a handful more in `src/orchestrator.js`) are both real and both need auditing — CONTEXT.md's D-03 premise is confirmed. The harder mechanical question — how second person survives the host→guest broadcast — has a clean, purely-additive answer: widen the `rooms/{code}/narr` Firebase node from `{html,t}` to `{html,t,variants}`, where `variants` is an optional array of `{seat, html}` pairs. An unpatched guest client already ignores unknown fields (it only ever reads `v.html`), so this is backward-compatible by construction — no version gating needed. The captain's log needs no such mechanism at all: `describe()` already runs independently per-client and can gain second-person branches "for free" using the existing `seatLocal()`/`decisionIsLocal()` helpers, exactly the way six ad-hoc lines in `flow.js` already do it.

One correction to CONTEXT.md's D-12 premise, found by tracing the actual live-game code path rather than the engine's simulator-only `battle()` method: **the `"N coins (all they had)"` string never appears in a real game.** It is produced only by `Game.battle()` in `src/engine/index.js`, which is called exclusively by the offline all-bot determinism simulator (`takeTurn()`). Every real game — solo, pass-and-play, and online multiplayer, human or bot — resolves battle spoils through `asyncBattle()` in `src/orchestrator.js`, which has its own, differently-shaped branching and never appends `"(all they had)"`. The bribe-vs-cleaned-out split Wyatt wants is still fully achievable without any engine change: both code paths clamp coin spoils to `Math.min(5, loserCoins)`, so the narration layer can distinguish "genuine bribe" (the string's leading number is 5) from "cleaned out" (it's less than 5) by parsing the existing `spoil` string alone — no new event field.

A second concrete finding for the audit itself: `src/orchestrator.js:247` and `:252` hand-write narration text for the `shotclockskip` event that is a byte-for-byte duplicate of `EVENT_NARRATION.shotclockskip` (`src/ui/util.js:386`) instead of calling `narrateLastEvent()`. This is a real repetition/inconsistency finding for NARR-01's audit — worth a "cut, replace with `narrateLastEvent()`" recommendation on the audit page.

Test coverage exists today for exactly one narration table entry (`EVENT_NARRATION.moored`, asserted by `scripts/bot_storm_narration_test.js`, a permanent `npm test` gate) via text-equality and substring checks. That test never sets `appState.mySeat` (stays `null`), so as long as second-person branches are gated behind `seatLocal()`/an explicit viewer parameter that defaults to today's exact wording when unset, the existing assertions keep passing unmodified — this is the safe shape to build the personalization mechanism around.

**Primary recommendation:** Build the audit page as a browser-served ES module page (`npm start`, not `file://`) that directly `import`s `EVENT_NARRATION`, `describe`, `pn`, `poss` from `src/ui/util.js` for the ~25 table-driven lines (zero drift by construction, verified safe by `module_graph_check.js`'s own scope rules), and a small extraction script that greps `flow.js`/`orchestrator.js` for `flash()`/`onFlash(` literal string arguments to catalog the ~24 ad-hoc lines without hand-transcription. Implement second person via the additive `variants` field on the existing `narr` payload, reusing `EVENT_NARRATION` builder functions with an optional `viewerSeat` override for the broadcast path and relying on the already-global `seatLocal()` for the local captain's-log path.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Event-driven narration text (`EVENT_NARRATION` table) | UI (`src/ui/util.js`) | — | Pure text builders keyed off already-recorded engine events; no engine/network dependency to read the table itself |
| Ad-hoc turn-flow narration (`flash()` calls) | UI (`src/ui/flow.js`) | — | Imperative game-flow code owns these inline strings; not table-driven |
| Live narration broadcast (host → guest) | Networking (`src/net/writers.js`, `src/orchestrator.js`) | UI (`src/ui/panel.js`'s `flash()`) | `flash()` is the UI choke point; the Firebase write/watch pair is the networking boundary. Widening the payload touches both, never the engine |
| Captain's log rebuild (per-client) | UI (`src/ui/util.js`'s `describe()`) | — | Runs independently on host, every guest, and reload-replay; needs no network round-trip to personalize |
| Timing constants (hold/fade) | UI (`src/ui/util.js`, `src/ui/panel.js`) | — | Pure pacing math, no state dependency |
| Battle spoil computation (bribe vs. crate) | Engine + Orchestrator (read-only reference) | UI (interprets `e.spoil` string) | **Do not touch** — Phase 15 only reads existing `spoil`/`spoilIng` fields; the split is a narration-layer string-parse |
| Audit deliverable page | Standalone static page (`art-review/`) | UI (imports `src/ui/util.js` as ESM) | Same tier as the existing `gallery-*.html` art-review pages — throwaway, not shipped, served via `npm start`'s http.server |

## Standard Stack

No new libraries. This phase is 100% vanilla-JS copy/timing/payload-shape edits inside the existing modular `src/**` tree, consistent with CLAUDE.md's "no build step, no framework" constraint. `EVENT_NARRATION` and `flash()` are the only "framework" this phase touches, and both already exist.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Widened `narr` payload (`{html, t, variants}`) | Each browser rebuilds the live box from the event stream (like the captain's log already does) | Rejected by CONTEXT.md D-10: the ~24 ad-hoc `flash()` lines aren't events, so this would need two personalization systems, one for table lines and one for ad-hoc lines |
| Widened `narr` payload | "Second person only in the captain's log, not the live box" | Rejected by CONTEXT.md D-10: the box is what Wyatt actually watches during online play; it would keep naming him |
| Import real `EVENT_NARRATION`/`describe`/`pn` into the audit page | Hand-transcribe every line into the audit page's own markup | Hand-transcription drifts from shipped copy the moment either side is edited — exactly what D-03's "an audit that only walks the table would miss..." warns against, generalized |

**Installation:** none — no `npm install` needed for this phase.

## Package Legitimacy Audit

**Not applicable.** This phase introduces zero external packages (no new `npm install`). All work is within the existing `src/**` tree, `art-review/**`, and `scripts/**`.

## Architecture Patterns

### System Architecture Diagram

```text
┌────────────────────────────── HOST browser ──────────────────────────────┐
│                                                                            │
│  windLeg()/botTurn()/humanTurn() (src/ui/flow.js)                        │
│  ────────────────────────────────────────────────                        │
│  1. Game event recorded: appState.game.ev({t:"...", p, ...})            │
│  2a. TABLE path: narrateLastEvent()/narrateCurrent() (panel.js/util.js) │
│       └─ describe(e) → EVENT_NARRATION[e.t](e, at) → {txt, cls}         │
│  2b. AD-HOC path: flow.js/orchestrator.js call flash(literalString)     │
│       (both paths converge on flash() as the single choke point)         │
│                                                                            │
│  3. flash(msg, ms, holdMs[, variants])  (src/ui/panel.js:374)           │
│       ├─ paints host's OWN screen: netHandlers().onBroadcast(msg,...)   │
│       │    → netNarrate(html[,variants]) (orchestrator.js:264)          │
│       │       ├─ showNarration(html) — HOST's local <div class=apMsg>   │
│       │       └─ if isHost && db && room:                               │
│       │            netSetNarr(db, room, {html, variants, t})            │
│       │              (src/net/writers.js:85 — writes rooms/{code}/narr) │
│       └─ typewriter reveal + msgHoldMs()/holdMs hold + .5s fade         │
│           (unaffected by networking — purely local DOM pacing)          │
│                                                                            │
│  Captain's log (independent of the above):                               │
│  syncLogLines() → describe(e) for each new event → appState.logLines[]  │
│  (runs on EVERY client, including the host, using ITS OWN appState.mySeat)│
└────────────────────────────────────────────────────────────────────────┘
                                    │  Firebase RTDB: rooms/{code}/narr
                                    ▼
┌───────────────────────────── GUEST browser ───────────────────────────────┐
│  watchNarr() (orchestrator.js:910)                                       │
│    netWatchNarr(db, room, snap => {                                      │
│      const v = snap.val();                                               │
│      // NEW: pick this guest's own variant if present, else fall back    │
│      const mine = v.variants && v.variants.find(x=>x.seat===mySeat);     │
│      showNarration(mine ? mine.html : v.html);                           │
│    });                                                                    │
│                                                                            │
│  Captain's log on THIS guest: syncLogLines() runs independently here     │
│  too, against events received via watchEvents() — describe() branches   │
│  on THIS guest's own appState.mySeat, personalizing with zero broadcast. │
└────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

No new files/folders required for the code changes (edits land in the existing `src/ui/util.js`, `src/ui/flow.js`, `src/ui/panel.js`, `src/orchestrator.js`, `src/net/writers.js`). One new file for the audit deliverable:

```
art-review/
├── gallery.html            # existing pattern (pastries, batch 1)
├── gallery-icons.html      # existing pattern (icons)
├── gallery-batch2.html     # existing pattern (batch 2)
└── narration-audit.html    # NEW — D-01's audit page, follows the same
                             # self-contained review-page convention, but
                             # is served (not file://) so it can `import`
                             # src/ui/util.js as a real ES module
```

`scripts/` gains one optional helper (Claude's discretion, D-05 language: "A script is preferable if it makes the 'did we miss a line?' question answerable"):

```
scripts/
└── extract_flash_lines.js  # OPTIONAL — greps flow.js/orchestrator.js for
                             # flash(/onFlash( literal-string call sites,
                             # emits JSON the audit page consumes, so the
                             # ad-hoc-line inventory is grep-verified count,
                             # not manually curated
```

### Pattern 1: Table-driven narration (`EVENT_NARRATION`)

**What:** A single object (`src/ui/util.js:257-395`, **25 keys** — corrected from CONTEXT.md's "~26"; exact list: `newround, windmove, blownOut, sail, dodge, anchor, moored, blocked, anchorHold, tradewind, parley, aground, shipwrecked, dock, trade, sidebet, battle, battleflee, fish, finish, shotclock, shotclockskip, bakeoff, end, turn`) mapping event type → a function `(e, at, cellPx) => {txt, cls, caps, pops}`.
**When to use:** Any narration tied to a real `Game.ev()` event — this is nearly everything storm/battle/trade/dock/fish-related.
**Consumers:** `describe(e)` (util.js:397, used by the captain's log via `syncLogLines()`), `narrateLastEvent()` (panel.js:345, human-action narration), `narrateCurrent()` (util.js:658, bot-turn narration).
**Example (current third-person-only shape):**
```js
// Source: src/ui/util.js:280 (verified read, this session)
windmove:e=>({txt:`${pn(e.p)} is carried by the storm`,caps:[[e.p,"🌬️ drifts"]]}),
```

### Pattern 2: Ad-hoc `flash()` calls

**What:** Inline template strings passed directly to `flash(msg, ms, holdMs)` from imperative turn-flow code, bypassing the table entirely.
**Where (exhaustive grep, this session):**
- `src/ui/flow.js` — **18 call sites**, exact lines: `110, 274, 308, 326, 336, 373, 477, 484, 531, 534, 542, 570, 597, 602, 659, 854, 855, 881`. All 18 confirmed present at these lines (CONTEXT.md's list was accurate).
- `src/orchestrator.js` — **6 call sites**, exact lines: `247, 252, 379, 687, 708, 742, 746`. **Not previously flagged in CONTEXT.md** — these are the ones D-03 asked research to "flag any `flash()` calls outside `src/ui/flow.js`" for.
  - `:247`/`:252` — hand-written `shotclockskip` text that **duplicates** `EVENT_NARRATION.shotclockskip` verbatim (see Pitfall 1 below). NARR-01 finding: recommend "cut, replace with `narrateLastEvent()`."
  - `:379` — battle-start announcement ("First to N points wins…").
  - `:687`/`:708` — these call `describe()` first (table-driven text), then `flash()` the result — legitimate, not ad-hoc strings, just an extra manual invocation outside the `narrateLastEvent()`/`narrateCurrent()` wrappers.
  - `:742`/`:746` — end-of-voyage ("Nobody finished the voyage" / the victory box). Genuinely EOV-scoped (Phase 16's UI-07 territory for the box's visibility) but the TEXT itself is real narration a full NARR-01 audit should still catalog (tag "keep," no wording change needed).
- `src/ui/panel.js:358` — inside `narrateLastEvent()` itself; not a new ad-hoc line, just the generic table-driven `flash(L.txt)` call.
- `src/ui/util.js:660` — inside `narrateCurrent()`, a bot-turn-only ad-hoc line: `"🧭 ${pn(e.p)} takes the wheel…"` for `e.t==="turn"`. Routes through `netHandlers().onFlash(...)` (= `flash()` via the handler seam, `src/main.js:94`). **Another location outside `flow.js`** the audit must catch.

**Corrected total ad-hoc-line count: 18 (flow.js) + 5 genuinely-new-text (orchestrator.js, excluding the two describe()-driven ones) + 1 (util.js's turn banner) = 24 ad-hoc lines**, plus the 25 table entries = **49 total narration surfaces** for the audit to inventory. (CONTEXT.md's D-03 estimate of "~18 more" undercounted by not yet having grepped orchestrator.js/util.js; this is the corrected number for planning.)

**Existing second-person precedent (6 lines, all in `flow.js`):** `274, 531, 542, 570, 597, 602` — all already use the `seatLocal(p.idx)?"...you...":"...pn(p.idx)..."` ternary pattern inline. This is the literal pattern D-07/D-08 extends to the rest of the surface.

**Confirmed clean:** `src/ui/panel.js` and `src/orchestrator.js` (beyond the `flash()` call sites already listed) contain no additional standalone narration string tables. `src/ui/panel.js` owns only the rendering mechanics (`flash`, `panel`, `typewriterReveal`, `showChatBubble`, `showNarration`) — no narration copy of its own.

### Pattern 3: Second-person mechanism (D-07/D-08/D-10) — recommended concrete design

**The captain's log (no broadcast needed):** `describe()`'s builder functions can call `seatLocal(e.p)` / `decisionIsLocal(e.p)` directly, exactly as the 6 existing `flow.js` precedent lines already do, because `describe()` runs independently in every client's own `appState` — `appState.mySeat` is always correctly loaded before `describe()` ever runs, in all three contexts (host live, guest live, host reload-replay) — see Pitfall/verification below. **Zero new infrastructure required for the log.**

**The live message box (needs the broadcast fix):** Widen the payload written by `netSetNarr` from `{html, t}` (`src/net/writers.js:85`, confirmed exact current shape) to `{html, t, variants}`:

```js
// RECOMMENDED shape (Claude's Discretion per CONTEXT.md D-10, prescriptive):
// src/net/writers.js — additive third parameter, default undefined (omitted from the
// written object when not needed, keeping the common-case payload identical to today)
export function netSetNarr(db, room, html, onError, variants) {
  const payload = variants && variants.length ? { html, t: Date.now(), variants } : { html, t: Date.now() };
  return withReporter(db.ref("rooms/" + room + "/narr").set(payload), onError);
}
```

```js
// src/orchestrator.js:910 watchNarr() — additive read, falls back to today's behavior
// when `variants` is absent (old host / no personalization for this line)
export function watchNarr(){
  netWatchNarr(appState.db,appState.room,s=>{const v=s.val();
    if(v&&!appState.spectatingBattle&&!appState.inBattlePrompt){
      const mine=v.variants&&v.variants.find(x=>x.seat===appState.mySeat);
      showNarration(mine?mine.html:v.html);
    }
  });
}
```

**Why this is safe for a version-skewed client:** an OLD guest (pre-this-change) reads `v.html` only — it never looks at `v.variants` — so it silently continues to show today's third-person text. A NEW guest reading a payload from an OLD host (no `variants` field at all) falls back to `v.html` the same way. Both directions degrade to current behavior, satisfying D-10's explicit "fall back to today's `html` rather than showing a blank box" requirement.

**Who computes `variants`, and how, without duplicating logic:** Give `EVENT_NARRATION` builder functions (and the ad-hoc `flash()` call sites) an optional `viewerSeat` override so the SAME text-generation code produces both the generic third-person default and each needed personalized variant:

```js
// RECOMMENDED helper — src/ui/util.js, alongside seatLocal/decisionIsLocal
// (viewerSeat undefined -> falls back to the live global appState.mySeat,
// i.e. today's seatLocal() behavior is EXACTLY preserved when unset)
export function isLocalTo(seat, viewerSeat){
  return viewerSeat!=null ? seat===viewerSeat : seatLocal(seat);
}
```

Table-driven example (moored, extended — illustrative, not a locked implementation):
```js
moored:(e,at,cellPx,viewerSeat)=>{
  const you = isLocalTo(e.p, viewerSeat);
  const stillDocked = you ? `${pn(e.p)}, you're still docked, so the storm can't run you aground.`
                           : `${pn(e.p)} is still docked, so the storm can't run them aground.`;
  // ...unchanged branch structure otherwise...
}
```

For the HOST'S OWN local render, callers keep doing exactly what the 6 precedent lines already do (compute the string using the live global `seatLocal()`, no `viewerSeat` argument — this is unchanged). For the BROADCAST payload, the host additionally calls the same builder/string logic once per seat that needs a distinct variant (i.e., the seats named in the event — `e.p`, or `e.a`/`e.d` for two-party events per D-08), passing `viewerSeat` explicitly, and collects the results into the `variants` array. Ad-hoc `flow.js` call sites do the equivalent by evaluating their existing ternary a second time for the "you" case and passing `[{seat: p.idx, html: youVariant}]` to `flash()`'s new 4th parameter.

**This reuses the SAME rendering code for both surfaces (no duplicate copy, no drift)** — directly satisfying the concern the CONTEXT.md's rejected alternative raised about "two systems to keep in step."

### Anti-Patterns to Avoid
- **Importing `src/net/*` directly into `src/ui/util.js` or `src/ui/flow.js`** to implement the widened payload. `module_graph_check.js` and `ui_contract_check.js` both gate "ui must not import net" — route any new network-adjacent call through the existing `netHandlers()` seam (`src/ui/handlers.js`) the same way `flash()` already does for `onBroadcast`.
- **Reading `appState.mySeat` inside `EVENT_NARRATION` builders without a `viewerSeat` override for the broadcast path.** The host's own `appState.mySeat` is only ONE seat; a builder that always reads the ambient global cannot render a DIFFERENT guest's variant. This is exactly why the `viewerSeat` parameter must be explicit and threadable, not implicit-only.
- **Hand-transcribing the ad-hoc `flash()` lines into the audit page.** Table lines can be imported directly (zero drift); ad-hoc lines cannot be imported as functions (they're string literals embedded in imperative flow code) — extracting them via a small grep script keeps the "did we miss a line?" question mechanically answerable (D-05) instead of trusting manual copy-paste.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| "Is this narration line about me?" | A new per-event ownership field on the event stream | `seatLocal(seat)` / `decisionIsLocal(seat)` (`src/ui/util.js:667,671`) | Already exists, already used by 6 precedent lines, and touching the event stream is the one thing this phase must never do |
| Per-viewer personalization for the live box | A second Firebase write path, or client-side polling | Additive `variants` field on the existing `narr` node | Firebase already delivers the same payload to every guest; widening it is strictly cheaper than a second channel |
| Timing curve for narration hold | A new bespoke formula for the 10% cut | The existing `MSG_HOLD_MULTIPLIER`/`BOT_MSG_HOLD_MULTIPLIER` named constants (`src/ui/util.js:533,568`) | Purpose-built in Phase 14 (D-10 there) exactly so pacing tuning never needs a code hunt — this is literally what they're for |
| Audit-page narration rendering | Recreate `pn()`/`poss()`/color logic in the audit page's own script | `import { pn, poss, describe, EVENT_NARRATION } from "../src/ui/util.js"` | Confirmed importable: `util.js`'s only module-scope dependencies (`appState`, `roundCfg`) have no side effects at import time — see Code Examples |

**Key insight:** Every mechanism this phase needs (viewer-locality checks, timing constants, table-driven text) already exists in the codebase from Phase 11's module split and Phase 14's pacing work. The work is extending existing seams, not inventing new architecture.

## Common Pitfalls

### Pitfall 1: Duplicated narration text drifting silently
**What goes wrong:** `src/orchestrator.js:247`/`:252` hand-write the exact same `shotclockskip` text that `EVENT_NARRATION.shotclockskip` (`src/ui/util.js:386`) already produces from the same event. If the audit's pruning pass edits the table entry, the orchestrator's hardcoded copy silently goes stale.
**Why it happens:** The event is recorded first (`:246`), then narrated manually instead of via `narrateLastEvent()`.
**How to avoid:** Flag on the audit page (tag: cut/merge — replace both call sites with `narrateLastEvent()` after the event fires, deleting the duplicate strings).
**Warning signs:** Grep for two near-identical template literals containing the same emoji/phrase.

### Pitfall 2: Breaking `bot_storm_narration_test.js`'s text-equality assertions
**What goes wrong:** This permanent `npm test` gate (`scripts/bot_storm_narration_test.js`, imports `EVENT_NARRATION`/`describe` directly from `src/ui/util.js`) asserts, DOM-free: (a) `moored` reason `justDocked` and `home` render byte-identical text; (b) reason `dock` + a shove renders text containing `"gust shoves"`; (c) reason `dock` + no shove renders the exact same text as `justDocked`; (d) a bare/no-`reason` event still renders a non-empty, non-`"undefined"` line.
**Why it happens:** The test never sets `appState.mySeat` (stays `null` — the module default, `src/state/index.js:67`), so `seatLocal(0)` always evaluates `false`. As long as second-person logic is gated behind `seatLocal()`/an unset `viewerSeat` (which then falls back to `seatLocal()`), the DEFAULT/third-person branch these assertions exercise is untouched by adding "you" branches — but only if the third-person wording itself is left byte-identical.
**How to avoid:** When adding second-person variants to `EVENT_NARRATION.moored` specifically, keep the existing third-person strings for `justDocked`/`home`/`dock`(unmoved) exactly as-is; add the "you" branch as a sibling, never a replacement.
**Warning signs:** `npm test` fails on `bot_storm_narration_test.js` specifically after a `moored` wording edit — re-check the four invariants above before touching anything else.

### Pitfall 3: Assuming the engine's `battle()` spoil wording matches live play
**What goes wrong:** CONTEXT.md's D-12 cites `src/engine/index.js:570-574` as "the two coin cases," including the `"(all they had)"` suffix. That code path (`Game.battle()`) is called only from `takeTurn()` (`src/engine/index.js:746`), which only the offline determinism simulator (`scripts/determinism_baseline.js`) exercises. **Every real game — solo, pass-and-play, online, human or bot — resolves battles through `asyncBattle()` in `src/orchestrator.js:377-548`**, which has different branching (`canCoins&&hasIng` human/bot choice at `:521-525`) and its `spoil` string never carries `"(all they had)"` (`orchestrator.js:527`: `spoil=take+" coins"`, no suffix, ever).
**Why it happens:** The two implementations were kept in step for the OUTCOME distribution (per `orchestrator.js:539`'s own comment "Kept in step with Game.battle") but not for the exact wording of the coin-spoil string.
**How to avoid:** Design the bribe-vs-cleaned-out split to work off the numeric prefix parsed from `e.spoil` (both paths clamp coin takes to `Math.min(5, loserCoins)`, so "5" always means a full/genuine payment and "<5" always means the loser had fewer than 5 coins with zero ingredients — see the Code Examples section for the exact derivation), not off any literal `"(all they had)"` substring, which real games never produce.
**Warning signs:** A narration test or manual playtest that only ever sees `"5 coins"` or plain `"N coins"` (never the `"(all they had)"` phrase) during live play — that is expected, not a bug.

### Pitfall 4: `showChatBubble` silently inheriting the NARR-06 timing cut
**What goes wrong:** `showChatBubble` (`src/ui/panel.js:335`) calls the shared `msgHoldMs(text)` — the exact same function `flash()`'s default hold path (`panel.js:383`) uses. Cutting `MSG_HOLD_MULTIPLIER` (util.js:533) without separating the two shortens chat bubbles too, which D-15 explicitly forbids.
**Why it happens:** `msgHoldMs()` was written as one shared curve before chat bubbles and game narration needed to diverge.
**How to avoid:** Confirmed only 2 call sites of `msgHoldMs()` exist in the whole codebase (`panel.js:335` and `panel.js:383`) — give `showChatBubble` its own multiplier/function (e.g. `chatBubbleHoldMs()` with its own named constant, mirroring `botMsgHoldMs()`'s pattern) before touching `MSG_HOLD_MULTIPLIER`.
**Warning signs:** A manual playtest where chat bubbles visibly fade faster after the NARR-06 change ships.

### Pitfall 5: Widening the payload but forgetting the host's own local render
**What goes wrong:** `netNarrate()`/`netBroadcast()` (`orchestrator.js:264,267`) call `showNarration(html)` to paint the HOST'S OWN screen using whatever string was passed as `html` — this is separate from the Firebase write. If a call site only updates the Firebase `variants` payload but keeps passing the OLD (always-third-person) string as `html`, the host itself never sees "you" even when the host is the subject.
**Why it happens:** Two independent renders (local DOM paint, Firebase write) share one function call; it's easy to update one and not the other.
**How to avoid:** Callers should keep computing the host's own "which string do I show" via `seatLocal()` exactly as the 6 precedent lines already do (this governs the `html`/`msg` argument), and separately build the `variants` array for OTHER seats. The host's own perspective is never delivered via `variants` — it's the ordinary `msg` argument, unchanged from today's pattern.

## Code Examples

### `describe()`-safe import of narration internals (audit page)

```js
// Source: verified read of src/ui/util.js:40-49, this session — the only two module-scope
// imports are `appState` (a plain mutable object literal, src/state/index.js) and `roundCfg`
// (a pure function, src/engine/index.js) — neither has side effects at import time, so
// importing util.js standalone (outside the live game) is safe.
import { EVENT_NARRATION, describe, pn, poss } from "../src/ui/util.js";
import { appState } from "../src/state/index.js";

// Minimal bootstrap so pn()/pname() and the trade/fish builders (which read
// appState.game.cfg.tradeBonus / .sardine) don't throw when called outside a live game:
appState.roster = [0,1,2,3].map(i => ({ id: "x", name: `Captain ${i}` }));
appState.game = { cfg: { tradeBonus: true, sardine: true } };

// Every table entry can now be exercised directly:
console.log(EVENT_NARRATION.dock({ t: "dock", p: 0, ing: "vanilla", got: "ing" }, () => [0,0]).txt);
```
Must be served over http(s) (`npm start`, i.e. `python3 -m http.server 8000` per `package.json`), not opened via `file://` — ES module imports are CORS-blocked from the `file:` origin in every major browser. `module_graph_check.js` (`SRC_DIR` scope check at `scripts/module_graph_check.js:155`) confirmed to ignore any resolved import that lands outside `src/`, so a page in `art-review/` importing FROM `src/` is invisible to that gate — zero risk of tripping it.

### Bribe-vs-cleaned-out derivation (NARR-04 / D-12), verified against both live paths

```js
// Both real spoil-generation paths clamp to at most 5:
//   orchestrator.js:527  (LIVE PLAY — the only path real games ever run)
//     take = Math.min(5, lose.coins); spoil = take + " coins";
//   engine/index.js:571,574  (SIMULATOR ONLY — never runs in a real game)
//     branch1: spoil = "5 coins"                      (coins>=5, nothing wanted)
//     branch4: spoil = take + " coins (all they had)"  (coins<5, zero ingredients)
//
// So for BOTH paths: spoilIng===null && the leading number in e.spoil === 5  => genuine bribe
//                     spoilIng===null && the leading number in e.spoil  <  5  => cleaned out
// (A leading number can only be <5 if the loser had fewer than 5 coins to begin with — in the
// live path this ALSO always implies zero ingredients, since hasIng would have routed to the
// "ing" branch instead — orchestrator.js:518-526.)
const spoilAmount = e.spoilIng ? null : parseInt(e.spoil, 10);
const isGenuineBribe = e.spoilIng === null && spoilAmount != null && spoilAmount >= 5;
```

### The anchorHold narration bug (D-13), exact current code

```js
// Source: src/ui/flow.js:220-224, verified this session
const reason=appState.game.mooredReason(p);
if(reason){appState.game.ev({t:"moored",p:p.idx,reason});await narrateLastEvent();liveRender();return;}
// a storm only ever charges (coins or a coin flip) once per turn — a second leg that
// also hits an island is a free pass, already-paid anchor holding fast
if(dodgedOnce.v){appState.game.ev({t:"anchorHold",p:p.idx});liveRender();return;}
//                                                          ^^^^^^^^^^^^ missing
//                                                          await narrateLastEvent()
```
The `moored` branch immediately above (`:221`) is the correct pattern to copy: `ev()` → `await narrateLastEvent()` → `liveRender()`. Existing copy for `anchorHold` already exists at `src/ui/util.js:318` (`"{pn}'s anchor already down — it holds fast, no need to pay twice in one storm ⚓"`) — the fix is purely the missing call, no new wording needed.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `.planning/codebase/ARCHITECTURE.md`/`TESTING.md` describe a monolithic `index.html` — this is stale; the actual repo on this branch is fully split into `src/**` ES modules with a `scripts/`-based Node test harness (confirmed by directly listing `src/` and reading `package.json`'s `test` script this session). CONTEXT.md's file:line references already match the modular layout, not the stale docs. | Summary, throughout | Low — every specific claim in this file was independently re-verified against the actual `src/**` files, not the stale architecture doc. Flagging only so the planner doesn't cross-reference `ARCHITECTURE.md` for line numbers. |
| A2 | The recommended `variants: [{seat, html}]` shape for the widened `narr` payload is a NEW proposal (Claude's Discretion per CONTEXT.md D-10's "exact shape... as long as an older client falls back to today's `html`") — not something previously decided or tested in this codebase. | Architecture Patterns, Pattern 3 | Medium — if the planner or Wyatt prefers a different shape (e.g. two flat fields `youHtml`/`subject` instead of an array), the fallback-safety property still holds either way; only the multi-variant case (D-08's attacker+defender both needing distinct "you" text on the same event) requires the array shape specifically. Flag for plan-time confirmation if a simpler two-field shape is preferred for the common single-subject case. |
| A3 | Wyatt's own scope estimates from CONTEXT.md ("~44 lines gain a second version... ~30 for doer-only") are carried forward as-is; this research did not independently re-derive them (they come from a locked decision record, D-08, not from this session's own count). | Architecture Patterns, Pattern 2 | Low — these are estimates for planning-time sizing, not gating facts; the corrected line-count-of-surfaces (49 total narration call sites) in this file is independently verified and should be used for the actual per-line audit-page inventory. |

## Open Questions

1. **Does the audit page need to cover `orchestrator.js:742`/`:746` (end-of-voyage lines) at all, given Phase 16 owns the EOV box's visibility?**
   - What we know: The text itself is real player-facing narration; NARR-01 says "storm, docking, battle, trade, bribe, etc." — "etc." plausibly includes EOV lines. Phase 16's UI-07 only scopes the box's *visibility after the game ends*, not its wording.
   - What's unclear: Whether Wyatt wants EOV wording folded into this phase's review pass, or explicitly deferred alongside the box-visibility work.
   - Recommendation: Include them in the inventory (cheap — 2 lines), default-tag "keep, no changes this phase," and let Wyatt confirm during the D-04 review pass rather than deciding for him.

2. **Exact `variants` payload shape** (see Assumptions Log A2) — array-of-`{seat,html}` vs. flat `youHtml`/`subject` fields.
   - What we know: Either satisfies the backward-compatibility requirement.
   - What's unclear: Whether D-08's two-subject case (attacker AND defender both needing "you" on the same battle event) is common enough to justify the array shape's slightly larger payload over two flat fields plus a documented "battle events only ever need one variant, keyed to whichever seat is asking" simplification.
   - Recommendation: Use the array shape (this file's recommendation) — it generalizes cleanly to N subjects per event with no special-casing, and the payload-size difference is negligible for a Realtime Database narration node that's already ephemeral (overwritten every message).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `npm test` gates, `scripts/extract_flash_lines.js` (optional) | ✓ | v25.9.0 | — |
| Python 3 | `npm start` (`python3 -m http.server 8000`, needed to serve the audit page as ESM) | ✓ | 3.9.6 | — |
| git | version control | ✓ | present | — |
| Firebase RTDB | live multiplayer testing of the `variants` payload | Not probed this session (requires network + project credentials) | — | Manual two-tab test per `MEMORY.md`'s MP test harness; solo/pass-and-play testing needs no Firebase at all |

No missing dependencies block this phase. The audit page specifically requires being opened via `npm start` (http server), not `file://` — noted as a real constraint above, not a missing dependency.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None formal — hand-rolled `check(name, actual, expected)` harness per script, `process.exit(failures?1:0)` convention (`.planning/codebase/TESTING.md`, confirmed still current by reading `scripts/bot_storm_narration_test.js`, `scripts/hail_ranking_test.js` this session) |
| Config file | none — `package.json`'s `"test"` script chains 12 gates |
| Quick run command | `node scripts/bot_storm_narration_test.js` (existing narration-table gate; extend or sibling for new NARR- assertions) |
| Full suite command | `npm test` (12 gates: `determinism_baseline.js --verify` [31 seeds] + `engine_contract_check.js` + `dlog_replay_test.js` + `net_registry_test.js` + `net_contract_check.js` + `state_contract_check.js` + `module_graph_check.js` + `ui_contract_check.js` + `no_undef_check.js` + `hail_ranking_test.js` + `storm_moored_reason_test.js` + `bot_storm_narration_test.js` — confirmed exact list from `package.json`'s `"test"` script this session) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NARR-01 | Audit page renders every catalogued line without throwing, imports resolve | manual (visual review, approval gate) | Open `art-review/narration-audit.html` via `npm start` | ❌ Wave 0 — page doesn't exist yet |
| NARR-02 | `anchorHold` fires `narrateLastEvent()`; broke-can't-sail (human+bot) and broke-can't-anchor each surface a line | unit (DOM-free) | `node scripts/bot_storm_narration_test.js` (extend) or a new `narr_gap_test.js` | ❌ Wave 0 — new assertions needed |
| NARR-03 | Storm intro reads "First, the storm pushes you {dir1}" | unit (DOM-free, text match against the `flash()` literal at `flow.js:570`) | Extract the literal into a testable function, or assert via a regex on the source string in a new script | ❌ Wave 0 |
| NARR-04 | Bribe line splits genuine-bribe vs cleaned-out from `e.spoil`'s leading number | unit (DOM-free) | Extend `EVENT_NARRATION.battle` coverage — a fabricated `{t:"battle",spoil:"5 coins",spoilIng:null}` vs `{spoil:"2 coins",spoilIng:null}` event, assert differing wording, mirroring `bot_storm_narration_test.js`'s pattern exactly | ❌ Wave 0 |
| NARR-05 | Log personalizes via `seatLocal()`; live box personalizes via `variants` broadcast; existing `moored` invariants (Pitfall 2) survive | unit (DOM-free) for the table/`describe()` half; **manual** two-tab multiplayer test for the broadcast half (Firebase not mocked anywhere in this codebase — confirmed by grep, no existing test touches `netSetNarr`/`watchNarr`) | `node scripts/bot_storm_narration_test.js` (regression) + new unit assertions on `isLocalTo()`/builder `viewerSeat` behavior; MANUAL: MP test harness per `MEMORY.md` | Partial — unit half ❌ Wave 0, manual half already has an established harness |
| NARR-06 | `MSG_HOLD_MULTIPLIER`/`BOT_MSG_HOLD_MULTIPLIER` cut 10%; `showChatBubble` unaffected | unit (pure function) | New assertions calling `msgHoldMs()`/`botMsgHoldMs()`/the new chat-bubble-specific hold function with known text lengths, asserting the numeric relationship holds | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node scripts/bot_storm_narration_test.js` (fastest existing narration-relevant gate; run any new/extended narration unit script alongside it)
- **Per wave merge:** `npm test` (full 12-gate suite, including the 31-seed determinism verify — expected to stay green since no narration edit touches `src/engine/index.js` or the event stream)
- **Phase gate:** Full suite green before `/gsd-verify-work`, PLUS a manual two-tab Chrome+Safari multiplayer session exercising: (a) a remote seat's own storm/anchor/battle/bribe moment showing "you" text on THAT seat's screen while other seats see third person, (b) a version-skew smoke check is not practical to simulate live (would need running two different commits simultaneously) — instead, manually verify the fallback branch by testing with `variants` temporarily stripped from a test payload and confirming `v.html` still renders correctly.

### Wave 0 Gaps
- [ ] No existing test asserts on any narration text OTHER than `EVENT_NARRATION.moored` — every other table entry (`dock`, `battle`, `aground`, `shotclockskip`, etc.) and every ad-hoc `flow.js`/`orchestrator.js` line has zero automated coverage today. Extending `bot_storm_narration_test.js` (or adding a sibling script following its exact DOM-free, `loadEngine()`-free, direct-`util.js`-import pattern) is required before NARR-02/03/04/05/06 edits can be verified without a full manual playtest each time.
- [ ] No test exercises `netSetNarr`/`watchNarr`/the Firebase write-read round-trip at all (confirmed by grep — zero references outside `src/net/writers.js` and `src/orchestrator.js` themselves). The `variants` broadcast mechanism (NARR-05's hard part) can only be verified by unit-testing its PURE pieces (`isLocalTo()`, the builder's `viewerSeat` branch, the `watchNarr` picking logic given a fabricated `snap.val()`) plus a manual two-tab session for the real end-to-end path — this is a structural gap in the harness, not something this phase should attempt to close wholesale (no existing precedent for mocking Firebase in this repo).
- [ ] Framework install: none — the DOM-free `check()`/`process.exit()` convention needs no new tooling, only new script files following the existing pattern.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Game has no auth (confirmed, `.planning/codebase/ARCHITECTURE.md` "Authentication: None" — still accurate for this unauthenticated-by-design game) |
| V3 Session Management | No | Not touched by this phase |
| V4 Access Control | No | Not touched by this phase |
| V5 Input Validation | Marginal — pre-existing protection, unchanged | Player names are the only user-supplied string that flows into narration (`pn(i)`/`pname(i)`). Confirmed at `src/ui/util.js:196-198`: `pname()` already runs `escHtml(s.name)` for claimed seats before interpolating into narration HTML. This phase does not add any new user-input surface — every new narration string is either static copy or interpolates already-escaped `pn()`/`poss()` output, same as today. |
| V6 Cryptography | No | Not touched by this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored/reflected XSS via player display name flowing into `innerHTML`-rendered narration | Tampering / Elevation of Privilege (in a shared-room context) | Already mitigated pre-existing: `escHtml()` applied at the single source (`pname()`), not re-escaped ad-hoc at each narration call site — **preserve this pattern**; any new narration string that interpolates a raw (non-`pn()`/`poss()`) player-supplied value would bypass it. This phase's new/changed lines all route names through `pn()`/`poss()`, so no new surface is introduced. |
| Widened Firebase payload (`variants`) as an injection vector | Tampering | The `variants` array is HOST-COMPUTED, never client-authored (only the host ever calls `netSetNarr`, confirmed by the `appState.isHost` guard at `orchestrator.js:264,267`) — guests only ever READ this node, never write it. No new write-path is opened to guests. |

## Sources

### Primary (HIGH confidence — direct file reads this session)
- `src/ui/util.js` (full `EVENT_NARRATION` table, `describe()`, `seatLocal()`, `decisionIsLocal()`, `pn()`/`poss()`/`pname()`, `msgHoldMs()`/`botMsgHoldMs()`, module-scope imports) — read in full sections this session.
- `src/ui/flow.js` (`windLeg`, `humanAct`, `humanTurn`, `botTurn`'s hail/sail block) — read in full sections this session; every cited line number independently re-verified via `grep -n`.
- `src/ui/panel.js` (`flash()`, `showChatBubble`, `narrateLastEvent()`, `panel()`) — read in full this session.
- `src/orchestrator.js` (`netNarrate`, `netBroadcast`, `watchNarr`, `asyncBattle`, `expireShotClock`, `resumeHostGame`, `boot()`'s session-restore ordering, `liveResolveEndNet`) — read in full sections this session.
- `src/net/writers.js` (`netSetNarr`'s exact `{html,t}` payload) — read in full this session.
- `src/engine/index.js` (`battle()` at :567-575, `asym` at :821, `takeTurn()` at :746) — read read-only, confirmed dead-branch and simulator-only scope.
- `art-review/gallery.html`/`gallery-icons.html`/`gallery-batch2.html` (structure, self-contained classic-script pattern, no ESM imports) — read/greped this session. **Correction to CONTEXT.md:** the referenced `gallery-islands.html` does not exist; the three real files above are the actual pattern.
- `scripts/module_graph_check.js`, `scripts/bot_storm_narration_test.js`, `scripts/lib/load_engine.js`, `package.json`'s `"test"` script — read this session to establish the exact 12-gate list and the `moored` test's invariants.

### Secondary (MEDIUM confidence)
- `.planning/phases/15-narration-audit-fixes/15-CONTEXT.md` — the locked decision record this research operationalizes; all D-01…D-27-numbered decisions treated as given, not re-litigated.
- `.planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-CONTEXT.md` — prior narration work precedent (D-11/D-13/D-14/D-21/D-27), confirms the "surfacing existing copy > authoring new copy" pattern that also applies here.

### Tertiary (LOW confidence)
- `.planning/codebase/ARCHITECTURE.md`/`TESTING.md` — confirmed STALE on the "monolithic index.html" claim (the repo has since modularized into `src/**`); used only for the general layer-boundary principle (ui/net separation), which independently checks out against `module_graph_check.js`'s actual enforced rules.

## Metadata

**Confidence breakdown:**
- Narration inventory (Q1): HIGH — exhaustive grep across `src/ui/flow.js`, `src/ui/util.js`, `src/ui/panel.js`, `src/orchestrator.js`, every line number independently re-verified.
- Second-person mechanism (Q2): HIGH on the mechanics (payload shape, backward-compat property, `describe()`'s per-client independence all directly verified); MEDIUM on the specific `variants` shape recommendation (Assumptions Log A2 — this is a proposed design, not a pre-existing pattern).
- Replay/reload safety (Q3): HIGH — `appState.replaying` guards on `netNarrate`/`netBroadcast` confirmed at exact lines; `mySeat` load-before-replay ordering confirmed in `boot()`/`resumeHostGame()`; pass-and-play's `passGate()` reassignment of `mySeat` (including during replay) confirmed at `src/ui/lobby.js:82,94`.
- Timing constants (Q4): HIGH — exact current values (`0.8`, `0.5`), exact and complete call-site list (2 for `msgHoldMs`, 3 for `botMsgHoldMs`) confirmed by grep.
- Audit page feasibility (Q5): HIGH — import-safety of `util.js` confirmed by reading its full module-scope import list; `module_graph_check.js`'s scope-exclusion of non-`src/` importers confirmed by reading its own source.
- Broke gates / anchorHold (Q6): HIGH — every cited line read directly, one line-number correction made (bot sail gate is `flow.js:675-678`, not exactly `:676` as CONTEXT.md's shorthand implied — the condition itself is on `:675`).
- Bribe split (Q7): HIGH, with a significant correction to CONTEXT.md's premise (engine-vs-live divergence) — traced both code paths in full and confirmed the derivation works without any engine change.
- Verification approach (Q8): HIGH on what exists today (12 gates, exact list, the one narration-text test and its exact invariants); MEDIUM on the recommended NEW test shape (a proposed extension pattern, not yet built).

**Research date:** 2026-07-27
**Valid until:** Stable for this phase's lifetime (~7-14 days is a reasonable estimate for a fast-moving in-repo codebase, per repo convention) — re-verify specific line numbers if other phases land commits touching `src/ui/util.js`, `src/ui/flow.js`, `src/orchestrator.js`, or `src/net/writers.js` before Phase 15 executes.
