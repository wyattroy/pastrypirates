#!/usr/bin/env node
// scripts/host_guest_parity_check.js
//
// G26 (Wyatt-approved 2026-07-30) — THE HOST/GUEST PARITY GATE D-56 RECOMMENDED AND NOBODY WROTE.
//
// Mirrors scripts/ui_contract_check.js's structure exactly: shebang, a header naming what is gated
// and why, one PASS/FAIL line per assertion, every assertion run before exit so a single run
// reports every problem, named failures, and a `--drill` mode that proves each assertion CAN fail
// against synthetic fixtures under os.tmpdir(). Static source scan, no DOM — the same technique
// ui_contract_check.js and no_undef_check.js already use.
//
// ============================================================================
// Why this exists
// ============================================================================
// D-56's own words about the host and guest prompt renderers: they *"match by discipline, not by
// structure — nothing enforces it, and nothing would notice if they diverged tomorrow."* Four
// drifts later that prediction is the whole problem:
//
//   F7    prompt delivery leak      — gated, by ui_contract_check.js assertion 7
//   D-35  sail-prompt wording fork  — structurally safe (the guest renders the host's `msg`),
//                                     and the class vocabulary it travels in is gated HERE
//   D-55  sail-highlight rect drift — FIXED 2026-07-30 (G25, one shared builder), gated by
//                                     assertion 2 below
//   D-57  two narration schedulers  — still unenforced; recorded in
//                                     .planning/todos/pending/narration-two-schedulers-unenforced.md
//
// A drift is cheap to introduce (edit one renderer, forget the other) and expensive to find: every
// one of the four was discovered by a human staring at two browser windows. This gate makes the
// cheap half loud.
//
// ============================================================================
// The assertions
// ============================================================================
// 1. PROMPT CLASS VOCABULARY PARITY. The set of panel class tokens the HOST path emits
//    (localAsk, src/ui/flow.js) equals the set the GUEST path emits (watchPrompt's ask branch,
//    src/orchestrator.js). Fails NAMING the class present on one side and missing on the other —
//    that message is the whole value of the gate. Both sides satisfy this today; it exists so the
//    next edit to one cannot silently skip the other.
// 2. ONE SAIL-HIGHLIGHT BUILDER. In src/ui/flow.js exactly one rect builder carries the sailCell
//    class, both localPickCell and remotePickHighlights call the shared sailHighlightRect(), and
//    neither builds an el("rect" of its own. This is G25's fix, made permanent.
// 3. ONE RIM-SWEEP STEPPER (added by G14, in the same commit that ships the stepper — an assertion
//    whose subject does not exist yet either fails for an unrelated reason or is written loosely
//    enough to pass an empty tree). Exactly one rimSweepPath definition; src/orchestrator.js calls
//    the shared animateRimSweepIfAny() and contains NEITHER rimCellInfo NOR rimHead — i.e. the
//    guest tier does not reimplement the ring walk.
//
// ============================================================================
// Comment stripping, and why it is not optional here
// ============================================================================
// Every assertion below runs against source with FULL-LINE leading comments removed (the same
// technique scripts/narration_flow_test.js uses). Without it, a renderer that MENTIONS `apDisabled`
// in a comment while no longer emitting it would pass — the exact vacuous check this project has
// caught three times in two days. Drill 1c pins that: a token present only in a comment must not
// count as emitted.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REAL_ROOT = path.join(__dirname, "..");

const FLOW_REL = path.join("src", "ui", "flow.js");
const ORCH_REL = path.join("src", "orchestrator.js");

const mk = (name) => ({ name, ok: true, failures: [], notes: [] });
const fail = (res, msg) => { res.ok = false; res.failures.push(msg); };
const note = (res, msg) => { res.notes.push(msg); };

const read = (root, rel) => {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
};

// full-line leading comments only — a trailing `//` strip would eat the `https://` inside string
// literals, the same false-negative net_contract_check.js's header warns about
const stripComments = (src) => src.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n");

// slice a named function's body: from its header to the next TOP-LEVEL `export ` (column 0), or to
// end of file. Located by CONTENT — never by line number — so a line shift makes this go loud
// rather than silently reading the wrong region.
function sliceFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) return null;
  const j = src.indexOf("\nexport ", i + header.length);
  return src.slice(i, j < 0 ? src.length : j);
}

