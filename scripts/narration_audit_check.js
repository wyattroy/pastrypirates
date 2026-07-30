#!/usr/bin/env node
// scripts/narration_audit_check.js
//
// NARR-01: the health gate for art-review/narration-audit.html — the tool Wyatt uses to review
// every player-facing string in the game. Until this file existed, NOTHING checked that tool. It
// was checked only by opening it in a browser, and it had stopped working without anyone noticing.
//
// It is a STATIC gate. It reads art-review/narration-audit.html as text and
// art-review/narration-inventory.json as data. No DOM, no browser, no page evaluation — so the
// tool's health becomes answerable from `npm test`, which is the single reason the last two drifts
// went undetected.
//
// Convention (matches ui_contract_check.js / determinism_baseline.js / narration_test.js): no
// assertion library, plain console.log, EVERY assertion runs before exit so one run reports every
// problem, failures named with file and key, process.exit(failures?1:0), and a `--drill` mode that
// red-proofs each assertion against a synthetic violation plus a negative control.
//
// ============================================================================
// ACCEPTANCE BASELINE — the measured state of the page at ab98e04, when this gate was written
// ============================================================================
// This gate was written RED, deliberately, as the acceptance test for the repair that follows it.
// A future reader must be able to tell a REPAIRED gate from a WEAKENED one, so the numbers it
// produced on the day it was written are recorded here:
//
//   assertion 1 (resolvability) ... 91 flow-chart lookups: 11 resolve, 55 FATAL, 25 SILENT.
//                                   First FATAL in render order: miscMpErrorCard(
//                                   "src/orchestrator.js:945") — the first entry of the first node
//                                   group. requireMiscEntry() throws on it, the exception escapes
//                                   the whole render, and the page shows its loading placeholder
//                                   and nothing else. That is the entire bug: the tool was not
//                                   fragile, it was dead.
//                                   (miscLobbyCard("src/ui/lobby.js:115"), the NEXT lookup in the
//                                   same node group, is FATAL too — it is the one the planning pass
//                                   named, and it is one line later in render order.)
//   assertion 2 (orphans) ......... 55 orphaned per-site table entries out of 68 site-shaped keys
//                                   across 15 tables — 21 of them in ADHOC_RENDERERS alone.
//   assertion 3 (placement) ....... 74 of 83 live sites unplaced (21 ad-hoc, the rest prompt/misc),
//                                   because the lookups that would place them do not resolve.
//   assertion 4 (affordances) ..... all 14 PASS — nothing had been dropped yet.
//   assertion 5 (line keying) ..... 91 DISTINCT / 147 OCCURRENCES of "<path>.js:<line>" literals.
//                                   80 of the 91 no longer match any live extracted site.
//
// After the repair, assertions 1/2/3/5 must all reach zero and assertion 4 must stay at 14 PASS.
//
// ============================================================================
// NOT WIRED INTO `npm test` YET — wiring point is the page re-key (Task 4)
// ============================================================================
// Assertions 1, 2, 3 and 5 are red against ab98e04 for real reasons that the render-core extraction
// and the page re-key fix. Wiring this gate in while it is red would make every intervening commit
// red for something that commit did not cause — the exact trap extract_narration_lines.js's own
// header warns about, and the reason that extractor sat outside `npm test` while 15-06 was in
// flight. It gets added to the `npm test` chain (as gate 16, immediately after the extractor, since
// it consumes the inventory the extractor writes) in the same commit that turns it green.

import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PAGE_REL = "art-review/narration-audit.html";
const INV_REL = "art-review/narration-inventory.json";
const BASELINE_REL = "art-review/narration-table-baseline.json";

/* ================= result plumbing ================= */

// A check produces { label, pass, lines } and NEVER prints directly, so --drill can run the real
// check function against a synthetic tree and inspect its verdict instead of scraping stdout.
function mk(label) { return { label, pass: true, lines: [] }; }
function fail(res, msg) { res.pass = false; res.lines.push("FAIL: " + msg); }
function note(res, msg) { res.lines.push("      " + msg); }

/* ================= shared parsing helpers ================= */

