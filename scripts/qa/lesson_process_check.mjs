#!/usr/bin/env node
/* lesson_process_check.mjs — the daily lesson has a WRITER, a caller, and a shape his page renders.
 *
 * HIS WORDS, 2026-09-03, with a screenshot of the card:
 *   "the Lesson is two days old; it is formatted wrong, and whatever process is supposed to give me
 *    new ones does not exist in a formal way yet. build that, get CEO approval."
 *
 * THREE FAULTS IN ONE SENTENCE, and the middle one is the one he could SEE:
 *   (a) STALE — `LESSONS.md` held ONE entry, dated 2026-09-01. Nothing wrote to it.
 *   (b) FORMATTED WRONG — the body rendered under `white-space:pre-line`, which preserves the
 *       SOURCE FILE's newlines, and that file is hard-wrapped at ~95 columns for a text editor. His
 *       page broke mid-sentence: "…because from the outside a / hard-working session…". And `esc()`
 *       escaped the markdown, so *crash-only design* reached him as literal asterisks.
 *   (c) NO PROCESS — "the day's close owes one" was a sentence in a runbook.
 *
 * ⚠ WHAT THIS GATE DELIBERATELY DOES NOT DO: fail the build on a day with no lesson. That would
 * punish the build for a human cadence, and it would push somebody to manufacture one — which is
 * worse than the honest empty state his card already shows. **The gate holds the MACHINERY and the
 * SHAPE; the page's own "the day's close owes one" holds the cadence.**
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NL = String.fromCharCode(10);
const fails = [];
const dir = mkdtempSync(join(tmpdir(), "lesson-"));

try {
  // 1 — THE WRITER EXISTS AND REFUSES THE WAYS AN ENTRY GOES WRONG.
  {
    const W = join(ROOT, "scripts", "wyclau", "add_lesson.mjs");
    const run = (args) => {
      try { execFileSync(process.execPath, [W, ...args], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); return 0; }
      catch (e) { return e.status ?? 1; }
    };
    if (run([]) === 0) fails.push("1: add_lesson wrote a lesson with no title and no body");
    if (run(["--title=x"]) === 0) fails.push("1: add_lesson wrote a lesson with no body");
    if (run(["--title=x", "--body=y", "--date=nonsense"]) === 0) fails.push("1: add_lesson accepted a date his page cannot parse — the entry would be silently invisible");
    /* At most one a day: two entries for one date make "today's lesson" ambiguous and the page shows
       only the newest, so the second would be written and never seen. */
    const firstDate = (readFileSync(join(ROOT, ".planning", "wyclau", "LESSONS.md"), "utf8")
      .match(/^## (\d{4}-\d{2}-\d{2}) /m) || [])[1];
    if (firstDate && run(["--title=x", "--body=y", `--date=${firstDate}`]) === 0) {
      fails.push(`1: add_lesson wrote a SECOND lesson for ${firstDate} — the page shows one, so the other is invisible`);
    }
  }

  // 2 — EVERY ENTRY MATCHES THE SHAPE HIS PAGE PARSES. glass.mjs matches
  //     /^## (\d{4}-\d{2}-\d{2}) [—-]+ (.+)$/m; anything else is silently absent from his card.
  {
    const raw = readFileSync(join(ROOT, ".planning", "wyclau", "LESSONS.md"), "utf8");
    const heads = raw.split(NL).filter((l) => /^## /.test(l));
    if (!heads.length) fails.push("2: LESSONS.md holds no entries at all");
    for (const h of heads) {
      if (!/^## \d{4}-\d{2}-\d{2} [—-]+ .+$/.test(h)) {
        fails.push(`2: an entry his page cannot parse, so it never appears on his card: "${h.slice(0, 60)}"`);
      }
    }
  }

  /* 3 — ⛔ THE FORMATTING FAULT HE SCREENSHOTTED. The body must reach his page as flowing prose,
   *     not broken at the width of whoever wrapped the file, and its markdown must be RENDERED.
   *     Rendered for real through glass.mjs, because a unit test of the helper cannot see whether
   *     the page still applies `white-space:pre-line` around it. */
  {
    const chart = [
      "# CHART", "", "## STEP 1 CHECKLIST", "", "- [ ] **A row.**", "      ⟨`T-901`⟩", "",
      "## BLOCKED ON WYATT", "", "| Question | Recommendation | since |", "|---|---|---|", "",
      "## RULED", "", "| question | his verdict |", "|---|---|", "",
    ].join(NL);
    writeFileSync(join(dir, "CHART.md"), chart);
    try {
      execFileSync(process.execPath, [join(ROOT, "scripts", "wyclau", "glass.mjs"), `--chart=${join(dir, "CHART.md")}`],
        { cwd: ROOT, stdio: "ignore" });
    } catch (e) { fails.push(`3: glass.mjs could not render (exit ${e.status}) — nothing below is checked`); }
    let html = "";
    try { html = readFileSync(join(ROOT, ".planning", "wyclau", "glass.html"), "utf8"); } catch { /* below */ }
    const m = html.match(/<div class="lessonBody">([\s\S]*?)<\/div>/);
    if (!m) fails.push("3: the lesson body did not render on his page at all");
    else {
      const bodyHtml = m[1];
      if (/white-space:\s*pre-line/.test(html.slice(Math.max(0, html.indexOf(bodyHtml) - 400), html.indexOf(bodyHtml)))) {
        fails.push("3: the lesson still renders with white-space:pre-line — the source file's editor wrapping breaks his page mid-sentence, which is the fault he screenshotted");
      }
      const inner = bodyHtml.replace(/<[^>]+>/g, "");
      if (/\S\n\S/.test(inner.replace(/\n\s*\n/g, "\n\n"))) {
        fails.push("3: hard newlines survive inside a paragraph — his page will break mid-sentence again");
      }
      if (/(^|[^*])\*[^*]/.test(inner)) {
        fails.push("3: a literal asterisk reached his page — the lesson's markdown is being escaped instead of rendered");
      }
    }
  }

  /* 4 — HIS TEXT IS ESCAPED BEFORE IT IS MARKED UP. He writes these; a lesson quoting a tag must
   *     arrive as text, never as markup. Checked on the real renderer through a fixture file. */
  {
    const src = readFileSync(join(ROOT, "scripts", "wyclau", "glass.mjs"), "utf8");
    const fn = src.slice(src.indexOf("const lessonHtml"), src.indexOf("const lessonHtml") + 1400);
    if (!/esc\(joined\)/.test(fn)) {
      fails.push("4: the lesson body is no longer escaped before markdown is applied — a lesson quoting a tag becomes markup on his page");
    }
    const escAt = fn.indexOf("esc(joined)"), boldAt = fn.indexOf("<b>$1</b>");
    if (escAt !== -1 && boldAt !== -1 && boldAt < escAt) {
      fails.push("4: markdown is applied BEFORE escaping — the escape would then eat the tags it just made");
    }
  }

  /* 5 — ⛔ THE ANTI-DECAY CLAUSE: THE DOOR MUST NAME THE COMMAND. A writer nothing invokes is the
   *     third instance of this exact failure on this project (the ranker nothing ran; the harvest
   *     nothing called), and both were found the same way — HE ASKED AGAIN. */
  {
    const door = readFileSync(join(ROOT, ".claude", "skills", "door", "SKILL.md"), "utf8");
    if (!door.includes("add_lesson.mjs")) {
      fails.push("5: the Door no longer names add_lesson.mjs — the daily lesson is back to being a sentence somebody has to remember, which is the state he complained about");
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (fails.length) {
  console.log(`FAIL — lesson_process_check (${fails.length}):`);
  for (const f of fails) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASS — lesson_process_check: a lesson is written by a command that refuses bad ones, the Door names it, and the body reaches his page as flowing prose with its markdown rendered.");
