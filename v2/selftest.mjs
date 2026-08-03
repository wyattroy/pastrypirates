// Headless proof that the v2 engine plays a whole game, driven entirely by bot resolvers.
// This is the same seam the UI will use — the UI is just a different resolver.
import { GameV2 } from "./engine.js";
import { botResolver } from "./strategy.js";

const N = parseInt(process.argv[2] || "300", 10);
const tally = {}, stats = { rounds: [], coins: [], trades: 0, battles: 0, casts: 0, offers: 0, nodeal: 0, stall: 0, wins: [0,0,0,0] };
for (let i = 0; i < N; i++) {
  const g = new GameV2(9000 + i, [0,1,2,3].map(k => ({ name: "Capt" + k, kind: "bot" })));
  const resolve = botResolver(g);
  const it = g.run(); let step = it.next(), guard = 0;
  while (!step.done && guard++ < 200000) step = it.next(resolve(step.value));
  if (guard >= 200000) { stats.stall++; continue; }
  for (const e of g.events) tally[e.t] = (tally[e.t] || 0) + 1;
  stats.rounds.push(g.round);
  stats.coins.push(...g.players.map(p => p.coins));
  stats.trades += g.events.filter(e => e.t === "trade").length;
  stats.battles += g.events.filter(e => e.t === "battle").length;
  stats.casts += g.events.filter(e => e.t === "cast").length;
  stats.offers += g.events.filter(e => e.t === "offer").length;
  stats.nodeal += g.events.filter(e => e.t === "nodeal").length;
  const w = g.winner(); if (w !== null) stats.wins[w]++;
}
const mean = a => a.reduce((s,v)=>s+v,0)/(a.length||1);
console.log(`v2 engine self-test — ${N} games, all bots\n`);
console.log(`  finished              ${N - stats.stall}/${N}`);
console.log(`  rounds per game       ${mean(stats.rounds).toFixed(1)}`);
console.log(`  trades per game       ${(stats.trades/N).toFixed(1)}   (offers ${(stats.offers/N).toFixed(1)}, no-deal ${(stats.nodeal/N).toFixed(1)})`);
console.log(`  battles per game      ${(stats.battles/N).toFixed(2)}`);
console.log(`  casts called per game ${(stats.casts/N).toFixed(1)}`);
console.log(`  coins at game end     ${mean(stats.coins).toFixed(1)}`);
console.log(`  wins by seat          ${stats.wins.map(w=>(100*w/N).toFixed(1)+"%").join("  ")}`);
console.log(`\n  event types: ${Object.entries(tally).map(([k,v])=>k+"="+(v/N).toFixed(1)).join("  ")}`);
