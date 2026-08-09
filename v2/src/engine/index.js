// src/engine/index.js
//
// Phase 8 engine tier (D-03/D-04). Holds no DOM, `window`, Firebase,
// wall-clock, or unseeded-random access — pure simulation logic only.
// Imports from `../shared/index.js`; must never be imported BY
// `src/shared/` (shared is a leaf, engine depends on it, never the reverse).

import { mulberry32, ING_ALL, TET, DIRS, OPPOSITE, PERP, SAIL_RANGE, SAIL_RANGE_UPWIND, STORM_PUSH, SEA_CREATURES, man, ilabelImg } from "../shared/index.js";

// notes/edits #1a: roll a storm for the round, but never allow a 3rd in a row. Always consumes
// exactly one g.r() so the seeded RNG sequence stays identical live vs. host-refresh replay.
function rollStorm(g){
  const roll=g.r()<g.cfg.storm;
  const storm=(g.stormStreak||0)>=2?false:roll;
  g.stormStreak=storm?(g.stormStreak||0)+1:0;
  return storm;
}

// v2: bots are PLANNERS, not weighted gates (Wyatt, 2026-08-04: "don't give them gates, give them
// strategy"). Each bot builds a route through every ingredient it still needs, costed in TURNS —
// sail time under the committed wind forecast, plus the coins it must earn at the current crate
// price — and re-plans that whole route every turn as the wind, the stock and the prices move.
// See buildPlan() for the route, planStep() for what it does about this turn.
//
// The five archetypes survive as BIASES on that one planner, not as separate brains: same
// reasoning, different taste. Every multiplier below tilts a cost or a payoff the planner has
// already computed honestly, so a personality can change which plan wins but never makes a bot
// stop thinking. (Wyatt's ruling, 2026-08-04: "keep as biases on the planner".)
const PERSONALITY={
  // fightBias   : how much a bot discounts the turn-cost of taking a crate by force
  // dealBias    : how much it discounts the turn-cost of buying one off a rival
  // hoardBias   : appetite for crates it does NOT need, held purely as trade leverage
  // patience    : tolerance for a longer route that avoids a fight (low = impatient rusher)
  // tieBully    : break tied attack targets toward the weakest one
  pirate:     {fightBias:1.45,dealBias:0.70,hoardBias:0.8,patience:0.9,tieBully:true},
  trader:     {fightBias:0.45,dealBias:1.60,hoardBias:1.5,patience:1.2,tieBully:false},
  balanced:   {fightBias:0.95,dealBias:1.00,hoardBias:1.0,patience:1.0,tieBully:false},
  rusher:     {fightBias:0.30,dealBias:0.85,hoardBias:0.3,patience:0.6,tieBully:false},
  monopolist: {fightBias:1.05,dealBias:0.90,hoardBias:2.0,patience:1.1,tieBully:false},
};
// grudgeBonus is deliberately small — under the fish/dock baseline — so a revenge grudge can only
// tip a fight that already has some real stake behind it, never single-handedly justify one. Each
// battle re-arms a fresh grudge on whoever just lost, so a bigger bonus here would let two ships
// trade wins forever purely on narrative flavor, recreating the exact loop this system exists to
// prevent (confirmed by simulation before this was turned down from 3).
// notes/edits AI-02: windAdv/windDis weight the new wind advantage — firing downwind now wins a
// both-HEADS round, so a downwind attack is a real edge and an upwind one a real handicap.
// notes/edits AI-06: rematchEscalate breaks the fight-loop stalemates BATL-03 exposed. Pre-swap a
// winner moved away and broke adjacency for free; with no swap, two ships contesting each other's
// crates re-fought every ~4 rounds forever (games that ran the full 150-round cap with nobody ever
// finishing). A flat cooldown-scoped penalty didn't help — the cooldown lapsed and the duel resumed.
// So the penalty ESCALATES with how many times this exact pair has fought recently (see fightLog /
// recentFights): the first fight is free (still devious), each rematch hurts more, so a genuine
// one-off steal still wins but an endless grudge-duel prices itself out.
// Planner constants. Every one of these is denominated in TURNS, which is what makes the bot
// explainable: it compares "buying this crate costs me 4 turns" against "taking it by force costs
// me 2 turns and a fight I might lose" and picks the cheaper. Nothing here is a magic score.
const PLAN={
  // a dock flip pays 6 on heads, 2 on tails (rule 10), so a turn spent docking earns 4 on average
  coinsPerDockTurn:4,
  // one turn buys one flip; earning N coins therefore costs ceil(N / coinsPerDockTurn) turns
  fightTurns:2.2,      // sail-into-position + the fight itself, amortised over how often you win
  fightLossRisk:1.9,   // expected turns burned when a fight goes wrong (powder gone, crate not taken)
  tradeTurns:1.0,      // a trade is one action; the cost is what you give away, not the time
  unreachable:99,      // sentinel "no route exists" cost — always loses to any real plan
  // AI-06 (carried from v1): an escalating brake on re-fighting the same ship. The first fight is
  // free; each recent rematch adds this many turns to the fight's cost, so a grudge-duel prices
  // itself out instead of running forever. This was the single biggest source of 150-round
  // stalemates in v1 and the mechanism is still needed under the planner.
  rematchEscalate:1.6,
  // being downwind of your target is a real edge in a v2 one-round battle (rule 9: both-heads goes
  // to the downwind ship), so the planner prices the wind into every fight it considers
  windEdge:0.8,
  // holding a crate a rival needs is leverage — worth this many turns of a bot's own time
  leverageTurns:1.1,
  // Storm lookahead, in stepToward's own units (a whole step of real distance is 1000). With the
  // lost turn gone a storm can no longer punish a bot, only displace it — so what it now avoids is
  // being shoved against land and losing the ground it just made, and what it courts is a berth
  // the storm will park it in for free. Both are worth about a square of progress, no more; price
  // them higher and a bot cowers instead of sailing.
  // how much a bot cares, per square, about where the forecast storm will leave it. Deliberately
  // a quarter of a step: enough to break a tie toward a favourable shove, never enough to walk
  // away from an island it needs.
  stormDrift:250,
  // ---- HUNTING THE LEADER (v2.1, Wyatt 2026-08-06: "they should attack people if they are about
  // to win, they should factor in others' proximity to winning and guess where they may be trying
  // to go"). Measured before: bots fought 1.77 times a game, 23% of games had no battle at all, and
  // the planner chose "take" for only 5.5% of legs — while ~29 turns a game went by with somebody
  // already one crate from a full recipe. The leader was simply invisible to a planner that costs
  // everything in turns-to-MY-recipe.
  crateTurns:2.5,     // assumed turns to land one more crate, for the PUBLIC threat estimate
  threatHorizon:8,    // a rival this many estimated turns from victory registers at urgency 0;
                      // urgency climbs to 1 as that estimate falls to nothing
  huntWeight:1.2,     // how much full urgency discounts a fight, before the archetype's own bias
  denialTurns:5,      // what stopping a captain on the brink is worth in a bot's OWN turns, at
                      // full urgency — this is what lets it raid cargo it has no use for
  interceptLead:2,    // squares to aim AHEAD of a fleeing leader, along their path home
  huntReach:2,        // a raid is only ever PLANNED against a leader this many sail-turns away —
                      // the leash that stops a bot abandoning its own voyage to stalk across the map
};

