#!/usr/bin/env node
/* RULE-01 GATE — a captain who passes is paid a dubloon, at every site, BEFORE the event records it.
 *
 * WHY THIS EXISTS. Passing is the always-available turn-ender: the one move nobody can ever be
 * denied. RULE-01 makes it pay one dubloon. Three separate places in this tree end a turn that way
 * — the human menu and the animated bot fallback in 4/src/ui/flow.js, and the engine fallback in
 * 4/src/engine/index.js — and the flow-tier bot fallback is duplicated on purpose rather than
 * inherited (the comment above it says why). A payment added only to the engine would pay the
 * simulator and leave every real browser game exactly as broken, so this gate checks all three.
 *
 * Bots and humans have identical rules and affordances (.planning/PROJECT.md -> Constraints). Bots
 * pass, so bots are paid. That is settled and is not an open question.
 *
 * WHAT IT GATES
 *   RULE-01 payment     One shared Game.prototype.doPass(p) raises the acting captain's purse by
 *                       exactly 1 — not 0, not 2 — and appends exactly one pass entry. No other
 *                       captain's purse moves.
 *   RULE-01 ORDERING    *** THE ASSERTION THAT MATTERS MOST IN THIS FILE ***
 *                       The purse is mutated BEFORE the event is recorded. Game.ev() is a recorder,
 *                       not a reducer: it builds its own state snapshot at the instant it is called,
 *                       mapping every captain's position, purse, hold, done flag and baking flag.
 *                       Record before paying and that snapshot holds the PRE-payment purse, so the
 *                       replay scrubber shows a captain a dubloon short at the exact tick their
 *                       narration claims they were paid. Phase 3 freezes this event stream into a
 *                       determinism corpus, after which the same fix costs a gated re-record
 *                       (docs/DETERMINISM-RERECORD.md). So the ordering is a predicate, not a style
 *                       preference, and it is asserted DIRECTLY off the recorded snapshot rather
 *                       than inferred from the order of two lines in the source.
 *   RULE-01 event shape The pass entry's key set is unchanged: the turn envelope plus `sea`, with no
 *                       key added, removed or renamed. Derived from a recorded {t:"turn"} entry in
 *                       the same run rather than hand-typed, so it stays true if ev() ever gains a
 *                       field (and stays a real check if it does not).
 *   RULE-01 all sites   Structural, on 4/src/ui/flow.js read as raw text: both UI-tier sites call
 *                       the shared method and neither emits a bare pass event any more.
 *   Cursor placement    The human-only sea-cursor advance stays in the human menu and did NOT
 *                       migrate into the engine. It is per-device narration bookkeeping owned by one
 *                       seat; bots walk their own derived offsets and never touch it. Folding it
 *                       into the shared method would hand it to bots.
 *   Determinism         4/src/engine/ still contains zero wall-clock and zero random sources. A
 *                       single non-seeded call there makes seeded lockstep replay meaningless and
 *                       the Phase 3 corpus worthless.
 *
 * TWO HALVES. Half one imports ../src/engine/index.js and drives the real engine — source shape
 * cannot tell you what a snapshot actually contains. Half two reads 4/src/ui/flow.js as raw text,
 * the source-text assertion convention of scripts/narration_flow_test.js, because botTurn and
 * humanAct need a DOM and can never run here.
 *
 * CONTROLS, because a harness is unreviewed code (docs/HARD-WON-LESSONS.md §3). Every run prints
 * quantities whose value is known before anything is measured: the record flag is on (ev() opens
 * with an early return on it, so a missing flag reads as a plausible, entirely fabricated "the
 * engine never records a pass"); the event log is non-empty; the anchor searches found their
 * anchors; and the number of source anchors located is printed, because a green run over a slice
 * that matched nothing is the shape of check this project has shipped before.
 *
 * `w == null`, never `!w`, and `q.idx` compared with `!==` — seat 0 is a real seat and a real
 * winner (docs/HARD-WON-LESSONS.md §3, the falsy zero).
 *
 * QUOTED vs BARE. Half two counts raw substrings in flow.js, so any key or call named in PROSE over
 * there must be written bare. Same trap as 4/scripts/seat_arg_check.js, whose first run failed on
 * the comment documenting the bug it existed to catch (HARD-WON-LESSONS §1b).
 *
 * FAILURE DEMONSTRATION (CLAUDE.md §4 — a check nobody has seen fail is not yet a check). Recorded
 * with observed exit codes in 01-04-SUMMARY.md.
 *
 * Run: node 4/scripts/pass_coin_test.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Game, roundCfg } from "../src/engine/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");            // -> 4/
const SRC = path.join(ROOT, "src");                 // -> 4/src
const FLOW_PATH = path.join(SRC, "ui", "flow.js");
const ENGINE_DIR = path.join(SRC, "engine");
const ENGINE_PATH = path.join(ENGINE_DIR, "index.js");
const FLOW_SRC = fs.readFileSync(FLOW_PATH, "utf8");
const ENGINE_SRC = fs.readFileSync(ENGINE_PATH, "utf8");

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

function lineOf(src, idx) { return src.slice(0, idx).split("\n").length; }
function countOf(src, needle) { return src.split(needle).length - 1; }

/* Locate a region by the code that surrounds it, never by line number — line numbers in this file
 * would rot the first time somebody edits flow.js above the site. Returns "" and records a failure
 * when the anchor is missing, so a moved anchor is a loud FAIL rather than a silently empty slice
 * that every later assertion then "passes" against. */
