#!/usr/bin/env node
// scripts/qa/wyclau_stop_hook_check.mjs
//
// THE KEEP-WORKING STOP HOOK, RED-PROOFED. `.claude/hooks/wyclau-stop-keep-working.cjs` — Wyatt's
// ruling, 2026-08-31: "why have you stopped working? your mission is to continuously work until
// every single task is finished... we already know that behavioral fixes get ignored." This gate
// exercises the REAL hook file as a subprocess, against throwaway fixture trees — never a copy of
// its logic (HARD-WON-LESSONS §12i: a gate that asserts against a copy of the real subject drifts
// silently).
//
// ⚠ SCOPE CHANGE, 2026-08-31 (the Quartermaster), SUPERSEDED 2026-09-01 (the chain audit). The
// 2026-08-31 version gated the whole hook on process.env.PP_BOSUN === "1", so it fired ONLY in a
// session the watchdog started. Wyatt reported the consequence on 2026-09-01: "When I intervene
// with bosun, it stops him from being in a loop" -- his instruction lands in a session that is not
// watchdog-started, so the loop was off in exactly the session doing the work he asked for.
//
// THE GATE MOVED AXIS: from WHO LAUNCHED THIS to IS THIS SESSION WORKING (HEAD moved since the
// session's own base, or tracked files are dirty). PP_BOSUN survives as a FORCE-ON for a fresh
// engine that has not committed anything yet. Case 1a/1b/1c below are that contract, and rewriting
// them was mandatory in the same commit as the hook change -- the old assertion asserted precisely
// the behaviour being removed, and leaving it would have made one of the two gates a lie.
// The preemption slot (PREEMPT.md) was removed in the same change and has no cases here any more.
//
// Ten cases, each isolated in its own throwaway directory with its own CLAUDE_PROJECT_DIR:
//   1. THE LOOP GATE: (a) a session that changed nothing may stop even with actionable work;
//      (b) a session with uncommitted tracked changes BLOCKS with no PP_BOSUN; (c) PP_BOSUN=1
//      still forces the loop on for an engine that has not changed anything yet.
//   2. PP_BOSUN=1, stop_hook_active=true -> never blocks.
//   3. PP_BOSUN=1, an actionable open Chart item -> blocks, names it.
//   4. PP_BOSUN=1, every open Chart item carries "GATED:" -> does not block (nothing actionable).
//   5. PP_BOSUN=1, the same item blocked 3 times running, no commit landing in between -> blocks
//      on 1/2/3, gives up on the 4th check instead of blocking again.
//   6. PP_BOSUN=1, a commit lands between blocks -> the stuck counter resets, blocks again at 1.
//   7. PP_BOSUN=1, no HEARTBEAT at all -> the publish-lag brake stays silent (nothing pulsed yet).
//   8. PP_BOSUN=1, HEARTBEAT exists, LAST-PUBLISH has never been recorded -> blocks (moved here
//      from npm test by CEO Review 52 -- must never gate the game's own release).
//   9. PP_BOSUN=1, HEARTBEAT far newer than LAST-PUBLISH (past the 20-minute threshold) -> blocks;
//      within the threshold -> does not block for this reason.
//   10. The hook is actually REGISTERED, not just present on disk.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const HOOK = join(REPO_ROOT, ".claude", "hooks", "wyclau-stop-keep-working.cjs");

const failures = [];
let passCount = 0;
function check(label, cond, detail) {
  if (cond) { passCount++; console.log(`PASS -- ${label}`); }
  else { failures.push(`${label}${detail ? `: ${detail}` : ""}`); console.error(`FAIL -- ${label}${detail ? `: ${detail}` : ""}`); }
}

const CHART_ACTIONABLE = `# THE CHART\n\n## STEP 1 CHECKLIST\n\n- [x] done thing\n- [ ] an open, actionable item\n- [ ] a GATED item -- GATED: waiting on him\n`;
const CHART_ALL_GATED = `# THE CHART\n\n## STEP 1 CHECKLIST\n\n- [x] done thing\n- [ ] a GATED item -- GATED: waiting on him\n- [ ] another GATED item -- GATED: same reason\n`;

function mkFixture() {
  const dir = mkdtempSync(join(tmpdir(), "wyclau-stophook-"));
  mkdirSync(join(dir, ".planning", "wyclau"), { recursive: true });
  execFileSync("git", ["init", "-q"], { cwd: dir });
  execFileSync("git", ["config", "user.email", "t@t.t"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "t"], { cwd: dir });
  return dir;
}

function writeChart(dir, content) {
  writeFileSync(join(dir, ".planning", "CHART.md"), content);
}
function writeHeartbeat(dir, isoDate) {
  writeFileSync(join(dir, ".planning", "wyclau", "HEARTBEAT"), `${isoDate}\ttest pulse\n`);
}
function writeLastPublish(dir, isoDate) {
  writeFileSync(join(dir, ".planning", "wyclau", "LAST-PUBLISH"), `${isoDate}\tGlass published\n`);
}
function commit(dir) {
  execFileSync("git", ["add", "-A"], { cwd: dir });
  execFileSync("git", ["commit", "-q", "-m", "fixture"], { cwd: dir });
}

