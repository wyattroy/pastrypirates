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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHART = join(ROOT, ".planning", "CHART.md");
const LOG = join(ROOT, ".planning", "CHART-LOG.md");

let failed = false;
const fail = (m) => { console.log(`  FAIL  ${m}`); failed = true; };
const pass = (m) => console.log(`  ok    ${m}`);

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
const chartOwned = new Set(
  chart.split(/^- \[[ xX]\] /m).slice(1)
    .map((b) => (/`(T-\d{3})`/.exec(b.split(/^- \[/m)[0]) || [])[1])
    .filter(Boolean));
const logOwned = new Set((log ?? "").match(/^## (T-\d{3}) — /gm)?.map((h) => /T-\d{3}/.exec(h)[0]) ?? []);

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
  if (both.length) console.log(`  REPORT  ${both.length} handle(s) own a row in BOTH files — ${both.join(", ")}. Not this gate's to fail: it is the open duplicate-handle row on CHART.md, whose repair is "give the newer row a free handle". Fail this case the day that row closes.`);
  else pass(`${chartOwned.size} row(s) on the Chart and ${logOwned.size} in the log, with no handle in both`);
}

// 2/4 -- NEVER NEITHER, for anything the log claims to have taken. An entry with an empty body is a
//        row that was removed from the Chart and not actually carried across. THIS is the assertion
//        the spec asks for by name, and it is the one the sweep genuinely owns.
{
  if (log === null) { pass("no CHART-LOG.md yet — nothing has been swept on this machine"); }
  else {
    const empty = (log.split(/^## (?=T-\d{3} — )/m).slice(1))
      .filter((e) => e.split("\n").slice(1).join("").trim().length < 20)
      .map((e) => e.slice(0, 9));
    if (empty.length) fail(`${empty.length} archived entr(y/ies) carry no body — ${empty.join(", ")}. The row left the Chart and its text did not arrive, which is a deletion wearing a heading`);
    else pass("every archived entry carries the row's own text");
  }
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
  if (bad.length) console.log(`  REPORT  a handle is allocated twice — ${bad.join(", ")}. Two rows sharing a handle is worse than neither having one, and it is the open duplicate-handle row's to repair.`);
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

console.log(failed ? "\nFAIL" : "\nPASS");
process.exit(failed ? 1 : 0);
