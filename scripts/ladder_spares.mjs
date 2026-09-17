#!/usr/bin/env node
/* DOES A BOT THAT CAN SEE WHAT A SPARE CRATE IS WORTH WIN MORE? An experiment on branch sep16-smarter-bots — not a gate, not on dev.
     node scripts/ladder_spares.mjs <old|noop|lobotomy> [games] [seedMult]
   The shipped engine on this branch prices a bare shelf in two spare crates as well as coins (tour3) and buys a crate when, at its price,
   it shortens the bot's own voyage (wantsCrate "worth"). FLAGGED seats get the OLD brain back (no spares in the route, no "worth"); every
   other seat plays the new one. So a NEGATIVE mean edge for the flagged seats is the NEW brain winning. Each arm is compared to a control
   run of the same seeds with nobody flagged (BOT-DESIGN-PRINCIPLES principle 9); red-proof with `noop` (+0.0) and `lobotomy` (far below).
   1000 voyages an arm — 200-300 was measured inside the noise on 2026-09-16. Also reports, per arm, what a player would notice. */
import { Game, roundCfg } from "../src/engine/index.js";
const VARIANT = process.argv[2] || "old", GAMES = +(process.argv[3] || 1000), SEEDMULT = +(process.argv[4] || 7919);
const STRATS = ["pirate", "trader", "balanced", "rusher"];
class Arm extends Game {
  flagged(p) { return !!(p && this._new && this._new.has(p.idx)); }
  spareCrates(p) { return VARIANT === "old" && this.flagged(p) ? 0 : super.spareCrates(p); }
  wantsCrate(p, i, pr, c) { const w = super.wantsCrate(p, i, pr, c); if (w === "worth") { if (VARIANT === "old" && this.flagged(p)) return ""; this.M.worth++; } return w; }
  takeTurn(p, w, s) {
    if (VARIANT === "lobotomy" && this.flagged(p)) { this.ev({ t: "turn", p: p.idx }); this.doPass(p); return; }
    return super.takeTurn(p, w, s);
  }
}
function run(seats) {
  const wins = [0, 0, 0, 0], M = { worth: 0 }; let days = 0, bought = 0, barters = 0;
  for (let s = 1; s <= GAMES; s++) {
    const g = new Arm({ ...roundCfg(STRATS), bakeoff: true }, s * SEEDMULT, true);
    g._new = new Set(seats); g.M = M;
    const w = g.play(); days += g.round;
    for (const e of g.events) if (e.t === "dock" && e.got === "bought") { bought++; if (e.paidIng) barters++; }
    if (w != null) wins[w]++;          // w == null, never !w — play() returns a seat index
  }
  return { wins, days: days / GAMES, bought: bought / GAMES, barters: barters / GAMES, worth: M.worth / GAMES };
}
const control = run([]);
const ARMS = [["1 flagged (seat 0)", [0]], ["1 flagged (seat 1)", [1]], ["2 flagged", [0, 1]], ["3 flagged", [0, 1, 2]]];
const share = (r, seats) => 100 * seats.reduce((a, i) => a + r.wins[i], 0) / GAMES;
console.log(`variant ${VARIANT} · ${GAMES} voyages an arm · seeds x${SEEDMULT}`);
console.log(`control (all new brain): ${control.days.toFixed(2)} days, ${control.bought.toFixed(2)} crates bought, ${control.barters.toFixed(2)} barters, "worth" ${control.worth.toFixed(2)} a voyage`);
let sum = 0;
for (const [name, seats] of ARMS) {
  const r = run(seats), edge = share(r, seats) - share(control, seats); sum += edge;
  console.log(`  ${name.padEnd(20)} ${edge >= 0 ? "+" : ""}${edge.toFixed(1)}   (${r.days.toFixed(2)} days, ${r.barters.toFixed(2)} barters, "worth" ${r.worth.toFixed(2)})`);
}
console.log(`  MEAN EDGE FOR THE FLAGGED SEATS: ${sum / 4 >= 0 ? "+" : ""}${(sum / 4).toFixed(1)}${VARIANT === "old" ? `  ->  the new brain is ${sum < 0 ? "AHEAD" : "BEHIND"} by ${Math.abs(sum / 4).toFixed(1)}` : ""}`);
