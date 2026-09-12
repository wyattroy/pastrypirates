#!/usr/bin/env node
// .claude/hooks/session-base.cjs   —   fires on SessionStart
//
// REMEMBER WHERE THIS SESSION STARTED, SO A LATER HOOK CAN ASK "WHAT DID *I* CHANGE?"
//
// ============================================================================
//  Why this exists
// ============================================================================
// Wyatt, 2026-08-30: "why did you make a checklist, given you didn't touch the game? you didn't
// work on the game at all, did you? i don't want you to make a checklist based on the other
// session's work -- that's duplicative and confusing."
//
// He was right. playtest-checklist-last.cjs compared `origin/main...HEAD` — THE WHOLE BRANCH —
// and demanded a playtest sheet from a session that had changed zero lines of game code. The 17
// game files it saw had arrived by MERGING another session's branch so the trial could be built
// on the current game.
//
// AND THE HOOK ALREADY KNEW. Its own header carried a correction dated 2026-08-27 saying it
// "cannot know" what the session changed, because a session that changed only docs had been told
// it changed the game. THAT FIX CHANGED THE WORDING AND LEFT THE TRIGGER. The message became
// honest about being wrong instead of the trigger becoming right — so the same false demand
// landed again three days later, and a sheet describing someone else's work reached Wyatt.
//
// A hook cannot answer "what did this session do?" without a mark laid down when the session
// began. That is this file's whole job: four lines, once, at the start.
//
// ============================================================================
//  What it writes
// ============================================================================
// .claude/hooks/.read-state/<session-id>/session-base   →   the HEAD sha at session start
//
// Same .read-state directory and the same per-session discipline every other hook here uses, so
// there is one place to look and one thing to clear. Absent file = unknown start, and every
// reader must cope with that rather than assume (see the ownership fallback in
// playtest-checklist-last.cjs — it is what makes this hook's failure non-fatal).
//
// It never blocks and never fails a session: a missing base only makes the downstream hook fall
// back to a weaker test, and a hook that could stop a session from starting is not worth the risk.
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

try {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, "utf8")); } catch {}
  const repo = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  const session = String(input.session_id || "nosession").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "nosession";

  const head = execSync("git rev-parse HEAD", { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  if (!/^[0-9a-f]{7,40}$/.test(head)) process.exit(0);

  const dir = path.join(repo, ".claude", "hooks", ".read-state", session);
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, "session-base");
  // Never overwrite: a session can be resumed, and the FIRST head is the honest baseline for
  // "what did this session change". Re-stamping on resume would quietly forgive earlier work.
  if (!fs.existsSync(f)) fs.writeFileSync(f, head + "\n");
} catch {}
process.exit(0);
