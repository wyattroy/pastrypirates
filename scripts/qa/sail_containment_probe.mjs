#!/usr/bin/env node
/* sail_containment_probe.mjs — WHERE DO THE SAIL SQUARES ACTUALLY LAND ON A PHONE?
 *
 * ADVISORY probe, not a gate. It answers ONE geometric question and prints numbers.
 *
 * WHY THIS SHAPE, AND NOT ANOTHER TRIAL. The bug is real and old: a guest on a phone gets sail
 * squares it cannot tap. `scripts/lib/checks.mjs` caught one again on 2026-09-01 (crew-phone, day
 * 1: "clickable off-screen: sailCell", "a sail square <- nothing (outside any element)"), and
 * src/ui/stage.js records a measurement from 2026-08-29 of six squares at x = -57..-116 and one at
 * x = 400 on a 390-wide screen.
 *
 * IT HAS RESISTED FIXING FOR A SPECIFIC REASON, IN WYATT'S OWN WORDS: "don't touch bubble placement
 * again without a posed comparison — the same seeded sail prompt, before and after, two
 * screenshots. Three probe runs and three 85-minute trials couldn't settle a question that two
 * pictures would have." A driven voyage yields a handful of samples an hour and they swing wildly;
 * three runs of one probe gave 7, 12 and 5 captures with different cause mixes, and every fix
 * shipped on that evidence was reverted. CLAUDE.md rule 26 is the rule that came out of it: when
 * the question is "is this drawn wrong", ask a GEOMETRIC question instead of hunting a rate.
 *
 * SO THIS ASKS THE GEOMETRIC ONE. It reaches the first sail prompt on a phone-sized viewport and
 * measures every `.sailCell` rect against the viewport, reporting exactly which squares are outside
 * and by how many pixels. One run, one answer, no sampling.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: decide anything, or change anything. stage.js already records
 * that "the bbox genuinely contains every square — the fit is not what fails; containment in BOARD
 * coordinates is not containment on SCREEN", and that TWO geometry theories were measured dead
 * there. This prints the ground truth a fix would have to move; it does not theorise about why.
 *
 *   node scripts/qa/sail_containment_probe.mjs [--w=390] [--h=844] [--shot=<path>]
 */
"use strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(fileURLToPath(import.meta.url), "..", "..", "..");
const { openChrome, sleep } = await import(pathToFileURL(path.join(ROOT, "scripts/lib/cdp.mjs")).href);
const { makePlayer, GATE_SRC } = await import(pathToFileURL(path.join(ROOT, "scripts/lib/player.mjs")).href);

const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const W = +arg("w", 390), H = +arg("h", 844);
/* Into sea-trial-shots/, which exists and is gitignored -- NOT the repo root. tree_health_check
   reads a root-level path as a top-level directory and fails the build on one that is not there,
   which is exactly what it caught here. */
const SHOT = arg("shot", path.join(ROOT, "sea-trial-shots", "sail-containment.png"));

const c = await openChrome({
  W, H, dbgPort: 9411, httpPort: 8301, serveRoot: ROOT,
  profileDir: path.join(ROOT, "sea-trial-shots", "prof-sail-probe"),
  mobile: true, dsf: 2,
});

