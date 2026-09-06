#!/usr/bin/env node
/* machine-handoff.cjs — the two bookends, so a machine never silently HOLDS work.
 *
 *   --arrive   (SessionStart)  fetch, and either pull or say plainly why it did not
 *   --leave    (Stop)          speak ONLY if this machine is holding something nobody else can see
 *
 * WHY, 2026-09-06. Wyatt works on two machines: the Blade (always on, runs the Bell and the Watch)
 * and a MacBook Air he carries out of the house and opens and closes all day. On 2026-09-03 a Mac
 * session was archived in the middle of an interactive rebase. That left the checkout DETACHED and
 * unable to push, and it stayed that way for THREE DAYS holding two commits that existed nowhere
 * else on Earth — 40 hours of watch work, and the X he had drawn by hand, whose own commit message
 * said it was "one `git clean -xdf` from gone". Nothing anywhere noticed. He asked afterwards:
 * "is there a way to automatically hook mac pastrypirates sessions to do these tasks?"
 *
 * THE RULE IT MAKES MECHANICAL: the Blade is home, the Mac is a visitor, and a visitor must never
 * be the only holder of anything. Charter principle 2 — rules execute or expire.
 *
 * IT DOES NOT PUSH FOR HIM, DELIBERATELY. Pushing unreviewed work to a branch three sessions share
 * is not a thing a hook should do behind anyone's back — and it would not have helped here anyway,
 * because a detached HEAD cannot push at all. NOTICING is the whole job; the repair is a human's.
 *
 * IT IS SILENT WHEN THERE IS NOTHING TO SAY. A hook that speaks every turn is a hook people learn
 * to scroll past, and the Watch ends a turn every few minutes on the Blade.
 */
"use strict";
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const repo = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const mode = process.argv.includes("--leave") ? "leave" : "arrive";

const git = (...args) => {
  try {
    return execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 20000 }).trim();
  } catch { return null; }
};
const say = (s) => process.stderr.write(s);

// Not a git repo, or git unavailable: not this hook's problem, and not worth a word.
if (git("rev-parse", "--git-dir") === null) process.exit(0);

const machine = `${process.platform === "darwin" ? "Mac" : process.platform === "win32" ? "Blade" : process.platform}`;
const branch = git("rev-parse", "--abbrev-ref", "HEAD");
const detached = branch === "HEAD" || branch === null;
const gitDir = git("rev-parse", "--git-dir") || ".git";
const midRebase = require("node:fs").existsSync(path.resolve(repo, gitDir, "rebase-merge")) ||
                  require("node:fs").existsSync(path.resolve(repo, gitDir, "rebase-apply"));
const midMerge = require("node:fs").existsSync(path.resolve(repo, gitDir, "MERGE_HEAD"));

/* ── THE STUCK STATE. Loud in BOTH modes: it is the fault that cost three days, and it is equally
   worth saying on the way in (so you fix it before working) and on the way out (so you do not
   close the lid on it). ─────────────────────────────────────────────────────────────────────── */
if (midRebase || midMerge || detached) {
  const what = midRebase ? "A REBASE IS HALF-FINISHED" : midMerge ? "A MERGE IS HALF-FINISHED" : "HEAD IS DETACHED — you are not on a branch";
  say(`
════════════════════════════════════════════════════════════════════════════
 ⛔ THIS ${machine.toUpperCase()} CANNOT PUSH.  ${what}.

 NOTHING COMMITTED HERE CAN REACH A BRANCH until this is resolved, and from
 every other machine it looks exactly like a session that never woke.

 This is what stranded Wyatt's hand-drawn X for three days on 2026-09-03.

 A HUMAN decides this one — never an unattended watch:
     node scripts/wyclau/can_push.mjs      # names the fault and the repair
     git rebase --continue   |   git rebase --abort

 ⚠ IF THERE ARE COMMITS HERE THAT EXIST NOWHERE ELSE, PIN AND PUSH THEM FIRST:
     git branch rescue-<something> <sha>  &&  git push origin rescue-<something>
════════════════════════════════════════════════════════════════════════════
`);
  process.exit(0);
}

if (mode === "arrive") {
  git("fetch", "origin", "--quiet");
  const upstream = git("rev-parse", "--abbrev-ref", "@{upstream}");
  if (!upstream) process.exit(0);                       // a local-only branch is a choice, not a fault
  const behind = parseInt(git("rev-list", "--count", `HEAD..${upstream}`) || "0", 10);
  if (!behind) process.exit(0);                          // already current — say nothing

  const dirty = (git("status", "--porcelain") || "").split("\n").filter((l) => l && !l.startsWith("??")).length;
  if (dirty) {
    say(`\n  ⚠ This ${machine} is ${behind} commit(s) BEHIND ${upstream}, and has uncommitted changes,\n` +
        `    so nothing was pulled automatically. Deal with the changes, then:  git pull --rebase\n\n`);
  } else {
    const ok = git("pull", "--rebase", "--quiet") !== null;
    say(ok
      ? `\n  ↻ This ${machine} was ${behind} commit(s) behind. Pulled automatically — you are current.\n\n`
      : `\n  ⚠ This ${machine} is ${behind} commit(s) behind and the automatic pull FAILED.\n` +
        `    Run it yourself and read what it says:  git pull --rebase\n\n`);
  }
  process.exit(0);
}

/* ── LEAVING. The half that would have caught the three-day stranding on day one. ─────────────── */
const upstream = git("rev-parse", "--abbrev-ref", "@{upstream}");
const ahead = upstream ? parseInt(git("rev-list", "--count", `${upstream}..HEAD`) || "0", 10) : 0;
if (!ahead) process.exit(0);                             // nothing held — silence

const subjects = (git("log", "--format=  · %h %s", `${upstream}..HEAD`) || "").split("\n").slice(0, 5).join("\n");
say(`
────────────────────────────────────────────────────────────────────────────
 ⚠ THIS ${machine.toUpperCase()} IS HOLDING ${ahead} COMMIT(S) NOBODY ELSE CAN SEE.

${subjects}

 They exist on this machine only. ${machine === "Mac" ? "This laptop gets closed and carried around — " : ""}push before you walk away:

     git push

 Earned 2026-09-03: a Mac held 40 hours of work and a hand-drawn asset for
 three days, and nothing anywhere said so.
────────────────────────────────────────────────────────────────────────────
`);
process.exit(0);