let anchorsFound = 0;
function regionAfter(src, anchor, chars, label) {
  const i = src.indexOf(anchor);
  if (i < 0) { failures++; console.log(`  FAIL  ${label}: anchor not found in source: ${JSON.stringify(anchor)}`); return ""; }
  anchorsFound++;
  console.log(`         ${label} anchored at ${path.basename(FLOW_PATH)}:${lineOf(src, i)}`);
  return src.slice(i, i + chars);
}

const STRATS = ["pirate", "trader", "balanced", "rusher"];
// roundCfg() returns bakeoff:true headless and this passes it explicitly too: these are the
// BAKE-OFF rules, which is what /4 ships. Third arg true is the record flag.
function newGame(seed) { return new Game({ ...roundCfg(STRATS), bakeoff: true }, seed, true); }

console.log("\nRULE-01 — passing pays a dubloon\n");

/* ================= HALF ONE: the real engine ================= */
console.log("  -- engine: the shared method --");

const g = newGame(7919);
checkTrue("CONTROL: the game was constructed with the record flag on", g.record === true);
const HAS_DOPASS = typeof g.doPass === "function";
checkTrue("CONTROL: doPass exists on the Game prototype", HAS_DOPASS);
g.advanceWind();                       // so the recorded entry carries real weather, as in play()

/* Every assertion runs before the exit (the 4/scripts/ house shell), so the engine half is skipped
 * as a block rather than allowed to throw on a missing method — a gate that dies at its first
 * failure hides the rest of the report, and half two is what tells you WHERE the method is missing
 * from. */
if (!HAS_DOPASS) console.log("         (engine half skipped — the shared method does not exist yet)");
if (HAS_DOPASS) {
const p = g.players[1];
const coinsBefore = g.players.map((q) => q.coins);
const evBefore = g.events.length;
g.doPass(p);
const e = g.events[g.events.length - 1] || {};

check("doPass raises the acting captain's purse by exactly one dubloon", p.coins - coinsBefore[1], 1);
check("doPass appends exactly one entry to the event log", g.events.length - evBefore, 1);
check("the appended entry is a pass, tagged with the acting seat", `${e.t}:${e.p}`, "pass:1");
checkTrue("the pass entry carries something to look at", e.sea != null);

// *** THE ORDERING PREDICATE ***  ev() snapshots the purse at call time. If the event is recorded
// before the payment, this reads the pre-payment purse and fails. Asserted off the snapshot, not
// off the source order.
check("ORDERING: the pass entry's own snapshot shows the purse AFTER the payment", e.state[p.idx].coins, p.coins);
check("ORDERING: and that snapshot purse is one higher than before the call", e.state[p.idx].coins, coinsBefore[1] + 1);

for (const q of g.players) {
  if (q.idx === p.idx) continue;       // !== on an index, never a falsy test — seat 0 is a real seat
  check(`no other purse moves: seat ${q.idx} live purse untouched`, q.coins, coinsBefore[q.idx]);
  check(`no other purse moves: seat ${q.idx} snapshot purse untouched`, e.state[q.idx].coins, coinsBefore[q.idx]);
}

/* The event's SHAPE. Derived from a {t:"turn"} entry recorded in the same run — turn is emitted with
 * only its type and seat, so its key set IS the envelope ev() adds to everything. A pass is that
 * envelope plus `sea`. Deriving it rather than typing it means this stays a real check if ev() ever
 * gains a field, instead of becoming a list nobody updates. */
console.log("  -- engine: the recorded shape --");
const gShape = newGame(2 * 7919);
const wShape = gShape.play();
checkTrue("CONTROL: a full voyage recorded events", gShape.events.length > 0);
checkTrue("CONTROL: the voyage finished with a real seat index or a real null", wShape == null || typeof wShape === "number");
const turnEv = gShape.events.find((x) => x.t === "turn");
const passEv = gShape.events.find((x) => x.t === "pass");
checkTrue("CONTROL: the voyage recorded at least one turn entry", turnEv != null);
checkTrue("CONTROL: the voyage recorded at least one pass entry", passEv != null);
if (turnEv && passEv) {
  const envelope = [...new Set([...Object.keys(turnEv), "sea"])].sort();
  check("the pass entry's key set is the turn envelope plus `sea` — nothing added, removed or renamed",
    Object.keys(passEv).sort().join(","), envelope.join(","));
}

/* A whole bot turn that resolves to the engine fallback. Driven turn by turn rather than through
 * play(), because the quantity under test is the purse either side of ONE turn and play() only ever
 * hands back a winner. Bounded loops throughout (CLAUDE.md §3). */
console.log("  -- engine: a bot turn that ends at the fallback --");
let found = null;
for (let s = 1; s <= 60 && !found; s++) {
  const gt = newGame(s * 7919);
  for (let r = 0; r < 40 && !found; r++) {
    gt.round++;
    gt.advanceWind();
    for (const q of gt.players) {
      if (q.done || q.baking) continue;
      const before = q.coins;
      const evLen = gt.events.length;
      gt.takeTurn(q, gt.windNow, gt.stormNow);
      const added = gt.events.slice(evLen);
      const passes = added.filter((x) => x.t === "pass");
      if (passes.length === 1 && added[added.length - 1].t === "pass") {
        found = {
          seed: s * 7919, round: r + 1, seat: q.idx, before, after: q.coins,
          snap: passes[0].state[q.idx].coins, passCount: passes.length,
          added: added.map((x) => x.t).join("+"),
        };
        break;
      }
    }
  }
}
checkTrue("CONTROL: a turn resolving to the engine fallback was reached", found != null);
if (found) {
  console.log(`         found at seed ${found.seed}, round ${found.round}, seat ${found.seat}; that turn recorded ${found.added}`);
  check("a turn ending at the engine fallback leaves the purse exactly one higher", found.after - found.before, 1);
  check("that turn appended exactly one pass entry", found.passCount, 1);
  check("ORDERING: the recorded snapshot for that turn shows the post-payment purse", found.snap, found.after);
}
} // end of the engine half

