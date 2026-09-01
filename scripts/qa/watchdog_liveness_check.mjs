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
import { realEngineIsRunning } from "./lib/real_engine_check.mjs";

const WATCHDOG = process.argv[2] || join(process.cwd(), "scripts", "wyclau", "watchdog.ps1");

let failed = false;
const fail = (m) => { console.error(`FAIL -- ${m}`); failed = true; };

// ---------------------------------------------------------------------------------------------
// PART 1, AND IT RUNS EVERYWHERE: DOES THE WATCHDOG ASK WHETHER AN ENGINE IS RUNNING AT ALL?
//
// Earned 2026-08-31, by Wyatt: "Blade pirates is sitting idle -- that's the exact thing that I
// NEVER want to have happen." Everything the watchdog read until then was a RECENCY signal
// (HEARTBEAT = narration recency, LAST-ACTIVITY = tool-call recency). Both answer "was something
// alive lately?"; neither answers "is an engine working right now?" So an interactive session
// parked at its prompt read as alive and took the hold-off branch, suppressing the relaunch while
// NOTHING was working. Waiting out StaleMinutes to notice that is 45 minutes of no work.
//
// This part reads the SOURCE, deliberately, because the behaviour below cannot run off Windows and
// a skip must not leave this unguarded on every machine that is not the Razer. Red-proofed: run
// this file with the pre-fix watchdog as argv[2] and all three assertions fail.
{
  const src = readFileSync(WATCHDOG, "utf8");
  const probes = [
    [/Get-CimInstance[\s\S]{0,120}Win32_Process/, "it never asks the OS for the live process table -- every signal it reads is recency, so a tree where nothing is running looks identical to one that is working"],
    [/\$engineRunning/, "there is no running-engine test at all"],
    /* ⚠ THIS PROBE WAS REWRITTEN 2026-09-01, and the reason is worth more than the probe.
       It used to look for the literal `-not $engineRunning` -- the PowerShell branch that acted on
       an absent engine. The chain audit moved that judgement OUT of PowerShell into
       scripts/wyclau/should_launch.mjs, so the string vanished and this gate failed while the
       behaviour it protects was intact and better tested than before. A gate that asserts an
       IMPLEMENTATION SHAPE fails the day the shape improves; one that asserts the CONTRACT does
       not. So it now checks the wiring instead -- and that is the exact half
       scripts/qa/wyclau_chain_audit_check.mjs states it cannot see (PowerShell will not run in a
       container), which makes this the only automated guard that the shim really is wired to its
       decider. The decision itself is checked by behaviour over there. */
    [/should_launch\.mjs/, "the watchdog never calls should_launch.mjs -- the engine-present fact is measured and then thrown away, so idleness cannot be acted on at all"],
    [/--engine=\$engineFlag/, "the running-engine fact is never PASSED to the decider, so the one genuinely Windows-only signal never reaches the judgement it exists to inform"],
    [/\$LASTEXITCODE|\$deciderCode/, "the decider's exit code is never read -- a shim that ignores its verdict is not a shim, it is a hard-coded answer"],
  ];
  for (const [re, why] of probes) {
    if (!re.test(src)) fail(`WATCHDOG CANNOT SEE IDLENESS: ${why}. (${WATCHDOG})`);
  }
  // The other half of idleness is burstiness: an engine that does ONE item and exits leaves the
  // tree empty until the next tick. The prompt must tell it to keep going.
  if (!/CONTINUOUSLY|do not stop after a single item/i.test(src)) {
    fail("THE ENGINE IS TOLD TO DO ONE ITEM: the Door prompt never instructs it to work items continuously, so every launch ends in an idle tree until the next tick.");
  }
  if (!failed) console.log("OK structural -- the watchdog asks whether an engine is RUNNING, branches on its absence, and tells the engine to keep working.");
}


