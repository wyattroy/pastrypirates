#!/usr/bin/env node
// scripts/bot_storm_narration_test.js
//
// STORM-01 (D-09/D-10/D-11): DOM-free proof of the invariant botWindLeg (src/ui/flow.js) depends
// on — that delegating a storm push to the engine ONE SQUARE AT A TIME (via repeated
// windPush(p,d,1,dodgedOnce) calls, stopping exactly when the engine itself would have stopped) is
// indistinguishable from a single windPush(p,d,2,dodgedOnce) call: identical final position,
// identical event stream. botWindLeg itself needs the DOM (liveRender/flash/sleep), but this
// invariant does not — and it is the load-bearing part: if a per-square push ever diverged from a
// two-square push, bots would silently start playing a different game from the one the simulator
// and the human path both agree on.
//
// Convention (matches determinism_baseline.js/hail_ranking_test.js/storm_moored_reason_test.js): no
// assertion library, a local check(name, actual, expected) counter, plain console.log,
// process.exit(failures?1:0). Constructed-instance style, directly-poked player fields, seed-search
// for geometric preconditions rather than hardcoded board coordinates against one frozen seed.
//
// Deliberately does NOT import src/ui/flow.js or reference `document` — this script proves the
// engine-level invariant only; botWindLeg's own DOM-facing narration/pacing is exercised by manual
// UAT (14-06), same split storm_moored_reason_test.js already draws for windPush vs. windLeg.

import { loadEngine } from "./lib/load_engine.js";
import { DIRS } from "../src/shared/index.js";
import { EVENT_NARRATION, describe } from "../src/ui/util.js";

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
function mDist(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); }

// Per-square delegator mirroring botWindLeg's OWN stopping predicate exactly (event added ->
// stop; moved but landed on the rim -> stop; neither moved nor recorded anything (blocked) ->
// stop; otherwise the square was ordinary open water — continue). This is the invariant
// botWindLeg's real DOM-facing code depends on; reproducing it here, DOM-free, is what lets this
// script prove the invariant instead of merely assuming it.
function twoStepPush(g, p, dir, once) {
  for (let step = 0; step < 2; step++) {
    const before = [...p.pos];
    const evBefore = g.events.length;
    g.windPush(p, dir, 1, once);
    if (g.events.length > evBefore) return; // the square's own outcome ends the leg
    if (p.pos[0] === before[0] && p.pos[1] === before[1]) return; // blocked (off-grid) — silent stop
    if (g.onRim(p.pos)) return; // the engine already resolved the rim; no further square to push
    // else: ordinary open water — continue to the next square
  }
}

/* ---------- geometric-precondition finders (scan the real generated board) ---------- */

// Two consecutive clean squares in some direction from some cell: no blocked/island/home/other-
// ship/rim on either intermediate cell. The "open water ahead" and "another ship ahead" (the
// second cell gets a ship placed on it afterward) scenarios both start from this.
function findOpenRun(g, excludeSeats) {
  const n = g.cfg.grid;
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
    const pos = [x, y];
    if (g.blocked(pos) || g.isIsland(pos) || g.isHome(pos) || g.onRim(pos)) continue;
    for (const dk of Object.keys(DIRS)) {
      const d = DIRS[dk];
      const s1 = [pos[0] + d[0], pos[1] + d[1]];
      const s2 = [pos[0] + d[0] * 2, pos[1] + d[1] * 2];
      const clean = c => !g.blocked(c) && !g.isIsland(c) && !g.isHome(c) && !g.onRim(c)
        && !g.players.some((q, qi) => !excludeSeats.includes(qi) && q.pos[0] === c[0] && q.pos[1] === c[1]);
      if (clean(s1) && clean(s2)) return { pos, dir: d, s1, s2 };
    }
  }
  return null;
}

