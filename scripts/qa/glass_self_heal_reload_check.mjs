#!/usr/bin/env node
// scripts/qa/glass_self_heal_reload_check.mjs
//
// SELF-HEAL, NOT A ROOT-CAUSE FIX. Wyatt, 2026-08-31, live: after submitting an idea the RENDERED
// page corrupted (raw JS source visible as page text); his own "View Page Source" moments later
// showed the STORED HTML was clean. So the corruption lives in one specific render, not in what
// gets saved -- and the exact mechanism could not be root-caused (this repo has no way to drive
// cap.publish() outside the live Claude Artifact host to watch it happen). A real fresh page load
// reads the confirmed-clean stored copy, so scheduling one shortly after every successful publish
// recovers a clean page regardless of what the bug turns out to be. This gate checks the recovery
// is actually wired in, not the (unprovable, from here) root cause.
//
// Checks the REAL generated output, never a copy (HARD-WON-LESSONS §12i).

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const GLASS_MJS = join(REPO_ROOT, "scripts", "wyclau", "glass.mjs");
const OUT = join(REPO_ROOT, ".planning", "wyclau", "glass.html");

execFileSync("node", [GLASS_MJS, "--note", "self-heal reload check"], { cwd: REPO_ROOT });
const html = readFileSync(OUT, "utf8");

const clickIdx = html.indexOf('send.addEventListener("click"');
if (clickIdx === -1) { console.error('FAIL — could not find send.addEventListener("click", ...)'); process.exit(1); }
const sendHandler = html.slice(clickIdx, clickIdx + 3000);

const rulingIdx = html.indexOf("function saveRuling(el, choice){");
if (rulingIdx === -1) { console.error("FAIL — could not find saveRuling(el, choice)"); process.exit(1); }
const rulingHandler = html.slice(rulingIdx, rulingIdx + 2000);

const failures = [];

if (!html.includes("function scheduleSelfHealReload(){")) failures.push("scheduleSelfHealReload() is not defined at all");
if (!/setTimeout\(function\(\)\{\s*location\.reload\(\);\s*\}, ?\d+\)/.test(html)) failures.push("scheduleSelfHealReload() does not schedule a real location.reload() via setTimeout");

// Must fire on the SUCCESS path (inside .then), after the immediate feedback, never inside .catch
// -- a failed publish has nothing clean to reload back to.
const sendThenIdx = sendHandler.indexOf(".then(function(){");
const sendCatchIdx = sendHandler.indexOf(".catch(function(e){");
if (sendThenIdx === -1 || sendCatchIdx === -1 || sendCatchIdx < sendThenIdx) {
  failures.push("send handler: could not locate a .then(...).catch(...) shape to check ordering");
} else {
  const successBody = sendHandler.slice(sendThenIdx, sendCatchIdx);
  const failBody = sendHandler.slice(sendCatchIdx);
  if (!successBody.includes("scheduleSelfHealReload()")) failures.push("send handler: scheduleSelfHealReload() is not called on the SUCCESS path");
  if (failBody.includes("scheduleSelfHealReload()")) failures.push("send handler: scheduleSelfHealReload() must not be called on the FAILURE path");
  // Immediate feedback (Wyatt's explicit requirement) must still happen -- the reload is scheduled,
  // not synchronous, so these must appear BEFORE the schedule call in source order.
  const feedbackMarkers = ['text.value = ""', "renderIdeas()", "send.disabled = false"];
  for (const m of feedbackMarkers) {
    if (!successBody.includes(m)) failures.push(`send handler: missing immediate-feedback step "${m}"`);
  }
  const reloadCallIdx = successBody.indexOf("scheduleSelfHealReload()");
  for (const m of feedbackMarkers) {
    const mi = successBody.indexOf(m);
    if (mi !== -1 && reloadCallIdx !== -1 && mi > reloadCallIdx) {
      failures.push(`send handler: "${m}" runs AFTER scheduleSelfHealReload() is called -- immediate feedback must come first`);
    }
  }
}

const rulingThenIdx = rulingHandler.indexOf(".then(function(){");
const rulingCatchIdx = rulingHandler.indexOf(".catch(function(e){");
if (rulingThenIdx === -1 || rulingCatchIdx === -1 || rulingCatchIdx < rulingThenIdx) {
  failures.push("saveRuling: could not locate a .then(...).catch(...) shape to check ordering");
} else {
  const successBody = rulingHandler.slice(rulingThenIdx, rulingCatchIdx);
  const failBody = rulingHandler.slice(rulingCatchIdx);
  if (!successBody.includes("scheduleSelfHealReload()")) failures.push("saveRuling: scheduleSelfHealReload() is not called on the SUCCESS path");
  if (failBody.includes("scheduleSelfHealReload()")) failures.push("saveRuling: scheduleSelfHealReload() must not be called on the FAILURE path");
}

// The whole document must still contain exactly 2 real script elements (rule from
// glass_script_tag_purity_check.mjs) -- confirm this new code did not introduce a stray one, and
// that it appears correctly ESCAPED inside the embedded TPL copy (proof the two copies stay equal).
const totalOpens = (html.match(/<script/gi) || []).length;
if (totalOpens !== 2) failures.push(`whole document: expected exactly 2 "<script" occurrences, found ${totalOpens}`);
if (!html.includes("scheduleSelfHealReload")) failures.push("scheduleSelfHealReload does not appear anywhere in the output at all");
const occurrences = (html.match(/scheduleSelfHealReload/g) || []).length;
// Expect it in: the definition, the two call sites, all THREE echoed a second time inside the
// escaped TPL copy = 6 total. Fewer means the embedded self-publish copy fell out of sync with
// the live copy, which is exactly the kind of drift rule 23 (ONE DISPLAY PATH) warns against.
if (occurrences < 6) failures.push(`scheduleSelfHealReload appears only ${occurrences} times -- expected at least 6 (3 in the live script, 3 echoed in the embedded self-publish TPL copy); the two may have fallen out of sync`);

if (failures.length) {
  console.error("FAIL — glass self-heal reload check");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("PASS — a successful publish (idea or ruling) keeps Wyatt's immediate feedback, then schedules a real reload that recovers a confirmed-clean render");
process.exit(0);
