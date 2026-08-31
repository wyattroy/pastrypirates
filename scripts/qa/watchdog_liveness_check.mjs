// GATE: A SESSION THAT IS DEMONSTRABLY WORKING MUST NOT BE RESTARTED ON TOP OF.
//
// The heartbeat is a DELIBERATE pulse -- a session narrates what it is doing via glass.mjs. That
// makes it a statement of intent, not evidence of life, and the difference cost a collision on
// 2026-08-31: the engine launched at 15:09:01Z worked until ~15:24Z, went quiet WITHOUT EXITING,
// and at 16:16:02Z the watchdog read 52 minutes of silence and launched a second engine into the
// tree. Nothing was broken. The heartbeat simply cannot distinguish "gone" from "busy and not
// narrating" -- and CEO Review 44 parked exactly this, one window before it fired.
//
// The one-engine guard cannot cover it either: it protects for LaunchGraceMinutes measured from the
// LAST LAUNCH, so a healthy engine on a long item is safe for 25 minutes and is stacked on at
// minute 26. TIME SINCE LAUNCH IS NOT A LIVENESS SIGNAL.
//
// LAST-ACTIVITY is. It is stamped by a PreToolUse hook on every tool call any session makes --
// interactive sessions included, which the pulse rule never reached -- so it is evidence rather
// than narration. This gate holds the watchdog to reading it.
//
// Windows-only by nature. SKIPS, loudly, elsewhere -- a skip is a skip and never a pass.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const WATCHDOG = join(process.cwd(), "scripts", "wyclau", "watchdog.ps1");

if (process.platform !== "win32") {
  console.log("SKIP watchdog_liveness_check -- not Windows; the watchdog is a .ps1 on the Razer.");
  console.log("     This is a SKIP, not a pass. Nothing about liveness was verified here.");
  process.exit(0);
}
if (!existsSync(WATCHDOG)) { console.error(`FAIL -- watchdog not found at ${WATCHDOG}`); process.exit(1); }

let failed = false;
const fail = (m) => { console.error(`FAIL -- ${m}`); failed = true; };
const MIN = 60 * 1000;

/* Build a throwaway repo. `heartbeatAgeMin` and `activityAgeMin` are the two clocks under test;
   null means the file does not exist at all. */
function scenario({ heartbeatAgeMin, activityAgeMin }) {
  const repo = mkdtempSync(join(tmpdir(), "wyclau-liveness-"));
  const wy = join(repo, ".planning", "wyclau");
  mkdirSync(wy, { recursive: true });
  const age = (p, mins) => { const t = new Date(Date.now() - mins * MIN); utimesSync(p, t, t); };

  const hb = join(wy, "HEARTBEAT");
  writeFileSync(hb, "fixture heartbeat\n");
  age(hb, heartbeatAgeMin);

  if (activityAgeMin != null) {
    const la = join(wy, "LAST-ACTIVITY");
    writeFileSync(la, "fixture activity\n");
    age(la, activityAgeMin);
  }
  return { repo, restarts: join(wy, "restarts.log") };
}

function tick(repo) {
  execFileSync("powershell", [
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", WATCHDOG,
    "-Repo", repo, "-StaleMinutes", "5", "-DryRun",
  ], { stdio: "pipe" });
}
const lines = (f) => (existsSync(f) ? readFileSync(f, "utf8").trim().split("\n").filter(Boolean) : []);
const launched = (ls) => ls.some((l) => l.includes("DRYRUN would launch"));

// ── RED-PROOF FIRST. If a dead engine is NOT restarted, this gate is measuring a watchdog that
//    never fires, and every "did not restart" result below would be vacuous.
{
  const { repo, restarts } = scenario({ heartbeatAgeMin: 60, activityAgeMin: 60 });
  try {
    tick(repo);
    if (!launched(lines(restarts))) {
      fail(
        "RED-PROOF FAILED: with BOTH the heartbeat and the activity stamp an hour old, the watchdog " +
        "did not restart. It is not firing at all, so nothing else this gate reports means anything.\n  " +
        (lines(restarts).join("\n  ") || "(no lines)")
      );
    } else {
      console.log("OK 1/4 -- red-proof: a genuinely dead engine IS still restarted.");
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

// ── THE SUBJECT. Heartbeat stale, activity fresh: a session that is working but not narrating.
if (!failed) {
  const { repo, restarts } = scenario({ heartbeatAgeMin: 60, activityAgeMin: 0 });
  try {
    tick(repo);
    const ls = lines(restarts);
    if (launched(ls)) {
      fail(
        "A WORKING SESSION WAS RESTARTED ON TOP OF. The heartbeat was an hour old but the activity\n" +
        "  stamp was seconds old -- a session mid-item, making tool calls, not narrating. On the Razer\n" +
        "  that is two unattended sessions on one branch, which is what CLAUDE.md section 3 is about.\n  " +
        ls.join("\n  ")
      );
    } else {
      console.log("OK 2/4 -- a session with fresh activity and a stale heartbeat is left alone.");
      for (const l of ls) console.log(`  ${l}`);
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

// ── THE INVERSE, and it matters as much. A tree that has never had the hook run has no
//    LAST-ACTIVITY at all. That must behave exactly as before, not wedge the watchdog shut.
if (!failed) {
  const { repo, restarts } = scenario({ heartbeatAgeMin: 60, activityAgeMin: null });
  try {
    tick(repo);
    if (!launched(lines(restarts))) {
      fail(
        "WITH NO LAST-ACTIVITY FILE AT ALL, the watchdog refused to restart a stale engine. A tree " +
        "where the hook has never run would keep a dead engine dead while the Glass looked armed.\n  " +
        (lines(restarts).join("\n  ") || "(no lines)")
      );
    } else {
      console.log("OK 3/4 -- with no activity file, behaviour is unchanged: a stale engine is restarted.");
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

// -- AND THE OTHER END OF THE WIRE. The watchdog reading LAST-ACTIVITY is worth nothing if
//    nothing writes it. Run the real hook against a throwaway tree and require the stamp.
//    A gate that checks only the reader passes forever while the writer is unregistered.
if (!failed) {
  const repo = mkdtempSync(join(tmpdir(), "wyclau-hook-"));
  mkdirSync(join(repo, ".planning", "wyclau"), { recursive: true });
  const stamp = join(repo, ".planning", "wyclau", "LAST-ACTIVITY");
  try {
    execFileSync(process.execPath, [join(process.cwd(), ".claude", "hooks", "wyclau-pulse.cjs")], {
      stdio: "pipe", env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
    });
    if (!existsSync(stamp)) {
      fail("the pulse hook ran but wrote no LAST-ACTIVITY -- the watchdog would read a clock nobody winds.");
    } else {
      console.log("OK 4/4 -- the pulse hook stamps LAST-ACTIVITY, so the clock the watchdog reads is wound.");
    }
  } catch (e) { fail(`the pulse hook did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

process.exit(failed ? 1 : 0);