// An open-water cell one square before an island, with NEITHER a dock cell NOR within 1 of home —
// guarantees mooredReason(p)===null there (with p.justDocked=false), so windPush's decision ladder
// (pay/flip/aground/shipwreck) actually runs instead of an immediate moored/anchorHold short-circuit.
function findFreeIslandApproach(g) {
  for (const key of Object.keys(g.islands)) {
    const [ix, iy] = key.split(",").map(Number);
    for (const dk of Object.keys(DIRS)) {
      const d = DIRS[dk];
      const w = [ix - d[0], iy - d[1]];
      if (g.blocked(w) || g.isIsland(w) || g.isHome(w)) continue;
      if (g.dockCells.has(w[0] + "," + w[1])) continue; // would satisfy the "dock" reason instead
      if (mDist(w, g.home) <= 1) continue; // would satisfy the "home" reason instead (a berth)
      // also require a clean cell BEFORE w in the same direction, so a full 2-square push can
      // advance cleanly through w's own predecessor and hit the island on square 2, not square 1
      const before = [w[0] - d[0], w[1] - d[1]];
      if (g.blocked(before) || g.isIsland(before) || g.isHome(before) || g.onRim(before)) continue;
      return { before, approach: w, dir: d };
    }
  }
  return null;
}

// A Tortuga berth with the direction straight back toward home itself — an immediate (square-1)
// "home ahead" stop, reproducing the D-19 berth-protection guarantee.
function findBerthHomePush(g) {
  for (const dk of Object.keys(DIRS)) {
    const bd = DIRS[dk];
    const berth = [g.home[0] + bd[0], g.home[1] + bd[1]];
    const back = [-bd[0], -bd[1]];
    if (g.isHome([berth[0] + back[0], berth[1] + back[1]])) return { berth, dir: back };
  }
  return null;
}

let seed = null;
let picked = {};
for (let s = 12345; s < 12345 + 80; s++) {
  const g = freshGame(s);
  const openRun = findOpenRun(g, []);
  const islandApproach = findFreeIslandApproach(g);
  const berthHome = findBerthHomePush(g);
  if (openRun && islandApproach && berthHome) {
    seed = s;
    picked = { openRun, islandApproach, berthHome };
    break;
  }
}
if (seed === null) {
  console.error("could not find a seed whose generated board satisfies the test battery's geometric preconditions");
  process.exit(1);
}
console.log(`Bot storm-push equivalence (D-09/D-10/D-11) — seed ${seed}\n`);

/* ---------- scenario 1: open water ahead (both squares clean, no event either way) ---------- */

{
  const { pos, dir } = picked.openRun;
  const gA = freshGame(seed), gB = freshGame(seed);
  const pA = gA.players[0], pB = gB.players[0];
  pA.pos = [...pos]; pB.pos = [...pos];
  const onceA = { v: false }, onceB = { v: false };
  const evBeforeA = gA.events.length, evBeforeB = gB.events.length;
  gA.windPush(pA, dir, 2, onceA);
  twoStepPush(gB, pB, dir, onceB);
  check("open water: dist=2 and two dist=1 calls leave an identical final position", `${pA.pos}`, `${pB.pos}`);
  check("open water: identical event stream (both empty)", JSON.stringify(gA.events.slice(evBeforeA)), JSON.stringify(gB.events.slice(evBeforeB)));
  check("open water: no event is appended by either path", gA.events.length, evBeforeA);
}

/* ---------- scenario 2: island ahead (square 2), mooredReason===null — the decision ladder ---------- */