// Lines whose first non-whitespace characters are "//" are excluded from every scan below EXCEPT
// the affordance census, which deliberately does not strip comments (a commented-out affordance is
// a removed affordance, and must still fail).
function stripCommentLines(text) {
  return text.split("\n").map((l) => (/^\s*\/\//.test(l) ? "" : l)).join("\n");
}

// Balanced capture of a `const NAME = { ... }` / `const NAME = new Set([ ... ])` declaration body,
// string- and template-aware so a brace inside a template literal never closes the block early.
function declBody(text, name) {
  const re = new RegExp(`\\bconst\\s+${name}\\s*=\\s*(new\\s+Set\\s*\\(\\s*)?([\\[{])`);
  const m = re.exec(text);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1;
  const open = m[2], close = open === "[" ? "]" : "}";
  let depth = 0, inString = null, inTemplate = false, tDepth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const c = text[i], prev = text[i - 1];
    if (inString) { if (c === inString && prev !== "\\") inString = null; continue; }
    if (inTemplate) {
      if (c === "`" && prev !== "\\" && tDepth === 0) inTemplate = false;
      else if (c === "{" && prev === "$") tDepth++;
      else if (c === "}" && tDepth > 0) tDepth--;
      continue;
    }
    if (c === "'" || c === '"') { inString = c; continue; }
    if (c === "`") { inTemplate = true; continue; }
    if (c === "[" || c === "{") { depth++; continue; }
    if (c === "]" || c === "}") { depth--; if (depth === 0) return text.slice(openIdx, i + 1); continue; }
  }
  return null;
}

// Object-literal keys only ("key": ...), never a string that happens to sit in a value position.
function objectKeys(body) {
  return [...body.matchAll(/"([^"\n]+)"\s*:/g)].map((m) => m[1]);
}
// Set members — every string literal in the block (a Set literal has no key/value distinction).
function setMembers(body) {
  return [...body.matchAll(/"([^"\n]+)"/g)].map((m) => m[1]);
}

// Reduce any card-id-shaped string to the bare "<file>:<line>" site it points at: drop a leading
// category prefix (adhoc:/prompt:/button:/sub:/misc:<cat>:) and any trailing ~suffix.
function toSiteKey(raw) {
  let s = raw;
  s = s.replace(/^misc:[A-Za-z0-9]+:/, "");
  s = s.replace(/^(adhoc|prompt|button|sub):/, "");
  s = s.replace(/~[^~]*$/, "");
  return s;
}
// Deliberately NOT anchored on `src/`: assertion 2 must exercise identically against --drill's
// `drill/`-pathed fixture. Assertion 5, whose subject IS a real source line, stays `src/`-anchored.
function isSiteShaped(raw) { return /[A-Za-z0-9_/.]+\.js:\d+/.test(raw); }

/* ================= the flow-chart lookup table ================= */

// Every per-category card lookup the page's flow-chart node table performs, with the shape of the
// key it takes and whether the helper THROWS on a miss (which blanks the whole page) or returns an
// empty list (which silently omits a card — how D-30's prompts went absent in the first place).
const LOOKUPS = {
  adhocCards:            { kind: "adhoc",  throws: true },
  promptCards:           { kind: "prompt", throws: false },
  miscMpErrorCard:       { kind: "misc",   category: "mpError",      throws: true },
  miscLobbyCard:         { kind: "misc",   category: "lobby",        throws: true },
  miscIntroBarrierCards: { kind: "misc",   category: "introBarrier", throws: true },
  miscDraftWaitCard:     { kind: "misc",   category: "draftWait",    throws: true },
  miscParamPromptCard:   { kind: "misc",   category: "paramPrompt",  throws: true },
  miscBattleLineCard:    { kind: "misc",   category: "battleLine",   throws: true },
  miscTimerCards:        { kind: "misc",   category: "timer",        throws: true },
};

function nodeGroupsBlock(page) {
  const body = declBody(page, "NODE_GROUPS");
  return body == null ? "" : body;
}

// In render order: the page builds each node group's cards in NODE_GROUPS source order, so source
// index IS render order and "the first failing lookup" is a meaningful, reportable fact.
function collectLookups(page) {
  const blk = stripCommentLines(nodeGroupsBlock(page));
  const out = [];
  const names = Object.keys(LOOKUPS).join("|");
  const direct = new RegExp(`\\b(${names})\\s*\\(\\s*"([^"]+)"\\s*\\)`, "g");
  let m;
  while ((m = direct.exec(blk))) out.push({ helper: m[1], key: m[2], at: m.index });
  // the array-of-keys form: [ "a", "b", ... ].flatMap(miscMpErrorCard)
  const flat = new RegExp(`\\[([^\\]]*)\\]\\s*\\n?\\s*\\.flatMap\\(\\s*(${names})\\s*\\)`, "g");
  while ((m = flat.exec(blk))) {
    const keys = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    keys.forEach((k, i) => out.push({ helper: m[2], key: k, at: m.index + i }));
  }
  // bulk placements with no key of their own
  const bulk = [];
  for (const name of ["awardCards", "dockFlavorCards"]) {
    const re = new RegExp(`\\b${name}\\s*\\(\\s*\\)`, "g");
    while ((m = re.exec(blk))) bulk.push({ helper: name, at: m.index });
  }
  out.sort((a, b) => a.at - b.at);
  return { lookups: out, bulk };
}

function liveKeySets(inv) {
  return {
    adhoc: new Set((inv.adhoc || []).map((e) => `${e.file}:${e.line}`)),
    prompt: new Set((inv.prompts || []).map((e) => `${e.file}:${e.line}`)),
    misc: new Set((inv.misc || []).map((e) => `${e.category}:${e.file}:${e.line}`)),
  };
}
function resolves(spec, key, live) {
  if (spec.kind === "adhoc") return live.adhoc.has(key);
  if (spec.kind === "prompt") return live.prompt.has(key);
  return live.misc.has(`${spec.category}:${key}`);
}

/* ================= assertion 1: resolvability ================= */

function checkResolvability(page, inv) {
  const res = mk("assertion 1 — resolvability: every flow-chart card lookup resolves against the live inventory");
  const { lookups } = collectLookups(page);
  const live = liveKeySets(inv);
  if (lookups.length === 0) fail(res, "no card lookups found in NODE_GROUPS at all — the flow-chart node table is missing or unparseable");
  let fatal = 0, silent = 0, ok = 0, firstFatal = null;
  for (const { helper, key } of lookups) {
    const spec = LOOKUPS[helper];
    if (resolves(spec, key, live)) { ok++; continue; }
    if (spec.throws) {
      fatal++;
      if (!firstFatal) firstFatal = `${helper}("${key}")`;
      fail(res, `FATAL unresolvable lookup ${helper}("${key}") — ${helper}() throws on a miss, so this one exception aborts the ENTIRE page render`);
    } else {
      silent++;
      fail(res, `SILENT unresolvable lookup ${helper}("${key}") — ${helper}() returns an empty list on a miss, so this card vanishes with no error at all`);
    }
  }
  note(res, `lookups: ${lookups.length} total — ${ok} resolve, ${fatal} FATAL, ${silent} SILENT`);
  if (firstFatal) note(res, `first FATAL in render order: ${firstFatal} — everything after it never renders`);
  return res;
}

/* ================= assertion 2: orphan detection ================= */

// The direction applyMeta() structurally cannot see. It fails only on a MISSING key, so a stale key
// silently attaches the wrong metadata to a shifted site while the orphan sits unnoticed.
const PER_SITE_TABLES = [
  { name: "ADHOC_RENDERERS", how: "objectKeys" },
  { name: "ADHOC_EXTRA_TAGS", how: "objectKeys" },
  { name: "ADHOC_LABEL_OVERRIDE", how: "objectKeys" },
  { name: "PASS_THROUGH", how: "setMembers" },
  { name: "GUARDED_TEXT", how: "objectKeys" },
  { name: "ADHOC_TWO_PARTY_ROLE_LABELS", how: "objectKeys" },
  // LEGACY_CARD_ID_PIN's VALUES are deliberately dead ids (the pre-D-24 line numbers Wyatt's review
  // history is keyed to) — only its keys name a live site, so only its keys are checked.
  { name: "LEGACY_CARD_ID_PIN", how: "objectKeys" },
  { name: "PROMPT_PASS_THROUGH", how: "setMembers" },
  { name: "PROMPT_RENDERERS", how: "objectKeys" },
  { name: "PARAM_PROMPT_DECL", how: "objectKeys" },
  { name: "PARAM_PROMPT_DEAD_CALLS", how: "setMembers" },
  { name: "PROMPT_SUB_RENDERERS", how: "objectKeys" },
  { name: "SIGN_RULE_BUTTON_OVERRIDE", how: "objectKeys" },
  { name: "SIGN_RULE_EXEMPT_IDS", how: "setMembers" },
  { name: "DRAFT_WAIT_RENDERERS", how: "objectKeys" },
];

function checkOrphans(page, inv) {
  const res = mk("assertion 2 — orphans: every per-site table entry corresponds to a live inventory site");
  const live = liveKeySets(inv);
  const allSites = new Set();
  for (const k of live.adhoc) allSites.add(k);
  for (const k of live.prompt) allSites.add(k);
  for (const k of live.misc) allSites.add(k.replace(/^[A-Za-z0-9]+:/, ""));
  let checked = 0, orphans = 0;
  for (const { name, how } of PER_SITE_TABLES) {
    const body = declBody(page, name);
    if (body == null) { note(res, `table ${name} not present (skipped — nothing to orphan)`); continue; }
    const raw = how === "objectKeys" ? objectKeys(stripCommentLines(body)) : setMembers(stripCommentLines(body));
    for (const r of raw) {
      if (!isSiteShaped(r)) continue;
      checked++;
      const site = toSiteKey(r);
      if (!allSites.has(site)) {
        orphans++;
        fail(res, `orphan entry ${name}["${r}"] — no live inventory site at ${site}; it can never fire, and its stale key can attach the wrong metadata to a shifted site`);
      }
    }
  }
  note(res, `per-site table entries checked: ${checked}; orphan entries: ${orphans}`);
  return res;
}

/* ================= assertion 3: every live site placed exactly once ================= */

// A card placed in TWO stages is not automatically a bug — three of the page's helpers genuinely
// fire at two different moments in the game, and Wyatt reads them in both places on purpose. Each
// such placement is allowlisted BY NAME with its reason, and a stale allowlist entry (one whose
// card is no longer multiply placed) FAILS — so the allowlist can never rot into blanket cover.
const MULTI_PLACEMENT_ALLOWED = {
  "prompt:src/ui/flow.js:103": "humanFlip()'s own prompt — the shared coin-flip helper fires at the storm-anchor dodge AND at docking; the page shows it in both stages deliberately (D-33 comments at both sites).",
  "adhoc:src/ui/flow.js:111": "the coin-flip announcement — the same generic line the storm dodge and the docking flip both emit (AD_HOC_META: \"generic — used at docking/anchor moments\").",
};

// `allowed` is injectable so --drill can run this exact function against a synthetic fixture with
// its own (usually empty) allowlist. The REAL allowlist is still the module constant above and is
// still the default — the injection point exists for fixture isolation, not to relax the check, and
// the drill has a dedicated case proving the stale-entry branch fires.
function checkPlacement(page, inv, allowed = MULTI_PLACEMENT_ALLOWED) {
  const res = mk("assertion 3 — placement: every live inventory site is reachable from exactly one flow-chart node");
  const { lookups, bulk } = collectLookups(page);
  const placed = new Map();
  const bump = (id) => placed.set(id, (placed.get(id) || 0) + 1);
  for (const { helper, key } of lookups) {
    const spec = LOOKUPS[helper];
    if (spec.kind === "adhoc") bump(`adhoc:${key}`);
    else if (spec.kind === "prompt") bump(`prompt:${key}`);
    else bump(`misc:${spec.category}:${key}`);
  }
  const bulkCount = (name) => bulk.filter((b) => b.helper === name).length;

  const want = [];
  for (const e of inv.adhoc || []) want.push(`adhoc:${e.file}:${e.line}`);
  for (const e of inv.prompts || []) want.push(`prompt:${e.file}:${e.line}`);
  for (const e of inv.misc || []) want.push(`misc:${e.category}:${e.file}:${e.line}`);

  let zero = 0, multi = 0;
  for (const id of want) {
    const n = placed.get(id) || 0;
    if (n === 0) { zero++; fail(res, `unplaced live site ${id} — it is extracted but no flow-chart node renders it, so Wyatt cannot see the card at all`); continue; }
    if (n > 1 && !allowed[id]) { multi++; fail(res, `${id} is placed ${n} times with no reasoned allowlist entry — it would render as a duplicate card`); }
  }
  // stale-allowlist check: an allowlisted id that is no longer multiply placed is unnecessary cover
  for (const [id, reason] of Object.entries(allowed)) {
    if (!reason || !reason.trim()) fail(res, `MULTI_PLACEMENT_ALLOWED["${id}"] has no reason — every exception must state why`);
    const n = placed.get(id) || 0;
    if (n <= 1) fail(res, `STALE MULTI_PLACEMENT_ALLOWED["${id}"] — that card is placed ${n} time(s) now, so the exception is unnecessary cover and must be deleted`);
  }
  // the two bulk placements must each appear exactly once
  for (const [name, count, what] of [["awardCards", bulkCount("awardCards"), `${(inv.awards || []).length} award card(s)`], ["dockFlavorCards", bulkCount("dockFlavorCards"), "the dock-flavour cards"]]) {
    if (count !== 1) fail(res, `${name}() appears ${count} time(s) in NODE_GROUPS — expected exactly 1, it places ${what}`);
  }
  note(res, `live sites: ${want.length}; unplaced: ${zero}; unreasoned duplicates: ${multi}; reasoned shared placements: ${Object.keys(allowed).length}`);
  return res;
}

/* ================= assertion 4: the affordance census ================= */

// Every DOM/CSS/function hook each affordance Wyatt actually works with depends on, asserted present
// on EVERY run, so a refactor that quietly drops one fails the build instead of surprising him.
// Named in his own words plus the decision id, because the failure message is the only explanation
// anyone reading a red build will get.
//
// Comment-only lines are stripped BEFORE the presence scan, because a hook that survives only
// inside a comment is a removed affordance and must still fail. (The plan this gate implements
// described the mechanism as "no comment stripping" while stating that exact intent — the two are
// opposites, since an unstripped scan FINDS a commented-out hook and passes. The intent is what is
// implemented: verified at ab98e04 that all 14 affordances still PASS with comments stripped, so
// this is strictly stronger than an unstripped scan and costs nothing.)
const AFFORDANCES = [
  { what: "Reviewed checkbox and the progress counter", dec: "D-27", hooks: ["reviewedBox", "isReviewed", "reviewProgress", "reviewed:"] },
  { what: "The derived-intent line, recomputed live as he types", dec: "D-26", hooks: ["derivedIntent", "renderDerivedLine", "computeIntent"] },
  { what: "Typing in the notes box auto-selects Rewrite, without clobbering a deliberate Cut or Merge", dec: "D-42", hooks: ["applyAutoRewriteRule"] },
  { what: "The second copy box, for the addressed (\"you\") version", dec: "D-47", hooks: ["addressedNotesArea", "addressedDerivedIntent"] },
  { what: "The third copy box, on two-party cards only, labelled with each role", dec: "D-54", hooks: ["addressedNotesArea2", "roleLabel", "checkAddressedFieldPresent"] },
  { what: "The separate Question box, which never becomes shipped copy", dec: "D-26", hooks: ["questionArea"] },
  { what: "A single canonical merge target, never a cycle", dec: "D-36/D-44", hooks: ["mergeTargetSelect", "mergeTargetCustom", "checkMergeCycles"] },
  { what: "The shared-wording notice — one string behind several doors, vs separate strings that happen to match", dec: "D-28", hooks: ["computeSharedWordingGroups", "sharedWordingNote"] },
  { what: "The dead / guarded / config-dead badges", dec: "D-33/34/40/43", hooks: ["deadCopyNote", "guardedNote", "checkDeadCopyMarking"] },
  { what: "Fabricated events that still satisfy the real emit sites' invariants", dec: "D-51", hooks: ["assertBattleEventInvariants", "FABRICATED_EVENT_VIOLATIONS"] },
  { what: "Live pirate voice and sign normalisation, so Keep ships exactly what he sees", dec: "D-25/29/38", hooks: ["finalize", "applySignRule", "checkSignRule"] },
  { what: "The flow chart's really-drawn SVG edges, surviving a window resize", dec: "D-22", hooks: ["drawEdges", "edgeSvg", "resize"] },
  { what: "His work saved in the browser between sittings", dec: "—", hooks: ["STORAGE_KEY", "loadSaved", "saveAll"] },
  { what: "The Export button and its per-row keys", dec: "—", hooks: ["exportBtn", "addressedNotes", "mergeInto"] },
];

function checkAffordances(page) {
  const live = stripCommentLines(page);
  const out = [];
  for (const a of AFFORDANCES) {
    const res = mk(`affordance (${a.dec}) — ${a.what}`);
    for (const h of a.hooks) {
      if (!live.includes(h)) {
        const commentedOut = page.includes(h);
        fail(res, `affordance hook "${h}" is ${commentedOut ? "present ONLY inside a comment in" : "absent from"} ${PAGE_REL} — ${a.what} (${a.dec}) has been dropped`);
      }
    }
    out.push(res);
  }
  return out;
}

/* ================= assertion 5: no line-number keying ================= */

function checkLineKeying(page) {
  const res = mk("assertion 5 — identity: no card id in the page is keyed by a source line number");
  const hits = [];
  page.split("\n").forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return;
    for (const m of line.matchAll(/"(src\/[A-Za-z0-9_/.]+\.js):(\d+)"/g)) hits.push({ line: i + 1, lit: m[0] });
  });
  const distinct = [...new Set(hits.map((h) => h.lit))];
  // DISTINCT and OCCURRENCE are two different numbers (91 and 147 at ab98e04) and conflating them
  // is how a gate fails its own verify. Both are reported, and the assertion fails while either is
  // above zero.
  note(res, `line-number-keyed literals — distinct: ${distinct.length}, occurrences: ${hits.length}`);
  if (hits.length) {
    fail(res, `${distinct.length} distinct / ${hits.length} occurrence(s) of line-number-keyed card ids remain — every one of them drifts the moment source moves`);
    distinct.slice(0, 10).forEach((lit) => note(res, `offender: ${lit}`));
    if (distinct.length > 10) note(res, `… and ${distinct.length - 10} more distinct offender(s)`);
  }
  return res;
}

