#!/usr/bin/env node
// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
/* longrun_status.mjs — is something legitimately slow happening in this tree right now?
 *
 * WHY THIS EXISTS. On 2026-08-31 a session started a background Monitor that called glass.mjs
 * every 15 minutes so the watchdog would not restart it mid sea trial. That made HEARTBEAT a
 * TIMER rather than evidence of work: it beat whether or not anything was happening, so for 2h31m
 * the only stall detector in the tree was blind — during the very 24-hour exit test whose whole
 * purpose is to prove there are no silent stalls. The Quartermaster found it; the session that
 * built it owned it.
 *
 * THE FIX IS NOT A BETTER TIMER. It is for the long job to say what it is doing, as it does it.
 * A sea trial finishing leg 6 of 10 is a fact the trial knows and nothing else does.
 *
 *   .planning/wyclau/LONG-RUN   (JSON, written and updated BY THE LONG JOB ITSELF)
 *     { "what", "startedAt", "updatedAt", "progress", "staleAfterMinutes" }
 *
 * `staleAfterMinutes` is written BY THE JOB, never hardcoded here: a sea trial leg and a
 * determinism re-record are not the same number, and CLAUDE.md rule 9 says a threshold that
 * cannot be right for both must be derived by whoever actually knows.
 *
 * EXIT CODES ARE THE INTERFACE (PowerShell reads these; nothing parses this text):
 *   2 = no marker. Nothing long-running. The watchdog judges normally.
 *   0 = a long run is genuinely progressing. HOLD OFF.
 *   1 = a long run exists but has STALLED, or its marker cannot be trusted. Do NOT hold off.
 *
 * ⚠ THE RULE THAT MATTERS MOST, and it is why 1 is the answer to every doubt: a marker that is
 * malformed, missing fields, or dated in the FUTURE resolves to 1, never 0. A hold-off that a
 * broken file can make permanent IS the Monitor bug rebuilt in a new place — a blind spot that
 * cannot be argued out of existence. When this file cannot tell, it says "do not hold off", and
 * the watchdog's own judgement takes over.
 */
"use strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const NO_MARKER = 2;
export const PROGRESSING = 0;
export const STALLED = 1;

/* Returns { code, reason }. Exported so should_launch.mjs asks THIS function rather than
   reimplementing the same reading — two readers of one file drift, one reader cannot (rule 23). */
export function longRunStatus(dir) {
  const marker = path.join(dir, ".planning", "wyclau", "LONG-RUN");
  let raw;
  try { raw = fs.readFileSync(marker, "utf8"); }
  catch { return { code: NO_MARKER, reason: "no LONG-RUN marker -- nothing long-running here" }; }

  let m;
  try { m = JSON.parse(raw); }
  catch { return { code: STALLED, reason: "LONG-RUN marker is not readable JSON -- treating as stalled, never as a hold-off" }; }

  if (m === null || typeof m !== "object" || Array.isArray(m)) {
    return { code: STALLED, reason: "LONG-RUN marker is not an object -- treating as stalled" };
  }

  const updatedAt = Date.parse(m.updatedAt);
  const staleAfter = Number(m.staleAfterMinutes);
  if (!Number.isFinite(updatedAt)) {
    return { code: STALLED, reason: "LONG-RUN marker has no readable updatedAt -- treating as stalled" };
  }
  if (!Number.isFinite(staleAfter) || staleAfter <= 0) {
    return { code: STALLED, reason: "LONG-RUN marker has no usable staleAfterMinutes -- the job must write its own threshold (rule 9)" };
  }

  const ageMin = (Date.now() - updatedAt) / 60000;
  // A future timestamp is not "very fresh" — it is a clock nobody can reason about, and believing
  // it would hold the watchdog off for as long as the skew lasts. Unfalsifiable, so: stalled.
  if (ageMin < 0) {
    return { code: STALLED, reason: `LONG-RUN marker is dated ${Math.abs(ageMin).toFixed(0)} min in the FUTURE -- not a hold-off this cannot disprove` };
  }
  if (ageMin > staleAfter) {
    return {
      code: STALLED,
      reason: `long run "${m.what ?? "unnamed"}" last moved ${ageMin.toFixed(0)} min ago, past its own ${staleAfter} min staleness -- STALLED`,
    };
  }
  return {
    code: PROGRESSING,
    reason: `long run "${m.what ?? "unnamed"}" is progressing (${m.progress ?? "?"}), last moved ${ageMin.toFixed(0)} min ago -- hold off`,
  };
}

/* THE OTHER HALF OF THE CONTRACT: the long job writes the marker. Exported so sea_trial.mjs (and
   any future long job) updates it through one function instead of hand-rolling the JSON shape.
   `staleAfterMinutes` is the caller's to choose — it is the only party that knows how long its
   own quiet stretches legitimately are. */
export function writeLongRun(dir, { what, progress, staleAfterMinutes, startedAt }) {
  const f = path.join(dir, ".planning", "wyclau", "LONG-RUN");
  let started = startedAt;
  if (!started) {
    try { started = JSON.parse(fs.readFileSync(f, "utf8")).startedAt; } catch { /* first write */ }
  }
  const now = new Date().toISOString();
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({
    what, startedAt: started || now, updatedAt: now, progress, staleAfterMinutes,
  }, null, 2) + "\n");
}

/* And the job must clear it when it finishes, or the NEXT watchdog tick reads a marker for a job
   that is over. A finished job that leaves its marker behind becomes a stalled one within
   staleAfterMinutes, which is the safe direction — but it is still noise, so: remove it. */
export function clearLongRun(dir) {
  try { fs.rmSync(path.join(dir, ".planning", "wyclau", "LONG-RUN"), { force: true }); } catch { /* best effort */ }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const arg = (k, d) => {
    const hit = process.argv.slice(2).find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : d;
  };
  const { code, reason } = longRunStatus(arg("dir", process.cwd()));
  console.log(reason);
  process.exit(code);
}
