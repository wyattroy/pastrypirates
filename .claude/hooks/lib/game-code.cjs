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
  /* GIT'S OWN FILES. Added 2026-08-27, after the Stop hook demanded a playtest checklist from a
     session whose ONLY "game" change was adding .planning/.cto-lock to .gitignore — and gear.mjs
     answered "GEAR: FULL — behaviour can change in: .gitignore", i.e. an 80-minute eight-leg sea
     trial for an ignore rule.

     THIS IS NARROW ON PURPOSE AND THE STRICT POSTURE ABOVE STILL STANDS. These two are excluded
     because they are PROVABLY unreachable: git reads them, the browser never fetches them, and
     there is no build step that could carry them into anything served. That is a different claim
     from "this feels like tooling" — package.json is deliberately NOT excluded here, because
     arguing it cannot reach a player takes more than one sentence, and the file's whole design is
     that an unanswerable case gets the strict answer.

     THE COST OF LEAVING IT: a gate that cries wolf is a gate people learn to walk past, which is
     how six instruments rotted through the cutover without one of them failing loudly. */
  /^\.gitignore$/,
  /^\.gitattributes$/,
  /* AND THE CRAWLER'S MANIFEST. Added 2026-09-12, on Wy-Blade's finding: docs/GIT-AND-DEPLOY.md §5
     instructs every merge touching a listed page to run scripts/qa/sitemap_write.mjs afterwards,
     which rewrites a date in sitemap.xml — so the DOCUMENTED WORKFLOW tripped this gate on itself,
     every single time, for a number computed from git log. A session that changed nothing but docs
     was told to produce a staging checklist.

     It clears the same one-sentence bar as the two above: the browser never fetches sitemap.xml
     during play — nothing in index.html or src/ references it (the only hit anywhere is a COMMENT at
     src/shared/index.js:30 about the deploy exclusion) — it is a manifest for crawlers, and no build
     step exists that could carry it into a served page. */
  /^sitemap\.xml$/,
];

/** A repo-relative path. `.md` is never game code, wherever it lives. */
function isGameCode(rel) {
  return !!rel && !rel.endsWith(".md") && !NOT_GAME.some((re) => re.test(rel));
}

module.exports = { NOT_GAME, isGameCode };