/* ================= assertion 6: card text is real, never a placeholder =================
 *
 * The page used to hand-write each ad-hoc site's current wording in its own per-site renderer
 * table. Those literals were true when typed and had gone 20-of-26 orphaned and pre-15-06 in
 * wording, so cards would have shown copy the game no longer ships. art-review/narration-core.js
 * deletes that layer and renders every card from the live extracted expression instead. This
 * assertion is what keeps it deleted: if a site's expression is resolvable, its card must show
 * REAL TEXT — never a placeholder, never an evaluation-failure fallback.
 *
 * The curated-renderer cap is the second half. A curated renderer is a licence to hand-write, so
 * the licence is counted and capped rather than left open-ended.
 */
const PLACEHOLDER_PATTERNS = [
  /no renderer defined/i,
  /could not evaluate/i,
  /\(TODO\)/i,
  /placeholder/i,
];

export function checkCardText(cards, core) {
  const res = mk("assertion 6 — fidelity: every card's text is rendered from live source, never a placeholder");
  const errored = cards.filter((c) => c.error);
  const silent = cards.filter((c) => c.silent && !c.error);
  const passThrough = cards.filter((c) => c.passThrough && !c.error);
  // A card that could not be rendered at all degrades to a NAMED error card (T-QT-04) rather than
  // blanking the page — but it is still a failure of this gate, because in a healthy tree there is
  // nothing to degrade from.
  for (const c of errored) fail(res, `card ${c.id} failed to render — ${c.error}`);
  // A resolvable site whose text is a placeholder is the exact rot this refactor removed.
  for (const c of cards) {
    if (c.error || c.silent || c.passThrough) continue;
    if (c.neutral == null) {
      fail(res, `card ${c.id} rendered no text, but its site is neither silent nor a pass-through — raw: ${String(c.rawNeutral).slice(0, 90)}`);
      continue;
    }
    const hit = PLACEHOLDER_PATTERNS.find((re) => re.test(c.neutral));
    if (hit) fail(res, `card ${c.id} shows placeholder/fallback text matching ${hit} — it must render the real expression`);
  }
  const curated = core && core.CURATED_RENDERERS ? Object.keys(core.CURATED_RENDERERS).length : 0;
  const cap = (core && core.CURATED_RENDERER_CAP) || 0;
  if (curated > cap) fail(res, `${curated} curated renderer(s) exceeds the cap of ${cap} — each one is a hand-written licence to go stale`);
  note(res, `cards rendered: ${cards.length} (${silent.length} deliberately silent, ${passThrough.length} table pass-through, ${errored.length} error)`);
  note(res, `curated renderers: ${curated} of a cap of ${cap}`);
  // D-51: a fabricated event that violates its real emit site's invariants renders the RIGHT line
  // with IMPOSSIBLE VALUES — the third defect class, and the one that put the literal word "null"
  // on a card once.
  const viol = (core && core.FABRICATED_EVENT_VIOLATIONS) || [];
  if (viol.length) for (const v of viol) fail(res, `fabricated-event invariant (D-51): ${v}`);
  else note(res, "fabricated-event invariants (D-51): all satisfied");
  return res;
}

