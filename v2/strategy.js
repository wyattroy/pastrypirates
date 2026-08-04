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
        const trade = o.find(x => x.a === "trade");
        if (trade) {
          const worth = g.needs(p).some(i => {
            const holders = g.players.filter(q => q !== p && !q.done && q.ing.includes(i) && !wasRefused(p, q.idx, i));
            if (!holders.length) return false;
            return crateValue(g, p, i) >= Math.min(...holders.map(q => reservation(g, q, i, p)));
          });
          if (worth) return trade;
        }
        // guns only against someone who refused a deal in public
        const desperate = x => g.players[x.target].ing.some(i => g.needs(p).includes(i) && g.board.tokens[i] <= 0);
        const fight = o.filter(x => x.a === "battle")
          .find(x => (p.refused.has(x.target) && g.players[x.target].ing.some(i => g.needs(p).includes(i))) || desperate(x));
        if (fight && p.coins >= 2) return fight;
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
        const vital = q.ing.some(i => g.needs(p).includes(i) && g.board.tokens[i] <= 0);
        if (vital) return max;
        if (attacking) return Math.min(max, Math.max(1, Math.ceil(max * 0.6)));
        return Math.min(max, Math.max(1, Math.ceil(max * 0.5)));
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
