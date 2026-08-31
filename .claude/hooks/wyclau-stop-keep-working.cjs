#!/usr/bin/env node
// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
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
 * ⚠ SCOPE CHANGE, 2026-08-31, from the Quartermaster, superseding an earlier live correction from
 * Wyatt ("run the hook in all sessions"): FIRES ONLY IN A SESSION THE WATCHDOG STARTED. Never in
 * Wyatt's own terminal, never in a cloud session. Gated on an environment stamp, not an inference
 * -- scripts/wyclau/watchdog.ps1 sets $env:PP_BOSUN = "1" immediately before the Start-Process
 * launch. A child process inherits the parent's environment BY DEFAULT (CEO Review 53 corrected a
 * false claim here that the isolating switch, -UseNewEnvironment, does not exist -- it does; it is
 * simply never passed. See watchdog.ps1's own comment for the verified detail). This hook checks
 * that stamp first and exits immediately if it is
 * absent -- an interactive or cloud session never reaches any brake below.
 *
 * ⚠ THE PREEMPTION SLOT WAS REMOVED IN THIS SAME CHANGE. An earlier version of this hook read
 * .planning/wyclau/PREEMPT.md as a brake ("his steering wheel... outranks whatever you're on").
 * The Quartermaster's ruling: it existed only to protect Wyatt's interactive window, which now
 * never runs this hook at all, so the brake had nothing left to protect. Steering happens through
 * the ordinary channel instead (see brake 3): a question goes to the Chart's BLOCKED ON WYATT
 * table with a recommendation, gets pulsed to the Glass, and the engine takes the next unblocked
 * item -- no timer, no waiting on a file only a live session could ever have written to anyway.
 *
 * HIS BRAKES, CHECKED IN THIS ORDER (after the PP_BOSUN gate):
 *
 *   0. stop_hook_active -> ALWAYS allow the stop. Blocking twice in one turn risks a hang, and a
 *      hung session is worse than an early stop.
 *   1. THE GLASS PUBLISH LAG -- moved HERE from `npm test` by CEO Review 52, 2026-08-31: it had
 *      been wired into scripts/qa/glass_publish_lag_check.mjs, which meant a stale WYCLAU DASHBOARD
 *      could block a real GAME fix from reaching players through the release gate. Same check, the
 *      honest home: if HEARTBEAT (a pulse) is more than 20 minutes newer than LAST-PUBLISH (a
 *      confirmed real publish, stamped by scripts/wyclau/mark_glass_published.mjs -- a plain script
 *      cannot call the Artifact tool itself, so this is a session's own attestation that it just
 *      published, not independent proof), BLOCK and say so. Never reachable from `npm test`.
 *   2. GIVE UP ON A STUCK ITEM. If the SAME top actionable Chart item has been blocked on 3 times
 *      with no new commit landing in between, STOP instead of blocking again, and say what is
 *      stuck. Tracked in .planning/wyclau/STOP-HOOK-STATE.json (local, gitignored -- resets clean
 *      on a fresh commit or a different item, never carries across machines).
 *   3. STOP WHEN EVERYTHING LEFT IS GENUINELY BLOCKED ON HIM. Parses .planning/CHART.md's STEP 1
 *      CHECKLIST for `- [ ]` lines; a line carrying the literal marker "GATED:" is not actionable.
 *      If every open line carries it (or none remain), allow the stop.
 *
 * Otherwise: BLOCK. There is unblocked work.
 *
 * ⚠ CEO REVIEW 52 FOUND THREE REAL DEFECTS ON THE FIRST VERSION, FIXED SAME DAY, STILL TRUE HERE:
 *   1. The give-up message must never be sent to a suppressed stream. Registration in
 *      settings.json does not redirect stderr for this entry -- his brake said "stop AND SAY
 *      WHAT'S BLOCKING", and a suppressed stream would lose the second half silently.
 *   2. Off-by-one: count math must give up on the 4th check, not the 3rd -- blocks happen for
 *      count 1, 2 and 3, matching "pushed ~3 times... stop".
 *   3. The checklist regex matches any leading whitespace, not just column zero -- a genuinely
 *      indented open item in CHART.md must not be invisible to brake 3.
 *
 * ⚠ WHAT THIS CAN AND CANNOT SEE -- an instrument that hides its own blind spots is the recurring
 * fault this project keeps paying for.
 *
 *   CAN see: process.env.PP_BOSUN; HEARTBEAT vs LAST-PUBLISH's recorded gap; .planning/CHART.md's
 *            STEP 1 CHECKLIST section and whether each open line carries "GATED:"; the current
 *            git HEAD.
 *   CANNOT see: whether Start-Process actually propagated PP_BOSUN into THIS process (see the
 *            Door's own "watchdog stamp: PRESENT/ABSENT" line, written to the ledger on every
 *            watchdog-started session, for that check); whether an item marked actionable is
 *            actually safe to work on unattended; whether an item WITHOUT "GATED:" is secretly
 *            blocked by something the Chart forgot to annotate; whether a recorded LAST-PUBLISH
 *            really happened; or any checklist section other than STEP 1 (there is only one
 *            today). The stamp, the marker and the attestation are the whole contract -- keep
 *            them honest, or this hook is wrong in whichever direction they are wrong.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

