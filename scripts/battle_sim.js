#!/usr/bin/env node
// notes/edits #5: headless battle-mechanics simulator, faithfully ported from the LIVE battle
// loop in index.html's asyncBattle() (not the older/simplified Game.battle() used by pure
// bot-vs-bot Game.play() runs, which is missing the flee mechanic entirely). Dev-only analysis
// tool — not loaded by the game itself.
//
// Mechanics ported 1:1 from asyncBattle() as of this writing:
//   - First to 2 points wins a battle.
//   - Wind gives one fighter (attacker, defender, or neither on crosswind) a persistent
//     "downwind" advantage for the whole battle: both HEADS lands a hit for the downwind
//     fighter instead of cancelling; a downwind fighter also gets one free reflip on their
//     own tails.
//   - The attacker additionally gets one broadside reflip on tails (cfg.broadside:"paid" in
//     roundCfg(), so it costs 1 coin) independent of/stackable with their wind reflip.
//   - Bots (this simulator only ever plays bot vs bot) always take a reflip when one is
//     available — asyncBattle only routes the "reflip?" prompt through a confirmation dialog
//     for human fighters (`if(hA) use=await battleAsk(...)`); a non-human's `use` stays `true`.
//   - On a double-tails round the battle is still undecided (no one scored), so the defender
//     may pay 1 coin to flee; a bot defender flees iff currently behind on points (`flee=d<a`),
//     otherwise presses on.
//
// Simplifying assumptions for this standalone simulator (game economy isn't modeled):
//   - Both fighters are given a fixed coin pool per battle (COIN_POOL below) to spend on the
//     attacker's paid broadside reflip and the defender's flee fee — roughly the early/mid-game
//     coin level (roundCfg() starts everyone at 3).
//   - The defender's flee always has somewhere to flee TO (asyncBattle checks `reachable(def,3)
//     .length`, which needs the actual board/ship positions this script doesn't simulate).
//   - Downwind is modeled directly from the same geometry asyncBattle derives it from: attacker
//     and defender are always adjacent (Manhattan distance 1) on the board, and the storm wind is
//     one of 4 directions drawn uniformly, independent of their relative position. That gives a
//     25% chance the attacker is downwind, 25% the defender is, 50% crosswind (cancels) — see
//     asyncBattle()'s dirAtoD/dirDtoA derivation.

const COIN_POOL = 3;
const N_BATTLES = process.argv[2] ? parseInt(process.argv[2], 10) : 20000;
const NEED = 2;

function coinFlip(rng) { return rng() < 0.5; } // true = heads

function pickDownwind(rng) {
  const r = rng();
  if (r < 0.25) return "a";
  if (r < 0.50) return "d";
  return null; // crosswind
}

function simBattle(rng) {
  const downwind = pickDownwind(rng);
  let freeA = downwind === "a", freeD = downwind === "d";
  let free = false, paid = true; // roundCfg(): broadside:"paid"
  let attCoins = COIN_POOL, defCoins = COIN_POOL;
  let a = 0, d = 0, round = 0, fled = false;
  const roundOutcomes = []; // "HH" | "HT" | "TH" | "TT" per round

  while (a < NEED && d < NEED) {
    round++;
    let ah = coinFlip(rng);
    // ---- attacker's reflips: wind free reflip + one broadside (free or paid) reflip ----
    while (!ah && (freeA || free || (paid && attCoins >= 1))) {
      if (freeA) { freeA = false; }
      else { if (paid) attCoins--; free = false; paid = false; }
      ah = coinFlip(rng);
    }
    let dh = coinFlip(rng);
    // ---- defender's single wind free reflip ----
    if (!dh && freeD) { freeD = false; dh = coinFlip(rng); }

    roundOutcomes.push((ah ? "H" : "T") + (dh ? "H" : "T"));

    if (ah && dh) {
      if (downwind === "a") a++;
      else if (downwind === "d") d++;
      // else crosswind: cancels, no score
    } else if (ah) { a++; }
    else if (dh) { d++; }
    // else both tails: no score this round

    const bothTails = !ah && !dh;
    if (bothTails && a < NEED && d < NEED && defCoins >= 1) {
      const flee = d < a; // bot rule: flee iff currently losing
      if (flee) { defCoins--; fled = true; break; }
    }
  }

  return { downwind, a, d, round, fled, roundOutcomes, winner: fled ? null : (a >= NEED ? "a" : "d") };
}

// xorshift32 for a fast, seedable RNG independent of Math.random
function xorshift32(seed) {
  let x = seed | 0 || 0x9e3779b9;
  return function () {
    x ^= x << 13; x |= 0;
    x ^= x >>> 17;
    x ^= x << 5; x |= 0;
    return ((x >>> 0) / 4294967296);
  };
}

function run(n, seed) {
  const rng = xorshift32(seed);
  const stats = {
    total: n,
    fled: 0,
    byDownwind: {
      a: { battles: 0, aWins: 0, dWins: 0, fled: 0, rounds: 0 },
      d: { battles: 0, aWins: 0, dWins: 0, fled: 0, rounds: 0 },
      none: { battles: 0, aWins: 0, dWins: 0, fled: 0, rounds: 0 },
    },
    roundOutcomeCounts: { HH: 0, HT: 0, TH: 0, TT: 0 },
    totalRounds: 0,
  };
  for (let i = 0; i < n; i++) {
    const r = simBattle(rng);
    const key = r.downwind || "none";
    const bucket = stats.byDownwind[key];
    bucket.battles++;
    bucket.rounds += r.round;
    if (r.fled) { bucket.fled++; stats.fled++; }
    else if (r.winner === "a") bucket.aWins++;
    else bucket.dWins++;
    stats.totalRounds += r.round;
    for (const o of r.roundOutcomes) stats.roundOutcomeCounts[o]++;
  }
  return stats;
}

function pct(n, d) { return d === 0 ? "n/a" : (100 * n / d).toFixed(1) + "%"; }

const stats = run(N_BATTLES, 42);

console.log(`Battle simulation — ${N_BATTLES} battles (seed 42, COIN_POOL=${COIN_POOL})\n`);

console.log("Win rate by wind position (excludes fled battles from the win-rate denominator):");
for (const [key, label] of [["a", "Attacker downwind"], ["d", "Defender downwind"], ["none", "Crosswind (no advantage)"]]) {
  const b = stats.byDownwind[key];
  const decided = b.battles - b.fled;
  console.log(`  ${label.padEnd(28)} battles=${b.battles.toString().padEnd(6)} attacker-wins=${pct(b.aWins, decided).padEnd(7)} defender-wins=${pct(b.dWins, decided).padEnd(7)} flee-rate=${pct(b.fled, b.battles)}`);
}

console.log(`\nOverall flee rate: ${pct(stats.fled, stats.total)}`);
console.log(`Average battle length: ${(stats.totalRounds / stats.total).toFixed(2)} rounds`);

console.log("\nPer-round flip-outcome distribution (attacker/defender heads-tails):");
const totalRoundFlips = Object.values(stats.roundOutcomeCounts).reduce((s, v) => s + v, 0);
for (const k of ["HH", "HT", "TH", "TT"]) {
  console.log(`  ${k}: ${pct(stats.roundOutcomeCounts[k], totalRoundFlips)}`);
}
console.log(`\n"Something happens every flip" check: TT rounds (${pct(stats.roundOutcomeCounts.TT, totalRoundFlips)}) either continue the`);
console.log(`battle (both fighters keep fighting) or trigger a flee decision — they never resolve with zero`);
console.log(`consequence, since a flee always costs the defender a coin and ends the battle outright.`);
