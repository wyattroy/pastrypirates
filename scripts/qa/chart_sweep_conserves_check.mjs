#!/usr/bin/env node
// GATE: the sweep may never lose a row, and the two records may never both claim one.
//
// This is the guardrail `SPEC-CHARTKEEPER.md` PASS 4 asks for by name — *every closed `T-nnn`
// appears in exactly one of the two files, never both, never neither* — and it is the reason the
// spec chose a dedicated `.planning/CHART-LOG.md` over `CTO-LEDGER.md`: against a 1,700-line file
// carrying six other kinds of entry, this assertion cannot be written at all.
//
// WHY IT IS A GATE ON THE REAL FILES AND NOT ONLY A FIXTURE CASE. `chartkeeper_check.mjs` proves
// the TOOL conserves rows on a fixture. It cannot see the tree. Sweeping is the only thing in this
// whole system that DELETES from the document Wyatt reads, so the tree itself is worth an assertion
// — and it caught its own subject the day it was written: another session, in this same checkout,
// ran the sweep on the real Chart while the tool was still being edited. 612 lines left CHART.md.
// Nothing but a check on the real files can tell you whether that was a move or a deletion.
//
// WHAT IS DELIBERATELY *NOT* ASSERTED: that CHART.md holds no `- [x]` row. A row is ticked by
// `close_item.mjs` and swept in the same act, but a person may tick one by hand between two runs,
// and failing the build for that would punish the record-keeping rather than the record. The sweep
// takes it on the next pass. What must never happen is a row existing twice, or not at all.
//
// House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { idOfRow } from "../wyclau/lib/chart_model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHART = join(ROOT, ".planning", "CHART.md");
const LOG = join(ROOT, ".planning", "CHART-LOG.md");

let failed = false;
const fail = (m) => { console.log(`  FAIL  ${m}`); failed = true; };
const pass = (m) => console.log(`  ok    ${m}`);
/* A finding this gate has MEASURED but does not own — it prints in full and is counted into the
   verdict line, so a run can never read as clean while naming defects. See cases 1 and 3. */
const REPORTS = [];
const report = (m) => { REPORTS.push(m); console.log(`  REPORT  ${m}`); };

console.log("a swept row is in exactly one of the two records\n");

if (!existsSync(CHART)) {
  fail(`no Chart at ${CHART} — this gate cannot check anything, which is worse than failing`);
  console.log("\nFAIL");
  process.exit(1);
}
const chart = readFileSync(CHART, "utf8");
const log = existsSync(LOG) ? readFileSync(LOG, "utf8") : null;

/* A row's handle, read from the row it belongs to — never from a whole-file grep. His tables and
   other rows NAME handles as references, and a reference is not a claim of ownership. The owner of
   `T-007` is the checklist row (Chart) or the `## T-007 — …` entry (log) that carries its body. */
/* ⚠ AND OWNERSHIP IS THE TOOL'S OWN MARKER LINE, NOT A RECONSTRUCTION OF IT. The first version of
   this file split on `- [ ]`/`- [x]` — which misses every IDEA INBOX row, because those start
   `- **`. Measured before it was fixed: **16 handles reported as owned by nothing**, one of them
   `T-084`, a row filed an hour earlier. A conservation check that invents 16 lost rows is worse
   than no conservation check, because the first person to read it learns to ignore it. */
/* ⚠ AND THE MARKER LINE MAY CARRY FIELDS BESIDE THE HANDLE. THIS GATE SAID IT MAY NOT, AND THAT
   COST A FALSE `npm test` FAILURE FOR EVERY SESSION ON THE BRANCH — found 2026-09-03T02:2xZ.
   It read `⟨`(T-\d{3})`⟩` — handle alone, nothing else inside the brackets — while
   `chartkeeper.mjs` writes `⟨`T-121` · size: S⟩` and `headField()` splits that same bracket on `·`
   to read `needs:` and `size:`. So the four rows the 01:0xZ watch filed WITH a size field were
   invisible to `ownedIn`, and this gate reported them as **"4 allocated handle(s) are owned by
   NOTHING in either file"** — four rows announced as fallen between the two records when all four
   were sitting on the Chart, in order, with their bodies intact.

   ⚑ THE POINT, AND IT IS RULE 23's: `chart_model.mjs:205-213` DOCUMENTS THIS EXACT FAULT AND FIXED
   IT THERE, on 2026-09-02, in a comment headed "the head line may carry fields beside the handle,
   and until 2026-09-02 this pattern said it may not". **This file kept a private copy of the old
   pattern**, so the repair reached one of the two readers. Two readers of one line, disagreeing
   about its grammar — which is the thing that comment was written to stop. The copy is gone: the
   handle is now read by the one shared definition, so a third field tomorrow cannot split them
   again. */
