/* chart_model.mjs — ONE reading of the Chart, for everything that needs to know what is open.
 *
 * WHY THIS IS A MODULE AND NOT A SECOND PARSER. Rule 23: two things that must agree are one thing,
 * or they will drift. The Chartkeeper's whole job is to re-order THE LIST WYATT SEES; if it derives
 * "what is open" differently from `glass.mjs`, it will perfectly re-order a list his phone does not
 * render, and nothing would ever say so.
 *
 * ✅ THE CONVERGENCE IS FINISHED — 2026-09-02. `glass.mjs` now IMPORTS `stateOf` from this file.
 * There is one fate rule and one place it lives.
 *
 * ⚠ THIS HEADER SAID THE OPPOSITE FOR A DAY, IN THREE WAYS, AND ALL THREE WERE WRONG BY THE TIME
 * ANYONE READ THEM — which is the exact rot this project's rules forbid, sitting in the file whose
 * whole job is to stop two things drifting:
 *   1. *"THE CONVERGENCE IS NOT FINISHED"* — it is, see above.
 *   2. *"the kit lives outside this session's allowed working directory — measured, not assumed: an
 *      `ls` of the kit path is refused."* **FALSE.** CEO 102 listed the kit and read ten files in
 *      it; a later session verified the same. What is fenced is an unattended `claude -p` watch,
 *      because `bell.ps1` launches it with no added directories — a permission setting, not physics.
 *      **That sentence carried the word "measured" and had not been re-measured since.**
 *   3. *"THE FATE TEST BELOW IS COPIED DELIBERATELY"* — it was, and then `glass.mjs` moved to three
 *      states and this file did not. **Measured at the moment of the fix: the model saw 3 open ideas
 *      while his page rendered 14.** A gap of eleven, ten of which were Wyatt's own words. So the
 *      Chartkeeper's RANK was ordering a list that did not contain his requests — precisely the
 *      failure the paragraph above it warns about, happening underneath it.
 *
 * THE LESSON, and it is worth more than the fix: **writing the module was not the convergence.**
 * Two copies of a rule are two copies whether or not one of them is called "the model", and a gate
 * that compares COUNTS ON A FIXTURE did not notice the real Chart diverging by eleven rows.
 * The scars the old comment protected are preserved in `stateOf` below — the DECLARED-verdict rule
 * and the STILL_OPEN override are both there, and both were earned (CEO Review 63 caught one).
 */

/* A section body: everything under `## <NAME>` up to the next `## `. The same split `glass.mjs`
   uses, character for character, so a heading rename breaks both at once rather than one silently. */