/* ================= Assertion 1: prompt class vocabulary parity ================= */
// The panel class vocabulary both renderers draw from. Every token here is a class the action
// panel's CSS styles; a renderer that stops emitting one is rendering a materially different
// prompt from its twin. ` recipes` is the grid MODIFIER on .apBtns (a multi-column recipe layout),
// carried as its own token because it is emitted by a separate ternary on each side.
const PANEL_CLASS_VOCAB = ["apBack", "apMsg", "apBtns", "apBtn", "apDisabled", "apSub", " recipes"];

export function checkPromptClassParity(root) {
  const res = mk("assertion 1 — prompt class vocabulary parity (localAsk vs watchPrompt)");
  const flow = read(root, FLOW_REL);
  const orch = read(root, ORCH_REL);
  if (flow === null) { fail(res, `${FLOW_REL} is missing — the host prompt renderer has nothing to compare`); return res; }
  if (orch === null) { fail(res, `${ORCH_REL} is missing — the guest prompt renderer has nothing to compare`); return res; }

  const hostRegion = sliceFn(stripComments(flow), "export function localAsk(");
  const guestRegion = sliceFn(stripComments(orch), "export function watchPrompt(");
  if (!hostRegion) { fail(res, `localAsk() was not located in ${FLOW_REL} — if it was renamed, re-anchor this gate; do NOT delete the assertion`); return res; }
  if (!guestRegion) { fail(res, `watchPrompt() was not located in ${ORCH_REL} — if it was renamed, re-anchor this gate; do NOT delete the assertion`); return res; }

  const hostSet = new Set(PANEL_CLASS_VOCAB.filter((t) => hostRegion.includes(t)));
  const guestSet = new Set(PANEL_CLASS_VOCAB.filter((t) => guestRegion.includes(t)));

  for (const t of PANEL_CLASS_VOCAB) {
    const h = hostSet.has(t), g = guestSet.has(t);
    if (h && !g) fail(res, `PARITY-CLASS: the host prompt renderer (localAsk, ${FLOW_REL}) emits ${JSON.stringify(t)} and the guest renderer (watchPrompt, ${ORCH_REL}) does NOT — a guest seeing this prompt gets different markup from the host. Emit it on both sides, or remove it from both.`);
    if (g && !h) fail(res, `PARITY-CLASS: the guest prompt renderer (watchPrompt, ${ORCH_REL}) emits ${JSON.stringify(t)} and the host renderer (localAsk, ${FLOW_REL}) does NOT — a host seeing this prompt gets different markup from the guest. Emit it on both sides, or remove it from both.`);
  }
  note(res, `class vocabulary: ${hostSet.size} token(s) on the host, ${guestSet.size} on the guest, of ${PANEL_CLASS_VOCAB.length} in the vocabulary`);
  return res;
}

