// Pastry Pirates v2 — the bot resolver.
//
// Implements .planning/research/BOT-STRATEGY.md against the v2 engine. A bot is just a resolver:
// it answers DecisionRequests. It contains NO rules — it cannot, because the engine holds them all.
//
// The one thing to get right, and the reason this file exists: everything is valued in TURNS, never
// in squares. A berth three squares upwind is two turns away; one six squares downwind is one turn.

import { DIRS, OPP, DK, K, man, PRICE } from "./engine.js";

/* ---------------------------------------------------------------- turn distance */

// The one-turn move graph for a given wind, cached per game. The board is static, so this is
// computed once per wind direction and then every distance question is a BFS over it.
function turnGraph(g, wind) {
  g.__tg = g.__tg || {};
  if (g.__tg[wind]) return g.__tg[wind];
  const graph = new Map(), ghost = { pos: null, power: null };
  for (const key of g.board.valid) {
    const c = key.split(",").map(Number);
    if (g.land(c)) continue;
    ghost.pos = c;
    const outs = new Set();
    for (const n of g.reachable(ghost)) {
      let dest = n;
      if (g.onRim(n)) { const h = g.rimHeadOf(n); if (h) dest = h; }
      outs.add(K(dest));
    }
    graph.set(key, [...outs]);
  }
  return (g.__tg[wind] = graph);
}
// The graph is NOT symmetric — the wind makes going somewhere cheaper than coming back — so
// "turns from me" and "turns to reach me" are different numbers and need different graphs.
function revGraph(g, wind) {
  g.__tgr = g.__tgr || {};
  if (g.__tgr[wind]) return g.__tgr[wind];
  const rev = new Map();
  for (const [from, outs] of turnGraph(g, wind)) for (const to of outs) {
    if (!rev.has(to)) rev.set(to, []);
    rev.get(to).push(from);
  }
  return (g.__tgr[wind] = rev);
}
function bfs(graph, start) {
  const dist = { [start]: 0 }; let fr = [start], t = 0;
  while (fr.length && t < 12) { t++; const nx = [];
    for (const k of fr) for (const nk of (graph.get(k) || [])) if (!(nk in dist)) { dist[nk] = t; nx.push(nk); }
    fr = nx; }
  return dist;
}
const turnsFrom = (g, cell, wind) => bfs(turnGraph(g, wind), K(cell));
const turnsTo = (g, cell, wind) => bfs(revGraph(g, wind), K(cell));
// square distance over water — used ONLY as a tiebreak inside a turn plateau
function squares(g, from) {
  const dist = { [K(from)]: 0 }, q = [from];
  while (q.length) { const c = q.shift(), d = dist[K(c)];
    for (const dk of DK) { const dd = DIRS[dk], n = [c[0] + dd[0], c[1] + dd[1]], k = K(n);
      if (k in dist || g.land(n)) continue; dist[k] = d + 1; q.push(n); } }
  return dist;
}

/* ---------------------------------------------------------------- valuations */

// "What would getting this another way cost me?" — the island's ladder price plus the turns of
// sailing, or a great deal more if it is off the board entirely.
function crateValue(g, p, ing) {
  if (!g.needs(p).includes(ing)) return 0;
  if (g.board.tokens[ing] <= 0) return 14;
  const t = turnsFrom(g, p.pos, g.windNow)[K(g.dockOf[ing])];
  return g.priceOf(ing, p) + Math.min(9, (t === undefined ? 6 : t) * 2);
}
// Have I already been turned down for this exact crate by this exact captain?
const wasRefused = (p, seat, ing) => p.refusedFor.has(seat + ":" + ing);
// A refusal is evidence about their secret recipe: they probably need it. That both stops the
// asking AND raises what I think they will charge — which is the negotiation layer the hidden
// recipe was always meant to have.
const believedToNeed = (p, seat, ing) => wasRefused(p, seat, ing);

// What a holder gives up: the crate, plus its denial value — and nobody sells the winning
// ingredient to the captain who is one crate from home.
function reservation(g, holder, ing, buyer) {
  if (g.needs(holder).includes(ing)) return 99;
  const rivals = g.players.filter(x => x !== holder && !x.done && g.needs(x).includes(ing)).length;
  let r = 2 + rivals + (g.board.tokens[ing] <= 0 ? 3 : 0);
  if (buyer) { const left = g.needs(buyer).length; if (left <= 1) r += 12; else if (left === 2) r += 5; }
  if (buyer && believedToNeed(buyer, holder.idx, ing)) r += 6;   // they turned me down before
  return r;
}