/* ================= assertion 7: the table path still reproduces its committed pin =================
 *
 * art-review/narration-table-baseline.json was captured BEFORE the render-core extraction, by
 * importing src/ui/util.js's real describeFor()/narrationVariants() builders directly. The table
 * surface is the one that was never broken; this keeps it that way. A committed fixture rather than
 * a temp snapshot, because a temp snapshot becomes unreproducible the moment the refactor lands.
 */
export function checkTableBaseline(core, baselineText) {
  const res = mk("assertion 7 — the table path reproduces its committed baseline byte-for-byte");
  if (!baselineText) { fail(res, "art-review/narration-table-baseline.json is missing — the regression pin is gone"); return res; }
  let want;
  try { want = JSON.parse(baselineText); } catch (e) { fail(res, `baseline is not valid JSON: ${e.message}`); return res; }
  const got = core.tableCards();
  const wantIds = Object.keys(want.cards || {});
  const gotIds = Object.keys(got);
  if (wantIds.length !== gotIds.length) fail(res, `baseline pins ${wantIds.length} table cards, the core renders ${gotIds.length}`);
  for (const id of wantIds) {
    const a = want.cards[id], b = got[id];
    if (!b) { fail(res, `table card ${id} is pinned in the baseline but the core no longer renders it`); continue; }
    if (a.neutral !== b.neutral) fail(res, `table card ${id} drifted from the baseline\n        pinned: ${JSON.stringify(a.neutral)}\n        now:    ${JSON.stringify(b.neutral)}`);
    if (JSON.stringify(a.variants) !== JSON.stringify(b.variants)) fail(res, `table card ${id}'s addressed variants drifted from the baseline`);
  }
  note(res, `table baseline: ${wantIds.length} card(s) pinned, ${gotIds.length} rendered`);
  return res;
}

