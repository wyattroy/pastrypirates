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
const STORM_P = parseFloat((argv.find(a => a.startsWith("--storm=")) || "--storm=0.2").split("=")[1]);
const PRICE = (argv.find(a => a.startsWith("--price=")) || "--price=3,4,5").split("=")[1].split(",").map(Number);
const FISH_OTHERS = parseFloat((argv.find(a => a.startsWith("--fishothers=")) || "--fishothers=1").split("=")[1]);
const BID_MAX = parseInt((argv.find(a => a.startsWith("--bidmax=")) || "--bidmax=3").split("=")[1], 10);
const FISH_SELF = parseFloat((argv.find(a => a.startsWith("--fishself=")) || "--fishself=2").split("=")[1]);
const TREASURE = parseFloat((argv.find(a => a.startsWith("--treasure=")) || "--treasure=4").split("=")[1]);
// Rule 11 as Wyatt intended it: a docked captain may buy ANY crate, needed or not — to hoard,
// to monopolise what a rival needs, or to bluff about their own recipe.
const NO_HOARD = argv.includes("--nohoard");
// THE CAST — the proposed replacement for rule 3's fishing. Push-your-luck, played by the WHOLE
// table at once, so the wall-clock cost is the number of press-rounds, not the number of flips.
//   every captain flips together: HEADS +1 to your haul and you may press again;
//   TAILS ends your cast and you take 1. Stop and bank whenever you like. Max 4 presses.
//   the active captain (best water) adds +1 to their final haul.
const CAST = argv.includes("--cast");
// THE CAST, one-beat variant: everyone secretly picks a net, then ONE simultaneous flip each.
//   SHALLOW  a sure 1, no flip needed on your part
//   DEEP     heads 3 / tails 0   (EV 1.5, half the time you come up empty)
// Tuned so the table mints ~5 coins per cast — the same as rule 3 as written.
// Same simultaneity, same push-your-luck feel, but one beat at the table instead of two.
const CAST1 = argv.includes("--cast1");
const RETUNE = argv.includes("--retune");   // the re-specced boat powers
// Wyatt's own line of play: do not chase the nearest crate — find a CHAIN of islands you can hop
// dock-to-dock, roughly one a turn, and sail that even through islands you do not need, because
// those crates are trade goods. And pick which recipe to chase by how chainable its whole path is.
const ROUTE = argv.includes("--route");
const NO_DETOUR = argv.includes("--nodetour");   // chain-order your OWN needs, no trade-goods stops
const OUTCRY = argv.includes("--outcry");   // open-outcry market instead of pairwise solicitation
const ROUTERS = parseInt((argv.find(a => a.startsWith("--routers=")) || "--routers=4").split("=")[1], 10);
// Wyatt 2026-08-03: "fishing can simply get everyone 1, not the fisher 2. Either way, the decision
// becomes 'should I do something that helps my opponents' or not — make sure your bot is
// tactically deciding this."  --fishflat makes every captain, caster included, take exactly 1.
const FISH_FLAT = argv.includes("--fishflat");
// How many of the four captains play the MERCHANT line: sail to the nearest island, hoard its
// crates, and sell them on. The rest play the racer line (chase my own recipe).
const MAX_DEALS = parseInt((argv.find(a => a.startsWith("--maxdeals=")) || "--maxdeals=1").split("=")[1], 10);
const TRADE_FIRST = argv.includes("--tradefirst");
// the staggered 3/4/5/6 exists to offset going first; rule 2 made sailing free, which weakened it
const FLAT_COINS = argv.includes("--flatcoins");
// THE SHARED CAST (Wyatt, 2026-08-03). Fishing may be CALLED once per round by whoever spends
// their action on it. Then EVERY captain rides one shared coin: take the pot as it stands, or stay
// in for the next flip. Pot doubles 1,2,4,8,16... A tails and everyone still in gets nothing.
// The doubling is the point: riding is worth exactly what bailing is worth at every single rung,
// so the maths never tells you what to do — only your position does.
const SHARED = argv.includes("--shared");
const LADDER_CAP = parseInt((argv.find(a => a.startsWith("--laddercap=")) || "--laddercap=0").split("=")[1], 10);
const potAt = n => { const v = Math.pow(2, n); return LADDER_CAP ? Math.min(LADDER_CAP, v) : v; };
const MERCHANTS = parseInt((argv.find(a => a.startsWith("--merchants=")) || "--merchants=0").split("=")[1], 10);
const CAST_CAP = 4;
const HOARD_RESERVE = parseInt((argv.find(a => a.startsWith("--reserve=")) || "--reserve=6").split("=")[1], 10);
const POWERS_ON = argv.includes("--powers") || argv.some(a => a.startsWith("--draft="));
const DRAFT_ORDER = (argv.find(a => a.startsWith("--draft=")) || "").split("=")[1];
const MAX_ROUNDS = 200;

// Rule 13 — the eight boat powers, per Wyatt's list and his four scoping answers:
// unique draft (no duplicates), racer/hedger raise the BUDGET, lockbox applies to ANY loss.
const EXCLUDE = ((argv.find(a => a.startsWith("--exclude=")) || "--exclude=").split("=")[1] || "").split(",").filter(Boolean);
const POOL_V3 = argv.includes("--pool");   // the full candidate pool, Wyatt's new ones included
const SET = (argv.find(a => a.startsWith("--set=")) || "").split("=")[1];
const POWER_LIST = SET ? SET.split(",") : (POOL_V3
  ? ["gambler","trader","shooter","lockbox","racer2","wholesaler","crazyeddie","blackpearl",
     "poacher","harbourmaster","privateer","navigator","pilot","stormchaser","chandler","dreadnought"]
  : ["racer","hedger","shooter","trawler","lockbox","trader","sturdybow","gambler"])
  .filter(x => !EXCLUDE.includes(x));
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
  if (pw === "pilot") { walk(4, true); return [...out.values()]; }   // the wind never slows you
  walk(pw === "racer2" ? 6 : (pw === "racer" ? (RETUNE ? 6 : 5) : 4), false);
  walk(pw === "hedger" ? 3 : 2, true);
  return [...out.values()];
}