/* ================= Assertion 2: one sail-highlight builder ================= */
export function checkOneSailHighlightBuilder(root) {
  const res = mk("assertion 2 — one sail-highlight builder serves host and guest (D-55/G25)");
  const flow = read(root, FLOW_REL);
  if (flow === null) { fail(res, `${FLOW_REL} is missing`); return res; }
  const live = stripComments(flow);

  const builders = (live.match(/class:"sailCell"/g) || []).length;
  if (builders !== 1) {
    fail(res, `PARITY-SAILRECT: ${builders} rect builder(s) in ${FLOW_REL} carry class:"sailCell", expected exactly 1. Two builders is how D-55 happened — the guest's squares were a different orange, dimmer, unanimated and unhoverable for a whole phase. One builder, called by both paths.`);
  }
  if (!/export function sailHighlightRect\(/.test(live)) {
    fail(res, `PARITY-SAILRECT: the shared builder sailHighlightRect() is not exported from ${FLOW_REL} — without it there is nothing for the two pick paths to share.`);
  }
  for (const fn of ["localPickCell", "remotePickHighlights"]) {
    const body = sliceFn(live, `export function ${fn}(`);
    if (!body) { fail(res, `PARITY-SAILRECT: ${fn}() was not located in ${FLOW_REL} — re-anchor this gate rather than deleting the assertion.`); continue; }
    if (!/sailHighlightRect\(/.test(body)) fail(res, `PARITY-SAILRECT: ${fn}() does not call sailHighlightRect() — it is drawing its own sail squares, which is exactly the drift D-55 recorded.`);
    if (/el\("rect"/.test(body)) fail(res, `PARITY-SAILRECT: ${fn}() still builds an el("rect" of its own — move those attributes into sailHighlightRect() so there is one place that decides what a sail square looks like.`);
  }
  if (/fill:"#fdb63d"/.test(live)) {
    fail(res, `PARITY-SAILRECT: the guest's old #fdb63d fill survives in ${FLOW_REL} — the host's #ffc23a is the approved colour on both seats.`);
  }
  note(res, `sail-highlight builders carrying the sailCell class: ${builders}`);
  return res;
}

/* ================= Assertion 3: one rim-sweep stepper ================= */
// Added by G14/T12. Written to be VACUOUS-PROOF: if the stepper does not exist yet, this fails
// loudly rather than passing because it found nothing to check.
export function checkOneRimSweepStepper(root) {
  const res = mk("assertion 3 — one rim-sweep stepper serves host and guest (G14)");
  const flow = read(root, FLOW_REL);
  const orch = read(root, ORCH_REL);
  if (flow === null) { fail(res, `${FLOW_REL} is missing`); return res; }
  if (orch === null) { fail(res, `${ORCH_REL} is missing`); return res; }
  const liveFlow = stripComments(flow), liveOrch = stripComments(orch);

  const defs = (liveFlow.match(/export function rimSweepPath\(/g) || []).length;
  if (defs !== 1) {
    fail(res, `PARITY-RIMSWEEP: ${defs} rimSweepPath definition(s) in ${FLOW_REL}, expected exactly 1. The rim walk is pure geometry over a static ring; two copies of it is two chances to disagree about where a ship goes.`);
  }
  if (!/animateRimSweepIfAny/.test(liveOrch)) {
    fail(res, `PARITY-RIMSWEEP: ${ORCH_REL} never calls animateRimSweepIfAny() — the guest is not driving the shared stepper, so a guest watching a trade-wind sweep sees the ship teleport while the host sees it travel.`);
  }
  for (const sym of ["rimCellInfo", "rimHead"]) {
    if (new RegExp(`\\b${sym}\\b`).test(liveOrch)) {
      fail(res, `PARITY-RIMSWEEP: ${ORCH_REL} reads ${sym} directly — the guest tier is reimplementing the rim walk instead of calling the one shared stepper. That is the fork this assertion exists to prevent.`);
    }
  }
  note(res, `rimSweepPath definitions: ${defs}; the guest tier drives the shared stepper`);
  return res;
}

/* ================= Runner ================= */
function runAll(root, { quiet = false } = {}) {
  const log = quiet ? () => {} : (...args) => console.log(...args);
  const results = [];

  const a1 = checkPromptClassParity(root);
  log(`${a1.ok ? "PASS" : "FAIL"} ${a1.name}`);
  for (const n of a1.notes) log(`      ${n}`);
  results.push(a1);

  const a2 = checkOneSailHighlightBuilder(root);
  log(`${a2.ok ? "PASS" : "FAIL"} ${a2.name}`);
  for (const n of a2.notes) log(`      ${n}`);
  results.push(a2);

  const a3 = checkOneRimSweepStepper(root);
  log(`${a3.ok ? "PASS" : "FAIL"} ${a3.name}`);
  for (const n of a3.notes) log(`      ${n}`);
  results.push(a3);

  return results;
}

/* ================= --drill: prove each assertion CAN fail ================= */
// Builds a disposable fixture tree under os.tmpdir(), one synthetic violation at a time, runs the
// SAME check function against it, and asserts the result is FAIL. Never touches the real src/.
// Exits 1 if any assertion fails to demonstrate a FAIL against its own synthetic violation — that
// would mean the check is broken, not that the tree is clean.
function drill() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pp-parity-drill-"));
  let allOk = true;

  const fixture = (rel, content) => {
    const full = path.join(tmpRoot, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  const resetFixture = () => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    fs.mkdirSync(tmpRoot, { recursive: true });
  };
  const expect = (label, r, wantFail, marker) => {
    const ok = wantFail
      ? (!r.ok && (!marker || r.failures.some((f) => f.includes(marker))))
      : r.ok;
    console.log(`${ok ? "PASS" : "FAIL"} ${label} — expected ${wantFail ? "FAIL" : "PASS"}${marker ? ` naming ${marker}` : ""}, got ${r.ok ? "PASS" : "FAIL"}`);
    for (const f of r.failures) console.log(`    ${f}`);
    if (!ok) allOk = false;
  };

  // --- a well-formed pair, used as the base for the positive controls ---
  const GOOD_HOST_ASK = [
    `export function localAsk(msg,opts,colors,sub){`,
    `  const backHtml=backIdx!==-1?\`<button class="apBack" data-i="\${backIdx}">‹</button>\`:"";`,
    `  const subHtml=sub?\`<div class="apSub">\${sub}</div>\`:"";`,
    `  const grid=rest.some(x=>x.o.cls)?" recipes":"";`,
    `  panel(\`\${backHtml}<div class="apMsg">\${msg}</div><div class="apBtns\${grid}">\`+`,
    `    rest.map(x=>\`<button class="apBtn \${x.o.cls||""}\${x.o.disabled?" apDisabled":""}">\${x.o.label}</button>\`).join("")+\`</div>\${subHtml}\`,true);`,
    `}`,
    ``,
  ].join("\n");
  const GOOD_GUEST_ASK = [
    `export function watchPrompt(){`,
    `  const backHtml=backIdx>=0?\`<button class="apBack" data-i="\${backIdx}">‹</button>\`:"";`,
    `  const subHtml=p.sub?\`<div class="apSub">\${p.sub}</div>\`:"";`,
    `  const grid=cls.some(c=>c)?" recipes":"";`,
    `  panel(\`\${backHtml}<div class="apMsg">\${p.msg}</div><div class="apBtns\${grid}">\`+`,
    `    rest.map(x=>\`<button class="apBtn \${cls[x.i]||""}\${dis[x.i]?" apDisabled":""}">\${x.l}</button>\`).join("")+\`</div>\${subHtml}\`,true);`,
    `}`,
    ``,
  ].join("\n");

  // 1a: the guest branch stops emitting apDisabled — a greyed option renders ungreyed on a guest
  resetFixture();
  fixture(FLOW_REL, GOOD_HOST_ASK);
  fixture(ORCH_REL, GOOD_GUEST_ASK.replace(`\${dis[x.i]?" apDisabled":""}`, ""));
  expect("drill 1a (guest renderer drops apDisabled)", checkPromptClassParity(tmpRoot), true, "apDisabled");

  // 1b: the HOST side drops one instead — the gate must be symmetric, or half the drifts sail past
  resetFixture();
  fixture(FLOW_REL, GOOD_HOST_ASK.replace(`const subHtml=sub?\`<div class="apSub">\${sub}</div>\`:"";`, `const subHtml="";`));
  fixture(ORCH_REL, GOOD_GUEST_ASK);
  expect("drill 1b (HOST renderer drops apSub — the gate is symmetric)", checkPromptClassParity(tmpRoot), true, "apSub");

  // 1c: a token present ONLY in a comment must NOT count as emitted. This is the anti-vacuity
  //     control: without comment stripping, a renderer that merely TALKS about apDisabled passes.
  resetFixture();
  fixture(FLOW_REL, GOOD_HOST_ASK);
  fixture(ORCH_REL, GOOD_GUEST_ASK.replace(`\${dis[x.i]?" apDisabled":""}`, "") .replace("export function watchPrompt(){", "// this renderer used to emit apDisabled\nexport function watchPrompt(){"));
  expect("drill 1c (a class named only in a COMMENT does not count as emitted)", checkPromptClassParity(tmpRoot), true, "apDisabled");

  // 1d: negative control — a matched pair passes, so 1a-1c fail for the right reason
  resetFixture();
  fixture(FLOW_REL, GOOD_HOST_ASK);
  fixture(ORCH_REL, GOOD_GUEST_ASK);
  expect("drill 1d (negative control — a matched pair passes)", checkPromptClassParity(tmpRoot), false);

  // --- assertion 2 fixtures ---
  const GOOD_PICK = [
    `export function sailHighlightRect(c,cellPx,svg){`,
    `  return el("rect",{x:c[0]*cellPx+2,rx:6,fill:"#ffc23a",class:"sailCell"},svg);`,
    `}`,
    `export function localPickCell(p,cells){`,
    `  cells.forEach(c=>{const r=sailHighlightRect(c,cellPx,svg);hs.push(r);});`,
    `}`,
    `export function remotePickHighlights(cells,promptId,msg){`,
    `  for(const c of cells){const r=sailHighlightRect(c,cellPx,svg);hs.push(r);}`,
    `}`,
    ``,
  ].join("\n");

  // 2a: the guest path builds its own class-less rect again — D-55, exactly as it was
  resetFixture();
  fixture(FLOW_REL, GOOD_PICK.replace(
    `  for(const c of cells){const r=sailHighlightRect(c,cellPx,svg);hs.push(r);}`,
    `  for(const c of cells){const r=el("rect",{rx:5,fill:"#fdb63d",opacity:.4},svg);hs.push(r);}`));
  expect("drill 2a (guest rebuilds its own class-less rect — D-55 reintroduced)", checkOneSailHighlightBuilder(tmpRoot), true, "PARITY-SAILRECT");

  // 2b: two builders both carry the class — the "match by discipline" state D-56 warned about
  resetFixture();
  fixture(FLOW_REL, GOOD_PICK.replace(
    `  for(const c of cells){const r=sailHighlightRect(c,cellPx,svg);hs.push(r);}`,
    `  for(const c of cells){const r=el("rect",{rx:6,fill:"#ffc23a",class:"sailCell"},svg);hs.push(r);}`));
  expect("drill 2b (two builders carry the class — matching by discipline, not structure)", checkOneSailHighlightBuilder(tmpRoot), true, "expected exactly 1");

  // 2c: negative control
  resetFixture();
  fixture(FLOW_REL, GOOD_PICK);
  expect("drill 2c (negative control — one builder, both callers)", checkOneSailHighlightBuilder(tmpRoot), false);

  // --- assertion 3 fixtures ---
  const GOOD_SWEEP_FLOW = `export function rimSweepPath(game,from){return [];}\nexport async function animateRimSweepIfAny(){}\n`;
  const GOOD_SWEEP_ORCH = `export function watchEvents(){ await animateRimSweepIfAny(); render(); }\n`;

  // 3a: the guest walks the ring itself instead of calling the shared stepper
  resetFixture();
  fixture(FLOW_REL, GOOD_SWEEP_FLOW);
  fixture(ORCH_REL, `export function watchEvents(){ const ring=appState.game.rimCellInfo; await animateRimSweepIfAny(); render(); }\n`);
  expect("drill 3a (guest reimplements the ring walk via rimCellInfo)", checkOneRimSweepStepper(tmpRoot), true, "rimCellInfo");

  // 3b: the guest never calls the stepper at all — the ship teleports on one seat and travels on the other
  resetFixture();
  fixture(FLOW_REL, GOOD_SWEEP_FLOW);
  fixture(ORCH_REL, `export function watchEvents(){ render(); }\n`);
  expect("drill 3b (guest never drives the shared stepper)", checkOneRimSweepStepper(tmpRoot), true, "animateRimSweepIfAny");

  // 3c: ANTI-VACUITY — the stepper does not exist. The assertion must FAIL, not pass because it
  //     found nothing to check. This is the form of vacuous check this project has caught three
  //     times in two days.
  resetFixture();
  fixture(FLOW_REL, `export function localPickCell(){}\n`);
  fixture(ORCH_REL, `export function watchEvents(){ render(); }\n`);
  expect("drill 3c (anti-vacuity — no stepper at all must FAIL, not silently pass)", checkOneRimSweepStepper(tmpRoot), true, "expected exactly 1");

  // 3d: negative control
  resetFixture();
  fixture(FLOW_REL, GOOD_SWEEP_FLOW);
  fixture(ORCH_REL, GOOD_SWEEP_ORCH);
  expect("drill 3d (negative control — one stepper, guest drives it)", checkOneRimSweepStepper(tmpRoot), false);

  // --- final negative control: the REAL tree passes every assertion, which is what proves the
  //     fixes and the gate agree ---
  {
    const r = runAll(REAL_ROOT, { quiet: true });
    const ok = r.every((x) => x.ok);
    console.log(`${ok ? "PASS" : "FAIL"} drill Z (negative control — the REAL tree passes all three) — expected PASS, got ${ok ? "PASS" : "FAIL"}`);
    for (const x of r) for (const f of x.failures) console.log(`    ${f}`);
    if (!ok) allOk = false;
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });
  console.log(`\n${allOk ? "ALL 3 ASSERTIONS RED-PROOF DRILLED OK" : "DRILL FAILURE — an assertion did not fail against its own synthetic violation"}`);
  process.exit(allOk ? 0 : 1);
}

/* ================= Entry ================= */
// Guarded on being the MAIN module. The check functions are exported so a one-off red-proof can
// run them against an arbitrary tree (e.g. `git show <sha>:src/ui/flow.js` written to a temp root,
// which is how assertion 2 was proven to fail against the pre-G25 tree). Without this guard the
// entry block runs on IMPORT and process.exit()s before the caller's own code does, which silently
// prints this gate's own verdict and looks like the caller's result — a false red-proof.
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!IS_MAIN) {
  // imported for reuse — nothing runs
} else if (process.argv.includes("--drill")) {
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
