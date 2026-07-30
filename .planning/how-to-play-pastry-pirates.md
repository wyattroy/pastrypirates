# How to play Pastry Pirates (agent playbook)

Written after joining Wyatt's multiplayer game as a guest, 2026-07-29. Records the mechanics that
actually matter, the mistakes I made, and the harness that works — so the next run starts competent.

## The win condition

Collect every ingredient in your recipe (5 of the 7 in play), then sail home to Tortuga **first**.
Finishing triggers a final lap: every other captain gets ONE more turn.

## The board

- 15×15, circular playable area. Home (Tortuga) is the centre, `[7,7]`.
- 7 ingredient islands, each with one dock square. Read them from `game.dockOf`.
- **The rim is the outer ring of playable cells (~40 of them).**

## Trade winds — the thing I missed, and it is big

The rim is divided into **4 arcs** that flow **clockwise**. Sail onto *any* cell of an arc and you are
swept, free, to that arc's **clockwise-most end** (`game.rimHead[x,y]`). Arc lengths are randomised
per game — one can span nearly half the rim, so a single move can cross the whole board.

**This is free travel. Always compare:**

```
direct cost      = waterRoute(me, dock)
via-the-rim cost = waterRoute(me, nearest cell of arc A) + waterRoute(head(A), dock)
```

Take the cheaper.

> **CORRECTION (2026-07-30) — do NOT use Manhattan distance here.** This section originally said
> `manhattan(...)`, and Wyatt caught me sailing a route that went the long way around an island
> because of it. Straight-line grid distance happily measures a path straight *through* land, so it
> under-estimates any route with an island between the two points and silently picks the wrong
> target.
>
> **Use the board's own reachability instead.** The guest's frozen game object still exposes the
> static board, so a plain BFS works and is cheap (177 valid cells):
>
> ```js
> const K=c=>c[0]+','+c[1];
> function waterRoute(from){                       // returns {"x,y": steps} for the whole board
>   const dist={[K(from)]:0}, q=[from];
>   while(q.length){
>     const c=q.shift(), d=dist[K(c)];
>     for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
>       const n=[c[0]+dx,c[1]+dy], k=K(n);
>       if(k in dist || !g.valid.has(k) || g.blocked(n)) continue;
>       dist[k]=d+1; q.push(n);
>     }
>   }
>   return dist;
> }
> ```
>
> `g.valid` is a 177-entry Set of playable cells and `g.blocked([x,y])` is true for land — both are
> static board data, so they stay correct on a guest even though `players[]` is frozen.
>
> Sanity note: on one measured turn all seven options scored identically under both methods, so the
> two agree often enough that the flaw hides. That is exactly why it needs replacing rather than
> spot-checking. In the 2026-07-29 game the arc heads were `1,10` · `0,5` · `11,1` · `10,13`, and
`10,13` sat 2 from cocoa and 5 from dairy — a huge shortcut into the south-east cluster.

It fires after a normal sail (`humanTurn`/`humanAct` both call `tradewind(p)`), not just on storm
pushes. Only when the board is round (`isRound`).

## Economy

| Action | Cost / gain |
|---|---|
| Sail | −1 coin (you cannot sail at 0) |
| Dock, heads | free crate |
| Dock, tails | buy the crate for 3, or take +3 |
| Dock, island empty | +3, no flip |
| Fish, heads | +2 |
| Fish, tails (sardine rule on) | +1 |
| Attack | −2 for powder |
| Trade bonus | +1 to **both** parties |

Start with 3 coins (staggered by turn order — later players get more). **Never strand yourself at
0 coins**: fish before you are broke, since fishing is the only unconditional earner.

Docking on tails: **buy the crate if you need it and can afford it.** Taking the 3 coins feels safe
but costs you a whole extra visit to that island.

## Storms

- 1 round in 8. Never 3 in a row (capped at 2).
- A storm pushes **2 squares, twice** — second leg always **perpendicular** to the first.
- Being on a dock, at home, or having just docked = sheltered, no push.
- Storm hits land → pay 1 to anchor, or flip: heads dodges, tails costs half your coins (or a
  crate, or your turn if you have nothing).

## Order of play each turn

1. Round header (wind/storm for everyone)
2. Your turn banner
3. Storm legs, if any — outcomes resolve per square
4. Sail (pick a highlighted square, or Stay put)
5. Action: Dock / Attack / Parley / Fish / Start bakery

## Strategy that follows from all this

