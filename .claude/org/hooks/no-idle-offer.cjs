#!/usr/bin/env node
/* no-idle-offer.cjs — a Stop hook. A TURN MAY NOT END ON AN OFFER.
 *
 * WHY THIS EXISTS, and it is one incident, not a theory. On 2026-08-30 a session finished a
 * builder's work and closed with:
 *
 *     "Starting the checker now unless you want the tester first."
 *
 * THAT SENTENCE IS AN OFFER, AND AN OFFER ENDS THE TURN. No checker was spawned. The session went
 * idle, the container was reclaimed, and the only thing that noticed was the user reading
 * "resumed session" in the desktop app hours later. The supervisor built four hours earlier for
 * exactly this did not catch it, because it watches whether a WORKER is alive, and the thing that
 * stopped was the BRIDGE.
 *
 * IT IS THE SAME SHAPE AS A FAULT THE SAME PROJECT PAID FOR THAT MORNING: an instruction that ends
 * at a CHOICE instead of at an ACTION produces a session that believes it finished. "Then hand him
 * the file path" stopped one step short of the person. "unless you want the tester first" stopped
 * one step short of the work. Both read as complete from the inside.
 *
 * THE LINE THIS DRAWS, and it is why the rule can be absolute rather than clever:
 *
 *   A genuine question goes through the QUESTION UI (AskUserQuestion). That is already the
 *   standing rule in every repo this kit installs into, and a question asked that way does NOT
 *   end the run — it is a tool call, and everything not waiting on the answer keeps moving.
 *
 *   So an offer written as PROSE at the end of a turn is never the right shape. Either the work
 *   is already authorised — take it — or a decision is genuinely needed, and it belongs in the UI.
 *
 * That is what makes this hook honest instead of a guess: it does not try to infer whether work
 * was outstanding. It does not need to. It asserts a shape, and the shape is wrong either way.
 *
 * ⚠ WHAT IT CAN AND CANNOT SEE — stated here because an instrument that reports a result without
 * naming what it touched is the recurring fault this whole organisation was built to end:
 *
 *   CAN see:    the text of the final assistant message in the transcript, and whether the turn
 *               used AskUserQuestion.
 *   CANNOT see: whether any work was actually left undone. A turn that genuinely finished
 *               everything and closed with "want me to do anything else?" is blocked too — and
 *               that is deliberate, not a bug: rewriting it costs one sentence, and the failure
 *               it prevents costs a night.
 *
 * IT BLOCKS AT MOST ONCE PER TURN (stop_hook_active). An unbounded block is a hung session, which
 * is the very thing being prevented.
 */
"use strict";
const fs = require("fs");

let raw = "";
try { raw = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }
let inp = {};
try { inp = JSON.parse(raw || "{}"); } catch { process.exit(0); }

// Already blocked once this turn. Blocking again risks a loop, and a hung session is worse than
// a badly-worded closing line.
if (inp.stop_hook_active) process.exit(0);

const tp = inp.transcript_path;
if (!tp || !fs.existsSync(tp)) process.exit(0);

let lines;
try { lines = fs.readFileSync(tp, "utf8").split("\n").filter(Boolean); } catch { process.exit(0); }

/* Walk backwards to the last assistant message, collecting its text and noting whether this turn
   asked through the question UI. "This turn" = back to the most recent user message, because that
   is the boundary the model itself is working within. */
let text = "";
let usedQuestionUI = false;
for (let i = lines.length - 1; i >= 0; i--) {
  let e;
  try { e = JSON.parse(lines[i]); } catch { continue; }
  const role = e.type || (e.message && e.message.role);
  if (role === "user" || e.type === "user") {
    // A tool RESULT is delivered as a user-role row; a real user turn is where we stop.
    const c = e.message && e.message.content;
    const isToolResult = Array.isArray(c) && c.some(b => b && b.type === "tool_result");
    if (!isToolResult) break;
    continue;
  }
  const content = (e.message && e.message.content) || e.content;
  if (!Array.isArray(content)) continue;
  for (const b of content) {
    if (!b) continue;
    if (b.type === "tool_use" && b.name === "AskUserQuestion") usedQuestionUI = true;
    if (b.type === "text" && typeof b.text === "string" && !text) text = b.text;
  }
}

if (!text) process.exit(0);

// A question asked properly is not this hook's business.
if (usedQuestionUI) process.exit(0);

/* ONLY THE CLOSING SENTENCES ARE EXAMINED, and the first draft of this got it wrong in a way
   worth recording. It took the last 420 CHARACTERS, which on a short reply is the whole message —
   so a reply that said "I could have asked shall I do this or that, but instead I ran it" was
   blocked for quoting the very shape it was refusing. AN INSTRUMENT AIMED ONE LEVEL TOO WIDE
   REPORTS A FAULT THAT IS NOT THERE; that is this project's own recurring lesson, committed inside
   the hook written to enforce it, and caught by red-proofing before it ever ran for real.
   A reply may properly weigh options in the middle and then say what it did. What is forbidden is
   CLOSING on one — so the subject is the last TWO sentences, nothing earlier. */
const sentences = text.replace(/\s+$/, "").split(/(?<=[.!?])[\s)\]*"']+/).filter(s => s.trim());
const tail = sentences.slice(-2).join(" ").toLowerCase();

const OFFERS = [
  /\bunless you (?:want|would rather|prefer|say)\b/,
  /\bshall i\b/,
  /\bwant me to\b/,
  /\bdo you want me to\b/,
  /\bwould you like me to\b/,
  /\bshould i (?:start|run|do|go|spawn|kick|fix|carry|continue|proceed)\b/,
  /\blet me know (?:if|which|when|whether|and)\b/,
  /\bsay the word\b/,
  /\bready when you are\b/,
  /\bhappy to .{0,40}\bif you\b/,
  /\bi can .{0,60}\bif you(?:'d| would)? (?:like|want|prefer)\b/,
  /\bwhich (?:one )?(?:do you want|would you like|should i)\b/,
  /\bor (?:do you want|would you rather|shall i)\b/,
];

const hit = OFFERS.find(re => re.test(tail));
if (!hit) process.exit(0);

const reason = [
  "STOP BLOCKED — this turn ends on an OFFER, and an offer ends the run.",
  "",
  "The closing text matched: " + String(hit),
  "",
  "This is the 2026-08-30 failure exactly. A session closed with \"Starting the checker now",
  "unless you want the tester first\", spawned nothing, and sat idle until the container was",
  "reclaimed. From the inside it read as finished.",
  "",
  "THERE ARE ONLY TWO CORRECT SHAPES, and you must take one before ending:",
  "",
  "  1. THE WORK IS ALREADY AUTHORISED -> DO IT NOW, in this turn, and say what you did.",
  "     Offering to do something you have already been told to do is not politeness; it is a",
  "     stall the user has to notice and restart.",
  "",
  "  2. YOU GENUINELY NEED A DECISION -> ask through the QUESTION UI (AskUserQuestion), not in",
  "     prose. That is the standing rule, and a question asked that way does not stop the run:",
  "     everything that does not depend on the answer keeps moving while it waits.",
  "",
  "Rewriting the sentence alone does NOT clear this. If there is a next step, take it.",
].join("\n");

process.stdout.write(JSON.stringify({ decision: "block", reason }));
process.exit(0);
