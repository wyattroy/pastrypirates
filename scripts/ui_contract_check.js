#!/usr/bin/env node
// scripts/ui_contract_check.js
//
// The future standing SPLIT-03/05/06 bridge-removal gate (Phase 11 Plan 1, RESEARCH.md Q4).
// Mirrors scripts/net_contract_check.js / scripts/state_contract_check.js / scripts/
// module_graph_check.js's structure: shebang, a header naming what is gated and why, one
// PASS/FAIL line per assertion, every assertion run before exit so a single run reports every
// problem, named failures with file:line, self-exclusion of scripts/. Deliberately NO comment
// stripping anywhere a raw substring/line match is used (the same `://` false-negative
// reconfirmation net_contract_check.js's header performs — index.html and src/net/ both carry
// `https://...` string literals).
//
// ============================================================================
// Why this script is NOT wired into `npm test` yet
// ============================================================================
// Assertions 2 and 3 below assert the PP bridge is GONE and the classic <script> region is
// EMPTY — both are false by construction until every one of the ~183 classic functions has been
// extracted and the bridge deleted, which does not happen until Wave 7 (11-07-PLAN.md). Wiring
// this into `npm test` here would make every intervening plan's test run permanently red for a
// reason that has nothing to do with that plan's own changes — exactly the "weaken the check
// until it stops catching anything real" trap net_contract_check.js's own header warns against.
// Instead, this script is red-proof drilled now (each of the 4 assertions demonstrably fails
// against a SYNTHETIC violation, run with `--drill`, before the real tree is ever checked) and
// wired into `npm test` in 11-07 once the bridge is actually gone.
//
// ============================================================================
// The four assertions (RESEARCH.md Q4)
// ============================================================================
// 1. No src/ui/**/*.js import resolves into src/net/ (D-07, the directional constraint) — raw
//    substring match on `from "..."` / `from '...'` specifiers, no comment-stripping.
// 2. The bridge is gone — no line anywhere under src/ carries the `PP-BRIDGE` tag, and no line
//    anywhere under src/ contains an `Object.assign(globalThis` spread-onto-global-object call.
// 3. No leftover bridge-symbol bare reads — the classic <script> region of index.html (located
//    via the SAME shared tokenizer scripts/lib/js_region_tokenizer.js uses everywhere else in
//    this codebase) contains no non-whitespace code.
// 4. Retained-globals allowlist — the only new non-debug `window.X = ` assignment anywhere under
//    src/ is `window.revealMyRecipe`. The four debug hooks (`__pp_module_ok`/`MODULE_OK_FLAG`,
//    `__pp_boot_count`, `__pp_net_debug`, `__pp_app_state_debug`) are exempt by name — they are
//    documented, permanent observation surfaces, not part of the deleted bridge.
//
// Every check function below takes an explicit root path (defaulting to the real repo ROOT) so
// `--drill` can re-run the exact same logic against synthetic fixture trees under a temp
// directory, never against the real src/ or index.html.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { locateClassicScriptRegion } from "./lib/js_region_tokenizer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REAL_ROOT = path.join(__dirname, "..");

const DEBUG_HOOK_NAMES = ["__pp_module_ok", "__pp_boot_count", "__pp_net_debug", "__pp_app_state_debug"];
const RETAINED_GLOBAL_ALLOWLIST = ["revealMyRecipe", ...DEBUG_HOOK_NAMES];

/* ================= File discovery (never scripts/) ================= */

function jsFilesRecursive(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...jsFilesRecursive(full));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

/* ================= Assertion 1: no src/ui/ -> src/net/ import (D-07) ================= */
const IMPORT_RE = /(?:from\s+|import\()\s*["']([^"']+)["']/g;

function checkNoUiToNetImport(root) {
  const failures = [];
  const uiDir = path.join(root, "src", "ui");
  const netDir = path.join(root, "src", "net");
  for (const file of jsFilesRecursive(uiDir)) {
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      IMPORT_RE.lastIndex = 0;
      let m;
      while ((m = IMPORT_RE.exec(line))) {
        const spec = m[1];
        if (!spec.startsWith(".")) continue;
        const resolved = path.normalize(path.join(path.dirname(file), spec));
        if (resolved === netDir || resolved.startsWith(netDir + path.sep) || resolved.startsWith(netDir)) {
          failures.push(`UI-NO-NET: ${rel}:${i + 1} imports "${spec}", which resolves into src/net/ — ui may never import net (D-07)`);
        }
      }
    });
  }
  return { ok: failures.length === 0, failures };
}

