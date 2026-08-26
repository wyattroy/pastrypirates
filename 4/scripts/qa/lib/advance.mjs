/* ADVANCE ONE CLIENT THROUGH WHATEVER IT IS BEING ASKED — the piece every crew probe needs.
 *
 * Written after three probes stalled on three different screens, each time because they knew how to
 * answer ONE thing and the game asked something else first. The intro order in a crew game is:
 * lobby -> Ahoy barrier -> recipe picker (TWO taps per card) -> lots ceremony -> turns.
 *
 * IT CARRIES THE DOCUMENTED TRAPS so no future probe re-learns them:
 *   §3b  "Start the voyage!" is NOT the button that starts the voyage — #btnStart opens a
 *        confirmation and #btnConfirmStart sails.
 *   §3c  a recipe card takes TWO taps: the card, then the "Bake this!" overlay it reveals.
 *   §4a  the flippenator coin #flipCoinWrap IS the flip button; it is not an .apBtn.
 *   T-15 a narration box with NO text in it is mid-reveal, not a screen to click through — three
 *        probes clicked the very card they were hunting straight off the screen.
 *   never offsetParent: it is null for anything position:fixed, so it reports live controls dead.
 */
export const VIS = `(e)=>{if(!e)return false;const r=e.getBoundingClientRect();const s=getComputedStyle(e);
  return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';}`;

export const STEP = `(()=>{
  const vis=${VIS};
  const bake=[...document.querySelectorAll('#actionPanel .apBtn, .recipeCard button, .recipeCard .bakeThis')]
    .filter(vis).find(e=>/bake this/i.test(e.textContent||''));
  if(bake){bake.click();return "recipe:commit"}
  const card=[...document.querySelectorAll('.recipeCard')].filter(vis)[0];
  if(card){card.click();return "recipe:highlight"}
  const coin=document.getElementById('flipCoinWrap');
  if(coin&&coin.classList.contains('active')&&vis(coin)){coin.click();return "flip"}
  const msg=[...document.querySelectorAll('#actionPanel .apMsg')].filter(vis)[0];
  if(msg&&!(msg.innerText||'').trim())return "waiting:blank";
  const btn=[...document.querySelectorAll('#actionPanel .apBtn:not([disabled]), #actionPanel .btlBtn:not([disabled])')]
    .filter(vis).filter(e=>!/back/i.test(e.textContent||''))[0];
  if(btn){btn.click();return "button:"+(btn.textContent||'').trim().slice(0,18)}
  if(document.querySelectorAll('.sailCell').length)return "sail";
  return "idle";
})()`;

/* SAIL IS A DESTINATION FOR THE CLIENT UNDER TEST AND A CHORE FOR EVERY OTHER ONE. The first
   version returned "sail" for everybody and never clicked one, so the HOST parked on its own sail
   prompt and the turn never reached the guest the probe was waiting for — 18 identical "host: sail"
   lines and an INCONCLUSIVE. A driver that refuses to take its turn cannot produce the state it is
   hunting. Never picks the stay square: that is the thing under test, and clicking it would answer
   the question the probe is asking. */
export const SAIL = `(()=>{
  const vis=${VIS};
  const cells=[...document.querySelectorAll('.sailCell')]
    .filter(vis).filter(e=>!e.classList.contains('pp4StayCell'));
  if(!cells.length)return "no-cell";
  cells[Math.floor(cells.length/2)].dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return "sailed";
})()`;

export async function startCrewVoyage(H, sleep) {
  await H.ev(`(()=>{const b=document.getElementById('btnStart');
    if(b&&b.getBoundingClientRect().width>10){b.click();return true}return false})()`);
  await sleep(1200);
  await H.waitFor(`(()=>{const b=document.getElementById('btnConfirmStart');
    return !!(b&&b.getBoundingClientRect().width>10)})()`, 20000, "host: Everyone's aboard?");
  await H.ev(`document.getElementById('btnConfirmStart').click();true`);
  await sleep(2500);
}

/* BOUNDED TWICE — iterations and the caller's own budget — because an unbounded probe is how a
   laptop gets hot while its owner is asleep. */
export async function advanceUntil(clients, until, sleep, { steps = 120, log = null, watch = [] } = {}) {
  for (let i = 0; i < steps; i++) {
    for (const [name, C] of clients) {
      const hit = await until(C, name);
      if (hit) return { hit, name, i };
    }
    for (const [name, C] of clients) {
      const did = await C.ev(STEP);
      // a client that is not the one under test takes its turn rather than blocking the table
      if (did === "sail" && !watch.includes(name)) {
        const r = await C.ev(SAIL);
        if (log) log(`  ${name}: sail -> ${r}`);
      } else if (log && did !== "idle" && did !== "waiting:blank") log(`  ${name}: ${did}`);
    }
    await sleep(800);
  }
  return null;
}
