#!/usr/bin/env node
/* numbered_options_check.mjs — every call he has to make is NUMBERED, with a (recommended).
 *
 * HIS WORDS, 2026-09-03 ~11:55 AM ET, and the cause is in the first half of the sentence:
 *
 *   "please change the response buttons -- they are unclear. There is no 'yes' button -- only one
 *    that says 'do it' -- but what the 'it' is, is unclear. for every call i need to make, you
 *    should label your suggestions in the same way as the claude question UI does -- with numbers,
 *    and a (recommended) -- so I can reply with 1, 2, 3, 4, or other and write in the box"
 *
 * ⛔ THE FAULT WAS NOT THE BUTTON WORDS. The Glass had three FIXED buttons — Approve / Deny /
 * Let's talk — identical on every card, so they could not name what he was approving. The only
 * per-question text was one prose line starting "My recommendation:", which the buttons never
 * referred to. **"Approve" meant "the thing in that paragraph."** Relabelling three words would
 * have answered his sentence and left every future question exactly as vague.
 *
 * ⚑ SO THE ANTI-DECAY CLAUSE IS THE POINT OF THIS FILE, not the rendering. A parser that ACCEPTS
 * options is worthless if the next question anyone writes is prose again — which is how "a
 * capability nothing invokes" has already failed twice on this project (the ranker that nothing
 * ran; the harvest nothing called). **Case 5 fails the build on any question dated today or later
 * that does not declare options**, and the date is read from the row's own `since` cell, so nobody
 * has to maintain a list of which questions are new.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { questionOptions } from "../wyclau/lib/chart_model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHART = join(ROOT, ".planning", "CHART.md");
const GLASS = join(ROOT, "scripts", "wyclau", "glass.mjs");
const NL = String.fromCharCode(10);
const fails = [];
const dir = mkdtempSync(join(tmpdir(), "numbered-opts-"));

/* THE CUT-OFF IS THE DAY HE ASKED. Questions written before it keep their three words and are not
   a failure — rewriting his whole open backlog on a parser change would be a bigger edit than the
   ask, and the two that were live that day were converted by hand instead. */
const ASKED_ON = "2026-09-03";

