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
// Wired into `npm test` as of 11-07
// ============================================================================
// Assertions 2 and 3 below assert the PP bridge is GONE and the classic <script> region is
// EMPTY — both were false by construction until every one of the ~183 classic functions was
// extracted and the bridge deleted, which did not happen until Wave 7 (11-07-PLAN.md). Wiring
// this into `npm test` any earlier would have made every intervening plan's test run
// permanently red for a reason that had nothing to do with that plan's own changes — exactly the
// "weaken the check until it stops catching anything real" trap net_contract_check.js's own
// header warns against. This script was red-proof drilled first (each of the 4 assertions
// demonstrably fails against a SYNTHETIC violation, run with `--drill`, before the real tree was
// ever checked) and is now wired into `npm test`, immediately after `module_graph_check.js`, now
// that the bridge is actually gone and all 4 assertions are expected to PASS.
//
// Note: `checkClassicRegionEmpty` (assertion 3) relies on
// scripts/lib/js_region_tokenizer.js's `locateClassicScriptRegion` treating "no bare <script>
// tag found at all" as the empty-region terminal state (11-07 also deletes the tag pair itself,
// per D-08) rather than throwing — see that function's own header for the full account.
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
// 5. The D-29 pirate register (added 2026-07-29) — no player-facing string under src/ or in
//    index.html reads the pre-conversion 2nd-person pronouns, plus the `layout` intactness probe
//    that conversion's own hazard demands. See the block below for why this is a STANDING gate.
//
// ============================================================================
// Assertion 5 — why the D-29 register is gated rather than swept (2026-07-29)
// ============================================================================
// D-29 was originally a one-time manual sweep with nothing enforcing it afterwards. Half of it
// silently did not happen: 15 strings under src/ and 17 lines in index.html kept the old register
// for a full phase, and no gate noticed. 15-VERIFICATION.md's Gap 2 is that miss. A one-time sweep
// is not a contract; this assertion makes it one.
//
// The conversion itself is NOT shipped as runtime code. art-review/narration-audit.html's own
// PIRATE_RE/PIRATE_MAP/pirateVoice() applied the substitution LIVE at render, so it is the
// specification — but exporting a pirateVoice() from src/ that nothing calls would ship dead code,
// which D-33/D-34/D-40 spent three decisions stamping out. The source literals are plain, and this
// assertion is what proves they stay converted.
//
// The `layout` probe rides along in the same assertion because it is the hazard that makes this
// conversion dangerous: a bare substring replace of the 3-letter pronoun turns `layout` into
// `layet`, and `layoutWide`, `youIdx`, `stillDockedYou`, `bonusYou` and `outcomeYou` are all in
// the tree. Word-boundary matching rejects every one, and this probe proves it stayed that way.
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

/* ================= Assertion 5: the D-29 pirate register (standing) ================= */
// IMPORTED, not re-declared. This assertion and the audit page's own pirateVoice() were expressing
// the SAME word list two different ways — a substitution map here, a detector there — which is one
// spec in two places, and this file's own header had to point at the page to say where the spec
// lived. Both now come from art-review/narration-core.js, the single declaration site: PIRATE_RE /
// PIRATE_MAP do the substitution, PRONOUN_RE is the detector. Case-insensitive, because
// pirateVoice() is case-preserving, so `You` and `Your` are equally in scope.
//
// The core is REVIEW TOOLING and importing it here is safe in the one direction that matters: a
// gate may read the review tool's spec, but nothing under src/ or in index.html may import the core
// (narration_audit_check.js asserts that in both directions), so no player-facing code depends on it.
const { PRONOUN_RE } = await import("../art-review/narration-core.js");

// ---------------------------------------------------------------------------
// EXCLUSIONS — explicit and individually justified. NEVER widen this list to make a run go green;
// that is the "weaken the check until it stops catching anything real" trap this file's own header
// warns about. Every entry is anchored on CONTENT, never on a line number, so a line shift makes
// the gate go loud rather than silently letting a new site through (the drift mechanism that broke
// scripts/extract_narration_lines.js's AD_HOC_META twice).
// ---------------------------------------------------------------------------
const REGISTER_SKIP_FILES = [
  // comments only, and the file must keep an EMPTY diff — it is the determinism fixture corpus's
  // single source of truth (docs/DETERMINISM-RERECORD.md). Touching it invalidates all 31 seeds.
  path.join("src", "engine", "index.js"),
  // cookbook prose — recipe descriptions and cooking-method text ("melt-in-your-mouth shortbread",
  // "run your thumb around the inside rim"). Arguably a diegetic object with its own register: the
  // recipe card the captain is HOLDING, not the game's narrator speaking. That is a copy judgment
  // only Wyatt can make, so it is deferred to him.
  // >>> REMOVE THIS EXCLUSION THE MOMENT HE RULES. If he says convert, it is a 3-line follow-up.
  path.join("src", "ui", "recipe.js"),
];

