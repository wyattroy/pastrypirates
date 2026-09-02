#!/usr/bin/env node
/* claim-before-game-code.cjs — YOU MAY NOT CHANGE THE GAME WITHOUT CLAIMING THE ITEM FIRST.
 *
 * WYATT, 2026-09-02: "Wait. You're not supposed to do work. The watch is." … "Instead of doing any
 * work in this session, triage it into the chart and let the watch do it. Also, code this somewhere
 * durable so that you always know to do it."
 *
 * THE PROBLEM WITH ENFORCING THAT LITERALLY: a hook cannot tell an Advisor from a Watch. Both are
 * `claude` in the same tree; the only difference is how they were launched, which is not in the
 * event. A gate that had to guess the role would be a gate that can be WRONG about the role — and
 * being wrong means either blocking the Watch from the only work it exists to do, or waving the
 * Advisor through. Neither is acceptable, so this does not guess.
 *
 * IT ASKS A QUESTION THAT IS TRUE FOR BOTH ROLES INSTEAD, and derives the answer rather than
 * storing it:
 *
 *     HAS THIS SESSION CLAIMED AN ITEM IN .planning/CTO-LEDGER.md?
 *
 * CLAUDE.md §3 already requires it of everyone: "CLAIM THE ITEM IN THE LEDGER BEFORE EDITING IT —
 * this is the whole coordination mechanism." A Watch claims as step 1 of the Door and then works.
 * An Advisor never claims, because triaging onto the Chart is not claiming. So the same question
 * lets the Watch through and stops the Advisor, with no role detection anywhere in it.
 *
 * EARNED THE SAME NIGHT, TWICE OVER. An Advisor session shipped a night of game-adjacent tooling
 * without ever claiming an item, while a Bell-launched watch was mid-edit on src/ui/stage.js in the
 * same tree — and CEO 81 separately charged that Advisor with editing a shared branch unclaimed:
 * "You fixed the half that was graded and skipped the half that wasn't."
 *
 * SCOPE: game code only, by the ONE definition in lib/game-code.cjs — never a fourth copy of that
 * rule (rule 23; it has already drifted once, expensively). Planning files, hooks, gates and docs
 * are untouched by this, so an Advisor can still file his words and triage the Chart, which is
 * exactly what it should be doing.
 *
 * FAILS OPEN ON EVERY DOUBT, and lets the retry through. A guard that blocks when confused is worse
 * than the thing it guards against.
 */
const fs = require("fs");
const path = require("path");

let isGameCode;
try { ({ isGameCode } = require("./lib/game-code.cjs")); } catch { process.exit(0); }

function main() {
  let ev;
  try { ev = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(0); }
  if (!["Edit", "Write", "NotebookEdit"].includes(ev.tool_name)) process.exit(0);

  const root = ev.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const raw = String((ev.tool_input || {}).file_path || "");
  if (!raw) process.exit(0);

  let rel;
  try { rel = path.relative(root, path.resolve(root, raw)).split(path.sep).join("/"); }
  catch { process.exit(0); }
  if (!rel || rel.startsWith("..")) process.exit(0);

  let game = false;
  try { game = isGameCode(rel); } catch { process.exit(0); }
  if (!game) process.exit(0);

  // Has this session written to the ledger? The touched-list is kept by
  // advisor-triages-watch-works.cjs; both gates read one record rather than keeping two.
  const stateDir = path.join(root, ".claude", "hooks", ".read-state");
  const sid = String(ev.session_id || "unknown").replace(/[^A-Za-z0-9_-]/g, "");
  let touched = new Set();
  try { touched = new Set(fs.readFileSync(path.join(stateDir, `${sid}.touched`), "utf8").split("\n").filter(Boolean)); } catch {}
  if (touched.has(".planning/CTO-LEDGER.md")) process.exit(0);   // claimed: carry on

  // Record that it was asked, so the retry goes through — a speed bump, not a wall.
  try {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.appendFileSync(path.join(stateDir, `${sid}.touched`), ".planning/CTO-LEDGER.md\n");
  } catch {}

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `YOU ARE ABOUT TO CHANGE THE GAME AND THIS SESSION HAS CLAIMED NOTHING — ${rel}

CLAUDE.md §3: "CLAIM THE ITEM IN THE LEDGER BEFORE EDITING IT — this is the whole
coordination mechanism." Nothing has been written to .planning/CTO-LEDGER.md from this
session, so from every other machine this edit belongs to nobody.

FIRST, WHICH SESSION ARE YOU?

  THE WATCH (the Bell launched you with the Door prompt) — claiming is step 1 of your own
  loop and you have skipped it. Write the six-line situation report and the claim to
  .planning/CTO-LEDGER.md, then retry. Read the ledger's tail first: another watch may
  already hold this item.

  THE ADVISOR (Wyatt opened this window) — this is very probably not your job at all.
  His words, 2026-09-02: "Instead of doing any work in this session, triage it into the
  chart and let the watch do it." And: "You must not touch the same code as the Watch."
  Put it on .planning/CHART.md or in .planning/wyclau/INBOX.md, with his instruction
  VERBATIM if it came from him, and let a watch take it through the Proof.
  That night an Advisor wrote gates and ran the four steps while his own words sat
  unfiled — good work, wrong session, and his first duty undone the whole time.

WHY A HOOK AND NOT A NOTE: he asked for it to be "somewhere durable so that you always
know to do it", and this project's record is that a prompt you are holding is a prompt
you can skip.

This cannot tell which role you are and does not try — it asks one question that is true
for both. Claim it, or triage it. Then retry: the same edit goes through.`,
    },
  }));
  process.exit(0);
}
main();