{
  const { before, dir } = picked.islandApproach;
  const gA = freshGame(seed), gB = freshGame(seed);
  const pA = gA.players[0], pB = gB.players[0];
  pA.pos = [...before]; pA.justDocked = false;
  pB.pos = [...before]; pB.justDocked = false;
  const onceA = { v: false }, onceB = { v: false };
  const evBeforeA = gA.events.length, evBeforeB = gB.events.length;
  gA.windPush(pA, dir, 2, onceA);
  twoStepPush(gB, pB, dir, onceB);
  check("island ahead: dist=2 and two dist=1 calls leave an identical final position", `${pA.pos}`, `${pB.pos}`);
  check("island ahead: identical event stream", JSON.stringify(gA.events.slice(evBeforeA)), JSON.stringify(gB.events.slice(evBeforeB)));
  check("island ahead: exactly one event appended (one outcome square, one event)", gA.events.length - evBeforeA, 1);
  const evA = gA.events[gA.events.length - 1];
  checkTrue("island ahead: outcome is one of the decision-ladder events", ["dodge", "anchor", "aground", "shipwrecked"].includes(evA.t));
}

/* ---------- scenario 3: another ship ahead (square 2 occupied) ---------- */

{
  const { pos, dir, s2 } = picked.openRun;
  const gA = freshGame(seed), gB = freshGame(seed);
  const pA = gA.players[0], pB = gB.players[0];
  pA.pos = [...pos]; pB.pos = [...pos];
  // seat 1 blocks square 2 in both instances — an identically-placed ship, not a random one
  gA.players[1].pos = [...s2]; gA.players[1].done = false;
  gB.players[1].pos = [...s2]; gB.players[1].done = false;
  const onceA = { v: false }, onceB = { v: false };
  const evBeforeA = gA.events.length, evBeforeB = gB.events.length;
  gA.windPush(pA, dir, 2, onceA);
  twoStepPush(gB, pB, dir, onceB);
  check("ship ahead: dist=2 and two dist=1 calls leave an identical final position", `${pA.pos}`, `${pB.pos}`);
  check("ship ahead: identical event stream", JSON.stringify(gA.events.slice(evBeforeA)), JSON.stringify(gB.events.slice(evBeforeB)));
  check("ship ahead: exactly one event appended", gA.events.length - evBeforeA, 1);
  check("ship ahead: the one event is \"blocked\"", gA.events[gA.events.length - 1].t, "blocked");
  check("ship ahead: the ship advanced exactly one square, not two", `${pA.pos}`, `${s1of(pos, dir)}`);
}
function s1of(pos, dir) { return [pos[0] + dir[0], pos[1] + dir[1]]; }

/* ---------- scenario 4: home ahead (berth pushed toward Tortuga — immediate, square 1) ---------- */

{
  const { berth, dir } = picked.berthHome;
  const gA = freshGame(seed), gB = freshGame(seed);
  const pA = gA.players[0], pB = gB.players[0];
  pA.pos = [...berth]; pA.justDocked = false;
  pB.pos = [...berth]; pB.justDocked = false;
  const onceA = { v: false }, onceB = { v: false };
  const evBeforeA = gA.events.length, evBeforeB = gB.events.length;
  gA.windPush(pA, dir, 2, onceA);
  twoStepPush(gB, pB, dir, onceB);
  check("home ahead: dist=2 and two dist=1 calls leave an identical final position", `${pA.pos}`, `${pB.pos}`);
  check("home ahead: identical event stream", JSON.stringify(gA.events.slice(evBeforeA)), JSON.stringify(gB.events.slice(evBeforeB)));
  check("home ahead: exactly one event appended", gA.events.length - evBeforeA, 1);
  const evA = gA.events[gA.events.length - 1];
  check("home ahead: the event is \"moored\"", evA.t, "moored");
  check("home ahead: reason is exactly \"home\"", evA.reason, "home");
  checkTrue("home ahead: reason is a member of {justDocked,dock,home} (assertion 3)", ["justDocked", "dock", "home"].includes(evA.reason));
}

/* ---------- scenario 5: off-grid edge ahead (blocked immediately — the no-op edge) ---------- */