// Whole-line content anchors: the line is excluded wherever it appears in the tree.
const REGISTER_LINE_ANCHORS = [
  // src/orchestrator.js — a block-comment CONTINUATION line, so it does not start with a comment
  // marker and the leading-comment filter cannot see it. D-29 excludes comments.
  "ONLINE_SETUP.md",
  // src/ui/flow.js — a TRAILING comment on a line of real code, likewise invisible to the
  // leading-comment filter. Also a comment.
  "entering the trade winds",
  // index.html — the credits / acknowledgements paragraph. Wyatt's own authorial prose about real
  // people (Luca, Amelia, Nick Lesko, Luis Zanforlin, his parents, Xavaar, Juju), not the game
  // addressing a player. Converting it would put pirate voice in his personal thank-yous.
  // Also raised for his ruling; recommendation is to LEAVE it.
  "overly enthusiastic noodle",
];

// src/ui/util.js's `sidebet` builder uses `you` as a LOCAL VARIABLE NAME (D-08's viewer flag), not
// as copy. These are the only four places it appears as an identifier; each is a read, none is
// player-facing text. Scoped to that one file so the fragments can never excuse a real string
// somewhere else, and anchored on the exact code shape so a reformat goes loud.
const REGISTER_IDENT_FILE = path.join("src", "ui", "util.js");
const REGISTER_IDENT_FRAGMENTS = ["const you=isLocalTo(", "?(you?`", ":(you?`", "txt:you"];

// A leading-comment line, in either JS (`//`) or CSS/JSDoc (`/*`, `*`) form. index.html's two
// excluded CSS comments — the shot-clock width reservation at :377 and the "you just lost treasure"
// pop note at :425 — are both caught here by construction, not by a special case.
const isLeadingComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line);

function scanRegisterFile(rel, content) {
  const failures = [];
  content.split("\n").forEach((line, i) => {
    if (!PRONOUN_RE.test(line)) return;
    if (isLeadingComment(line)) return;
    if (REGISTER_LINE_ANCHORS.some((a) => line.includes(a))) return;
    if (rel === REGISTER_IDENT_FILE && REGISTER_IDENT_FRAGMENTS.some((f) => line.includes(f))) return;
    failures.push(`D-29-REGISTER: ${rel}:${i + 1} — a player-facing string still reads the pre-conversion 2nd-person register; convert it to ye/yer (art-review/narration-audit.html's PIRATE_MAP is the spec)`);
  });
  return failures;
}

// The `layout` landmine probe. Two parts, deliberately different in kind:
//   - the corruption marker (`layet`) is checked wherever it can appear — a bare substring replace
//     of the pronoun is the only thing that produces it, so any hit is proof of exactly that bug.
//   - the `layoutWide` counts are pinned per file. If a future change legitimately adds or removes
//     a usage, UPDATE THE EXPECTED COUNT — do not delete the probe.
const LAYOUT_WIDE_EXPECTED = [
  { rel: "index.html", count: 4 },
  { rel: path.join("src", "ui", "board.js"), count: 1 },
];