// ---------- The PP_BOSUN gate: not applicable at all outside a watchdog-started session ----------
if (process.env.PP_BOSUN !== "1") process.exit(0);

let raw = "";
try { raw = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }
let inp = {};
try { inp = JSON.parse(raw || "{}"); } catch { process.exit(0); }

// Brake 0.
if (inp.stop_hook_active) process.exit(0);

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CHART = path.join(ROOT, ".planning", "CHART.md");
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

// ---------- Brake 1: the Glass publish lag ----------
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

// Matches any leading whitespace, not just column zero -- an indented open item must not be
// invisible to this brake (CEO Review 52).
const stepSec = chart.split(/^## STEP 1 CHECKLIST[^\n]*$/m)[1]?.split(/^## /m)[0] ?? "";
const openLines = stepSec.match(/^\s*- \[ \] .*$/gm) || [];
const actionable = openLines.filter((l) => !l.includes("GATED:"));

// ---------- Brake 3: everything left is genuinely blocked on him ----------
if (actionable.length === 0) process.exit(0);

const topItem = actionable[0].replace(/^\s*- \[ \] /, "").trim();

let head = null;
try { head = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); }
catch { head = null; }

// ---------- Brake 2: give up on a stuck item ----------
// count is how many blocks have been issued for THIS item at THIS head; blocks happen for count
// 1, 2 and 3, and the 4th consecutive check (same item, same head) gives up instead of blocking
// a 4th time -- matching "pushed ~3 times... stop" without the off-by-one CEO Review 52 found.
let state = null;
try { state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { state = null; }

const sameItem = state && state.item === topItem;
const noCommitSince = head !== null && state && state.head === head;
const priorCount = sameItem && noCommitSince ? (state.count || 0) : 0;
const nextCount = priorCount + 1;

if (nextCount > 3) {
  // GIVE UP. Reset state so the next real change starts a fresh count, and allow the stop.
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ item: null, head: null, count: 0 }, null, 2));
  } catch { /* best-effort; giving up must not itself throw */ }
  const giveUpMsg =
    `STUCK on "${topItem}" -- blocked 3 times with no commit landing in between. Giving up ` +
    `rather than blocking a 4th time. Say what is actually blocking this item, park it, and move ` +
    `to the next one, or ask Wyatt.`;
  // ⚠ CEO Review 53 finding, fixed: a Stop hook that exits 0 (allowing the stop, which give-up
  // must do) does not feed its stderr back to the session that produced it -- only a blocking
  // exit does. His brake said "stop AND SAY WHAT'S BLOCKING", and stderr alone cannot deliver the
  // second half when the session is the one about to end. console.error stays, for a live
  // terminal transcript, but the message that actually SURVIVES the stop is this ledger line --
  // the same durable, cross-session channel the whole project already reads on orientation
  // (the Door's own step 2). The NEXT session sees this on its very first ledger tail, not
  // whichever session happened to be running when the give-up fired.
  console.error(`wyclau-stop-keep-working: ${giveUpMsg}`);
  try {
    const LEDGER = path.join(ROOT, ".planning", "CTO-LEDGER.md");
    const line = `${new Date().toISOString()}  SETUP  KEEP-WORKING STOP HOOK GAVE UP: ${giveUpMsg}\n`;
    fs.appendFileSync(LEDGER, line);
  } catch { /* best-effort; giving up must not itself throw */ }
  process.exit(0); // allow the stop
}

try {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ item: topItem, head, count: nextCount }, null, 2));
} catch { /* best-effort */ }

block(
  `STOP BLOCKED -- unfinished, unblocked Chart work remains: "${topItem}"\n\n` +
  `(Block ${nextCount} of 3 on this same item with no commit landing in between -- after 3, this ` +
  `hook gives up on the 4th check and lets the turn end instead of looping forever.)\n\n` +
  `Keep working: claim it in the ledger if not already claimed, and move it forward now. ` +
  `(.planning/CHART.md's STEP 1 CHECKLIST -- an open line without "GATED:" counts as actionable.)`
);
