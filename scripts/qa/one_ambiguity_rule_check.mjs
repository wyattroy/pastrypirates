#!/usr/bin/env node
/* one_ambiguity_rule_check.mjs — `T-122`. ONE definition of "who openly carries this handle".
 *
 * THE SUBJECT. Two files each decided *"is this handle ambiguous?"* on their own:
 *   · `glass.mjs` counted duplicates across open checklist rows, and made an ambiguous row
 *     UNDRAGGABLE on his page;
 *   · `chartkeeper --order=` counted carriers with an ELEVEN-LINE WINDOW around a checkbox, and
 *     REFUSED the whole drag sequence if one was ambiguous.
 * **A handle those two disagree about is the page offering him a gesture the command then refuses
 * whole — and telling him it saved.** That is `T-103`'s original fault returning inside the fix
 * written to close it, which is why CEO 132 filed it as rule 23.
 *
 * ⚑ WHY THIS GATE EXISTS AT ALL, AND IT IS THE WHOLE REASON IT IS NOT JUST `npm test`:
 * **on the live charts the two rules already agreed** — 22 handles and 26, zero seen by one and not
 * the other, measured before converging. So "it still passes" proves NOTHING about this change.
 * Every case below is built on a chart where the OLD rules DISAGREE, on purpose. A convergence
 * verified only against data that never exercised the difference is an untested rewrite of the
 * thing that decides whether his drags work.
 *
 * ⚠ WHAT IS DELIBERATELY NOT ASSERTED: that `handleIsAmbiguous` (`chartkeeper.mjs:754`) joins them.
 * It answers a DIFFERENT question — *"may I claim anything from a mention of this handle?"* — for
 * which a CLOSED row is as unusable as a duplicated one. Folding it in would make `--order=` refuse
 * a handle because a row with that number closed last week, which is not ambiguity. Three deciders
 * were found; two were one rule written twice; the third is its own question and keeps its own name.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ambiguousHandles, openHandleCarriers } from "../wyclau/lib/chart_model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KEEPER = join(ROOT, "scripts", "wyclau", "chartkeeper.mjs");
const fails = [];
const dir = mkdtempSync(join(tmpdir(), "one-ambig-"));

/* THE OLD RULES, reproduced exactly as they stood, so a case can show them disagreeing. Kept here
   rather than described, because a comment claiming what code used to do is the thing rule 6's
   other half forbids — this one can be RUN. */
const oldKeeperRule = (text) => {                       // chartkeeper's 11-line window
  const lines = text.split("\n"), carriers = new Map();
  const headIsOpen = (i) => {
    for (let j = i - 1; j >= 0 && j > i - 12; j--) {
      const m = /^[-*] \[([ xX])\]/.exec(lines[j]);
      if (m) return m[1] === " ";
    }
    return false;
  };
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*⟨`(T-\d{3})`[^⟩]*⟩\s*$/.exec(lines[i]);
    if (m && headIsOpen(i)) carriers.set(m[1], (carriers.get(m[1]) ?? 0) + 1);
  }
  return carriers;
};

const head = "# CHART\n\n## STEP 1 CHECKLIST\n\n";
const filler = (n) => Array.from({ length: n }, (_, i) => `      prose line ${i + 1}, of the kind his rows really carry.`).join("\n");

/* A row whose marker sits MORE THAN ELEVEN LINES below its checkbox. This is the divergence:
   the old window stops looking at 11 and calls the row unowned; the page's parse owns it. */
const farMarker = `- [ ] **A row with a long preamble before its handle.**\n${filler(14)}\n      ⟨\`T-301\`⟩\n`;
const nearMarker = (h) => `- [ ] **An ordinary row.**\n      ⟨\`${h}\`⟩\n      body.\n`;