export function section(text, heading) {
  const re = new RegExp(`^## ${heading}[^\\n]*$`, "m");
  const after = text.split(re)[1];
  if (after === undefined) return null;
  return after.split(/^## /m)[0];
}

/* ⚑ THREE STATES, AND THIS MODULE IS NOW THE ONE PLACE THEY LIVE — 2026-09-02, Wyatt's ruling.
 *
 * WHAT WAS HERE: one list of eight words, with SCHEDULED among them, deciding "is this dealt with?".
 * `glass.mjs` was changed to three states the same day and THIS FILE WAS NOT — so for a few hours
 * the two derivations this module exists to unify were themselves diverged. **Measured before the
 * fix: the model saw 3 open ideas while his page rendered 14 — a gap of ELEVEN, ten of which were
 * his own words.** RANK was ordering a list that did not contain his requests at all, which is the
 * precise failure this file's own header warns about, happening inside it.
 *
 * The lesson is the header's, sharpened: writing the module was not the convergence. **Two copies
 * of a rule are two copies whether or not one of them is called "the model."** The convergence is
 * `glass.mjs` IMPORTING these, which it now does.
 *
 * FINISHED hides. COMMITTED and PARKED are still OPEN WORK and stay on his list — his Charter names
 * scheduled and parked as VISIBLE fates, and SCHEDULED means committed-and-not-done, which is the
 * definition of an open task. */
export const DECLARED = /(?:→|->)\s*\*\*([^*]{0,160})/;
export const FINISHED_WORDS = ["SHIPPED", "HARVESTED", "CLOSED", "DONE", "FIXED", "ROOT-CAUSED"];
export const COMMITTED_WORDS = ["SCHEDULED"];
export const PARKED_WORDS = ["PARKED"];
const wordRe = (list) => new RegExp(String.raw`\b(${list.join("|")})\b`);
const FINISHED = wordRe(FINISHED_WORDS);
const COMMITTED = wordRe(COMMITTED_WORDS);
const PARKED = wordRe(PARKED_WORDS);
export const STILL_OPEN = /\bSTILL OPEN\b|\bNOT (?:SHIPPED|DONE|BUILT|FIXED)\b|\bUNCONFIRMED\b/;

/* The one state function. A sentence saying it is still open beats any word-match — that override
   is the lesson two earlier versions of this test were corrected for, and it survives here. */
export function stateOf(block) {
  const m = DECLARED.exec(block);
  if (!m) return "open";
  const v = m[1];
  if (STILL_OPEN.test(v)) return "open";
  if (FINISHED.test(v)) return "finished";
  if (COMMITTED.test(v)) return "committed";
  if (PARKED.test(v)) return "parked";
  return "open";
}

/** True when an IDEA INBOX block has announced a fate. Wyatt steers by the open count, so
 *  over-hiding costs him more than over-showing — hence "declared", never "mentioned". */
/* `hasFate` now means ONLY "is it finished?" — it is the thing that decides whether a row leaves
   his list, and committed/parked rows must not. Kept under its old name because callers ask it a
   yes/no question about hiding; anything wanting the three-way answer calls `stateOf`. */
export function hasFate(block) {
  return stateOf(block) === "finished";
}

/* CHUNKING. A section is a sequence of chunks, each either a ROW (a `- [ ]`/`- [x]` line plus its
   indented continuation) or PROSE (headings, blockquotes, tables, blank lines). Reassembly is
   `chunks.map(c => c.lines.join("\n")).join("\n")` and is lossless by construction — which is what
   lets RANK re-order rows without any risk of eating the prose between them. */
function isRowStart(line, marker) {
  return marker === "checklist" ? /^- \[[ xX]\] /.test(line) : /^[-*] /.test(line);
}
function continues(lines, i) {
  // An indented non-empty line continues the row. A blank line continues it only if the next
  // non-blank line is itself indented — otherwise the blank is the row's terminator.
  const line = lines[i];
  if (/^\s+\S/.test(line)) return true;
  if (/^\s*$/.test(line)) {
    for (let j = i + 1; j < lines.length; j++) {
      if (/^\s*$/.test(lines[j])) continue;
      return /^\s+\S/.test(lines[j]);
    }
  }
  return false;
}

export function chunk(sectionText, marker) {
  const lines = sectionText.split("\n");
  const chunks = [];
  let cur = { type: "prose", lines: [] };
  const flush = () => { if (cur.lines.length) chunks.push(cur); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isRowStart(line, marker)) {
      flush();
      cur = { type: "row", lines: [line] };
      while (i + 1 < lines.length && continues(lines, i + 1) && !isRowStart(lines[i + 1], marker)) {
        cur.lines.push(lines[++i]);
      }
      flush();
      cur = { type: "prose", lines: [] };
      continue;
    }
    cur.lines.push(line);
  }
  flush();
  return chunks;
}

export const ID_RE = /`(T-\d{3})`/;

/** The rows of a markdown table, header and rule excluded.
 *
 *  THE HEADER IS FOUND BY POSITION, NOT BY ITS WORDS. The first version of this filter skipped a
 *  header by matching the literal `| Question`, which is the heading of exactly one of the Chart's
 *  two tables — `SETTLED RULINGS` opens `| item |`, so its header would have been read as a real
 *  ruling. A header is the `|` line immediately above the `|---|` rule, and that is derivable in
 *  every table there will ever be. */
export function tableRows(sectionText) {
  const lines = (sectionText ?? "").split("\n").filter((l) => l.trim().startsWith("|"));
  const isRule = (l) => /^\|[\s:|-]+$/.test(l.trim());
  return lines
    .filter((l, i) => !isRule(l) && !isRule(lines[i + 1] ?? ""))
    .map((l) => ({ raw: l, cells: l.split("|").map((c) => c.trim()).filter(Boolean) }))
    .filter((r) => r.cells.length >= 2);
}

/** The one place the row-identity format is written. Every consumer that needs to name a row by its
 *  position — the Chartkeeper's write pass, its sweep — imports this rather than re-typing
 *  `${kind}#${i}`. CEO 95 caught three hand-written copies of it and named the failure exactly:
 *  they would not error, they would silently return nothing, so the tool would stop writing flags
 *  and stop sweeping with everything still green. Rule 23 in miniature. */
export const rowKey = (kind, chunkIndex) => `${kind}#${chunkIndex}`;

