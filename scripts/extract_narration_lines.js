#!/usr/bin/env node
// scripts/extract_narration_lines.js
//
// NARR-01 (D-01/D-02/D-03/D-05): the machine-generated inventory the narration audit page
// (art-review/narration-audit.html) consumes for its ad-hoc (non-table) cards. Walks BOTH
// narration sources so "did we miss a line?" is mechanically answerable instead of trusted:
//   - TABLE source: imports the real EVENT_NARRATION from src/ui/util.js (so the key list can
//     never drift from what ships) and records each key's declaration line + a moment-group label.
//   - AD-HOC source: reads src/ui/flow.js, src/orchestrator.js and src/ui/util.js as text and
//     locates every flash(/onFlash( call site (skipping comment-only lines), extracting the raw
//     first-argument source text and the raw 4th-argument (variants array) source text, tagging
//     each call TABLE-DRIVEN (its message comes from describeFor(...)/a table lookup, e.g. `L.txt`
//     or `describe(...).txt` — not new copy) or genuinely AD-HOC.
//
// Determinism is a requirement: table entries in EVENT_NARRATION's own declaration order, ad-hoc
// entries sorted by file path then ascending line number, and the written JSON has a fixed key
// order per object (built the same way every run) — so two runs produce byte-identical output.
//
// Self-check: an independent, simpler pass counts flash(/onFlash( occurrences (also skipping
// comment-only lines) per file and must agree with the structured extraction's own count, or the
// script fails loudly with a named diff and writes nothing. This is the actual mechanism that
// makes "did we miss a line?" answerable — a silent extraction bug would otherwise just produce a
// short inventory that looks complete.
//
// Convention (matches determinism_baseline.js/hail_ranking_test.js/bot_storm_narration_test.js/
// narration_test.js): no assertion library, plain console.log, process.exit(failures?1:0).
//
// Deliberately NOT wired into npm test (see this plan's own hard_constraint): this is a
// review-time tool, and plan 15-06 will legitimately shrink the line count once Wyatt's cuts are
// applied — a permanent floor gate here would go red for the right reason at the wrong time.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { EVENT_NARRATION } from "../src/ui/util.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FILE_PATHS = {
  util: "src/ui/util.js",
  flow: "src/ui/flow.js",
  orch: "src/orchestrator.js",
};
const src = {};
for (const [k, rel] of Object.entries(FILE_PATHS)) src[k] = readFileSync(join(ROOT, rel), "utf8");

let failures = 0;
function fail(msg) { failures++; console.error("FAIL: " + msg); }

/* ================= table source (EVENT_NARRATION) ================= */

// D-01's eight named groups, plus one extra (Claude's Discretion, flagged in 15-PATTERNS.md) for
// lines that belong to none of them — sailing/movement, exactly as the pattern map anticipated.
const TABLE_GROUPS = {
  newround: "Round Header",
  windmove: "Storm",
  blownOut: "Storm",
  sail: "Sailing & Movement",
  dodge: "Storm",
  anchor: "Storm",
  moored: "Storm",
  blocked: "Sailing & Movement",
  anchorHold: "Storm",
  tradewind: "Storm",
  parley: "Trade & Parley",
  aground: "Storm",
  shipwrecked: "Storm",
  dock: "Docking",
  trade: "Trade & Parley",
  sidebet: "Battle",
  battle: "Battle",
  battleflee: "Battle",
  fish: "Fishing",
  finish: "End of Voyage",
  shotclock: "Shot Clock",
  shotclockskip: "Shot Clock",
  bakeoff: "End of Voyage",
  end: "End of Voyage",
  turn: "Sailing & Movement",
};

function findKeyLine(fileSrc, key) {
  const re = new RegExp(`^  ${key}:`, "m");
  const m = re.exec(fileSrc);
  if (!m) return null;
  return fileSrc.slice(0, m.index).split("\n").length;
}

const tableKeys = Object.keys(EVENT_NARRATION); // declaration order, straight from the real table
const table = tableKeys.map((key) => {
  const line = findKeyLine(src.util, key);
  if (line == null) fail(`table key "${key}" has no matching "  ${key}:" declaration line in ${FILE_PATHS.util}`);
  if (!(key in TABLE_GROUPS)) fail(`table key "${key}" has no TABLE_GROUPS entry — extraction script's own map is stale`);
  return { key, file: FILE_PATHS.util, line: line || 0, group: TABLE_GROUPS[key] || "Sailing & Movement" };
});