/* ---------------------------------------------------------------- combat */

// What will the other captain likely put up? They lose it either way, so nobody empties their purse
// unless the prize is worth it. Assume roughly half a purse, more if they are holding something
// they need themselves.
const likelyStake = (g, q) => Math.min(q.coins, Math.max(1, Math.round(q.coins * 0.55)));

// Downwind adds +1, and a tie on coins goes to the flip, then to the lighter hold.
function winChance(g, p, q, stake) {
  const dx = q.pos[0] - p.pos[0], dy = q.pos[1] - p.pos[1];
  const toward = DK.find(k => DIRS[k][0] === dx && DIRS[k][1] === dy);
  const away = DK.find(k => DIRS[k][0] === -dx && DIRS[k][1] === -dy);
  let mine = stake + (g.windNow === toward ? 1 : 0);
  const theirs = likelyStake(g, q) + (g.windNow === away ? 1 : 0);
  if (mine > theirs) return 0.88;                    // they could still surprise me
  if (mine < theirs) return 0.12;
  // level: one flip each, then the lighter hold wins
  return 0.5 + (p.ing.length < q.ing.length ? 0.12 : p.ing.length > q.ing.length ? -0.12 : 0);
}
// Commit enough to beat what they will probably show, but never more than the prize is worth.
function commitFor(g, p, q, prize) {
  const need = likelyStake(g, q) + 1;
  return Math.max(1, Math.min(p.coins, Math.min(need, Math.ceil(prize * 0.7))));
}

/* ---------------------------------------------------------------- routing */

// Cost, in turns, of a whole pickup route: me -> each berth in order -> home.
function routeCost(g, order, wind, fromMap) {
  let cost = 0, at = null;
  for (const ing of order) {
    const cell = K(g.dockOf[ing]);
    cost += (at === null ? fromMap[cell] : turnsFrom(g, g.dockOf[at], wind)[cell]) ?? 12;
    cost += 1;
    at = ing;
  }
  cost += (at === null ? fromMap[K(g.home)] : turnsFrom(g, g.dockOf[at], wind)[K(g.home)]) ?? 12;
  return cost;
}
const perms = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(r => [x, ...r]));
function bestRoute(g, need, wind, fromMap) {
  if (!need.length) return { order: [], cost: fromMap[K(g.home)] ?? 12 };
  const cands = need.length <= 5 ? perms(need) : [need];
  let best = cands[0], bc = 1e9;
  for (const o of cands) { const c = routeCost(g, o, wind, fromMap); if (c < bc) { bc = c; best = o; } }
  return { order: best, cost: bc };
}

/* ---------------------------------------------------------------- the resolver */