// ---- TURN distance (Dijkstra over the real move graph), not square distance ----
// Square counting is wrong for this game: a berth 3 squares upwind is TWO turns away, while one 4
// squares downwind is ONE. Every valuation the bot makes — which island to sail for, what a crate
// is worth in trade, whether a denial detour is affordable — is denominated in turns, so it has to
// be measured in turns.
//
// The board is static, so the one-turn move graph is precomputed once per wind direction and
// cached. Ships block *ending* on a cell but move constantly; they are ignored for distance
// estimation, which keeps the graph cacheable and only ever under-estimates by a turn.
function turnGraph(g, wind) {
  g.__tg = g.__tg || {};
  if (g.__tg[wind]) return g.__tg[wind];
  const graph = new Map();
  const ghost = { pos: null, power: null };
  for (const key of g.valid) {
    const c = key.split(",").map(Number);
    if (land(g, c)) continue;
    ghost.pos = c;
    const outs = new Set();
    for (const n of reachable(g, ghost, wind)) {
      let dest = n;
      if (!NO_RIM && g.onRim(n)) { const h = g.rimHead[K(n)]; if (h) dest = h; }
      outs.add(K(dest));
    }
    graph.set(key, [...outs]);
  }
  return (g.__tg[wind] = graph);
}
// turns from `from` to everywhere, as a {"x,y": turns} map
function turnDist(g, from, wind) {
  const graph = turnGraph(g, wind);
  const dist = { [K(from)]: 0 }; let frontier = [K(from)], t = 0;
  while (frontier.length && t < 12) {
    t++; const next = [];
    for (const k of frontier) for (const nk of (graph.get(k) || []))
      if (!(nk in dist)) { dist[nk] = t; next.push(nk); }
    frontier = next;
  }
  return dist;
}
// The move graph is NOT symmetric — the wind makes going somewhere cheaper than coming back — so
// "turns from me to T" and "turns from T to me" are different numbers. Anything asking "how close
// is this cell to my target" needs the REVERSED graph, not the forward one.
function turnGraphRev(g, wind) {
  g.__tgr = g.__tgr || {};
  if (g.__tgr[wind]) return g.__tgr[wind];
  const fwd = turnGraph(g, wind), rev = new Map();
  for (const [from, outs] of fwd) for (const to of outs) {
    if (!rev.has(to)) rev.set(to, []);
    rev.get(to).push(from);
  }
  return (g.__tgr[wind] = rev);
}
// turns needed to REACH `target` from everywhere, as a {"x,y": turns} map
function turnDistTo(g, target, wind) {
  const rev = turnGraphRev(g, wind);
  const dist = { [K(target)]: 0 }; let frontier = [K(target)], t = 0;
  while (frontier.length && t < 12) {
    t++; const next = [];
    for (const k of frontier) for (const nk of (rev.get(k) || []))
      if (!(nk in dist)) { dist[nk] = t; next.push(nk); }
    frontier = next;
  }
  return dist;
}
// square distance is still the right tool for "is this berth adjacent to that island" style
// questions, so it stays — it is simply no longer used for anything the bot values.
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

// turn-distance maps FROM each island berth and from home, cached per wind. The board is static,
// so a route can be costed out of these without another search.
function berthMaps(g, wind) {
  g.__bm = g.__bm || {};
  if (g.__bm[wind]) return g.__bm[wind];
  const m = {};
  for (const ing of g.ings) m[ing] = turnDist(g, g.dockOf[ing], wind);
  m.__home = turnDist(g, g.home, wind);
  return (g.__bm[wind] = m);
}
// Cost, in TURNS, of a pickup route: me -> each berth in order -> home.
function routeCost(g, from, order, wind, fromMap) {
  const bm = berthMaps(g, wind);
  let cost = 0, at = null;
  for (const ing of order) {
    const cell = K(g.dockOf[ing]);
    cost += at === null ? (fromMap[cell] ?? 12) : (bm[at][cell] ?? 12);
    cost += 1;                                     // the turn spent docking
    at = ing;
  }
  cost += at === null ? (fromMap[K(g.home)] ?? 12) : (bm[at][K(g.home)] ?? 12);
  return cost;
}
// The cheapest order to collect a set of ingredients and get home. Brute force to 5 (120 orders);
// nearest-neighbour beyond that. Cached per (need-set, wind) because it only changes when one of
// them changes, not every turn.
function bestRoute(g, from, need, wind, fromMap) {
  if (!need.length) return { order: [], cost: fromMap[K(g.home)] ?? 12 };
  const perms = (a) => a.length <= 1 ? [a] :
    a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(r => [x, ...r]));
  let cands;
  if (need.length <= 5) cands = perms(need);
  else {                                            // nearest-neighbour seed only
    const bm = berthMaps(g, wind); const rest = [...need]; const order = []; let at = null;
    while (rest.length) {
      let bi = 0, bd = 1e9;
      rest.forEach((ing, i) => { const c = at === null ? (fromMap[K(g.dockOf[ing])] ?? 12) : (bm[at][K(g.dockOf[ing])] ?? 12);
        if (c < bd) { bd = c; bi = i; } });
      at = rest[bi]; order.push(at); rest.splice(bi, 1);
    }
    cands = [order];
  }
  let best = null, bestC = 1e9;
  for (const o of cands) { const c = routeCost(g, from, o, wind, fromMap); if (c < bestC) { bestC = c; best = o; } }
  return { order: best, cost: bestC };
}

/* ---------------------------------------------------------------- the sim */

