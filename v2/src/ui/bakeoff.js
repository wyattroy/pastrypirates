// src/ui/bakeoff.js
//
// THE BAKE-OFF, on screen. Five mixing bowls on a bench; the captain watches them shuffle, then
// names them back in the recipe's own order.
//
// WHAT THIS FILE IS AND IS NOT. It is a hand-built interaction inside #actionPanel, modelled on
// localPickCell (src/ui/flow.js): build with panel(html,true), wire onclick by hand, resolve a
// promise, and register appState.activePickCleanup so the shot clock can tear it down. It is NOT a
// modal — modals in this game are fire-and-forget (`style.display="flex"`) and cannot block a turn.
//
// THE UI NEVER DECIDES ANYTHING. The engine shuffles (Game.bakeSetup) and the engine scores
// (Game.bakeResolve). This file animates the swap list the engine already applied, collects a
// guess, and then animates the verdict it is handed. That separation is the whole reason the
// animation cannot disagree with the answer — a bug that would be invisible until somebody lost a
// bake they had played correctly.
//
// PERF-01: only `transform` and `opacity` are animated anywhere below. This project has a Safari
// post-mortem about exactly that (a live-composited rain overlay took the board to ~2fps), and the
// rule has held since.

import { appState } from "../state/index.js";
import { ING_IMG, iconImg, CUPCAKE_IMG } from "../shared/index.js";
import { recipeSteps } from "../shared/recipe-steps.js";
import { panel, setNeedsAction, GHOST_FADE_MS } from "./panel.js";

const $=(id)=>document.getElementById(id);
// module-local, as every other src/ui/ file keeps its own
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

/* ================= timings ================= */
// PREVIEW is the study window — long enough to place five ingredients spatially, short enough to
// feel like a fairground. SWAP is per swap, and is the number that must stay readable: if a player
// cannot count the swaps the puzzle is not hard, it is arbitrary. REVEAL is per bowl, lifted one at
// a time in recipe order so a run of three correct builds before a miss lands.
const PREVIEW_MS=2500, COVER_MS=280, SWAP_MS=500, SETTLE_MS=120, REVEAL_MS=520, VERDICT_MS=1300;

// Reduced motion is read in JS, not CSS, for the same reason panel() does it: a media query cannot
// reach a setTimeout. It does NOT collapse to zero — the swaps have to stay countable or the game
// becomes unplayable, so they become instant repositions with a visible flash instead.
let reduced=false;
try{
  if(typeof window!=="undefined"&&window.matchMedia){
    const q=window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced=q.matches;
    const onChange=(e)=>{reduced=e.matches;};
    if(q.addEventListener)q.addEventListener("change",onChange);
    else if(q.addListener)q.addListener(onChange);
  }
}catch(err){}

/* ================= the recipe card ================= */
// One line per step: the ordinal, the ingredient's OWN ICON, and the wording. The icon is drawn
// from the same array the answer is built from (recipeSteps().ings), so the card physically cannot
// show an icon that disagrees with what the bowl is hiding — and it is the same art that appears
// under the bowl, which is what makes matching a glance rather than a translation
// (Wyatt, 2026-08-06).
function cardHTML(bake){
  const steps=recipeSteps(bake.order);
  const lines=steps?steps.lines:bake.order.map(()=>"");
  return `<ol class="bkoCard">`+bake.order.map((ing,k)=>
    `<li><b>${k+1}</b>${iconImg(ING_IMG[ing])}<span>${lines[k]||""}</span></li>`).join("")+`</ol>`;
}

/* ================= the bench ================= */
// A bowl is: the ingredient art, a dome that slides down over it, and a badge for the number the
// player assigns. `data-pos` is the bowl's PHYSICAL index and never changes — the swap animation
// moves elements visually and then commits by swapping their contents, so a bowl's identity as
// "position 2 on the bench" is stable for the whole attempt. Anything else and the player's spatial
// memory would be tracking a lie.
// stepOfSlot(order,slots) — for each bench position, the recipe step it holds, 1-based, or null.
// Only ever SHOWN for locked bowls, whose contents are public knowledge.
function stepOfSlot(order,slots){
  const out=new Array(slots.length).fill(null);
  order.forEach((ing,k)=>{ const pos=slots.indexOf(ing); if(pos>=0)out[pos]=k+1; });
  return out;
}

