// .claude/hooks/lib/game-code.cjs
//
// ONE DEFINITION OF "IS THIS THE GAME", READ IN THREE PLACES.
//
// It was written three times before this file existed: in scripts/qa/gear.mjs (which picks the
// testing gear), in .claude/hooks/qa-gear-first.cjs (which stops the first edit and states that
// gear), and about to be a third time in the checklist hook. Three copies of one rule is exactly
// the shape CLAUDE.md rule 23 forbids — ask "what makes these agree?", and if the answer is
// "nothing, we keep them in step", that is the defect before a line is written.
//
// IT HAS ALREADY DRIFTED ONCE, EXPENSIVELY. Both copies tested `4/src/` for a day and a half after
// the cutover moved the game to the repo root, so the picker reported GEAR: NONE for every change
// to the live game and the hook never fired at all. Two copies, one wrong answer, twice.
//
// DERIVED AS AN EXCLUSION LIST, ON PURPOSE. Anything not explicitly excluded IS the game, so a new
// top-level directory nobody anticipated gets the STRICT answer rather than slipping through — the
// same posture the rest of the QA process takes ("a check that cannot see its subject must return
// the strict answer, never the lenient one").
const NOT_GAME = [
  /^\.planning\//,   // the record
  /^docs\//,         // the record
  /^\.claude\//,     // the rules and the hooks themselves
  /^notes\//,        // scratch
  /^art-review\//,   // art SOURCE — the assets it produces ARE game, and are not excluded
  /^scripts\//,      // tooling: gates, probes, deploy
  /^4\//,            // the retired tree. Kept so a stale path is excluded rather than called game
  /^staging\//,      // generated output, if it ever returns
];

/** A repo-relative path. `.md` is never game code, wherever it lives. */
function isGameCode(rel) {
  return !!rel && !rel.endsWith(".md") && !NOT_GAME.some((re) => re.test(rel));
}

module.exports = { NOT_GAME, isGameCode };