function playGame(seed, stats) {
  const cfg = roundCfg(["balanced", "balanced", "balanced", "balanced"]);
  const g = new Game(cfg, seed, false);
  const P = g.players;
  P.forEach((p, i) => { p.coins = cfg.startCoins + (FLAT_COINS ? 2 : i); p.bought = 0; p.lostTurn = false; p.power = null; p.line = i < MERCHANTS ? 'merchant' : 'racer'; });
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
  let recipePicked = 0, detours = 0, routeTurns = 0, offers = 0, offersFilled = 0, undercuts = 0;
  const sold = {}; g.ings.forEach(i => sold[i] = 0);   // rule 11: per-ISLAND price ladder
  const basePrice = ing => PRICE[Math.min(sold[ing], PRICE.length - 1)];
  let priceFor = null;                       // set to a captain while they are buying
  const price = ing => (priceFor && priceFor.power === "wholesaler") ? PRICE[0] : basePrice(ing);

  // Rule: dealt two secret recipes, keep one. A router picks the card whose whole path is cheaper
  // to sail from where they start — exactly the calculation Wyatt makes at the table.
  if (ROUTE) {
    const w0 = DKEYS[0];
    for (const p of P) {
      if (p.idx >= ROUTERS || !p.recipeChoices) continue;
      const fromMap = turnDist(g, p.pos, w0);
      const cost = r => bestRoute(g, p.pos, r.filter(i => g.tokens[i] > 0), w0, fromMap).cost;
      const [a, b] = p.recipeChoices;
      p.recipe = cost(a) <= cost(b) ? a : b;
      recipePicked++;
    }
  }
  // rule 6: this round's wind and storm are known one round ahead
  let wind = DKEYS[Math.floor(g.r() * 4)], storm = g.r() < STORM_P;
  let nextWind = DKEYS[Math.floor(g.r() * 4)], nextStorm = g.r() < STORM_P;

  const acts = { fish: 0, dock: 0, battle: 0, pass: 0 };
  let trades = 0, battles = 0, attWins = 0, defWins = 0, tieFlips = 0, tieIng = 0;
  let stormTurnsLost = 0, rimUses = 0, coinsMinted = 0, coinsBurned = 0, callPayouts = 0;
  let brokeAtDock = 0, bidTotal = 0, flips = 0, upwindBound = 0, sailChances = 0;
  let spoilNeeded = 0, spoilCoins = 0, lockboxSaves = 0, hoardBuys = 0, castRounds = 0, casts = 0;
  let swaps = 0, buys = 0, sells = 0, tradeCoin = 0, passes = 0;
  const recordSpoil = () => {};
  const coinTrace = [];

  const refused = new Set();
  let calledThisRound = false, sharedFlips = 0, bigHauls = 0, wipeouts = 0;
  const needs = p => g.needs(p);
  const finished = p => !needs(p).length && man(p.pos, g.home) <= 1;

  // ---- rule 4: a real market at the start of every captain's turn.
  // What a crate is WORTH to a buyer is what getting it another way would cost: the island's
  // ladder price plus the turns of sailing, or a lot more if it is off the board entirely.
  function crateValue(q, ing) {
    if (!needs(q).includes(ing)) return 0;
    if (g.tokens[ing] <= 0) return 14;                       // only trade or plunder can get it now
    const turns = turnDist(g, q.pos, wind)[K(g.dockOf[ing])] ?? 12;
    return price(ing) + Math.min(9, turns * 2);              // price + the TURNS it costs to fetch
  }
  // What a seller gives up: the crate itself, plus the denial value of keeping it from a rival.
  // What a seller gives up: the crate, plus its denial value. The denial term has to scale with
  // THREAT — nobody sells the winning ingredient to the captain who is one crate from home, and a
  // market where everyone always deals leaves no reason for anyone to ever fight.
  function reservation(p, ing, buyer) {
    if (needs(p).includes(ing)) return 99;                   // not for sale at any price
    const rivals = P.filter(x => x !== p && !x.done && needs(x).includes(ing)).length;
    let r = 2 + rivals + (g.tokens[ing] <= 0 ? 3 : 0);
    if (buyer) { const left = needs(buyer).length;
      if (left <= 1) r += 12; else if (left === 2) r += 5; }  // not to the captain about to win
    return r;
  }
  // ---- OPEN OUTCRY (Wyatt, 2026-08-03) ----
  // Not pairwise solicitation — that is horrible to play and horrible to watch. The active captain
  // puts ONE offer on the table naming both sides ("I want cocoa, I'll give 6"), every other
  // captain answers once (no / yes / a counter that undercuts), and the offerer picks. Bounded at
  // exactly one round of responses so a shot clock can always resolve it.
  function openOutcry(p) {
    const myNeed = needs(p);
    // A captain holding trade goods and short of coin calls a SALE instead: "I'll give cocoa,
    // who'll pay?" Rivals answer with what they will pay and outbid each other.
    const surplus = p.ing.filter(i => !myNeed.includes(i));
    const nextCost = myNeed.length ? price(myNeed.find(i => g.tokens[i] > 0) || myNeed[0]) : 0;
    const noOneHasWhatINeed = !myNeed.some(i => P.some(q => q !== p && !q.done && q.ing.includes(i)));
    if (surplus.length && p.coins < nextCost && noOneHasWhatINeed) {
      let best = null;
      for (const g2 of surplus) for (const q of P) {
        if (q === p || q.done || !needs(q).includes(g2)) continue;
        const bid = Math.min(q.coins, crateValue(q, g2));
        if (bid >= 2 && (!best || bid > best.bid)) best = { q, ing: g2, bid };
      }
      if (best) {
        offers++;
        if (P.filter(q => q !== p && !q.done && needs(q).includes(best.ing)).length > 1) undercuts++;
        best.q.coins -= best.bid; p.coins += best.bid;
        if (p.power === "chandler") { p.coins += 2; coinsMinted += 2; }
        p.ing.splice(p.ing.indexOf(best.ing), 1); best.q.ing.push(best.ing);
        trades++; sells++; tradeCoin += best.bid; offersFilled++; tradeBonus(p, best.q);
        return true;
      }
    }
    if (!myNeed.length) return false;
    // What do I call for? The crate I need that is dearest to fetch myself — that is where a deal
    // beats sailing. crateValue() already prices "what would getting this another way cost me".
    let want = null, wantV = -1;
    for (const ing of myNeed) {
      const holders = P.filter(q => q !== p && !q.done && q.ing.includes(ing));
      if (!holders.length) continue;
      const v = crateValue(p, ing);
      if (v > wantV) { wantV = v; want = ing; }
    }
    if (!want) return false;
    offers++;
    // What am I willing to give? A surplus crate first (costs me nothing), else coins up to value.
    const mySurplus = p.ing.filter(i => !myNeed.includes(i));
    const openingCoins = Math.min(p.coins, Math.max(1, Math.floor(wantV * 0.6)));
    // Every rival answers ONCE. A holder answers with the least they will take; that is the
    // undercut — they are bidding against each other to be the one who sells.
    const answers = [];
    for (const q of P) {
      if (q === p || q.done || !q.ing.includes(want)) continue;
      const res = reservation(q, want, p);
      // A holder who will not deal at any price I would pay has REFUSED, in public, in front of
      // the whole table. That is what licenses the guns later (BOT-STRATEGY.md §5).
      if (res > wantV) { refused.add(p.idx + ">" + q.idx); continue; }
      // will they take a crate instead of coin? only if it is something they need
      const swapWith = mySurplus.find(i => needs(q).includes(i));
      if (swapWith) { answers.push({ q, kind: "swap", give: swapWith, ask: 0 }); continue; }
      answers.push({ q, kind: "coin", ask: Math.max(res, 1) });
    }
    if (!answers.length) { for (const q of P) if (q !== p && !q.done && q.ing.includes(want)) refused.add(p.idx + ">" + q.idx); return false; }
    if (answers.length > 1) undercuts++;
    // The offerer picks: a swap is free, so it always wins; otherwise the cheapest ask.
    answers.sort((x, y) => (x.kind === "swap" ? -1 : y.kind === "swap" ? 1 : x.ask - y.ask));
    const deal = answers[0];
    if (deal.kind === "swap") {
      p.ing.splice(p.ing.indexOf(deal.give), 1); deal.q.ing.push(deal.give);
      deal.q.ing.splice(deal.q.ing.indexOf(want), 1); p.ing.push(want);
      trades++; swaps++; offersFilled++; tradeBonus(p, deal.q); return true;
    }
    const pay = Math.min(deal.ask, openingCoins, p.coins);
    if (pay < deal.ask) return false;                             // I could not meet the best answer
    p.coins -= pay; deal.q.coins += pay;
    deal.q.ing.splice(deal.q.ing.indexOf(want), 1); p.ing.push(want);
    trades++; buys++; tradeCoin += pay; offersFilled++; tradeBonus(p, deal.q);
    return true;
  }
  function tryTrade(p) {
    if (OUTCRY) return openOutcry(p);
    let struck = false, dealsThisTurn = 0;
    for (const q of P) {
      if (q === p || q.done || dealsThisTurn >= MAX_DEALS) continue;
      // (a) a straight swap — each of us holds what the other needs. Always the best deal available.
      const iWant = q.ing.find(i => needs(p).includes(i) && !needs(q).includes(i));
      const theyWant = p.ing.find(i => needs(q).includes(i) && !needs(p).includes(i));
      if (iWant && theyWant) {
        p.ing.splice(p.ing.indexOf(theyWant), 1); q.ing.push(theyWant);
        q.ing.splice(q.ing.indexOf(iWant), 1); p.ing.push(iWant);
        trades++; swaps++; dealsThisTurn++; tradeBonus(p, q); struck = true; continue;
      }
      // (b) I buy from them. A deal exists whenever my value clears their reservation.
      if (iWant) {
        const v = crateValue(p, iWant), r = reservation(q, iWant, p);
        const ask = Math.ceil((v + r) / 2);
        if (!(v >= r && p.coins >= ask)) refused.add(p.idx + ">" + q.idx);   // they would not deal
        if (v >= r && p.coins >= ask) {
          p.coins -= ask; q.coins += ask;
          q.ing.splice(q.ing.indexOf(iWant), 1); p.ing.push(iWant);
          trades++; buys++; dealsThisTurn++; tradeCoin += ask; tradeBonus(p, q); struck = true; continue;
        }
      }
      // (c) they buy from me — the merchant's whole business model
      if (theyWant) {
        const v = crateValue(q, theyWant), r = reservation(p, theyWant, q);
        const ask = Math.ceil((v + r) / 2);
        if (v >= r && q.coins >= ask) {
          q.coins -= ask; p.coins += ask;
          if (p.power === "chandler") { p.coins += 2; coinsMinted += 2; }
          p.ing.splice(p.ing.indexOf(theyWant), 1); q.ing.push(theyWant);
          trades++; sells++; dealsThisTurn++; tradeCoin += ask; tradeBonus(p, q); struck = true;
        }
      }
    }
    return struck;
  }
  function tradeBonus(a, b) {
    for (const x of [a, b]) {
      if (x.power !== "trader") continue;
      if (RETUNE) { if (x.traderPaidRound === g.round) continue; x.traderPaidRound = g.round;
        x.coins += 1; coinsMinted += 1; continue; }
      x.coins += 2; coinsMinted += 2;
    }
  }

  // ---- rule 9: simultaneous committed-coin battle
  function battle(att, def) {
    battles++;
    const bid = (x, keen) => {
      let cap = Math.min(BID_MAX, x.coins);
      if (x === att && def.power === "dreadnought") return x.coins;   // no half measures against her
      if (cap <= 0) return 0;
      return keen ? cap : Math.min(cap, 1 + Math.floor(g.r() * cap));
    };
    // the attacker chose this fight, so they commit harder
    let a = bid(att, true), d = bid(def, needs(def).length <= 2);
    bidTotal += a + d;
    att.coins -= a; def.coins -= d; coinsBurned += a + d;   // spent either way

    // rule 9: downwind +1. geometry read once, exactly as the live engine does it.
    const dx = def.pos[0] - att.pos[0], dy = def.pos[1] - att.pos[1];
    const ux = Math.sign(dx), uy = Math.sign(dy), axis = (dx === 0) !== (dy === 0);
    const aToD = axis ? DKEYS.find(k => DIRS[k][0] === ux && DIRS[k][1] === uy) : undefined;
    const dToA = axis ? DKEYS.find(k => DIRS[k][0] === -ux && DIRS[k][1] === -uy) : undefined;
    for (const [x, isAtt] of [[att, true], [def, false]]) {
      if (x.power !== "crazyeddie") continue;
      flips++;
      if (g.r() < .5) { const extra = isAtt ? a : d; if (x.coins >= extra) { x.coins -= extra; coinsBurned += extra;
        if (isAtt) a += extra; else d += extra; } }
    }
    let A = a, D = d;
    if (wind === aToD) A += 1; else if (wind === dToA) D += 1;
    if (!RETUNE && att.power === "shooter") A += 1;
    if (!RETUNE && def.power === "shooter") D += 1;

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
    if (RETUNE && win.power === "shooter") {            // efficient powder: the winner's stake returns
      const back = win === att ? a : d; win.coins += back; coinsMinted += back;
    }
    if (RETUNE && win.power === "privateer") { const t = Math.min(3, lose.coins); lose.coins -= t; win.coins += t; }
    if (win === att) attWins++; else defWins++;

    // rule 5: spectators call it free, +2 if right
    for (const s of P) {
      if (s === att || s === def || s.done) continue;
      const fav = att.coins >= def.coins ? att : def;         // they can see purses, not bids
      const call = g.r() < .6 ? fav : (fav === att ? def : att);
      if (call === win) { const pay = s.power === "gambler" ? 3 : 2; s.coins += pay; coinsMinted += pay; callPayouts += pay; }
    }

    // rule 9 spoils: 5 coins or a crate, WINNER's choice — take a crate you need if there is one
    if (RETUNE && lose.power === "lockbox") {
      const take = Math.min(5, lose.coins); lose.coins -= take; win.coins += take;
      if (take) spoilCoins++; lockboxSaves++; recordSpoil(); return;
    }
    if (!RETUNE && lose.power === "lockbox" && lose.ing.length) {
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
    for (const p of P) {
      if (p.done) continue;
      const d = DIRS[p.power === "stormchaser" ? bestStormDir(p) : wind];
      const berthed = g.adjPort(p) !== null || man(p.pos, g.home) <= 1;
      if (berthed && DOCK_SHELTER === "berth") continue;      // rule 8: docks save you
      const legs = p.power === "sturdybow" ? 1 : 3;
      for (let s = 0; s < legs; s++) {
        const n = [p.pos[0] + d[0], p.pos[1] + d[1]];
        if (land(g, n)) {
          if (DOCK_SHELTER === "path" && g.adjPort(p) !== null) break;   // alt reading
          if (p.power === "blackpearl") break;                            // never runs aground
          p.lostTurn = true; stormTurnsLost++; break;                     // rule 8
        }
        if (shipAt(g, n, p)) break;
        p.pos = n;
        if (!NO_RIM && g.onRim(p.pos)) { const h = g.rimHead[K(p.pos)]; if (h) { p.pos = [...h]; rimUses++; } break; }
      }
    }
  }

  // a stormchaser rides the gale toward whatever she is sailing for
  function bestStormDir(p) {
    const nd = needs(p);
    const tgt = nd.length ? (g.dockOf[nd.find(i => g.tokens[i] > 0) || nd[0]] || g.home) : g.home;
    const td = waterDist(g, tgt);
    let best = wind, bd = 1e9;
    for (const dk of DKEYS) {
      const dd = DIRS[dk]; let c = p.pos;
      for (let s = 0; s < 3; s++) { const n = [c[0] + dd[0], c[1] + dd[1]]; if (land(g, n)) break; c = n; }
      const v = td[K(c)] ?? 1e9; if (v < bd) { bd = v; best = dk; }
    }
    return best;
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
      const dists = turnDist(g, p.pos, wind);
      const cands = (stocked.length ? stocked : need).map(i => g.dockOf[i]).filter(Boolean);
      const sqFrom = waterDist(g, p.pos);
      const rankT = c => (dists[K(c)] ?? 99) * 1000 + Math.min(999, sqFrom[K(c)] ?? 999);
      if (cands.length) target = cands.reduce((b, c) => rankT(c) < rankT(b) ? c : b, cands[0]);
      // ---- the router: sail a CHAIN, not the nearest crate ----
      // Wyatt's line: judge a route by how TIGHT the chain is — turns per dock. A chain you can
      // hop roughly one island a turn is worth sailing even through crates you do not need, because
      // those are trade goods. Re-planned only when the need-set or the wind changes, never per
      // turn: a route that is recomputed every step is not a plan, it is a wander.
      if (ROUTE && p.idx < ROUTERS && stocked.length) {
        const key = stocked.slice().sort().join() + "|" + wind;
        if (p.__rk !== key) {
          const base = bestRoute(g, p.pos, stocked, wind, dists);
          let chosen = base.order, bestPerDock = base.cost / Math.max(1, base.order.length);
          // At most ONE trade-goods detour, and only if it does not loosen the chain.
          if (!NO_DETOUR && base.order && base.order.length && needs(p).length > 2) {
            for (const extra of g.ings) {
              if (stocked.includes(extra) || g.tokens[extra] <= 0) continue;
              if (!P.some(q => q !== p && !q.done && needs(q).includes(extra))) continue;
              const withExtra = bestRoute(g, p.pos, [...stocked, extra], wind, dists);
              const perDock = withExtra.cost / (withExtra.order.length || 1);
              if (perDock <= bestPerDock) { chosen = withExtra.order; bestPerDock = perDock; }
            }
          }
          if (chosen && chosen.length > (base.order||[]).length) detours++;
          p.__rk = key; p.__route = chosen;
        }
        // drop stops already collected, then head for the next one
        if (p.__route) p.__route = p.__route.filter(i => g.tokens[i] > 0 && !p.ing.includes(i));
        if (p.__route && p.__route.length) { target = g.dockOf[p.__route[0]]; routeTurns++; }
      }
      // Rule 11 as intended: if I am rich, an ingredient is running short, a rival needs it and I
      // do not, sailing over to buy it out is a real play. Only worth a detour, not a voyage.
      if (!NO_HOARD && p.coins >= price(need[0] || "wheat") + HOARD_RESERVE) {
        const myBest = dists[K(target)] ?? 99;
        let deny = null, denyD = 99;
        for (const i of g.ings) {
          if (g.tokens[i] <= 0 || g.tokens[i] > 2 || needs(p).includes(i)) continue;
          if (!P.some(q => q !== p && !q.done && needs(q).includes(i))) continue;
          const c = g.dockOf[i], d = dists[K(c)] ?? 99;
          if (d < denyD) { denyD = d; deny = c; }
        }
        if (deny && denyD <= myBest + 1) target = deny;
      }
      // Scarcity is meant to force a scramble, not a stalemate: if something I need is off the
      // board entirely, the only routes left are trade and plunder — so go and find the holder.
      // The merchant line: the nearest island with stock that rivals want is a business, not a
      // detour. Buy it out, sell it on. Weighed against my own recipe by distance, not ignored.
      if (p.line === "merchant") {
        let best = null, bestScore = -1e9;
        for (const i of g.ings) {
          if (g.tokens[i] <= 0) continue;
          const buyers = P.filter(x => x !== p && !x.done && needs(x).includes(i)).length;
          if (!buyers && !needs(p).includes(i)) continue;
          const c = g.dockOf[i], d = dists[K(c)] ?? 99;
          if (p.coins < price(i)) continue;
          const score = (needs(p).includes(i) ? 4 : 0) + buyers * 3 - d * 2.5;
          if (score > bestScore) { bestScore = score; best = c; }
        }
        if (best) target = best;
      }
      const gone = need.filter(i => g.tokens[i] <= 0);
      if (gone.length) {
        const holders = P.filter(q => q !== p && !q.done && q.ing.some(i => gone.includes(i)));
        if (holders.length) target = holders.reduce((b, q) =>
          (dists[K(q.pos)] ?? 1e9) < (dists[K(b.pos)] ?? 1e9) ? q : b, holders[0]).pos;
      }
    }
    const cells = reachable(g, p, wind);
    sailChances++;
    // does the upwind cap actually bind this turn? i.e. is the best cell only reachable at 2?
    if (cells.length) {
      const td = turnDistTo(g, target, wind);
      const sq = waterDist(g, target);                       // tiebreak only
      const rank = c => (td[K(c)] ?? 99) * 1000 + Math.min(999, sq[K(c)] ?? 999);
      let best = p.pos, bd = rank(p.pos);
      for (const c of cells) { const d = rank(c); if (d < bd) { bd = d; best = c; } }
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
        if (!NO_RIM && g.onRim(p.pos)) {
          const h = g.rimHead[K(p.pos)];
          if (h && K(h) !== K(p.pos)) {
            // sturdy bow holds course: ride the current only when it actually helps
            const holds = RETUNE && p.power === "sturdybow" && (td[K(h)] ?? 1e9) > (td[K(p.pos)] ?? 1e9);
            if (!holds) {
              p.pos = [...h]; rimUses++;
              if (p.power === "navigator") {              // sail on from where the current drops you
                const more = reachable(g, p, wind);
                if (more.length) { let b2 = p.pos, r2 = rank(p.pos);
                  for (const c of more) { const r = rank(c); if (r < r2) { r2 = r; b2 = c; } }
                  if (K(b2) !== K(p.pos) && !g.onRim(b2)) p.pos = b2; }
              }
            }
          }
        }
      }
    }

    // --- Act
    if (finished(p)) { p.done = true; g.finishOrder.push(p.idx); return; }

    const port = g.adjPort(p);
    const occupied = port && p.power !== "harbourmaster" && g.dockOccupiedBy(port, p);
    // rule 10 + 11: dock = treasure flip, then always buy
    if (port && !occupied && g.tokens[port] > 0) {
      const iNeed = needs(p).includes(port);
      // hoarding: buy a crate I do NOT need, if a rival needs it and I can spare the coin
      const rivalNeeds = P.some(q => q !== p && !q.done && needs(q).includes(port));
      const reserve = p.line === "merchant" ? 0 : HOARD_RESERVE;
      const wantHoard = !NO_HOARD && !iNeed && rivalNeeds && p.coins >= price(port) + reserve;
      if (iNeed || wantHoard) {
        acts.dock++; priceFor = p;
        const h = g.r() < .5; flips++;
        if (h) { p.coins += TREASURE; coinsMinted += TREASURE; }
        const cost = price(port);
        if (p.coins >= cost) { p.coins -= cost; coinsBurned += cost; g.tokens[port]--; sold[port]++; p.ing.push(port);
          if (!iNeed) hoardBuys++; }
        else brokeAtDock++;
        priceFor = null;
        return;
      }
    }
    // rule 9/14: attack an adjacent ship (Tortuga is no longer a sanctuary)
    const reach = (RETUNE && p.power === "shooter") ? 2 : 1;
    const adj = P.filter(q => q !== p && !q.done && man(q.pos, p.pos) <= reach);
    // guns come out only where talking failed — TRADE_FIRST models Wyatt's intent directly
    const stingy = q => !TRADE_FIRST || refused.has(p.idx + ">" + q.idx);
    const juicy = adj.find(q => stingy(q) && q.ing.some(i => needs(p).includes(i) && g.tokens[i] <= 0))
      || adj.find(q => stingy(q) && (q.ing.some(i => needs(p).includes(i)) || q.coins >= 8));
    if (juicy && p.coins >= 1) { acts.battle++; battle(p, juicy); return; }
    if (SHARED) {
      // "once per round": if someone already called it this round, there is nothing to call.
      if (calledThisRound) {
        if (p.power === "poacher") { acts.fish++; p.coins += 2; coinsMinted += 2; return; }
        acts.pass++; passes++; return;
      }
      // The volunteer's dilemma: calling costs YOU an action and pays everyone the same expected 1.
      // So only call when you actually need the coin and nobody else has done it for you.
      const nd = needs(p);
      const wantCoin = nd.length ? price(nd.find(i => g.tokens[i] > 0) || nd[0]) : 0;
      if (p.coins >= wantCoin) { acts.pass++; passes++; return; }
      calledThisRound = true; acts.fish++; casts++;
      // everyone rides. Each captain's target is what they are short of; the pot is EV-neutral, so
      // "ride until the pot covers what I need" is the whole strategy and it is purely positional.
      const inPlay = P.filter(q => !q.done);
      const target = new Map();
      for (const q of inPlay) {
        const qn = needs(q);
        const want = qn.length ? price(qn.find(i => g.tokens[i] > 0) || qn[0]) : 0;
        target.set(q, Math.max(1, want - q.coins));
      }
      const stillIn = new Set(inPlay);
      let stage = 0;
      for (;;) {
        // everyone secretly decides, simultaneously, BEFORE the flip
        for (const q of [...stillIn]) {
          const takes = (RETUNE && q.power === "gambler") ? potAt(stage + 1) : potAt(stage);
          if (takes >= target.get(q)) { q.coins += takes; coinsMinted += takes;
            if (takes >= 8) bigHauls++; stillIn.delete(q); }
        }
        if (!stillIn.size) break;
        flips++; sharedFlips++;
        if (g.r() < .5) { stage++; if (stage > 12) { for (const q of stillIn) { q.coins += potAt(stage); coinsMinted += potAt(stage); } break; } }
        else {                                      // tails: everyone still in gets nothing...
          for (const q of stillIn) {
            if (RETUNE && q.power === "trawler") {           // decides after the coin lands
              const t = potAt(stage + 1); q.coins += t; coinsMinted += t; if (t >= 8) bigHauls++; }
            else wipeouts++;
          }
          break;
        }
      }
      castRounds += 1;
      return;
    }
    // --- is fishing actually worth it? ---
    // The gain is 1 coin (or FISH_SELF). The cost is my whole action, plus handing every rival a
    // coin. So: only when I am genuinely short of what I am about to buy, and never when it would
    // hand a rival the last coin they need to finish ahead of me.
    if (FISH_FLAT) {
      const nd = needs(p);
      const wantCoin = nd.length ? price(nd.find(i => g.tokens[i] > 0) || nd[0]) : 0;
      const short = p.coins < wantCoin;                       // I cannot afford my next crate
      // would this tip a rival over the line? they are 1 crate from done and 1 coin short of it
      const armsARival = P.some(q => {
        if (q === p || q.done) return false;
        const qn = needs(q); if (qn.length > 1) return false;
        const cost = qn.length ? price(qn[0]) : 0;
        return q.coins === cost - 1;
      });
      if (!short || armsARival) { acts.pass++; passes++; return; }
    }
    acts.fish++;
    if (CAST1) {
      for (const q of P) {
        if (q.done) continue;
        // go deep when you are far from affording what you are sailing to, shallow when a small
        // sure catch closes the gap — the actual decision a player would be making
        const nd = needs(q), cheapest = nd.length ? 3 : 0;
        const deep = q.coins < cheapest || q.coins >= cheapest + 6 ? true : false;
        flips++;
        const h = g.r() < .5;
        const take = deep ? (h ? 3 : 0) : 1;
        const bonus = (q === p && take > 0) ? 1 : 0;
        q.coins += take + bonus; coinsMinted += take + bonus;
      }
      castRounds += 1; casts++;
      return;
    }
    if (CAST) {
      // simultaneous push-your-luck. Bank when banking beats pressing: from haul h the press is
      // worth 0.5(h+1) + 0.5(1), so pressing wins while h < 1 ... with the +1-per-heads curve the
      // break-even sits at h<=1, so a captain presses twice and banks. Trawler presses once more.
      let castFlips = 0;
      for (const q of P) {
        if (q.done) continue;
        const stopAt = (q.power === "trawler" ? 3 : 2);   // trawler: the boat that dares one more
        let haul = 0, busted = false;
        for (let d = 0; d < CAST_CAP && haul < stopAt; d++) {
          castFlips++; flips++;
          if (g.r() < .5) haul += 1; else { busted = true; break; }
        }
        const take = busted ? 1 : haul + (q === p ? 1 : 0);
        q.coins += take; coinsMinted += take;
      }
      castRounds += Math.ceil(castFlips / Math.max(1, P.filter(x => !x.done).length));
      casts++;
      return;
    }
    // rule 3 as written: no flip, fisher +2, everyone else +1
    const catchSize = FISH_SELF + (p.power === "trawler" ? 1 : 0);
    p.coins += catchSize; coinsMinted += catchSize;
    for (const q of P) if (q !== p && !q.done) { q.coins += FISH_OTHERS; coinsMinted += FISH_OTHERS; }
  }

  // ---- the round loop
  let over = false;
  while (g.round < MAX_ROUNDS && !over) {
    g.round++;
    calledThisRound = false;
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
  stats.acts.fish += acts.fish; stats.acts.dock += acts.dock; stats.acts.battle += acts.battle; stats.acts.pass += acts.pass;
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
  stats.sharedFlips += sharedFlips; stats.bigHauls += bigHauls; stats.wipeouts += wipeouts;
  stats.detours += detours; stats.offers += offers; stats.offersFilled += offersFilled; stats.undercuts += undercuts;
  stats.swaps += swaps; stats.buys += buys; stats.sells += sells; stats.tradeCoin += tradeCoin; stats.passes += passes;
  for (const q of P) { stats.lineGames[q.line]++; if (winner === q) stats.lineWins[q.line]++; }
  stats.lockboxSaves += lockboxSaves; stats.hoardBuys += hoardBuys; stats.castRounds += castRounds; stats.casts += casts;
  if (P.some(p => !p.done && needs(p).some(i => g.tokens[i] === 0))) stats.lockout++;
  stats.multiFinish += finishers.length > 1 ? 1 : 0;
  for (let i = 0; i < coinTrace.length && i < 30; i++) { (stats.coinByRound[i] ||= []).push(coinTrace[i]); }
  return g;
}