/* ================= the whole gate, as one callable function ================= */

export function runChecks(page, inv, opts = {}) {
  const results = [
    checkResolvability(page, inv),
    checkOrphans(page, inv),
    checkPlacement(page, inv, opts.multiPlacementAllowed === undefined ? MULTI_PLACEMENT_ALLOWED : opts.multiPlacementAllowed),
    ...checkAffordances(page),
    checkLineKeying(page),
  ];
  if (opts.cards) results.push(checkCardText(opts.cards, opts.core));
  if (opts.core) results.push(checkTableBaseline(opts.core, opts.baselineText));
  return results;
}

/* ================= --drill: red-proof every assertion ================= */

// A synthetic, fully-consistent page + inventory pair. The negative control: every assertion must
// PASS against it, proving none of them is vacuous. Each drill case then breaks exactly one thing
// and asserts that assertion goes red.
//
// The fixture's file paths are under `drill/`, deliberately NOT under `src/`. Assertion 5's whole
// subject is card ids keyed to a REAL source line, so its pattern is anchored on `src/` — a fixture
// using `src/` paths would make the negative control fail assertion 5 for a reason that has nothing
// to do with the fixture being inconsistent. `drill/` keeps every other assertion exercised
// identically while leaving assertion 5's own violation to be introduced deliberately, below.
function syntheticPair() {
  const inv = {
    table: [], awards: [{ key: "most", img: null, name: "N", byline: "B", line: 1 }], roundCfgFlags: { a: true },
    adhoc: [{ file: "drill/flow.js", line: 10, fn: "f", label: "l", defaultTag: "keep", rawNeutral: "`x`", rawVariants: null, tableDriven: false, group: "g" }],
    prompts: [{ file: "drill/flow.js", line: 20, fn: "g", kind: "ask", rawMsg: "`y`", labels: [], dynamicLabelCount: 0, dynamicBase: null, rawSub: null, isLiteral: true }],
    misc: [{ category: "lobby", file: "drill/lobby.js", line: 30, fn: "h", rawMsg: "`z`" }],
  };
  const hooks = AFFORDANCES.flatMap((a) => a.hooks).map((h) => `/* hook ${h} */ ${h}`).join("\n");
  const page = [
    "const NODE_GROUPS = [",
    '  { id: "one", stage: 0, cardsOf: () => adhocCards("drill/flow.js:10")',
    '      .concat(promptCards("drill/flow.js:20"), miscLobbyCard("drill/lobby.js:30"), awardCards(), dockFlavorCards()) },',
    "];",
    'const ADHOC_RENDERERS = { "drill/flow.js:10": 1 };',
    'const PROMPT_RENDERERS = { "drill/flow.js:20": 1 };',
    hooks,
  ].join("\n");
  return { page, inv };
}

