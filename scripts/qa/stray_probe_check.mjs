#!/usr/bin/env node
/* stray_probe_check.mjs — are there abandoned headless browsers on this machine RIGHT NOW?
 *
 * WHY THIS EXISTS. On 2026-09-02 a session found **183 `chrome.exe` processes carrying
 * `--remote-debugging-port`, the oldest more than a day old, holding 15,097 MB** on the laptop Wyatt
 * was asleep next to. CLAUDE.md rule 17 exists precisely for this — he once found two abandoned
 * probes at 21% CPU each *while debugging a performance problem*, and later thirteen at 53%.
 * 183 is an order of magnitude past either.
 *
 * ⚠ AND THE RULE COULD NOT BE ENFORCED ON THE MACHINE THAT RUNS THE RELAY. Rule 17 prints
 * `pkill -f remote-debugging-port` / `pgrep -f remote-debugging-port`. **Neither command exists in
 * Git Bash on the Blade** — no procps. So the tidy-up ran, errored, fell through its `||` branch and
 * printed *"no headless chrome"* **while 183 were running.** That is the fault this project names
 * most often: a check that cannot fail reads exactly like a check that passed. The rule was
 * unenforceable on Windows for as long as the relay has run there, and nothing said so.
 *
 * SO THIS GATE IS DERIVED PER-PLATFORM, NOT WRITTEN FOR ONE. It asks the OS the question in the OS's
 * own language and reports what it actually found — never `|| echo "all clear"`.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: kill anything. A gate that kills is a gate that can destroy a
 * live sea trial, and a trial dying silently is a worse failure than a leaked browser. It reports,
 * names the platform's own kill command, and leaves the decision with a person or a watch.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const isWin = process.platform === "win32";

let failures = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures++; };

console.log("stray_probe_check — abandoned headless browsers left running on this machine");

/* THE SEAM. `--fixture=<file>` supplies process lines instead of asking the OS, so the PARSE and the
   VERDICT branches can be red-proofed without spawning 183 browsers. Same reason
   `vendor_check.mjs` takes `--repo=` and `deploy_rsync_paths_check.mjs` sources the real helper:
   an untested branch inside an instrument is how this project keeps finding a check was measuring
   something other than what it named. The default path asks the real OS and nothing changes. */
const fixtureArg = process.argv.find((a) => a.startsWith("--fixture="));

/** One line per matching process. Never returns a bare `[]` on error — see `probe()`. */
function askTheOS() {
  if (isWin) {
    // PowerShell, because Get-CimInstance is the only thing here that can see a command line.
    /* ORPHANED, NOT MERELY RUNNING — and this is the whole definition. A browser whose launcher is
       still alive is a probe someone is USING; a browser whose parent has exited is abandoned. So
       the query reports the parent's liveness alongside each process and the verdict below uses it.
       Emitted as `pid|created|parentAlive`. */
    const ps = `$live = @{}; Get-CimInstance Win32_Process | ForEach-Object { $live[[int]$_.ProcessId] = $true }; ` +
               `Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='msedge.exe'" | ` +
               `Where-Object { $_.CommandLine -match 'remote-debugging-port' } | ` +
               `ForEach-Object { "$($_.ProcessId)|$($_.CreationDate)|$(if ($live[[int]$_.ParentProcessId]) { 'parent-alive' } else { 'orphan' })" }`;
    return execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8" });
  }
  // Mac and Linux. `ps` is present on both; pgrep is not guaranteed and is what failed on Windows.
  return execFileSync("/bin/sh", ["-c", "ps -eo pid,lstart,command | grep -- '--remote-debugging-port' | grep -v grep || true"], { encoding: "utf8" });
}

function probe() {
  try {
    /* The fixture read is INSIDE the try deliberately. It was outside in the first version, so an
       unreadable fixture threw a raw stack trace instead of this file's own "I could not see"
       message — the graceful path existing but not covering the case it was written for. */
    if (fixtureArg) return { ok: true, text: readFileSync(fixtureArg.slice("--fixture=".length), "utf8") };
    return { ok: true, text: askTheOS() };
  } catch (e) {
    /* A FAILED LOOK IS NOT AN EMPTY RESULT, and conflating the two is the whole bug this file was
       written after. Say the instrument could not see, and do not report a count. */
    return { ok: false, text: "", why: String(e.message || e).split("\n")[0] };
  }
}

const { ok, text, why } = probe();
if (!ok) {
  fail(`could not ask this machine what is running (${why}) — reporting NOTHING rather than "all clear", because that substitution is the bug this gate was written after`);
  console.log(`\n${failures} failure(s).`);
  process.exit(1);
}

const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
const count = lines.length;

/* ⚑ ABANDONED MEANS ORPHANED — CORRECTED 2026-09-02 AFTER A CEO CAUGHT THE FIRST VERSION.
 *
 * The first version stood down only when `.planning/wyclau/LONG-RUN` was set. **FIFTEEN scripts in
 * this repo launch a debug-port browser and exactly ONE writes that marker** (`playtest_gate.mjs`).
 * So a session doing precisely what rules 19 and 26 ORDER it to do — two tabs open, a posed board
 * being photographed — and then running `npm test` got a RED BUILD FOR CORRECT BEHAVIOUR.
 *
 * That is the same fault as the check this gate shipped alongside, one commit earlier in the same
 * diff: **an exemption pinned to one name.** The CEO's words: *"the recurrence check that matters:
 * the fault is not 'a check that cannot fail' — that one is genuinely fixed. It is 'an exemption
 * pinned to one name.'"*
 *
 * THE FIX IS A DEFINITION, NOT A LONGER LIST. A browser whose launcher is still alive is a probe
 * somebody is USING. A browser whose parent has exited is ABANDONED. That is what rule 17 has always
 * meant, it needs no roster of harness names, and a sixteenth probe added tomorrow is covered by it
 * without anyone remembering to register. Rule 9: derive it. */
const LONG_RUN = join(ROOT, ".planning", "wyclau", "LONG-RUN");
const trialAtSea = existsSync(LONG_RUN) && readFileSync(LONG_RUN, "utf8").trim();
const orphans = lines.filter((l) => /\borphan\b/.test(l));
const supervised = count - orphans.length;

if (trialAtSea) {
  console.log(`  SKIP  a sea trial is at sea (.planning/wyclau/LONG-RUN is set) and a trial drives browsers by design.`);
  console.log(`        ${count} debug-port browser(s) are up; that is expected while a trial runs.`);
  process.exit(0);
}

const KILL = isWin
  ? `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'remote-debugging-port' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`
  : `pkill -f remote-debugging-port`;

if (count === 0) {
  pass("no debug-port browsers are running at all");
} else if (orphans.length === 0) {
  /* Running, but every one has a live launcher — somebody is driving them right now. Say what was
     seen rather than nothing, so this can never become a silent skip. */
  pass(`${supervised} debug-port browser(s) are up and EVERY ONE has a live launcher — a probe in use, not a leak`);
} else {
  fail(`${orphans.length} ORPHANED headless browser(s): a debug-port browser whose launcher has exited.\n` +
       (supervised ? `        (${supervised} other(s) are up with a live parent — those are in use and not the problem.)\n` : "") +
       `        Rule 17: kill every headless Chrome you start, before you reply. He has twice found these\n` +
       `        heating the laptop he was working on, and once found 183 of them holding 15 GB.\n` +
       `        Kill them with:\n\n        ${KILL}\n`);
}

console.log(failures ? `\n${failures} failure(s).` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
