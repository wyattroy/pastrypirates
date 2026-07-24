// src/engine/index.js
//
// Phase 8 engine tier (D-03/D-04). Holds no DOM, `window`, Firebase,
// wall-clock, or unseeded-random access — pure simulation logic only.
// Imports from `../shared/index.js`; must never be imported BY
// `src/shared/` (shared is a leaf, engine depends on it, never the reverse).

// notes/edits #1a: roll a storm for the round, but never allow a 3rd in a row. Always consumes
// exactly one g.r() so the seeded RNG sequence stays identical live vs. host-refresh replay.
function rollStorm(g){
  const roll=g.r()<g.cfg.storm;
  const storm=(g.stormStreak||0)>=2?false:roll;
  g.stormStreak=storm?(g.stormStreak||0)+1:0;
  return storm;
}

export { rollStorm };
