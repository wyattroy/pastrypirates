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
// Nine cases, each isolated in its own throwaway directory with its own CLAUDE_PROJECT_DIR:
//   1. stop_hook_active=true -> never blocks, whatever else is true.
//   2. PREEMPT.md holds real content -> blocks, names the content, checked BEFORE the Chart.
//   3. PREEMPT.md is the bare template, Chart has one actionable open item -> blocks, names it.
//   4. Every open Chart item carries "GATED:" -> does not block (nothing actionable).
//   5. The same item blocked 3 times running, no commit landing in between -> gives up on the
//      3rd instead of blocking a 4th time.
//   6. A commit lands between blocks -> the stuck counter resets, blocks again at count 1.
//   7. No HEARTBEAT at all -> the publish-lag brake stays silent (nothing pulsed yet).
//   8. HEARTBEAT exists, LAST-PUBLISH has never been recorded -> blocks (moved here from npm
//      test by CEO Review 52 -- must never gate the game's own release).
//   9. HEARTBEAT far newer than LAST-PUBLISH (past the 20-minute threshold) -> blocks; within
//      the threshold -> does not block for this reason.

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
function writePreempt(dir, body) {
  writeFileSync(join(dir, ".planning", "wyclau", "PREEMPT.md"), `<!-- template header -->\n---\n${body}`);
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

function runHook(dir, stdinObj) {
  let out = "";
  let code = 0;
  try {
    out = execFileSync("node", [HOOK], {
      cwd: dir,
      env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
      input: JSON.stringify(stdinObj),
      encoding: "utf8",
    });
  } catch (e) {
    code = e.status ?? 1;
    out = e.stdout ?? "";
  }
  return { out: out.trim(), code };
}

// ---- Case 1: stop_hook_active guard ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  writePreempt(dir, "");
  commit(dir);
  const { out } = runHook(dir, { stop_hook_active: true });
  check("stop_hook_active=true never blocks", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 2: preemption slot blocks, checked before the Chart ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED); // nothing actionable in the Chart at all
  writePreempt(dir, "DROP EVERYTHING: go check the mute button.\n");
  commit(dir);
  const { out } = runHook(dir, {});
  let parsed = null;
  try { parsed = JSON.parse(out); } catch {}
  check(
    "PREEMPT.md content blocks even when the Chart has nothing actionable",
    parsed && parsed.decision === "block" && /mute button/.test(parsed.reason),
    `got: ${out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 3: an actionable open Chart item blocks and is named ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  writePreempt(dir, "");
  commit(dir);
  const { out } = runHook(dir, {});
  let parsed = null;
  try { parsed = JSON.parse(out); } catch {}
  check(
    "an actionable open item blocks and names itself",
    parsed && parsed.decision === "block" && /an open, actionable item/.test(parsed.reason),
    `got: ${out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 4: everything GATED -> no block ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED);
  writePreempt(dir, "");
  commit(dir);
  const { out } = runHook(dir, {});
  check("every open item GATED -> does not block", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 5: give up after 3 blocks on the same item with no commit landing ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  writePreempt(dir, "");
  commit(dir);
  const r1 = runHook(dir, {});
  const r2 = runHook(dir, {});
  const r3 = runHook(dir, {});
  let p1 = null, p2 = null;
  try { p1 = JSON.parse(r1.out); } catch {}
  try { p2 = JSON.parse(r2.out); } catch {}
  check("block 1 of 3 blocks", p1 && p1.decision === "block", `got: ${r1.out}`);
  check("block 2 of 3 blocks", p2 && p2.decision === "block", `got: ${r2.out}`);
  check("block 3 gives up instead of blocking a 4th time", r3.out === "", `got stdout: ${r3.out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 6: a commit landing resets the stuck counter ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ACTIONABLE);
  writePreempt(dir, "");
  commit(dir);
  runHook(dir, {}); // count 1
  runHook(dir, {}); // count 2
  writeFileSync(join(dir, "progress.txt"), "did some work\n");
  commit(dir); // HEAD moves
  const r3 = runHook(dir, {});
  let p3 = null;
  try { p3 = JSON.parse(r3.out); } catch {}
  check(
    "a commit between blocks resets the stuck counter (blocks again rather than giving up)",
    p3 && p3.decision === "block",
    `got: ${r3.out}`
  );
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 7: no HEARTBEAT at all -> the publish-lag brake stays silent ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED); // nothing else would block either, isolating this brake
  writePreempt(dir, "");
  commit(dir);
  const { out } = runHook(dir, {});
  check("no HEARTBEAT -> publish-lag brake does not block", out === "", `got stdout: ${out}`);
  rmSync(dir, { recursive: true, force: true });
}

// ---- Case 8: HEARTBEAT exists, LAST-PUBLISH never recorded -> blocks ----
{
  const dir = mkFixture();
  writeChart(dir, CHART_ALL_GATED);
  writePreempt(dir, "");
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
  writePreempt(dir, "");
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
}

console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  console.error("\nFAILURES:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
