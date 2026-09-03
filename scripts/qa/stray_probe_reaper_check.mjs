#!/usr/bin/env node
/* GATE: SOMETHING ACTUALLY KILLS ABANDONED BROWSERS, AND NOTHING CAN SILENCE THE DETECTOR.
 *
 * HIS QUESTION, 2026-09-03, after being told the detector had been made reachable again:
 *   *"did you fix this problem so that there are never any abandoned browsers hitting my laptop
 *    anymore?"*
 *
 * The honest answer was NO, in three separate ways, and this gate holds all three shut:
 *
 *   1. `stray_probe_check.mjs` only ever PRINTED a command. Nothing killed anything.
 *   2. It sat 117th of 127 in an `&&` chain, so **116 gates could switch it off by failing first**
 *      — and on 2026-09-03 one of them did, for a whole day, on a FALSE failure.
 *   3. It only looked when somebody ran `npm test`. A session that leaves browsers and never runs
 *      the suite was never noticed at all.
 *
 * WHAT THAT COST: 183 chrome.exe processes carrying --remote-debugging-port, the oldest more than a
 * day old, holding 15,097 MB, on the laptop he was asleep next to.
 *
 * ⛔ AND THE RESTRAINT IS PART OF THE CONTRACT, NOT A DETAIL. The reaper must kill ORPHANS ONLY. A
 * debug browser whose launcher is alive is a probe somebody is USING — a posed board mid-photograph,
 * a sea trial at sea. A reaper that killed those would break live work every time it tidied up, and
 * the first person it hurt would turn it off.
 *
 * House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let failed = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

console.log("stray_probe_reaper_check — abandoned browsers are KILLED, and the detector cannot be silenced\n");

// 1 — THE REAPER EXISTS AND RUNS.
{
  const p = join(ROOT, "scripts", "qa", "kill_stray_probes.mjs");
  let out = "";
  try { out = execFileSync(process.execPath, [p, "--dry-run"], { encoding: "utf8", cwd: ROOT }); }
  catch (e) { fail(`the reaper would not run: ${String(e.message).split("\n")[0]}`); }
  if (out) {
    if (/stray probes:/.test(out)) pass(`the reaper runs and reports: "${out.trim().split("\n")[0].slice(0, 78)}"`);
    else fail(`the reaper ran but said nothing recognisable: ${JSON.stringify(out.slice(0, 90))}`);
  }
}

/* 2 — ⛔ IT KILLS ORPHANS ONLY. Asserted on the SOURCE because the live machine may legitimately
 *     have zero orphans right now, and a case that can only run on a dirty machine is a case that
 *     never runs. The two halves: it must select on `orphan`, and it must not kill the whole list. */
{
  const src = readFileSync(join(ROOT, "scripts", "qa", "kill_stray_probes.mjs"), "utf8");
  if (!/\.filter\(\s*\(?\s*p\s*\)?\s*=>\s*p\.orphan\s*\)/.test(src)) {
    fail("the reaper no longer selects orphans — it must never kill a probe whose launcher is alive, or it breaks a posed board or a sailing trial");
  } else if (/for\s*\(const\s+\w+\s+of\s+probes\)/.test(src)) {
    fail("the reaper iterates ALL probes, not just the orphans");
  } else pass("it kills orphans only — a probe with a live launcher is in use and is left alone");
}

/* 3 — ONE DEFINITION OF "ORPHANED" (rule 23). The detector and the reaper must not each decide what
 *     counts, or they will drift and only one of them will be right. */
{
  const det = readFileSync(join(ROOT, "scripts", "qa", "stray_probe_check.mjs"), "utf8");
  const rea = readFileSync(join(ROOT, "scripts", "qa", "kill_stray_probes.mjs"), "utf8");
  const lib = "lib/stray_probes.mjs";
  if (!rea.includes(lib)) fail("the reaper does not use the shared definition of an orphaned probe");
  else if (!det.includes(lib)) {
    fail("the DETECTOR still carries its own copy of the orphan query — two definitions of the same fact, which is how they come to disagree (rule 23)");
  } else pass("detector and reaper share one definition of 'orphaned' — scripts/lib/stray_probes.mjs");
}

/* 4 — ⛔ THE DETECTOR CANNOT BE SILENCED BY A GATE THAT FAILS BEFORE IT. This is the fault that
 *     actually happened: it ran 117th, a false failure ~90th switched it off, and it stayed off for
 *     a day. Position 1 is not a preference; it is what makes the check unconditional. */
{
  const chain = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts.test
    .split("&&").map((s) => s.trim());
  const at = chain.findIndex((c) => /stray_probe_check/.test(c));
  if (at < 0) fail("stray_probe_check is not in `npm test` at all");
  else if (at !== 0) {
    fail(`stray_probe_check runs ${at + 1}th, so ${at} gate(s) can silence it by failing first — exactly what happened on 2026-09-03. It must run FIRST.`);
  } else pass("stray_probe_check runs FIRST — no gate can switch it off by failing");
}

/* 5 — ⛔ AND IT MUST NOT DEPEND ON ANYONE RUNNING `npm test`. The 183-browser night had no suite run
 *     in it at all. The reaper is wired to turn-end so it happens whether or not a session tests. */
{
  let s = "";
  try { s = readFileSync(join(ROOT, ".claude", "settings.json"), "utf8"); }
  catch { fail(".claude/settings.json is unreadable, so nothing can be said about the hooks"); }
  if (s) {
    const j = JSON.parse(s);
    const wired = (evt) => JSON.stringify(j.hooks?.[evt] ?? []).includes("kill_stray_probes");
    if (!wired("Stop")) fail("the reaper is not wired to the Stop hook — it would only ever run when somebody remembers, which is the state that cost him 15GB overnight");
    else if (!wired("SubagentStop")) fail("the reaper runs at Stop but not SubagentStop — a subagent that launches a browser and ends is exactly how one is abandoned");
    else pass("the reaper runs at the end of every turn AND every subagent, not only when the suite is run");
  }
}

console.log(failed ? `\nFAIL — ${failed} failure(s).` : "\nPASS — abandoned browsers are killed automatically, and the detector runs first so nothing can silence it.");
process.exit(failed ? 1 : 0);
