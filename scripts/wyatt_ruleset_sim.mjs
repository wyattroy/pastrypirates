#!/usr/bin/env node
// Model of Wyatt's proposed ruleset (2026-08-03), for design analysis only.
// NOT loaded by the game. Nothing here changes the live engine.
//
// It reuses the REAL board from src/engine/index.js — island placement, the single-berth dock
// positions, the circular valid-cell set, and the four clockwise rim arcs — by constructing a
// normal `Game` and then running its own turn loop instead of `Game.play()`. So the map every
// captain sails is the map the shipped game generates; only the rules on top of it are new.
//
// Rules modelled (Wyatt's numbering), with the four scoping answers applied:
//   1  Sail 4 squares any direction; ANY upwind step caps the whole move at 2. No leeward rule.
//   2  Sailing is free.
//   3  Fishing: no flip. Fisher +2, every other unfinished captain +1.
//   4  Trade is a free phase at the start of every turn, not an Act.
//   5  Calling a battle: free, +2 from the bank if correct.
//   6  The wind announces next round's direction and whether it will storm.
//   7  Storms push every ship 3 squares in one direction, simultaneously, at the round's start.
//   8  Blown into land -> you lose your turn. Berthed ships are safe.
//   9  Battle: both commit 0-3 coins in secret, spent either way. Downwind +1. Tie -> one flip
//      each (heads +1); still tied -> fewer ingredients wins. Loser gives 5 coins or a crate,
//      winner's choice.
//  10  Docking: flip for treasure. Heads +4, tails 0.
//  11  You always buy. Price is per ISLAND: its 1st crate costs 3, 2nd 4, 3rd 5.
//  12  Ties among same-final-round finishers go to most resources; first home still wins outright.
//  13  Boat powers: NOT modelled (baseline run, by choice).
//  14  You can be attacked while docked at Tortuga.
//
// Assumptions I had to make, all flagged in the write-up:
//   - "upwind" is the single direction directly opposite the wind; crosswind is unpenalised.
//   - a storm's direction is that round's announced wind.
//   - "docks can save you" = sitting in a berth makes you immune to the push (--dockshelter=path
//     models the other reading: you are dropped into an empty berth on the way instead).
//   - trade is one completed deal per turn, initiated by the active captain, no bonus coin.
//   - the rim current survives untouched.

import { loadEngine } from "./lib/load_engine.js";
const { Game, roundCfg } = await loadEngine();

const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const OPP = { N: "S", S: "N", E: "W", W: "E" };
const DKEYS = ["N", "S", "E", "W"];
const K = c => c[0] + "," + c[1];
const man = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const argv = process.argv.slice(2);
const N_GAMES = parseInt(argv.find(a => /^\d+$/.test(a)) || "1500", 10);
const DOCK_SHELTER = argv.includes("--dockshelter=path") ? "path" : "berth";
const NO_RIM = argv.includes("--norim");
const STORM_P = parseFloat((argv.find(a => a.startsWith("--storm=")) || "--storm=0.125").split("=")[1]);
const PRICE = (argv.find(a => a.startsWith("--price=")) || "--price=3,4,5").split("=")[1].split(",").map(Number);
const FISH_OTHERS = parseFloat((argv.find(a => a.startsWith("--fishothers=")) || "--fishothers=1").split("=")[1]);
const BID_MAX = parseInt((argv.find(a => a.startsWith("--bidmax=")) || "--bidmax=3").split("=")[1], 10);
const POWERS_ON = argv.includes("--powers") || argv.some(a => a.startsWith("--draft="));
const DRAFT_ORDER = (argv.find(a => a.startsWith("--draft=")) || "").split("=")[1];
const MAX_ROUNDS = 200;

// Rule 13 — the eight boat powers, per Wyatt's list and his four scoping answers:
// unique draft (no duplicates), racer/hedger raise the BUDGET, lockbox applies to ANY loss.
const EXCLUDE = ((argv.find(a => a.startsWith("--exclude=")) || "--exclude=").split("=")[1] || "").split(",").filter(Boolean);
const POWER_LIST = ["racer","hedger","shooter","trawler","lockbox","trader","sturdybow","gambler"].filter(x => !EXCLUDE.includes(x));
const rngFor = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

