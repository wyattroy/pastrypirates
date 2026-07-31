# Phase 7: Foundation & Determinism Baseline - Pattern Map

**Mapped:** 2026-07-24
**Files analyzed:** 11
**Analogs found:** 7 / 11 (4 are first-of-kind, no analog exists)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `scripts/lib/load_engine.js` | utility (extraction seam) | transform (HTML→vm sandbox→module exports) | `scripts/real_game_test.js` (extraction block, lines 16-49) | exact — this file's body is a direct lift of that block |
| `scripts/determinism_baseline.js` | test / CLI tool | batch (capture) + request-response (verify) | `scripts/dlog_replay_test.js` (`check()` + exit-code convention, lines 66-116) | role-match — closest existing "assert and exit" harness |
| `scripts/fixtures/determinism/manifest.json` + `seed-<N>.jsonl` | config / generated data | file-I/O | none | no analog — first structured fixture corpus in repo |
| `package.json` | config | n/a | none | no analog — first-of-kind, root config file |
| `src/main.js` | module entry / provider | event-driven (boot-time side effects) | none (closest conceptual precedent: `boot()` in index.html, not extractable as analog) | no analog — first ES module in repo |
| `src/<trivial leaf module>.js` | utility | transform (pure) | none | no analog — first-of-kind |
| `docs/MODULES.md` | config/docs | n/a | none | no analog — first doc file in `docs/` |
| `README.md` (modified) | docs | n/a | `README.md` itself (existing sections) | exact — modify in place, follow existing heading style |
| `index.html` (modified — one script tag) | config (script loading) | n/a | `index.html:25-26` (existing classic `<script src=...>` tags) | exact — same file, same tag-insertion pattern |
| `scripts/real_game_test.js` (modified: CJS→ESM) | test | batch | itself (pre-conversion) + `scripts/dlog_replay_test.js` (post-conversion sibling) | exact — convert in place |
| `scripts/dlog_replay_test.js` (modified: CJS→ESM) | test | request-response (assertion-based) | itself (pre-conversion) | exact — convert in place |

## Pattern Assignments

### `scripts/lib/load_engine.js` (utility, transform)

**Analog:** `scripts/real_game_test.js` lines 16-49 (the extraction block), cross-checked against the identical duplicate in `scripts/dlog_replay_test.js` lines 20-43.

**What today's two harnesses do, verbatim (this is exactly what `load_engine.js` must consolidate):**

```javascript
// scripts/real_game_test.js:16-49 (CJS — will become ESM in load_engine.js)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const scriptStart = html.indexOf("<script>") + "<script>".length;
const scriptEnd = html.indexOf("function escHtml");
if (scriptStart < 8 || scriptEnd === -1) {
  throw new Error("Could not locate the Game-class/roundCfg region in index.html — has the file structure changed?");
}
const engineSrc = html.slice(scriptStart, scriptEnd) + "\nthis.Game=Game;this.roundCfg=roundCfg;\n";

const sandbox = {
  document: { documentElement: { style: { setProperty() {} } }, body: { innerHTML: "" } },
  console,
  Math, Array, Object, Set, Map, JSON, Date, String, Number, Boolean,
};
vm.createContext(sandbox);
vm.runInContext(engineSrc, sandbox, { filename: "index.html (engine region)" });

const { Game, roundCfg } = sandbox;
if (typeof Game !== "function" || typeof roundCfg !== "function") {
  throw new Error("Game/roundCfg didn't come out of the extracted region — extraction boundaries may be wrong.");
}
```

**Loud-failure-on-drift convention** (must be preserved verbatim — both error messages, both guard conditions):
- `if (scriptStart < 8 || scriptEnd === -1) throw new Error(...)` — boundary-not-found
- `if (typeof Game !== "function" || typeof roundCfg !== "function") throw new Error(...)` — extraction-produced-nothing

**ESM conversion targets** (verified working end-to-end in RESEARCH.md Pattern 2, Node v25.9.0):
```javascript
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

**New requirement not in either existing harness (D-11):** `load_engine.js` must additionally compute and return `sourceHash = crypto.createHash("sha256").update(region).digest("hex")` over the same `region` slice, so `determinism_baseline.js` can distinguish "fixtures stale" from "engine behavior changed."

**Export shape (async, per D-12's Phase-8-forward-compat requirement):**
```javascript
export async function loadEngine() {
  // ... same body as above ...
  return { Game, roundCfg, sourceHash };
}
```
Async even though the vm extraction itself is synchronous — Phase 8 replaces the function body with `await import(...)`; callers (`determinism_baseline.js`, `real_game_test.js`, `dlog_replay_test.js`) must already be calling it with `await` so Phase 8 touches only this one file.

**Sentinel-based second extraction NOT part of this file's scope:** `dlog_replay_test.js` has a *separate* `replayShortfall` sentinel-region extraction (lines 45-64, delimited by `/* ===== replayShortfall — extractable region ... ===== */` / `/* ===== end replayShortfall ===== */` comments). Per RESEARCH.md's structure recommendation, this stays local to `dlog_replay_test.js` — `load_engine.js` only owns the `Game`/`roundCfg` region.

---

### `scripts/determinism_baseline.js` (test/CLI tool, batch+request-response)

**Analog:** `scripts/dlog_replay_test.js` — specifically the `check()` helper and exit-code convention (lines 66-116).

**Assertion-and-exit-code pattern to mirror:**
```javascript
// scripts/dlog_replay_test.js:67-72
let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(58)} got=${String(actual).padEnd(6)} want=${expected}`);
}
```
```javascript
// scripts/dlog_replay_test.js:115-116
console.log(`\n${failures === 0 ? "All cases passed." : failures + " case(s) FAILED."}`);
process.exit(failures === 0 ? 0 : 1);
```
`determinism_baseline.js` should use the same shape for `--verify`: accumulate a `failures`/`firstDivergence` counter across all 30 seeds, print PASS/FAIL per seed (or just the aggregate + first divergence per D-10), and `process.exit(failures === 0 ? 0 : 1)`.