try {
  // 1 — THE DIVERGENCE IS REAL, and this case proves the fixture exercises it. If the two old
  //     rules ever agree here, every case below is vacuous and says so rather than passing.
  {
    const md = head + farMarker + nearMarker("T-302");
    const old = oldKeeperRule(md);
    const now = openHandleCarriers(md);
    if (old.has("T-301")) fails.push("1: the fixture does not exercise the difference — the OLD window already saw T-301, so nothing below is a real test");
    if (!now.has("T-301")) fails.push("1: the shared rule cannot see a row whose marker is 14 lines below its checkbox — the window was removed and something else lost it");
    if (!now.has("T-302")) fails.push("1: the shared rule lost an ordinary row");
  }

  // 2 — A HANDLE ON TWO OPEN ROWS IS AMBIGUOUS. The one thing both callers must agree on.
  {
    const md = head + nearMarker("T-303") + nearMarker("T-303") + nearMarker("T-304");
    const amb = ambiguousHandles(md);
    if (!amb.has("T-303")) fails.push("2: a handle carried by TWO open rows was not called ambiguous — the page would offer a drag that names two rows");
    if (amb.has("T-304")) fails.push("2: a handle carried by ONE open row was called ambiguous — his drags would be refused for no reason");
  }

  // 3 — A CLOSED ROW DOES NOT CARRY. A swept row's handle must not make a live one ambiguous.
  {
    const md = head + nearMarker("T-305") + `- [x] **A closed row.**\n      ⟨\`T-305\`⟩\n      body.\n`;
    if (ambiguousHandles(md).has("T-305")) fails.push("3: a CLOSED row made a live handle ambiguous — every archived handle would poison a drag");
    if ((openHandleCarriers(md).get("T-305") ?? []).length !== 1) fails.push("3: the closed row was counted as a carrier");
  }

  // 4 — A MARKER NEVER CROSSES A SECTION BOUNDARY. Without this, the nearest checkbox above can
  //     sit in a different section entirely and adopt a marker that is not its row's.
  {
    const md = head + `- [ ] **A row in the checklist.**\n      ⟨\`T-306\`⟩\n\n## SOMETHING ELSE\n\n      ⟨\`T-307\`⟩\n`;
    const c = openHandleCarriers(md);
    if (c.has("T-307")) fails.push("4: a marker below a '## ' heading was adopted by a row in the section above it");
    if (!c.has("T-306")) fails.push("4: the real row lost its own marker");
  }

  // 5 — THE TWO CALLERS AGREE, ON THE FIXTURE THAT USED TO SPLIT THEM. This is the rule-23
  //     assertion itself: not "each is correct" but "these two cannot disagree".
  {
    mkdirSync(join(dir, ".planning"), { recursive: true });
    const chartPath = join(dir, ".planning", "CHART.md");
    writeFileSync(chartPath, head + farMarker + nearMarker("T-302"));
    let out = "", code = 0;
    try {
      out = execFileSync(process.execPath, [KEEPER, `--chart=${chartPath}`, "--order=T-301,T-302"],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) { code = e.status ?? 1; out = `${e.stdout ?? ""}${e.stderr ?? ""}`; }
    /* Under the OLD window this drag was refused — "no OPEN row carries T-301" — while the page
       happily offered it. That is the exact "it said it saved and nothing moved" fault. */
    if (code !== 0 || /no OPEN row/.test(out)) {
      fails.push(`5: --order= still refuses a handle the page offers as draggable (exit ${code}): ${out.trim().slice(0, 200)}`);
    }
  }

  // 6 — BOTH CALLERS IMPORT IT. A shared definition nobody imports is a copy with extra steps,
  //     and this gate would go on passing while the two drifted again.
  {
    const { readFileSync } = await import("node:fs");
    const keeper = readFileSync(KEEPER, "utf8");
    const glass = readFileSync(join(ROOT, "scripts", "wyclau", "glass.mjs"), "utf8");
    if (!keeper.includes("openHandleCarriers")) fails.push("6: chartkeeper.mjs no longer imports the shared rule — it has its own again");
    if (!glass.includes("ambiguousHandles")) fails.push("6: glass.mjs no longer imports the shared rule — the page decides on its own again");
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (fails.length) {
  console.log(`FAIL — one_ambiguity_rule_check (${fails.length}):`);
  for (const f of fails) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASS — one_ambiguity_rule_check: one definition of who openly carries a handle, and the page and the chartkeeper cannot disagree about it.");