try {
  // 1 — the parser reads his shape.
  {
    const o = questionOptions("1. Give me a way back (recommended) · 2. Save only the rows I dragged · 3. Nothing is wrong");
    if (o.length !== 3) fails.push(`1: his three-option shape parsed as ${o.length} option(s)`);
    if (o[0] && !o[0].recommended) fails.push("1: (recommended) did not raise the flag on option 1");
    if (o[0] && /recommended/i.test(o[0].label)) fails.push("1: (recommended) was left inside the button's LABEL — it reads as an option called 'X (recommended)'");
    if (o[1] && o[1].recommended) fails.push("1: an option that is not recommended was flagged as one");
  }

  // 2 — A DECIMAL INSIDE AN OPTION MUST NOT START A NEW ONE. This project's questions quote
  //     measurements ("a 2.6s budget"), so this is the realistic way the split breaks.
  {
    const o = questionOptions("1. wait past the 2.6s budget (recommended) · 2. leave it alone");
    if (o.length !== 2) fails.push(`2: a decimal inside an option split it — got ${o.length}, expected 2`);
  }

  // 3 — ONE option is not a choice. Rendering a single button is worse than the three words it
  //     replaced, so the parser must decline and let the fallback draw.
  {
    if (questionOptions("1. only one thing").length !== 0) fails.push("3: a single numbered item was offered as a choice");
    if (questionOptions("just prose, no options at all").length !== 0) fails.push("3: prose was read as options");
  }

  // 4 — THE PAGE RENDERS BOTH SHAPES: numbered when declared, the old three words when not.
  //     Rendered for real, because a parser test cannot see whether the buttons reached his page.
  {
    const chart = [
      "# CHART", "", "## STEP 1 CHECKLIST", "", "- [ ] **A row.**", "      ⟨`T-901`⟩", "",
      "## BLOCKED ON WYATT", "", "| Question | Recommendation | since |", "|---|---|---|",
      "| <!--qid:q-numbered--> **A question with options.** | 1. First way (recommended) · 2. Second way · 3. Leave it | 2026-09-03 |",
      "| <!--qid:q-prose--> **An older question, prose only.** | Just a recommendation. | 2026-08-01 |", "",
      "## RULED", "", "| question | his verdict |", "|---|---|", "",
    ].join(NL);
    const cPath = join(dir, "CHART.md");
    writeFileSync(cPath, chart);
    try { execFileSync(process.execPath, [GLASS, `--chart=${cPath}`], { cwd: ROOT, stdio: "ignore" }); }
    catch (e) { fails.push(`4: glass.mjs could not render (exit ${e.status}) — nothing below is checked`); }
    let html = "";
    try { html = readFileSync(join(ROOT, ".planning", "wyclau", "glass.html"), "utf8"); } catch { /* reported below */ }
    /* ⚠ BOUND EACH CARD AT ITS BUTTON ROW, NOT AT THE NEXT CARD. Splitting on the ask marker leaves
       the LAST card's slice running to the end of the document, so it swallows the ledger pills
       below — which contain the word "Approve" in their prose. The first run of this gate failed on
       exactly that and blamed the page. **A slice that reaches past its subject is not evidence
       about its subject.** Take the ruleRow, which is the thing under test. */
    const cardOf = (qid) => {
      const at = html.indexOf(qid);
      if (at < 0) return "";
      const rowAt = html.indexOf('<div class="ruleRow">', at);
      if (rowAt < 0) return "";
      const end = html.indexOf("</textarea>", rowAt);
      return html.slice(rowAt, end < 0 ? rowAt + 4000 : end + 11);
    };
    const numbered = cardOf("q-numbered");
    const prose = cardOf("q-prose");
    if (!numbered) fails.push("4: the numbered question did not render at all");
    else {
      for (const n of ["1", "2", "3"]) {
        if (!new RegExp(`data-choice="opt${n}"`).test(numbered)) fails.push(`4: option ${n} has no button on his page`);
      }
      if (!/First way/.test(numbered)) fails.push("4: the button does not carry the option's WORDS — a number he cannot read the meaning of is the fault he reported");
      if (!/recommended/.test(numbered)) fails.push("4: no (recommended) marker reached the page");
      if (/Approve/.test(numbered)) fails.push("4: the old fixed buttons are still drawn beside the numbered ones");
      if (!/Other/.test(numbered)) fails.push("4: the write-in box is not offered as 'Other' — he asked to reply 1, 2, 3, 4, or other");
    }
    if (!prose) fails.push("4: the prose question did not render at all");
    else if (!/Approve/.test(prose)) fails.push("4: a question with NO declared options lost its buttons — every older question would become unanswerable");
  }

  /* 5 — ⛔ THE ANTI-DECAY CLAUSE. Any question dated on or after the day he asked must declare
   *     options. Without this the parser is a capability nothing invokes, and the next question
   *     written is prose again. The date comes from the row's own `since` cell — DERIVED, so no
   *     list of "new" questions has to be kept by hand. */
  {
    const sec = readFileSync(CHART, "utf8").split(/^## BLOCKED ON WYATT$/m)[1]?.split(/^## /m)[0] ?? "";
    const rows = sec.split(NL).filter((l) => l.startsWith("|") && !/^\|\s*Question|^\|\s*-+/.test(l));
    for (const l of rows) {
      const c = l.split("|").map((x) => x.trim()).filter(Boolean);
      if (c.length < 3) continue;
      const since = (c[2] || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(since) || since < ASKED_ON) continue;
      if (questionOptions(c[1]).length === 0) {
        const who = (c[0] || "").replace(/<!--[\s\S]*?-->/g, "").replace(/[*`⟨⟩]/g, "").trim().slice(0, 70);
        fails.push(`5: a question dated ${since} offers him no numbered options — "${who}…". He asked for numbers and a (recommended) on EVERY call he has to make.`);
      }
    }
  }

  // 6 — the ruling must store his WORDS, not a numeral. T-121's harvested entry reads "ruled yes"
  //     and admits the alternative was not recorded; storing "opt2" alone would be strictly worse.
  {
    const src = readFileSync(GLASS, "utf8");
    if (!/chose:/.test(src)) fails.push("6: a saved ruling no longer records WHICH option he chose in words — DECISIONS.md would hold a numeral whose card is gone");
    if (!/options:/.test(src)) fails.push("6: a saved ruling no longer records the options he was shown — 'the alternative he did not pick' becomes unrecoverable again");
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (fails.length) {
  console.log(`FAIL — numbered_options_check (${fails.length}):`);
  for (const f of fails) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASS — numbered_options_check: every call he has to make is numbered with a (recommended), older questions still answerable, and his choice is stored in words.");