export function botResolver(g) {
  return function resolve(req) {
    const p = g.players[req.seat];
    switch (req.kind) {

      case "recipe": {
        // pick the card whose whole path is cheaper to sail from where I start
        const fromMap = turnsFrom(g, p.pos, g.windNext || "N");
        const cost = r => bestRoute(g, r.filter(i => g.board.tokens[i] > 0), g.windNext || "N", fromMap).cost;
        return cost(req.options[0]) <= cost(req.options[1]) ? 0 : 1;
      }

      case "power": {
        const pref = ["gambler", "shooter", "trader", "pilot", "trawler", "racer", "poacher", "wholesaler"];
        return pref.find(k => req.options.includes(k)) || req.options[0];
      }

      case "sail": {
        const need = g.needs(p);
        let target = g.home;
        if (need.length) {
          const stocked = need.filter(i => g.board.tokens[i] > 0);
          const fromMap = turnsFrom(g, p.pos, g.windNow);
          if (stocked.length) {
            const { order } = bestRoute(g, stocked, g.windNow, fromMap);
            if (order && order.length) target = g.dockOf[order[0]];
          } else {
            // it is off the board — the only routes left are trade and plunder, so find the holder
            const holders = g.players.filter(q => q !== p && !q.done && q.ing.some(i => need.includes(i)));
            if (holders.length) target = holders[0].pos;
          }
          // Closing on a laden ship is a legitimate voyage, not a detour of last resort. If a rival
          // is carrying something I need and is no further off than the island that stocks it, sail
          // at THEM. That is what makes battle a strategy rather than an accident of adjacency.
          const fromT = turnsFrom(g, p.pos, g.windNow);
          const here = fromT[K(target)] ?? 99;
          for (const q of g.players) {
            if (q === p || q.done || p.coins < 2) continue;
            if (!q.ing.some(i => need.includes(i))) continue;
            const d = fromT[K(q.pos)] ?? 99;
            if (d <= here) { target = q.pos; break; }
          }
        }
        const td = turnsTo(g, target, g.windNow), sq = squares(g, target);
        // turns decide; squares break ties and make progress within a turn (the plateau trap)
        const rank = c => ((td[K(c)] ?? 99) * 1000) + Math.min(999, sq[K(c)] ?? 999);
        let best = p.pos, bd = rank(p.pos);
        for (const c of req.options) { const d = rank(c); if (d < bd) { bd = d; best = c; } }
        return best;
      }

      case "act": {
        const o = req.options;
        const bake = o.find(x => x.a === "bake"); if (bake) return bake;
        const dock = o.find(x => x.a === "dock");
        if (dock && (g.needs(p).includes(dock.ing) || p.coins >= g.priceOf(dock.ing, p) + 6)) return dock;
        // Trade costs the action now, so only spend it when a deal genuinely beats sailing on:
        // somebody holds a crate I need, they have not already refused me for it, and fetching it
        // myself would cost more than the deal will.
        // What is a deal worth this turn? (the crate's value less what it will cost me)
        const trade = o.find(x => x.a === "trade");
        let tradeGain = 0;
        if (trade) for (const i of g.needs(p)) {
          const holders = g.players.filter(q => q !== p && !q.done && q.ing.includes(i) && !wasRefused(p, q.idx, i));
          if (!holders.length) continue;
          const ask = Math.min(...holders.map(q => reservation(g, q, i, p)));
          if (ask > p.coins) continue;
          tradeGain = Math.max(tradeGain, crateValue(g, p, i) - ask);
        }
        // guns only against someone who refused a deal in public
        // BATTLE IS A STRATEGY, NOT A LAST RESORT. This is a pirate game: if somebody beside you is
        // carrying a crate you need and you can afford the powder, taking it is a reasonable play and
        // the bot should make it. Judge it the way a captain would — what is the crate worth, how
        // likely am I to win, what does the powder cost me — and fight when that comes out ahead.
        let bestFight = null, bestGain = 0;
        for (const x of o.filter(y => y.a === "battle")) {
          const q = g.players[x.target];
          const prize = Math.max(0, ...q.ing.map(i => crateValue(g, p, i)));
          if (prize <= 0) continue;                       // nothing aboard I want
          const stake = Math.min(p.coins, commitFor(g, p, q, prize));
          if (stake < 1) continue;
          const gain = winChance(g, p, q, stake) * prize - stake;
          if (gain > bestGain) { bestGain = gain; bestFight = x; }
        }
        // A pirate weighs the two against each other. Taking it is a real option, not a fallback for
        // when nobody will deal — and it wins whenever the numbers say so.
        if (bestFight && bestGain >= tradeGain) return bestFight;
        if (trade && tradeGain > 0) return trade;
        if (bestFight) return bestFight;
        // call the cast only if genuinely short, and never if it arms a rival about to finish
        const cast = o.find(x => x.a === "cast");
        if (cast) {
          const need = g.needs(p);
          const want = need.length ? g.priceOf(need.find(i => g.board.tokens[i] > 0) || need[0], p) : 0;
          const arms = g.players.some(q => q !== p && !q.done && g.needs(q).length <= 1 && q.coins === want - 1);
          if (p.coins < want && !arms) return cast;
        }
        const poach = o.find(x => x.a === "poach");
        if (poach && p.coins < 4) return poach;
        if (dock) return dock;
        return o.find(x => x.a === "pass");
      }

      case "buy": {
        const { ing, cost, need } = req.options;
        if (need) return true;
        // buy what I don't need only as trade goods, and only if a rival wants it and I can spare it
        const wanted = g.players.some(q => q !== p && !q.done && g.needs(q).includes(ing));
        return wanted && p.coins >= cost + 6;
      }

      case "offer": {
        const need = g.needs(p);
        let want = null, wv = -1;
        for (const ing of need) {
          // only ask captains who have NOT already turned me down for this crate. Without this the
          // bot asks the same person for the same thing every round, which reads as advertising.
          const holders = g.players.filter(q => q !== p && !q.done && q.ing.includes(ing) && !wasRefused(p, q.idx, ing));
          if (!holders.length) continue;
          const v = crateValue(g, p, ing);
          if (v > wv) { wv = v; want = ing; }
        }
        if (want) {
          const surplus = p.ing.filter(i => !need.includes(i));
          const swapWith = surplus.find(i => g.players.some(q => q !== p && !q.done && q.ing.includes(want) && !wasRefused(p, q.idx, want) && g.needs(q).includes(i)));
          if (swapWith) return { want, giveIng: swapWith };
          return { want, giveCoins: Math.min(p.coins, Math.max(1, Math.floor(wv * 0.6))) };
        }
        // nothing I need is on the table — sell surplus if I am short of coin
        const surplus = p.ing.filter(i => !need.includes(i));
        const nextCost = need.length ? g.priceOf(need.find(i => g.board.tokens[i] > 0) || need[0], p) : 0;
        if (surplus.length && p.coins < nextCost) {
          const sellable = surplus.find(i => g.players.some(q => q !== p && !q.done && g.needs(q).includes(i) && !wasRefused(p, q.idx, i)));
          if (sellable) return { want: sellable, sale: true };
        }
        return { skip: true };
      }

      case "answer": {
        const { offer, from } = req.options;
        const buyer = g.players[from];
        if (offer.sale) {                                   // they are selling; what will I pay?
          const v = crateValue(g, p, offer.want);
          if (v < 2 || p.coins < 2) return { no: true };
          return { ask: Math.min(p.coins, Math.max(2, Math.floor(v * 0.7))) };
        }
        const res = reservation(g, p, offer.want, buyer);
        if (offer.giveIng) return g.needs(p).includes(offer.giveIng) && res < 99 ? { ask: 0 } : { no: true };
        const theirMax = offer.giveCoins | 0;
        if (res > theirMax) return { no: true };             // I will not deal at a price they'd pay
        return { ask: Math.max(1, res) };                    // the least I will take — that IS the undercut
      }

      case "pick": {
        const { answers } = req.options;
        let bi = 0; for (let i = 1; i < answers.length; i++) if (answers[i].ask < answers[bi].ask) bi = i;
        return bi;
      }

      case "commit": {
        const { max, foe, attacking } = req.options;
        const q = g.players[foe];
        // what is actually at stake for me here?
        const atRisk = attacking
          ? Math.max(0, ...q.ing.map(i => crateValue(g, p, i)))              // the crate I am after
          : Math.max(5, ...p.ing.map(i => g.needs(p).includes(i) ? crateValue(g, p, i) : 0));  // what I could lose
        if (q.ing.some(i => g.needs(p).includes(i) && g.board.tokens[i] <= 0)) return max;      // last one afloat
        return Math.min(max, commitFor(g, p, q, Math.max(atRisk, 4)));
      }

      case "spoils": {
        const { crates, coins, suggest } = req.options;
        const want = crates.find(i => g.needs(p).includes(i));
        if (want) return { ing: want };
        if (coins >= 4) return { coins: true };
        return crates.length ? { ing: suggest } : { coins: true };
      }

      case "call": {
        const { a, d } = req.options;
        return g.players[a].coins >= g.players[d].coins ? a : d;
      }

      case "cast": {
        // the ladder is EV-neutral at every rung, so the only sane rule is positional:
        // ride while the pot is short of what I need, take it the moment it covers the gap
        const { takes } = req.options;
        const need = g.needs(p);
        const want = need.length ? g.priceOf(need.find(i => g.board.tokens[i] > 0) || need[0], p) : 0;
        const gap = Math.max(1, want - p.coins);
        return takes < gap;
      }

      default: return null;
    }
  };
}
