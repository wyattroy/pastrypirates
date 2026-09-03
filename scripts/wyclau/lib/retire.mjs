/* retire.mjs — RECORDING WYATT'S ANSWER AND RETIRING HIS QUESTION, AS ONE ACT. The only copy.
 *
 * WHY THIS IS A MODULE AND NOT A SECOND COPY INSIDE THE HARVEST. Rule 23: two things that must
 * agree are one thing, or they will drift. This act carries three details that were each earned and
 * each easy to leave out of a second copy —
 *
 *   · the `|` and newline escaping (CEO 125: a ruling he types on his phone containing a pipe would
 *     otherwise split `## RULED` into extra cells, and a newline would drop the rest of his sentence
 *     into the document as prose — the one act promising "his words, verbatim" broken BY his words);
 *   · the `<!--qid:…-->` stamped onto the row it writes, which is the only thing that makes the
 *     answered-set readable on a machine without `.planning/wyclau/LAST-HARVEST` (gitignored);
 *   · ONE write, so a crash cannot leave the question deleted and his answer unrecorded.
 *
 * A copy of this in the harvest would have had to reproduce all three, and the day one of them was
 * fixed in one copy only, his words would start being lost by the caller nobody looked at.
 *
 * IT RETURNS THE NEW TEXT AND WRITES NOTHING. Two callers need different atomicity: the standalone
 * script writes one question's worth, the harvest applies several and then writes the Chart AND the
 * receipt together — and if any of them is refused it must write neither. A function that wrote to
 * disk could not give the second caller that guarantee.
 */

import { section, tableRows, questionId, stripQid } from "./chart_model.mjs";

/** The questions asking him right now, each with the id his ruling is stored under. */
export function liveQuestions(chartText) {
  return tableRows(section(chartText, "BLOCKED ON WYATT") ?? "").map((r) => ({
    raw: r.raw,
    cell: r.cells[0],
    ...questionId(r.cells[0]),
  }));
}

/* HIS WORDS GO INTO A TABLE CELL, AND A TABLE CELL ENDS AT A PIPE. Escaped rather than stripped: he
   must be able to read back exactly what he typed. */
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

/**
 * Retire one question: add his verdict to `## RULED` and delete the row from `## BLOCKED ON WYATT`,
 * in the same returned string.
 *
 * @returns {{ok: true, next: string, row: string}|{ok: false, error: string, live: string[]}}
 */
export function retireQuestion(chartText, qidRaw, verdictRaw) {
  const qid = String(qidRaw ?? "").trim().toLowerCase();
  const verdict = String(verdictRaw ?? "").trim();
  const rows = liveQuestions(chartText);

  if (!qid) return { ok: false, error: "no question id was given.", live: rows.map((r) => r.id) };
  if (!verdict) return { ok: false, error: `no verdict was given for "${qid}". A question retired with no answer on record is his words deleted, which is strictly worse than the bug.`, live: rows.map((r) => r.id) };

  const target = rows.find((r) => r.id === qid);
  /* ⚠ THIS REFUSES RATHER THAN SHRUGS ON PURPOSE. A no-op that reports success tells the caller the
     retirement happened. The whole class of fault being fixed here is "the record says it was done
     and his page still asks", so a silent success is this bug wearing a different hat. */
  if (!target) return { ok: false, error: `no live question in \`## BLOCKED ON WYATT\` has the id "${qid}".`, live: rows.map((r) => r.id) };

  const ruledRow = `| <!--qid:${qid}--> ${cell(stripQid(target.cell))} | ${cell(verdict)} | |`;

  const ruledText = section(chartText, "RULED") ?? "";
  const headerRule = ruledText.split("\n").findIndex((l) => /^\|[\s:|-]+$/.test(l.trim()));
  if (headerRule < 0) return { ok: false, error: "could not find the `|---|` header rule under `## RULED` in CHART.md, so there is no safe place to add the row. Fix the table by hand and run again.", live: rows.map((r) => r.id) };

  /* TWO EDITS, ONE STRING. The deletion and the addition are computed against the same in-memory
     text and are returned together or not at all — a half-applied retirement is not reachable. */
  let next = chartText.replace(ruledText, ruledText.split("\n")
    .flatMap((l, i) => (i === headerRule ? [l, ruledRow] : [l])).join("\n"));
  const before = next;
  next = next.split("\n").filter((l) => l !== target.raw).join("\n");
  if (next === before) return { ok: false, error: `the question row was found by the parser but its exact line could not be removed. Nothing was written. The row: ${target.raw.slice(0, 90)}…`, live: rows.map((r) => r.id) };

  return { ok: true, next, row: ruledRow };
}
