#!/usr/bin/env node
/* chartkeeper_check.mjs — the Chart must re-prioritise itself, and must never close anything.
 *
 * WHY (Wyatt, 2026-09-02, and it is the FOURTH time he has asked): "audit the chart ('tasks') which
 * has MANY completed tasks still stale on it, and design ... a system that will dynamically
 * reprioritize it, update it, and move things around it that is built into this process somehow."
 * The first three asks (00:59:32Z, 03:45:45Z/03:46:13Z, 03:49:02Z) are still sitting in the idea
 * inbox marked SCHEDULED. **The fix for the Chart's inability to re-prioritise was itself filed on
 * the Chart and never rose** — which is the spec's own acceptance test and is checked below.
 *
 * THIS GATE IS BEHAVIOURAL, NOT A SOURCE GREP. Every case builds a fixture Chart on disk, runs the
 * real `scripts/wyclau/chartkeeper.mjs` against it, and reads what it actually did. The project has
 * paid twice for the other kind: the sea trial's scorecard gate "greps source text, so it is green
 * and cannot fail" (CHART.md), and `doc_command_check.js` had a skip branch that could never fire.
 * A check that cannot fail is not a check.
 *
 * RED-PROOFED BOTH DIRECTIONS, which is guardrail 2 of the spec and the reason half these cases
 * exist: a reaper that flags everything is exactly as useless as one that flags nothing. So there
 * is a live row that must be LEFT ALONE and a dead row that must be FLAGGED, in the same fixture.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KEEPER = join(ROOT, "scripts", "wyclau", "chartkeeper.mjs");

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures++; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("the Chart re-prioritises itself, and never closes anything\n");

if (!existsSync(KEEPER)) {
  fail("scripts/wyclau/chartkeeper.mjs does not exist — the Chart has no way to re-order itself, so his four asks stay in file order");
  console.log(`\nFAIL (${failures})`);
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "chartkeeper-"));
process.on("exit", () => { try { rmSync(tmp, { recursive: true, force: true }); } catch {} });

/* Fixtures are written as real Chart files — the same two sections the Glass reads
   (`## STEP 1 CHECKLIST` and `## THE IDEA INBOX`), because the Chartkeeper's whole job is to be
   right about the list HIS PHONE renders, not about a tidier list of its own. */
const chartFile = (name, body) => {
  const p = join(tmp, `${name}.md`);
  writeFileSync(p, body);
  return p;
};

/* ⚠ EVERY RUN IS PINNED TO A THROWAWAY ARCHIVE, AND THE FIRST VERSION WAS NOT. Found by looking at
   `git status` rather than by any assertion: cases that pass `--write` without `--log` fell back to
   the tool's DEFAULT archive path, so this gate wrote three fixture rows — "A DONE ROW FROM LONG
   AGO — SHIPPED 2001-02-03" — into the repo's real `.planning/CHART-LOG.md`, and burned real row
   ids doing it. **A test that writes into the tree it measures is the same fault as an instrument
   that writes into the thing it measures**, which is the bug this gate caught in the tool itself an
   hour earlier. Pinning it in the helper means a future case cannot forget. */