/** The one-line title a human (and the Glass) sees: the row's opening paragraph, unwrapped and
 *  markers stripped.
 *
 *  ⚠ A LINE BREAK IN A SOURCE FILE IS NOT A PLACE A SENTENCE ENDS, AND THIS READ THE FIRST LINE.
 *  Found 2026-09-02T19:4xZ by photographing his real page rather than by reading this file: row 1
 *  of the Glass — the row about his own "you just HAVE to fix the glass" ask — rendered as
 *  `Fix the glass — his five asks from the screenshot, 2026-09-02T16:1xZ. his words: *"claude my`
 *  and stopped, because `CHART.md` happens to hard-wrap there. Cut mid-phrase, no ellipsis to say
 *  it had been cut, and a naked markdown asterisk left behind. His ask 5's own words name the
 *  class: "the page clipping content rather than the content being wrong."
 *
 *  THE PARAGRAPH, NOT THE WHOLE ROW. Joining every line would hand callers a 200-line essay under
 *  a heading called `titleOf`; stopping at the first blank line is exactly "the title as it was
 *  typed, with the wrapping taken back out". Rows here put their handle and their body below that
 *  break, which is why the boundary is the row's own convention rather than a length.
 *
 *  `~` SURVIVES ON PURPOSE. `~~` is strikethrough and goes; a lone `~` is "about" — the Chart says
 *  "~90 minutes" in a dozen places, and stripping it would quietly promote an estimate to a fact.
 */
