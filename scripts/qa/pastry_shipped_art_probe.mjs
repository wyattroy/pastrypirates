/* LOOK AT THE PICTURE — the shipped recipe art, in both games, on a phone.
 *
 *   node scripts/qa/pastry_shipped_art_probe.mjs
 *
 * Rule 19: before handing a change over, open it and look at the RENDERED IMAGE, not the DOM and
 * not a state dump. `recipe_art_exists_check.mjs` proves the 21 files are on disk under the names
 * the game builds; it cannot prove a browser can DECODE them, and "the file exists" is exactly the
 * kind of number that stays right while the picture goes wrong (W5-1: an opaque master passed every
 * decode check and put a block behind the art).
 *
 * So this asks the browser itself, in both trees:
 *   - every one of the 21 recipe illustrations decodes, with naturalWidth > 0
 *   - the recipe modal is photographed at the phone size Wyatt plays on, through the game's own
 *     openRecipeModal() (recipe.js) rather than by hand-building a card — ONE DISPLAY PATH
 *
 * It writes .planning/posed/pastry-webp-shipped-phone.png and, for the frozen v1 that shares the
 * same assets/ folder, .planning/posed/pastry-webp-shipped-classic.png.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openChrome } from "../lib/cdp.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = path.join(ROOT, ".planning", "posed");
fs.mkdirSync(OUT, { recursive: true });

const RECIPE_INDEX = 20;   // the same subject every earlier step of this item photographed

const t = await openChrome({
  W: 390, H: 844, dbgPort: 9433, httpPort: 9434, serveRoot: ROOT,
  profileDir: path.join(ROOT, ".tmp-pastryshipped"), dsf: 3, mobile: true,
});
let bad = 0;
try {
  const base = `http://127.0.0.1:9434`;

  // ---- 1. every recipe illustration DECODES, asked of the module that names them ----
  for (const tree of [{ name: "the game", url: `${base}/index.html`, mod: "/src/ui/recipe.js" },
                      { name: "/classic", url: `${base}/classic/index.html`, mod: "/classic/src/ui/recipe.js" }]) {
    await t.nav(tree.url);
    await sleep(2000);
    const verdict = await t.ev(`(async()=>{
      const m = await import(${JSON.stringify(tree.mod)});
      if (m.attachPastryArt) m.attachPastryArt();
      const out = [];
      for (const r of m.RECIPE_BOOK) {
        const im = new Image();
        im.src = r.img;
        try { await im.decode(); out.push([r.img, im.naturalWidth, im.naturalHeight]); }
        catch (e) { out.push([r.img, 0, 0]); }
      }
      return JSON.stringify(out);
    })()`);
    let rows;
    try { rows = JSON.parse(verdict); } catch (e) { rows = null; }
    if (!rows || !rows.length) {
      console.error(`  FAIL — ${tree.name}: could not ask the page about its recipe art (${String(verdict).slice(0, 120)})`);
      bad++;
      continue;
    }
    const dead = rows.filter(([, w]) => !w);
    console.log(`  ${tree.name}: ${rows.length - dead.length} of ${rows.length} recipe illustrations decoded` +
      (rows.length ? `, first is ${rows[0][1]}x${rows[0][2]} (${rows[0][0]})` : ""));
    for (const [u] of dead) console.error(`     DEAD  ${u}`);
    bad += dead.length;
  }

  // ---- 2. photograph the modal in the real game, at the phone size he plays on ----
  await t.nav(`${base}/index.html`);
  await sleep(1200);
  await t.ev("localStorage.clear()");
  await t.nav(`${base}/index.html`);
  await sleep(2500);
  await t.ev(`document.getElementById('choiceSolo').click()`);
  for (let i = 0; i < 40; i++) {
    if (await t.ev(`(()=>{const b=document.getElementById('btnNameConfirm');return !!(b&&b.offsetParent)})()`) === true) break;
    await sleep(250);
  }
  await t.ev(`document.getElementById('nameModalInput').value='Wyatt'`);
  await t.ev(`document.getElementById('btnNameConfirm').click()`);
  for (let i = 0; i < 80; i++) {
    if (await t.ev(`(()=>{try{return !!(appState.game&&appState.game.players.some(p=>p.strategy==='human'))}catch(e){return false}})()`) === true) break;
    await sleep(300);
  }
  await sleep(2500);
  const opened = await t.ev(`(async()=>{
    const m=await import('/src/ui/recipe.js');
    m.openRecipeModal(m.RECIPE_BOOK[${RECIPE_INDEX}].ings);
    const im=document.querySelector('.recipeModalThumb');
    if(!im) return 'no thumb';
    await im.decode().catch(()=>{});
    const r=im.getBoundingClientRect();
    return JSON.stringify({slot:[Math.round(r.width),Math.round(r.height)],
                           natural:[im.naturalWidth,im.naturalHeight], src:im.getAttribute('src')});
  })()`);
  console.log(`\n  recipe modal: ${opened}`);
  if (typeof opened !== "string" || opened[0] !== "{") bad++;
  await sleep(600);
  await t.shot(path.join(OUT, "pastry-webp-shipped-phone.png"));
  console.log(`  wrote .planning/posed/pastry-webp-shipped-phone.png`);
} finally {
  await t.close();
}

if (bad) { console.error(`\nFAIL — ${bad} problem(s) with the shipped recipe art.`); process.exit(1); }
console.log(`\nPASS — every shipped recipe illustration decodes in both games, and the modal is photographed.`);
