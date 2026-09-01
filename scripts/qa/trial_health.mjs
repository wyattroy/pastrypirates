#!/usr/bin/env node
/* trial_health.mjs — is the sea trial running now PROGRESSING, or WEDGED?
 *
 * ADVISORY. Deliberately not in `npm test`: it reports on a run happening right now, so in a suite
 * it would be either meaningless (no trial) or flaky (a trial mid-leg). Same standing as
 * scripts/qa/quiet_gate_report.mjs — a thing a person runs, not a gate.
 *
 * WHY IT EXISTS, AND IT COST 80 MINUTES TO LEARN. On 2026-09-01 a full trial ran for 111 minutes
 * and produced nothing for the last 80. It LOOKED alive the whole time: node processes up, thirty
 * Chrome processes up, files being written every minute. I read those file timestamps as progress
 * and told Wyatt the fleet was "actively writing screenshots this minute". IT WAS NOT. The files
 * being touched were Chrome's own CACHE; not one SCREENSHOT had been captured since 01:42:45Z.
 *
 * THE DISTINCTION THIS TOOL EXISTS TO MAKE, because I got it wrong by hand:
 *   a live PROCESS        is not progress -- a wedged driver keeps its browser alive
 *   a written FILE        is not progress -- browser cache churns on its own
 *   a new SCREENSHOT      IS progress    -- only the driver taking a step produces one
 *   a LONG-RUN update     IS progress    -- but only fires when a whole LEG finishes, so it is
 *                                          coarse: healthy silence can legitimately last a leg
 * Both clocks are needed. The marker alone is too slow to catch a wedge early; the screenshot
 * clock alone cannot tell you how far along the run is.
 *
 *   node scripts/qa/trial_health.mjs
 */
"use strict";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const MARKER = join(ROOT, ".planning", "wyclau", "LONG-RUN");
const SHOTS = join(ROOT, "sea-trial-shots");

const mins = (ms) => ms / 60000;
const fmt = (m) => (m < 1 ? "under a minute" : `${m.toFixed(0)} min`);

if (!existsSync(MARKER)) {
  console.log("NO TRIAL RUNNING — no .planning/wyclau/LONG-RUN marker in this tree.");
  console.log("(A trial started before the marker shipped will not have one either; check by hand.)");
  process.exit(2);
}

let m;
try { m = JSON.parse(readFileSync(MARKER, "utf8")); }
catch { console.error("MARKER UNREADABLE — it is not valid JSON. Treat as wedged and look yourself."); process.exit(1); }

const markerAge = mins(Date.now() - Date.parse(m.updatedAt));
const stale = Number(m.staleAfterMinutes);

/* THE FINE-GRAINED CLOCK. Only .png files, and only ones the driver captured — a profile directory
   under sea-trial-shots/ is full of Chrome's own files, and counting those is the exact mistake
   this tool was built after. */
let newestShot = null;
try {
  for (const f of readdirSync(SHOTS)) {
    if (!f.endsWith(".png")) continue;
    const t = statSync(join(SHOTS, f)).mtimeMs;
    if (!newestShot || t > newestShot) newestShot = t;
  }
} catch { /* no shots directory yet */ }
const shotAge = newestShot === null ? null : mins(Date.now() - newestShot);

console.log(`trial:      ${m.what}`);
console.log(`progress:   ${m.progress}   (a leg finishing is what moves this)`);
console.log(`marker:     updated ${fmt(markerAge)} ago, may legitimately go ${stale} min between legs`);
console.log(`screenshot: ${shotAge === null ? "none found" : `newest ${fmt(shotAge)} ago`}   (this is the fine clock)`);
console.log("");

/* A SCREENSHOT IS THE STEP. If none has appeared for longer than a leg is allowed to go quiet, the
   driver is not driving, whatever the process table says. This is exactly the state that looked
   healthy for 80 minutes. */
if (shotAge === null) {
  console.log("VERDICT: UNKNOWN — a marker exists but no screenshot has ever been captured.");
  process.exit(1);
}
if (shotAge > stale) {
  console.log(`VERDICT: WEDGED — no screenshot for ${fmt(shotAge)}, past the ${stale} min this job`);
  console.log("         says it may go quiet. Processes being alive is NOT evidence against this.");
  console.log("         Look at what the legs are waiting on before assuming it is merely slow.");
  process.exit(1);
}
if (markerAge > stale) {
  console.log(`VERDICT: SLOW — screenshots are still arriving (${fmt(shotAge)} ago), so the driver is`);
  console.log(`         working, but no LEG has completed in ${fmt(markerAge)}. Worth a look.`);
  process.exit(0);
}
console.log(`VERDICT: PROGRESSING — a screenshot ${fmt(shotAge)} ago and a leg boundary ${fmt(markerAge)} ago.`);
process.exit(0);