/* ---------------------------------------------------------------- run */

const S = {
  games: 0, rounds: [], stalled: 0, acts: { fish: 0, dock: 0, battle: 0, pass: 0 }, trades: 0,
  battles: 0, attWins: 0, defWins: 0, tieFlips: 0, tieIng: 0, stormTurnsLost: 0, rimUses: 0,
  coinsMinted: 0, coinsBurned: 0, callPayouts: 0, brokeAtDock: 0, bidTotal: 0, flips: 0,
  upwindBound: 0, sailChances: 0, spoilNeeded: 0, spoilCoins: 0, cratesLeft: [], endCoins: [], winBySeat: [0, 0, 0, 0],
  lockout: 0, multiFinish: 0, coinByRound: [], powerGames: {}, powerWins: {}, powerSeat: {}, lockboxSaves: 0, hoardBuys: 0, castRounds: 0, casts: 0, detours: 0, offers: 0, offersFilled: 0, undercuts: 0, sharedFlips: 0, bigHauls: 0, wipeouts: 0, swaps: 0, buys: 0, sells: 0, tradeCoin: 0, passes: 0,
  lineGames: {racer:0,merchant:0}, lineWins: {racer:0,merchant:0},
};
for (let i = 0; i < N_GAMES; i++) playGame(700000 + i, S);

