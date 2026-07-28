#!/usr/bin/env node
// scripts/narration_flow_test.js
//
// Phase 15 plan 03 (NARR-02/NARR-03/NARR-05, D-11/D-13): DOM-free harness proving the turn-flow
// narration invariants that live inside src/ui/flow.js. Grows across this plan's 3 tasks:
//   Task 1 (D-13): windLeg's anchorHold branch awaits narrateLastEvent() before liveRender().
//   Task 2 (D-11): brokeSailLine/brokeAnchorLine — pure, viewer-aware "broke" narration builders,
//     for a human AND a bot who can't afford to sail, and a captain who can't afford to anchor.
//   Task 3 (NARR-03/D-07/D-08/D-10): stormIntroClause + every ad-hoc flash() site in this file
//     converted to the neutral-plus-variants broadcast form.
//
// windLeg/humanTurn/botTurn/humanAct etc all need the DOM to actually run, so their invariants are
// proven here as STRUCTURAL, source-text assertions instead — read src/ui/flow.js as text, locate
// the relevant function's body, and assert the rule (an ordering, a call site's presence, an
// absence) the same way scripts/ui_contract_check.js/scripts/no_undef_check.js do for their own
// source-text invariants. The pure exported builders (brokeSailLine, brokeAnchorLine,
// stormIntroClause) are imported and called directly — no DOM needed for those.
//
// Convention (matches hail_ranking_test.js/bot_storm_narration_test.js/narration_test.js): no
// assertion library, a local check(name, actual, expected) counter, plain console.log,
// process.exit(failures?1:0). Source-text file:line failures follow scripts/ui_contract_check.js's
// / scripts/no_undef_check.js's house convention for that style of assertion.
//
// Never touches the DOM, never imports/calls a turn function (windLeg/humanTurn/botTurn/humanAct
// etc never run here) — only src/ui/flow.js's own pure exported builders and source text.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brokeSailLine, brokeAnchorLine } from "../src/ui/flow.js";
import { appState } from "../src/state/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FLOW_PATH = path.join(ROOT, "src", "ui", "flow.js");
const FLOW_SRC = fs.readFileSync(FLOW_PATH, "utf8");
const FLOW_REL = path.relative(ROOT, FLOW_PATH);

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

console.log("Turn-flow narration harness (NARR-02/03/05, D-11/D-13) — src/ui/flow.js\n");

/* ---------- helpers: string-index slicing (immune to awk's start==end same-line range trap) ---------- */
function extractFn(src, startMarker, endMarker) {
  const startIdx = src.indexOf(startMarker);
  if (startIdx < 0) return { body: null, startIdx: -1 };
  const searchFrom = startIdx + startMarker.length;
  const endIdx = endMarker ? src.indexOf(endMarker, searchFrom) : -1;
  const body = endIdx < 0 ? src.slice(startIdx) : src.slice(startIdx, endIdx);
  return { body, startIdx };
}
function lineOf(src, idx) {
  return idx < 0 ? "?" : src.slice(0, idx).split("\n").length;
}

/* ---------- Task 1 (D-13): windLeg's anchorHold branch awaits narrateLastEvent() ---------- */
{
  const { body: windLegBody } = extractFn(FLOW_SRC, "export async function windLeg", "export async function botWindLeg");
  checkTrue("windLeg function body located", !!windLegBody);
  if (windLegBody) {
    const mooredOrder = /ev\(\{t:"moored"[^}]*\}\);await narrateLastEvent\(\);liveRender\(\);/.test(windLegBody);
    checkTrue("windLeg: the moored branch keeps its ev() -> await narrateLastEvent() -> liveRender() order (the precedent D-13 copies)", mooredOrder);

    const anchorHoldOrder = /ev\(\{t:"anchorHold"[^}]*\}\);await narrateLastEvent\(\);liveRender\(\);/.test(windLegBody);
    const anchorIdx = FLOW_SRC.indexOf('ev({t:"anchorHold"');
    check(`D-13: windLeg's anchorHold branch (${FLOW_REL}:${lineOf(FLOW_SRC, anchorIdx)}) awaits narrateLastEvent() before liveRender(), same order as the moored branch above it`, anchorHoldOrder, true);
  }
}

