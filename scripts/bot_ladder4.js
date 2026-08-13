#!/usr/bin/env node
// scripts/bot_ladder4.js
//
// THE GATE FOR THE /4 BOT BRAIN. Byte-for-byte scripts/bot_ladder3.js with ONE line changed — the
// import — and it exists for one reason: /4's engine is no longer /3's. The black market's second
// price (a dry shelf is an expensive shelf, not a closed one) changes what every route is worth,
// so a brain measured on /3's economy has not been measured on the one that ships.
//
// Everything the parent header says still holds and is not restated here: the dispatch is at
// planTurn() so both arms share the turn mechanics; control seats run planTurnClassic, which is
// the incumbent BYTE-IDENTICAL; the yardstick is a control run of the same seats, never 25%.
// Read scripts/bot_ladder3.js and scripts/bot_ladder.js for the full argument.
//
//   node scripts/bot_ladder4.js [games] [seedMult]
//
// USING IT AS A BEFORE/AFTER GATE FOR A CHANGE INSIDE THE V3 BRAIN. The control arm runs
// planTurnClassic, which touches none of the v3-only machinery (windReach3, turnsFieldTo3,
// legTurns3, plan.via). So the same seeds run before and after such a change give a control that
// literally cannot have moved, and the shift in the new arm's edge IS the change's value.
// Run the SAME command both sides of the edit, and show both families before believing it.

import { Game, roundCfg } from "../4/src/engine/index.js";

const GAMES = +(process.argv[2] || 400);
const SEEDMULT = +(process.argv[3] || 7919);
const STRATS = ["pirate", "trader", "balanced", "rusher"];

const V3_PLAN = Game.prototype.planTurnV3;
const CLASSIC_PLAN = Game.prototype.planTurnClassic;

function run(seatsUsingNew) {
  Game.prototype.planTurn = function (p) {
    return seatsUsingNew.has(p.idx) ? V3_PLAN.call(this, p) : CLASSIC_PLAN.call(this, p);
  };
  const wins = STRATS.map(() => 0);
  let rounds = 0, unfinished = 0;
  for (let s = 1; s <= GAMES; s++) {
    const g = new Game({ ...roundCfg(STRATS), bakeoff: true }, s * SEEDMULT, true);
    const w = g.play();          // returns a SEAT INDEX; `w == null` is the only "nobody won"
    rounds += g.round;
    if (w == null) { unfinished++; continue; }
    wins[w]++;
  }
  Game.prototype.planTurn = function (p) { return this.planTurnV3(p); };
  return { wins, rounds: rounds / GAMES, unfinished, played: wins.reduce((a, b) => a + b, 0) };
}

// control: nobody uses the new brain, so these are the seats' natural win shares
const control = run(new Set());
const share = (r, seats) => 100 * [...seats].reduce((a, i) => a + r.wins[i], 0) / (r.played || 1);

function ladder(label, newSeats) {
  const r = run(newSeats);
  return {
    label, rounds: r.rounds, unfinished: r.unfinished,
    nw: [...newSeats].reduce((a, i) => a + r.wins[i], 0),
    ow: r.played - [...newSeats].reduce((a, i) => a + r.wins[i], 0),
    got: share(r, newSeats), fair: share(control, newSeats),
  };
}

const rows = [
  ladder("1 new vs 3 old (seat 0)", new Set([0])),
  ladder("1 new vs 3 old (seat 1)", new Set([1])),
  ladder("2 new vs 2 old", new Set([0, 2])),
  ladder("3 new vs 1 old", new Set([0, 1, 2])),
];

console.log(`\n${GAMES} games per row, same seeds (family ×${SEEDMULT}), 4-seat table — /4 v3 brain vs /v2bakeoff incumbent`);
console.log(`control (all seats on the incumbent): wins ${control.wins.join("/")}  rounds ${control.rounds.toFixed(1)}  unfinished ${control.unfinished}\n`);
for (const r of rows)
  console.log(`  ${r.label.padEnd(26)} new ${String(r.nw).padStart(4)}  old ${String(r.ow).padStart(4)}` +
    `  won ${r.got.toFixed(1).padStart(5)}%  vs control ${r.fair.toFixed(1).padStart(5)}%` +
    `  edge ${(r.got - r.fair >= 0 ? "+" : "") + (r.got - r.fair).toFixed(1)}  rounds ${r.rounds.toFixed(1)}`);

// The verdict rests on the multi-seat rows, which average away the large seat effect.
const judged = rows.slice(2);
const edge = judged.reduce((a, r) => a + (r.got - r.fair), 0) / (judged.length || 1);
console.log(`\nmean edge over fair share, 2v2 and 3v1: ${edge >= 0 ? "+" : ""}${edge.toFixed(1)} points`);
console.log(edge > 1 ? "BETTER — the v3 brain out-wins the incumbent."
  : edge < -1 ? "WORSE — do not ship, whatever the behaviour statistics say."
    : "NO DIFFERENCE worth shipping — the change is cosmetic at the scoreboard.");