/* ================= Assertion 2: the bridge is gone ================= */
function checkBridgeGone(root) {
  const failures = [];
  const srcDir = path.join(root, "src");
  for (const file of jsFilesRecursive(srcDir)) {
    const rel = path.relative(root, file);
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (line.includes("PP-BRIDGE")) {
        failures.push(`BRIDGE: ${rel}:${i + 1} still carries the "PP-BRIDGE" tag`);
      }
      if (line.includes("Object.assign(globalThis")) {
        failures.push(`BRIDGE: ${rel}:${i + 1} still spreads onto globalThis ("Object.assign(globalThis")`);
      }
    });
  }
  return { ok: failures.length === 0, failures };
}

/* ================= Assertion 3: classic <script> region is empty ================= */
function checkClassicRegionEmpty(root) {
  const failures = [];
  const indexHtml = path.join(root, "index.html");
  if (!fs.existsSync(indexHtml)) {
    failures.push(`REGION: ${path.relative(root, indexHtml)} does not exist`);
    return { ok: false, failures };
  }
  const html = fs.readFileSync(indexHtml, "utf8");
  let region;
  try {
    region = locateClassicScriptRegion(html);
  } catch (err) {
    failures.push(`REGION: could not locate classic <script> region — ${err.message}`);
    return { ok: false, failures };
  }
  if (region.source.trim().length > 0) {
    const nonBlankLines = region.source.split("\n").filter((l) => l.trim().length > 0).length;
    failures.push(`REGION: classic <script> region is not empty — ${nonBlankLines} non-blank line(s) remain`);
  }
  return { ok: failures.length === 0, failures };
}

/* ================= Assertion 4: retained-globals allowlist ================= */
const WINDOW_ASSIGN_RE = /\bwindow\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;

function checkRetainedGlobalsAllowlist(root) {
  const failures = [];
  const srcDir = path.join(root, "src");
  for (const file of jsFilesRecursive(srcDir)) {
    const rel = path.relative(root, file);
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      WINDOW_ASSIGN_RE.lastIndex = 0;
      let m;
      while ((m = WINDOW_ASSIGN_RE.exec(line))) {
        const name = m[1];
        // window[MODULE_OK_FLAG] = true is an indirect assignment (bracket notation via an
        // imported constant), not matched by this regex at all — this only ever sees explicit
        // dot-notation `window.NAME =` assignments, which is exactly what the "new global"
        // surface this assertion polices looks like.
        if (!RETAINED_GLOBAL_ALLOWLIST.includes(name)) {
          failures.push(`RETAINED-GLOBAL: ${rel}:${i + 1} assigns "window.${name}" — not on the retained-globals allowlist (${RETAINED_GLOBAL_ALLOWLIST.join(", ")})`);
        }
      }
    });
  }
  return { ok: failures.length === 0, failures };
}

/* ================= Runner (real tree) ================= */
function runAll(root, { quiet = false } = {}) {
  const log = quiet ? () => {} : (...args) => console.log(...args);
  const results = [];

  const a1 = checkNoUiToNetImport(root);
  log(`${a1.ok ? "PASS" : "FAIL"} no src/ui/**/*.js import resolves into src/net/ (D-07)`);
  results.push({ name: "no-ui-to-net-import", ...a1 });

  const a2 = checkBridgeGone(root);
  log(`${a2.ok ? "PASS" : "FAIL"} the PP bridge is gone (no PP-BRIDGE tag, no Object.assign(globalThis) under src/)`);
  results.push({ name: "bridge-gone", ...a2 });

  const a3 = checkClassicRegionEmpty(root);
  log(`${a3.ok ? "PASS" : "FAIL"} the classic <script> region in index.html is empty`);
  results.push({ name: "classic-region-empty", ...a3 });

  const a4 = checkRetainedGlobalsAllowlist(root);
  log(`${a4.ok ? "PASS" : "FAIL"} retained-globals allowlist — only window.revealMyRecipe (+ the 4 debug hooks) permitted under src/`);
  results.push({ name: "retained-globals-allowlist", ...a4 });

  return results;
}