const ownedIn = (md) =>
  md.split("\n").map((l) => (/^\s*⟨/.test(l) ? idOfRow([l]) : null)).filter(Boolean);
const archivedIn = (md) => (md.match(/^## (T-\d{3}) — /gm) || []).map((h) => /T-\d{3}/.exec(h)[0]);
const chartOwned = new Set(ownedIn(chart));
const logOwned = new Set(archivedIn(log ?? ""));

/** Handles allocated below the highest one and owned by no row in either record. */
function missingHandles(inChart, inLog) {
  const owned = new Set([...inChart, ...inLog]);
  if (!owned.size) return [];
  const max = Math.max(...[...owned].map((h) => Number(h.slice(2))));
  const out = [];
  for (let i = 1; i <= max; i++) {
    const h = `T-${String(i).padStart(3, "0")}`;
    if (!owned.has(h)) out.push(h);
  }
  return out;
}

/* 1/4 -- NEVER BOTH, AND THIS ONE REPORTS RATHER THAN FAILS. READ WHY BEFORE CHANGING IT.
 *
 * A handle owning a row in BOTH files means the two records can disagree about one item. On the day
 * this gate was written it found two — `T-078` and `T-079` — and **neither was caused by the
 * sweep.** They are the already-filed duplicate-handle defect: `CHART.md` carries three separate
 * open rows all stamped `T-079` and a second `T-078`, found 2026-09-02T12:5xZ by the watch that
 * closed `T-079`, and written up as its own row with the repair already chosen ("give the NEWER row
 * a free handle"). The sweep simply moved one of each pair to the log, so the collision changed
 * address without changing shape.
 *
 * SO THIS IS A SCOPE LINE, NOT A WEAKENING, and the difference matters: failing the build here
 * would block every watch on a defect that predates this change and belongs to another open row,
 * and *fixing* it here would close that row without the CEO verdict `close_item.mjs` requires.
 * What it must never do is go quiet — a duplicate handle is load-bearing now that ranking,
 * blocking and citations all key on `T-nnn`. So it prints the whole list, by name, every run.
 *
 * ⚑ TURN THIS INTO A `fail()` THE DAY THE DUPLICATE-HANDLE ROW CLOSES. That is one word. */
{
  const both = [...chartOwned].filter((h) => logOwned.has(h));
  if (both.length) report(`${both.length} handle(s) own a row in BOTH files — ${both.join(", ")}. Not this gate's to fail: it is the open duplicate-handle row on CHART.md, whose repair is "give the newer row a free handle". Fail this case the day that row closes.`);
  else pass(`${chartOwned.size} row(s) on the Chart and ${logOwned.size} in the log, with no handle in both`);
}

/* 2/4 -- NEVER NEITHER. THIS is the assertion the spec asks for by name, and it is the one the
 *        sweep genuinely owns. Two halves, and the first version of this file only had the weaker
 *        one — CEO 107 caught exactly that: "case 2 only checks entries that ALREADY ARRIVED."
 *
 *   (a) A HANDLE THAT EXISTED AND IS NOW OWNED BY NOTHING. Handles are allocated sequentially by
 *       `nextId()` and never reused, so a GAP below the highest one is a row that was allocated and
 *       has since left both records. **That is derivable from the two files alone** — no git
 *       archaeology, nothing to keep in step, and it fails the day a sweep drops something on the
 *       floor. Measured on the real tree the day it was written: 87 distinct handles up to T-087,
 *       ZERO gaps.
 *   (b) An entry with no body: the row left the Chart and its text did not arrive. A deletion
 *       wearing a heading.
 *
 *  RED-PROOFED BELOW, in case 2r, because a conservation check that has only ever been green on a
 *  conserved tree has not been shown to fail. */
{
  if (log === null) { pass("no CHART-LOG.md yet — nothing has been swept on this machine"); }
  else {
    const gaps = missingHandles(chartOwned, logOwned);
    if (gaps.length) fail(`${gaps.length} allocated handle(s) are owned by NOTHING in either file — ${gaps.slice(0, 8).join(", ")}. Handles are allocated once and never reused, so a gap is a row that existed and has left both records: the one failure a sweep cannot undo`);
    else pass(`every handle up to the highest allocated is owned by exactly one row — no row has fallen between the two files`);

    const empty = (log.split(/^## (?=T-\d{3} — )/m).slice(1))
      .filter((e) => e.split("\n").slice(1).join("").trim().length < 20)
      .map((e) => e.slice(0, 9));
    if (empty.length) fail(`${empty.length} archived entr(y/ies) carry no body — ${empty.join(", ")}. The row left the Chart and its text did not arrive, which is a deletion wearing a heading`);
    else pass("every archived entry carries the row's own text");
  }
}

/* 2r/4 -- THE RED-PROOF FOR BOTH HALVES OF CASE 2, on fabricated records rather than the tree.
 *         The commit that first shipped this gate claimed it was red-proofed and it was not — the
 *         claim is corrected here rather than quietly dropped, because an unearned "red-proofed" is
 *         the same currency as an unmeasured defect (rule 6). CEO 107 found it in one pass. */
{
  const chartFixture = "- [ ] **A ROW**\n      ⟨`T-001`⟩\n- [ ] **ANOTHER**\n      ⟨`T-003`⟩\n";
  const logFixture = "## T-004 — 2026-09-02 — **AN ARCHIVED ROW**\n\n- [x] **AN ARCHIVED ROW** with a body long enough to count.\n";
  const gaps = missingHandles(new Set(ownedIn(chartFixture)), new Set(archivedIn(logFixture)));
  if (!gaps.includes("T-002")) fail(`the gap check cannot fail: handles 1, 3 and 4 exist, 2 does not, and it reported ${JSON.stringify(gaps)}`);
  else pass("red-proof: a handle owned by neither record is caught");

  const hollow = ("## T-005 — 2026-09-02 — **A HOLLOW ENTRY**\n\n\n").split(/^## (?=T-\d{3} — )/m).slice(1)
    .filter((e) => e.split("\n").slice(1).join("").trim().length < 20);
  if (!hollow.length) fail("the empty-body check cannot fail: an archive entry with nothing under its heading was not caught");
  else pass("red-proof: an archived entry with no body is caught");
}

/* 3/4 -- HANDLES ARE NEVER REUSED. The whole value of `T-nnn` is that a CEO verdict, a commit
 *        message and a ledger line written weeks apart all mean the same row. Same scope line as
 *        case 1, same reason, and it found the same defect from the other side: three open rows on
 *        the Chart stamped `T-079`, and two archive entries apiece for `T-057` and `T-058` from
 *        eras a month apart. Printed in full, owned by the duplicate-handle row. */
{
  const dupes = (where, list) => {
    const seen = new Map();
    for (const m of list) seen.set(m, (seen.get(m) ?? 0) + 1);
    return [...seen].filter(([, n]) => n > 1).map(([k, n]) => `${where}:${k}×${n}`);
  };
  const chartList = chart.split(/^- \[[ xX]\] /m).slice(1)
    .map((b) => (/`(T-\d{3})`/.exec(b.split(/^- \[/m)[0]) || [])[1]).filter(Boolean);
  const logList = (log ?? "").match(/^## (T-\d{3}) — /gm)?.map((x) => /T-\d{3}/.exec(x)[0]) ?? [];
  const bad = [...dupes("chart", chartList), ...dupes("log", logList)];
  if (bad.length) report(`a handle is allocated twice — ${bad.join(", ")}. Two rows sharing a handle is worse than neither having one, and it is the open duplicate-handle row's to repair.`);
  else pass("every handle is allocated to exactly one row, in each file");
}

// 4/4 -- THE SETTLED RULINGS TABLE LIVES IN EXACTLY ONE PLACE. His ruling swept it to the log; a
//        copy left behind in the Chart is a second source of truth for his own decisions.
{
  const inChart = /^## SETTLED RULINGS/m.test(chart);
  const inLog = /^## SETTLED RULINGS/m.test(log ?? "");
  if (inChart && inLog) fail("`## SETTLED RULINGS` exists in BOTH CHART.md and CHART-LOG.md — his answered rulings now have two homes, and nothing says which one anything reads");
  else pass(inLog ? "his settled rulings live in the log, and only there" : "his settled rulings are still in the Chart, awaiting the first sweep");
}

/* ⚠ "PASS" ALONE READ AS A CLEAN BILL WHILE SIX DEFECTS WERE PRINTED ABOVE IT — CEO 107's words,
   and it was right: a verdict line that ignores its own REPORT lines is the shape of every
   reassuring gate this project has been burned by. The count goes in the verdict. */
const reported = REPORTS.length;
console.log(failed
  ? "\nFAIL"
  : reported
    ? `\nPASS — the sweep conserved everything. ${reported} finding(s) REPORTED above and owned by the open duplicate-handle row, not by this gate.`
    : "\nPASS");
process.exit(failed ? 1 : 0);