/* ================= HALF TWO: source text ================= */
console.log("\n  -- 4/src/ui/flow.js: all three sites, one method --");

const humanRegion = regionAfter(FLOW_SRC, 'if(v==="pass"){', 700, "human menu");
const botRegion = regionAfter(FLOW_SRC, "v2 rule 3: no fishing", 500, "bot fallback");

checkTrue("the human menu calls the shared method", humanRegion.includes("doPass("));
checkTrue("the animated bot fallback calls the shared method", botRegion.includes("doPass("));
checkTrue("the human menu emits no bare pass event any more", !humanRegion.includes('ev({t:"pass"'));
checkTrue("the animated bot fallback emits no bare pass event any more", !botRegion.includes('ev({t:"pass"'));
check("no bare pass emission survives anywhere in the UI tier", countOf(FLOW_SRC, 'ev({t:"pass"'), 0);
check("the UI tier calls the shared method at exactly the two sites it owns", countOf(FLOW_SRC, "doPass"), 2);

checkTrue("the human-only sea-cursor advance is still in the human menu", humanRegion.includes("advanceSeaCursor("));
checkTrue("the bot fallback does not touch the human-only sea cursor", !botRegion.includes("advanceSeaCursor"));
check("the human-only sea-cursor advance did not migrate into the engine", countOf(ENGINE_SRC, "advanceSeaCursor"), 0);

console.log("\n  -- 4/src/engine/index.js --");
checkTrue("the engine defines and calls the shared method", countOf(ENGINE_SRC, "doPass") >= 2);
check("the engine emits the pass event in exactly one place", countOf(ENGINE_SRC, 'ev({t:"pass"'), 1);

/* Determinism. 4/src/engine/ is clean of all three sources today and Phase 3 records a corpus
 * against it; RULE-01's dubloon is an integer increment and must not change that. */
console.log("\n  -- 4/src/engine/ is still determinism-clean --");
const engineFiles = fs.readdirSync(ENGINE_DIR).filter((f) => f.endsWith(".js")).sort();
checkTrue("CONTROL: the engine directory has files to scan", engineFiles.length > 0);
console.log(`         scanning ${engineFiles.length} file(s): ${engineFiles.join(", ")}`);
for (const src of ["Math.random", "Date.now", "performance.now"]) {
  let n = 0;
  for (const f of engineFiles) n += countOf(fs.readFileSync(path.join(ENGINE_DIR, f), "utf8"), src);
  check(`no ${src} anywhere under 4/src/engine/`, n, 0);
}

console.log(`\n  ${anchorsFound} source anchor(s) located, ${failures} failure(s)\n`);
process.exit(failures ? 1 : 0);
