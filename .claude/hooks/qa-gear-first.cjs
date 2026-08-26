#!/usr/bin/env node
/* qa-gear-first.cjs — the structural half of docs/QA-PROCESS.md.
 *
 * WHY THIS EXISTS (2026-08-26). Wyatt spent two hours playtesting and filed 35 findings. The
 * session that answered them shipped 22 fixes and verified 4 — all in solo mode, at one screen
 * size — and chose how hard to test each one by feel. It wrote ten separate check scripts, each
 * named after a single bug, and wired NONE of them into npm test.
 *
 * His answer, and he had already learned it once for the mentor charter: "a prompt you are holding
 * is a prompt you can skip." A document describing a QA process is a document a tired session
 * skips. So the process gets a gate at the moment of the action, the same way rule 17 did.
 *
 * WHAT IT DOES. On an edit to game source it works out the GEAR — Quick, Normal or Full — from the
 * files being touched, and denies the FIRST such edit in a session with the four steps and the
 * exact sweep command. A marker lets the retry through. A speed bump, not a wall.
 *
 * THE GEAR IS DECIDED BY PATH AND CONTENT, NEVER BY JUDGEMENT. That is the entire point: a rule
 * about how risky a change FEELS cannot be enforced by a machine, and feel is exactly what failed.
 *
 * DELIBERATELY NOT A PROOF that a failing check was written first — nothing here can know that. It
 * guarantees the requirement arrives at the moment of the edit, which is what was missing.
 *
 * IT NEVER BLOCKS THE CHECKS THEMSELVES. Writing the failing check IS step 1; a gate that stopped
 * you writing it would be the process eating its own tail.
 */
const fs = require("fs");
const path = require("path");

/* WYATT'S DESIGN PRINCIPLE, 2026-08-26 — this hook must not contradict it:
   "Each mode should be structurally different just about who the player is playing against, but the
    game itself should remain consistent for every player in every mode."

   An earlier version of this hook had a gear meaning "behaviour changed inside one mode". He caught
   it: that sentence PRESUMES the fork it should prevent, then only tests the one mode, so a
   divergence introduced anywhere else sails through — and the process teaches itself that forking
   modes is routine. Three gears now, and the middle one is a different SUBJECT, not a smaller size.

     COSMETIC  words, colours, comments
     PLUMBING  how a mode SERVES the game up — pass-and-play's hand-the-device gate, crew's room
               codes and joining. Genuinely per-mode, because it is the seating, not the game.
     FULL      anything that can change what a captain SEES or CAN DO. Every mode. Default.

   PLUMBING MUST BE EARNED. Everything else is FULL. */
const PLUMBING = [
  { re: /^4\/src\/ui\/lobby\.js$/, mode: "crew",     what: "the room screens — creating, joining, naming, leaving" },
  { re: /\bpassGate\b/,             mode: "passplay", what: "pass-and-play's hand-the-device gate" },
  { re: /\bnetCreateRoom\b|\bnetJoinRoom\b|\bnetLeaveRoom\b|\bgenCode\b|\bhostGoneGrace\b/,
                                     mode: "crew",     what: "crew's room lifecycle and the host-gone grace" },
];
/* NEVER plumbing, whatever else it matches: this is the game reaching a player. `pos` went missing
   from the guest's sail prompt exactly here — it looked like wire plumbing and it changed what a
   guest could DO. */
const NOT_PLUMBING = /\bspec\b|\bpayload\b|renderPickPrompt|playBakeoffLive|showNarration|localAsk|applyBenchSnap|applyBattleSnap|\bpanel\(/;

const GEARS = {
  FULL: {
    step1: "REQUIRED — write the check that FAILS before you touch the code.",
    sweep: () => "npm test\n     node 4/scripts/qa/matrix.mjs          (all 3 modes, 3 screen sizes, a real two-browser crew game)",
  },
  PLUMBING: {
    step1: "REQUIRED — write the check that FAILS before you touch the code.",
    sweep: m => `npm test\n     node 4/scripts/qa/matrix.mjs --mode=${m}\n     ...AND the other modes once, to prove the serving change did not leak into the game.`,
  },
};

function readStdin() {
  try { return fs.readFileSync(0, "utf8"); } catch { return ""; }
}

function main() {
  const raw = readStdin();
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }   // unparseable: never block

  const tool = input.tool_name || "";
  if (!/^(Edit|Write|NotebookEdit)$/.test(tool)) process.exit(0);

  const ti = input.tool_input || {};
  const session = String(input.session_id || "nosession").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "nosession";
  const repo = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  const filePath = String(ti.file_path || "");
  const rel = filePath.startsWith(repo) ? filePath.slice(repo.length + 1) : filePath;
  const content = String(ti.content || ti.new_string || "");

  // only the game the milestone ships
  const isGame = /^4\/(src\/|index\.html$)/.test(rel);
  if (!isGame) process.exit(0);
  // writing a check is STEP ONE. Never stand in front of it.
  if (/^4\/scripts\//.test(rel)) process.exit(0);

  let gear = "FULL", mode = null;
  let why = `${rel} can change what a captain sees or can do`;
  if (!NOT_PLUMBING.test(content)) {
    const hit = PLUMBING.find(p => p.re.test(rel) || p.re.test(content));
    if (hit) { gear = "PLUMBING"; mode = hit.mode; why = `${hit.what} — how one mode serves the game up, not the game itself`; }
  } else {
    why = `this edit to ${rel} touches a prompt's payload or a renderer — that is THE GAME reaching a player, whatever file it lives in`;
  }

  const stateDir = path.join(repo, ".claude", "hooks", ".read-state", session);
  const marker = path.join(stateDir, `qa-${gear}`);
  if (fs.existsSync(marker)) process.exit(0);                    // one denial per gear per session
  try { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(marker, new Date().toISOString()); } catch {}

  const g = GEARS[gear];
  const reason =
`QA PROCESS — this change is GEAR: ${gear}
(${why})

THE FOUR STEPS. They never change and are never skipped:

  1. SHOW IT BROKEN   ${g.step1}
                      If you cannot make a check fail, you have not found the bug —
                      you have found a theory.
  2. CHANGE THE CODE
  3. SHOW IT FIXED    That SAME check now passes. Not a different one.
  4. SWEEP            ${g.sweep(mode)}

Which gear you are in is decided by the files you touch, not by how the change feels:
     node 4/scripts/qa/gear.mjs

Full contract: docs/QA-PROCESS.md

Why you are seeing this: on 2026-08-26 Wyatt filed 35 findings from a two-hour playtest. The
session answering them shipped 22 fixes, verified 4 — all solo, one screen size — chose its
own testing depth by mood, and wired none of its ten check scripts into npm test. He asked
for this to be a hook rather than a rule for the reason he already learned once: a prompt you
are holding is a prompt you can skip.

Run it again and it will go through. This fires once per gear per session.`;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}
main();
