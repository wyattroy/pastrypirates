#!/usr/bin/env node
// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
/* should_launch.mjs — should the watchdog start an engine right now?
 *
 * THE FAULT THIS FIXES, in Wyatt's words, 2026-09-01: "There is a problem with the chain of
 * command. When I intervene with bosun, it stops him from being in a loop... And watchdog fails to
 * recognize it or restart him on the chart work after."
 *
 * WHAT WAS ACTUALLY HAPPENING. `.claude/hooks/wyclau-pulse.cjs` stamps LAST-ACTIVITY on EVERY tool
 * call by ANY session, and watchdog.ps1 read that fresh timestamp as "someone is in the tree" and
 * held off (its :91, :103, :115 branches). So Wyatt typing in his own terminal kept the file warm
 * while the Chart did not move, and the watchdog sat quiet for hours waiting for a signal that was
 * never going to change.
 *
 * THE DISTINCTION THAT FIXES IT: A TOOL CALL IS NOT PROGRESS. A COMMIT IS. Human presence buys a
 * hold-off only while commits are still landing. That is a deliberate trade and it is the ruling:
 * an engine may now be launched into a tree somebody is typing in, IF nothing has actually landed
 * for longer than the staleness window. The alternative is the state he named as the one he never
 * wants — a tree where nothing is happening and nothing notices.
 *
 * WHY THIS IS NODE AND NOT MORE POWERSHELL: the judgement is the part worth testing, and no check
 * that runs in CI, in a container, or on a Mac can execute PowerShell. Moving the DECISION here and
 * leaving watchdog.ps1 as the shim that runs it and acts on the exit code converts an untestable
 * fix into a tested one. The single genuinely Windows-only fact — is a claude.exe with `-p /door`
 * alive — stays in PowerShell and arrives here as `--engine=running|absent`.
 *
 * EXIT CODES ARE THE INTERFACE:  0 = LAUNCH an engine.  1 = hold off.
 * One plain-English reason goes to stdout either way, so restarts.log records WHY, not just what.
 */
"use strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { longRunStatus, PROGRESSING } from "./longrun_status.mjs";

export const LAUNCH = 0;
export const HOLD_OFF = 1;

export function shouldLaunch(dir, { engine, staleMinutes }) {
  // 1. AN ENGINE IS ALREADY RUNNING. Nothing else matters: two unattended sessions on one branch
  //    is the hazard CLAUDE.md section 3 exists for, and a watchdog that manufactures them on a
  //    timer is not a liveness layer. This outranks every signal below it.
  if (engine === "running") {
    return { code: HOLD_OFF, reason: "an engine is already running -- never stack a second on it" };
  }

  // 2. A LONG RUN IS PROGRESSING. A sea trial legitimately produces no commits for an hour or
  //    more, so the commit clock below would read it as dead. The marker is the job's own account
  //    of itself, and longrun_status resolves every doubt to "not a hold-off" (see its header), so
  //    trusting it here cannot wedge the watchdog shut.
  const lr = longRunStatus(dir);
  if (lr.code === PROGRESSING) {
    return { code: HOLD_OFF, reason: lr.reason };
  }

  // 3. THE COMMIT CLOCK. This is the whole fix: what counts as progress is work that LANDED.
  let lastCommitMs = null;
  try {
    // stderr is SILENCED deliberately. A tree with no git history makes git print a multi-line
    // "fatal: not a git repository" block, and PowerShell wraps every line of a native command's
    // stderr in an error record -- so the whole thing landed in restarts.log looking like the
    // watchdog had crashed, when the answer ("no history here") was already handled below.
    const out = execFileSync("git", ["-C", dir, "log", "-1", "--format=%ct"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const secs = Number(out);
    if (Number.isFinite(secs) && secs > 0) lastCommitMs = secs * 1000;
  } catch { lastCommitMs = null; }

  if (lastCommitMs === null) {
    // NO COMMIT CLOCK AT ALL — no git, or a repo with no commits yet. NOTHING HAS EVER LANDED
    // HERE, which is the strongest possible version of the condition this whole file tests for,
    // so it launches. That is also what the PowerShell it replaced did, in as many words: "no
    // heartbeat or activity file found -- launching the engine fresh".
    //
    // ⚠ THIS WAS BRIEFLY WRITTEN THE OTHER WAY, and the suite caught it: holding off here felt
    // like the careful choice ("a watchdog that cannot read the clock must not spawn"), but it
    // silently deleted the fresh-tree case and broke watchdog_one_engine_check.mjs, which points a
    // real watchdog at a bare fixture repo and could no longer see a first launch at all. The
    // runaway this was guarding against cannot happen: once an engine starts, the engine=running
    // branch above holds off every later tick, and LAST-LAUNCH's grace window covers the gap while
    // it boots.
    return { code: LAUNCH, reason: "no commit history in this tree at all -- nothing has ever landed here, so LAUNCH (the fresh-tree case)" };
  }

  const ageMin = (Date.now() - lastCommitMs) / 60000;
  if (ageMin <= staleMinutes) {
    return { code: HOLD_OFF, reason: `a commit landed ${ageMin.toFixed(0)} min ago (within ${staleMinutes}) -- the Chart is moving, hold off` };
  }

  return {
    code: LAUNCH,
    reason: `no engine, and no commit for ${ageMin.toFixed(0)} min (over ${staleMinutes}) -- LAUNCH. ` +
      `A recent tool call does not count: LAST-ACTIVITY stays warm while Wyatt types, and that is the ` +
      `signal that used to hold this off while nothing landed.`,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const arg = (k, d) => {
    const hit = process.argv.slice(2).find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : d;
  };
  const dir = arg("dir", process.cwd());
  const engine = arg("engine", "absent");
  // ONE number, not two kept in step: watchdog.ps1 passes its own -StaleMinutes in. The default
  // here only matters if somebody runs this by hand, and it matches the watchdog's own default.
  const staleMinutes = Number(arg("stale-minutes", "45"));
  if (engine !== "running" && engine !== "absent") {
    console.log(`--engine must be "running" or "absent" (got "${engine}") -- holding off rather than acting on a value this cannot read`);
    process.exit(HOLD_OFF);
  }
  const { code, reason } = shouldLaunch(dir, { engine, staleMinutes: Number.isFinite(staleMinutes) ? staleMinutes : 45 });
  console.log(reason);
  process.exit(code);
}