function checkPirateRegister(root) {
  const failures = [];
  const skip = new Set(REGISTER_SKIP_FILES);
  const targets = [];

  for (const file of jsFilesRecursive(path.join(root, "src"))) {
    const rel = path.relative(root, file);
    if (skip.has(rel)) continue;
    targets.push([rel, file]);
  }
  const indexHtml = path.join(root, "index.html");
  if (fs.existsSync(indexHtml)) targets.push(["index.html", indexHtml]);

  for (const [rel, full] of targets) {
    const content = fs.readFileSync(full, "utf8");
    failures.push(...scanRegisterFile(rel, content));
    // corruption marker — checked on the SAME set of files, comments included (a `layet` in a
    // comment is still evidence the bare replace ran)
    content.split("\n").forEach((line, i) => {
      if (line.includes("layet")) {
        failures.push(`LAYOUT-CORRUPTION: ${rel}:${i + 1} contains "layet" — a bare substring replace of the 2nd-person pronoun corrupted the word "layout"`);
      }
    });
  }

  for (const { rel, count } of LAYOUT_WIDE_EXPECTED) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue; // absent in a synthetic drill fixture; nothing to pin
    const actual = (fs.readFileSync(full, "utf8").match(/layoutWide/g) || []).length;
    if (actual !== count) {
      failures.push(`LAYOUT-WIDE-COUNT: ${rel} has ${actual} "layoutWide" occurrence(s), expected ${count} — if this change was intentional, update LAYOUT_WIDE_EXPECTED in scripts/ui_contract_check.js; if it was not, the word-boundary rule was violated`);
    }
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

  const a5 = checkPirateRegister(root);
  log(`${a5.ok ? "PASS" : "FAIL"} the D-29 pirate register holds across src/ and index.html (+ the layout intactness probe)`);
  results.push({ name: "pirate-register", ...a5 });

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

  // --- Drill 5: the D-29 register. Three distinct failure modes, so three synthetic violations,
  //     plus one NEGATIVE fixture proving the exclusions do not simply swallow everything (an
  //     assertion that can only ever pass is not a gate either).
  {
    // 5a: an unconverted player-facing string under src/
    resetFixture();
    fixture("src/ui/prompt.js", "export const msg = `Cast your line — flip!`;\n");
    {
      const r = checkPirateRegister(tmpRoot);
      const drillOk = !r.ok;
      console.log(`${drillOk ? "PASS" : "FAIL"} drill 5a/5 (unconverted-register-in-src) — expected FAIL, got ${r.ok ? "PASS" : "FAIL"}`);
      for (const f of r.failures) console.log(`    ${f}`);
      if (!drillOk) allDrillsOk = false;
    }

    // 5b: an unconverted player-facing line in index.html
    resetFixture();
    fixture("index.html", `<html><body>\n<label>Your captain name</label>\n</body></html>\n`);
    {
      const r = checkPirateRegister(tmpRoot);
      const drillOk = !r.ok;
      console.log(`${drillOk ? "PASS" : "FAIL"} drill 5b/5 (unconverted-register-in-index-html) — expected FAIL, got ${r.ok ? "PASS" : "FAIL"}`);
      for (const f of r.failures) console.log(`    ${f}`);
      if (!drillOk) allDrillsOk = false;
    }

    // 5c: the layout landmine detonated — a bare substring replace produced "layet"
    resetFixture();
    fixture("src/ui/board.js", "const layetWide = 1; // was layoutWide before a bare replace\n");
    {
      const r = checkPirateRegister(tmpRoot);
      const drillOk = !r.ok && r.failures.some((f) => f.startsWith("LAYOUT-CORRUPTION"));
      console.log(`${drillOk ? "PASS" : "FAIL"} drill 5c/5 (layout-corruption) — expected FAIL naming LAYOUT-CORRUPTION, got ${r.ok ? "PASS" : "FAIL"}`);
      for (const f of r.failures) console.log(`    ${f}`);
      if (!drillOk) allDrillsOk = false;
    }

    // 5d: the layoutWide count drifted (index.html present, but with 3 occurrences instead of 4)
    resetFixture();
    fixture("index.html", `<html><body>\n<!-- layoutWide layoutWide layoutWide -->\n</body></html>\n`);
    {
      const r = checkPirateRegister(tmpRoot);
      const drillOk = !r.ok && r.failures.some((f) => f.startsWith("LAYOUT-WIDE-COUNT"));
      console.log(`${drillOk ? "PASS" : "FAIL"} drill 5d/5 (layoutWide-count-drift) — expected FAIL naming LAYOUT-WIDE-COUNT, got ${r.ok ? "PASS" : "FAIL"}`);
      for (const f of r.failures) console.log(`    ${f}`);
      if (!drillOk) allDrillsOk = false;
    }

    // 5e: NEGATIVE control — a converted string, a leading comment carrying the old register, an
    //     anchored comment, and the sidebet identifier must ALL pass. This proves 5a-5d fail for
    //     the right reason rather than the check being unconditionally red.
    resetFixture();
    fixture("src/ui/prompt.js", "export const msg = `Cast yer line — flip!`;\n// this comment mentions your pantry and is excluded because D-29 excludes comments\n");
    fixture("src/ui/flow.js", "if (onRim(c)) continue; // entering the trade winds ends your move\n");
    // the sidebet builder's real code shape, fragment-for-fragment — an unfaithful fixture here
    // would let a broken exclusion pass this control unnoticed
    fixture("src/ui/util.js", [
      "    const you=isLocalTo(e.p,viewerSeat);",
      "    if(e.won)return {cls:\"trade\",txt:e.amt",
      "      ?(you?`ye called it! (+${e.delta})`:`called it! (+${e.delta})`)",
      "      :(you?`ye called it!`:`called it!`)};",
      "    return {cls:\"trade\",txt:you",
      "      ?`ye backed the wrong ship`:`backed the wrong ship`};",
      "",
    ].join("\n"));
    fixture("src/ui/recipe.js", "export const d = 'melt-in-your-mouth shortbread';\n");
    {
      const r = checkPirateRegister(tmpRoot);
      const drillOk = r.ok;
      console.log(`${drillOk ? "PASS" : "FAIL"} drill 5e/5 (negative control — exclusions hold) — expected PASS, got ${r.ok ? "PASS" : "FAIL"}`);
      for (const f of r.failures) console.log(`    ${f}`);
      if (!drillOk) allDrillsOk = false;
    }
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });

  console.log(`\n${allDrillsOk ? "ALL 5 ASSERTIONS RED-PROOF DRILLED OK" : "DRILL FAILURE — an assertion did not fail against its own synthetic violation"}`);
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
