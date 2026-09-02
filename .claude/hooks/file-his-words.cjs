#!/usr/bin/env node
/* file-his-words.cjs — a session that did work and filed NOTHING he said has failed its first duty.
 *
 * WYATT, 2026-09-02: "Wait. You're not supposed to do work. The watch is." … "Also, code this
 * somewhere durable so that you always know to do it."
 *
 * THE DUTY. The Door gives the Advisor one first job, before strategy and before answers: "Every
 * instruction he gives lands in .planning/wyclau/INBOX.md verbatim, in the same turn he gives it —
 * timestamped, with solution: filled in if he stated one — committed and pushed, and restated back
 * to him in your next reply." It exists because he named the failure himself: "the quartermaster
 * sometimes forgot my instructions."
 *
 * WHAT IT COST, the night this was written. An Advisor session took his corrections all evening,
 * acted on every one, shipped real fixes — and filed not a single word of his until he stopped and
 * said so. Acting on an instruction is not the same as recording it: the acting lives in one
 * session's context and dies with it, and the record is the only thing the next session reads.
 *
 * ⚠ WHY THIS IS THE WEAK VERSION, SAID PLAINLY RATHER THAN DRESSED UP. The rule is per-INSTRUCTION;
 * this gate is per-SESSION. A hook cannot tell an instruction from a question — it never sees his
 * words — so a gate demanding INBOX.md change every turn would fire when he merely asks something,
 * and would train sessions to file noise into the record it is meant to protect. Corrupting the
 * record to enforce the record is worse than the gap. So this catches only the coarse failure that
 * actually happened: a session that EDITED THINGS and filed nothing of his, all session long.
 * It fires ONCE. It is a reminder with teeth, not a wall, and it should not be mistaken for
 * enforcement of the real rule — that half is still on you.
 *
 * FAILS OPEN ON EVERY DOUBT. No state dir, unreadable files, anything unexpected: allow. A guard
 * that blocks a session from ending because it is confused is worse than the thing it guards.
 */
const fs = require("fs");
const path = require("path");

function main() {
  let ev;
  try { ev = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(0); }

  const root = ev.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const stateDir = path.join(root, ".claude", "hooks", ".read-state");
  const sid = String(ev.session_id || "unknown").replace(/[^A-Za-z0-9_-]/g, "");
  const touchedFile = path.join(stateDir, `${sid}.touched`);
  const firedFile = path.join(stateDir, `${sid}.words-reminded`);

  if (fs.existsSync(firedFile)) process.exit(0);          // once per session, never twice

  let touched = [];
  try { touched = fs.readFileSync(touchedFile, "utf8").split("\n").filter(Boolean); } catch { process.exit(0); }

  // Did this session actually DO anything? A session that edited nothing owes nothing.
  if (touched.length === 0) process.exit(0);

  // Did any of it land in the places his words live?
  const filed = touched.some((f) =>
    f === ".planning/wyclau/INBOX.md" ||
    f === ".claude/memory/DECISIONS.md" ||
    f === ".planning/CHART.md");
  if (filed) process.exit(0);

  try { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(firedFile, "1"); } catch { process.exit(0); }

  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: `THIS SESSION CHANGED ${touched.length} FILE(S) AND FILED NOTHING WYATT SAID.

Nothing reached .planning/wyclau/INBOX.md, .claude/memory/DECISIONS.md or
.planning/CHART.md this whole session.

THE DOOR'S FIRST DUTY, before strategy and before answers: "Every instruction he gives
lands in .planning/wyclau/INBOX.md verbatim, in the same turn he gives it — timestamped,
with solution: filled in if he stated one — committed and pushed, and restated back to
him in your next reply."

ACTING ON WHAT HE SAID IS NOT RECORDING IT. The acting lives in this session's context
and dies with it. The record is the only thing the next session reads — and on
2026-09-02 he had to stop a session and point at this, after an evening in which it took
every one of his corrections, shipped real fixes, and filed not one of his words.

BEFORE YOU END THE TURN, ask yourself honestly:

  Did he give an instruction, a correction, or a ruling in this session?
    -> .planning/wyclau/INBOX.md, HIS WORDS VERBATIM in a > quote, with a solution: line
       if he stated one, and a status: line. Commit and push it.
  Did he settle a question that should never be re-asked?
    -> .claude/memory/DECISIONS.md.
  Is there work he wants done that this session should NOT do itself?
    -> .planning/CHART.md, for a watch. "Instead of doing any work in this session,
       triage it into the chart and let the watch do it." — his words, same day.

IF HE GENUINELY SAID NOTHING THAT NEEDED FILING — a watch working alone, a session he
never spoke in — then there is nothing to do. This fires ONCE and never again this
session: end the turn again and it goes through.

⚠ AND KNOW WHAT THIS GATE IS NOT. The real rule is per-INSTRUCTION and this check is
per-SESSION, because a hook never sees his words and cannot tell an instruction from a
question. It catches only the coarse failure — a session that did things and filed
nothing. Passing it is not evidence you kept the rule.`,
  }));
  process.exit(0);
}
main();