if (process.platform !== "win32") {
  console.log("SKIP watchdog_liveness_check (behavioural half) -- not Windows; the watchdog is a .ps1 on the Razer.");
  console.log("     This is a SKIP, not a pass. Nothing about RUNTIME liveness was verified here.");
  // The structural half above already ran and its verdict must still carry. Exiting 0 here
  // regardless would make this file unable to fail off Windows -- a check that cannot fail is
  // not a check, and it would have shipped the idleness fix unguarded on every machine but one.
  process.exit(failed ? 1 : 0);
}
if (!existsSync(WATCHDOG)) { console.error(`FAIL -- watchdog not found at ${WATCHDOG}`); process.exit(1); }

// A REAL ENGINE, RUNNING RIGHT NOW, MAKES THE BEHAVIOURAL HALF BELOW UNRUNNABLE -- NOT WRONG.
// Every scenario() below invokes the REAL watchdog.ps1, whose engine-present check is
// machine-global (see lib/real_engine_check.mjs) and OUTRANKS every fixture signal (heartbeat,
// activity, commits, LONG-RUN) by should_launch.mjs's own rule 1. So when this gate runs from
// inside a live watchdog-started session, EVERY tick below holds off regardless of what the
// fixture says -- not because the watchdog is broken, but because a real engine legitimately is
// running. The structural half above already ran (pure source-text, no process invoked) and its
// verdict still carries; only the six behavioural assertions are skipped here.
if (realEngineIsRunning()) {
  console.log("SKIP watchdog_liveness_check (behavioural half) -- a real headless engine (claude.exe");
  console.log("     -p .../door) is already running on this machine, so every fixture tick below would");
  console.log("     see should_launch.mjs's rule 1 (\"an engine is already running\") outrank whatever");
  console.log("     heartbeat/activity/commit signal the scenario sets up, regardless of the watchdog's");
  console.log("     own correctness. This is a SKIP, not a pass -- re-run outside a live watchdog");
  console.log("     session (or against a machine with no live engine) to verify the six scenarios.");
  process.exit(failed ? 1 : 0);
}

const MIN = 60 * 1000;

/* Build a throwaway repo.
   ⚠ `commitAgeMin` WAS ADDED 2026-09-01 AND IS NOW THE SIGNAL THAT DECIDES. The chain audit moved
   the watchdog's judgement into scripts/wyclau/should_launch.mjs and changed what counts as
   progress: a TOOL CALL no longer buys a hold-off, a COMMIT does. Wyatt's report is the reason --
   his own typing kept LAST-ACTIVITY warm through wyclau-pulse.cjs while the Chart did not move, so
   the watchdog held off for hours waiting on a signal that could never change. The two file clocks
   below are kept in the fixture because they must be proven NOT to decide any more.
   `null` means the file does not exist at all. */
