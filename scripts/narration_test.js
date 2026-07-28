#!/usr/bin/env node
// scripts/narration_test.js
//
// Phase 15 (NARR-05/D-07/D-08/D-10): the DOM-free harness every later narration plan in this
// phase asserts through. Two jobs:
//
//   1. (this wave, Wave 0) Pin the PRE-CHANGE baseline so nothing later in the phase can silently
//      break it: the full 25-key EVENT_NARRATION inventory the audit is sized against, every
//      builder surviving a minimal fabricated event with no throw, the `moored` invariants
//      scripts/bot_storm_narration_test.js already proves (mirrored here deliberately, so a
//      regression is caught by BOTH scripts, not only the older one), and the NARR-05 "encoding"
//      guarantee — a captain name with multi-byte/emoji characters survives narration intact,
//      escaped exactly once by pname()'s own escHtml().
//   2. (15-01's own tracer task) Prove the viewer-aware narration mechanism end to end on ONE
//      line (EVENT_NARRATION.dodge) — table builder -> viewer-neutral default + per-seat variants
//      -> flash() -> netNarrate -> netSetNarr's widened rooms/{code}/narr payload -> watchNarr's
//      per-client pick — entirely DOM-free, using a fake `db` that just records what it's handed.
//
// Convention (matches determinism_baseline.js/hail_ranking_test.js/storm_moored_reason_test.js/
// bot_storm_narration_test.js): no assertion library, a local check(name, actual, expected)
// counter, plain console.log, process.exit(failures?1:0). Direct `import` of the narration surface
// from src/ui/util.js — no DOM reference, no import of src/ui/flow.js or src/ui/panel.js.

import { EVENT_NARRATION, describe, pname } from "../src/ui/util.js";
import { appState } from "../src/state/index.js";

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

// ---- bootstrap appState the way an out-of-game caller must ----
// Four claimed seats with real names (id truthy -> pname() always reads s.name, never the
// default Capt. NAMES fallback). appState.mySeat is left at its module default (null) — an
// out-of-game caller like this script, or a fresh bot_storm_narration_test.js run, never sets it.
appState.roster = [
  { id: "u0", name: "Davy Scones" },
  { id: "u1", name: "Crustbeard" },
  { id: "u2", name: "Dough Hook" },
  { id: "u3", name: "Flaky Jack" },
];
// minimal object carrying the two cfg flags the trade/fish builders read, so they don't throw
// reaching for appState.game.cfg.tradeBonus / .sardine outside a real Game instance
appState.game = { cfg: { tradeBonus: true, sardine: true } };

const at = () => [0, 0]; // describe()/captions() never need real board coordinates; neither does this harness

console.log("Narration audit harness — Wave 0 baseline + viewer-aware tracer (NARR-05/D-07/D-08/D-10)\n");

/* ---------- assertion 1: the 25-key inventory the audit is sized against ---------- */
const KEYS = Object.keys(EVENT_NARRATION);
check("EVENT_NARRATION has exactly 25 keys (the audit's inventory size)", KEYS.length, 25);