{
  const gA = freshGame(seed), gB = freshGame(seed);
  const pA = gA.players[0], pB = gB.players[0];
  pA.pos = [0, 0]; pB.pos = [0, 0];
  const dir = [-1, -1]; // guaranteed off-grid regardless of board shape
  const onceA = { v: false }, onceB = { v: false };
  const evBeforeA = gA.events.length, evBeforeB = gB.events.length;
  gA.windPush(pA, dir, 2, onceA);
  twoStepPush(gB, pB, dir, onceB);
  check("off-grid: dist=2 and two dist=1 calls leave an identical (unchanged) position", `${pA.pos}`, `${pB.pos}`);
  check("off-grid: identical event stream (both empty — the no-op edge stays a no-op)", JSON.stringify(gA.events.slice(evBeforeA)), JSON.stringify(gB.events.slice(evBeforeB)));
  check("off-grid: position genuinely unchanged from [0,0]", `${pA.pos}`, `${[0, 0]}`);
  check("off-grid: no event appended", gA.events.length, evBeforeA);
}

/* ---------- scenario 6: a second leg after a first-leg dodge — dodgedOnce carries over ---------- */

{
  const { approach, dir } = picked.islandApproach;
  const g = freshGame(seed);
  const p = g.players[0];
  p.pos = [...approach]; p.justDocked = false;
  const dodgedOnce = { v: false };
  g.windPush(p, dir, 1, dodgedOnce); // leg 1: hits the island, pays/flips, sets dodgedOnce.v=true
  const firstEv = g.events[g.events.length - 1];
  checkTrue("second leg: leg 1's outcome is a real decision-ladder event", ["dodge", "anchor", "aground", "shipwrecked"].includes(firstEv.t));
  checkTrue("second leg: leg 1 sets dodgedOnce.v", dodgedOnce.v, true);
  const posAfterLeg1 = [...p.pos];
  const evBefore2 = g.events.length;
  g.windPush(p, dir, 1, dodgedOnce); // leg 2, SAME direction, SHARED dodgedOnce: a free pass
  check("second leg: exactly one more event appended", g.events.length - evBefore2, 1);
  check("second leg: the second island encounter is a free pass (anchorHold), not a repeat flip", g.events[g.events.length - 1].t, "anchorHold");
  check("second leg: position unchanged across both legs (moored/anchorHold never move a ship)", `${p.pos}`, `${posAfterLeg1}`);
}

/* ---------- assertion 4: EVENT_NARRATION.moored — engine reasons stay distinct; narration collapses justDocked/home ---------- */

// Wyatt's copy decision (2026-07-26, 14-06 Task 1/2): the engine still tags every moored event
// with a distinct `reason` (justDocked/dock/home — untouched, still asserted at the engine level
// above and in scripts/storm_moored_reason_test.js). But at the NARRATION layer only, `home` (a
// Tortuga berth) now renders the exact same line as `justDocked`, since D-18 treats Tortuga as a
// normal island/dock and it should not get bespoke wording. `dock` keeps its own distinct line.
// So the render-level assertion is TWO distinct strings across the three reasons, not three.
{
  const at = () => [0, 0];
  const f = EVENT_NARRATION.moored;
  const texts = ["justDocked", "dock", "home"].map(reason => f({ t: "moored", p: 0, reason }, at).txt);
  check("EVENT_NARRATION.moored: three reasons render two distinct lines (justDocked/home share copy, dock is its own)", new Set(texts).size, 2);
  check("EVENT_NARRATION.moored: justDocked and home render the identical narration line", texts[0], texts[2]);
  checkTrue("EVENT_NARRATION.moored: dock's line differs from justDocked/home", texts[1] !== texts[0]);
  const bare = f({ t: "moored", p: 0 }, at).txt;
  checkTrue("EVENT_NARRATION.moored: no-reason event renders a real (non-empty, non-undefined) line", !!bare && !/undefined/.test(bare));
  checkTrue("describe(): a reasoned moored event still produces a non-null captain's-log line", describe({ t: "moored", p: 0, reason: "dock" }) !== null);
}

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