/* ---------------------------------------------------------------- board helpers */

// occupancy: a ship may sail PAST another but not end on it
const shipAt = (g, c, self) => g.players.some(q => q !== self && !q.done && q.pos[0] === c[0] && q.pos[1] === c[1]);
const land = (g, c) => g.blocked(c) || g.isIsland(c) || g.isHome(c);

// Rule 1. Two reachable sets, unioned:
//   (a) up to 4 steps using only downwind + crosswind
//   (b) up to 2 steps using any direction (this is the only way to make upwind progress)
// Entering a rim cell ENDS the move there (the current then sweeps you) — same as the live game.
function reachable(g, p, wind) {
  const pw = p.power;
  const up = OPP[wind];                    // the one forbidden-if-you-want-4 direction
  const out = new Map();                   // "x,y" -> [x,y]
  const walk = (maxSteps, allowUpwind) => {
    const seen = new Set([K(p.pos)]);
    let frontier = [p.pos];
    for (let step = 0; step < maxSteps; step++) {
      const next = [];
      for (const c of frontier) {
        if (!NO_RIM && g.onRim(c) && K(c) !== K(p.pos)) continue;  // the rim ends movement
        for (const dk of DKEYS) {
          if (!allowUpwind && dk === up) continue;
          const d = DIRS[dk], n = [c[0] + d[0], c[1] + d[1]], k = K(n);
          if (seen.has(k) || land(g, n)) continue;
          seen.add(k); next.push(n);
          if (!shipAt(g, n, p)) out.set(k, n);
        }
      }
      frontier = next;
    }
  };
  walk(pw === "racer" ? 5 : 4, false);
  walk(pw === "hedger" ? 3 : 2, true);
  return [...out.values()];
}

// water-only BFS distance from a cell to everywhere — used for targeting, ignores wind
function waterDist(g, from) {
  const dist = { [K(from)]: 0 }; const q = [from];
  while (q.length) {
    const c = q.shift(), d = dist[K(c)];
    for (const dk of DKEYS) {
      const dd = DIRS[dk], n = [c[0] + dd[0], c[1] + dd[1]], k = K(n);
      if (k in dist || land(g, n)) continue;
      dist[k] = d + 1; q.push(n);
    }
  }
  return dist;
}

/* ---------------------------------------------------------------- the sim */