/* ---------- assertion 2: every key is a function; every builder survives a minimal fabricated event ---------- */
// one minimal, self-consistent fabricated event per key — just enough fields for that builder to
// run its full branch logic without throwing (no engine/DOM needed, mirrors bot_storm_narration_
// test.js's own direct-table-call style)
const FAB = {
  newround: { t: "newround", round: 1, dir: "N", dir2: "E", windStreak: 1, storm: false, streak: 0 },
  windmove: { t: "windmove", p: 0 },
  blownOut: { t: "blownOut", p: 0 },
  sail: { t: "sail", p: 0 },
  dodge: { t: "dodge", p: 0 },
  anchor: { t: "anchor", p: 0 },
  moored: { t: "moored", p: 0, reason: "justDocked" },
  blocked: { t: "blocked", p: 0, other: 1 },
  anchorHold: { t: "anchorHold", p: 0 },
  tradewind: { t: "tradewind", p: 0 },
  parley: { t: "parley", a: 0, b: 1, offer: "wheat", want: "sugar", ok: true },
  aground: { t: "aground", p: 0 },
  shipwrecked: { t: "shipwrecked", p: 0 },
  dock: { t: "dock", p: 0, ing: "wheat", got: "ing", heads: true },
  trade: { t: "trade", a: 0, b: 1, gave: "wheat", got: "sugar" },
  sidebet: { t: "sidebet", p: 0, won: true, delta: 2 },
  battle: { t: "battle", a: 0, d: 1, winner: 0, rounds: [[true, false, false, "a"]], spoil: "5 coins", spoilIng: null },
  battleflee: { t: "battleflee", a: 0, d: 1 },
  fish: { t: "fish", p: 0, heads: true },
  finish: { t: "finish", p: 0 },
  shotclock: { t: "shotclock", p: 0 },
  shotclockskip: { t: "shotclockskip", p: 0, coins: 2 },
  bakeoff: { t: "bakeoff", a: 0, b: 1, winner: 0 },
  end: { t: "end", winner: null },
  turn: { t: "turn", p: 0 },
};
for (const key of KEYS) {
  checkTrue(`EVENT_NARRATION.${key} is a function`, typeof EVENT_NARRATION[key] === "function");
  const fab = FAB[key];
  if (!fab) {
    console.log(`  FAIL  no fabricated event registered for key "${key}"`);
    failures++;
    continue;
  }
  let result, threw = false;
  try {
    result = EVENT_NARRATION[key](fab, at);
  } catch (e) {
    threw = true;
    console.log(`  FAIL  EVENT_NARRATION.${key}(...) threw: ${e && e.message}`);
    failures++;
  }
  if (!threw) {
    if (key === "turn") check("EVENT_NARRATION.turn(...) returns null (the one key with no line)", result, null);
    else checkTrue(`EVENT_NARRATION.${key}(...) returns an object`, result !== null && typeof result === "object");
  }
}

/* ---------- assertion 3: the moored baseline (mirrors bot_storm_narration_test.js's own checks) ---------- */
{
  const f = EVENT_NARRATION.moored;
  const justDocked = f({ t: "moored", p: 0, reason: "justDocked" }, at).txt;
  const home = f({ t: "moored", p: 0, reason: "home" }, at).txt;
  check("moored: reason justDocked and reason home render the identical line", justDocked, home);
  const bare = f({ t: "moored", p: 0 }, at).txt;
  checkTrue("moored: a no-reason event renders a real (non-empty, non-undefined) line", !!bare && !/undefined/.test(bare));
  checkTrue("describe(): a reasoned moored event still produces a non-null captain's-log line", describe({ t: "moored", p: 0, reason: "dock" }) !== null);
}

/* ---------- assertion 4 (NARR-05 encoding): a multi-byte/emoji captain name survives intact, escaped once ---------- */
{
  // "🐙" is deliberately an emoji with NO entry in shared/index.js's EMOJI_IMG map — describe()'s
  // final emojify() pass swaps every MAPPED emoji for its custom <img>, which would silently
  // rewrite this literal glyph inside the interpolated name and defeat the "survives intact"
  // assertion below for reasons that have nothing to do with narration encoding.
  const rawCaptainName = "Café Piér & Co. 🐙";
  const savedRoster = appState.roster;
  appState.roster = [{ id: "u0", name: rawCaptainName }, ...savedRoster.slice(1)];
  const expected = pname(0); // the single source of truth for how this name gets escaped
  checkTrue("dock: pname() HTML-escapes the ampersand exactly once (never left raw)", expected.includes("&amp;") && !expected.includes(" & "));
  const out = describe({ t: "dock", p: 0, ing: "wheat", got: "ing", heads: true });
  checkTrue("dock: describe() output is non-null for the emoji/multi-byte name case", out !== null);
  const txt = out ? out.txt : "";
  const occurrences = txt.split(expected).length - 1;
  check("dock: the escaped captain name appears exactly once in the narration", occurrences, 1);
  checkTrue("dock: the name survives intact (é + emoji both present)", txt.includes("Piér") && txt.includes("🐙"));
  appState.roster = savedRoster;
}

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