try {
  /* BOOT AND DRIVE WITH THE REPO'S OWN DRIVER, not a hand-rolled click loop. The first version of
     this probe clicked "Play Solo" and then guessed at buttons; it never reached a sail prompt and
     reported "nothing measured", which is the honest output but a wasted run. scripts/lib/player.mjs
     is "the ONE thing that knows how to play the game" (rule 23) and playtest_gate boots it the way
     copied below -- localStorage id, a reload, then GATE_SRC. Re-deriving that is exactly what
     docs/DRIVING-THE-GAME.md exists to stop. */
  const url = `http://127.0.0.1:8301/`;
  await c.nav(url); await sleep(2200);
  await c.ev(`localStorage.clear(); localStorage.setItem('pp_id','qa-sail-probe'); 1`);
  await c.nav(url); await sleep(2600);
  await c.ev(GATE_SRC);

  /* THE GATE'S OWN SOLO BOOT, copied rather than re-guessed: #choiceSolo, then the name modal.
     Two earlier attempts here searched the DOM for a button matching /solo/i, clicked the right
     card, and still never reached a sail prompt -- because the name modal was never answered, so
     the game never started and player.tick() had nothing to drive. */
  const g = await c.ev(`__gate(document.getElementById('choiceSolo'))`);
  if (!g || !g.ok) { console.log("solo card not clickable — nothing measured"); c.close(); process.exit(2); }
  await c.clickXY(g.x, g.y);
  await sleep(800);
  const nm = await c.ev(`__gate(document.getElementById('nameModalInput'))`);
  if (nm && nm.ok) {
    await c.send("Input.dispatchMouseEvent", { type: "mousePressed", x: nm.x, y: nm.y, button: "left", clickCount: 3 });
    await c.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: nm.x, y: nm.y, button: "left", clickCount: 3 });
    await c.type("probe");
    /* #btnNameConfirm, the gate's own selector -- not a text match. My text match looked for
       /start|ok|go|ahoy/ and the button reads "Aye, that's me name", so the modal simply stayed
       open and the game never started. Three silent boot failures came from guessing at the DOM
       instead of copying the id the gate already knows. */
    const b = await c.ev(`__gate(document.getElementById('btnNameConfirm'))`);
    if (b && b.ok) await c.clickXY(b.x, b.y);
  }
  await sleep(2600);

  const player = makePlayer(c, { log: (m) => console.log("  [drive]", m) });
  let cells = 0;
  for (let i = 0; i < 60 && cells === 0; i++) {
    await c.ev(GATE_SRC);
    cells = await c.ev(`document.querySelectorAll(".sailCell").length`);
    if (cells) break;
    try { await player.tick(); } catch (e) { /* keep driving */ }
    await sleep(500);
  }
  console.log("sail squares on screen:", cells);
  if (!cells) {
    /* LOOK, do not guess again. Three boot attempts failed silently before this line existed; a
       screenshot and the visible text answer in one run what another round of DOM guessing does
       not (rule 19). */
    await c.shot(path.join(ROOT, "sea-trial-shots", "sail-probe-stuck.png"));
    const where = await c.ev(`JSON.stringify({
      day: (document.body.innerText.match(/DAY \d+/)||["none"])[0],
      modal: !!document.getElementById("nameModalInput"),
      buttons: [...document.querySelectorAll("button,.apBtn")].filter(b=>b.offsetParent).map(b=>(b.textContent||"").trim().slice(0,22)).slice(0,8),
      text: document.body.innerText.replace(/\s+/g," ").slice(0,180)
    })`);
    console.log("stuck at:", where);
    console.log("screenshot: sea-trial-shots/sail-probe-stuck.png");
  }
  if (!cells) { console.log("NO SAIL PROMPT REACHED — nothing measured. Not a result about the game."); c.close(); process.exit(2); }

  await sleep(1200); // let the 180ms camera fit and its lerp finish

  const report = await c.ev(`(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const out = [];
    document.querySelectorAll(".sailCell").forEach(el => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hitEl = document.elementFromPoint(cx, cy);
      out.push({
        gx: el.dataset.gx, gy: el.dataset.gy,
        left: Math.round(r.left), top: Math.round(r.top),
        right: Math.round(r.right), bottom: Math.round(r.bottom),
        w: Math.round(r.width), h: Math.round(r.height),
        centreOutside: cx < 0 || cy < 0 || cx > vw || cy > vh,
        anyOutside: r.left < 0 || r.top < 0 || r.right > vw || r.bottom > vh,
        hit: hitEl ? (hitEl.className && hitEl.className.baseVal !== undefined ? hitEl.className.baseVal : String(hitEl.className || hitEl.tagName)).slice(0, 28) : null,
      });
    });
    return JSON.stringify({ vw, vh, cells: out });
  })()`);

  const r = JSON.parse(report);
  const outside = r.cells.filter(x => x.anyOutside);
  const centreOut = r.cells.filter(x => x.centreOutside);
  const unhittable = r.cells.filter(x => x.hit === null);

  console.log(`\nviewport ${r.vw}x${r.vh}   sail squares: ${r.cells.length}`);
  console.log(`squares with ANY part outside the viewport: ${outside.length}`);
  console.log(`squares whose CENTRE is outside (untappable):  ${centreOut.length}`);
  console.log(`squares whose centre hits NOTHING at all:      ${unhittable.length}`);
  for (const x of outside) {
    const how = [];
    if (x.left < 0) how.push(`${-x.left}px off the LEFT`);
    if (x.top < 0) how.push(`${-x.top}px off the TOP`);
    if (x.right > r.vw) how.push(`${x.right - r.vw}px off the RIGHT`);
    if (x.bottom > r.vh) how.push(`${x.bottom - r.vh}px off the BOTTOM`);
    console.log(`  (${x.gx},${x.gy}) ${x.w}x${x.h} at [${x.left},${x.top}] — ${how.join(", ")}${x.centreOutside ? "  ⚠ CENTRE OUTSIDE" : ""}${x.hit === null ? "  ⚠ HITS NOTHING" : ""}`);
  }
  /* RED-PROOF THE INSTRUMENT BEFORE BELIEVING "0 OUTSIDE". A containment probe that cannot see an
     off-screen square would report a clean board on a broken one, and this project has already paid
     for three checks that measured something other than what they named (CLAUDE.md rule 6). So:
     shove the board sideways by a whole viewport and re-measure. If the count does not move, the
     measurement above proves nothing and says so. The shove is undone immediately -- it is a probe,
     not a change. */
  const proof = await c.ev(`(() => {
    const el = document.querySelector(".sailCell"); if (!el) return "no cell";
    const host = el.closest("svg") || el.parentElement; if (!host) return "no host";
    const prev = host.style.transform;
    host.style.transform = "translateX(-2000px)";
    let outside = 0;
    document.querySelectorAll(".sailCell").forEach(e => {
      const r = e.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) outside++;
    });
    host.style.transform = prev;
    return String(outside);
  })()`);
  const proved = /^\d+$/.test(proof) && +proof > 0;
  console.log(`
red-proof: with the board shoved a viewport sideways, the probe sees ${proof} square(s) outside` +
    (proved ? " — it CAN detect the fault it is looking for." : " — ⚠ IT CANNOT. Treat the count above as unproven."));

  await c.shot(SHOT);
  console.log(`\nscreenshot: ${SHOT}`);
  console.log(centreOut.length || unhittable.length
    ? "\nRESULT: squares are unreachable on this viewport — the ground truth a fix has to move."
    : "\nRESULT: every square is reachable on this viewport. Not a proof of the general case: one board, one seed.");
} finally {
  c.close();
}
