#!/usr/bin/env node
// scripts/qa/glass_publish_lag_check.mjs
//
// "MAKE PUBLISHING PART OF PULSING" — Wyatt, 2026-08-31, part (c) of the Glass age fix. His own
// words on why a prompt in a console log is not enough: "we already know that behavioral fixes get
// ignored, that's in your documentation."
//
// ============================================================================
// What this catches, and why a client-side fix alone cannot
// ============================================================================
// The Glass is a STATIC published page: its "last progress"/"page published" numbers are frozen at
// generation time and tick forward in the viewer's browser. No client-side computation can ever
// show work that happened AFTER the page was last generated — the only real fix is closing the gap
// between real activity (HEARTBEAT) and the last confirmed publish (LAST-PUBLISH). This gate makes
// that gap a build failure instead of a printed reminder nobody has to act on.
//
// ============================================================================
// The mechanism
// ============================================================================
// scripts/wyclau/glass.mjs stamps HEARTBEAT on every run (a deliberate pulse). There is no way for
// a plain node script to call the Artifact tool — only a live session can actually publish — so
// scripts/wyclau/mark_glass_published.mjs is a second, separate stamp: run it immediately AFTER a
// successful Artifact publish, and it writes LAST-PUBLISH = now. This gate compares the two: if
// HEARTBEAT is meaningfully newer than LAST-PUBLISH, someone pulsed and did not publish.
//
// ============================================================================
// What "absent" means, and why it must never be silent success
// ============================================================================
// - No HEARTBEAT at all: nobody has ever pulsed on this machine. Nothing to check — PASS.
// - HEARTBEAT exists, no LAST-PUBLISH at all: a pulse has happened and NO publish has EVER been
//   recorded on this machine. This is exactly the failure mode the mechanism exists to catch, so
//   it FAILS — never treated as "no data, assume fine" (the fail-open trap this file's own sibling
//   gates were built to stop; see glass_restarts_honesty_check.mjs for the same shape).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");
const HEARTBEAT = join(WY, "HEARTBEAT");
const LAST_PUBLISH = join(WY, "LAST-PUBLISH");

// Matches the Door's own stated pulse cadence ("pulse at least every 20 minutes while working") --
// not a new invented number, the existing rule made mechanical.
const LAG_THRESHOLD_MIN = 20;

const tryReadTimestamp = (p) => {
  let raw;
  try { raw = readFileSync(p, "utf8"); } catch { return null; }
  const iso = raw.split("\t")[0]?.trim();
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};

const hb = tryReadTimestamp(HEARTBEAT);
const lp = tryReadTimestamp(LAST_PUBLISH);

if (hb === null) {
  console.log("PASS glass publish lag: no HEARTBEAT on this machine yet -- nothing pulsed, nothing to check.");
  process.exit(0);
}

if (lp === null) {
  console.error(`FAIL — glass publish lag`);
  console.error(`  - GLASS-NEVER-PUBLISHED: HEARTBEAT exists (a session has pulsed) but no LAST-PUBLISH has ever been recorded on this machine.`);
  console.error(`    Publish the Glass (Artifact tool, the URL scripts/wyclau/glass.mjs prints), then run:`);
  console.error(`      node scripts/wyclau/mark_glass_published.mjs`);
  process.exit(1);
}

const lagMin = (hb - lp) / 60000;
if (lagMin > LAG_THRESHOLD_MIN) {
  console.error(`FAIL — glass publish lag`);
  console.error(`  - GLASS-PUBLISH-LAG: the last pulse (HEARTBEAT) is ${lagMin.toFixed(1)} min newer than the last recorded publish (LAST-PUBLISH).`);
  console.error(`    That threshold is the Door's own pulse cadence (${LAG_THRESHOLD_MIN} min) — a pulse Wyatt cannot see is not a pulse.`);
  console.error(`    Publish the Glass (Artifact tool, the URL scripts/wyclau/glass.mjs prints), then run:`);
  console.error(`      node scripts/wyclau/mark_glass_published.mjs`);
  process.exit(1);
}

console.log(`PASS glass publish lag: last pulse is ${lagMin.toFixed(1)} min ahead of the last recorded publish (threshold ${LAG_THRESHOLD_MIN} min).`);
process.exit(0);