const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const pct = (n, d) => (100 * n / d).toFixed(1) + "%";
const totalActs = S.acts.fish + S.acts.dock + S.acts.battle + S.acts.pass;

console.log(`WYATT RULESET MODEL — ${S.games} games, 4 captains, seeds 700000+`);
console.log(`  dock shelter: ${DOCK_SHELTER}   rim: ${NO_RIM ? "REMOVED" : "kept"}   storm p: ${STORM_P}\n`);
console.log(`Rounds per game:      mean ${mean(S.rounds).toFixed(1)}   median ${S.rounds.slice().sort((a,b)=>a-b)[Math.floor(S.games/2)]}   max ${Math.max(...S.rounds)}`);
console.log(`Games that never finished (hit the ${MAX_ROUNDS}-round cap): ${pct(S.stalled, S.games)}`);
console.log(`\n--- ACTION MIX  (baseline today: fish 57.0 / dock 32.1 / battle 7.6 / trade 3.3) ---`);
console.log(`  fish    ${pct(S.acts.fish, totalActs)}`);
console.log(`  dock    ${pct(S.acts.dock, totalActs)}`);
console.log(`  battle  ${pct(S.acts.battle, totalActs)}`);
console.log(`  pass    ${pct(S.acts.pass, totalActs)}   (declined to fish — it would have helped rivals more than me)`);
if (OUTCRY) console.log(`  OPEN OUTCRY: ${(S.offers/S.games).toFixed(1)} offers a game, ${pct(S.offersFilled, S.offers)} filled, ${pct(S.undercuts, S.offers)} drew competing answers`);
if (ROUTE) console.log(`  ROUTING: ${(S.detours/S.games).toFixed(2)} trade-goods detours a game`);
console.log(`  trade breakdown: ${(S.swaps/S.games).toFixed(2)} swaps + ${(S.buys/S.games).toFixed(2)} buys + ${(S.sells/S.games).toFixed(2)} sells per game, ${(S.tradeCoin/Math.max(1,S.buys+S.sells)).toFixed(1)} coins per sale`);
if (MERCHANTS) console.log(`  LINE WIN RATE: merchant ${pct(S.lineWins.merchant, S.lineGames.merchant)} (n=${S.lineGames.merchant})   racer ${pct(S.lineWins.racer, S.lineGames.racer)} (n=${S.lineGames.racer})`);
console.log(`  trades struck (free phase, not an act): ${(S.trades / S.games).toFixed(2)} per game`);
console.log(`  crates bought that the buyer did NOT need (hoarding/monopolising): ${(S.hoardBuys / S.games).toFixed(2)} per game`);
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
if (SHARED) {
  console.log(`  THE SHARED CAST: called ${(S.casts/S.games).toFixed(1)} times a game (max 1 per round), ${(S.sharedFlips/Math.max(1,S.casts)).toFixed(2)} shared flips each`);
  console.log(`     hauls of 8+: ${(S.bigHauls/S.games).toFixed(2)} per game   captains wiped out by a tails: ${(S.wipeouts/S.games).toFixed(2)} per game`);
}
if (CAST) console.log(`  THE CAST: ${(S.casts / S.games).toFixed(1)} per game, ${(S.castRounds / Math.max(1,S.casts)).toFixed(2)} simultaneous press-rounds each  (that, not the flip count, is the table time)`);
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