class Game{
  constructor(cfg,seed,record){
    this.cfg=cfg; this.record=record; this.rng=mulberry32(seed);
    this.seed=seed; this.randCalls=0;
    const n=cfg.grid; this.home=[Math.floor(n/2),Math.floor(n/2)];
    // --- round world: pixelated circle + trade-wind rim channel ---
    this.isRound=!!cfg.roundBoard;
    this.valid=new Set(); this.rim=new Set(); this.rimHead={};
    if(this.isRound){
      const cc=(n-1)/2, r2=(cc+0.4)*(cc+0.4);
      for(let x=0;x<n;x++)for(let y=0;y<n;y++)
        if((x-cc)*(x-cc)+(y-cc)*(y-cc)<=r2)this.valid.add(x+","+y);
      for(const k of this.valid){
        const [x,y]=k.split(",").map(Number);
        for(const d of Object.values(DIRS)){
          const ox=x+d[0],oy=y+d[1];
          if(ox<0||oy<0||ox>=n||oy>=n||!this.valid.has(ox+","+oy)){this.rim.add(k);break;}
        }
      }
      // quadrants flow CLOCKWISE (each arc carries you to its own clockwise-most end).
      // Arc lengths are randomized per game (min 3 cells each, rest distributed randomly)
      // instead of 4 fixed 90° slices, so the whirlpool layout — and how far a shortcut
      // carries you — varies game to game; occasionally one arc spans nearly half the rim.
      const sorted=[...this.rim].map(k=>{
        const [x,y]=k.split(",").map(Number);
        const deg=(Math.atan2(y-cc,x-cc)*180/Math.PI+360)%360; // true geometric angle, used for arrow rendering
        return {k,x,y,deg};
      }).sort((a,b)=>a.deg-b.deg);
      const total=sorted.length,nArcs=4;
      const startIdx=Math.floor(this.r()*total); // random rotation of the whole layout
      const ring=sorted.slice(startIdx).concat(sorted.slice(0,startIdx));
      const minLen=Math.min(3,Math.floor(total/nArcs));
      const remaining=Math.max(0,total-minLen*nArcs);
      const cuts=[0,1,2].map(()=>Math.floor(this.r()*(remaining+1))).sort((a,b)=>a-b);
      const lens=[cuts[0],cuts[1]-cuts[0],cuts[2]-cuts[1],remaining-cuts[2]].map(e=>e+minLen);
      const cells=[];
      let idx=0;
      for(let q=0;q<nArcs;q++)for(let i=0;i<lens[q];i++)cells.push({...ring[idx++],q});
      const heads={};
      for(const c of cells)heads[c.q]=c; // last cell in each arc is its clockwise-most end
      for(const c of cells)this.rimHead[c.k]=[heads[c.q].x,heads[c.q].y];
      this.rimCellInfo=cells; // kept for rendering flow arrows
    }
    this.ings=ING_ALL.slice(0,cfg.nIslands);
    // island placement (rectangles of islandW x islandH)
    const iw=cfg.islandW||1, ih=cfg.islandH||1;
    const shapeFor=()=>{
      if(!cfg.tetris){
        const flip=this.r()<.5, w=flip?ih:iw, h=flip?iw:ih;
        const s=[];for(let a=0;a<w;a++)for(let b=0;b<h;b++)s.push([a,b]);
        return {cells:s,shapeIdx:-1,rot:0,flip:false}; // no TET art mapping in rectangle mode
      }
      const shapeIdx=Math.floor(this.r()*TET.length);
      let s=TET[shapeIdx].map(c=>[...c]);
      const rot=Math.floor(this.r()*4);
      for(let t=0;t<rot;t++)s=s.map(([x,y])=>[y,-x]);
      const flip=this.r()<.5;
      if(flip)s=s.map(([x,y])=>[-x,y]);
      const mx=Math.min(...s.map(c=>c[0])),my=Math.min(...s.map(c=>c[1]));
      return {cells:s.map(([x,y])=>[x-mx,y-my]),shapeIdx,rot,flip};
    };
    const rects=[],rectsMeta=[];
    for(let k=0;k<this.ings.length;k++){
      let done=false;
      // ORDER IS LOAD-BEARING — each iteration of this loop calls shapeFor(), which consumes
      // two to four this.r() calls; reordering [3,2,1] changes how many draws are consumed
      // and in what sequence before an island position is finalised.
      for(const spacing of [3,2,1]){
        const tops=[]; for(let x=0;x<n;x++)for(let y=0;y<n;y++)tops.push([x,y]);
        this.shuffle(tops);
        for(const [x,y] of tops){
          const{cells:shape,shapeIdx,rot,flip}=shapeFor();
          const cellsR=shape.map(([a,b])=>[x+a,y+b]);
          if(cellsR.some(c=>c[0]>=n||c[1]>=n))continue;
          if(cellsR.some(c=>man(c,this.home)<2))continue;
          if(this.isRound&&cellsR.some(c=>{
            const k=c[0]+","+c[1];
            if(!this.valid.has(k)||this.rim.has(k))return true;
            // keep a 1-square water lane between every island and the trade winds
            return Object.values(DIRS).some(d=>this.rim.has((c[0]+d[0])+","+(c[1]+d[1])));
          }))continue;
          if(cellsR.some(c=>rects.some(r2=>r2.some(d=>man(c,d)<spacing))))continue;
          rects.push(cellsR);rectsMeta.push({shapeIdx,rot,flip});done=true;break;
        }
        if(done)break;
      }
    }
    this.islands={}; this.islandRect={}; this.islandShapeMeta={}; this.dockOf={}; this.islandOf={};
    this.ings.forEach((ing,i)=>{
      const cellsR=rects[i]||[[0,0]];
      this.islandRect[ing]=cellsR;
      this.islandShapeMeta[ing]=rectsMeta[i]||{shapeIdx:-1,rot:0,flip:false};
      for(const c of cellsR)this.islands[c]=ing;
    });
    if(cfg.singleDock){
      // a dock must be reachable by actually sailing there from home — not just have one
      // open neighbor. Rim (trade-wind) cells are never a valid stopping point (the wind
      // sweeps you off them before you can act), so flood-fill open water from home,
      // treating the rim as impassable, exactly like the game's own routing already does.
      const passable=c=>!this.blocked(c)&&!this.onRim(c)&&this.islands[c[0]+","+c[1]]===undefined;
      const homeReach=new Set([this.home[0]+","+this.home[1]]);
      const bq=[this.home];
      while(bq.length){
        const c=bq.shift();
        for(const d of Object.values(DIRS)){
          const o=[c[0]+d[0],c[1]+d[1]],k=o[0]+","+o[1];
          if(homeReach.has(k)||!passable(o))continue;
          homeReach.add(k);bq.push(o);
        }
      }
      // claimed cells are excluded from later ingredients' candidate pools so two docks can
      // never land on the same tile (each ingredient used to pick independently, so two
      // adjacent islands could both roll the one open-water cell they share). Seeded with the
      // 4 Tortuga home-berth cells (same DIRS iteration the renderer uses) so an island's dock
      // can never overlap a home berth either.
      const claimed=new Set();
      for(const d of Object.values(DIRS)){
        const hx=this.home[0]+d[0],hy=this.home[1]+d[1];
        if(hx<0||hy<0||hx>=n||hy>=n)continue;
        claimed.add(hx+","+hy);
      }
      for(const ing of this.ings){
        const waters=[];
        for(const c of this.islandRect[ing]){
          for(const d of Object.values(DIRS)){
            const w2=[c[0]+d[0],c[1]+d[1]];
            if(!this.blocked(w2)&&!this.onRim(w2)&&this.islands[w2]===undefined
               &&!(w2[0]===this.home[0]&&w2[1]===this.home[1]))waters.push(w2);
          }
        }
        const open=waters.filter(w=>homeReach.has(w[0]+","+w[1]));
        const free=w=>!claimed.has(w[0]+","+w[1]);
        let pool=open.filter(free);
        if(!pool.length)pool=waters.filter(free);
        if(!pool.length)pool=open.length?open:waters; // last resort: every candidate is taken
        const chosen=pool.length?pool[Math.floor(this.r()*pool.length)]:this.home;
        this.dockOf[ing]=chosen;
        claimed.add(chosen[0]+","+chosen[1]);
      }
    }
    this.dockCells=new Set(Object.values(this.dockOf).map(c=>c[0]+","+c[1]));
    this.ings.forEach(ing=>{this.islandOf[ing]=cfg.singleDock?this.dockOf[ing]:this.islandRect[ing][0];});
    const tok=cfg.crates===0?1e9:cfg.crates;
    this.tokens={}; this.ings.forEach(i=>this.tokens[i]=tok);
    this.players=cfg.strategies.map((s,i)=>{
      // two candidate recipe cards to choose from at game start (draft phase)
      const a=this.sample(this.ings,cfg.recipeSize);
      let b=this.sample(this.ings,cfg.recipeSize);
      let tries=0;
      while(tries++<20&&a.slice().sort().join()===b.slice().sort().join())b=this.sample(this.ings,cfg.recipeSize);
      return {idx:i,strategy:s,pos:[...this.home],coins:cfg.startCoins,
        ing:[],recipe:a,recipeChoices:[a,b],firstFlip:new Set(),dockedNow:new Set(),
        done:false,heads:0,flips:0,corner:null,justDocked:false,shipwrecked:false,
        coolUntil:{},grudge:null,justLost:null,fightLog:{}};
    });
    // ships start at Isle of Tortuga's four docks (N/S/E/W of the island)
    const dirsArr=Object.values(DIRS);
    this.players.forEach((p,i)=>{const d=dirsArr[i%4];
      p.pos=[this.home[0]+d[0],this.home[1]+d[1]];});
    // monopolists pick the most-demanded scarce ingredient to corner
    if(cfg.crates>=1&&cfg.crates<1e9){
      for(const p of this.players){
        if(p.strategy!=="monopolist")continue;
        const demand=ing=>this.players.filter(q=>q!==p&&q.recipe.includes(ing)).length;
        p.corner=this.ings.slice().sort((x,y)=>
          (demand(y)-demand(x))||((p.recipe.includes(y)?1:0)-(p.recipe.includes(x)?1:0)))[0];
      }
    }
    this.round=0;this.battles=0;this.attWins=0;this.trades=0;this.finishOrder=[];this.events=[];this.winner=null;
    // v2 bot AI: public evidence of what each captain has been chasing (see noteDemand/demandFor).
    // Never contains anybody's recipe — only actions the whole table watched happen.
    this.demand=this.players.map(()=>({}));
    this.stormStreak=0; // notes/edits #1a: consecutive-storm counter — caps storms at 2 back-to-back
    // notes/edits NARR-04: how many rounds running the wind has held one direction (1 = first round
    // of it). Separate from stormStreak, which exists to CAP repeat storms — this one is purely
    // narration and counts calm rounds too.
    this.windStreak=0;this.windPrev=null;
  }
  r(){this.randCalls++;return this.rng();}
  isHome(c){return c[0]===this.home[0]&&c[1]===this.home[1];}
  shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(this.r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
  sample(a,k){const c=[...a];this.shuffle(c);return c.slice(0,k);}
  flip(p){p.flips++;const h=this.r()<.5;if(h)p.heads++;return h;}
  key(c){return c[0]+","+c[1];}
  isIsland(c){return this.islands[c]!==undefined;}
  ev(o){if(!this.record)return;o.round=this.round;o.wind=this.windNow;o.storm=this.stormNow;o.wind2=this.windNow2;
    o.state=this.players.map(p=>({pos:[...p.pos],coins:p.coins,ing:[...p.ing],done:p.done}));
    o.tokens={...this.tokens};this.events.push(o);}
  // during a reload-replay, fast-forwarding has no real delays between turns, and a bot's turn
  // can occasionally run a beat before its own recipe assignment has landed — treat "no recipe
  // yet" as "needs nothing" rather than throwing, since it resolves itself a tick later anyway
  needs(p){return p.recipe?p.recipe.filter(i=>!p.ing.includes(i)):[];}
  /* ===== v2 bot AI: public-information inference =====
     Bots see ONLY what a player sees (Wyatt's ruling, 2026-08-04) — never a rival's secret recipe
     card. What they DO see is public and sitting on the table: which crate somebody paid for, what
     somebody asked for in an open trade, and what they were willing to fight over. `demand`
     accumulates exactly that evidence, and demandFor() turns it into the same read a human makes
     across the table. Deliberately NOT derived from q.recipe anywhere. */
  noteDemand(q,ing,weight){
    if(!this.demand||q==null)return;
    const d=this.demand[q.idx!==undefined?q.idx:q];
    if(!d)return;
    d[ing]=(d[ing]||0)+(weight===undefined?1:weight);
  }
  demandFor(q,ing){
    if(q.ing.includes(ing))return 0; // they already hold it, and no recipe asks for two of a thing
    // the bare prior: a rival's recipe covers recipeSize of the ingredients in play, so before any
    // evidence at all there is already a decent chance they want any given crate
    const prior=this.cfg.recipeSize/Math.max(1,this.ings.length);
    const seen=(this.demand&&this.demand[q.idx]&&this.demand[q.idx][ing])||0;
    return Math.min(1,prior*0.9+0.3*seen);
  }
  // "I'm fairly sure they want this" — the prior alone is never enough; it takes seeing them
  // chase it at least once.
  likelyNeeds(q,ing){return this.demandFor(q,ing)>=0.8;}
  // How close does a rival LOOK to finishing, judged only from the crates visible in their hold?
  // Drives the denial premium in trade pricing (Wyatt: charge more when the asker is nearly done).
  visibleProgress(q){
    const size=this.cfg.recipeSize||5;
    const distinct=new Set(q.ing).size;
    return Math.min(1,distinct/size);
  }
  blocked(c){const n=this.cfg.grid;
    if(c[0]<0||c[1]<0||c[0]>=n||c[1]>=n)return true;
    return this.isRound&&!this.valid.has(c[0]+","+c[1]);}
  onRim(c){return this.isRound&&this.rim.has(c[0]+","+c[1]);}
  tradewind(p){ // entering the rim channel sweeps you to the head of that quadrant
    if(!this.isRound)return false;
    const head=this.rimHead[p.pos[0]+","+p.pos[1]];
    if(head&&(head[0]!==p.pos[0]||head[1]!==p.pos[1])){
      p.pos=[...head];this.ev({t:"tradewind",p:p.idx});return true;
    }
    return false;
  }
  // D-21: the FIRST matching cause, same precedence moored()'s || chain already used — null when
  // none match. moored() is now defined in terms of this, not a parallel rule.
  mooredReason(p){
    if(p.justDocked)return "justDocked";
    if(this.cfg.singleDock&&this.adjPort(p)!==null)return "dock";
    if(man(p.pos,this.home)<=1)return "home";
    return null;
  }
  moored(p){ // ships that DOCKED last turn (or sit at a berth / Isle of Tortuga) can't be wind-forced into land
    return this.mooredReason(p)!==null;
  }
  // v2 rule 1: how far this ship may sail if its route stays off the wind's nose, and how far if
  // it touches upwind even once. The lee is gone entirely — an island upwind does nothing now.
  sailRange(){return SAIL_RANGE;}
  sailRangeUpwind(){return SAIL_RANGE_UPWIND;}
  // Is this heading directly into the wind? Crosswind is NOT upwind (rule 1b).
  isUpwindStep(dirKey){return dirKey===OPPOSITE[this.windNow];}

  // v2 rules 7+8. One direction, STORM_PUSH squares, and the ONLY things that stop you are land,
  // another ship, and the rim. The whole v1 aground ladder — pay-to-dodge, flip-to-anchor,
  // lose-half-your-coins, lose-a-crate, shipwreck — is deleted: you could see this coming a round
  // ahead on the compass (rule 6), so the price of being caught is simply your turn.
  //
  // Returns an outcome string the caller narrates and acts on:
  //   "moved"    — pushed clear, turn intact
  //   "aground"  — stopped short of land; the whole turn is forfeit (rule 8a)
  //   "held"     — stopped short of another ship (or an occupied berth); turn INTACT. Wyatt's
  //                ruling 2026-08-04: an occupied dock is a ship in the way, so you strike sail
  //                and hold fast — that is the existing blocked behaviour, not running aground.
  //   "docked"   — the push put you in an open berth, which saves you (rule 8b/8d): you stop
  //                there, count as moored, and KEEP your turn.
  //   "swept"    — carried into the rim and away on the trade winds
  /* ONE square of a storm push.

     v2.1 SIMPLIFICATION (Wyatt, 2026-08-05). The storm used to have five outcomes and a whole
     vocabulary of docks: blown INTO a berth caught you, the berth you were ALREADY at held you,
     an occupied berth stopped you, land grounded you and cost your turn. Three of those were
     about docks, and "dock" meant something different in each — which is exactly why two bugs in
     the same family surfaced in one session.

     Now there is one sentence: LAND AND OTHER SHIPS STOP YE SHORT. Nobody loses a turn, and docks
     need no storm rule at all — they are simply water the storm can push you onto or off.

     What that gives up is nothing the game was relying on. Measured over 150 games: a storm still
     moves each ship 3.05 squares on average, which is most of a full turn's sailing, and still
     flings a ship into the trade-wind rim roughly 0.85 times per storm. Deleting the lost turn
     changed the median game length by zero rounds. The punishment was carrying the edge cases;
     the drama was always in the displacement. */
  stormStep(p,dirKey){
    const d=DIRS[dirKey];
    const nx=[p.pos[0]+d[0],p.pos[1]+d[1]];
    // the edge of the world is land like any other
    if(this.blocked(nx))return "landHeld";
    // another ship holds that square — you strike sail and hold fast behind her
    const blocker=this.players.find(q=>q!==p&&!q.done&&q.pos[0]===nx[0]&&q.pos[1]===nx[1]);
    if(blocker){this.ev({t:"blocked",p:p.idx,other:blocker.idx});return "held";}
    // land dead ahead — you fetch up short of it, no harm beyond losing the ground. Distinct from
    // "held" (another ship) so the anchor line can be narrated: this is the moment a captain drops
    // anchor rather than be driven onto the rocks, and it was silent until now.
    if(this.isIsland(nx)||this.isHome(nx))return "landHeld";
    p.pos=nx;
    if(this.onRim(nx)){this.tradewind(p);return "swept";}
    return "moved";
  }
  stormPush(p,dirKey,dist){
    let outcome="moved";
    for(let s=0;s<dist;s++){
      outcome=this.stormStep(p,dirKey);
      if(outcome!=="moved")return outcome;
    }
    return outcome;
  }
  // The bookkeeping and narration event for one ship's storm outcome — shared by the headless
  // runStorm() and the live animated push, so bots and humans can never drift apart on the rule.
  // With the lost turn gone there is nothing to forfeit and nothing to rescue: a ship either moved
  // or it did not, and a ship that ends on a berth is docked there like any other way of arriving.
  noteStormOutcome(p,outcome,moved,wasDocked){
    // Land brought the ship up short — whether it moved first or was pinned from the start. This
    // is the anchor moment, and Wyatt asked for the line back: *"I want the narration lines about
    // 'dropped anchor to avoid running aground' to remain."* Under v2.1 nothing runs aground any
    // more, so the line reports what the anchor SAVED you from rather than a penalty it dodged.
    if(outcome==="landHeld"){this.ev({t:"anchorHold",p:p.idx,moved:moved?1:0});return;}
    if(!moved)return;
    p.justDocked=this.isBerth(p.pos);
    if(outcome!=="swept")this.ev({t:wasDocked&&!p.justDocked?"blownOut":"windmove",p:p.idx});
  }
  // Ships in the order the storm reaches them: furthest downwind first, so the lead ship clears
  // its square before the one behind arrives (rule 7b).
  stormOrder(dirKey){
    const d=DIRS[dirKey];
    return this.players.filter(p=>!p.done)
      .map(p=>({p,proj:p.pos[0]*d[0]+p.pos[1]*d[1]}))
      .sort((a,b)=>b.proj-a.proj).map(o=>o.p);
  }
  // v2 rule 1 reachability, shared by the engine and (via reachableFrom) the UI's highlighting.
  // Breadth-first over states of (cell, hasGoneUpwind): a route is legal when it stayed off the
  // wind's nose and is <= SAIL_RANGE long, OR touched upwind and is <= SAIL_RANGE_UPWIND long.
  // You may sail PAST other ships but never END on one, so occupied cells expand but don't land.
  //
  // `opts.throughRim` lets a caller keep the rim as a legal destination (a human may deliberately
  // ride the trade winds); bots pass it false and stay out of the channel except via rimEscape().
  sailStates(p,opts){
    opts=opts||{};
    const maxOpen=this.sailRange(),maxUp=this.sailRangeUpwind();
    const passable=o=>{
      if(this.blocked(o))return false;
      if(this.isIsland(o)||this.isHome(o))return false;
      if(!opts.throughRim&&this.onRim(o))return false;
      return true;
    };
    const occ=o=>this.players.some(q=>q!==p&&!q.done&&q.pos[0]===o[0]&&q.pos[1]===o[1]);
    const k=(c,u)=>c[0]+","+c[1]+","+(u?1:0);
    const seen={[k(p.pos,false)]:0};
    const out=new Map(); // "x,y" -> fewest steps to reach it legally
    const q=[[p.pos,false,0]];
    while(q.length){
      const [c,used,n]=q.shift();
      const limit=used?maxUp:maxOpen;
      if(n>=limit)continue;
      for(const dk of Object.keys(DIRS)){
        const d=DIRS[dk];
        const o=[c[0]+d[0],c[1]+d[1]];
        if(!passable(o))continue;
        const u2=used||this.isUpwindStep(dk);
        const n2=n+1;
        if(n2>(u2?maxUp:maxOpen))continue;
        const kk=k(o,u2);
        if(seen[kk]!==undefined&&seen[kk]<=n2)continue;
        seen[kk]=n2;
        const ck=o[0]+","+o[1];
        // a cell you may legally FINISH on: not another ship's square
        if(!occ(o)&&(!out.has(ck)||out.get(ck)>n2))out.set(ck,n2);
        // the rim sweeps you away the instant you touch it — never a staging post
        if(this.onRim(o))continue;
        q.push([o,u2,n2]);
      }
    }
    out.delete(p.pos[0]+","+p.pos[1]);
    return out;
  }
  // How far every water square is from `target`, sailing around the islands rather than through
  // them — a plain BFS flood, wind ignored (wind prices how FAR you get in a turn, not which
  // routes exist). Manhattan distance is a liar next to land: a dock two squares away round the
  // corner of its own island can be four squares of actual sailing, and scoring candidate moves
  // on Manhattan makes a bot refuse every move that does not shorten a line it cannot travel.
  // That regression left a third of all bot turns doing nothing at all; v1's Dijkstra had it right.
  waterField(target){
    const k=target[0]+","+target[1];
    if(this._fieldKey===k&&this._fieldRound===this.round&&this._field)return this._field;
    const dist={[k]:0},q=[target];
    while(q.length){
      const c=q.shift(),dc=dist[c[0]+","+c[1]];
      for(const d of Object.values(DIRS)){
        const o=[c[0]+d[0],c[1]+d[1]],ok=o[0]+","+o[1];
        if(dist[ok]!==undefined)continue;
        if(this.blocked(o))continue;
        // land is impassable, but the TARGET itself may legitimately be a dock beside it
        if(this.isIsland(o)||this.isHome(o))continue;
        dist[ok]=dc+1;q.push(o);
      }
    }
    this._field=dist;this._fieldKey=k;this._fieldRound=this.round;
    return dist;
  }
  /* v2 rules 6 + 8. The compass commits next round's wind a FULL ROUND early and rule 6d
     promises the forecast is never wrong — so a captain who is paying attention can see a storm
     coming and place themselves for it. stormOutcomeFrom() used to answer "would this square
     ground me?"; v2.1 removed grounding, so the question became "where will the shove leave me?"
     and stormLanding() below answers that instead. The old helper is deleted rather than left
     unused. */
  // WHERE the forecast storm will actually leave a ship that ends its move on `cell`. Other ships
  // are not modelled — nobody can know where they will be next round, and being stopped by one is
  // harmless anyway.
  // v2.1: reads forecastWind(), NOT windNext — which means that while the forecast hides the storm's
  // direction this returns `cell` unchanged, the drift below is 0, and the bot plans the storm
  // exactly as blindly as the player does. Deliberately left standing rather than deleted: it is one
  // line from working again if the forecast ever shows direction, and gating it is what keeps the
  // bots honest instead of merely uninformed.
  stormLanding(cell){
    const dir=this.forecastWind();
    if(!this.stormNext||!dir)return cell;
    const d=DIRS[dir];
    let c=[cell[0],cell[1]];
    for(let s=0;s<STORM_PUSH;s++){
      const nx=[c[0]+d[0],c[1]+d[1]];
      if(this.blocked(nx)||this.isIsland(nx)||this.isHome(nx))return c;
      c=nx;
      if(this.onRim(c)){const h=this.rimHead[c[0]+","+c[1]];return h?[h[0],h[1]]:c;}
    }
    return c;
  }
  /* ---- READING THE LEADER, FROM PUBLIC EVIDENCE ONLY (v2.1) ----
     threatTurns(q) estimates how many turns until q could plausibly win, using exactly what any
     captain at the table can see: how many DISTINCT crates they are carrying, and how far they are
     from home. It NEVER touches q.recipe. That constraint is the whole reason this is an estimate
     rather than a calculation — a bot that knew the recipe would know precisely when to strike, and
     would be playing a different game from the one at the table.
     Distinct crates, not total: a captain hoarding three sacks of cocoa is not two-thirds of the way
     to a recipe, and counting raw cargo would rate the biggest hoarder as the biggest threat. This
     can still overestimate (five distinct crates might be four of theirs plus a spare), which is the
     right direction to be wrong in — a bot that occasionally raids a captain who was not quite as
     close as they looked is playing the same guessing game a human plays. */
  threatTurns(q){
    if(q.done)return 0;
    const distinct=new Set(q.ing).size;
    const short=Math.max(0,(this.cfg.recipeSize||5)-distinct);
    return short*PLAN.crateTurns+this.sailTurns(q.pos,this.home,this.windNow);
  }
  // 0 = no threat worth acting on, rising to 1 as they close on victory. Every hunting decision
  // below reads this one number, so "how close is close" is tuned in ONE place (PLAN.threatHorizon).
  threatUrgency(q){
    return Math.max(0,Math.min(1,(PLAN.threatHorizon-this.threatTurns(q))/PLAN.threatHorizon));
  }
  /* Where to sail to CUT THEM OFF rather than chase them — Wyatt's "guess where they may be trying
     to go". No mind-reading is needed: a captain near the end of their recipe is sailing home, and
     home is the one destination every player at the table can see. So this walks a few squares down
     the water-distance field toward home from where they are now, and aims there.
     Aiming at their CURRENT square is what a stern chase looks like: you arrive where they were.
     PLAN.interceptLead squares of lead is enough to meet them, and short enough that a bot never
     abandons its own errand to camp the home port. */
  interceptOf(q){
    const field=this.waterField(this.home);
    let c=[q.pos[0],q.pos[1]];
    const lead=Math.min(PLAN.interceptLead,Math.max(0,Math.round(this.threatTurns(q))));
    for(let s=0;s<lead;s++){
      let best=null,bv=field[c[0]+","+c[1]];
      if(bv===undefined)break;
      for(const d of Object.values(DIRS)){
        const nx=[c[0]+d[0],c[1]+d[1]];
        const v=field[nx[0]+","+nx[1]];
        if(v!==undefined&&v<bv){bv=v;best=nx;}
      }
      if(!best)break;
      c=best;
    }
    return c;
  }
  // Move as close to `target` as this turn's sailing allows, measured in real sailing distance.
  // Ties break toward the shorter move, so a bot never burns its whole range drifting sideways
  // when it is already as close as it can get.
  stepToward(p,target){
    const cells=this.sailStates(p);
    if(!cells.size)return false;
    const field=this.waterField(target);
    const here=field[p.pos[0]+","+p.pos[1]];
    const cur=here===undefined?man(p.pos,target):here;
    let best=null,bestScore=Infinity;
    for(const [ck,n] of cells){
      const c=ck.split(",").map(Number);
      const fd=field[ck];
      // a square the flood never reached is cut off from the target — fall back to Manhattan so
      // it still ranks, just always behind anything genuinely connected
      const d=fd===undefined?man(c,target)+1000:fd;
      // Storm lookahead (rules 6 + 8). Running aground costs a WHOLE TURN, which is worth more
      // than a square or two of progress — so an unsafe berth is penalised by more than one step
      // of distance, and a bot will willingly end its move further from the island to keep its
      // next turn. A square the storm would blow into an open dock is a small BONUS: rule 8d says
      // you tie up safe there and keep the turn, so the storm does the sailing for you.
      // v2.1: being stopped by land is no longer a punishment to dodge — it is simply no movement,
      // and movement can help as easily as hurt (measured: the storm pushes a ship CLOSER to its
      // target 25% of the time and further 36%). So the bot no longer flees "blocked"; it scores
      // where the storm will actually leave it, and mildly prefers a square whose shove helps.
      // Weighted well under one step of real distance so it can never override reaching a dock.
      const land=this.stormLanding(c);
      const after=field[land[0]+","+land[1]];
      const drift=(after===undefined||fd===undefined)?0:(after-fd);
      const stormPenalty=drift*PLAN.stormDrift;
      const score=d*1000+n+stormPenalty;
      if(score<bestScore){bestScore=score;best=c;}
    }
    if(!best)return false;
    const bd=field[best[0]+","+best[1]];
    const bestDist=bd===undefined?man(best,target)+1000:bd;
    // nothing in range gets us any closer — hold position rather than drift for the sake of it
    if(bestDist>=cur)return false;
    p.pos=[...best];
    return true;
  }
  // AI-05: is this bot walled in — every orthogonal neighbour blocked, an island, home, occupied,
  // or the rim? (The rim counts as "not an ordinary move" because stepToward refuses it.) When
  // this is true a bot has no normal way out and used to just sit there turn after turn.
  boxedIn(p){
    return Object.values(DIRS).every(d=>{
      const o=[p.pos[0]+d[0],p.pos[1]+d[1]];
      return this.blocked(o)||this.isIsland(o)||this.isHome(o)||this.onRim(o)||
        this.players.some(q=>q!==p&&!q.done&&q.pos[0]===o[0]&&q.pos[1]===o[1]);
    });
  }
  // notes/edits AI-04/AI-05: a boxed-in bot may duck INTO the trade-wind channel to escape — the
  // rim sweeps it to that quadrant's head, unsticking it. Only ever used as a last resort (see
  // takeTurn), so normal play still keeps bots out of the current; this is the one time a bot
  // deliberately uses the trade winds the way a human can.
  rimEscape(p){
    if(!this.isRound)return false;
    for(const d of Object.values(DIRS)){
      const o=[p.pos[0]+d[0],p.pos[1]+d[1]];
      if(this.onRim(o)&&!this.blocked(o)&&!this.players.some(q=>q!==p&&!q.done&&q.pos[0]===o[0]&&q.pos[1]===o[1])){
        p.pos=o;this.ev({t:"windmove",p:p.idx});
        this.tradewind(p);
        return true;
      }
    }
    return false;
  }
  /* Is this square a berth a ship can tie up at? THE FOUR TORTUGA BERTHS COUNT.
     `dockCells` holds only the island docks, so a storm that shoved a ship onto a Tortuga berth
     did not recognise it as a rescue, carried on pushing into the island itself, and grounded the
     captain — losing them a turn while they sat in a berth. Wyatt, 2026-08-05: *"I was blown into
     a dock, on tortuga, which should be the same as every other dock."* He is right, and the rest
     of the engine already agrees: mooredReason() has always treated a Tortuga berth as a berth.
     Distance exactly 1 — the home square itself is land, not a berth. */
  isBerth(c){
    if(this.dockCells.has(c[0]+","+c[1]))return true;
    return man(c,this.home)===1;
  }
  adjPort(p){
    if(this.cfg.singleDock){
      for(const ing of this.ings){const d=this.dockOf[ing];
        if(p.pos[0]===d[0]&&p.pos[1]===d[1])return ing;}
      return null;
    }
    for(const d of Object.values(DIRS)){const c=[p.pos[0]+d[0],p.pos[1]+d[1]];
      if(this.isIsland(c))return this.islands[c];}
    return null;
  }
  dockOccupiedBy(ing,exclude){
    const d=this.dockOf[ing];if(!d)return null;
    for(const q of this.players)if(q!==exclude&&!q.done&&q.pos[0]===d[0]&&q.pos[1]===d[1])return q;
    return null;
  }
  adjOpp(p){const out=this.players.filter(q=>q!==p&&!q.done&&man(p.pos,q.pos)<=1);this.shuffle(out);return out;}
  tradeOpp(p){if(this.cfg.parley)return this.players.filter(q=>q!==p&&!q.done);
    return this.players.filter(q=>q!==p&&!q.done&&man(p.pos,q.pos)<=1);}
  // v2 rule 11: price = 6 − crates still on the island. 3 left → 3🌕, 2 → 4🌕, 1 → 5🌕. Shared by
  // the whole table, and self-correcting if a crate ever comes back into supply — it is a function
  // of the board, not a counter anybody has to maintain. Returns null when there is nothing to buy.
  cratePrice(ing){
    const left=this.tokens[ing];
    if(!left||left<=0)return null;
    if(left>=1e9)return this.cfg.crateBase-1; // endless-supply sentinel: hold the opening price
    return Math.max(1,this.cfg.crateBase-left);
  }
  // v2 rule 10: docking is a treasure hunt, THEN a purchase. The flip only decides your payday —
  // heads you turn up buried treasure (cfg.dockHeads), tails you spend the turn working the dock as
  // a hand (cfg.dockTails). There is no free crate any more: crates are bought, won, or traded for (rule 10b).
  // Buying is offered after EITHER outcome and may use the coins just earned (rule 10c).
  doDock(p,port){
    const ing=port,k=port; // ports are identified by ingredient name
    if(this.cfg.singleDock&&this.dockOccupiedBy(ing,p))return false;
    p.firstFlip.add(k);p.dockedNow.add(k);p.justDocked=true;
    const h=this.flip(p);
    p.coins+=h?this.cfg.dockHeads:this.cfg.dockTails;
    const price=this.cratePrice(ing);
    // a bot buys when it needs the crate and can afford today's price — or, if it trades for a
    // living, when the crate is leverage somebody else at the table plainly needs (rule 4 fodder)
    let got=h?"treasure":"dockhand";
    if(this.cfg.dockBuy&&price!==null&&p.coins>=price){
      const needsIt=this.needs(p).includes(ing);
      const leverage=this.cfg.merchant&&!needsIt&&
        PERSONALITY[p.strategy]&&PERSONALITY[p.strategy].hoardBias>=1.4&&
        this.players.some(q=>q!==p&&!q.done&&this.likelyNeeds(q,ing));
      if(needsIt||leverage){
        p.coins-=price;this.tokens[ing]--;p.ing.push(ing);got="bought";
      }
    }
    this.ev({t:"dock",p:p.idx,ing,heads:h?1:0,got,price});
    return true;
  }
  // NARR-04: record this round's wind and return how many rounds running it has held that
  // direction. Called once per round, right after the direction is rolled.
  noteWind(dir){
    this.windStreak=(this.windPrev===dir)?(this.windStreak||1)+1:1;
    this.windPrev=dir;
    return this.windStreak;
  }
  // What this captain sees when they look into the ocean. Walks the list rather than sampling it:
  // each seat starts at a different offset and advances one step per look, so all thirty appear
  // before any repeats and two captains rarely see the same beast in the same round. Consumes no
  // RNG, so it cannot perturb a seeded replay.
  // Each captain walks the list from a different starting point, one step per look, so all fifty
  // appear before any repeat — a random pick would collide almost immediately (birthday problem: a
  // repeat is more likely than not inside eight looks).
  //
  // `seaSeat`/`seaBase` (Wyatt, 2026-08-06: "remember where the host was in the lineup, and start
  // their next game from the next one so they work their way through the whole list over many
  // games") let ONE seat resume mid-list instead of always starting at its derived offset. Both are
  // plain numbers set on the instance by beginGame — the engine never learns what a "local player"
  // or a localStorage key is (D-03: no DOM, no storage, no wall-clock in this tier). The cursor is
  // read once per GAME rather than once per look, which is what keeps a host-refresh replay showing
  // the same creatures it showed the first time: base is fixed for the voyage and `oceanLooks` is
  // rebuilt deterministically from the decision log.
  nextSeaCreature(p){
    const n=(p.oceanLooks=(p.oceanLooks||0)+1);
    const base=(p.idx===this.seaSeat)?(this.seaBase||0):p.idx*7;
    return SEA_CREATURES[(base+n-1)%SEA_CREATURES.length];
  }
  cnt(arr,x){return arr.filter(v=>v===x).length;}

  /* ================= v2 rule 4: the table-wide open trade =================
     Nobody targets a partner any more. You announce WHAT YOU WANT and WHAT YOU OFFER to the whole
     table; everyone holding it accepts, denies, or counters; you pick one answer or walk away.
     One round only — a counter cannot itself be countered.

     An offer is {want, giveIng, giveCoins}. A response is
     {q, kind:"accept"|"deny"|"counter", askFor, why}. */

  // Everyone who could answer an offer for `ing` — i.e. actually holds one. Cargo is public, so
  // this is exactly what the asking player can see for themselves.
  holdersOf(ing,exclude){
    return this.players.filter(q=>q!==exclude&&!q.done&&q.ing.includes(ing));
  }
  // How a bot prices a crate somebody is asking it for. Wyatt's ruling, 2026-08-04: price it in
  // TURNS — how long would it take me to replace this myself — PLUS a denial premium when the
  // asker looks close to finishing. That is the whole valuation; there is no flat threshold.
  offerValueTurns(q,offer){
    let v=0;
    // q is valuing what it is being HANDED, so it may consult its own recipe — this is q's own
    // decision about q's own cargo, not a guess about somebody else's.
    if(offer.giveIng)v+=this.acquireTurns(q,offer.giveIng).turns*(this.needs(q).includes(offer.giveIng)?1:0.25);
    v+=this.coinTurns(offer.giveCoins||0);
    return v;
  }
  // Public estimate of how dearly ANOTHER captain holds a crate they own. Built only from what
  // the whole table can see — how many of them they have, whether anybody ever saw them chase
  // that ingredient, and how close their visible hold is to a full recipe. Deliberately never
  // reads q.recipe: this is the guess a human makes across the table, and it is what a bot uses
  // when deciding whether opening a trade is even worth the turn.
  estimateCrateCost(q,ing){
    const held=this.cnt(q.ing,ing);
    const seen=(this.demand&&this.demand[q.idx]&&this.demand[q.idx][ing])||0;
    let c=PLAN.leverageTurns;          // a crate nobody saw them chase is probably spare
    if(seen)c+=2.5*Math.min(2,seen);   // seen going after this — they'll want paying properly
    if(held>1)c*=0.45;                 // a duplicate is easy to part with, whatever it is
    c+=3*this.visibleProgress(q);      // a captain close to baking parts with nothing cheaply
    return c;
  }
  crateCostTurns(q,ing,asker){
    // what it costs ME to hand this over: what I'd have to spend to replace it...
    const spare=this.cnt(q.ing,ing)-(this.needs(q).includes(ing)?0:0);
    let cost=this.acquireTurns(q,ing).turns;
    // ...discounted hard if it is surplus I never needed (pure leverage, not a recipe item)
    if(!q.recipe||!q.recipe.includes(ing))cost=PLAN.leverageTurns*(PERSONALITY[q.strategy]||PERSONALITY.balanced).hoardBias;
    else if(spare>1)cost*=0.4; // a second copy of a recipe item is cheap to let go
    // ...plus the denial premium: the closer the asker looks to baking, the dearer this gets, and
    // past a point no price buys it at all (handled by the caller as an outright deny)
    if(asker)cost+=4*this.visibleProgress(asker)*(this.likelyNeeds(asker,ing)?1:0.4);
    return cost;
  }
  // One captain's answer to an open offer. Bots reason; humans are asked by the UI instead.
  respondToOffer(q,offer,asker){
    if(!q.ing.includes(offer.want))return {q,kind:"deny",why:"nohave"};
    const cost=this.crateCostTurns(q,offer.want,asker);
    const value=this.offerValueTurns(q,offer);
    const bias=(PERSONALITY[q.strategy]||PERSONALITY.balanced).dealBias;
    if(value*bias>=cost)return {q,kind:"accept"};
    // a rival one crate from home is refused outright, at any price — same instinct v1 had, now
    // driven by what the bot can actually SEE rather than by reading their recipe card
    const nearlyDone=asker&&this.visibleProgress(asker)>=(this.cfg.recipeSize-1)/this.cfg.recipeSize;
    if(nearlyDone&&this.likelyNeeds(asker,offer.want))return {q,kind:"deny",why:"blocking"};
    // otherwise name a price: the coin shortfall, converted back out of turns
    const shortTurns=cost-value*bias;
    const askFor=Math.max(1,Math.ceil(shortTurns*PLAN.coinsPerDockTurn));
    if(asker&&askFor>asker.coins-(offer.giveCoins||0))return {q,kind:"deny",why:"toodear"};
    return {q,kind:"counter",askFor};
  }
  // Every answer to an open offer, in seat order. The asker sees all of them at once (rule 4a) —
  // human captains are skipped here and prompted by the UI instead.
  collectResponses(offer,asker,opts){
    opts=opts||{};
    const out=[];
    for(const q of this.holdersOf(offer.want,asker)){
      if(q.strategy==="human"&&!opts.includeHumans)continue;
      out.push(this.respondToOffer(q,offer,asker));
    }
    return out;
  }
  // Settle an agreed deal. `extra` is any coins added by a counter-offer the asker accepted.
  settleTrade(p,q,offer,extra){
    extra=extra||0;
    const total=(offer.giveCoins||0)+extra;
    if(!q.ing.includes(offer.want))return false;
    if(offer.giveIng&&!p.ing.includes(offer.giveIng))return false;
    if(p.coins<total)return false;
    q.ing.splice(q.ing.indexOf(offer.want),1);p.ing.push(offer.want);
    if(offer.giveIng){p.ing.splice(p.ing.indexOf(offer.giveIng),1);q.ing.push(offer.giveIng);}
    if(total){p.coins-=total;q.coins+=total;}
    this.trades++;
    // v2 rule 4e: no harbor-tax refund. A trade is just the exchange.
    // The whole table watched who wanted what — that is public evidence, and it is how bots
    // learn each other's recipes without ever being shown one.
    this.noteDemand(p,offer.want,1);
    if(offer.giveIng)this.noteDemand(q,offer.giveIng,0.5);
    this.ev({t:"trade",a:p.idx,b:q.idx,gave:this.offerLabel(offer,extra),got:offer.want,kind:extra?"counter":"open"});
    return true;
  }
  offerLabel(offer,extra){
    const coins=(offer.giveCoins||0)+(extra||0);
    return (offer.giveIng?ilabelImg(offer.giveIng):"")+(offer.giveIng&&coins?" + ":"")+(coins?`${coins} coins`:"");
  }
  /* ================= trade memory: why an offer is not worth repeating =================
     Wyatt, 2026-08-05: *"bots must remember trades they've requested and been rejected from, and
     not request the same ones again if they've failed, unless the table has substantively
     changed... write logic (not gates) to stop spam."*

     So this is deliberately NOT a cooldown. A timer would be a gate: it would silence a bot that
     has a genuinely better offer, and then let the identical hopeless one through again the moment
     it lapsed. What actually stops spam is asking the honest question — *has anything changed that
     could change their answer?* — and the answer is derived from the board, so a bot re-asks the
     instant it has a real reason to and never before.

     A refusal is remembered per (crate wanted, captain who refused), with what the offer was worth
     at the time and what that captain's situation looked like. Three things can revive it, each of
     them a real change in the world rather than the passage of time:

       1. THE OFFER GOT BETTER. Materially — a fifth more than they turned down, not a coin.
       2. WHAT WE'RE OFFERING IS NOW SOMETHING THEY WANT. Judged from public evidence only
          (demandFor), so this fires when the table watched them chase that ingredient.
       3. THEIR HOLD CHANGED so the crate is cheaper for them to part with — they picked up a
          second one, or they have visibly stopped needing it.

     Note what is deliberately absent: elapsed rounds. A bot that has nothing new to say stays
     quiet for the whole game, which is exactly right. */
  rememberRefusal(p,want,byIdx,worth){
    if(!p.refused)p.refused={};
    const q=this.players[byIdx];
    p.refused[want+"|"+byIdx]={
      worth,
      // their situation AT THE MOMENT THEY SAID NO, so we can tell later whether it moved
      held:q?this.cnt(q.ing,want):0,
      progress:q?this.visibleProgress(q):0,
      wantedOurs:0, // filled by the caller when it knows what was on the table
    };
  }
  // Records whether what we offered was something they visibly wanted at the time they refused.
  // One place decides it, because worthReAsking's rule 2 compares against exactly this flag.
  refusedFlagWanted(p,offer,q){
    const memo=p.refused&&p.refused[offer.want+"|"+q.idx];
    if(memo)memo.wantedOurs=offer.giveIng&&this.likelyNeeds(q,offer.giveIng)?1:0;
  }
  // Would it be worth putting this offer to this captain again? Everything here is public.
  worthReAsking(p,q,want,offer){
    const memo=p.refused&&p.refused[want+"|"+q.idx];
    if(!memo)return true; // never refused us — always worth asking
    const worth=this.offerWorthTurns(p,offer);
    if(worth>=memo.worth*1.2+0.15)return true;          // 1. a materially better offer
    if(offer.giveIng&&this.likelyNeeds(q,offer.giveIng)&&!memo.wantedOurs)return true; // 2. they want what we hold now
    if(this.cnt(q.ing,want)>memo.held)return true;      // 3a. they picked up a spare
    if(this.visibleProgress(q)<memo.progress-0.01)return true; // 3b. they lost ground; it may be cheap now
    return false;
  }
  // What our own offer is worth, in the same turn units everything else is priced in. Kept next to
  // the memory because the memory stores its output and the two must not drift apart.
  offerWorthTurns(p,offer){
    return this.coinTurns(offer.giveCoins||0)+(offer.giveIng?PLAN.leverageTurns:0);
  }
  // What offer would this bot put to the table? It asks for the ingredient its route says is
  // dearest to get any other way, and offers the cheapest thing it owns that the holders are
  // likely to want — a surplus crate first (it costs almost nothing to give away), sweetened with
  // coins only as far as it must.
  //
  // ORDER IS LOAD-BEARING: the offer is COMPOSED FIRST and only then tested against the memory,
  // for each candidate crate in turn. Testing before composing (which is what the first cut did)
  // checks a hypothetical offer and lets the real one through anyway — the bot still hails the
  // table and only then discovers nobody will answer, which is precisely the spam. The hail is
  // the thing being suppressed, so nothing may announce before this returns.
  composeOffer(p,want){
    const holders=this.holdersOf(want,p);
    if(!holders.length)return null;
    const spares=p.ing.filter(i=>!p.recipe.includes(i)||this.cnt(p.ing,i)>1);
    // prefer a spare the holders are likely to want — that is what makes an offer land
    spares.sort((x,y)=>{
      const wx=holders.filter(h=>this.likelyNeeds(h,x)).length;
      const wy=holders.filter(h=>this.likelyNeeds(h,y)).length;
      return wy-wx;
    });
    const giveIng=spares.length?spares[0]:null;
    const bias=(PERSONALITY[p.strategy]||PERSONALITY.balanced);
    const reserve=bias.fightBias>=1?(this.cfg.powder||0):0;
    const giveCoins=Math.max(0,Math.min(p.coins-reserve,giveIng?2:5));
    if(!giveIng&&!giveCoins)return null;
    const offer={want,giveIng,giveCoins};
    // Don't hail the table with an offer nobody could say yes to. Two independent reasons to stay
    // quiet, and BOTH have to clear before a word is said:
    //   a) nobody is worth re-asking — every holder already refused something this good and
    //      nothing about the table has moved since (see worthReAsking);
    //   b) the price they are likely to name is far beyond what this offer is worth.
    const live=holders.filter(q=>this.worthReAsking(p,q,want,offer));
    if(!live.length)return null;
    const worth=this.offerWorthTurns(p,offer);
    const cheapest=Math.min(...live.map(q=>this.estimateCrateCost(q,want)));
    if(worth*bias.dealBias<cheapest*0.6)return null;
    offer.audience=live.map(q=>q.idx);
    return offer;
  }
  botOpenOffer(p){
    const needs=this.needs(p);
    if(!needs.length)return null;
    // cargo is public, so asking only for things somebody holds is not hidden information
    const askable=needs.filter(i=>this.holdersOf(i,p).length);
    if(!askable.length)return null;
    // hardest-to-get-otherwise first, then fall down the list — a crate whose holders have all
    // said no is skipped entirely rather than re-hailed, and the bot simply asks for the next one
    askable.sort((x,y)=>this.acquireTurns(p,y).turns-this.acquireTurns(p,x).turns);
    for(const want of askable){
      const offer=this.composeOffer(p,want);
      if(offer)return offer;
    }
    return null;
  }
  // A bot's whole trade turn: put the offer to the table, read every answer, take the best one it
  // can afford — or walk away. Exactly the flow a human gets in the UI (rule 4).
  tryTrade(p){
    const offer=this.botOpenOffer(p);
    if(!offer)return false;
    // announcing what you want is itself public information — everyone now knows p wants this
    this.noteDemand(p,offer.want,1);
    this.ev({t:"openoffer",p:p.idx,want:offer.want,offer:this.offerLabel(offer,0)});
    // composeOffer already decided who is worth hailing; honour that list rather than re-deriving it
    const aud=offer.audience;
    const responses=this.collectResponses(offer,p)
      .filter(r=>!aud||aud.includes(r.q.idx));
    if(!responses.length)return false;
    // remember every no, with what it cost them to say it — see rememberRefusal
    const worth=this.offerWorthTurns(p,offer);
    for(const r of responses)if(r.kind==="deny"){
      this.rememberRefusal(p,offer.want,r.q.idx,worth);
      p.refused[offer.want+"|"+r.q.idx].wantedOurs=offer.giveIng&&this.likelyNeeds(r.q,offer.giveIng)?1:0;
    }
    const accepts=responses.filter(r=>r.kind==="accept");
    const counters=responses.filter(r=>r.kind==="counter"&&(offer.giveCoins+r.askFor)<=p.coins);
    let deal=null,extra=0;
    if(accepts.length){
      // several yeses: take the crate from whoever can spare it most easily
      accepts.sort((x,y)=>this.crateCostTurns(y.q,offer.want,p)-this.crateCostTurns(x.q,offer.want,p));
      deal=accepts[0].q;
    }else if(counters.length){
      counters.sort((x,y)=>x.askFor-y.askFor);
      // only pay a counter that still beats getting the crate the hard way
      const best=counters[0];
      const mine=this.acquireTurns(p,offer.want).turns;
      if(this.coinTurns(offer.giveCoins+best.askFor)<=mine){deal=best.q;extra=best.askFor;}
    }
    if(!deal){
      // walking away from a counter is this offer being refused too — remember it, or the bot
      // re-opens the identical hail next turn and gets the identical price back
      for(const r of responses)if(r.kind==="counter")this.rememberRefusal(p,offer.want,r.q.idx,worth);
      this.ev({t:"parley",a:p.idx,b:null,offer:this.offerLabel(offer,0)||"nothing",want:offer.want});
      return false;
    }
    return this.settleTrade(p,deal,offer,extra);
  }
  // called on every battle resolution (win or flee) — cools the opportunistic "rich" attack
  // trigger against this specific opponent for a few rounds (mutual, since either side's coin
  // total may have just crossed the rich threshold) and, on a decisive win, arms a one-shot
  // grudge so the loser is a little more likely to seek revenge against this attacker specifically.
  // `spoilIng`, when the spoil was a crate rather than coins, also arms justLost: without it, two
  // ships that each need the exact item the other's holding will just steal it back and forth
  // forever (verified in simulation — the single biggest source of pointless repeat duels, bigger
  // than the "rich" trigger alone). justLost doesn't block fighting this opponent for OTHER
  // reasons, only re-litigating the same crate immediately.
  recordSkirmish(att,def,lose,spoilIng){
    const cool=this.round+3;
    att.coolUntil[def.idx]=cool;
    def.coolUntil[att.idx]=cool;
    // AI-06: bump the recent-fight tally for this pair (decays over ~10 rounds — see recentFights).
    // A tally that keeps climbing is exactly the endless-duel signature scoreAttack prices out.
    this.bumpFight(att,def);
    this.bumpFight(def,att);
    if(lose){
      const win=lose===att?def:att;
      lose.grudge={against:win.idx,expires:this.round+2};
      if(spoilIng)lose.justLost={ing:spoilIng,by:win.idx,until:this.round+3};
    }
  }
  bumpFight(p,q){
    const f=p.fightLog[q.idx];
    // if the last fight with q was recent, keep climbing; if it lapsed, start over
    const n=(f&&f.until>=this.round)?f.n+1:1;
    p.fightLog[q.idx]={n,until:this.round+10};
  }
  // AI-06: how many times p has recently fought q (0 if none or the tally has decayed away). Drives
  // the escalating rematch penalty in scoreAttack — first fight free, each rematch costlier.
  recentFights(p,q){
    const f=p.fightLog[q.idx];
    return (f&&f.until>=this.round)?f.n:0;
  }
  // Every square this ship could legally finish a move on, as a plain array — the engine-side
  // twin of the UI's reachable() helper. A fleeing defender uses the ordinary v2 sail rules
  // (4 squares, 2 if the escape route touches upwind), which is Wyatt's ruling for rule 9's flee.
  reachableFrom(p){
    return [...this.sailStates(p).keys()].map(k=>k.split(",").map(Number));
  }
  // Which side is firing downwind on this adjacency? Purely geometric; positions never change
  // mid-battle in v2 (no swap), so one reading holds for the whole fight.
  downwindSide(att,def){
    const dx=def.pos[0]-att.pos[0],dy=def.pos[1]-att.pos[1];
    const dirAtoD=Object.keys(DIRS).find(k=>DIRS[k][0]===dx&&DIRS[k][1]===dy);
    const dirDtoA=Object.keys(DIRS).find(k=>DIRS[k][0]===-dx&&DIRS[k][1]===-dy);
    if(this.windNow===dirAtoD)return "a";
    if(this.windNow===dirDtoA)return "d";
    return null;
  }
  // v2 rule 9/13 prize: ONE CRATE, winner's choice. No coin alternative, and no place-swap — a
  // swap would hand the loser the advantageous square (Wyatt, 2026-08-04). A ship with no crates
  // cannot be attacked at all (rule 13e), so `lose.ing` is never empty by the time we get here.
  awardSpoil(win,lose){
    if(!lose.ing.length)return null;
    const wanted=lose.ing.filter(i=>this.needs(win).includes(i));
    // no recipe need of its own? take what somebody else at the table plainly wants — leverage
    const leverage=lose.ing.filter(i=>this.players.some(q=>q!==win&&q!==lose&&!q.done&&this.likelyNeeds(q,i)));
    const pick=(wanted[0]!==undefined)?wanted[0]:(leverage[0]!==undefined?leverage[0]:lose.ing[0]);
    lose.ing.splice(lose.ing.indexOf(pick),1);win.ing.push(pick);
    // the whole table just watched the winner choose that crate — public evidence of what it wants
    this.noteDemand(win,pick,1);
    // v2.1 BUG (Wyatt, 2026-08-06): "I attacked Davy Scones when he got to Tortuga to start his
    // bakery, and I stole one of the ingredients he needed... but instead, he still won."
    // Rule 13c makes a finished captain a legal target precisely so this raid is worth making —
    // but nothing ever REVOKED the finish. `done` stayed true, the seat stayed in finishOrder, and
    // resolveEnd crowned a baker who no longer had a recipe to bake. The raid was legal, landed,
    // and meant nothing.
    if(lose.done&&this.needs(lose).length)this.unfinish(lose);
    return pick;
  }
  /* Take a captain back OUT of the bakery. Two things have to happen together and neither is
     optional: `done` goes false so they re-enter the rotation and can go and replace what was
     taken (Wyatt: "they should be able to continue playing"), and the seat leaves finishOrder so
     the end-of-voyage ranking cannot crown them.
     Emitted as its own event rather than folded into the battle line, because it is a separate
     beat with separate stakes — the crate changing hands is the raid, this is the consequence. */
  unfinish(p){
    p.done=false;
    const k=this.finishOrder.indexOf(p.idx);
    if(k>=0)this.finishOrder.splice(k,1);
    this.ev({t:"unfinish",p:p.idx});
  }
  // Can this ship legally be attacked? v2 rule 13e: an empty hold is not a target — there is
  // nothing to take, and the option greys out rather than wasting the attacker's powder.
  // Note there is deliberately no `def.done` check: v2 rule 13c is "nobody is safe" — a captain
  // who has already fired up the ovens is still a legal target, and always holds a full recipe,
  // so raiding one is always allowed.
  canAttack(att,def){
    if(!def||def===att)return false;
    if(this.cfg.powder&&att.coins<this.cfg.powder)return false;
    return def.ing.length>0;
  }
  // v2 rule 9 — the battle is ONE round.
  //
  //   heads vs tails            → the heads ship wins outright
  //   both heads, one downwind  → the downwind ship wins (the wind carries the shot home)
  //   both heads, crosswind     → cannonballs collide. The ATTACKER may pay 2🌕 to re-fire ALONE
  //                               against the defender's standing heads, repeatable as often as
  //                               they can pay. Decline and the battle ends NULL — nobody gains.
  //   both tails                → both shots went wild. The defender may flee, FREE, under the
  //                               ordinary v2 sail rules. Stand their ground and the attacker may
  //                               pay 2🌕 to re-fire, same as above; decline → NULL.
  //
  // Prize: one crate, winner's choice, no coin alternative and no place-swap (rule 9d).
  battle(att,def){
    const c=this.cfg;
    if(!this.canAttack(att,def))return null; // empty hold or no powder — never a legal fight
    if(c.powder)att.coins-=c.powder;
    this.battles++;
    const downwind=this.downwindSide(att,def);
    const rounds=[];
    let flips=0,win=null,fled=false,nulled=false;
    // ---- THE round. Both cannons speak once. ----
    const ah=this.flip(att),dh=this.flip(def);flips+=2;
    let scorer=null;
    if(ah&&dh){
      if(downwind==="a"){win=att;scorer="a";}
      else if(downwind==="d"){win=def;scorer="d";}
      // crosswind: the cannonballs collide. Falls through to the re-fire below.
    }else if(ah){win=att;scorer="a";}
    else if(dh){win=def;scorer="d";}
    rounds.push([ah?1:0,dh?1:0,0,scorer]);
    if(!win){
      // ---- both tails: the defender's FREE escape (rules 9a + 2c) ----
      if(!ah&&!dh){
        // a bot slips away when the wind is against it (it loses the next both-heads) or when it
        // is carrying a crate it cannot afford to lose; otherwise it stands and takes its chances
        // "carrying a crate it cannot afford to lose" = a RECIPE crate it holds no spare of.
        // NOT `needs(def).includes(i)`: needs() is the recipe MINUS what you already hold, so
        // testing held crates against it is always false and the defender would never flee.
        const holdingCritical=def.ing.some(i=>def.recipe&&def.recipe.includes(i)&&this.cnt(def.ing,i)<=1);
        if(downwind==="a"||holdingCritical){
          const cells=this.reachableFrom(def);
          if(cells.length){
            def.pos=cells.reduce((best,cc)=>man(cc,att.pos)>man(best,att.pos)?cc:best,cells[0]);
            this.tradewind(def);
            fled=true;
            this.recordSkirmish(att,def,null);
            this.ev({t:"battleflee",a:att.idx,d:def.idx,rounds,flips,downwind});
          }
        }
      }
      // ---- the attacker's paid re-fire (rule 9b, extended by rule 9a to the both-tails case).
      // The defender's cannon is spent for this exchange; the attacker buys a fresh broadside for
      // 2🌕 and fires ALONE. Heads and the shot lands — attacker wins. Tails and they may pay
      // again, as often as they can afford it. Decline at any point and the battle ends NULL:
      // no crate, no coins, no caller paid, and the powder already spent stays spent. ----
      if(!fled){
        const refire=c.refire||0;
        while(!win){
          if(!refire||att.coins<refire||!this.wantsRefire(att,def,downwind,rounds.length)){nulled=true;break;}
          att.coins-=refire;
          this.ev({t:"refire",a:att.idx,d:def.idx,cost:refire});
          const rh=this.flip(att);flips++;
          rounds.push([rh?1:0,null,0,rh?"a":null]);
          if(rh)win=att;
        }
      }
    }
    if(fled)return null;
    if(nulled){
      // NULL: the battle ends with no player gaining anything. No spoil, no swap, no caller paid.
      this.recordSkirmish(att,def,null);
      this.ev({t:"battlenull",a:att.idx,d:def.idx,rounds,flips,downwind});
      return null;
    }
    const lose=win===att?def:att;
    if(win===att)this.attWins++;
    const spoilIng=this.awardSpoil(win,lose);
    const spoil=spoilIng?ilabelImg(spoilIng):"nothing";
    // BATL-03 carried into v2 and hardened by rule 9d: nobody moves after a battle. A swap would
    // put the loser in the advantageous square, which is exactly backwards.
    this.recordSkirmish(att,def,lose,spoilIng);
    this.ev({t:"battle",a:att.idx,d:def.idx,rounds,winner:win.idx,spoil,spoilIng,flips,downwind});
    return win;
  }
  /* ================= v2 bot AI: planners, not gates =================
     Wyatt, 2026-08-04: *"have them make a plan for their entire ingredient trajectory that they
     update with the wind each turn and includes who they may need to battle or trade with to get
     ingredients that they need which are currently out of stock. Think like a human when you
     design the bot ai — don't give them gates, give them strategy."*

     So there is no if-chain and no bag of scores here. A bot answers ONE question every turn:
     *what is the cheapest remaining route to a full recipe, measured in turns?* Everything else —
     where to sail, whether to dock, whether to open a trade, whether to pick a fight — falls out
     of that route. The route is rebuilt from scratch each turn, against the current board, the
     current prices, and the wind it can actually see (this round's, plus next round's committed
     forecast — rule 6).

     Every cost below is denominated in TURNS, which is what keeps it explainable: "buying this
     costs me 4 turns, taking it by force costs me 2 and a fight I might lose". A bot never
     consults anybody's recipe card — only what the whole table can see (see demandFor). */

  // Coins are just stored turns: a dock flip pays 6 or 2, so a turn at a dock earns 4 on average.
  coinTurns(n){return n<=0?0:n/PLAN.coinsPerDockTurn;}
  // Sailing time from a to b under a given wind. v2 rule 1: 4 squares a turn unless the route has
  // to bite into the wind, in which case 2. Bots plan against the wind they can SEE — this round's
  // for the leg they're on, and the committed forecast for the leg after it (rule 6d: never wrong).
  sailTurns(from,to,wind){
    const d=man(from,to);
    if(!d)return 0;
    const dx=to[0]-from[0],dy=to[1]-from[1];
    // does any leg of this route head straight into the wind?
    const legs=[];
    if(dx>0)legs.push("E"); if(dx<0)legs.push("W");
    if(dy>0)legs.push("S"); if(dy<0)legs.push("N");
    const upwind=wind&&legs.some(k=>k===OPPOSITE[wind]);
    return Math.ceil(d/(upwind?SAIL_RANGE_UPWIND:SAIL_RANGE));
  }
  // The three ways to get a crate, each priced in turns, and which one wins. This is the heart of
  // the planner and the answer to "what do I do when it's out of stock everywhere" (Wyatt asked
  // for all three evaluated, and the likeliest to work chosen):
  //
  //   buy  — sail to the island, earn the price at the dock, buy it (rule 10/11)
  //   deal — open a table-wide trade for it (rule 4)
  //   take — sail into range of a holder and fight them for it (rules 9/13)
  //
  // `from` lets buildRoute() cost a later leg from where the previous one ended, rather than
  // pretending every errand starts from where the ship is sitting right now.
  acquireTurns(p,ing,from,wind){
    from=from||p.pos;
    wind=wind===undefined?this.windNow:wind;
    const bias=PERSONALITY[p.strategy]||PERSONALITY.balanced;
    // `target` is where this option would have the ship SAIL. A deal has none (rule 4 reaches the
    // table from anywhere), so we track the best PHYSICAL option separately: even when talking is
    // the cheapest plan, the ship should still be making way toward the island it would otherwise
    // buy from, so a refused offer costs a conversation and not a turn.
    const out={turns:PLAN.unreachable,kind:null,target:null,via:null,moveTarget:null,moveTurns:PLAN.unreachable};
    const consider=(turns,kind,target,via)=>{
      if(turns<out.turns){out.turns=turns;out.kind=kind;out.target=target;out.via=via;}
      if(target&&turns<out.moveTurns){out.moveTurns=turns;out.moveTarget=target;}
    };
    // ---- buy it at its island ----
    const price=this.cratePrice(ing);
    if(price!==null){
      const dock=this.islandOf[ing];
      const sail=this.sailTurns(from,dock,wind);
      // coins I still have to earn, at 4 a docking turn — and I can earn them at THIS dock, so
      // the earning turns and the arrival turns stack rather than needing a detour
      const short=Math.max(0,price-p.coins);
      const earn=Math.ceil(this.coinTurns(short));
      // somebody else is tied up in that berth. Only one ship fits (singleDock), so this errand
      // means loitering until they leave — price the wait, so a different ingredient wins the leg
      // instead. Without this a bot fixates on an occupied berth it can never reach, cannot
      // improve its distance, and idles in place for the rest of the game.
      const occupied=this.cfg.singleDock&&this.dockOccupiedBy(ing,p)?2.5:0;
      // one turn to make the purchase itself (the flip that pays for it doubles as the buy)
      consider(sail+earn+1+occupied,"buy",dock,ing);
    }
    // ---- get it from somebody who has one ----
    for(const q of this.holdersOf(ing,p)){
      // DEAL. One action, and crucially NO SAILING — rule 4 reaches the whole table from wherever
      // you happen to be floating. So a deal never sets a movement target (that stays null): the
      // bot keeps sailing toward the island it would otherwise buy from and hails the table on the
      // way, exactly as a human does. Pricing it any other way makes every bot converge on
      // whoever holds the crate and then sit there — which is precisely what the first headless
      // run of this planner did, 580 idle turns and four docks in 150 rounds.
      const spare=p.ing.find(i=>!p.recipe.includes(i)||this.cnt(p.ing,i)>1);
      const sweetener=spare?PLAN.leverageTurns:this.coinTurns(3);
      // what THEY will want for it, guessed from public evidence only — a crate somebody has
      // plainly been chasing is not going to come cheap, and pretending otherwise is how a bot
      // ends up making the same doomed offer every turn for a hundred rounds.
      const theirPrice=this.estimateCrateCost(q,ing);
      consider((PLAN.tradeTurns+sweetener+theirPrice)/bias.dealBias,"deal",null,q);
      // take: sail into range, then fight. A fight is only worth planning when it is legal
      // (rule 13e — an empty hold is never a target) and when I can pay for powder.
      if(this.canAttack(p,q)||p.coins>=(this.cfg.powder||0)){
        if(q.ing.includes(ing)){
          // v2.1: sail to CUT THEM OFF, not to where they are standing. For a captain who is going
          // nowhere this is their own square and nothing changes; for one running for home it is a
          // couple of squares down their route (interceptOf).
          const aim=this.interceptOf(q);
          const sail=this.sailTurns(from,aim,wind);
          const rematch=PLAN.rematchEscalate*this.recentFights(p,q);
          // the wind is a real edge in a one-round battle — price it
          const dirPtoQ=Object.keys(DIRS).find(k=>DIRS[k][0]===Math.sign(q.pos[0]-p.pos[0])&&DIRS[k][1]===Math.sign(q.pos[1]-p.pos[1]));
          const edge=(dirPtoQ&&wind===dirPtoQ)?-PLAN.windEdge:((dirPtoQ&&wind===OPPOSITE[dirPtoQ])?PLAN.windEdge:0);
          // v2.1: a crate in the hands of someone about to win is worth more than the same crate
          // anywhere else, because taking it costs them as well as paying me. Urgency discounts the
          // fight; the archetype's own fightBias scales how far it will go, so the pirate hunts and
          // the rusher keeps racing (Wyatt's choice, 2026-08-06 — "same brain, different taste").
          const hunt=1+this.threatUrgency(q)*PLAN.huntWeight*bias.fightBias;
          const cost=(sail+PLAN.fightTurns+PLAN.fightLossRisk+rematch+edge)/bias.fightBias/hunt;
          consider(cost,"take",aim,q);
        }
      }
    }
    return out;
  }
  // The full remaining trajectory, rebuilt every turn: order the ingredients still needed so the
  // whole voyage is as short as possible, costing each leg from where the previous one ended and
  // under the wind that will actually be blowing. Nearest-cheapest-first with the costs recomputed
  // after every pick — with at most recipeSize legs this is both fast and stable, and it re-plans
  // wholesale each turn anyway, so a better opening never gets locked in behind a stale one.
  buildRoute(p){
    const remaining=this.needs(p).slice();
    const route=[];
    let at=p.pos,wind=this.windNow,total=0;
    // the first leg is planned under the wind now; every leg after it under the forecast, which
    // rule 6d guarantees is correct. Beyond that a bot plans as if the forecast holds.
    let legWind=wind;
    while(remaining.length){
      let best=null,bestIdx=-1;
      for(let i=0;i<remaining.length;i++){
        const plan=this.acquireTurns(p,remaining[i],at,legWind);
        if(!best||plan.turns<best.turns){best=plan;bestIdx=i;}
      }
      if(!best||best.turns>=PLAN.unreachable){
        // nothing on the board can supply this one right now — record it as an open problem so
        // the bot keeps hunting a holder rather than silently dropping the ingredient
        route.push({ing:remaining[0],kind:"stuck",turns:PLAN.unreachable,target:null,via:null});
        remaining.splice(0,1);
        continue;
      }
      const ing=remaining.splice(bestIdx,1)[0];
      route.push({ing,...best});
      total+=best.turns;
      // the NEXT leg is costed from wherever this one physically ends — a deal leg leaves the
      // ship where it already was, so `at` only advances when there was somewhere to sail
      at=best.target||best.moveTarget||at;
      // v2.1: forecastWind(), not windNext — with a storm coming the bot costs its next leg against
      // the wind it can actually see, same as a captain reading the chip.
      legWind=this.forecastWind()||legWind;
    }
    return {route,total};
  }
  // Where this bot is trying to get to right now — the first leg of its route. Kept under the old
  // name because the live turn flow and the headless sim both call it.
  /* Sail to head off a captain on the brink — the half of "attack people if they are about to win"
     that the opportunism arm in chooseAction() cannot supply, because that arm only ever sees ships
     ALREADY adjacent. Measured: with the threat model wired into costs but nothing steering the
     ship, denial raids fired 0.05 times a game. A bot has to actually go after them.
     BOUNDED BY PLAN.huntReach ON PURPOSE. Without a reach limit the sums say "always chase": at full
     urgency the discounted cost of a raid stays under its worth from most of the board, so a pirate
     would abandon a half-finished errand to cross the map, and the voyage would stop being about
     baking. A short leash makes the behaviour legible instead — bots pounce when the leader comes
     within reach, they do not stalk. */
  huntTarget(p){
    const bias=PERSONALITY[p.strategy]||PERSONALITY.balanced;
    if(p.coins<(this.cfg.powder||0))return null; // no powder, no raid — never plan what you can't pay for
    let best=null;
    for(const q of this.players){
      if(q===p||q.done||!q.ing.length)continue;   // rule 13e: an empty hold is never a target
      const urgent=this.threatUrgency(q);
      if(urgent<=0)continue;
      const aim=this.interceptOf(q);
      const sail=this.sailTurns(p.pos,aim,this.windNow);
      if(sail>PLAN.huntReach)continue;
      const rematch=PLAN.rematchEscalate*this.recentFights(p,q);
      const cost=(sail+PLAN.fightTurns+PLAN.fightLossRisk+rematch)/bias.fightBias/(1+urgent*PLAN.huntWeight);
      const gain=q.ing.some(i=>this.needs(p).includes(i))?PLAN.crateTurns:0;
      const worth=Math.max(gain,urgent*PLAN.denialTurns);
      if(cost<worth&&(!best||cost<best.cost))best={aim,cost};
    }
    return best?best.aim:null;
  }
  chooseTarget(p){
    if(!this.needs(p).length)return this.home; // recipe done — the only job left is to sail home
    // v2.1: a captain about to win, within reach, outranks the next errand on the shopping list.
    const hunt=this.huntTarget(p);
    if(hunt)return hunt;
    const {route}=this.buildRoute(p);
    p.plan=route; // kept on the player so the turn flow (and any debugging) can read the reasoning
    // sail toward the first leg that HAS somewhere to sail to — a deal leg has none, so the ship
    // keeps making way toward the island it would otherwise buy from while it hails the table
    for(const leg of route){
      const t=leg.target||leg.moveTarget;
      if(t)return t;
    }
    // every ingredient is out of stock and nobody holds one: shadow the captain carrying the most
    // of what we need, so we're in position the moment they pick one up
    const needs=this.needs(p);
    const holders=this.players.filter(q=>q!==p&&!q.done&&q.ing.some(i=>needs.includes(i)));
    if(holders.length){holders.sort((x,y)=>man(p.pos,x.pos)-man(p.pos,y.pos));return holders[0].pos;}
    return this.home;
  }
  canDock(p,port){
    if(this.cfg.singleDock&&this.dockOccupiedBy(port,p))return false;
    return true;
  }
  // Is another 2🌕 broadside worth it? The prize is a crate whose worth the bot has already
  // computed in turns; a re-fire buys a 50% shot at it for two coins' worth of dock time. The
  // shot count keeps a rich bot from grinding forever, and the reserve stops it going broke on a
  // crate it could simply have bought.
  wantsRefire(att,def,downwind,shots){
    const bias=PERSONALITY[att.strategy]||PERSONALITY.balanced;
    if(shots>=2+Math.round(bias.fightBias))return false;
    const wanted=def.ing.filter(i=>this.needs(att).includes(i));
    if(!wanted.length&&bias.hoardBias<1.4)return false;
    const prize=wanted.length?this.acquireTurns(att,wanted[0]).turns:PLAN.leverageTurns;
    const cost=this.coinTurns(this.cfg.refire||0);
    return 0.5*prize*bias.fightBias>=cost;
  }
  /* ================= what to do with THIS turn =================
     Not a menu of scores — the route already decided what this bot wants. This just reads the
     first leg of it and answers "can I take that step from where I'm standing?" */
  chooseAction(p){
    const activeGrudge=p.grudge;p.grudge=null;
    const route=p.plan||this.buildRoute(p).route;
    const leg=route&&route.length?route[0]:null;
    const port=this.adjPort(p);
    const adj=this.adjOpp(p);
    // 1. The plan says take it by force, and the mark is right there — fight.
    if(leg&&leg.kind==="take"&&leg.via&&adj.includes(leg.via)&&this.canAttack(p,leg.via))
      return {type:"attack",target:leg.via,why:"plan"};
    // 2. The plan says deal for it — a trade reaches the whole table, so position is irrelevant.
    //
    // ASK THE QUESTION THE TRADE ITSELF WILL ASK (Wyatt, 2026-08-09, watching bots pass while sitting
    // on a dock). This used to check only that SOMEBODY holds the crate — but botOpenOffer applies
    // two further tests before it will say a word (is anyone still worth re-asking, and is my offer
    // within reach of their price), and it fails one of them most of the time. The turn was then
    // committed to a hail that never happened: no offer, no parley, no dock, just a blank pass.
    // Measured over 300 games: 4,884 of 5,703 trade turns died this way, 836 of them while standing
    // at a workable dock and 831 beside a legal target holding a crate the bot needed.
    //
    // Calling botOpenOffer here is safe to do twice — the whole compose path (composeOffer /
    // worthReAsking / offerWorthTurns / estimateCrateCost / acquireTurns) reads state and returns;
    // it draws no RNG, emits no event and mutates nothing, so tryTrade recomputing it a moment
    // later gets the same answer and the seeded stream is untouched. That purity is load-bearing:
    // if anything in that path ever starts drawing from this.r(), this line forks replay.
    if(leg&&leg.kind==="deal"&&this.botOpenOffer(p))
      return {type:"trade",why:"plan"};
    // 3. Standing at the dock the plan sent us to — work it. Docking is never wasted: it pays
    //    whether or not there is a crate left to buy (rule 10d), so it is always a real option.
    if(port&&this.canDock(p,port))
      return {type:"dock",ing:port,why:(leg&&leg.ing===port)?"plan":"income"};
    // 4. Opportunism, priced honestly: somebody adjacent is holding something my route says is
    //    expensive to get any other way, and beating them for it is cheaper than my current plan.
    if(!this.needs(p).length){
      // recipe complete — never start a fight, just sail home and bake (v1's AI-01, still right)
      return {type:"sail",why:"finishing"};
    }
    let bestFight=null;
    for(const q of adj){
      if(!this.canAttack(p,q))continue;
      const prize=q.ing.filter(i=>this.needs(p).includes(i));
      // v2.1 — THE DENIAL RAID (Wyatt, 2026-08-06). This used to `continue` whenever the target held
      // nothing on my own shopping list, which is exactly why the leader sailed home unmolested:
      // every fight in the game had to be self-interested, so a captain one crate from victory was
      // only ever attacked by coincidence. Now a crate I have no use for is still worth taking if
      // losing it sets THEM back — and that value is what `denial` prices, in my own turns.
      const urgent=this.threatUrgency(q);
      if(!prize.length&&urgent<=0)continue;
      // what the fight is WORTH: the better of what I'd gain (turns saved acquiring it the slow
      // way) and what I'd cost them. A raid on a nobody still needs to pay for itself.
      const gain=prize.length?this.acquireTurns(p,prize[0]).turns:0;
      const denial=urgent*PLAN.denialTurns;
      const worth=Math.max(gain,denial);
      const bias=PERSONALITY[p.strategy]||PERSONALITY.balanced;
      const rematch=PLAN.rematchEscalate*this.recentFights(p,q);
      const grudge=(activeGrudge&&activeGrudge.against===q.idx&&activeGrudge.expires>=this.round)?0.6:0;
      const hunt=1+urgent*PLAN.huntWeight*bias.fightBias;
      const cost=(PLAN.fightTurns+PLAN.fightLossRisk+rematch-grudge)/bias.fightBias/hunt;
      if(cost<worth&&(!bestFight||cost<bestFight.cost))bestFight={type:"attack",target:q,cost,why:prize.length?"opportunity":"denial"};
    }
    if(bestFight){
      const tied=adj.filter(q=>this.canAttack(p,q));
      // v2.1: tieBully re-points a pirate at the WEAKEST adjacent ship, which is the opposite of
      // what hunting the leader is for. Picking on the runt is a flavour preference; stopping the
      // captain on the brink is the plan — so the bully arm stands down whenever the current mark
      // is a genuine threat, rather than quietly undoing the decision made just above.
      const marked=this.threatUrgency(bestFight.target)>0;
      if(!marked&&(PERSONALITY[p.strategy]||PERSONALITY.balanced).tieBully&&tied.length>1){
        tied.sort((x,y)=>(x.coins+x.ing.length)-(y.coins+y.ing.length));
        if(tied[0]!==bestFight.target&&this.needs(p).some(i=>tied[0].ing.includes(i)))bestFight.target=tied[0];
      }
      return bestFight;
    }
    // 5. Nothing to do here. A trade reaches the whole table from anywhere, so try that before
    //    settling for sailing — it is the one action distance cannot deny us.
    if(this.botOpenOffer(p))return {type:"trade",why:"fallback"};
    return {type:"sail",why:"enroute"};
  }
  takeTurn(p,windDir,storm){
    this.ev({t:"turn",p:p.idx});
    // v2 rule 7: storms are resolved for the WHOLE TABLE at the top of the round (see play()),
    // not per player here. By the time a turn starts the storm has already happened, and v2.1
    // removed the only way it could cost a turn — so every captain always gets to play.
    const port0=this.adjPort(p);
    if(!port0)p.dockedNow.clear();
    const target=this.chooseTarget(p);
    const before=[...p.pos];
    // sailing is free now (rule 2) — no coin gate, no refund, no "too poor to sail"
    if(man(p.pos,target)>0){
      const moved=this.stepToward(p,target);
      if(moved)this.ev({t:"sail",p:p.idx});
      else if(this.boxedIn(p)&&this.rimEscape(p)){/* rim sweep recorded its own event */}
    }
    if(p.pos[0]!==before[0]||p.pos[1]!==before[1])p.justDocked=false;
    if(!this.adjPort(p))p.dockedNow.clear(); // leaving a port re-arms its dock flip
    const action=this.chooseAction(p);
    if(action.type==="attack"){this.battle(p,action.target);return;}
    if(action.type==="trade"){if(this.tryTrade(p))return;}
    if(action.type==="dock"){if(this.doDock(p,action.ing))return;}
    // THE FALLBACK. chooseAction picks ONE action and, before this, a refusal ended the turn: a
    // hail nobody would answer, or a berth already taken, and the captain went to look at the sea —
    // even standing on a dock that pays whether or not there is a crate left to buy (rule 10d).
    // A human does the next best thing instead, so a bot does too. Deliberately only the DOCK, not
    // a second full pass through chooseAction: re-running the menu could pick a fight the planner
    // had already priced and rejected this turn, and working the berth under your feet is the one
    // move that is never wrong.
    const fallbackPort=this.adjPort(p);
    if(fallbackPort&&this.canDock(p,fallbackPort)&&this.doDock(p,fallbackPort))return;
    // Nothing left worth doing this turn — so a bot does exactly what a human does in the same
    // position (rule 3 left no filler action): leans over the rail and looks into the ocean.
    this.ev({t:"pass",p:p.idx,sea:this.nextSeaCreature(p)});
  }
  checkFinish(p){
    if(!this.needs(p).length&&man(p.pos,this.home)<=1){
      p.done=true;this.finishOrder.push(p.idx);this.ev({t:"finish",p:p.idx});
      // the "final round!" announcement + wind re-spin are handled by the caller (runLiveNet),
      // which alone knows the live turn order and can pause the whole crew for it (see #19).
      return true;}
    return false;
  }
  /* v2 rule 6: the wind for the NEXT round is drawn a round early and shown on the compass, storm
     and all. Rule 6d makes that a promise — once shown it is committed and can never turn out to
     be wrong — so a captain really can plan around it, which is the whole justification for rule
     8's "blown into land simply costs you the turn, there are no options". advanceWind() is the
     one place the promise is kept: what was forecast last round BECOMES this round's weather, and
     a fresh forecast is drawn behind it. */
  drawWeather(){
    const dir="NSEW"[Math.floor(this.r()*4)];
    const storm=rollStorm(this); // #1a: never a third storm back-to-back
    return {dir,storm};
  }
  /* v2.1 (Wyatt, 2026-08-06): "remove the storm direction from the forecast, so you'd know that a
     storm will come next turn, but you don't know which direction it'll go." The storms had lost
     their edge — a shove you can see coming a full round out is a logistics problem, not weather.

     A storm blows along ITS OWN ROUND'S WIND (see play(): `if(storm)this.runStorm(wind)`), so the
     storm's direction and next round's wind are THE SAME FACT. Hiding one hides the other, and
     that is the whole mechanic: a storm round is a round whose weather nobody can plan. No rule is
     added — a tabletop deck would simply print the storm card face-down.

     Everything that shows or uses the forecast goes through here, so the hidden direction cannot
     leak: the chip, the round header, the event log, and the bots' own planner. Bots must never
     know what the player cannot see — an opponent with private weather reads as a cheat far faster
     than an unfair rule does. */
  forecastWind(){ return this.stormNext?null:this.windNext; }
  advanceWind(){
    // first round of the game: there is no standing forecast yet, so draw this round's weather now
    if(!this.next)this.next=this.drawWeather();
    const cur=this.next;
    this.windNow=cur.dir;this.stormNow=cur.storm;
    this.next=this.drawWeather();
    this.windNext=this.next.dir;this.stormNext=this.next.storm;
    // v1's second perpendicular gust is gone (rule 7): a storm is one direction, one distance.
    this.windNow2=null;
    return cur;
  }
  /* v2 rule 7: ONE storm event for the whole table, at the top of the round, before anybody acts.
     Resolved downwind-first (Wyatt's ruling) so the lead ship clears its square before the ship
     behind it arrives — otherwise ships shield each other purely by seat order. */
  runStorm(dirKey){
    this.ev({t:"storm",dir:dirKey,dist:STORM_PUSH});
    for(const p of this.stormOrder(dirKey)){
      const before=[...p.pos];
      const wasDocked=this.adjPort(p)!==null;
      const outcome=this.stormPush(p,dirKey,STORM_PUSH);
      this.noteStormOutcome(p,outcome,p.pos[0]!==before[0]||p.pos[1]!==before[1],wasDocked);
    }
  }
  play(){
    let order=this.players.map((_,i)=>i);
    this.shuffle(order);
    while(this.round<150){
      this.round++;
      const {dir:wind,storm}=this.advanceWind();
      this.ev({t:"newround",dir:wind,windStreak:this.noteWind(wind),next:this.forecastWind(),nextStorm:this.stormNext}); // NARR-04
      if(storm)this.runStorm(wind); // rule 7: everyone at once, before anyone acts
      for(const i of order){
        const p=this.players[i];
        if(p.done)continue;
        this.takeTurn(p,wind,storm);
        if(this.checkFinish(p)){
          if(this.finishOrder.length===1){
            // final round continues the SAME rotation from the seat after the finisher (#19)
            const sp=order.indexOf(i),lastLap=order.slice(sp+1).concat(order.slice(0,sp));
            for(const j of lastLap){const q=this.players[j];
              if(q.done)continue;
              this.takeTurn(q,wind,storm);this.checkFinish(q);}
            // v2.1: the final lap is the LIKELIEST moment for a raid on the bakery (rule 13c), and
            // if it lands the finisher is no longer finished. Ending here regardless would crown
            // nobody and stop a voyage that is still being sailed — so the voyage only ends if
            // somebody is still home. Otherwise the while-loop simply carries on to the next day.
            if(this.finishOrder.length)return this.resolveEnd();
            break;
          }
        }
      }
    }
    return this.resolveEnd();
  }
  /* v2 rule 12: there is no bakeoff. Every captain who got home collaborates on one bakery — a
     scene, not a mechanic — and BEST BAKER goes to whoever brought the most to it. Ranked on
     crates (all of them, recipe or not), then coins, then who got home first. No flipping: the
     title is earned across the whole voyage, not decided by one last coin. */
  bakeRank(a,b){
    const pa=this.players[a],pb=this.players[b];
    if(pb.ing.length!==pa.ing.length)return pb.ing.length-pa.ing.length;
    if(pb.coins!==pa.coins)return pb.coins-pa.coins;
    return this.finishOrder.indexOf(a)-this.finishOrder.indexOf(b);
  }
  /* NOBODY WINS WITHOUT A FULL RECIPE (Wyatt, 2026-08-06). unfinish() already removes a robbed
     captain from finishOrder at the moment the crate changes hands, so this should never find
     anyone to drop — it is here because the cost of being wrong is crowning a baker with nothing
     to bake, which is the exact bug being fixed, and because rule 13c invites raids on the bakery
     from paths this file cannot enumerate in advance. A check that is merely redundant today is
     the cheapest possible insurance against the next one. */
  eligibleFinishers(){
    return this.finishOrder.filter(i=>!this.needs(this.players[i]).length);
  }
  resolveEnd(){
    this.finishOrder=this.eligibleFinishers();
    if(!this.finishOrder.length){this.ev({t:"end",winner:null});return null;}
    if(this.finishOrder.length===1){this.winner=this.finishOrder[0];this.ev({t:"end",winner:this.winner});return this.winner;}
    const ranked=this.finishOrder.slice().sort((a,b)=>this.bakeRank(a,b));
    this.winner=ranked[0];
    this.ev({t:"collab",finishers:ranked.slice(),winner:this.winner,
      crates:ranked.map(i=>this.players[i].ing.length),coins:ranked.map(i=>this.players[i].coins)});
    this.ev({t:"end",winner:this.winner});
    return this.winner;
  }
}

// Fixed "Round World" ruleset (the recommended big-game preset), sized to the player count.
function roundCfg(strategies){
  const np=strategies.length;
  // v2 rule 11b (Wyatt, 2026-08-04): 3 crates per island at 3–4 players, 1 at 2 players. v1 gave
  // 2p unlimited islands to avoid two ships deadlocking over a single crate; under v2 that
  // deadlock is gone because crates are BOUGHT rather than won on a flip, so the scarcity can
  // stand. Note the consequence, which he was shown and accepted: with 1 crate left on an island
  // the price formula puts every 2-player crate at 5🌕.
  const crates=np===2?1:3;
  return {grid:15,nIslands:7,recipeSize:5,crates,startCoins:3,
    // rule 9c: powder still 2 up front. rule 9b: another 2 buys a fresh broadside, repeatable.
    powder:2,refire:2,callBounty:2,
    // rule 10: heads finds treasure, tails is a turn of dock work. rule 11: price = 6 − crates left.
    // TREASURE PAYS 5, NOT 6 (Wyatt, 2026-08-08: "Can we lower treasure to 5?" then "Carry it
    // across to v2"). Tuned first in /v2bakeoff/ and brought here so the two builds share one
    // economy. Measured over 400 voyages of THIS build, normal length (<=30 days):
    //   pays 6 -> a captain ends holding a median of 4 coins, mean 5.3, 21% end broke
    //   pays 5 -> median 3, mean 3.5, 29% end broke
    // Crates already absorb ~81% of all dock income, so this is a trim rather than a squeeze:
    // dock income still covers crate spending and no voyage fails to reach a winner because of it.
    dockHeads:5,dockTails:2,crateBase:6,
    dockBuy:true,merchant:true,parley:true,
    // rule 4e: no harbor-tax refund on a struck trade. rule 3: no fishing, so no sardine rule.
    asym:false,storm:0.20,islandW:2,islandH:2,tetris:true,singleDock:true,
    roundBoard:true,unlimitedDock:true,strategies};
}

export { rollStorm, PERSONALITY, PLAN, Game, roundCfg };
