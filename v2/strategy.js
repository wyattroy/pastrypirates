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
// What that captain has publicly refused for that crate. Everyone watched, so everyone knows —
// this reads the game's ledger, not a private note, which is why one bot's rebuff teaches the
// whole table and not just the bot that got it.
const floorFor = (g, seat, ing) => g.floorFor(seat, ing);

// What a holder gives up: the crate, plus its denial value — and nobody sells the winning
// ingredient to the captain who is one crate from home.
function reservation(g, holder, ing, buyer) {
  if (g.needs(holder).includes(ing)) return 99;
  const rivals = g.players.filter(x => x !== holder && !x.done && g.needs(x).includes(ing)).length;
  let r = 2 + rivals + (g.board.tokens[ing] <= 0 ? 3 : 0);
  if (buyer) { const left = g.needs(buyer).length; if (left <= 1) r += 12; else if (left === 2) r += 5; }
  // A public refusal is evidence about a secret recipe — they would not hold out for nothing. It
  // raises what I think they will charge rather than crossing them off, so the same crate becomes
  // worth asking for again when my need grows or my purse does. And a refusal at 5 means 5 will
  // never do: the floor is a price the next offer has to beat.
  if (g.heldOut(holder.idx, ing)) r += 6;
  const floor = floorFor(g, holder.idx, ing);
  if (floor) r = Math.max(r, floor + 1);
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

      // ---------------------------------------------------------------------------------
      // WYATT'S PRINCIPLE (2026-08-04): don't give bots gates, give them logic a human would use.
      //
      // This used to be a priority ladder — check bake, then dock, then trade, then fight — and
      // every rung was a gate. Gates look reasonable written down and behave terribly in play: the
      // fight rung was unreachable because the trade rung returned first, so a laden rival was
      // adjacent on 46.5% of turns and the bot attacked on 1.4% of them. Nobody could see that from
      // reading the code, which is exactly the problem with gates.
      //
      // A captain does not run a checklist. They ask what each option is WORTH and take the best
      // one. So: price every legal action in coins, and pick the maximum. New actions slot in by
      // being valued, not by being inserted at the right rung, and nothing is ever unreachable.
      case "act": {
        const need = g.needs(p);
        // A crate you NEED is not a purchase, it is a fifth of the game. Pricing it at what it saves
        // you in coins undervalues it against anything that raises coins, and the bots churn deals
        // instead of sailing. PROGRESS is what a captain is actually buying.
        const PROGRESS = 14;
        const worth = (x) => {
          switch (x.a) {
            case "bake": return 1e6;                                  // this wins the game

            case "dock": {
              const treasure = 2;                                     // half of 4, at even odds
              // a stripped island still has sand to dig; that is all it has
              if (g.board.tokens[x.ing] <= 0) return treasure;
              const cost = g.priceOf(x.ing, p);
              const wanted = g.players.filter(q => q !== p && !q.done && g.needs(q).includes(x.ing)).length;
              const gain = need.includes(x.ing) ? PROGRESS : wanted * 2;
              // The flip comes FIRST, so heads can be what buys the crate. A captain three coins
              // short is not shut out of the dock, they are on even odds of affording it — which
              // is the whole reason the treasure is dug before the storehouse opens.
              const chance = p.coins >= cost ? 1 : (p.coins + 4 >= cost ? 0.5 : 0);
              return chance * (gain - cost) + treasure;
            }

            case "trade": {
              let best = 0;
              for (const i of need) {
                const holders = g.players.filter(q => q !== p && !q.done && q.ing.includes(i));
                if (!holders.length) continue;
                const ask = Math.min(...holders.map(q => reservation(g, q, i, p)));
                if (ask > p.coins) continue;                          // I cannot pay it, so it is worth nothing
                best = Math.max(best, PROGRESS - ask);
              }
              // Selling is only worth the gap it closes. Coin I do not need buys nothing, so a sale
              // that leaves me no better placed is worth nothing — which is what stops the churn.
              const wantCoin = need.length ? g.priceOf(need.find(i => g.board.tokens[i] > 0) || need[0], p) : 0;
              const shortBy = Math.max(0, wantCoin - p.coins);
              if (shortBy > 0) for (const i of p.ing.filter(j => !need.includes(j))) {
                const buyers = g.players.filter(q => q !== p && !q.done && g.needs(q).includes(i));
                if (buyers.length) best = Math.max(best, Math.min(shortBy, Math.max(...buyers.map(q => q.coins))) - buyers.length);
              }
              return best;
            }

            case "battle": {
              const q = g.players[x.target];
              const takeable = q.ing.filter(i => need.includes(i));
              if (!takeable.length) return 0;
              const prize = PROGRESS;                                 // same yardstick as dock and trade
              const stake = Math.min(p.coins, commitFor(g, p, q, crateValue(g, p, takeable[0])));
              if (stake < 1) return 0;
              return winChance(g, p, q, stake) * prize - stake;
            }

            case "cast": {
              // the ladder is fair at every rung, so my take is about 1 either way. What it is
              // WORTH is what that coin unlocks — nothing if I am not short — less the fact that it
              // pays every rival too, which is dearest when one of them is nearly home.
              const want = need.length ? g.priceOf(need.find(i => g.board.tokens[i] > 0) || need[0], p) : 0;
              const short = Math.max(0, want - p.coins);
              const helps = g.players.reduce((n, q) => n + (q !== p && !q.done && g.needs(q).length <= 1 ? 3 : 1), 0) - 1;
              return (short > 0 ? 2 + Math.min(short, 4) : 0.5) - helps * 0.5;
            }

            case "poach": return 2;                                   // a solo 2 that pays nobody else
            default: return 0.25;                                     // holding course is not nothing
          }
        };
        let best = null, bestV = -1e9;
        for (const x of req.options) { const v = worth(x); if (v > bestV) { bestV = v; best = x; } }
        return best || req.options[req.options.length - 1];
      }

      case "buy": {
        const { ing, cost } = req.options;
        if (g.needs(p).includes(ing)) return crateValue(g, p, ing) >= cost;
        // one I don't need is worth what denying it is worth, and what it will fetch in a deal
        const buyers = g.players.filter(q => q !== p && !q.done && g.needs(q).includes(ing));
        const resale = buyers.length ? Math.max(...buyers.map(q => Math.min(q.coins, crateValue(g, q, ing)))) : 0;
        return Math.max(resale, buyers.length * 2) >= cost && p.coins - cost >= 3;
      }

      case "offer": {
        const need = g.needs(p);
        let want = null, wv = -1, wantAsk = 0;
        for (const ing of need) {
          // No gate here either. A refusal raises what I think they will charge (see reservation),
          // so an ask that will not clear simply loses to a better option — and the same ask becomes
          // worth making again when my need grows or their price falls. That is how a human treats
          // "they said no last time", rather than never speaking to them again.
          const holders = g.players.filter(q => q !== p && !q.done && q.ing.includes(ing));
          if (!holders.length) continue;
          const ask = Math.min(...holders.map(q => reservation(g, q, ing, p)));
          const v = crateValue(g, p, ing) - ask;
          if (v > wv && ask <= p.coins) { wv = v; want = ing; wantAsk = ask; }
        }
        if (want !== null && want !== undefined) {
          const surplus = p.ing.filter(i => !need.includes(i));
          // a pair that has already been turned down in public is not on the table any more
          const swapWith = surplus.find(i => g.players.some(q => q !== p && !q.done && q.ing.includes(want)
            && g.needs(q).includes(i) && !g.swapRefused(q.idx, want, i)));
          if (swapWith) return { want, giveIng: swapWith };
          // Open at what the cheapest holder is believed to want, never below it. Since a public
          // refusal lifts that estimate above the price refused, a second captain asking for the
          // same crate necessarily calls a HIGHER number than the one that was just turned down —
          // which is the whole of "don't offer the same terms again", arrived at by pricing rather
          // than by a rule forbidding it.
          return { want, giveCoins: Math.min(p.coins, Math.max(1, wantAsk, Math.ceil(crateValue(g, p, want) * 0.6))) };
        }
        // nothing I need is on the table — sell surplus if I am short of coin
        const surplus = p.ing.filter(i => !need.includes(i));
        const nextCost = need.length ? g.priceOf(need.find(i => g.board.tokens[i] > 0) || need[0], p) : 0;
        if (surplus.length && p.coins < nextCost) {
          const sellable = surplus.find(i => g.players.some(q => q !== p && !q.done && g.needs(q).includes(i)));
          if (sellable) return { want: sellable, sale: true };
        }
        return { skip: true };
      }

      case "answer": {
        const { offer, from, rivals, callerCoins } = req.options;
        const buyer = g.players[from];
        if (offer.sale) {                                   // they are selling; what will I pay?
          const v = crateValue(g, p, offer.want);
          if (v < 2 || p.coins < 2) return { no: true };
          return { ask: Math.min(p.coins, Math.max(2, Math.floor(v * 0.7))) };
        }
        const res = reservation(g, p, offer.want, buyer);
        if (offer.giveIng) return g.needs(p).includes(offer.giveIng) && res < 99 ? { ask: 0 } : { no: true };
        const offered = offer.giveCoins | 0;
        // Their number is an opening bid, not a ceiling. Below my reservation I do not refuse — I
        // say what it would take, up to what they can actually pay. Refusing outright when the
        // first number is low is how a bot walks away from a deal a human would have haggled into.
        if (res > callerCoins) return { no: true };          // no price they could meet
        let ask = Math.max(1, res);
        // Shave only when somebody else could take this call instead — that is the whole point of
        // undercutting. With no rival, asking under their own offer is a gift.
        if (rivals > 0 && offered > ask) ask = Math.max(res, offered - 1);
        else if (offered > ask) ask = offered;               // they opened above me; take their number
        return { ask: Math.min(ask, callerCoins) };
      }

      case "pick": {
        const { answers, offer } = req.options;
        // Selling, the best answer is the HIGHEST bid; buying, the lowest ask. It minimised both
        // before, so a captain crying a sale handed their crate to whoever valued it least.
        const better = offer.sale ? (a, b) => a > b : (a, b) => a < b;
        let bi = 0; for (let i = 1; i < answers.length; i++) if (better(answers[i].ask, answers[bi].ask)) bi = i;
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
