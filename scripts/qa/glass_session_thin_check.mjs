#!/usr/bin/env node
/* glass_session_thin_check.mjs — the Glass-update session must stay EMPTY between ticks.
 *
 * WHY (INBOX-20260902T05xxZ-a). Wyatt, 2026-09-02: *"make sure that Glass Update Session gets
 * cleared between ticks or updates or whatever you call its tasks -- we don't want to keep adding
 * to its context, that's unnecessary."*
 *
 * ⚠ AND IT WAS THE SECOND TIME HE ASKED. The first is quoted in the runbook's own opening line —
 * *"…updates the glass with whatever it needs to, THEN CLEARS ITSELF AFTERWARDS"* — and that
 * document was written from that sentence and then specified a mechanism (a cron prompt carrying
 * nine steps) that cannot do its last four words. His instruction was recorded faithfully and the
 * part that was hard to build quietly did not get built. That is the fault class this file guards:
 * not a wrong sentence, a MISSING one, in a document everybody believes is complete.
 *
 * THE SHAPE HE GOT, and what has to stay true for it to keep working:
 *   - the cron prompt is a POINTER ("run one Glass tick — read the runbook"), never the steps, so
 *     the steps do not land in the session's context on every fire;
 *   - each tick runs in a FRESH general-purpose subagent, which is the only "clears itself
 *     afterwards" available here (`/clear` cannot be typed by a cron prompt; `claude -p` has no
 *     Artifact tool on this machine — both measured, both recorded in the runbook);
 *   - the steps live in the runbook, where an edit reaches the NEXT tick.
 *
 * ============================================================================
 * THE HOLE THIS FILE WAS WRITTEN RED AGAINST — presence is not shape
 * ============================================================================
 * The runbook's re-arm box said, in full: *"CronList. If the dispatcher job is there, nothing to
 * do."* **A cron job armed with the OLD nine-step prompt IS "there".** So a reader following the
 * runbook after a /clear sees a job, does nothing, and leaves the fat-context shape running —
 * his ask silently unmet while every document says it is done. Committed is not delivered, and
 * a presence check cannot tell the two apart.
 *
 * ============================================================================
 * WHAT THIS CHECK CAN AND CANNOT SEE — said out loud, because an instrument that reports a
 * result without naming its subject is this project's oldest recurring fault
 * ============================================================================
 *   CAN see:    what the RUNBOOK instructs — the one artifact every tick reads at spawn time, and
 *               the only durable carrier of this shape. Each rule below is run against fixtures
 *               that must FAIL it, so the check is falsifiable rather than merely green.
 *   CANNOT see: the live cron job's actual prompt. Cron jobs live only in the session that created
 *               them; nothing outside the Glass-update session can read one. That is precisely why
 *               the runbook must tell its reader to check the SHAPE — this file cannot do it for
 *               them, and no reader should think it does.
 *
 * THE DELIBERATE COST, stated so nobody rediscovers it as a bug: the runbook can no longer quote
 * the deleted presence-only clause verbatim without turning the suite red — the first draft of the
 * fix did exactly that in its own explanation and this check caught it. It paraphrases instead,
 * which is the right trade (the same one glass_gate_verdict_logged_check.mjs made after CEO 100):
 * the runbook is an instruction sheet, and the history belongs here and in the Inbox.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUNBOOK = join(ROOT, ".planning", "wyclau", "GLASS-UPDATE-SESSION.md");

/* Blockquote markers are decoration here — the same instruction means the same thing inside a ⚑
   box or outside one. Strip them so no rule can be defeated by moving a line into a quote. */
const unquote = (text) => text.split("\n").map((l) => l.replace(/^\s*>\s?/, "")).join("\n");

/* Sections are addressed by HEADING, never by line number. A row about stale pointers going stale
   is this document family's own recorded fault (CEO 93) — cite a symbol, never a line.
   A section runs to the next heading of the SAME OR HIGHER level, so its own sub-headings stay
   inside it: a rule that ended at the first `###` could be defeated by putting a subtitle above
   the instruction it is meant to read. */