function scenario({ heartbeatAgeMin, activityAgeMin, commitAgeMin = null, longRun = null }) {
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

  if (commitAgeMin != null) {
    const git = (...a) => execFileSync("git", ["-C", repo, ...a], { stdio: "pipe" });
    git("init", "-q");
    git("config", "user.email", "gate@example.com");
    git("config", "user.name", "gate");
    writeFileSync(join(repo, "seed.txt"), "seed\n");
    git("add", "-A");
    const when = new Date(Date.now() - commitAgeMin * MIN).toISOString();
    execFileSync("git", ["-C", repo, "commit", "-q", "-m", "fixture"], {
      stdio: "pipe",
      env: { ...process.env, GIT_AUTHOR_DATE: when, GIT_COMMITTER_DATE: when },
    });
  }

  if (longRun) writeFileSync(join(wy, "LONG-RUN"), JSON.stringify(longRun));

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
      console.log("OK 1/6 -- red-proof: a genuinely dead engine IS still restarted.");
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

/* ── THE SUBJECT, AND IT WAS DELIBERATELY REVERSED ON 2026-09-01. READ THIS BEFORE "FIXING" IT.
 *
 * THIS CASE USED TO ASSERT THE OPPOSITE. It read: heartbeat an hour old, activity stamp seconds
 * old -> the watchdog must NOT restart, because that looks like "a session mid-item, making tool
 * calls, not narrating". That was a reasonable reading of the evidence available at the time, and
 * Wyatt reported what it cost: "When I intervene with bosun, it stops him from being in a loop...
 * And watchdog fails to recognize it or restart him on the chart work after."
 *
 * THE FLAW IN THE OLD ASSERTION: LAST-ACTIVITY is stamped by a PreToolUse hook on EVERY tool call
 * by ANY session, HIS OWN TERMINAL INCLUDED. So "something touched the tree" was true whenever
 * Wyatt was typing, and the watchdog held off on a signal that would never go stale while he sat
 * there -- with the Chart not moving at all. A tool call is not progress. A commit is.
 *
 * THE TRADE, STATED PLAINLY BECAUSE IT IS REAL: an engine may now be launched into a tree somebody
 * is typing in, IF nothing has landed for longer than the staleness window. That is the approved
 * cost of never again sitting idle for hours, and it is only safe because the engine-already-
 * running check (Get-CimInstance, above) still outranks everything.
 */
if (!failed) {
  const { repo, restarts } = scenario({ heartbeatAgeMin: 60, activityAgeMin: 0, commitAgeMin: 180 });
  try {
    tick(repo);
    const ls = lines(restarts);
    if (!launched(ls)) {
      fail(
        "A STALLED TREE WAS LEFT ALONE BECAUSE SOMEBODY TOUCHED A TOOL. No commit had landed for\n" +
        "  three hours and no engine was running, but the activity stamp was seconds old -- exactly the\n" +
        "  state Wyatt reported, where his own typing suppressed the relaunch while nothing moved.\n  " +
        (ls.join("\n  ") || "(no lines)")
      );
    } else {
      console.log("OK 2/6 -- a fresh tool call no longer buys a hold-off: no commit for 3h + no engine = LAUNCH.");
      for (const l of ls) console.log(`  ${l}`);
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

// ── THE OTHER HALF OF THE SAME RULE, or the one above would be a licence to restart everything:
//    a RECENT COMMIT still holds the watchdog off. Work landing is what "someone is working" means
//    now, and it must be honoured even with both file clocks stale.
if (!failed) {
  const { repo, restarts } = scenario({ heartbeatAgeMin: 60, activityAgeMin: 60, commitAgeMin: 1 });
  try {
    tick(repo);
    const ls = lines(restarts);
    if (launched(ls)) {
      fail(
        "A TREE THAT IS ACTIVELY LANDING WORK WAS RESTARTED ON TOP OF. A commit had landed one minute\n" +
        "  earlier; that is the signal that replaced the tool-call clock, and if it does not hold the\n" +
        "  watchdog off then the 2026-09-01 change simply restarts everything.\n  " + ls.join("\n  ")
      );
    } else {
      console.log("OK 2b/6 -- a commit one minute old holds the watchdog off, both file clocks stale or not.");
      for (const l of ls) console.log(`  ${l}`);
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

// ── AND THE CASE THE WHOLE LONG-RUN MARKER EXISTS FOR: a sea trial produces no commits for an
//    hour or more. Before the marker, the only way to survive that was a timer pulsing HEARTBEAT,
//    which blinded the stall detector for 2h31m. Now the job says what it is doing.
if (!failed) {
  const { repo, restarts } = scenario({
    heartbeatAgeMin: 60, activityAgeMin: 60, commitAgeMin: 180,
    longRun: {
      what: "sea trial, 10 legs", startedAt: new Date(Date.now() - 60 * MIN).toISOString(),
      updatedAt: new Date(Date.now() - 2 * MIN).toISOString(), progress: "7/10 legs", staleAfterMinutes: 20,
    },
  });
  try {
    tick(repo);
    const ls = lines(restarts);
    if (launched(ls)) {
      fail(
        "A PROGRESSING LONG RUN WAS RESTARTED ON TOP OF. The marker said a sea trial had moved two\n" +
        "  minutes ago; a trial legitimately lands no commits for an hour, and restarting it is what the\n" +
        "  15-minute timer Monitor was invented to prevent -- the thing this marker replaced.\n  " + ls.join("\n  ")
      );
    } else {
      console.log("OK 2c/6 -- a progressing LONG-RUN marker holds the watchdog off with no commits at all.");
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
      console.log("OK 3/6 -- with no activity file, behaviour is unchanged: a stale engine is restarted.");
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
      console.log("OK 4/6 -- the pulse hook stamps LAST-ACTIVITY, so the clock the watchdog reads is wound.");
    }
  } catch (e) { fail(`the pulse hook did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

// 5/6 -- REGISTERED, NOT MERELY PRESENT. Assertion 4 runs the hook FILE, and CEO Review 46 showed
//        that is not proof the mechanism is live: it unregistered the hook, left the file on disk,
//        and the gate still printed OK -- the exact failure assertion 4's own comment claimed to
//        catch. A hook absent from settings.json never runs. THE REGISTRATION IS THE MECHANISM.
function registeredIn(settings) {
  const groups = settings?.hooks?.PreToolUse ?? [];
  return groups.some((g) => (g.hooks ?? []).some((h) => String(h.command ?? "").includes("wyclau-pulse")));
}
if (!failed) {
  if (registeredIn({ hooks: { PreToolUse: [] } })) {
    fail("registeredIn() says true for a config with NO hooks -- the predicate cannot fail, so it proves nothing.");
  } else {
    let cfg = null;
    try { cfg = JSON.parse(readFileSync(join(process.cwd(), ".claude", "settings.json"), "utf8")); }
    catch (e) { fail(`could not read .claude/settings.json: ${e.message}`); }
    if (cfg && !registeredIn(cfg)) {
      fail("THE PULSE HOOK IS NOT REGISTERED in settings.json PreToolUse -- the file sits on disk looking healthy while nothing runs it, so the watchdog reads a clock nobody winds.");
    } else if (cfg) {
      console.log("OK 5/6 -- the pulse hook is REGISTERED in settings.json, not merely present on disk.");
    }
  }
}

// 6/6 -- AND THE HOLD-OFF MUST NEVER BE SILENT. Trusting activity lets the watchdog decline to
//        restart a stale engine. THE STAMP IS ONE SHARED FILE PER REPO with no session identity
//        (CEO Review 46), so ANY session touching the tree -- a human, a subagent, a second engine
//        -- refreshes it, and the decline is common rather than exotic. That is tolerable only
//        because it is LOGGED: the exit test's claim is "zero SILENT stalls, every gap explained
//        by a line". A watchdog that goes quiet is indistinguishable from one that died.
/* (The scenario changed on 2026-09-01 with the signal it holds off ON -- a recent COMMIT rather
   than a recent tool call -- but the assertion is untouched and is the one that matters most: a
   hold-off that writes nothing is indistinguishable from a watchdog that died.) */
if (!failed) {
  const { repo, restarts } = scenario({ heartbeatAgeMin: 60, activityAgeMin: 60, commitAgeMin: 1 });
  try {
    tick(repo);
    const ls = lines(restarts);
    if (!ls.some((l) => /held off|hold off|NOT restarting/i.test(l))) {
      fail(`THE WATCHDOG WENT QUIET: it declined to restart a 60-minute-stale engine and wrote NOTHING -- a dead engine and a working one now leave the same empty log. Lines: ${ls.join(" | ") || "(none at all)"}`);
    } else {
      console.log("OK 6/6 -- when it holds off, it says so in the log, with the decider's own reason.");
      for (const l of ls) console.log(`  ${l}`);
    }
  } catch (e) { fail(`the watchdog did not run: ${e.stderr?.toString().trim() || e.message}`); }
  finally { rmSync(repo, { recursive: true, force: true }); }
}

process.exit(failed ? 1 : 0);