export function titleOf(rowLines) {
  const paragraph = [];
  for (const l of rowLines) { if (!l.trim()) break; paragraph.push(l.trim()); }
  return paragraph.join(" ")
    .replace(/^- \[[ xX]\] /, "")
    .replace(/^[-*] /, "")
    /* ⚠ ANCHORED, AND IT WAS NOT — a regression this file's own change caused and a photograph of
       his page caught before it shipped. Unanchored, and now reading the whole opening paragraph
       rather than one line, this ate a handle in the MIDDLE of a sentence: "the half of `T-078` he
       asked for" rendered as "the half of he asked for". A row's own filing handle leads the title
       (or arrives as ⟨…⟩); a handle inside the prose is Wyatt being told which row is meant. */
    .replace(/^`T-\d{3}`\s*/, "")
    .replace(/⟨[^⟩]*⟩\s*/g, "")
    .replace(/\*\*|~~/g, "")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Everything a signal might want to read: the row's whole text, first line included. */
export const bodyOf = (rowLines) => rowLines.join("\n");

/**
 * The Chart, as the Glass reads it plus the handles the Chartkeeper needs.
 * `tasks` is deliberately the SAME concatenation glass.mjs:385-386 builds — open checklist rows
 * first, then IDEA INBOX entries with no declared fate. CEO 89 caught this being missed in the
 * spec: an unfated idea is a task on his phone, so a keeper blind to them orders the wrong list.
 */
export function parseChart(text) {
  const stepText = section(text, "STEP 1 CHECKLIST") ?? "";
  const inboxText = section(text, "THE IDEA INBOX") ?? "";
  const blockedText = section(text, "BLOCKED ON WYATT") ?? "";

  const stepChunks = chunk(stepText, "checklist");
  const inboxChunks = /\(empty/.test(inboxText) ? [] : chunk(inboxText, "inbox");

  /* `key` IS THE ONLY THING IN HERE GUARANTEED UNIQUE, AND THAT IS WHY IT EXISTS. Everything else a
     caller might reach for as an identity can repeat: two rows may share a title (nothing forbids
     it), and `id` is null until a write pass allocates one. `new Map(pairs)` keeps the LAST value
     for a repeated key without a word, so a title-keyed lookup silently hands one row's verdict to
     another — measured 2026-09-02: REAP's "⚠ STALE-CANDIDATE" flag was written into a row it had
     never judged, and `score()` gave it the +40 that goes with it.
     A chunk index is unique within its own chunk list by construction, and `kind` separates the two
     lists — so this is derived, not a counter somebody has to remember to bump. */
  const mk = (c, kind, i) => ({
    kind,
    chunkIndex: i,
    key: rowKey(kind, i),
    lines: c.lines,
    raw: bodyOf(c.lines),
    title: titleOf(c.lines),
    // The handle is read from the WHOLE row, never just its first line: the first line is what the
    // Glass renders to Wyatt, so nothing machine-readable is allowed to live there (CEO 91).
    id: (ID_RE.exec(bodyOf(c.lines)) || [])[1] ?? null,
    done: kind === "checklist" ? /^- \[[xX]\]/.test(c.lines[0]) : hasFate(bodyOf(c.lines)),
  });

  const rows = stepChunks.map((c, i) => (c.type === "row" ? mk(c, "checklist", i) : null)).filter(Boolean);
  const ideas = inboxChunks.map((c, i) => (c.type === "row" ? mk(c, "inbox", i) : null)).filter(Boolean);

  // His two tables, read the same way — the questions he is still holding, and the ones he has
  // answered. `tableRows` is shared so a change to one can never quietly stop applying to the other.
  const blocked = tableRows(blockedText);
  const settled = tableRows(section(text, "SETTLED RULINGS") ?? "");
  const blockedQuestions = blocked.map((r) => r.cells[0]);

  return {
    stepText, inboxText, blockedText,
    stepChunks, inboxChunks,
    rows, ideas, blockedQuestions,
    /** His open questions and his answered ones, whole lines included, so a consumer can ask
     *  whether a question NAMES a given row rather than guessing from word overlap. */
    blocked, settled,
    openRows: rows.filter((r) => !r.done),
    doneRows: rows.filter((r) => r.done),
    openIdeas: ideas.filter((r) => !r.done),
    /** The list the Glass's Tasks card actually renders, in its order. */
    tasks: [...rows.filter((r) => !r.done), ...ideas.filter((r) => !r.done)],
  };
}

/** Rebuild the file with new section bodies. Splices on the same headings `section()` splits on, so
 *  the two cannot disagree about where a section starts.
 *
 *  ⚠ THIS WAS A REGEX AND THE REGEX WAS SILENTLY WRONG. It read
 *  `(^## <h>[^\n]*$)([\s\S]*?)(?=^## |\Z)` — and **`\Z` IS NOT A JAVASCRIPT ANCHOR.** JavaScript
 *  has no end-of-input escape; `\Z` is just the literal capital letter Z. So the lazy body stopped
 *  at the first `^## ` *or the first Z in the text*, and this repo writes UTC timestamps
 *  constantly ("04:19Z"). A single run on the real Chart spliced the new body in after roughly one
 *  line, and a second run tripled the file: 3,243 insertions.
 *
 *  EVERY GATE WAS HONESTLY GREEN WHILE THIS WAS TRUE, and that is the part worth keeping. The
 *  idempotence case ran twice and compared the results, exactly as designed — but its fixture
 *  contained no letter Z, so the wrong branch was never reached. **A check is only as good as the
 *  one input it was given**, which is rule 6 wearing a different hat: the instrument was fine and
 *  it was pointed somewhere the bug was not. The fixtures now carry a `Z` on purpose.
 *
 *  It is index arithmetic now rather than a cleverer regex. There is no end-of-input escape to get
 *  wrong, and `indexOf` cannot be misread. */
export function replaceSection(text, heading, newBody) {
  const headRe = new RegExp(`^## ${heading}[^\\n]*$`, "m");
  const m = headRe.exec(text);
  if (!m) return text;
  const bodyStart = m.index + m[0].length;
  const nextRe = /^## /m;
  const rest = text.slice(bodyStart);
  const nextHit = nextRe.exec(rest);
  const bodyEnd = nextHit ? bodyStart + nextHit.index : text.length;
  return text.slice(0, bodyStart) + newBody + text.slice(bodyEnd);
}

/** Remove a whole section — its heading AND its body — from the file.
 *
 *  `replaceSection(text, h, "")` is NOT this: it empties the body and leaves the heading standing,
 *  which is right for a section that will be refilled and wrong for one that has moved out of the
 *  document entirely. Added 2026-09-02 for his ruling that the SETTLED RULINGS table leaves
 *  `CHART.md` with the swept rows — an orphaned `## SETTLED RULINGS` above nothing is exactly the
 *  stub he overruled, wearing a heading instead of an arrow.
 *
 *  Deliberately built on the SAME index arithmetic as `replaceSection` rather than a second regex.
 *  Two functions that must agree about where a section ends are one function's worth of agreement
 *  and two functions' worth of drift (rule 23), and the last regex that tried to find that boundary
 *  did it with `\Z` and tripled the file. */
export function dropSection(text, heading) {
  const headRe = new RegExp(`^## ${heading}[^\\n]*$`, "m");
  const m = headRe.exec(text);
  if (!m) return text;
  const bodyStart = m.index + m[0].length;
  const nextHit = /^## /m.exec(text.slice(bodyStart));
  const bodyEnd = nextHit ? bodyStart + nextHit.index : text.length;
  return text.slice(0, m.index) + text.slice(bodyEnd);
}

/* TOKENS — the crude, honest way two pieces of prose are compared here. Distinctive words only:
   five letters or more, lowercased, minus a stopword list that is deliberately short. This is used
   for "does this row's pointer resolve to a live question?" and "how many times has HE raised
   this?", and it is a HEURISTIC, said out loud rather than dressed up: a token overlap is evidence,
   not proof, which is why REAP only ever FLAGS and a watch still closes. */
const STOP = new Set([
  "about", "after", "again", "against", "already", "always", "another", "because", "before",
  "being", "below", "between", "could", "every", "first", "found", "front", "instead",
  "into", "never", "other", "same", "should", "since", "still", "their", "there", "these",
  "thing", "think", "those", "through", "under", "until", "using", "where", "which", "while",
  "whole", "would", "wyatt", "chart", "glass", "watch", "session", "sessions", "planning",
]);
export function tokens(s) {
  return new Set(
    String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w.length >= 5 && !STOP.has(w)),
  );
}
export function overlap(a, b) {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}
