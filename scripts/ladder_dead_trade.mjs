#!/usr/bin/env node
// DOES FIXING THE DEAD TRADE MAKE BOTS WIN MORE? An EXPERIMENT on its own branch — not wired into npm test, not on dev.
// Measured on the Mac, 2026-09-16, before Wyatt moved heavy runs to Wy-Blade: 2.9% of all bot turns are a trade planned,
// sailed for, and never spoken (371 of 12,874 over 200 voyages); red-proof +0.0 identical / -42.1 lobotomy (200 and 60
// games); dev seeds x7919 at 1000 an arm: MEAN EDGE +0.1. Held-out seeds x104729 were still running when it was stopped.
// Flagged seats get the fix; a POSITIVE edge is the fix winning.
//   node scripts/ladder_dead_trade.mjs <fix|noop|lobotomy> [games] [seedMult]
// THE FIX (principle 3): a trade is judged from the square the ship will FINISH on. If no offer is worth hailing from
// there, the trade is not a plan at all — the brain is asked again with trading off the table for this turn.
import { Game, roundCfg } from "../src/engine/index.js";
const VARIANT = process.argv[2] || "fix", GAMES = +(process.argv[3] || 200), SEEDMULT = +(process.argv[4] || 7919);
const STRATS = ["pirate", "trader", "balanced", "rusher"];
class Arm extends Game {
  isNew(p) { return !!(p && this._new && this._new.has(p.idx)); }
  botOpenOffer(p) { return this._noTrade === p ? null : super.botOpenOffer(p); }
  planTurn(p) {
    const r = super.planTurn(p);
    if (VARIANT !== "fix" || !this.isNew(p) || r.type !== "trade" || !r.cell || (r.cell[0] === p.pos[0] && r.cell[1] === p.pos[1])) return r;
    const keep = p.pos; p.pos = [...r.cell];
    const offer = super.botOpenOffer(p);
    p.pos = keep;
    if (offer) return r;
    this._noTrade = p;
    try { this.M.replanned++; return super.planTurn(p); } finally { this._noTrade = null; }
  }
  takeTurn(p, w, s) {
    if (VARIANT === "lobotomy" && this.isNew(p)) { this.ev({ t: "turn", p: p.idx }); this.doPass(p); return; }
    return super.takeTurn(p, w, s);
  }
}
function run(newSeats) {
  const wins = [0, 0, 0, 0]; let rounds = 0, trades = 0; const M = { replanned: 0 };
  for (let s = 1; s <= GAMES; s++) {
    const g = new Arm({ ...roundCfg(STRATS), bakeoff: true }, s * SEEDMULT, true);
    g._new = new Set(newSeats); g.M = M;
    const w = g.play(); rounds += g.round;
    for (const e of g.events) if (e.t === "trade") trades++;
    if (w != null) wins[w]++;          // w == null, never !w — play() returns a seat index
  }
  return { wins, rounds, trades, M };
}
const control = run([]);
const arms = [["1 fixed vs 3 (seat 0)", [0]], ["1 fixed vs 3 (seat 1)", [1]], ["2 fixed vs 2", [0, 1]], ["3 fixed vs 1", [0, 1, 2]]];
const share = (r, seats) => 100 * seats.reduce((a, i) => a + r.wins[i], 0) / GAMES;
console.log(`variant ${VARIANT} · ${GAMES} games an arm · seeds x${SEEDMULT} · control ${(control.rounds / GAMES).toFixed(2)} days, ${(control.trades / GAMES).toFixed(2)} trades`);
let sum = 0;
for (const [name, seats] of arms) {
  const r = run(seats), edge = share(r, seats) - share(control, seats); sum += edge;
  console.log(`  ${name.padEnd(24)} ${edge >= 0 ? "+" : ""}${edge.toFixed(1)}   (${(r.rounds / GAMES).toFixed(2)} days, ${(r.trades / GAMES).toFixed(2)} trades, ${(r.M.replanned / GAMES).toFixed(2)} dead trades re-planned a voyage)`);
}
console.log(`  MEAN EDGE FOR THE FIXED SEATS: ${sum / 4 >= 0 ? "+" : ""}${(sum / 4).toFixed(1)}`);