// bosun=true sets PP_BOSUN=1 (the common case for these fixtures); pass false for case 1's own
// red-proof of the gate itself.
function runHook(dir, stdinObj, bosun = true) {
  let out = "";
  const env = { ...process.env, CLAUDE_PROJECT_DIR: dir };
  if (bosun) env.PP_BOSUN = "1"; else delete env.PP_BOSUN;
  try {
    out = execFileSync("node", [HOOK], {
      cwd: dir,
      env,
      input: JSON.stringify(stdinObj),
      encoding: "utf8",
    });
  } catch (e) {
    out = e.stdout ?? "";
  }
  return { out: out.trim() };
}

/* ---- Case 1: THE LOOP GATE, REWRITTEN 2026-09-01 ----
 *
 * ⚠ WHAT THIS ASSERTION USED TO SAY, AND WHY IT HAD TO GO. It read:
 *     "PP_BOSUN unset -> never blocks even with unblocked Chart work present"
 * That was true of the hook as built, and it LOCKED IN the exact fault Wyatt reported on
 * 2026-09-01: "When I intervene with bosun, it stops him from being in a loop." His instruction
 * arrives in a session the watchdog did not start, so the keep-working loop was switched off in
 * the very session carrying his work. The chain audit moved the gate from WHO LAUNCHED THIS to
 * IS THIS SESSION WORKING, and the Quartermaster's handover note was explicit: rewrite this
 * assertion IN THE SAME COMMIT, or the suite contradicts itself and one of the two gates is a lie.
 *
 * The three cases below are the new contract, and 1a is the brake that keeps Wyatt's own terminal
 * usable -- without it this hook would refuse to let any conversation end.
 */
{
  // 1a. A session that changed NOTHING is talking, not working -- it may stop, even with real
  //     actionable work on the Chart. (Clean tree, no HEAD movement, no PP_BOSUN.)
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  const { out } = runHook(dir, {}, false);
  check("a session that changed nothing may stop, even with unblocked Chart work present", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}
{
  // 1b. THE FIX ITSELF: a session that IS working blocks, PP_BOSUN or not. Uncommitted changes to
  //     a TRACKED file are the evidence -- this is the session Wyatt steered, mid-edit.
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  writeFileSync(join(dir, ".planning", "CHART.md"), CHART_ACTIONABLE + "\nedited by this session\n");
  const { out } = runHook(dir, {}, false);
  check(
    "NO PP_BOSUN, but this session has uncommitted work + an actionable item -> BLOCKS (the 2026-09-01 fix)",
    /"decision"\s*:\s*"block"/.test(out), `got stdout: ${out}`
  );
  rmSync(dir, { recursive: true, force: true });
}
{
  // 1c. PP_BOSUN survives as a FORCE-ON, not a gate: a freshly launched engine has committed and
  //     edited nothing yet, and it is exactly the session that must not stop early.
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  const { out } = runHook(dir, {}, true);
  check(
    "PP_BOSUN=1 still forces the loop on for a fresh engine that has not changed anything yet",
    /"decision"\s*:\s*"block"/.test(out), `got stdout: ${out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 2: stop_hook_active guard ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  const { out } = runHook(dir, { stop_hook_active: true });
  check("stop_hook_active=true never blocks", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 3: an actionable open Chart item blocks and is named ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  const { out } = runHook(dir, {});
  let parsed = null;
  try { parsed = JSON.parse(out); } catch {}
  check(
    "PP_BOSUN=1, an actionable open item blocks and names itself",
    parsed && parsed.decision === "block" && /an open, actionable item/.test(parsed.reason),
    `got: ${out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 4: everything GATED -> no block ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED);
  commit(dir);
  const { out } = runHook(dir, {});
  check("every open item GATED -> does not block", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 5: blocks on 1/2/3, gives up on the 4th check (the CEO Review 52 off-by-one fix) ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  const r1 = runHook(dir, {});
  const r2 = runHook(dir, {});
  const r3 = runHook(dir, {});
  const r4 = runHook(dir, {});
  let p1 = null, p2 = null, p3 = null;
  try { p1 = JSON.parse(r1.out); } catch {}
  try { p2 = JSON.parse(r2.out); } catch {}
  try { p3 = JSON.parse(r3.out); } catch {}
  check("block 1 of 3 blocks", p1 && p1.decision === "block" && /Block 1 of 3/.test(p1.reason), `got: ${r1.out}`);
  check("block 2 of 3 blocks", p2 && p2.decision === "block" && /Block 2 of 3/.test(p2.reason), `got: ${r2.out}`);
  check("block 3 of 3 blocks", p3 && p3.decision === "block" && /Block 3 of 3/.test(p3.reason), `got: ${r3.out}`);
  check("the 4th check gives up instead of blocking a 4th time", r4.out === "", `got stdout: ${r4.out}`);
  // CEO Review 53 finding, fixed: a Stop hook exiting 0 (as give-up must) does not feed stderr
  // back to the session -- the ONLY channel that survives the stop is a durable file write.
  let ledgerText = "";
  try { ledgerText = readFileSync(join(dir, ".planning", "CTO-LEDGER.md"), "utf8"); } catch {}
  check(
    "giving up appends a durable ledger line naming the stuck item (stderr alone cannot reach the next session)",
    /KEEP-WORKING STOP HOOK GAVE UP/.test(ledgerText) && ledgerText.includes("an open, actionable item"),
    `got: ${JSON.stringify(ledgerText)}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 6: a commit landing resets the stuck counter ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  commit(dir);
  runHook(dir, {}); // count 1
  runHook(dir, {}); // count 2
  writeFileSync(join(dir, "progress.txt"), "did some work\n");
  commit(dir); // HEAD moves
  const r3 = runHook(dir, {});
  let p3 = null;
  try { p3 = JSON.parse(r3.out); } catch {}
  check(
    "a commit between blocks resets the stuck counter (blocks again at count 1 rather than giving up)",
    p3 && p3.decision === "block" && /Block 1 of 3/.test(p3.reason),
    `got: ${r3.out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 7: no HEARTBEAT at all -> the publish-lag brake stays silent ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED); // nothing else would block either, isolating this brake
  commit(dir);
  const { out } = runHook(dir, {});
  check("no HEARTBEAT -> publish-lag brake does not block", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 8: HEARTBEAT exists, LAST-PUBLISH never recorded -> blocks ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED);
  writeHeartbeat(dir, new Date().toISOString());
  commit(dir);
  const { out } = runHook(dir, {});
  let parsed = null;
  try { parsed = JSON.parse(out); } catch {}
  check(
    "HEARTBEAT exists, LAST-PUBLISH never recorded -> blocks",
    parsed && parsed.decision === "block" && /no publish has ever been recorded/.test(parsed.reason),
    `got: ${out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 9: publish lag past / within the 20-minute threshold ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED);
  const now = Date.now();
  writeHeartbeat(dir, new Date(now).toISOString());
  writeLastPublish(dir, new Date(now - 30 * 60000).toISOString()); // 30 min lag
  commit(dir);
  const rOver = runHook(dir, {});
  let pOver = null;
  try { pOver = JSON.parse(rOver.out); } catch {}
  check(
    "30 min publish lag (over the 20-min threshold) -> blocks",
    pOver && pOver.decision === "block" && /publish lag|newer than the last recorded Glass publish/.test(pOver.reason),
    `got: ${rOver.out}`
  );

  writeLastPublish(dir, new Date(now - 5 * 60000).toISOString()); // 5 min lag
  commit(dir);
  const rUnder = runHook(dir, {});
  check("5 min publish lag (within threshold) -> does not block for this reason", rUnder.out === "", `got: ${rUnder.out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 10: the hook is actually REGISTERED, not just present on disk ----
// The same shape as CEO Review 46's finding on the watchdog work: a hook file that exists but is
// never wired into settings.json's Stop array runs zero times. Read the REAL settings.json.
{
  const settingsRaw = readFileSync(join(REPO_ROOT, ".claude", "settings.json"), "utf8");
  const settings = JSON.parse(settingsRaw);
  const stopHooks = (settings.hooks?.Stop || []).flatMap((g) => g.hooks || []);
  const registered = stopHooks.some((h) => /wyclau-stop-keep-working\.cjs/.test(h.command || ""));
  check("wyclau-stop-keep-working.cjs is registered in settings.json's Stop array", registered);

  // Red-proof this assertion itself: it must be able to fail. A settings.json with no such entry
  // must not pass.
  const fabricated = { hooks: { Stop: [{ hooks: [{ command: "node other.cjs" }] }] } };
  const fabricatedRegistered = (fabricated.hooks?.Stop || []).flatMap((g) => g.hooks || [])
    .some((h) => /wyclau-stop-keep-working\.cjs/.test(h.command || ""));
  check("the registration check can itself fail (red-proof)", fabricatedRegistered === false);

  // The stderr-suppression finding, CEO Review 52: the registration must NOT redirect stderr for
  // this entry, or the give-up brake's message (brake 2) is silently discarded.
  const thisHookEntry = stopHooks.find((h) => /wyclau-stop-keep-working\.cjs/.test(h.command || ""));
  check(
    "the registration does not suppress stderr (2>/dev/null) for this hook",
    !!thisHookEntry && !/2>\s*\/dev\/null/.test(thisHookEntry.command)
  );
}

console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  console.error("\nFAILURES:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