// `slots` is what the bench LOOKS LIKE right now, which during a live attempt is the engine's
// pre-shuffle arrangement (setup.before) — NOT bake.slots, which the engine has already advanced to
// the post-shuffle answer. See shuffleSlots' own note for what conflating the two shipped.
function benchHTML(bake,slots){
  // A LOCKED BOWL KEEPS ITS STEP NUMBER ON SHOW. Without it a retry hands the player three solved
  // bowls and no way to tell WHICH steps they solved — measured at 360px, attempt 2 showed
  // cinnamon, flour and milk sitting open with nothing saying those were steps 5, 3 and 1, so the
  // only route to "I still owe 2 and 4" was re-deriving it off the card. The number is the answer
  // the player already earned; making them work it out again is a tax on having done well.
  const step=stepOfSlot(bake.order,slots);
  return `<div class="bkoRow">`+slots.map((ing,pos)=>{
    const lk=bake.locked[pos];
    return `<button class="bkoBowl${lk?" locked":""}" data-pos="${pos}" type="button"
       aria-label="${lk?`Bowl ${pos+1}, step ${step[pos]}, already placed`:`Bowl ${pos+1}`}">
       <img class="bkoIng" src="${ING_IMG[ing]}" alt="">
       <span class="bkoDome"></span>
       <span class="bkoNum">${lk?step[pos]:""}</span>
     </button>`;}).join("")+`</div>`;
}

// "2", "2 and 4", "2, 4 and 5" — the ordinals of the steps still owed, from 0-based step indices.
function listSteps(steps){
  const n=steps.map(k=>k+1);
  if(n.length<=1)return String(n[0]||"");
  return n.slice(0,-1).join(", ")+" and "+n[n.length-1];
}

function shellHTML(p,bake,slots,hint){
  const att=bake.attempts+1;
  return `<div class="bko">
    <div class="bkoHd">${iconImg(CUPCAKE_IMG)} The Bake-Off<span class="bkoAtt">attempt ${att}</span></div>
    ${cardHTML(bake)}
    ${benchHTML(bake,slots)}
    <div class="bkoHint" id="bkoHint">${hint}</div>
    <div class="bkoBtns"><button class="apBtn bkoGo" id="bkoGo" type="button" disabled>Bake it!</button></div>
  </div>`;
}

/* ================= the interaction ================= */

// playBakeoffLive(p) — the whole human attempt, start to finish, resolving to a guess: an array of
// BOWL INDICES in recipe order (guess[k] = the bowl the player says holds step k). Locked steps
// resolve to null, which scoreAttempt already accepts.
//
// `setup.swaps` is the engine's own list. Animating that rather than re-deriving one is the single
// most important line in this file.
export async function playBakeoffLive(p,setup){
  const bake=p.bake;
  const n=bake.order.length;

  // setup.before, NOT bake.slots: the engine already advanced bake.slots to the post-shuffle answer
  // when it built this setup, so rendering from it would preview the solution and then shuffle a
  // second time. Falls back to bake.slots only if a caller hands over a setup from before `before`
  // existed, which at least keeps a live voyage running.
  const shown=setup.before?setup.before.slice():bake.slots.slice();
  panel(shellHTML(p,bake,shown,"Watch closely — the bowls are about to move."),true);
  const row=document.querySelector("#actionPanel .bkoRow");
  if(!row)return setup.fallbackGuess||null;
  const bowls=[...row.querySelectorAll(".bkoBowl")];

  // MEASURED ONCE, never per frame: the centre-to-centre distance between two bowls, used for the
  // swap translate. Reading it inside the animation loop would be a layout thrash on the one screen
  // that is already the busiest.
  const pitch=bowls.length>1?(bowls[1].getBoundingClientRect().left-bowls[0].getBoundingClientRect().left):0;

  // ---- phase 0: let the previous line's GHOST finish fading ----
  // panel() clones the outgoing .apMsg and cross-fades it over GHOST_FADE_MS as an absolutely
  // positioned overlay. Every other prompt in the game hides under it harmlessly because
  // typewriterReveal blanks the incoming text until the fade ends — but this shell has no .apMsg to
  // blank, so at 360px the last narration line painted straight across the recipe card and the
  // bench for 800ms. The preview is the one moment the player MUST be able to read the bench, so it
  // does not begin until the ghost is gone. Costs nothing when there is no ghost (a first line, or
  // an explicit clear), and the wait is measured off panel.js's own exported constant rather than a
  // second copy of the duration.
  if(document.querySelector("#actionPanel .apMsg.fadeOut"))await sleep(GHOST_FADE_MS+80);

  // ---- phase 1: preview, bowls open ----
  await sleep(reduced?Math.round(PREVIEW_MS*0.6):PREVIEW_MS);

  // ---- phase 2: domes down ----
  bowls.forEach(b=>{ if(!b.classList.contains("locked"))b.classList.add("covered"); });
  await sleep(reduced?60:COVER_MS);

  // ---- phase 3: the swaps, one at a time ----
  for(const [a,b] of setup.swaps){
    const A=bowls[a],B=bowls[b];
    if(!A||!B)continue;
    if(reduced){
      A.classList.add("flash");B.classList.add("flash");
      await sleep(340);
      A.classList.remove("flash");B.classList.remove("flash");
    }else{
      const d=(b-a)*pitch;
      A.style.transition=`transform ${SWAP_MS}ms ease-in-out`;
      B.style.transition=`transform ${SWAP_MS}ms ease-in-out`;
      A.style.transform=`translateX(${d}px)`;
      B.style.transform=`translateX(${-d}px)`;
      await sleep(SWAP_MS);
    }
    // COMMIT by swapping the two bowls' CONTENTS, then clearing the transform. The elements stay
    // where they are in the DOM, so `data-pos` keeps meaning "this place on the bench" and the next
    // swap's arithmetic stays trivial. (FLIP-lite: animate, then reconcile.)
    const ia=A.querySelector(".bkoIng"),ib=B.querySelector(".bkoIng");
    const t=ia.getAttribute("src");ia.setAttribute("src",ib.getAttribute("src"));ib.setAttribute("src",t);
    A.style.transition="";B.style.transition="";
    A.style.transform="";B.style.transform="";
    await sleep(reduced?40:SETTLE_MS);
  }

  // ---- phase 4: arm, and take taps ----
  // The shot clock is armed HERE, not when the prompt opened: ~4.5s of preview and shuffle would
  // otherwise eat a sixth of a 30s window before the player could act.
  const guess=new Array(n).fill(null);
  // steps already solved on an earlier attempt are not asked about again
  const openSteps=[];
  for(let k=0;k<n;k++){
    const solvedBowl=bake.slots.indexOf(bake.order[k]);
    if(solvedBowl>=0&&bake.locked[solvedBowl])guess[k]=solvedBowl; else openSteps.push(k);
  }

  const hint=$("bkoHint");
  // On a retry the instruction "tap in recipe order" is true but unhelpful — the order that remains
  // is 2 then 4, not 1 to 5, and saying so is the difference between the player counting and the
  // player playing.
  if(hint)hint.textContent=openSteps.length===n
    ?"Tap the bowls in recipe order. Tap again to undo."
    :`${openSteps.length} left — tap them for step${openSteps.length>1?"s":""} ${listSteps(openSteps)}. Tap again to undo.`;
  setNeedsAction(true);

  return await new Promise(resolve=>{
    const picks=[];                       // bowl indices, in the order tapped
    const go=$("bkoGo");
    const paint=()=>{
      bowls.forEach((b,pos)=>{
        if(b.classList.contains("locked"))return;   // its badge is its earned step number — leave it
        const at=picks.indexOf(pos);
        b.querySelector(".bkoNum").textContent=at>=0?String(openSteps[at]+1):"";
        b.classList.toggle("picked",at>=0);
      });
      if(go)go.disabled=picks.length!==openSteps.length;
    };
    const finish=()=>{
      appState.activePickCleanup=null;
      setNeedsAction(false);
      openSteps.forEach((k,i)=>{guess[k]=picks[i];});
      resolve(guess);
    };
    // the shot clock's teardown hook: it may force this panel closed at any moment, and the engine
    // will fall back to the bot's guess, so this only has to stop leaking handlers.
    appState.activePickCleanup=()=>{appState.activePickCleanup=null;setNeedsAction(false);};

    bowls.forEach((b,pos)=>{
      if(b.classList.contains("locked"))return;
      b.onclick=()=>{
        const at=picks.indexOf(pos);
        if(at>=0)picks.splice(at,1);          // tap again to undo, and everything after renumbers
        else if(picks.length<openSteps.length)picks.push(pos);
        paint();
      };
    });
    if(go)go.onclick=()=>{ if(picks.length===openSteps.length)finish(); };
    paint();
  });
}

