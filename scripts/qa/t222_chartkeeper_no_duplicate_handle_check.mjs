#!/usr/bin/env node
/* t222_chartkeeper_no_duplicate_handle_check.mjs — a row that already carries a handle must never
 * be allocated a second one, even when its title wraps across physical lines before the marker.
 *
 * WHY (`T-222`, filed 2026-09-03T2040Z): a bare `chartkeeper.mjs --rank --write` run allocated
 * `T-233` and `T-234` onto two rows that already carried `T-014`/`T-092` a line or two below their
 * own (wrapped) title, splicing the new marker into the MIDDLE of the title text and splitting a
 * timestamp in half — "Filed 2026-09-01T19:30" / marker / blank line / "Z, measured, not fixed
 * (one item).**". Caught and repaired by hand at the time; never gated, so nothing stood between a
 * future watch and doing it again.
 *
 * THIS GATE IS BEHAVIOURAL, NOT A SOURCE GREP (same reason as `chartkeeper_check.mjs`): it builds a
 * fixture Chart shaped like the two real corrupted rows — a title wrapping across two physical lines
 * BEFORE the row's own `⟨T-nnn⟩` marker line — runs the real `chartkeeper.mjs --rank --write`
 * against a throwaway copy, and reads what actually landed on disk afterwards.
 *
 * MEASURED, NOT ASSUMED, BEFORE WRITING THIS: `idOfRow()` (`scripts/wyclau/lib/chart_model.mjs`)
 * and `withId()`'s insertion guard (`scripts/wyclau/chartkeeper.mjs`) both scan EVERY line of a row
 * for a whole-line `⟨`T-nnn`⟩` marker, not just line index 1 — added 2026-09-04 for a different bug
 * (`T-090`/`T-240`, a handle mentioned in prose vs. the row's own head line). This gate is the
 * red-proof that that later, differently-motivated fix also closed T-222's hole, rather than
 * assuming it from reading the code.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KEEPER = join(ROOT, "scripts", "wyclau", "chartkeeper.mjs");

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures++; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("a row's own handle survives a title that wraps before it reaches the marker\n");

const tmp = mkdtempSync(join(tmpdir(), "t222-"));
process.on("exit", () => { try { rmSync(tmp, { recursive: true, force: true }); } catch {} });

const chartPath = join(tmp, "fixture.md");
const logPath = join(tmp, "fixture-LOG.md");

/* Shaped like the real corrupted rows: the checkbox line's title is cut off mid-sentence, the row's
   OWN handle marker sits on the very next line, a blank line follows (matching the real fixture's
   own layout), and the title's remainder ("Z, measured...") only resumes after that gap. If the
   allocator inserts a fresh handle instead of recognising this one, it will land at line index 1 —
   exactly where `⟨`T-014`⟩` already sits — and the count of `T-014` occurrences below will double. */
const FIXTURE = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] **A ROW WHOSE TITLE WRAPS ACROSS TWO PHYSICAL LINES BEFORE ITS OWN HANDLE MARKER. Filed 2026-09-01T19:30
  a second physical line of wrapped title text, still before the handle.
      ⟨\`T-014\`⟩

      Z, measured, not fixed (one item).**
  Body text continues here, unrelated to the title wrap above.
- [ ] **A SECOND ROW, SAME SHAPE, A DIFFERENT HANDLE. Filed 2026-09-01T20:15
  a second physical line of wrapped title text, still before the handle.
      ⟨\`T-092\`⟩

      Z, a second wrapped title with its own handle placed the same way.**
  More body text for the second row.

## THE IDEA INBOX
`;

writeFileSync(chartPath, FIXTURE);
const before = readFileSync(chartPath, "utf8");

let out = "";
try {
  out = execFileSync(process.execPath, [KEEPER, `--chart=${chartPath}`, `--log=${logPath}`, "--rank", "--write"], { encoding: "utf8", cwd: ROOT });
} catch (e) {
  fail(`chartkeeper.mjs threw against the fixture: ${(e.stdout ?? "") + (e.stderr ?? "")}`.slice(0, 2000));
}

const after = readFileSync(chartPath, "utf8");

const countOf = (text, needle) => (text.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;

// 1. Neither existing handle may appear more than once.
for (const h of ["T-014", "T-092"]) {
  const n = countOf(after, `⟨\`${h}\`⟩`);
  if (n === 1) pass(`\`${h}\`'s own handle line still appears exactly once`);
  else fail(`\`${h}\`'s handle line appears ${n} time(s) after the write — expected exactly 1 (0 = lost it, 2+ = a second marker was spliced in, T-222's own failure)`);
}

// 2. No BRAND NEW handle was minted for either row — this fixture must allocate zero ids.
const idsAllocatedLine = /WROTE\s+(\d+)\s+id\(s\) allocated/.exec(out);
const idsAllocated = idsAllocatedLine ? Number(idsAllocatedLine[1]) : null;
if (idsAllocated === 0) pass("chartkeeper's own report says 0 ids allocated — it recognised both existing handles");
else fail(`chartkeeper's own report says ${idsAllocated ?? "an unparseable number of"} id(s) allocated for a fixture where both rows already carry one — T-222's exact failure shape`);

// 3. The title text must not have been split by an inserted line landing between its two halves.
//    In the corrupted shape, "Filed 2026-09-01T19:30" and "Z, measured..." end up separated by a
//    freshly-inserted marker rather than by the ORIGINAL blank line + existing marker.
const WRAP_LINE = "a second physical line of wrapped title text, still before the handle.";
if (after.includes(`Filed 2026-09-01T19:30\n  ${WRAP_LINE}\n      ⟨\`T-014\`⟩`)) {
  pass("row 1's title-wrap-then-own-handle sequence is intact (no new line spliced between them)");
} else {
  fail("row 1's wrapped title is no longer immediately followed by its own `T-014` handle line — something was inserted or reordered between them");
}
if (after.includes(`Filed 2026-09-01T20:15\n  ${WRAP_LINE}\n      ⟨\`T-092\`⟩`)) {
  pass("row 2's title-wrap-then-own-handle sequence is intact (no new line spliced between them)");
} else {
  fail("row 2's wrapped title is no longer immediately followed by its own `T-092` handle line — something was inserted or reordered between them");
}

console.log(failures ? `\nFAIL (${failures})` : "\nPASS");
process.exit(failures ? 1 : 0);
