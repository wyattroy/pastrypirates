#!/usr/bin/env node
// scripts/narration_flow_test.js
//
// Phase 15 plan 03 (NARR-02/NARR-03/NARR-05, D-11/D-13): DOM-free harness proving the turn-flow
// narration invariants that live inside src/ui/flow.js. Two later tasks in this same plan extend
// this file further (Task 2: brokeSailLine/brokeAnchorLine viewer-aware builders; Task 3:
// stormIntroClause + every ad-hoc flash() site converted to the neutral-plus-variants form).
//
// This wave (Task 1) proves D-13: the already-anchored-safely (`anchorHold`) narration line was
// missing its `await narrateLastEvent()` call in windLeg's storm-anchor block, so the line never
// played on your own turn even though bots (via botWindLeg) already narrated it correctly. windLeg
// itself needs the DOM to actually run, so this is proven as a STRUCTURAL, source-text assertion
// instead — read src/ui/flow.js as text, locate windLeg's body, and assert the branch recording
// the anchorHold event awaits narrateLastEvent() before liveRender(), the same three-step order
// the moored branch immediately above it already uses.
//
// Convention (matches hail_ranking_test.js/bot_storm_narration_test.js/narration_test.js): no
// assertion library, a local check(name, actual, expected) counter, plain console.log,
// process.exit(failures?1:0). Source-text file:line failures follow scripts/ui_contract_check.js's
// / scripts/no_undef_check.js's house convention for that style of assertion.
//
// Never touches the DOM, never imports/calls a turn function (windLeg/humanTurn/botTurn/humanAct
// etc never run here) — only src/ui/flow.js's own source text is read.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