/* ================= ad-hoc source (flash()/onFlash() call sites) ================= */

// last function-declaration line at or before a given line, so a call site's enclosing function
// can be reported without a heavier real parser
function functionBoundaries(fileSrc) {
  const lines = fileSrc.split("\n");
  const marks = [];
  const re = /^(export\s+)?(async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/;
  lines.forEach((line, i) => {
    const m = re.exec(line);
    if (m) marks.push({ line: i + 1, name: m[3] });
  });
  return marks;
}
function enclosingFunction(marks, line) {
  let name = "(module scope)";
  for (const m of marks) {
    if (m.line <= line) name = m.name;
    else break;
  }
  return name;
}

// String/template-literal-aware balanced-delimiter scan: given `text` and the index of an opening
// "(", returns the substring between it and its matching ")" — needed because call-site arguments
// routinely contain nested parens/brackets/braces and template literals with ${...} interpolation
// (e.g. the turn banner at flow.js:613), which a naive indexOf(")") would cut short.
function extractBalanced(text, openIdx) {
  let depth = 1, i = openIdx + 1;
  let inString = null, inTemplate = false;
  const start = i;
  for (; i < text.length && depth > 0; i++) {
    const c = text[i], prev = text[i - 1];
    if (inString) { if (c === inString && prev !== "\\") inString = null; continue; }
    if (inTemplate) { if (c === "`" && prev !== "\\") inTemplate = false; continue; }
    if (c === "'" || c === '"') { inString = c; continue; }
    if (c === "`") { inTemplate = true; continue; }
    if (c === "(" || c === "[" || c === "{") { depth++; continue; }
    if (c === ")" || c === "]" || c === "}") { depth--; if (depth === 0) break; continue; }
  }
  return text.slice(start, i);
}
// splits a call's argument-list text on top-level commas only (never inside nested
// parens/brackets/braces/strings/templates) so `flash(a, b, c, [{...}])`'s 4th arg comes back whole
function splitTopLevelArgs(argsText) {
  const args = [];
  let depth = 0, inString = null, inTemplate = false, cur = "";
  for (let i = 0; i < argsText.length; i++) {
    const c = argsText[i], prev = argsText[i - 1];
    if (inString) { cur += c; if (c === inString && prev !== "\\") inString = null; continue; }
    if (inTemplate) { cur += c; if (c === "`" && prev !== "\\") inTemplate = false; continue; }
    if (c === "'" || c === '"') { inString = c; cur += c; continue; }
    if (c === "`") { inTemplate = true; cur += c; continue; }
    if (c === "(" || c === "[" || c === "{") { depth++; cur += c; continue; }
    if (c === ")" || c === "]" || c === "}") { depth--; cur += c; continue; }
    if (c === "," && depth === 0) { args.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim() !== "") args.push(cur.trim());
  return args;
}
function isCommentLine(fileSrc, lineNo) {
  const lineText = fileSrc.split("\n")[lineNo - 1] || "";
  return /^\s*\/\//.test(lineText);
}
// a call whose message argument is literally the table's own rendered text (via describeFor's
// `L.txt`, or a direct `describe(...).txt`) carries no new copy of its own — labelled
// table-driven per this plan's own instruction, not counted as an ad-hoc line to review.
function isTableDrivenArg(raw) {
  return raw === "L.txt" || /^describe\([\s\S]*\)\.txt$/.test(raw);
}

function findCallSites(fileSrc, filePath) {
  const marks = functionBoundaries(fileSrc);
  const sites = [];
  const callRe = /\b(flash|onFlash)\s*\(/g;
  let m;
  while ((m = callRe.exec(fileSrc))) {
    const idx = m.index;
    const lineNo = fileSrc.slice(0, idx).split("\n").length;
    if (isCommentLine(fileSrc, lineNo)) continue;
    const openParenIdx = idx + m[0].length - 1;
    const argsText = extractBalanced(fileSrc, openParenIdx);
    const args = splitTopLevelArgs(argsText);
    const rawNeutral = args[0] || "";
    const rawVariants = args.length >= 4 ? args[3] : null;
    sites.push({
      file: filePath,
      line: lineNo,
      fn: enclosingFunction(marks, lineNo),
      rawNeutral,
      rawVariants,
      tableDriven: isTableDrivenArg(rawNeutral),
    });
  }
  return sites;
}

// Curated per-call-site metadata: moment group, a short human label, and a default keep/cut/
// merge/rewrite recommendation the audit page shows (and Wyatt can override). Biased toward
// "keep"/"rewrite" over "cut" per D-06 — see this plan's own header paragraph in the page.
// Keyed by "file:line" so a call site the extraction finds with no matching entry here fails the
// self-check loudly instead of silently guessing (a real safeguard: if a future edit adds/removes
// a flash() site, this table goes stale and the script says so instead of drifting quietly).
const AD_HOC_META = {
  "src/ui/flow.js:111": { fn: "humanFlip", group: "Docking", tag: "keep", label: "Coin-flip announcement (generic — used at docking/anchor moments)" },
  "src/ui/flow.js:260": { fn: "windLeg", group: "Storm", tag: "keep", label: "Broke — can't afford to anchor (D-11/NARR-02, new this phase)" },
  "src/ui/flow.js:296": { fn: "windLeg", group: "Storm", tag: "merge", mergeWith: ["src/ui/flow.js:571", "src/ui/flow.js:645"], label: "Trade-wind rim sweep (windLeg leg)" },
  "src/ui/flow.js:333": { fn: "botWindLeg", group: "Storm", tag: "keep", label: "Bot per-square storm outcome — table pass-through, not new copy" },
  "src/ui/flow.js:352": { fn: "botWindLeg", group: "Storm", tag: "keep", label: "Bot storm-leg summary — table pass-through, not new copy" },
  "src/ui/flow.js:373": { fn: "humanWind", group: "Storm", tag: "rewrite", label: "Second storm leg direction (human) — always renders \"you\" unconditionally, no viewer branch (discovered gap, 15-03 SUMMARY)" },
  "src/ui/flow.js:410": { fn: "humanTrade", group: "Trade & Parley", tag: "keep", label: "No cargo to trade for" },
  "src/ui/flow.js:516": { fn: "humanTrade", group: "Trade & Parley", tag: "keep", label: "Trade refusal (D-08, new addressed copy this phase)" },
  "src/ui/flow.js:524": { fn: "humanTrade", group: "Trade & Parley", tag: "keep", label: "Simple decline (D-08, new addressed copy this phase)" },
  "src/ui/flow.js:571": { fn: "humanAct", group: "Storm", tag: "merge", mergeWith: ["src/ui/flow.js:296", "src/ui/flow.js:645"], label: "Trade-wind rim sweep (move-instead path)" },
  "src/ui/flow.js:574": { fn: "humanAct", group: "Sailing & Movement", tag: "keep", label: "Start the bakery" },
  "src/ui/flow.js:582": { fn: "humanAct", group: "Battle", tag: "keep", label: "Can't afford powder" },
  "src/ui/flow.js:613": { fn: "humanTurn", group: "Round Header", tag: "rewrite", label: "Per-turn banner + storm intro (NARR-03, rewritten this phase)" },
  "src/ui/flow.js:640": { fn: "humanTurn", group: "Sailing & Movement", tag: "keep", label: "Leeward warning" },
  "src/ui/flow.js:645": { fn: "humanTurn", group: "Storm", tag: "merge", mergeWith: ["src/ui/flow.js:296", "src/ui/flow.js:571"], label: "Trade-wind rim sweep (post-sail)" },
  "src/ui/flow.js:646": { fn: "humanTurn", group: "Sailing & Movement", tag: "keep", label: "Broke — can't afford to sail, human (D-11/NARR-02, new this phase)" },
  "src/ui/flow.js:702": { fn: "botTurn", group: "Storm", tag: "keep", label: "Second storm leg direction (bot)" },
  "src/ui/flow.js:722": { fn: "botTurn", group: "Sailing & Movement", tag: "keep", label: "Broke — can't afford to sail, bot (D-11/NARR-02, new this phase — the likely source of the reported \"broke bot forgets its turn\")" },
  "src/ui/flow.js:901": { fn: "collectSideBets", group: "Battle", tag: "keep", label: "Side bet — backed with coin (D-08)" },
  "src/ui/flow.js:902": { fn: "collectSideBets", group: "Battle", tag: "keep", label: "Side bet — free call (D-08)" },
  "src/ui/flow.js:928": { fn: "settleSideBets", group: "Battle", tag: "keep", label: "Side-bet settlement (aggregate line covering every bettor — no per-viewer variant)" },
  "src/orchestrator.js:391": { fn: "asyncBattle", group: "Battle", tag: "keep", label: "Battle opening announcement (D-08)" },
  "src/orchestrator.js:699": { fn: "runLiveNet", group: "Round Header", tag: "keep", label: "Round-header flash — table pass-through, not new copy" },
  "src/orchestrator.js:720": { fn: "runLiveNet", group: "Round Header", tag: "keep", label: "Final-round header flash — table pass-through, not new copy" },
  "src/orchestrator.js:754": { fn: "liveResolveEndNet", group: "End of Voyage", tag: "keep", label: "Nobody finished the voyage — no changes this phase (Phase 16's UI-07 owns box visibility)" },
  "src/orchestrator.js:758": { fn: "liveResolveEndNet", group: "End of Voyage", tag: "keep", label: "Victory box — no changes this phase (Phase 16's UI-07 owns box visibility)" },
  "src/ui/util.js:874": { fn: "narrateCurrent", group: "Sailing & Movement", tag: "keep", label: "Bot turn-start banner (D-07, new addressed copy this phase)" },
  "src/ui/util.js:878": { fn: "narrateCurrent", group: "Sailing & Movement", tag: "keep", label: "Bot event narration — table pass-through, not new copy" },
};

function applyMeta(sites) {
  return sites.map((s) => {
    const key = `${s.file}:${s.line}`;
    const meta = AD_HOC_META[key];
    if (!meta) {
      fail(`no AD_HOC_META entry for ${key} (enclosing fn "${s.fn}") — extraction found a flash()/onFlash() call site this script's own metadata table doesn't know about yet; add it to AD_HOC_META`);
    }
    return {
      file: s.file,
      line: s.line,
      fn: s.fn,
      tableDriven: s.tableDriven,
      group: (meta && meta.group) || "Sailing & Movement",
      label: (meta && meta.label) || "(unlabeled — see AD_HOC_META)",
      defaultTag: (meta && meta.tag) || "keep",
      mergeWith: (meta && meta.mergeWith) || null,
      rawNeutral: s.rawNeutral,
      rawVariants: s.rawVariants,
    };
  });
}

const flowSites = findCallSites(src.flow, FILE_PATHS.flow);
const orchSites = findCallSites(src.orch, FILE_PATHS.orch);
const utilSites = findCallSites(src.util, FILE_PATHS.util);

const adhoc = [...applyMeta(flowSites), ...applyMeta(orchSites), ...applyMeta(utilSites)]
  .sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));

/* ================= self cross-check (independent second pass) ================= */

function independentCount(fileSrc) {
  const kept = fileSrc
    .split("\n")
    .filter((line) => !/^\s*\/\//.test(line))
    .join("\n");
  const m = kept.match(/\b(flash|onFlash)\s*\(/g);
  return m ? m.length : 0;
}
function crossCheck(name, fileSrc, structuredCount) {
  const simple = independentCount(fileSrc);
  if (simple !== structuredCount) {
    fail(`${name}: structured extraction found ${structuredCount} flash()/onFlash() call site(s) but the independent count found ${simple} — named diff, extraction is unreliable`);
  }
  return simple;
}
crossCheck(FILE_PATHS.flow, src.flow, flowSites.length);
crossCheck(FILE_PATHS.orch, src.orch, orchSites.length);
crossCheck(FILE_PATHS.util, src.util, utilSites.length);

if (Object.keys(EVENT_NARRATION).length !== table.length) {
  fail(`EVENT_NARRATION has ${Object.keys(EVENT_NARRATION).length} keys but the table array built ${table.length} entries`);
}

/* ================= summary + write ================= */

const tableCount = table.length;
const adhocCount = adhoc.length;
const total = tableCount + adhocCount;

console.log(`table entries:  ${tableCount}`);
console.log(`ad-hoc entries: ${adhocCount} (${adhoc.filter((a) => a.tableDriven).length} table-driven pass-through, ${adhoc.filter((a) => !a.tableDriven).length} genuine ad-hoc)`);
console.log(`total:          ${total}`);

// the corrected pre-change surface count from 15-RESEARCH.md — plans 15-03/15-04 can only raise
// this (new brokeSailLine/brokeAnchorLine/stormIntroClause call sites), never lower it
if (total < 49) fail(`total ${total} is below the corrected pre-change floor of 49`);

if (failures) {
  console.error(`\n${failures} check(s) FAILED — art-review/narration-inventory.json NOT written.`);
  process.exit(1);
}

const inventory = { table, adhoc };
writeFileSync(
  join(ROOT, "art-review/narration-inventory.json"),
  JSON.stringify(inventory, null, 2) + "\n",
);
console.log("wrote art-review/narration-inventory.json");
process.exit(0);