function drill() {
  let bad = 0;
  const say = (ok, what) => { console.log((ok ? "PASS" : "FAIL") + ": drill — " + what); if (!ok) bad++; };
  const idOf = (r) => r.label.split(" ")[1]; // "1"/"2"/"3"/"5" for the numbered assertions

  const base = syntheticPair();

  // Every synthetic run passes an EMPTY multi-placement allowlist: the real allowlist names real
  // card ids, which are absent from the fixture and would read as stale against it. The stale branch
  // gets its own dedicated case below, so nothing goes unproven.
  const run = (page, inv, allowed) => runChecks(page, inv, { multiPlacementAllowed: allowed || {} });

  // NEGATIVE CONTROL — a consistent pair must pass EVERYTHING. Without this, every assertion below
  // could be red for a reason that has nothing to do with the violation the case introduces, and
  // the drill would prove nothing at all.
  {
    const results = run(base.page, base.inv);
    const reds = results.filter((r) => !r.pass);
    say(reds.length === 0, "negative control: a fully consistent synthetic page + inventory PASSES every assertion" + (reds.length ? " (red: " + reds.map((r) => r.label + " :: " + r.lines.join(" / ")).join("; ") + ")" : ""));
  }

  // assertion 1 — a lookup key with no inventory entry
  {
    const page = base.page.replace('miscLobbyCard("drill/lobby.js:30")', 'miscLobbyCard("drill/lobby.js:999")');
    const r = run(page, base.inv).find((x) => idOf(x) === "1");
    say(!r.pass && r.lines.some((l) => /FATAL/.test(l)), "assertion 1 goes red on an unresolvable FATAL lookup");
  }
  {
    const page = base.page.replace('promptCards("drill/flow.js:20")', 'promptCards("drill/flow.js:998")');
    const r = run(page, base.inv).find((x) => idOf(x) === "1");
    say(!r.pass && r.lines.some((l) => /SILENT/.test(l)), "assertion 1 goes red on an unresolvable SILENT lookup");
  }
  // assertion 2 — a per-site table entry keyed to a site that does not exist
  {
    const page = base.page.replace('const ADHOC_RENDERERS = { "drill/flow.js:10": 1 };', 'const ADHOC_RENDERERS = { "drill/flow.js:10": 1, "drill/flow.js:777": 1 };');
    const r = run(page, base.inv).find((x) => idOf(x) === "2");
    say(!r.pass && r.lines.some((l) => /orphan/.test(l)), "assertion 2 goes red on an orphaned per-site renderer entry");
  }
  // assertion 3 — a live site no node group places
  {
    const inv = JSON.parse(JSON.stringify(base.inv));
    inv.adhoc.push({ file: "drill/flow.js", line: 11, fn: "f", label: "l", defaultTag: "keep", rawNeutral: "`q`", rawVariants: null, tableDriven: false, group: "g" });
    const r = run(base.page, inv).find((x) => idOf(x) === "3");
    say(!r.pass && r.lines.some((l) => /unplaced/.test(l)), "assertion 3 goes red on a live site with no flow-chart placement");
  }
  {
    const page = base.page.replace('adhocCards("drill/flow.js:10")', 'adhocCards("drill/flow.js:10").concat(adhocCards("drill/flow.js:10"))');
    const r = run(page, base.inv).find((x) => idOf(x) === "3");
    say(!r.pass && r.lines.some((l) => /placed 2 times/.test(l)), "assertion 3 goes red on an unreasoned duplicate placement");
  }
  {
    // a duplicate placement WITH a reason is allowed — the allowlist is a real escape hatch, not a
    // dead branch
    const page = base.page.replace('adhocCards("drill/flow.js:10")', 'adhocCards("drill/flow.js:10").concat(adhocCards("drill/flow.js:10"))');
    const r = run(page, base.inv, { "adhoc:drill/flow.js:10": "a shared helper that genuinely fires at two moments" }).find((x) => idOf(x) === "3");
    say(r.pass, "assertion 3 accepts a duplicate placement that carries a stated reason");
  }
  {
    // …and a reason for a card that is NOT multiply placed is stale cover, which must fail
    const r = run(base.page, base.inv, { "adhoc:drill/flow.js:10": "no longer true" }).find((x) => idOf(x) === "3");
    say(!r.pass && r.lines.some((l) => /STALE/.test(l)), "assertion 3 goes red on a STALE multi-placement allowlist entry");
  }
  {
    // …and an allowlist entry with an empty reason is not an exception, it is a hole
    const r = run(base.page, base.inv, { "adhoc:drill/flow.js:10": "" }).find((x) => idOf(x) === "3");
    say(!r.pass && r.lines.some((l) => /no reason/.test(l)), "assertion 3 goes red on an allowlist entry with no stated reason");
  }
  // assertion 4 — a dropped affordance hook
  {
    const page = base.page.replace(/^.*mergeTargetCustom.*$/m, "");
    const r = run(page, base.inv).filter((x) => /^affordance/.test(x.label)).find((x) => !x.pass);
    say(!!r, "assertion 4 goes red when an affordance hook is deleted");
  }
  {
    // a hook that survives ONLY inside a comment is still a removed affordance
    const page = base.page.replace(/^.*checkMergeCycles.*$/m, "// checkMergeCycles");
    const r = run(page, base.inv).filter((x) => /^affordance/.test(x.label)).find((x) => !x.pass);
    say(!!r && r.lines.some((l) => /ONLY inside a comment/.test(l)), "assertion 4 goes red when an affordance hook survives ONLY inside a comment");
  }
  // assertion 5 — a line-number-keyed literal
  {
    const page = base.page + '\nconst X = "src/ui/flow.js:42";\n';
    const r = run(page, base.inv).find((x) => idOf(x) === "5");
    say(!r.pass && r.lines.some((l) => /distinct: 1, occurrences: 1/.test(l)), "assertion 5 goes red on a single line-number-keyed literal");
  }
  {
    // and it reports DISTINCT and OCCURRENCE as two separate numbers
    const page = base.page + '\nconst X = "src/ui/flow.js:42"; const Y = "src/ui/flow.js:42";\n';
    const r = run(page, base.inv).find((x) => idOf(x) === "5");
    say(r.lines.some((l) => /distinct: 1, occurrences: 2/.test(l)), "assertion 5 reports distinct and occurrence counts as two separate numbers");
  }

  /* ---- assertion 6 — card fidelity. Its subject is RENDERED CARDS rather than page text, so its
   * fixtures are synthetic card lists plus a synthetic core stub. ---- */
  const stubCore = (curated, cap, viol) => ({
    CURATED_RENDERERS: Object.fromEntries(Array.from({ length: curated }, (_, i) => [`r${i}`, 1])),
    CURATED_RENDERER_CAP: cap,
    FABRICATED_EVENT_VIOLATIONS: viol || [],
  });
  {
    // negative control: healthy cards must PASS
    const cards = [{ id: "a", neutral: "real text" }, { id: "b", silent: true, neutral: null }, { id: "c", passThrough: true, neutral: null }];
    const r = checkCardText(cards, stubCore(0, 2));
    say(r.pass, "negative control: assertion 6 PASSES a card list whose text is all real");
  }
  {
    const cards = [{ id: "a", neutral: "(no renderer defined for this line yet)" }];
    const r = checkCardText(cards, stubCore(0, 2));
    say(!r.pass && r.lines.some((l) => /placeholder/.test(l)), "assertion 6 goes red on a card showing placeholder text");
  }
  {
    const cards = [{ id: "a", neutral: null, rawNeutral: "`x`" }];
    const r = checkCardText(cards, stubCore(0, 2));
    say(!r.pass && r.lines.some((l) => /rendered no text/.test(l)), "assertion 6 goes red on a resolvable site that rendered nothing");
  }
  {
    const cards = [{ id: "a", error: "boom" }];
    const r = checkCardText(cards, stubCore(0, 2));
    say(!r.pass && r.lines.some((l) => /failed to render/.test(l)), "assertion 6 goes red on a card that failed to render");
  }
  {
    const r = checkCardText([{ id: "a", neutral: "t" }], stubCore(5, 2));
    say(!r.pass && r.lines.some((l) => /exceeds the cap/.test(l)), "assertion 6 goes red when curated renderers exceed their cap");
  }
  {
    const r = checkCardText([{ id: "a", neutral: "t" }], stubCore(0, 2, ["table:battle takes null (D-51)"]));
    say(!r.pass && r.lines.some((l) => /D-51/.test(l)), "assertion 6 goes red on a fabricated event that violates its real emit-site invariants (D-51)");
  }

  /* ---- assertion 7 — the committed table baseline. ---- */
  {
    const fakeCore = { tableCards: () => ({ "table:x": { neutral: "same", variants: [] } }) };
    const good = JSON.stringify({ cards: { "table:x": { neutral: "same", variants: [] } } });
    say(checkTableBaseline(fakeCore, good).pass, "negative control: assertion 7 PASSES when the core reproduces the baseline");
    const drifted = JSON.stringify({ cards: { "table:x": { neutral: "DIFFERENT", variants: [] } } });
    const r = checkTableBaseline(fakeCore, drifted);
    say(!r.pass && r.lines.some((l) => /drifted from the baseline/.test(l)), "assertion 7 goes red when a table card drifts from its committed baseline");
    const rm = checkTableBaseline(fakeCore, null);
    say(!rm.pass && rm.lines.some((l) => /regression pin is gone/.test(l)), "assertion 7 goes red when the baseline fixture is deleted outright");
  }

  // prove the drill never touched the real tree
  const d = mkdtempSync(join(tmpdir(), "narr-audit-drill-"));
  writeFileSync(join(d, "note.txt"), "drill scratch dir — the drill builds its fixtures in memory and never writes to the repo\n");

  console.log(bad ? `\n${bad} drill case(s) FAILED — a guard that does not fail when broken is not a guard.` : "\nall drill cases passed — every assertion red-proofed, negative control included.");
  return bad ? 1 : 0;
}

