// GATE: THE WATCHDOG MUST NOT SPAWN A SECOND ENGINE ON TOP OF A FIRST.
//
// A stale heartbeat does not mean no engine is running -- it means no engine has PULSED. An
// engine that is booting, orienting through the Door, or mid-item has not pulsed either. Without
// a guard, every scheduled tick launches another one, and two unattended sessions on one branch
// is the hazard CLAUDE.md section 3 is entirely about.
//
// This gate runs THE REAL SCRIPT with -DryRun against a throwaway repo, twice, with the heartbeat
// stale both times. The first run must launch. The second must refuse.
//
// WHY IT EXERCISES THE SCRIPT INSTEAD OF RE-IMPLEMENTING ITS LOGIC: a gate that paraphrases the
// thing it guards passes forever while the original drifts. That is the "gate aimed at the wrong
// tree" failure this repo has already paid for once.
//
// Windows-only by nature (the watchdog is a .ps1 on the Razer). SKIPS, loudly, elsewhere --
// a skip is reported as a skip and never as a pass.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { realEngineIsRunning } from "./lib/real_engine_check.mjs";

const WATCHDOG = join(process.cwd(), "scripts", "wyclau", "watchdog.ps1");

if (process.platform !== "win32") {
  console.log("SKIP watchdog_one_engine_check -- not Windows; the watchdog is a .ps1 on the Razer.");
  console.log("     This is a SKIP, not a pass. Nothing about the guard was verified here.");
  process.exit(0);
}
if (!existsSync(WATCHDOG)) {
  console.error(`FAIL -- watchdog script not found at ${WATCHDOG}`);
  process.exit(1);
}

// A REAL ENGINE, RUNNING RIGHT NOW, MAKES THE FIRST HALF OF THIS GATE UNRUNNABLE -- NOT WRONG.
//
// watchdog.ps1's engine check (this file's own comment at its line ~55-79) is deliberately
// MACHINE-GLOBAL: it asks the OS for every `claude.exe -p .../door` process, with no way to scope
// that query to this gate's throwaway fixture repo. That is correct production behaviour -- only
// one unattended engine should ever run on the Razer, full stop (CLAUDE.md section 3). But it means
// that whenever THIS gate is run FROM INSIDE a live watchdog-started session (the normal way this
// project now runs unattended work), the real watchdog it invokes sees the CALLING session's own
// process and correctly holds off -- so "the fixture's first tick must launch" is an assumption
// this gate can no longer make, through no fault of the fixture or the script under test.
// See lib/real_engine_check.mjs for why this is a fresh OS query rather than a copy of watchdog.ps1's
// own `-Filter`/`-like` pair (measured to under-match this exact process's command line).
if (realEngineIsRunning()) {
  console.log("SKIP watchdog_one_engine_check -- a real headless engine (claude.exe -p .../door) is");
  console.log("     already running on this machine, so watchdog.ps1 correctly holds off on EVERY");
  console.log("     tick it sees right now, including this gate's own fixture. This is not a SKIP");
  console.log("     of the guard being untested in general -- it is a SKIP of this specific run,");
  console.log("     because a real engine's presence is exactly what the guard exists to respect.");
  console.log("     This is a SKIP, not a pass. Re-run outside a live watchdog session to verify.");
  process.exit(0);
}

const repo = mkdtempSync(join(tmpdir(), "wyclau-watchdog-"));
const wy = join(repo, ".planning", "wyclau");
mkdirSync(wy, { recursive: true });

const heartbeat = join(wy, "HEARTBEAT");
const restarts = join(wy, "restarts.log");

// A heartbeat an hour old: stale under any threshold this thing is ever run with.
writeFileSync(heartbeat, "2026-01-01T00:00:00.000Z\tfixture\n");
const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
utimesSync(heartbeat, hourAgo, hourAgo);

function tick() {
  execFileSync("powershell", [
    "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", WATCHDOG,
    "-Repo", repo,
    "-StaleMinutes", "5",
    "-DryRun",
  ], { stdio: "pipe" });
}

function lines() {
  if (!existsSync(restarts)) return [];
  return readFileSync(restarts, "utf8").trim().split("\n").filter(Boolean);
}

let failed = false;
const fail = (m) => { console.error(`FAIL -- ${m}`); failed = true; };

try {
  tick();
  const afterFirst = lines();

  // RED-PROOF THE INSTRUMENT BEFORE BELIEVING EITHER VERDICT. If the first tick did not launch,
  // this gate is not measuring the duplicate-spawn question at all -- it is measuring a broken
  // fixture, and a "no second launch" result would be vacuous.
  const launches1 = afterFirst.filter((l) => l.includes("DRYRUN would launch")).length;
  if (launches1 !== 1) {
    fail(
      `the fixture never produced a FIRST launch (${launches1}), so this gate cannot see the ` +
      `question it exists to ask. restarts.log was:\n  ${afterFirst.join("\n  ") || "(empty)"}`
    );
  } else {
    tick();
    const afterSecond = lines();
    const launches2 = afterSecond.filter((l) => l.includes("DRYRUN would launch")).length;

    if (launches2 > 1) {
      fail(
        `TWO ENGINES. The second tick launched again while the first engine had only just been ` +
        `started -- ${launches2} launches across 2 ticks. On the Razer that is ` +
        `two unattended sessions on one branch, on every scheduled tick, forever.\n  ` +
        afterSecond.join("\n  ")
      );
    } else if (launches2 === 1) {
      const refused = afterSecond.some((l) => l.includes("NOT spawning a second"));
      if (!refused) {
        fail(
          `the second tick did not launch, but it also left no record of REFUSING. A watchdog ` +
          `that goes quiet is indistinguishable from a watchdog that died.\n  ` +
          afterSecond.join("\n  ")
        );
      } else {
        console.log("OK 1/2 -- first tick launched; second tick refused and said so.");
        for (const l of afterSecond) console.log(`  ${l}`);
      }
    }

    // THE INVERSE, AND IT MATTERS MORE THAN THE CASE ABOVE. A guard that refuses forever also
    // passes the first half of this gate -- and it would be a watchdog that never revives
    // anything, which is worse than no watchdog because the Glass would still look armed.
    // Age LAST-LAUNCH past the grace window and the engine must come back.
    const lastLaunch = join(wy, "LAST-LAUNCH");
    if (!existsSync(lastLaunch)) {
      fail("LAST-LAUNCH was never written, so the grace window is not actually being recorded.");
    } else {
      const longAgo = new Date(Date.now() - 60 * 60 * 1000);
      utimesSync(lastLaunch, longAgo, longAgo);
      const before = lines().length;
      tick();
      const after = lines();
      const launchedAgain = after.slice(before).some((l) => l.includes("DRYRUN would launch"));
      if (!launchedAgain) {
        fail(
          "THE WATCHDOG NEVER LETS GO. With the last launch an hour old and the heartbeat still " +
          "stale, it refused to restart -- a dead engine would stay dead while the Glass still " +
          `showed a watchdog armed.\n  ${after.slice(before).join("\n  ") || "(no new lines at all)"}`
        );
      } else {
        console.log("OK 2/2 -- once the grace window expired, the engine was restarted.");
        for (const l of after.slice(before)) console.log(`  ${l}`);
      }
    }
  }
} catch (e) {
  fail(`the watchdog script did not run: ${e.stderr?.toString().trim() || e.message}`);
} finally {
  rmSync(repo, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
