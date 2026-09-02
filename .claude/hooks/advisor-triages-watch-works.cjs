#!/usr/bin/env node
/* advisor-triages-watch-works.cjs — TWO SESSIONS, ONE TREE, NEVER THE SAME FILE.
 *
 * WYATT, 2026-09-02, twice in two minutes:
 *   "Wait. You're not supposed to do work. The watch is."
 *   "Instead of doing any work in this session, triage it into the chart and let the watch do it.
 *    Also, code this somewhere durable so that you always know to do it. You must not touch the
 *    same code as the Watch"
 *
 * WHAT HAD JUST HAPPENED. An Advisor session — the window he opens — spent a night doing WATCH
 * work: claiming items, writing gates, running the four steps on mark_glass_published.mjs and
 * glass_needs_publish.mjs. The work was sound. It was the wrong session, and while it happened the
 * Advisor's own first duty went undone: the Door says every instruction he gives lands in
 * .planning/wyclau/INBOX.md VERBATIM in the same turn, and nothing he said that night was filed
 * until he pointed at it.
 *
 * AND THE COLLISION WAS LIVE, NOT THEORETICAL. At the moment he gave that instruction, `git status`
 * showed a Bell-launched watch mid-edit on src/ui/stage.js and scripts/qa/w54_call_clear_of_ask.mjs
 * — uncommitted, in the shared tree. Two sessions editing one file is the hazard CLAUDE.md §3 is
 * written for; the difference here is that neither can see the other's half-finished buffer.
 *
 * WHAT IT ENFORCES, and it needs no guess about which role you are — which is the point. A rule
 * that had to identify the Advisor would be a rule that can be wrong about it:
 *
 *     DO NOT EDIT A FILE THAT ALREADY HAS UNCOMMITTED CHANGES YOU DID NOT MAKE.
 *
 * Symmetric, true for a watch and an Advisor alike, and it is exactly "you must not touch the same
 * code as the Watch" stated so that it also protects the Watch from you. This session's own edits
 * are remembered in .claude/hooks/.read-state/<session>.touched, so your second edit to your own
 * file is never blocked.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It cannot tell an Advisor from a watch, so it does not try to
 * ban game-code edits outright — that would block the watch from the only work it exists to do.
 * It prints the split at the moment of the action instead, which is the half a hook can honestly
 * carry. Same shape as qa-gear-first and glass-harvest-first: arrive at the right moment, state the
 * rule, let the retry through.
 *
 * IT MUST NEVER WEDGE ANYTHING. One tool shape (Edit/Write/NotebookEdit), one condition (dirty and
 * not yours), and it fails OPEN on every doubt — no git, unreadable state, a path it cannot
 * resolve. A guard that blocks edits when it is confused is worse than the collision it prevents.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function main() {
  let ev;
  try { ev = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(0); }
  if (!["Edit", "Write", "NotebookEdit"].includes(ev.tool_name)) process.exit(0);

  const root = ev.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const raw = String((ev.tool_input || {}).file_path || "");
  if (!raw) process.exit(0);

  let rel;
  try {
    rel = path.relative(root, path.resolve(root, raw)).split(path.sep).join("/");
  } catch { process.exit(0); }
  if (!rel || rel.startsWith("..")) process.exit(0);   // outside the repo: not our business

  // Remember what THIS session has already touched, so its own follow-up edits never trip.
  const stateDir = path.join(root, ".claude", "hooks", ".read-state");
  const sid = String(ev.session_id || "unknown").replace(/[^A-Za-z0-9_-]/g, "");
  const mine = path.join(stateDir, `${sid}.touched`);
  let touched = new Set();
  try { touched = new Set(fs.readFileSync(mine, "utf8").split("\n").filter(Boolean)); } catch {}

  const remember = () => {
    try {
      fs.mkdirSync(stateDir, { recursive: true });
      if (!touched.has(rel)) fs.appendFileSync(mine, `${rel}\n`);
    } catch {}
  };

  if (touched.has(rel)) { remember(); process.exit(0); }

  // Is it dirty in the shared tree right now? Only git can say, and if git cannot, we allow.
  let dirty = false;
  try {
    const out = execFileSync("git", ["-C", root, "status", "--porcelain", "--", rel], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    });
    dirty = out.split("\n").some((l) => l.trim() && !l.startsWith("??"));
  } catch { process.exit(0); }

  if (!dirty) { remember(); process.exit(0); }

  remember();   // the retry is allowed — this is a speed bump, not a wall
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `ANOTHER SESSION HAS UNCOMMITTED CHANGES IN THIS FILE — ${rel}

You have not edited it in this session, and it is already modified in the shared tree. That
is somebody else's half-finished work: a Bell-launched watch, or a session on another
machine. Neither of you can see the other's buffer, and whoever saves last wins.

WYATT, 2026-09-02: "You must not touch the same code as the Watch."

BEFORE YOU RETRY, WORK OUT WHOSE IT IS:
    git -C "${root}" status --porcelain -- ${rel}
    git -C "${root}" diff -- ${rel}
    tail -40 .planning/CTO-LEDGER.md        # who claimed what, and when

IF IT IS A WATCH'S: leave it. Put what you wanted done on the Chart or in
.planning/wyclau/INBOX.md and let the watch that claimed it finish. An item nobody
claimed is available; a claimed one belongs to that session until it closes.

AND IF YOU ARE THE ADVISOR — the window Wyatt opened — this is probably not your job at
all. His words, the same day: "Instead of doing any work in this session, triage it into
the chart and let the watch do it." The Advisor files his instructions VERBATIM in the
turn he gives them, triages them onto the Chart, and answers from the record. The Watch
takes ONE item through the Proof and ends. That night the Advisor wrote gates and ran the
four steps while his own words went unfiled — good work, wrong session.

Retry the same edit and it goes through: this cannot tell a genuine hand-off from a
collision, and a guard that blocks when it is confused is worse than the collision.`,
    },
  }));
  process.exit(0);
}
main();