1. Compute `need = recipe − held`.
2. For each needed ingredient, take the cheaper of direct vs via-rim. Go to the nearest.
3. Cluster the route — islands sit in rough groups; do a group, then use an arc to cross.
4. Dock whenever standing on a needed island. Buy on tails if affordable.
5. Fish at ≤1 coin.
6. Skip attacking early: 2 coins on a coin flip while you still need 5 crates is a bad trade.
   Reconsider only if someone is one ingredient from finishing.

## Harness notes (Chrome MCP, as a GUEST)

- **Same origin as the audit page.** NEVER `localStorage.clear()` — it would destroy the narration
  review. Set only `pp_id`.
- Unique `pp_id` before load or you rejoin as the host (all tabs share storage). Set it, then reload.
- **Guest boards render sail highlights WITHOUT the `.sailCell` class** — that class only exists in
  `localPickCell` (host/local). `remotePickHighlights` draws bare `<rect fill="#fdb63d" opacity=.4
  style="cursor:pointer">` with no class and no data attributes. **This cost me three turns of
  clicking "Stay put".** Detect by `cursor:pointer` / fill, and derive grid coords as
  `Math.round((x − 2) / cellPx)`.
- **Do not gate on reading your own name in the prompt** — the panel types out one character at a
  time, so you will see `"Ahoy, C"` and skip your turn. Gate on
  `#actionPanel.needsAction` instead; a guest only ever receives prompts meant for it.
- Poll on a ~600ms interval with a ~1.1s cooldown between actions; acting between tool calls is far
  too slow and you will miss turns.
- `window.__pp_app_state_debug()` exposes `.game` (players, dockOf, rimHead, tokens, home, round,
  windNow, stormNow), `mySeat`, `activeTurnSeat`, `timerOff`.
- The shot clock pauses when `document.hidden` — a tool-driven tab is fine **if it is in its own
  visible window** side by side, rather than a background tab.

## Mistakes to not repeat

1. Ignoring the trade winds. Free board-crossing travel, and I planned a 37-square route without it.
2. Selecting `.sailCell` as a guest. Silent — it just falls through to "Stay put".
3. Matching the player name in a half-typed prompt.
4. Acting only when a tool call happens, rather than on a timer.

## Coins beat movement — parley has NO distance limit

The single biggest thing I got wrong. `Game.tradeOpp()`:

```js
tradeOpp(p){
  if(this.cfg.parley) return this.players.filter(q=>q!==p && !q.done);   // EVERY captain, any distance
  return this.players.filter(q=>q!==p && !q.done && man(p.pos,q.pos)<=1); // dead — cfg.parley is hardcoded true
}
```

**So you can trade with anyone, anywhere, without moving.** The adjacency branch never runs.

Consequences:
- **Coins are portable ingredients.** Offer "coins only" and ask for the crate you need.
- **Fishing is unconditional income** (+2 heads / +1 tails). It needs no position, no target, no luck
  beyond the flip.
- Therefore **"fish up a purse, then buy the recipe off the table"** is a real line, and it may be
  stronger than sailing a 37-square route. I stumbled into the first half of it by accident —
  18 coins by round 14 while everyone else had 2–12 — and only then noticed I could spend them.
- Dock-on-tails costs 3 to buy the crate anyway. **A rich player's dock is a guaranteed ingredient;
  a poor player's is a coin flip.** Wealth converts a gamble into a purchase.

**Revised priority each action turn:**
1. Parley if anyone holds something you need and you can outbid — costs no movement at all.
2. Dock if you are standing on a needed island (and always BUY on tails if you can afford it).
3. Sail toward the nearest needed island, using the rim as free travel.
4. Fish — never a wasted turn; it is the engine that funds 1 and 2.

## Guest state is FROZEN — do not plan from `players[]`

On a guest, `__pp_app_state_debug().game.players[]` keeps its **starting** values forever: position,
coins and crates never update (the guest renders from broadcasts, it does not simulate). I planned
every route from my round-0 square for fourteen rounds while the snapshot insisted I had 3 coins and
was sitting at `[7,8]`.

- `game.events` **does** advance — that is live.
- The captains panel (`#players`) shows **live coin counts**.
- `game.dockOf`, `game.home`, `game.rimHead`, `recipe` are static, so they stay valid.

**Best fix: don't rely on knowing your own position.** The highlighted squares are already relative
to where you truly are, so pick the *needed island closest to any reachable square* and sail to that
square. Position-independent and always correct.

Ship elements report no usable coordinates either (`transform` is applied somewhere the obvious
traversal misses, and `x`/`y` read 0) — don't bother.
