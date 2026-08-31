#!/usr/bin/env node
/* wyclau-stop-keep-working.cjs — a Stop hook. THE MISSION IS TO WORK UNTIL EVERY TASK IS DONE OR
 * GENUINELY BLOCKED ON WYATT -- NEVER TO STOP MID-LOOP AND REPORT.
 *
 * Wyatt, 2026-08-31, after a session stopped mid-loop with budget left: "why have you stopped
 * working? your mission is to continuously work until every single task is finished." Told a
 * prompt-only fix would be ignored -- CLAUDE.md's own qa-gear-first.cjs exists for exactly that
 * reason -- he ruled three layers: THIS hook for the common case (zero cost, warm context), the
 * watchdog as the backstop for crashes and kills, the Door's prompt as the free nudge. This is
 * layer one. See .claude/org/hooks/no-idle-offer.cjs for the sibling this is modelled on -- same
 * stdin/stdout contract, same "state a checkable thing, name what it can't see" shape.
 *
 * FIRES IN EVERY SESSION, INTERACTIVE INCLUDED -- his correction, 2026-08-31, overriding his own
 * first answer ("only unattended") the moment he gave it: "I want you to run the hook in all
 * sessions." No launch-context detection exists or is planned; a turn you are typing at is held to
 * the same brakes as an unattended one.
 *
 * HIS BRAKES, CHECKED IN THIS ORDER:
 *
 *   0. stop_hook_active -> ALWAYS allow the stop. Blocking twice in one turn risks a hang, and a
 *      hung session is worse than an early stop.
 *   1. THE PREEMPTION SLOT, read BEFORE the Chart -- his steering wheel, replacing a plain off
 *      switch: "I want to be able to tell Bosun 'put that task to the side right now, do this
 *      immediately, pick up your other work afterwards' or 'you're doing that stupidly, try this
 *      instead.'" .planning/wyclau/PREEMPT.md holds it (same tracked, harvest-and-reset shape as
 *      GLASS-NOTE.md -- a session that is not the Bosun, or Wyatt via a relay, writes below the
 *      marker and commits; the Bosun acts on it first, resets the file, commits the reset, then
 *      resumes). Real content there BLOCKS, regardless of Chart state.
 *   2. THE GLASS PUBLISH LAG -- moved HERE from `npm test` by CEO Review 52, 2026-08-31: it had
 *      been wired into scripts/qa/glass_publish_lag_check.mjs, which meant a stale WYCLAU DASHBOARD
 *      could block a real GAME fix from reaching players through the release gate. Same check, the
 *      honest home: if HEARTBEAT (a pulse) is more than 20 minutes newer than LAST-PUBLISH (a
 *      confirmed real publish, stamped by scripts/wyclau/mark_glass_published.mjs -- a plain script
 *      cannot call the Artifact tool itself, so this is a session's own attestation that it just
 *      published, not independent proof), BLOCK and say so. Never reachable from `npm test`.
 *   3. GIVE UP ON A STUCK ITEM. If the SAME top actionable Chart item has been blocked on 3 times
 *      with no new commit landing in between, STOP instead of blocking again, and say what is
 *      stuck. Tracked in .planning/wyclau/STOP-HOOK-STATE.json (local, gitignored -- resets clean
 *      on a fresh commit or a different item, never carries across machines).
 *   4. STOP WHEN EVERYTHING LEFT IS GENUINELY BLOCKED ON HIM. Parses .planning/CHART.md's STEP 1
 *      CHECKLIST for `- [ ]` lines; a line carrying the literal marker "GATED:" is not actionable.
 *      If every open line carries it (or none remain), allow the stop.
 *
 * Otherwise: BLOCK. There is unblocked work and nothing preempts it.
 *
 * ⚠ WHAT THIS CAN AND CANNOT SEE -- an instrument that hides its own blind spots is the recurring
 * fault this project keeps paying for.
 *
 *   CAN see: .planning/wyclau/PREEMPT.md's content; HEARTBEAT vs LAST-PUBLISH's recorded gap;
 *            .planning/CHART.md's STEP 1 CHECKLIST section and whether each open line carries
 *            "GATED:"; the current git HEAD.
 *   CANNOT see: whether an item marked actionable is actually safe to work on unattended, whether
 *            an item WITHOUT "GATED:" is secretly blocked by something the Chart forgot to
 *            annotate, whether a recorded LAST-PUBLISH really happened (see brake 2's own note),
 *            or any checklist section other than STEP 1 (there is only one today). The marker and
 *            the attestation are the whole contract -- keep them honest, or this hook is wrong in
 *            whichever direction they are wrong.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

let raw = "";
try { raw = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }
let inp = {};
try { inp = JSON.parse(raw || "{}"); } catch { process.exit(0); }

// Brake 0.
if (inp.stop_hook_active) process.exit(0);

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CHART = path.join(ROOT, ".planning", "CHART.md");
const PREEMPT = path.join(ROOT, ".planning", "wyclau", "PREEMPT.md");
const STATE_FILE = path.join(ROOT, ".planning", "wyclau", "STOP-HOOK-STATE.json");
const HEARTBEAT = path.join(ROOT, ".planning", "wyclau", "HEARTBEAT");
const LAST_PUBLISH = path.join(ROOT, ".planning", "wyclau", "LAST-PUBLISH");
const PUBLISH_LAG_THRESHOLD_MIN = 20; // the Door's own stated pulse cadence, made mechanical

const tryRead = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const tryReadTimestamp = (p) => {
  const raw2 = tryRead(p);
  if (raw2 === null) return null;
  const iso = raw2.split("\t")[0]?.trim();
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}

// ---------- Brake 1: the preemption slot, read BEFORE the Chart ----------
{
  const preemptRaw = tryRead(PREEMPT);
  const body = preemptRaw === null ? "" : (preemptRaw.split(/^---\s*$/m)[1] ?? "");
  const trimmed = body.trim();
  if (trimmed) {
    block(
      "STOP BLOCKED -- Wyatt's steering wheel has something on it, and it outranks whatever this turn was doing.\n\n" +
      ".planning/wyclau/PREEMPT.md holds:\n\n" + trimmed + "\n\n" +
      "Act on it FIRST. Then reset the file to its template (see the file's own header for the exact " +
      "text), commit the reset, and resume."
    );
  }
}

// ---------- Brake 2: the Glass publish lag ----------
{
  const hb = tryReadTimestamp(HEARTBEAT);
  if (hb !== null) {
    const lp = tryReadTimestamp(LAST_PUBLISH);
    if (lp === null) {
      block(
        "STOP BLOCKED -- a pulse exists (HEARTBEAT) but no publish has ever been recorded on this machine.\n\n" +
        "Publish the Glass (Artifact tool, the URL scripts/wyclau/glass.mjs prints), then run:\n" +
        "  node scripts/wyclau/mark_glass_published.mjs\n\n" +
        "then resume."
      );
    }
    const lagMin = (hb - lp) / 60000;
    if (lagMin > PUBLISH_LAG_THRESHOLD_MIN) {
      block(
        `STOP BLOCKED -- the last pulse is ${lagMin.toFixed(1)} min newer than the last recorded Glass publish ` +
        `(threshold ${PUBLISH_LAG_THRESHOLD_MIN} min, the Door's own stated cadence).\n\n` +
        "A pulse Wyatt cannot see is not a pulse. Publish the Glass, then run:\n" +
        "  node scripts/wyclau/mark_glass_published.mjs\n\n" +
        "then resume."
      );
    }
  }
}

// ---------- Read the Chart, find the top actionable (open, non-GATED) checklist item ----------
const chart = tryRead(CHART);
if (chart === null) process.exit(0); // cannot see the plan -- do not invent a reason to block

const stepSec = chart.split(/^## STEP 1 CHECKLIST[^\n]*$/m)[1]?.split(/^## /m)[0] ?? "";
const openLines = stepSec.match(/^- \[ \] .*$/gm) || [];
const actionable = openLines.filter((l) => !l.includes("GATED:"));

// ---------- Brake 3: everything left is genuinely blocked on him ----------
if (actionable.length === 0) process.exit(0);

const topItem = actionable[0].replace(/^- \[ \] /, "").trim();

let head = null;
try { head = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); }
catch { head = null; }

// ---------- Brake 2: give up on a stuck item ----------
let state = null;
try { state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { state = null; }

const sameItem = state && state.item === topItem;
const noCommitSince = head !== null && state && state.head === head;

if (sameItem && noCommitSince) {
  const nextCount = (state.count || 1) + 1;
  if (nextCount >= 3) {
    // GIVE UP. Reset state so the next real change starts a fresh count, and allow the stop.
    try {
      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
      fs.writeFileSync(STATE_FILE, JSON.stringify({ item: null, head: null, count: 0 }, null, 2));
    } catch { /* best-effort; giving up must not itself throw */ }
    console.error(
      `wyclau-stop-keep-working: STUCK on "${topItem}" -- blocked ${nextCount} times with no commit ` +
      `landing in between. Giving up rather than blocking again. Say what is actually blocking this ` +
      `item, park it, and move to the next one, or ask Wyatt.`
    );
    process.exit(0); // allow the stop -- the give-up message went to stderr for the transcript
  }
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ item: topItem, head, count: nextCount }, null, 2));
  } catch { /* best-effort */ }
  block(
    `STOP BLOCKED -- unfinished, unblocked Chart work remains: "${topItem}"\n\n` +
    `(This is block ${nextCount} of 3 on this same item with no commit landing in between -- after ` +
    `3, this hook gives up and lets the turn end instead of looping forever.)\n\n` +
    `Keep working: claim it in the ledger if not already claimed, and move it forward now.`
  );
}

// New item, or a commit landed since the last block -- reset the counter and block once.
try {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ item: topItem, head, count: 1 }, null, 2));
} catch { /* best-effort */ }

block(
  `STOP BLOCKED -- unfinished, unblocked Chart work remains: "${topItem}"\n\n` +
  `Keep working: claim it in the ledger if not already claimed, and move it forward now. ` +
  `(.planning/CHART.md's STEP 1 CHECKLIST -- an open line without "GATED:" counts as actionable.)`
);