function playGame(seed, stats) {
  const cfg = roundCfg(["balanced", "balanced", "balanced", "balanced"]);
  const g = new Game(cfg, seed, false);
  const P = g.players;
  P.forEach((p, i) => { p.coins = cfg.startCoins + i; p.bought = 0; p.lostTurn = false; p.power = null; });
  if (POWERS_ON) {
    const prng = rngFor(seed * 2654435761);
    if (DRAFT_ORDER) {
      // greedy draft in seat order down a fixed preference list — models "first come, first served"
      const pref = DRAFT_ORDER.split(","), taken = new Set();
      for (const p of P) { const pick = pref.find(x => !taken.has(x)); if (pick) { taken.add(pick); p.power = pick; } }
    } else {
      // random 4 distinct powers, randomly seated — isolates power strength from seat advantage
      const pool = POWER_LIST.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(prng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      P.forEach((p, i) => p.power = pool[i]);
    }
  }
  const sold = {}; g.ings.forEach(i => sold[i] = 0);   // rule 11: per-ISLAND price ladder
  const price = ing => PRICE[Math.min(sold[ing], PRICE.length - 1)];

  // rule 6: this round's wind and storm are known one round ahead
  let wind = DKEYS[Math.floor(g.r() * 4)], storm = g.r() < STORM_P;
  let nextWind = DKEYS[Math.floor(g.r() * 4)], nextStorm = g.r() < STORM_P;

  const acts = { fish: 0, dock: 0, battle: 0, pass: 0 };
  let trades = 0, battles = 0, attWins = 0, defWins = 0, tieFlips = 0, tieIng = 0;
  let stormTurnsLost = 0, rimUses = 0, coinsMinted = 0, coinsBurned = 0, callPayouts = 0;
  let brokeAtDock = 0, bidTotal = 0, flips = 0, upwindBound = 0, sailChances = 0;
  let spoilNeeded = 0, spoilCoins = 0, lockboxSaves = 0;
  const recordSpoil = () => {};
  const coinTrace = [];

  const needs = p => g.needs(p);
  const finished = p => !needs(p).length && man(p.pos, g.home) <= 1;

  // ---- rule 4: one free trade at the start of the active captain's turn
  function tryTrade(p) {
    const myNeed = needs(p);
    if (!myNeed.length) return false;
    for (const q of P) {
      if (q === p || q.done) continue;
      const theyHold = q.ing.filter(i => myNeed.includes(i) && !q.recipe.includes(i)); // their surplus
      if (!theyHold.length) continue;
      const want = theyHold[0];
      // swap if I hold something they need and don't want myself
      const mySurplus = p.ing.filter(i => needs(q).includes(i) && !p.recipe.includes(i));
      if (mySurplus.length) {
        const give = mySurplus[0];
        p.ing.splice(p.ing.indexOf(give), 1); q.ing.push(give);
        q.ing.splice(q.ing.indexOf(want), 1); p.ing.push(want);
        trades++; tradeBonus(p, q); return true;
      }
      // otherwise buy it for coin — the seller wants more than the island would charge
      const ask = 6;
      if (p.coins >= ask) {
        p.coins -= ask; q.coins += ask;
        q.ing.splice(q.ing.indexOf(want), 1); p.ing.push(want);
        trades++; tradeBonus(p, q); return true;
      }
    }
    return false;
  }
  function tradeBonus(a, b) {
    for (const x of [a, b]) if (x.power === "trader") { x.coins += 2; coinsMinted += 2; }
  }

  // ---- rule 9: simultaneous committed-coin battle
  function battle(att, def) {
    battles++;
    const bid = (x, keen) => {
      const cap = Math.min(BID_MAX, x.coins);
      if (cap <= 0) return 0;
      return keen ? cap : Math.min(cap, 1 + Math.floor(g.r() * cap));
    };
    // the attacker chose this fight, so they commit harder
    let a = bid(att, true), d = bid(def, needs(def).length <= 2);
    bidTotal += a + d;
    att.coins -= a; def.coins -= d; coinsBurned += a + d;   // spent either way

    // rule 9: downwind +1. geometry read once, exactly as the live engine does it.
    const dx = def.pos[0] - att.pos[0], dy = def.pos[1] - att.pos[1];
    const aToD = DKEYS.find(k => DIRS[k][0] === dx && DIRS[k][1] === dy);
    const dToA = DKEYS.find(k => DIRS[k][0] === -dx && DIRS[k][1] === -dy);
    let A = a, D = d;
    if (wind === aToD) A += 1; else if (wind === dToA) D += 1;
    if (att.power === "shooter") A += 1;
    if (def.power === "shooter") D += 1;

    let win = null;
    if (A > D) win = att; else if (D > A) win = def;
    else {
      tieFlips++;
      const ah = g.r() < .5, dh = g.r() < .5; flips += 2;
      if (ah && !dh) win = att; else if (dh && !ah) win = def;
      else {                                   // rule 9: fewer ingredients wins
        tieIng++;
        if (att.ing.length < def.ing.length) win = att;
        else if (def.ing.length < att.ing.length) win = def;
        else win = def;                        // dead heat: the defender holds
      }
    }
    const lose = win === att ? def : att;
    if (win === att) attWins++; else defWins++;

    // rule 5: spectators call it free, +2 if right
    for (const s of P) {
      if (s === att || s === def || s.done) continue;
      const fav = att.coins >= def.coins ? att : def;         // they can see purses, not bids
      const call = g.r() < .6 ? fav : (fav === att ? def : att);
      if (call === win) { const pay = s.power === "gambler" ? 3 : 2; s.coins += pay; coinsMinted += pay; callPayouts += pay; }
    }

    // rule 9 spoils: 5 coins or a crate, WINNER's choice — take a crate you need if there is one
    if (lose.power === "lockbox" && lose.ing.length) {
      // the loser offers their least useful crate; the winner may still prefer 5 coins
      const useless = lose.ing.find(i => !needs(win).includes(i));
      const offer = useless !== undefined ? useless : lose.ing[0];
      if (useless !== undefined && lose.coins >= 5) { spoilCoins++; lose.coins -= 5; win.coins += 5; }
      else { if (needs(win).includes(offer)) spoilNeeded++; lose.ing.splice(lose.ing.indexOf(offer), 1); win.ing.push(offer); }
      lockboxSaves += useless !== undefined ? 1 : 0;
      recordSpoil(); return;
    }
    const wanted = lose.ing.filter(i => needs(win).includes(i));
    if (wanted.length) { spoilNeeded++; const i = wanted[0]; lose.ing.splice(lose.ing.indexOf(i), 1); win.ing.push(i); }
    else if (lose.coins >= 5) { spoilCoins++; lose.coins -= 5; win.coins += 5; }
    else if (lose.ing.length) { const i = lose.ing[0]; lose.ing.splice(lose.ing.indexOf(i), 1); win.ing.push(i); }
    else { win.coins += lose.coins; lose.coins = 0; }
    recordSpoil();
  }

  // ---- rule 7/8: one simultaneous storm at the start of the round
  function stormPush() {
    const d = DIRS[wind];
    for (const p of P) {
      if (p.done) continue;
      const berthed = g.adjPort(p) !== null || man(p.pos, g.home) <= 1;
      if (berthed && DOCK_SHELTER === "berth") continue;      // rule 8: docks save you
      const legs = p.power === "sturdybow" ? 1 : 3;
      for (let s = 0; s < legs; s++) {
        const n = [p.pos[0] + d[0], p.pos[1] + d[1]];
        if (land(g, n)) {
          if (DOCK_SHELTER === "path" && g.adjPort(p) !== null) break;   // alt reading
          p.lostTurn = true; stormTurnsLost++; break;                     // rule 8
        }
        if (shipAt(g, n, p)) break;
        p.pos = n;
        if (!NO_RIM && g.onRim(p.pos)) { const h = g.rimHead[K(p.pos)]; if (h) { p.pos = [...h]; rimUses++; } break; }
      }
    }
  }

  // ---- a turn
  function takeTurn(p) {
    if (p.done) return;
    if (p.lostTurn) { p.lostTurn = false; return; }

    // --- rule 4: free trade phase
    tryTrade(p);

    // --- rule 1/2: sail, free
    const need = needs(p);
    let target = g.home;
    if (need.length) {
      const stocked = need.filter(i => g.tokens[i] > 0);
      const dists = waterDist(g, p.pos);
      const cands = (stocked.length ? stocked : need).map(i => g.dockOf[i]).filter(Boolean);
      if (cands.length) target = cands.reduce((b, c) => (dists[K(c)] ?? 1e9) < (dists[K(b)] ?? 1e9) ? c : b, cands[0]);
    }
    const cells = reachable(g, p, wind);
    sailChances++;
    // does the upwind cap actually bind this turn? i.e. is the best cell only reachable at 2?
    if (cells.length) {
      const td = waterDist(g, target);
      let best = p.pos, bd = td[K(p.pos)] ?? 1e9;
      for (const c of cells) { const d = td[K(c)] ?? 1e9; if (d < bd) { bd = d; best = c; } }
      // measure: how much closer could we have got with no upwind penalty at all (flat 4)?
      const free = (() => {
        const seen = new Set([K(p.pos)]); let fr = [p.pos], bestFree = td[K(p.pos)] ?? 1e9;
        for (let s = 0; s < 4; s++) { const nx = [];
          for (const c of fr) { if (!NO_RIM && g.onRim(c) && K(c) !== K(p.pos)) continue;
            for (const dk of DKEYS) { const dd = DIRS[dk], n = [c[0] + dd[0], c[1] + dd[1]], k = K(n);
              if (seen.has(k) || land(g, n)) continue; seen.add(k); nx.push(n);
              if (!shipAt(g, n, p)) bestFree = Math.min(bestFree, td[k] ?? 1e9); } }
          fr = nx; }
        return bestFree;
      })();
      if (free < bd) upwindBound++;
      if (K(best) !== K(p.pos)) {
        p.pos = best;
        if (!NO_RIM && g.onRim(p.pos)) { const h = g.rimHead[K(p.pos)]; if (h && K(h) !== K(p.pos)) { p.pos = [...h]; rimUses++; } }
      }
    }

    // --- Act
    if (finished(p)) { p.done = true; g.finishOrder.push(p.idx); return; }

    const port = g.adjPort(p);
    const occupied = port && g.dockOccupiedBy(port, p);
    // rule 10 + 11: dock = treasure flip, then always buy
    if (port && !occupied && g.tokens[port] > 0 && needs(p).includes(port)) {
      acts.dock++;
      const h = g.r() < .5; flips++;
      if (h) { p.coins += 4; coinsMinted += 4; }
      const cost = price(port);
      if (p.coins >= cost) { p.coins -= cost; coinsBurned += cost; g.tokens[port]--; sold[port]++; p.ing.push(port); }
      else brokeAtDock++;
      return;
    }
    // rule 9/14: attack an adjacent ship (Tortuga is no longer a sanctuary)
    const adj = P.filter(q => q !== p && !q.done && man(q.pos, p.pos) === 1);
    const juicy = adj.find(q => q.ing.some(i => needs(p).includes(i)) || q.coins >= 8);
    if (juicy && p.coins >= 1) { acts.battle++; battle(p, juicy); return; }
    // rule 3: fish — no flip, fisher +2, everyone else +1
    acts.fish++;
    const catchSize = p.power === "trawler" ? 3 : 2;
    p.coins += catchSize; coinsMinted += catchSize;
    for (const q of P) if (q !== p && !q.done) { q.coins += FISH_OTHERS; coinsMinted += FISH_OTHERS; }
  }

  // ---- the round loop
  let over = false;
  while (g.round < MAX_ROUNDS && !over) {
    g.round++;
    if (storm) stormPush();
    for (const p of P) {
      if (over) break;
      takeTurn(p);
      if (p.done) {
        // rule: everyone else gets one last turn
        for (const q of P) if (q !== p && !q.done) { takeTurn(q); if (finished(q)) { q.done = true; g.finishOrder.push(q.idx); } }
        over = true;
      }
    }
    coinTrace.push(P.reduce((s, p) => s + p.coins, 0) / P.length);
    wind = nextWind; storm = nextStorm;
    nextWind = DKEYS[Math.floor(g.r() * 4)]; nextStorm = g.r() < STORM_P;
  }

  // ---- record
  const finishers = P.filter(p => p.done);
  let winner = null;
  if (finishers.length === 1) winner = finishers[0];
  else if (finishers.length > 1) winner = finishers[0];   // rule 12: first home wins outright
  stats.games++;
  stats.rounds.push(g.round);
  stats.stalled += finishers.length ? 0 : 1;
  stats.acts.fish += acts.fish; stats.acts.dock += acts.dock; stats.acts.battle += acts.battle;
  stats.trades += trades; stats.battles += battles; stats.attWins += attWins; stats.defWins += defWins;
  stats.tieFlips += tieFlips; stats.tieIng += tieIng;
  stats.stormTurnsLost += stormTurnsLost; stats.rimUses += rimUses;
  stats.coinsMinted += coinsMinted; stats.coinsBurned += coinsBurned; stats.callPayouts += callPayouts;
  stats.brokeAtDock += brokeAtDock; stats.bidTotal += bidTotal; stats.flips += flips;
  stats.upwindBound += upwindBound; stats.sailChances += sailChances;
  stats.spoilNeeded += spoilNeeded; stats.spoilCoins += spoilCoins;
  stats.cratesLeft.push(Object.values(g.tokens).reduce((a, b) => a + b, 0));
  stats.endCoins.push(...P.map(p => p.coins));
  if (winner) stats.winBySeat[winner.idx]++;
  if (POWERS_ON) for (const p of P) if (p.power) {
    (stats.powerGames[p.power] ||= 0); stats.powerGames[p.power]++;
    (stats.powerWins[p.power] ||= 0); if (winner === p) stats.powerWins[p.power]++;
    (stats.powerSeat[p.power] ||= [0,0,0,0]); stats.powerSeat[p.power][p.idx]++;
  }
  stats.lockboxSaves += lockboxSaves;
  if (P.some(p => !p.done && needs(p).some(i => g.tokens[i] === 0))) stats.lockout++;
  stats.multiFinish += finishers.length > 1 ? 1 : 0;
  for (let i = 0; i < coinTrace.length && i < 30; i++) { (stats.coinByRound[i] ||= []).push(coinTrace[i]); }
  return g;
}

/* ---------------------------------------------------------------- run */

const S = {
  games: 0, rounds: [], stalled: 0, acts: { fish: 0, dock: 0, battle: 0 }, trades: 0,
  battles: 0, attWins: 0, defWins: 0, tieFlips: 0, tieIng: 0, stormTurnsLost: 0, rimUses: 0,
  coinsMinted: 0, coinsBurned: 0, callPayouts: 0, brokeAtDock: 0, bidTotal: 0, flips: 0,
  upwindBound: 0, sailChances: 0, spoilNeeded: 0, spoilCoins: 0, cratesLeft: [], endCoins: [], winBySeat: [0, 0, 0, 0],
  lockout: 0, multiFinish: 0, coinByRound: [], powerGames: {}, powerWins: {}, powerSeat: {}, lockboxSaves: 0,
};
for (let i = 0; i < N_GAMES; i++) playGame(700000 + i, S);

const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const pct = (n, d) => (100 * n / d).toFixed(1) + "%";
const totalActs = S.acts.fish + S.acts.dock + S.acts.battle;

console.log(`WYATT RULESET MODEL — ${S.games} games, 4 captains, seeds 700000+`);
console.log(`  dock shelter: ${DOCK_SHELTER}   rim: ${NO_RIM ? "REMOVED" : "kept"}   storm p: ${STORM_P}\n`);
console.log(`Rounds per game:      mean ${mean(S.rounds).toFixed(1)}   median ${S.rounds.slice().sort((a,b)=>a-b)[Math.floor(S.games/2)]}   max ${Math.max(...S.rounds)}`);
console.log(`Games that never finished (hit the ${MAX_ROUNDS}-round cap): ${pct(S.stalled, S.games)}`);
console.log(`\n--- ACTION MIX  (baseline today: fish 57.0 / dock 32.1 / battle 7.6 / trade 3.3) ---`);
console.log(`  fish    ${pct(S.acts.fish, totalActs)}`);
console.log(`  dock    ${pct(S.acts.dock, totalActs)}`);
console.log(`  battle  ${pct(S.acts.battle, totalActs)}`);
console.log(`  trades struck (free phase, not an act): ${(S.trades / S.games).toFixed(2)} per game`);
console.log(`\n--- ECONOMY ---`);
console.log(`  coins minted per game  ${(S.coinsMinted / S.games).toFixed(1)}   burned ${(S.coinsBurned / S.games).toFixed(1)}   net ${((S.coinsMinted - S.coinsBurned) / S.games).toFixed(1)}`);
console.log(`     of minted: fishing ${pct(S.coinsMinted - S.callPayouts - S.acts.dock * 2, S.coinsMinted)}  treasure ~${pct(S.acts.dock * 2, S.coinsMinted)}  battle calls ${pct(S.callPayouts, S.coinsMinted)}`);
console.log(`  mean coins held at game end: ${mean(S.endCoins).toFixed(1)}   (baseline today: 7.6)`);
console.log(`  docks where the captain could NOT afford the crate: ${pct(S.brokeAtDock, S.acts.dock)}`);
console.log(`  mean coin pile by round: ` + S.coinByRound.slice(0, 14).map((a, i) => `r${i + 1}=${mean(a).toFixed(0)}`).join(" "));
console.log(`\n--- BATTLES ---`);
console.log(`  ${(S.battles / S.games).toFixed(2)} per game   attacker wins ${pct(S.attWins, S.battles)}   defender ${pct(S.defWins, S.battles)}`);
console.log(`  resolved on the committed coins alone: ${pct(S.battles - S.tieFlips, S.battles)}`);
console.log(`  went to the tie flip: ${pct(S.tieFlips, S.battles)}   went all the way to fewest-ingredients: ${pct(S.tieIng, S.battles)}`);
console.log(`  mean coins committed per battle (both sides): ${(S.bidTotal / S.battles).toFixed(2)}`);
console.log(`  spoils were a crate the WINNER SPECIFICALLY NEEDED: ${pct(S.spoilNeeded, S.battles)}   spoils were 5 coins: ${pct(S.spoilCoins, S.battles)}`);
console.log(`  TOTAL COIN FLIPS PER GAME: ${(S.flips / S.games).toFixed(1)}   (baseline today: ~75)`);
console.log(`\n--- WIND & WEATHER ---`);
console.log(`  turns where the upwind cap actually cost you distance: ${pct(S.upwindBound, S.sailChances)}`);
console.log(`  rim sweeps per game: ${(S.rimUses / S.games).toFixed(2)}`);
console.log(`  turns lost to storms per game: ${(S.stormTurnsLost / S.games).toFixed(2)}`);
console.log(`\n--- SCARCITY & OUTCOME ---`);
console.log(`  crates left on the board: ${mean(S.cratesLeft).toFixed(1)} of 21   (baseline today: 4.7)`);
console.log(`  games with >=1 captain locked out: ${pct(S.lockout, S.games)}   (baseline today: 95.9%)`);
console.log(`  games where 2+ captains finished (tie-break fires): ${pct(S.multiFinish, S.games)}`);
console.log(`  wins by seat: ` + S.winBySeat.map((n, i) => `seat${i + 1}=${pct(n, S.games)}`).join("  "));

/* ---------------------------------------------------------------- wind probe

Same measurement I ran against the shipped rules, so the two are directly comparable:
from many real board positions, how much do the reachable sets under two DIFFERENT winds
overlap? 100% would mean the wind changes nothing. The shipped 9-point budget scored 62.2%.
*/
{
  const g = new Game(roundCfg(["balanced","balanced","balanced","balanced"]), 4242, false);
  const p = g.players[0];
  const cells = [...g.valid].map(k => k.split(",").map(Number)).filter(c => !land(g, c)).slice(0, 140);
  const jac = [], sizes = { N: [], S: [], E: [], W: [] };
  for (const c of cells) {
    p.pos = c;
    const sets = {};
    for (const d of DKEYS) { const r = reachable(g, p, d); sets[d] = new Set(r.map(K)); sizes[d].push(r.length); }
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      const A = sets[DKEYS[a]], B = sets[DKEYS[b]];
      const inter = [...A].filter(x => B.has(x)).length;
      jac.push(inter / (A.size + B.size - inter));
    }
  }
  if (POWERS_ON) {
  console.log(`\n--- RULE 13: BOAT POWERS  (${DRAFT_ORDER ? "seat-order draft" : "random distinct draw, seats randomised"}) ---`);
  console.log(`  a power with no effect should sit at 25.0%. n = games that power appeared in.`);
  const rows = POWER_LIST.map(k => ({ k, n: S.powerGames[k] || 0, w: S.powerWins[k] || 0 }))
    .filter(r => r.n).map(r => ({ ...r, wr: 100 * r.w / r.n }))
    .sort((a, b) => b.wr - a.wr);
  for (const r of rows) {
    const delta = r.wr - 25;
    const bar = "\u2588".repeat(Math.max(0, Math.round(Math.abs(delta) * 2)));
    console.log(`  ${r.k.padEnd(10)} ${r.wr.toFixed(1).padStart(5)}%  ${(delta >= 0 ? "+" : "") + delta.toFixed(1).padStart(5)}  ${bar}   n=${r.n}`);
  }
  console.log(`  lockbox saves (a useless crate handed over instead of a needed one): ${(S.lockboxSaves / S.games).toFixed(2)} per game`);
}
console.log(`\n--- WIND PROBE (same metric as the shipped-rules run) ---`);
  console.log(`  reachable-set overlap between two different winds: ${(100*mean(jac)).toFixed(1)}%   (shipped rules: 62.2%)`);
  console.log(`  mean reachable cells by wind: ` + DKEYS.map(d => `${d}=${mean(sizes[d]).toFixed(1)}`).join("  ") + `   (shipped rules: 11.3-12.0, flat)`);
}
