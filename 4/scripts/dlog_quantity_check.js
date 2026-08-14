#!/usr/bin/env node
/* A CONFIRMED QUANTITY MUST REACH THE DECISION LOG.
 *
 * playtest 21, the counter-offer stall. ask() logs which BUTTON was pressed; the coin slider's
 * number lived in a `ref` object the button knew nothing about. MEASURED on a real trade: the
 * captain dragged the slider to 6 and the decision log gained exactly `[0]`. A solo refresh then
 * replayed that trade at the slider's floor — a different offer, a different answer, a different
 * r() stream, and every later recorded decision landing on a prompt it was never recorded against.
 * From the seat: "the game was simply reset and stalled and the captains log was empty."
 *
 * WHY A SOURCE-SHAPE GATE RATHER THAN A PLAYED GAME. The failure needs a browser, a DOM slider and
 * a page reload to reproduce end to end — none of which a node harness has. What it does NOT need
 * is any of that to be *checked*: the invariant is structural. A quantity the player confirms is a
 * decision, so it passes through the one seam that records and replays decisions. This asserts that
 * shape, in the same style as ui_contract_check.js's assertion 7.
 *
 * It is deliberately narrow. It cannot tell you the seam is CORRECT — dlog_replay_test.js and a
 * driven refresh do that. It tells you nobody quietly added a third quantity control, or replaced
 * `logQuantity(n)` with a bare `n`, which is precisely how this bug arrived.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// THE GATE'S ROOT IS WHEREVER THIS FILE LIVES (HARD-WON-LESSONS §3): /4 and the root game have
// identical internal paths, so a relative walk from the cwd would happily scan the other tree and
// pass on code this milestone does not ship.
const HERE = dirname(fileURLToPath(import.meta.url));
const FLOW = join(HERE, "..", "src", "ui", "flow.js");
const src = readFileSync(FLOW, "utf8");

const fails = [];
const passes = [];
// detail explains a FAILURE — printing it beside a pass reads as a failure that passed
const ok = (name, cond, detail = "") => cond ? passes.push(name) : fails.push(name + (detail ? "  — " + detail : ""));

/* Slice a function body by brace-matching from its declaration, so the assertions below are made
 * against THAT function and not against a coincidence elsewhere in a 2,400-line file. */
function body(name) {
  const i = src.indexOf(`function ${name}(`);
  if (i < 0) return null;
  const open = src.indexOf("{", i);
  if (open < 0) return null;
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(open, j + 1);
  }
  return null;
}

/* 1. The seam exists, and it is a REAL decision seam — it must both record live and consume on
 *    replay. One without the other is worse than neither: recording alone makes every replay one
 *    entry out of step from the first coined trade onwards. */
const lq = body("logQuantity");
ok("logQuantity() exists in 4/src/ui/flow.js", !!lq);
if (lq) {
  ok("logQuantity() RECORDS the number when live", /onLogDecision\(\s*n\s*\)/.test(lq),
     "it must call netHandlers().onLogDecision(n)");
  ok("logQuantity() REPLAYS the recorded number", /appState\.dlog\[appState\.dlogIdx\+\+\]/.test(lq),
     "it must consume the next dlog entry while replaying");
  ok("logQuantity() leaves replay when the log runs out", /endReplay\(\)/.test(lq),
     "same fall-through ask()/pickCell()/bakeoffPrompt() use");
}

/* 2. Every control that confirms a quantity routes its answer through that seam. Both of them —
 *    which control a seat gets is decided by decisionIsLocal(), and a log whose LENGTH depends on
 *    that routing is a log that only replays under the same routing. */
for (const fn of ["coinSlider", "coinStepper"]) {
  const b = body(fn);
  ok(`${fn}() exists`, !!b);
  if (!b) continue;
  /* COUNTED, not pattern-matched against one return shape. The first version of this gate looked
     for `=== "ok") return <expr>;` and read the expression — which silently stopped seeing a
     confirm the moment that branch was reformatted into a block, leaving the gate green while
     covering half of what it claimed. Counting is immune to how the branch is written: every
     confirmed quantity in the function needs its own trip through the seam. */
  const confirms = (b.match(/===\s*"ok"/g) || []).length;
  const logged = (b.match(/logQuantity\(/g) || []).length;
  ok(`${fn}() has a confirm branch`, confirms > 0,
     'no `=== "ok"` found — has the confirm value been renamed?');
  ok(`${fn}() logs a quantity for every confirm`, confirms > 0 && logged >= confirms,
     `${confirms} confirm branch(es), ${logged} logQuantity() call(s) — a confirm returns its number unrecorded`);
}

/* 3. Nothing else may READ the slider's live value as an answer. `ref.value` is the control's
 *    running position — written by the input handler as the thumb moves — and the ANSWER is
 *    whatever the confirm hands to logQuantity. A second reader would be a second, unlogged
 *    quantity. Writes (`ref.value=`) are the handler doing its job and are not counted. */
const READ = /(?<!\.)\bref\.value(?!\s*=[^=])/g;
const reads = [...src.matchAll(READ)].length;
const inSlider = ((body("coinSlider") || "").match(READ) || []).length;
ok("the slider's live value is read only inside coinSlider()", reads === inSlider,
   `${reads} reads of ref.value in the file, ${inSlider} of them in coinSlider()`);

console.log("\ndlog quantity check — 4/src/ui/flow.js");
console.log("\nPASS (" + passes.length + ")");
passes.forEach(s => console.log("  ok   " + s));
console.log("FAIL (" + fails.length + ")");
fails.forEach(s => console.log("  FAIL " + s));
if (fails.length) {
  console.log("\nA quantity the captain confirms is a DECISION. Route it through logQuantity() in");
  console.log("4/src/ui/flow.js, or a solo refresh replays it at the control's floor.\n");
  process.exit(1);
}
console.log("");