const run = (args) => {
  const pinned = args.some((a) => a.startsWith("--log=")) ? args : [...args, `--log=${join(tmp, "default-CHART-LOG.md")}`];
  try {
    return { code: 0, out: execFileSync(process.execPath, [KEEPER, ...pinned], { encoding: "utf8", cwd: ROOT }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const runJson = (args) => {
  const r = run([...args, "--json"]);
  try { return { ...r, json: JSON.parse(r.out) }; } catch { return { ...r, json: null }; }
};

/* ── THE MIXED FIXTURE. One live row and one dead row, side by side, so a reaper that answers the
   same way to everything fails on one of the two no matter which way it is stuck. ── */
const TODAY = new Date().toISOString().slice(0, 10);
const MIXED = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] **A LIVE ROW WITH A LIVE POINTER — See BLOCKED ON WYATT** for the taste call on the
      lantern colour. Nothing about this row is finished.
- [ ] **A DEAD POINTER — See BLOCKED ON WYATT** for the deploy permission. He answered this
      hours ago and nothing moved it.
- [ ] **A ROW CITING A TRIAL REPORT THAT DOES NOT EXIST** — see
      \`.planning/SEA-TRIAL-fixture-never-written.md\`, verdict pending.
- [ ] **A ROW WHOSE EVIDENCE IS RETIRED** — measured on build \`2000.01.01.1\`, which is not the
      stamp in the tree.
- [ ] **A GATED ROW** that must sink — GATED: waiting for the quiet moment. Filed 2026-09-02T04:19Z.
- [x] **A DONE ROW FROM LONG AGO** — SHIPPED 2001-02-03.
- [x] **A DONE ROW FROM TODAY** — SHIPPED ${TODAY}.

⚠ THE LETTER Z ABOVE IS LOAD-BEARING AND MUST NOT BE TIDIED AWAY. The first version of this
fixture contained no capital Z anywhere, and that is the only reason the idempotence case below
passed while the section splice was broken: it used the lookahead \`(?=^## |\\Z)\`, and \`\\Z\` is
not a JavaScript anchor — it matches a literal Z. On the real Chart, which writes UTC times in
every other line, one run spliced the section after about a line and a second run tripled the file.
The fixture now carries a Z the way the real file does.

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|
| **What colour should the lantern be?** the taste call on the lantern colour | Recommended: brass | 2026-09-02 |

## THE IDEA INBOX

- **An unfated idea about the lantern colour** — he wrote this on the Glass and nobody has
  given it a fate yet.
- **A fated idea** — already handled → **SHIPPED** 2026-09-01.
`;

/* 1. IT MUST NEVER TICK A BOX. The single most important property, and the reason REAP only ever
      measures the POINTER and never the WORK. `mark_glass_published.mjs` is the cautionary tale in
      this same directory: a stamp that could only say one thing recorded a publish that never
      happened. An instrument allowed to erase work from the record will eventually erase some. */
{
  const p = chartFile("no-tick", MIXED);
  const before = (readFileSync(p, "utf8").match(/^- \[x\]/gm) || []).length;
  run([`--chart=${p}`, "--reap", "--rank", "--write"]);
  const after = readFileSync(p, "utf8");
  const afterDone = (after.match(/^- \[x\]/gm) || []).length;
  if (afterDone > before) fail(`ticked ${afterDone - before} box(es) — closing is a claim about WORK and belongs to a watch behind close_item.mjs, never to an unattended reaper`);
  else pass("ticked no boxes — flags a pointer, never closes an item");
  if (!/- \[ \]/.test(after)) fail("no open rows survived the write at all — the reaper rewrote the list out of existence");
  else pass("open rows survive the write");
}

/* 2. RED-PROOFED BOTH WAYS, IN ONE PASS. The live row must be left alone and the dead one flagged.
      Guardrail 2 of the spec, in its own words: "a reaper that flags everything is as useless as
      one that flags nothing." */
{
  const p = chartFile("both-ways", MIXED);
  const r = runJson([`--chart=${p}`, "--reap"]);
  if (!r.json) { fail(`--reap --json produced no JSON a caller can read. Got: ${r.out.trim().slice(0, 160)}`); }
  else {
    const flagged = (r.json.reap || []).map((x) => x.title || "").join(" | ");
    if (/A LIVE ROW WITH A LIVE POINTER/.test(flagged))
      fail("flagged the live row — its pointer resolves to a real BLOCKED ON WYATT question, so nothing about it is stale");
    else pass("left the live row alone (its pointer still resolves)");
    if (!/A DEAD POINTER/.test(flagged))
      fail("did not flag the dead pointer — its BLOCKED ON WYATT question is gone, which is exactly the stale row he reads five of every day");
    else pass("flagged the dead pointer");
    if (!/TRIAL REPORT THAT DOES NOT EXIST/.test(flagged))
      fail("did not flag the row citing a trial report that is not on disk");
    else pass("flagged the row citing a report that does not exist");
    if (!/EVIDENCE IS RETIRED/.test(flagged))
      fail("did not flag the row whose build stamp is older than the stamp in the tree — its measurement no longer describes this game");
    else pass("flagged the row whose evidence is retired");
    const unexplained = (r.json.reap || []).filter((x) => !x.reason || !String(x.reason).trim());
    if (unexplained.length) fail(`flagged ${unexplained.length} row(s) with no derived reason — an unexplained flag is an opinion`);
    else pass("every flag carries the derived reason that produced it");
  }
}

/* 3. IT MUST BE ABLE TO SAY THE CHART IS FINE. Guardrail 4. A pass that always finds something is
      measuring itself, and the next reader learns to ignore it — which is how the whole gate
      becomes decoration. */
{
  const CLEAN = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] **A perfectly ordinary open row** with no pointers, no pids and no build stamps in it.
- [ ] **A second ordinary open row** describing work in \`src/ui/flow.js\` that nobody has done.

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|

## THE IDEA INBOX

- **A fated idea** — handled → **SHIPPED** 2026-09-01.
`;
  const p = chartFile("clean", CLEAN);
  const r = runJson([`--chart=${p}`, "--reap"]);
  if (!r.json) fail("no JSON on the clean fixture");
  else if ((r.json.reap || []).length !== 0)
    fail(`flagged ${r.json.reap.length} row(s) on a Chart with nothing stale in it — a reaper that always finds something is measuring itself`);
  else pass("says the Chart is fine when it is fine");
}

/* 4. RANK MUST SINK EVERY BLOCKED ROW BELOW EVERY UNBLOCKED ONE, AND EXPLAIN EVERY POSITION.
      The spec: "blocked sinks to the bottom, always. This alone fixes most of the present list."

      ⚠ THIS ASSERTION WAS WRONG ON ITS FIRST RUN AND THE CORRECTION IS THE USEFUL PART. It first
      demanded the GATED row be LAST, full stop — and the tool put it second-to-last, correctly,
      because THE FIXTURE HAS TWO BLOCKED ROWS: the GATED one, and the one waiting on a live
      BLOCKED ON WYATT question. Both belong at the bottom and their relative order is arbitrary.
      An over-specified check fails on correct behaviour, which trains the next reader to edit the
      check rather than the code — so it is written here as the property that actually matters. */
{
  const p = chartFile("rank", MIXED);
  const r = runJson([`--chart=${p}`, "--rank"]);
  if (!r.json || !Array.isArray(r.json.rank)) fail("--rank --json produced no ordered list");
  else {
    const titles = r.json.rank.map((x) => x.title || "");
    const gatedAt = titles.findIndex((t) => /A GATED ROW/.test(t));
    const unblockedBelow = r.json.rank.slice(gatedAt + 1).filter((x) => x.score > 0);
    if (gatedAt === -1) fail("the GATED row vanished from the ranking — a blocked row is still a row he can see");
    else if (unblockedBelow.length) fail(`${unblockedBelow.length} unblocked row(s) ranked BELOW the GATED row — blocked must sink beneath everything actionable`);
    else if (r.json.rank[gatedAt].score > 0) fail("the GATED row scored positive — GATED must be a sinking signal, not a neutral one");
    else pass("the GATED row sank beneath every actionable row");
    const mute = r.json.rank.filter((x) => !x.whyNow || !String(x.whyNow).trim());
    if (mute.length) fail(`ranked ${mute.length} row(s) with no why-now phrase — an order he cannot read is an order he cannot overrule`);
    else pass("every ranked row carries a why-now phrase he can read and overrule");
  }
}

/* 4b. THE ORDER MUST BE DERIVED FROM THE ROWS, NOT FROM FILE ORDER. If the ranking is a permutation
      that happens to equal the input every time, RANK is a very expensive no-op — and it would look
      exactly like a working one on the day it shipped. So: move one row to the top of the file and
      the ranking must come out identical. */
{
  const pA = chartFile("derived-a", MIXED);
  const a = runJson([`--chart=${pA}`, "--rank"]);
  // The row to move is DERIVED from the fixture, never re-typed. It was re-typed once, the fixture
  // gained a timestamp, the two silently stopped matching, and the "shuffle" quietly became
  // "duplicate the GATED row" — which then failed for a reason that had nothing to do with ranking.
  const gatedRow = `${(MIXED.match(/^- \[ \] \*\*A GATED ROW\*\*[^\n]*$/m) || [])[0]}\n`;
  const shuffled = MIXED
    .replace(gatedRow, "")
    .replace("## STEP 1 CHECKLIST — the reboot\n\n", `## STEP 1 CHECKLIST — the reboot\n\n${gatedRow}`);
  const gatedCount = (s) => (s.match(/A GATED ROW/g) || []).length;
  if (shuffled === MIXED) fail("the shuffled fixture is identical to the original — this case cannot fail and is therefore not a check");
  else if (gatedCount(shuffled) !== gatedCount(MIXED)) fail("the shuffle changed how many rows exist, so it is testing something other than order");
  const pB = chartFile("derived-b", shuffled);
  const b = runJson([`--chart=${pB}`, "--rank"]);
  if (!a.json || !b.json) fail("could not rank one of the two orderings");
  else {
    const ta = a.json.rank.map((x) => x.title);
    const tb = b.json.rank.map((x) => x.title);
    if (JSON.stringify(ta) !== JSON.stringify(tb))
      fail(`the same rows in a different file order produced a different ranking — the score is reading position, not the row.\n        ${JSON.stringify(ta)}\n        ${JSON.stringify(tb)}`);
    else pass("the same rows ranked identically from two different file orders — the order is derived from the rows");
  }
}

/* 5. SWEEP MUST GIVE DONE ROWS AN EXIT, AND MUST NOT ARCHIVE THIS WEEK'S. "27 done" is not a fact
      about this week; it is a number that grows forever and therefore says nothing.

      ⚠ THE SECOND OVER-SPECIFIED ASSERTION, AND THE SAME CORRECTION. It first demanded the swept
      row's TITLE be absent from the Chart — but the spec asks for a one-line stub carrying exactly
      that title, so a reader following an old reference lands somewhere instead of nowhere. What
      must actually be true: the checkbox goes (so the `done` count starts meaning "done this
      week"), the essay goes, the archive has all of it, and a non-checkbox stub stays. */
{
  const p = chartFile("sweep", MIXED);
  const log = join(tmp, "CHART-LOG.md");
  const doneBefore = (readFileSync(p, "utf8").match(/^- \[x\]/gm) || []).length;
  run([`--chart=${p}`, `--log=${log}`, "--sweep", "--write"]);
  const after = readFileSync(p, "utf8");
  const doneAfter = (after.match(/^- \[x\]/gm) || []).length;
  if (doneAfter !== doneBefore - 1)
    fail(`the done-checkbox count went ${doneBefore} → ${doneAfter}; exactly one row was old enough to archive. Done rows never leaving is why most of the Chart is history`);
  else pass("the archived row's checkbox left the Chart — 'done' can start meaning 'done this week'");
  if (/^- \[x\][^\n]*A DONE ROW FROM LONG AGO/m.test(after))
    fail("the row from 2001 is still an open checkbox row on the Chart");
  else if (!/↳[^\n]*A DONE ROW FROM LONG AGO/.test(after))
    fail("no stub left behind — an old reference to that row now lands nowhere");
  else pass("a one-line stub stays behind, pointing at the archive");
  if (!existsSync(log)) fail("wrote no archive file — a sweep that deletes instead of archiving loses the record");
  else {
    const archived = readFileSync(log, "utf8");
    if (!/A DONE ROW FROM LONG AGO/.test(archived)) fail("the archived row is not in the archive — the sweep dropped it on the floor");
    else pass("the archived row's full text is in the archive");
  }
  if (!/^- \[x\][^\n]*A DONE ROW FROM TODAY/m.test(after))
    fail("archived a row finished today — the 7-day window is the whole point");
  else pass("left this week's done row in place");
}

/* 6. IT MUST COVER THE UNFATED IDEA INBOX ENTRIES. Caught by CEO 89 before a line was built, and it
      is the difference between ordering HIS list and ordering a list of our own: `glass.mjs:385-386`
      is `tasks = [...openChecklist, ...openInbox.map(shortTask)]`, so an idea with no declared fate
      is a task on his phone. A Chartkeeper blind to those perfectly reorders the wrong list. */
{
  const p = chartFile("inbox", MIXED);
  const r = runJson([`--chart=${p}`, "--rank"]);
  if (!r.json) fail("no JSON for the inbox case");
  else {
    const titles = r.json.rank.map((x) => x.title || "").join(" | ");
    if (!/An unfated idea about the lantern colour/.test(titles))
      fail("the unfated IDEA INBOX entry is missing from the ranking — the Glass counts it as an open task, so this is ordering a list he does not read");
    else pass("the unfated IDEA INBOX entry is ranked alongside the checklist rows");
    if (/A fated idea/.test(titles))
      fail("ranked an idea that has already declared a fate — that inflates the open count Wyatt steers by");
    else pass("the fated idea is not counted as open");
  }
}

/* 7. A ROW MUST GET A HANDLE THAT SURVIVES THE FILE MOVING. The spec shipped with two stale line
      numbers IN THE COMMIT THAT PUBLISHED IT, which is the best possible argument for this: a line
      number is not a durable handle. An id is allocated once and never reused, so a comment, a CEO
      verdict and an archive stub can all point at the same row. */
{
  const p = chartFile("ids", MIXED);
  run([`--chart=${p}`, "--write"]);
  const once = readFileSync(p, "utf8");
  const ids = once.match(/\bT-\d{3}\b/g) || [];
  if (ids.length === 0) fail("allocated no T-nnn ids — every reference to a row stays a line number, and line numbers go stale in the commit that writes them");
  else pass(`allocated ${ids.length} stable row ids`);
  if (new Set(ids).size !== ids.length) fail(`allocated a duplicate id (${ids.length} ids, ${new Set(ids).size} distinct) — two rows sharing a handle is worse than neither having one`);
  else pass("every allocated id is distinct");
  run([`--chart=${p}`, "--write"]);
  const ids2 = (readFileSync(p, "utf8").match(/\bT-\d{3}\b/g) || []);
  if (ids2.join(",") !== ids.join(",")) fail(`a second run changed the ids (${ids.length} → ${ids2.length}) — ids must be allocated once and never reused`);
  else pass("a second run allocates nothing new — ids are stable across runs");
}

/* 7b. THE ROW'S FIRST LINE IS WYATT'S, AND THE WRITE MUST NOT TOUCH A CHARACTER OF IT.
      ⚠ THIS CASE EXISTS BECAUSE THERE WAS NO CASE LIKE IT AND THE TOOL SHIPPED A REGRESSION ONTO
      HIS PHONE. `glass.mjs:386` renders each open row's FIRST LINE as a task; `glass.mjs:122`
      strips `**` and `~~` and NOT backticks. The first version put the handle inline after the
      checkbox, so all 32 tasks on his page came out reading "`T-001` ★ NEXT ITEM, AT HIS
      INSTRUCTION…" — literal backticks, and the handle eating one of the sixteen words the card
      shows him. Twenty-two green cases, and every one of them was looking at structure while the
      thing that broke was the picture. Found by a CEO that opened the rendered page.
      The rule this encodes: **a handle is for machines, and the first line is for him.** */
{
  const p = chartFile("first-line", MIXED);
  const before = (readFileSync(p, "utf8").match(/^- \[[ x]\][^\n]*/gm) || []);
  run([`--chart=${p}`, "--reap", "--rank", "--write"]);
  const after = (readFileSync(p, "utf8").match(/^- \[[ x]\][^\n]*/gm) || []);
  const changed = before.filter((l) => !after.includes(l));
  if (changed.length)
    fail(`the write altered ${changed.length} row first-line(s), which is exactly what the Glass renders to Wyatt. First: ${JSON.stringify(changed[0].slice(0, 90))}`);
  else pass("every row's first line survived the write byte for byte — nothing machine-readable leaks onto his page");
  // Every ROW gets a handle — the checklist's `- [ ]`/`- [x]` rows AND the IDEA INBOX's `- **…**`
  // blocks, because the Glass counts both as tasks. Derived from the fixture, never hand-typed.
  const inboxRows = (MIXED.split(/^## THE IDEA INBOX$/m)[1] || "").match(/^- /gm) || [];
  const expected = before.length + inboxRows.length;
  const handles = (readFileSync(p, "utf8").match(/^\s*⟨[^⟩]*⟩\s*$/gm) || []);
  if (handles.length !== expected)
    fail(`${handles.length} handle line(s) for ${expected} rows (${before.length} checklist + ${inboxRows.length} inbox) — every row needs exactly one, on its own line`);
  else if (new Set(handles.map((h) => h.trim())).size !== handles.length)
    fail("two rows carry the same handle line — a duplicate handle is worse than none");
  else pass(`every one of the ${expected} rows carries exactly one distinct handle, on a line of its own`);
}

/* 8. THE WRITE MUST BE IDEMPOTENT AND MUST LOSE NOTHING. Two sessions share this branch and this
      file; a pass that rewrites CHART.md differently every run would conflict on every push, and a
      pass that drops a row would delete work nobody could prove was ever there. */
{
  const p = chartFile("idem", MIXED);
  run([`--chart=${p}`, "--reap", "--rank", "--write"]);
  const first = readFileSync(p, "utf8");
  run([`--chart=${p}`, "--reap", "--rank", "--write"]);
  const second = readFileSync(p, "utf8");
  if (first !== second) fail("running twice produced two different files — a non-idempotent rewrite conflicts on every push when two sessions share the branch");
  else pass("running twice is a no-op — the write is idempotent");

  const keyOf = (s) => (s.match(/^- \[[ x]\][^\n]*/gm) || [])
    .map((l) => l.replace(/⟨[^⟩]*⟩/g, "").replace(/`T-\d{3}`/g, "").replace(/\s+/g, " ").trim())
    .sort();
  const lost = keyOf(MIXED).filter((t) => !keyOf(first).includes(t));
  if (lost.length) fail(`lost ${lost.length} row(s) in the rewrite: ${JSON.stringify(lost.slice(0, 2))}`);
  else pass("no row was lost in the rewrite");

  /* 8b. AND NOTHING OUTSIDE THE ROWS MAY MOVE EITHER. Counting rows is not enough: the splice bug
        that tripled the real Chart left every ROW intact and duplicated the prose around them, so
        a row-set comparison stayed green through it. The file must not grow by more than the
        handles and flags that were deliberately added — a rewrite that adds hundreds of lines is
        a rewrite that is eating the document. */
  const growth = first.split("\n").length - MIXED.split("\n").length;
  if (growth > 12) fail(`the rewrite added ${growth} lines to a 20-line fixture — it is duplicating the document, not annotating it`);
  else pass(`the rewrite grew the file by ${growth} line(s) — handles and flags only`);
  for (const marker of ["## BLOCKED ON WYATT", "## THE IDEA INBOX", "## STEP 1 CHECKLIST"]) {
    const n = (first.match(new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gm")) || []).length;
    if (n !== 1) { fail(`"${marker}" appears ${n} times after the rewrite — the section splice is duplicating headings`); break; }
  }
  if (["## BLOCKED ON WYATT", "## THE IDEA INBOX", "## STEP 1 CHECKLIST"]
    .every((mk) => (first.match(new RegExp(`^${mk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gm")) || []).length === 1))
    pass("every section heading still appears exactly once");
}

/* 9. WITHOUT --write IT MUST NOT TOUCH THE FILE. The report mode the Glass-update session runs is
      REAP-only and read-only by design: reaping is a judgement about whether something HE is
      waiting on has landed, and judgements belong where a human is looking. */
{
  const p = chartFile("readonly", MIXED);
  const before = readFileSync(p, "utf8");
  run([`--chart=${p}`, "--reap", "--rank", "--sweep"]);
  if (readFileSync(p, "utf8") !== before) fail("changed the Chart without --write — report mode must be readable by a session that is only allowed to look");
  else pass("report mode changes nothing on disk");
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   10. PASS 2 — SETTLE. A HALF-DONE ROW IS NOT ALLOWED TO STAY HALF-DONE.

   WYATT ADDED THIS PASS HIMSELF, after reading the spec's first draft, and it is the half the
   04:19Z build missed entirely — that build was written from a copy of the spec taken before his
   banner landed. His words, verbatim: "Half-Stale items should be prioritized to be either
   validated as finished, worked on until finished, or in the worst case, i should be asked if I am
   satisfied with their state."

   WHY IT IS A REAL DEFECT AND NOT A TIDINESS FEATURE. REAP asks its questions of the WHOLE row. So
   a row bundling three jobs, one of them finished, comes back FLAGGED — and RANK then tells him it
   "looks finished — needs a verdict, not work" while two thirds of it is untouched work. That is an
   instrument reporting a defect the Chart does not have, which is rule 6's own territory. The
   Blade-hour row has been doing exactly this for days: three jobs under one checkbox, one of them
   measurably done, the measurement filed 500 lines away, and the row unmoved.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

/* ⚠ THE FIXTURE IS BUILT SO THAT ALL FOUR OUTCOMES ARE PRESENT AT ONCE — bundled-and-half-done,
   bundled-and-wholly-done, bundled-with-nothing-to-carry, and not bundled at all. A pass that
   answers the same way to everything therefore fails on at least one of them no matter which way it
   is stuck, which is guardrail 2 of the spec applied to this pass instead of to REAP. */
const BUNDLED = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] **THE BLADE HOUR — three jobs under one checkbox**
      part 1: register the Bell — See BLOCKED ON WYATT, and he answered that one hours ago.
      part 2: ring-test the Bell in both directions — nobody has done this and there is no
      pointer of any kind in it.
      part 3: the O2 publish test — nobody has done this either, and it has no pointer either.
- [ ] **AN ORDINARY ROW WITH ONE CLAIM IN IT** — plain work in \`src/ui/flow.js\` that nobody has
      started. Filed 2026-09-02T04:19Z.
- [ ] **EVERY PART OF THIS ROW IS ALREADY FINISHED**
      part 1: the first trial — cites \`.planning/SEA-TRIAL-fixture-never-written.md\`, which is
      not on disk.
      part 2: the second trial — measured on build \`2000.01.01.1\`, which is not the stamp in
      the tree.
- [ ] **BUNDLED ON THE FIRST LINE AND NOWHERE ELSE** · register the thing · ring-test it · publish from O2, and See BLOCKED ON WYATT about that, which he answered hours ago.

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|
| **What colour should the lantern be?** the taste call on the lantern colour | Recommended: brass | 2026-09-02 |

## THE IDEA INBOX

- **A fated idea** — handled → **SHIPPED** 2026-09-01.
`;

const settleOf = (json, match) => (json?.settle || []).find((s) => new RegExp(match).test(s.title || ""));

/* 10a. IT MUST SEE THE HALF-DONE ROW, AND NAME WHICH PARTS ARE FINISHED AND WHICH ARE NOT.
        "Half-stale" is DERIVED, never a flag somebody sets: the row carries more than one checkable
        claim and REAP's own questions come back TRUE for some of them and not others. */
{
  const p = chartFile("settle-detect", BUNDLED);
  const r = runJson([`--chart=${p}`, "--settle"]);
  if (!r.json) fail(`--settle --json produced no JSON a caller can read. Got: ${r.out.trim().slice(0, 160)}`);
  else if (!Array.isArray(r.json.settle)) fail("there is no SETTLE pass — a row that is partly done drifts in the middle of the list forever, which is the exact drift his instruction is about");
  else {
    const blade = settleOf(r.json, "THE BLADE HOUR");
    if (!blade) fail("did not see the bundled row as half-done — three jobs under one checkbox, one of them finished, is the worked example in his own spec");
    else {
      if (!(blade.settled?.length === 1 && blade.open?.length === 2))
        fail(`named ${blade.settled?.length ?? "?"} finished part(s) and ${blade.open?.length ?? "?"} open — the fixture has exactly one finished of three`);
      else pass("named exactly which parts of the bundled row are finished and which are not");
      if (!blade.settled?.[0]?.reason) fail("a part was called finished with no derived reason — an unexplained verdict is an opinion");
      else pass("every finished part carries the derived reason that produced it");
    }
    const ordinary = settleOf(r.json, "AN ORDINARY ROW WITH ONE CLAIM");
    if (ordinary) fail("called a row with one claim in it half-done — a pass that fires on everything is as useless as one that fires on nothing");
    else pass("left the row with a single claim alone");
  }
}

/* 10b. THE THREE FATES ARE HIS, IN HIS ORDER: validate finished, work it until finished, or ask
        him — and the third is last because his attention is the scarcest thing this project spends.
        Which fate a row gets is DERIVED: every part finished → VALIDATE; some finished and each
        part has its own text to carry → SPLIT; some finished but there is nothing to carry onto
        the parts → ASK, because a split with nothing in it is a worse answer than a question. */
{
  const p = chartFile("settle-fates", BUNDLED);
  const r = runJson([`--chart=${p}`, "--settle"]);
  const want = [
    ["EVERY PART OF THIS ROW IS ALREADY FINISHED", "VALIDATE", "every part derives finished, so it needs a verdict and not work"],
    ["THE BLADE HOUR", "SPLIT", "some parts are finished and the rest is real work, and each part has its own text"],
    ["BUNDLED ON THE FIRST LINE AND NOWHERE ELSE", "ASK", "there is nothing to carry onto the parts, so it is a question for him"],
  ];
  for (const [title, fate, why] of want) {
    const got = settleOf(r.json, title)?.fate;
    if (got !== fate) fail(`"${title.slice(0, 40)}…" got fate ${JSON.stringify(got)}, wanted ${fate} — ${why}`);
    else pass(`${fate}: ${why}`);
  }
}

/* 10c. ⚠ THE MISREPORT THIS PASS EXISTS TO STOP, AND IT IS ALREADY ON HIS PAGE.
        REAP flags the bundled row (one of its pointers really is dead), and RANK then labels it
        "looks finished — needs a verdict, not work". Two thirds of that row is untouched work.
        A row that is PARTLY finished must never be described to him as finished. */
{
  const p = chartFile("settle-not-finished", BUNDLED);
  const r = runJson([`--chart=${p}`, "--settle", "--rank"]);
  const blade = (r.json?.rank || []).find((x) => /THE BLADE HOUR/.test(x.title || ""));
  if (!blade) fail("the bundled row vanished from the ranking");
  else if (/looks finished/.test(blade.whyNow || ""))
    fail(`told him a half-done row "looks finished": ${JSON.stringify(blade.whyNow)} — two of its three parts are untouched work`);
  else if (!/half[- ]done/i.test(blade.whyNow || ""))
    fail(`the half-done row's why-now says ${JSON.stringify(blade.whyNow)} — it must say plainly that it is half done, or he cannot overrule the position`);
  else pass("a half-done row is described as half done, never as finished");
}

/* 10d. IT MUST ACT, NOT MERELY OBSERVE. SPLIT gives each unfinished part its own checkable row —
        "a bundled row can never be ticked" is the audit's own finding, and splitting is how a
        bundle becomes tickable. ASK puts one question, with the measurement attached, where he
        will see it. AND NOTHING MAY BE LOST: the parent keeps its full text, verbatim. */
{
  const p = chartFile("settle-act", BUNDLED);
  const before = readFileSync(p, "utf8");
  run([`--chart=${p}`, "--settle", "--write"]);
  const after = readFileSync(p, "utf8");

  if ((after.match(/^- \[x\]/gm) || []).length > (before.match(/^- \[x\]/gm) || []).length)
    fail("SETTLE ticked a box — closing is a claim about WORK and belongs to a watch behind close_item.mjs");
  else pass("SETTLE ticked no boxes");

  for (const part of ["ring-test the Bell in both directions", "the O2 publish test"]) {
    if (!new RegExp(`^- \\[ \\] [^\\n]*${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m").test(after))
      fail(`"${part}" did not become a row of its own — it is still buried in a bundle that can never be ticked`);
    else pass(`"${part}" is now its own checkable row`);
  }
  /* ⚠ WRITTEN AS LINE CONTAINMENT, NOT AS ONE CONTIGUOUS BLOCK, AND THE FIRST VERSION WAS THE
     OTHER WAY. It demanded the parent's whole body appear verbatim — and that fails on CORRECT
     behaviour, because the write legitimately inserts the row's ⟨handle⟩ line underneath its first
     line. This gate has now made the over-specified mistake three times (cases 4 and 5 carry the
     other two), so the shape is worth naming: assert the property that matters — NOTHING IS LOST —
     never the exact bytes around it. */
  const parentBody = (before.match(/^- \[ \] \*\*THE BLADE HOUR[\s\S]*?(?=\n- \[)/m) || [""])[0];
  const lost = parentBody.split("\n").map((l) => l.trim()).filter(Boolean).filter((l) => !after.includes(l));
  if (lost.length)
    fail(`the split lost ${lost.length} line(s) of the parent row's own text — the essays are the graveyard, and a split that summarises loses it. First: ${JSON.stringify(lost[0].slice(0, 70))}`);
  else pass("every line of the parent row's text survived the split");

  if (!/^\|[^\n]*BUNDLED ON THE FIRST LINE/m.test(after))
    fail("the row that could only be resolved by asking him never reached BLOCKED ON WYATT — a question nobody can see is not a question");
  else if (!/^\|[^\n]*BUNDLED ON THE FIRST LINE[^\n]*1 of 3/m.test(after))
    fail("the question carries no measurement — his own instruction is that he is asked with the state attached, never in the abstract");
  else pass("the un-derivable row became one question in BLOCKED ON WYATT, with its measurement attached");
}

/* 10e. THE ENFORCEMENT, and without it this pass is a suggestion: A ROW MAY NOT SURVIVE A FULL
        WRITE PASS STILL HALF-DONE AND UNRESOLVED. The spec, in its own words: "the whole point of
        his instruction is that 'partly done' stops being a place a row can live." A row is resolved
        when its open parts each have a row of their own, or when a question about it is in front of
        him — both DERIVED from the file, never from a flag the tool wrote to itself. */
{
  const p = chartFile("settle-enforce", BUNDLED);
  const before = runJson([`--chart=${p}`, "--settle"]);
  if (!(before.json?.settleUnresolved || []).length)
    fail("nothing was unresolved before the write, so this case cannot fail and is therefore not a check");
  else pass(`${before.json.settleUnresolved.length} row(s) unresolved before the write — the case can fail`);
  run([`--chart=${p}`, "--settle", "--write"]);
  const after = runJson([`--chart=${p}`, "--settle"]);
  const left = after.json?.settleUnresolved;
  if (!Array.isArray(left)) fail("the tool does not report which half-done rows are still unresolved — an enforcement nobody can read is not an enforcement");
  else if (left.length) fail(`${left.length} row(s) survived a full write pass still half-done and unresolved: ${JSON.stringify(left.slice(0, 2))}`);
  else pass("no row survived the write pass still half-done — 'partly done' is not a place a row can live");
}

/* 10f. AND IT MUST STILL BE IDEMPOTENT WITH SETTLE ON. This is the case that would catch the
        obvious way to build this wrong: a split that re-splits every run, adding the same child
        rows again and again. Two sessions share this branch — a rewrite that differs every run
        conflicts on every push. */
{
  const p = chartFile("settle-idem", BUNDLED);
  run([`--chart=${p}`, "--write"]);
  const first = readFileSync(p, "utf8");
  run([`--chart=${p}`, "--write"]);
  const second = readFileSync(p, "utf8");
  if (first !== second) fail("running the full pass twice produced two different files — SETTLE is re-acting on rows it has already resolved");
  else pass("the full pass including SETTLE is idempotent");
  const firstLines = (BUNDLED.match(/^- \[[ x]\][^\n]*/gm) || []);
  const afterLines = (first.match(/^- \[[ x]\][^\n]*/gm) || []);
  const changed = firstLines.filter((l) => !afterLines.includes(l));
  if (changed.length) fail(`SETTLE altered ${changed.length} existing row first-line(s) — the first line is what the Glass renders to him. First: ${JSON.stringify(changed[0].slice(0, 90))}`);
  else pass("every existing row's first line survived SETTLE byte for byte");
}

/* 10h. ⚠ IT MUST SAY WHAT IT LOOKED AT, NOT ONLY WHAT IT FOUND — AND IT MUST SEE THE CHART'S OWN
        BUNDLING SHAPES. This case exists because of a near miss that a green gate could not see.
        The first build of SETTLE passed every case above and then, pointed at the REAL Chart, saw
        ZERO bundled rows — including the Blade hour, which is the audit's own worked example. It
        writes its three jobs as a comma list after a colon ("…: register the Bell, the ring test
        both directions, the O2 publish test — runbook …"), a shape the fixture did not contain.
        A pass that is silent on a healthy Chart and a pass that has gone blind print the same line,
        so the count of what it EXAMINED is the only thing that tells them apart. */
{
  const COMMA = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] The Blade hour (Wyatt + a session, ~30–60 min): register the Bell, the ring test both
      directions, the O2 publish test — runbook \`scripts/wyclau/RAZER-SETUP.md\`
- [ ] **A ROW WHOSE FIRST LINE IS ORDINARY PROSE** — it mentions a colon: and then, some commas,
      but it is one job and must not be split into pieces nobody wrote. Filed 2026-09-02T04:19Z.

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|

## THE IDEA INBOX

- **A fated idea** — handled → **SHIPPED** 2026-09-01.
`;
  const p = chartFile("settle-bundled", COMMA);
  const r = runJson([`--chart=${p}`, "--settle"]);
  const seen = r.json?.settleBundled;
  if (!Array.isArray(seen))
    fail("the tool never says how many rows it examined — a pass that is silent on a healthy Chart and a pass that has gone blind print the same line");
  else if (!seen.some((t) => /Blade hour/.test(t)))
    fail(`did not recognise the Blade hour as a bundled row (examined ${JSON.stringify(seen)}) — it is the audit's own worked example, and its three jobs are a comma list after a colon`);
  else pass("recognised the Chart's comma-list bundling shape, and says how many rows it examined");
  if (Array.isArray(seen) && seen.some((t) => /ORDINARY PROSE/.test(t)))
    fail("split an ordinary prose first line into parts — a false split puts a row on his page that nobody wrote, which is worse than a bundle going unnoticed");
  else pass("left an ordinary prose first line alone");
  const text = run([`--chart=${p}`, "--settle"]).out;
  if (!/looked at \d+ row/.test(text))
    fail("the human-readable report does not say what it looked at either");
  else pass("the report names how many bundled rows it examined");
}

/* 10i. ⚠ A DEAD POINTER IS NOT A FINISHED ROW, AND SAYING SO WAS THE WHOLE FAULT — NOT THE BUNDLE.
        CEO 93 found this by running the tool against the REAL Chart after SETTLE shipped: the
        half-done case had been fixed and the phrase was STILL WRONG on four live rows, including
        the Chartkeeper's own, whose text says in the same breath that half of it is blocked and
        unbuilt. REAP measures a POINTER — "the question you were waiting on has been answered",
        "that pid is dead". That is a real and useful signal and it is NOT a claim about the work.
        A row can have every pointer resolve and still be entirely unstarted.
        So the score stays (+40: a row whose blocker has lifted really is cheap to revisit) and only
        the SENTENCE changes, because the sentence is what a reader steers by. */
{
  const p = chartFile("dead-pointer-phrasing", MIXED);
  const r = runJson([`--chart=${p}`, "--reap", "--rank"]);
  const dead = (r.json?.rank || []).find((x) => /A DEAD POINTER/.test(x.title || ""));
  const gated = (r.json?.rank || []).find((x) => /A GATED ROW/.test(x.title || ""));
  if (!dead) fail("the row with the dead pointer vanished from the ranking");
  else if (/finish/i.test(dead.whyNow || ""))
    fail(`told him an unstarted row is finished on the strength of a dead pointer: ${JSON.stringify(dead.whyNow)} — REAP measures the pointer, never the work`);
  else if (!/waiting on|landed|resolved/i.test(dead.whyNow || ""))
    fail(`the dead-pointer row's why-now says ${JSON.stringify(dead.whyNow)} — it must say what actually changed, or the +40 that lifted it is unexplained`);
  else pass("a dead pointer is described as something that has LANDED, never as work that is finished");
  // Red-proofed the other way in the same breath: a row with no dead pointer must not get the
  // phrase either, or the check above would pass on a tool that says it about everything.
  if (gated && /waiting on|landed|resolved/i.test(gated.whyNow || "") && !/blocked/i.test(gated.whyNow || ""))
    fail("said something had landed for a row with no resolved pointer in it");
  else pass("a row with nothing resolved does not get the phrase");
}

/* 10g. AND IT MUST CHANGE NOTHING WITHOUT --write. The Glass-update session runs this tool in
        report mode; a pass that quietly edits his Chart from a read-only session is the same class
        of fault as an instrument that writes into the thing it measures. */
{
  const p = chartFile("settle-readonly", BUNDLED);
  const before = readFileSync(p, "utf8");
  run([`--chart=${p}`, "--settle"]);
  if (readFileSync(p, "utf8") !== before) fail("SETTLE changed the Chart without --write");
  else pass("SETTLE in report mode changes nothing on disk");
}

console.log(failures === 0 ? "\nPASS" : `\nFAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