/* ================= --drill: prove each assertion CAN fail, against synthetic fixtures ================= */
// Builds a disposable fixture tree under os.tmpdir(), one synthetic violation at a time, runs the
// SAME check function against it, and asserts the result is FAIL. Never touches the real src/ or
// index.html. Exits 1 if any assertion fails to demonstrate a FAIL against its own synthetic
// violation (that would mean the check itself is broken, not that the real tree is clean).
function drill() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ui-contract-drill-"));
  let allDrillsOk = true;

  function fixture(relPath, content) {
    const full = path.join(tmpRoot, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  function resetFixture() {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    fs.mkdirSync(tmpRoot, { recursive: true });
  }

  console.log(`Red-proof drill — synthetic fixtures under ${tmpRoot}\n`);

  // --- Drill 1: ui imports net ---
  resetFixture();
  fixture("src/ui/bad.js", `import { netSetFlip } from "../net/index.js";\nexport function bad(){ return netSetFlip; }\n`);
  fixture("src/net/index.js", `export function netSetFlip(){}\n`);
  {
    const r = checkNoUiToNetImport(tmpRoot);
    const drillOk = !r.ok;
    console.log(`${drillOk ? "PASS" : "FAIL"} drill 1/4 (ui-imports-net) — expected FAIL, got ${r.ok ? "PASS" : "FAIL"}`);
    for (const f of r.failures) console.log(`    ${f}`);
    if (!drillOk) allDrillsOk = false;
  }

  // --- Drill 2: bridge still present ---
  resetFixture();
  fixture("src/main.js", `window.PP = {}; // PP-BRIDGE\nObject.assign(globalThis, {});\n`);
  {
    const r = checkBridgeGone(tmpRoot);
    const drillOk = !r.ok;
    console.log(`${drillOk ? "PASS" : "FAIL"} drill 2/4 (bridge-still-present) — expected FAIL, got ${r.ok ? "PASS" : "FAIL"}`);
    for (const f of r.failures) console.log(`    ${f}`);
    if (!drillOk) allDrillsOk = false;
  }

  // --- Drill 3: classic script region non-empty ---
  resetFixture();
  fixture("index.html", `<html><body>\n<script>\nfunction stillHere(){return 1;}\n</script>\n</body></html>\n`);
  {
    const r = checkClassicRegionEmpty(tmpRoot);
    const drillOk = !r.ok;
    console.log(`${drillOk ? "PASS" : "FAIL"} drill 3/4 (classic-region-non-empty) — expected FAIL, got ${r.ok ? "PASS" : "FAIL"}`);
    for (const f of r.failures) console.log(`    ${f}`);
    if (!drillOk) allDrillsOk = false;
  }

  // --- Drill 4: unauthorized retained global ---
  resetFixture();
  fixture("src/main.js", `window.someRandomGlobal = 42;\n`);
  {
    const r = checkRetainedGlobalsAllowlist(tmpRoot);
    const drillOk = !r.ok;
    console.log(`${drillOk ? "PASS" : "FAIL"} drill 4/4 (unauthorized-retained-global) — expected FAIL, got ${r.ok ? "PASS" : "FAIL"}`);
    for (const f of r.failures) console.log(`    ${f}`);
    if (!drillOk) allDrillsOk = false;
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });

  console.log(`\n${allDrillsOk ? "ALL 4 ASSERTIONS RED-PROOF DRILLED OK" : "DRILL FAILURE — an assertion did not fail against its own synthetic violation"}`);
  process.exit(allDrillsOk ? 0 : 1);
}

/* ================= Entry ================= */
if (process.argv.includes("--drill")) {
  drill();
} else {
  const results = runAll(REAL_ROOT);
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error("\nFAILURES:");
    for (const r of failed) for (const f of r.failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  process.exit(0);
}