function sectionLines(text, headingRe) {
  const raw = text.split("\n");
  const lines = unquote(text).split("\n");
  const level = (l) => (l.match(/^(#{1,6})\s/) || [, ""])[1].length;
  const start = lines.findIndex((l) => level(l) >= 2 && level(l) <= 4 && headingRe.test(l));
  if (start === -1) return null;
  const depth = level(lines[start]);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const l = level(lines[i]);
    if (l && l <= depth) { end = i; break; }
  }
  return { raw: raw.slice(start, end), plain: lines.slice(start, end) };
}
const section = (text, headingRe) => sectionLines(text, headingRe)?.plain.join("\n") ?? null;

/* THE CRON PROMPT ITSELF — the first blockquote inside a section, which is how every prompt in
   this runbook is written. Scoped this tightly on purpose: the surrounding section also EXPLAINS
   the tick, and naming a command in prose is not the same as putting it in the prompt. A rule
   that read the whole section flagged the box explaining why `glass_gate_log.mjs` exists, which
   is a true sentence in the wrong place — a false alarm is how a gate loses its reader. */
function quotedPrompt(text, headingRe) {
  const sec = sectionLines(text, headingRe);
  if (!sec) return null;
  const first = sec.raw.findIndex((l) => /^\s*>/.test(l));
  if (first === -1) return null;
  let end = first;
  while (end < sec.raw.length && (/^\s*>/.test(sec.raw[end]) || !sec.raw[end].trim())) end++;
  return unquote(sec.raw.slice(first, end).join("\n"));
}

/* THE AUDIT, as a pure function of the runbook's text — so the fixtures below exercise the very
   same code the real file goes through, rather than a re-implementation of it. */
export function auditRunbook(text) {
  const out = [];
  const bad = (id, msg) => out.push({ id, msg });
  const all = unquote(text);

  /* 1. THE DISPATCHER SHAPE MUST BE STATED AT ALL. Without it the file is the pre-2026-09-02
   *    version, where every tick appended a full transcript — including a ~100KB read of the live
   *    artifact — to one conversation that never reset.
   *    ⚠ HEADINGS DO NOT COUNT, and this was found by the red-proof rather than reasoned out: the
   *    first version of this rule read the whole file, so a fixture whose BODY said "the session
   *    runs the steps itself" still passed on the strength of a heading above it saying the
   *    opposite. A banner claiming a shape the instructions contradict is this document family's
   *    most-repeated fault, so the one place the rule must not look is the banner. */
  const body = all.split("\n").filter((l) => !/^#{1,6}\s/.test(l)).join("\n");
  if (!/fresh\s+(?:general-purpose\s+)?subagent/i.test(body) || !/\bper tick\b|each tick/i.test(body))
    bad("dispatcher-shape", "the runbook never says each tick runs in a FRESH subagent — that is the only 'clears itself afterwards' available here, and without it the session accumulates a full transcript per tick");

  // 2. THE CRON PROMPT MUST BE A POINTER, NOT THE STEPS. A prompt that carries nine steps carries
  //    them into the context on every fire, which is the waste he named. It must also be able to
  //    reach the steps, so it has to name the runbook.
  const recur = quotedPrompt(text, /Making it recur/i);
  if (!recur) {
    bad("recur-section", "the runbook has no cron prompt under 'Making it recur without him' — nothing states what to arm, so the next person to arm it will paste the steps");
  } else {
    if (!/GLASS-UPDATE-SESSION\.md/.test(recur))
      bad("recur-pointer", "the cron prompt does not point at GLASS-UPDATE-SESSION.md — a prompt that cannot reach the steps has to carry them, and carrying them is the fault");
    if (!/subagent/i.test(recur))
      bad("recur-subagent", "the cron prompt does not tell the session to spawn a subagent — it would do the work in its own context, which is the shape he asked to be rid of");
    /* The tell that the steps have been inlined: the prompt starts reciting the tick. Match the
       WORK, not a count of numbered lines, so a reworded five-step version is caught too. */
    const inlined = [/HARVEST FIRST/i, /glass\.mjs\s+--note/, /mark_glass_published/, /glass_gate_log/, /action:\s*"read"/]
      .filter((re) => re.test(recur));
    if (inlined.length)
      bad("recur-inlined", `the cron prompt has the tick's own steps inlined (${inlined.length} of the tick's commands appear in it) — the steps must stay in the runbook, or every fire carries them into the session's context and the runbook can no longer be corrected without re-arming`);
  }

  // 3. THE STEPS MUST ACTUALLY LIVE IN THE RUNBOOK. The pointer is only worth anything if what it
  //    points at is there.
  const paste = section(text, /instruction to paste into it/i);
  if (!paste || !/HARVEST FIRST/i.test(paste) || !/mark_glass_published/.test(paste))
    bad("steps-present", "the tick's steps are not in the runbook's 'instruction to paste into it' section — the cron prompt points at nothing, so the next tick has no instructions");

  // 4. THE RE-ARM CHECK MUST BE A SHAPE CHECK, NOT A PRESENCE CHECK. ⚠ THIS IS THE RULE THE REAL
  //    FILE FAILED ON when this gate was written. A job armed with the old nine-step prompt IS
  //    "there"; a reader told only to look for a job would leave the fat shape running.
  const rearm = section(text, /FIRST ACTION AFTER A .*clear|CronList/i);
  if (!rearm) {
    bad("rearm-section", "the runbook has no re-arm box — after Wyatt clears the session nothing tells the next context to check the cron job at all, and a Glass that stops updating gives him a frozen page with no signal that it froze");
  } else {
    const presenceOnly = /\b(?:if\s+(?:the\s+)?(?:dispatcher\s+)?job\s+is\s+there|if\s+it(?:'s| is)\s+there)\b[^.\n]{0,40}nothing to do/i.exec(rearm);
    if (presenceOnly)
      bad("rearm-presence-only", `the re-arm box settles for the job merely EXISTING ("${presenceOnly[0].trim()}") — a job armed with the old nine-step prompt is also 'there', so this passes while his ask is unmet`);
    const checksPrompt = /\bprompt\b/i.test(rearm)
      && /(dispatcher line|pointer|not the (?:nine|9) steps|carries the steps|carrying the steps|its shape|the SHAPE)/i.test(rearm);
    if (!checksPrompt)
      bad("rearm-no-shape-check", "the re-arm box never tells the reader to look at the armed job's PROMPT and compare it to the dispatcher line — presence is not shape, and only shape answers whether the session is still thin");
    if (!/delete|re-?arm|replace/i.test(rearm))
      bad("rearm-no-repair", "the re-arm box says what to look for but never what to DO about a wrong prompt — a finding with no repair is a reader who shrugs");
  }

  return out;
}

/* ------------------------------------------------------------------ */

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures++; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("the Glass-update session stays empty between ticks\n");

if (!existsSync(RUNBOOK)) {
  fail(".planning/wyclau/GLASS-UPDATE-SESSION.md is missing — the tick has no runbook to read at spawn time, so the dispatcher shape has no carrier at all");
  console.log(`\nFAIL (${failures})`);
  process.exit(1);
}
const book = readFileSync(RUNBOOK, "utf8");

// ── THE SUBJECT ──────────────────────────────────────────────────
const found = auditRunbook(book);
if (found.length) for (const f of found) fail(`[${f.id}] ${f.msg}`);
else pass("the runbook carries the dispatcher shape: a pointer prompt, a fresh subagent per tick, the steps in the file, and a re-arm box that checks the prompt's shape");

/* ── RED-PROOF ────────────────────────────────────────────────────
 * A check that can only say PASS is not a check. Each fixture below breaks exactly one rule and
 * must be caught by that rule's own id — so a future edit that guts a rule turns this red rather
 * than quietly widening what sails through. (HARD-WON-LESSONS §12i: a gate asserting on a copy
 * of itself is the fault; these assert on the same auditRunbook() the real file goes through.) */
const GOOD = `
## The instruction to paste into it
> 2. **HARVEST FIRST.** Read the live page with the Artifact tool, action: "read".
> 8. node scripts/wyclau/mark_glass_published.mjs --version=<id>

## FIRST ACTION AFTER A /clear: RUN CronList.
1. CronList. Read the armed job's PROMPT, not just its presence.
2. If that prompt is not the dispatcher line — if it carries the steps — delete the job and re-arm.

## EACH TICK RUNS IN A FRESH SUBAGENT
Each tick spawns a fresh general-purpose subagent; the session stays empty.

## Making it recur without him
> Run one Glass tick. Spawn a FRESH general-purpose subagent and give it the nine steps from
> .planning/wyclau/GLASS-UPDATE-SESSION.md as its entire prompt.
`;
const cases = [
  ["a healthy fixture", GOOD, null],
  ["a cron prompt with the steps inlined", GOOD.replace("as its entire prompt.", "as its entire prompt. First HARVEST FIRST, then run node scripts/wyclau/glass.mjs --note and mark_glass_published."), "recur-inlined"],
  ["a re-arm box that only checks the job EXISTS", GOOD.replace(/1\. CronList\..*\n2\. If that prompt.*\n/, "1. CronList. If the dispatcher job is there, nothing to do.\n"), "rearm-presence-only"],
  ["a runbook with no dispatcher shape at all", GOOD.replace("Each tick spawns a fresh general-purpose subagent; the session stays empty.", "The session runs the steps itself."), "dispatcher-shape"],
  ["a cron prompt that names no runbook to read", GOOD.replace(".planning/wyclau/GLASS-UPDATE-SESSION.md as its entire prompt.", "as its entire prompt."), "recur-pointer"],
  ["a runbook whose steps have gone missing", GOOD.replace(/> 2\. \*\*HARVEST FIRST.*\n> 8\..*\n/, ""), "steps-present"],
];
for (const [name, fixture, expectedId] of cases) {
  const ids = auditRunbook(fixture).map((f) => f.id);
  if (expectedId === null) {
    if (ids.length) fail(`red-proof: ${name} should be clean and was flagged ${JSON.stringify(ids)} — the rules are firing on a runbook that has everything he asked for`);
    else pass(`red-proof: ${name} passes clean`);
  } else if (!ids.includes(expectedId)) {
    fail(`red-proof: ${name} was NOT caught by rule '${expectedId}' (got ${JSON.stringify(ids)}) — that rule cannot fail, so it is protecting nothing`);
  } else {
    pass(`red-proof: ${name} is caught by '${expectedId}'`);
  }
}

console.log(failures === 0 ? "\nPASS" : `\nFAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
