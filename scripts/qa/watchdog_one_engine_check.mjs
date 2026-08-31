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