/* ---------- Task 2 (D-11): brokeSailLine / brokeAnchorLine — pure, viewer-aware builders ---------- */
{
  checkTrue("brokeSailLine is exported and callable with no DOM", typeof brokeSailLine === "function");
  checkTrue("brokeAnchorLine is exported and callable with no DOM", typeof brokeAnchorLine === "function");

  // appState.mySeat starts unset (null/undefined) — an out-of-game caller like this script, same
  // baseline scripts/narration_test.js/scripts/bot_storm_narration_test.js run against.
  appState.mySeat = null;

  const sailNeutral = brokeSailLine(0, -1); // NEUTRAL_VIEWER === -1 (src/ui/util.js)
  const sailAddressed = brokeSailLine(0, 0);
  checkTrue("brokeSailLine: neutral rendering is non-empty and contains no JS undefined token", !!sailNeutral && !/undefined/.test(sailNeutral));
  checkTrue("brokeSailLine: addressed rendering is non-empty and contains no JS undefined token", !!sailAddressed && !/undefined/.test(sailAddressed));
  checkTrue("brokeSailLine: addressed rendering differs from the neutral rendering", sailAddressed !== sailNeutral);

  const anchorNeutral = brokeAnchorLine(1, -1);
  const anchorAddressed = brokeAnchorLine(1, 1);
  checkTrue("brokeAnchorLine: neutral rendering is non-empty and contains no JS undefined token", !!anchorNeutral && !/undefined/.test(anchorNeutral));
  checkTrue("brokeAnchorLine: addressed rendering is non-empty and contains no JS undefined token", !!anchorAddressed && !/undefined/.test(anchorAddressed));
  checkTrue("brokeAnchorLine: addressed rendering differs from the neutral rendering", anchorAddressed !== anchorNeutral);

  // appState.mySeat left null, viewerSeat OMITTED entirely -> isLocalTo's seatLocal() fallback ->
  // always false (no real seat ever equals null) -> both builders return their third-person form,
  // and that form names the seat via pn() (a <b style=...> wrapped name, not a raw "you").
  const sailFallback = brokeSailLine(2);
  const anchorFallback = brokeAnchorLine(2);
  check("brokeSailLine: appState.mySeat null + viewerSeat omitted returns the SAME text as the explicit neutral form", sailFallback, brokeSailLine(2, -1));
  check("brokeAnchorLine: appState.mySeat null + viewerSeat omitted returns the SAME text as the explicit neutral form", anchorFallback, brokeAnchorLine(2, -1));
  checkTrue("brokeSailLine: the fallback (third-person) form contains a <b> name tag from pn()", /<b /.test(sailFallback));
  checkTrue("brokeAnchorLine: the fallback (third-person) form contains a <b> name tag from pn()", /<b /.test(anchorFallback));

  // NARR-02: never mocks/shames the broke player — a lightweight lexical guard against the
  // obvious failure shapes (sarcasm/insult words), not a substitute for Wyatt's own D-04 read.
  const MOCKING_WORDS = /\b(loser|pathetic|idiot|stupid|dumb|broke-ass|poor sod|shame on)\b/i;
  checkTrue("brokeSailLine: neither rendering reads as mocking the broke player (NARR-02)", !MOCKING_WORDS.test(sailNeutral) && !MOCKING_WORDS.test(sailAddressed));
  checkTrue("brokeAnchorLine: neither rendering reads as mocking the broke player (NARR-02)", !MOCKING_WORDS.test(anchorNeutral) && !MOCKING_WORDS.test(anchorAddressed));
}

/* ---------- Task 2 structural: the three call sites exist inside the right functions ---------- */
{
  const { body: humanTurnBody } = extractFn(FLOW_SRC, "export async function humanTurn", "/* ================= bot hail (AI-01)");
  checkTrue("humanTurn function body located", !!humanTurnBody);
  if (humanTurnBody) {
    checkTrue("humanTurn: the human sail gate narrates its own broke moment via brokeSailLine (D-11 case 1, human)", humanTurnBody.includes("brokeSailLine"));
  }

  const { body: botTurnBody } = extractFn(FLOW_SRC, "export async function botTurn", "/* ================= battle-UI");
  checkTrue("botTurn function body located", !!botTurnBody);
  if (botTurnBody) {
    checkTrue("botTurn: the bot sail gate narrates its own broke moment via brokeSailLine (D-11 case 1, bot)", botTurnBody.includes("brokeSailLine"));
  }

  const { body: windLegBody2 } = extractFn(FLOW_SRC, "export async function windLeg", "export async function botWindLeg");
  checkTrue("windLeg function body located (case 2 check)", !!windLegBody2);
  if (windLegBody2) {
    checkTrue("windLeg: the storm-anchor block narrates the broke-can't-anchor moment via brokeAnchorLine (D-11 case 2)", windLegBody2.includes("brokeAnchorLine"));
    const payOpts = (windLegBody2.match(/value:"pay"/g) || []).length;
    const flipOpts = (windLegBody2.match(/value:"flip"/g) || []).length;
    check("windLeg: exactly one Pay-to-anchor option is ever pushed (unaffected by the broke narration)", payOpts, 1);
    check("windLeg: the flip is offered in every case (unaffected by the broke narration)", flipOpts, 1);
  }
}

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