// bakeoffReveal(p,setup,result) — phase 5. Called AFTER the engine has scored, and animates its
// verdict: bowls lift one at a time in recipe order, each stamped right or wrong, then the correct
// ones settle into their lock.
export async function bakeoffReveal(p,result){
  const bake=p.bake;
  const row=document.querySelector("#actionPanel .bkoRow");
  if(!row)return;
  const bowls=[...row.querySelectorAll(".bkoBowl")];
  const hint=$("bkoHint");
  // The confirm button is spent — the guess is already scored. Left live it stayed fully enabled and
  // clickable right through the reveal (visible in the 360px screenshot), inviting a second press on
  // a decision that has already resolved.
  const go=$("bkoGo");
  if(go){go.disabled=true;go.textContent="In the oven…";}
  if(hint)hint.textContent="Lifting the bowls…";
  for(let k=0;k<bake.order.length;k++){
    const bowl=bake.slots.indexOf(bake.order[k]);
    const el=bowls[bowl];
    if(!el)continue;
    el.classList.remove("covered","picked");
    // Stamp the step number as the bowl comes off. A row of green and pink outlines says HOW MANY
    // landed but not WHICH — and "which" is the only thing the player can act on next attempt.
    const num=el.querySelector(".bkoNum");
    if(num)num.textContent=String(k+1);
    el.classList.add(result.correct[k]?"right":"wrong");
    await sleep(reduced?Math.round(REVEAL_MS*0.5):REVEAL_MS);
  }
  if(hint){
    const got=result.correct.filter(Boolean).length;
    hint.textContent=result.perfect?"Every bowl in its place — ye baked it!"
      :`${got} of 5 in place. Those stay put; the rest get shuffled again tomorrow.`;
  }
  await sleep(VERDICT_MS);
}