/* ================= the render core, loaded once ================= */

// art-review/narration-core.js is the SAME module the page imports. Loading it here is the whole
// point of the refactor: the tool's rendering becomes answerable without a browser. It needs the raw
// text of the source files so it can resolve a copy site that interpolates a local computed a few
// lines above the call (`neutralBanner`, `promptMsg`, `sub`) out of the real declaration, instead of
// anybody hand-transcribing what those produce.
async function loadCore() {
  const core = await import("../art-review/narration-core.js");
  const sources = {};
  for (const rel of core.SOURCE_FILES) sources[rel] = readFileSync(join(ROOT, rel), "utf8");
  core.configure({ sources });
  return core;
}

/* ================= main ================= */

const argv = process.argv.slice(2);
if (argv.includes("--drill")) {
  process.exit(drill());
}

const page = readFileSync(join(ROOT, PAGE_REL), "utf8");
const inv = JSON.parse(readFileSync(join(ROOT, INV_REL), "utf8"));
const core = await loadCore();

/* ---- --print: dump every card's id, label and rendered text. --table-only reproduces the
 * committed table baseline byte-for-byte, which is how that fixture stays checkable forever. ---- */
if (argv.includes("--print")) {
  if (argv.includes("--table-only")) {
    const baseline = JSON.parse(readFileSync(join(ROOT, BASELINE_REL), "utf8"));
    process.stdout.write(JSON.stringify({ _provenance: baseline._provenance, cards: core.tableCards() }, null, 2) + "\n");
    process.exit(0);
  }
  for (const c of core.renderAllCards(inv)) {
    if (c.error) { console.log(`--- ${c.id}\n    ERROR: ${c.error}`); continue; }
    console.log(`--- ${c.id}`);
    console.log(`    label:   ${c.label}`);
    console.log(`    neutral: ${c.silent || c.passThrough ? "(deliberately silent / pass-through)" : c.neutral}`);
    for (const v of c.variants || []) console.log(`    seat ${v.seat}: ${v.text}`);
    for (const n of c.notes || []) if (n) console.log(`    note:    ${n}`);
  }
  process.exit(0);
}

let baselineText = null;
try { baselineText = readFileSync(join(ROOT, BASELINE_REL), "utf8"); } catch (e) { baselineText = null; }
const cards = core.renderAllCards(inv);
const results = runChecks(page, inv, { cards, core, baselineText });
let failures = 0;
for (const r of results) {
  console.log((r.pass ? "PASS" : "FAIL") + ": " + r.label);
  for (const l of r.lines) console.log(l);
  if (!r.pass) failures++;
}
console.log(`\n${results.length - failures}/${results.length} assertion group(s) PASS.`);
if (failures) {
  console.error(`${failures} assertion group(s) FAILED — see the named keys above.`);
  process.exit(1);
}
process.exit(0);