**Seeding/bot-rotation convention to reuse verbatim** (`scripts/real_game_test.js:21,52,74-77`):
```javascript
const SEED_BASE = 12345;
const BOT_STRATS = ["pirate", "trader", "balanced", "rusher", "monopolist"];
// ...
const strategies = [0, 1, 2, 3].map(s => BOT_STRATS[(i + s) % BOT_STRATS.length]);
const cfg = roundCfg(strategies);
const g = new Game(cfg, SEED_BASE + i, true); // record=true — Game.ev() is a no-op otherwise
g.play();
```
D-03 extends the loop range to 30 (`SEED_BASE` .. `SEED_BASE+29` = `12345`-`12374`), unlike `real_game_test.js`'s default 2000-game loop.

**CLI flag parsing precedent:** `scripts/real_game_test.js:20` — `process.argv[2] ? parseInt(process.argv[2], 10) : 2000` — simple positional-arg style, no parsing library. `determinism_baseline.js` should follow the same "no library" convention for `--capture`/`--verify` (per RESEARCH.md's V5 note: `if (arg === "--capture")` style is sufficient).

**Manifest-vs-hash comparison — explicit anti-pattern warning (RESEARCH.md Pitfall 3):** `--verify` must NOT byte-diff `manifest.json` itself (a `capturedAt` timestamp field would false-fail every run). It must load the manifest as reference data, replay each seed fresh, hash the fresh event log, and compare hash-to-hash against `manifest.perSeed[i].sha256`.

---

### `index.html` (modified — one line only)

**Exact current script-tag block** (`index.html:22-27`):
```html
<script type="application/ld+json">
{"@context":"https://schema.org", ...}
</script>
<script src="https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**The inline engine `<script>` opens at `index.html:859`:**
```html
<script>
"use strict";
/* ================= RNG ================= */
function mulberry32(a){...}
```
This is the bare `<script>` (no attributes) that `real_game_test.js`/`dlog_replay_test.js` locate via `html.indexOf("<script>")` — confirmed by RESEARCH.md to match exactly once in the file. **The new module tag must be written as `<script type="module" src="src/main.js"></script>` — never a second bare `<script>`** — or it silently becomes the first match and breaks every extraction-based harness including `load_engine.js` itself.

**Insertion point (D-16):** appended at the very end of the file, after the existing inline classic `<script>` block closes (that block runs `:859`–`:5637`, untouched). No other line in `index.html` changes.

---

### `scripts/real_game_test.js` / `scripts/dlog_replay_test.js` (modified: CJS → ESM)

**Analog:** each other + RESEARCH.md Pattern 2 (verified conversion recipe).

**Current CJS header to replace** (both files, near-identical):
```javascript
const fs = require("fs");
const path = require("path");
const vm = require("vm");
```

**ESM replacement (verified working, RESEARCH.md Pattern 2):**
```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { loadEngine } from "./lib/load_engine.js";
const { Game, roundCfg, sourceHash } = await loadEngine();   // top-level await
```

Both files' own `Game`/`roundCfg` extraction blocks (lines 16-49 in `real_game_test.js`; lines 20-43 in `dlog_replay_test.js`) are deleted entirely and replaced by the `loadEngine()` call above. `dlog_replay_test.js`'s separate `replayShortfall` sentinel extraction (lines 45-64) is untouched — it stays local, not routed through `load_engine.js`.

`process.argv`, `process.exit(code)`, `console.log` — unchanged, no ESM-specific concerns (confirmed in RESEARCH.md).

---

### Event shape for JSONL serialization (D-01/D-02/D-05 target)

**Source:** `index.html:1257-1259`, the `Game.ev()` method:
```javascript
ev(o){if(!this.record)return;o.round=this.round;o.wind=this.windNow;o.storm=this.stormNow;o.wind2=this.windNow2;
  o.state=this.players.map(p=>({pos:[...p.pos],coins:p.coins,ing:[...p.ing],done:p.done}));
  o.tokens={...this.tokens};this.events.push(o);}
```
Every event object already carries `{t: <type>, round, wind, storm, wind2, state: [...], tokens: {...}, ...event-specific fields}` — this is what gets serialized one-per-line into `seed-<N>.jsonl`. Example call sites showing event-specific fields to expect in the corpus:
```javascript
// index.html:1272, 1289, 1291, 1294, 1295
this.ev({t:"tradewind", p:p.idx});
this.ev({t:"moored", p:p.idx});
this.ev({t:"anchorHold", p:p.idx});
this.ev({t:"dodge", p:p.idx});
```
Battle events carry `{t:"battle"|"battleflee", a, d, downwind, flips, rounds, winner}` (confirmed via `real_game_test.js:83-93` consumption code). `g.events` (the array `Game.ev()` populates) is only non-empty when `Game` is constructed with `record=true` as the third constructor arg — **this exact gotcha is already documented at `dlog_replay_test.js:103`** and must carry into `determinism_baseline.js`'s capture code: `new Game(roundCfg(strategies), seed, true)`.

Per RESEARCH.md Open Question #1 recommendation: put the final-state snapshot (D-05) as the last JSONL line of each seed file (e.g. `{"t":"__final__", ...}`) so it participates in that seed's single SHA-256, rather than splitting the oracle across two comparison mechanisms.

---

## Shared Patterns

### Loud failure on extraction/format drift
**Source:** `scripts/real_game_test.js:29-30,47-48`, `scripts/dlog_replay_test.js:29-30,50-51,59-60,62-63`
**Apply to:** `load_engine.js`, `determinism_baseline.js`
```javascript
if (scriptStart < 8 || scriptEnd === -1) {
  throw new Error("Could not locate the Game-class/roundCfg region in index.html — has the file structure changed?");
}
```
Every boundary/shape check in the existing harnesses throws a specific, named error rather than failing silently — this convention is explicitly called out in CONTEXT.md as continuing the v1.0 "never silently hand back something that looks fine" principle (D-07 there, D-10 here).

### Exit-code convention
**Source:** `scripts/dlog_replay_test.js:116`
**Apply to:** `determinism_baseline.js` (D-09 requires this explicitly, citing `dlog_replay_test.js` by name)
```javascript
process.exit(failures === 0 ? 0 : 1);
```
Note `real_game_test.js` does NOT follow this (it only prints, never exits non-zero) — it is the older/weaker convention. New tooling follows `dlog_replay_test.js`, not `real_game_test.js`, per RESEARCH.md's explicit contrast ("New tooling follows the former").

### Deterministic RNG / record flag
**Source:** `index.html:1257` (`Game.ev()`), `dlog_replay_test.js:103-104`
**Apply to:** `determinism_baseline.js` capture code, both converted harnesses
- All randomness routes through `this.r()` (mulberry32, seeded) — never touch `Math.random()` directly; this is existing engine behavior, not something new code needs to implement, but capture/verify code must not introduce any non-deterministic ordering (e.g., object key iteration must be stable — confirmed safe in RESEARCH.md's Sources section: event objects use only string keys, no floats/int-like keys).
- `new Game(cfg, seed, true)` — third arg `record` must be `true` or `g.events` stays empty.

### `__dirname` in ESM
**Source:** RESEARCH.md Pattern 2 (verified in this repo's Node v25.9.0)
**Apply to:** `load_engine.js`, both converted harnesses, `determinism_baseline.js`
```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

## No Analog Found

Files with no close match in the codebase — planner should use RESEARCH.md's Code Examples/Architecture Patterns sections directly, since there is no existing project convention to follow:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `package.json` | config | n/a | First package.json in repo (project is currently zero-npm-config, confirmed: file does not exist) |
| `src/main.js` | module entry | event-driven | First ES module in repo; RESEARCH.md Pattern 3 gives a verified, ready-to-use implementation (guarded `window.__pp_module_ok`, non-throwing `firebase` check) |
| `src/<trivial leaf module>.js` | utility | transform | First-of-kind; naming/shape is explicitly Claude's Discretion per CONTEXT.md D-14 |
| `docs/MODULES.md` | docs | n/a | First file under `docs/` (directory does not exist yet, confirmed) |
| `scripts/fixtures/determinism/manifest.json`, `seed-<N>.jsonl` | generated data | file-I/O | First structured fixture corpus; schema is Claude's Discretion per CONTEXT.md, with RESEARCH.md's Open Question #1 giving a concrete recommendation (final-state as last JSONL line, not split into manifest) |

`README.md` is a modification, not a new file — the analog is the file's own existing structure; add a short pointer section in the existing heading style (no excerpt needed, low-risk edit).

## Metadata

**Analog search scope:** `scripts/` (all `.js` files), `index.html` (script tags + `Game.ev()` definition and call sites), repo root (confirmed no `package.json`, no `docs/`, no `src/`)
**Files scanned:** `scripts/real_game_test.js`, `scripts/dlog_replay_test.js`, `scripts/battle_sim.js` (checked, confirmed no CJS constructs — needs zero changes per RESEARCH.md), `index.html` (script-tag region lines 15-27, engine-open line 859, `ev()` definition line 1257, several `this.ev({...})` call sites 1272-1295)
**Pattern extraction date:** 2026-07-24
