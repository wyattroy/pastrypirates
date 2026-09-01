#!/usr/bin/env node
/* sail_containment_crew_probe.mjs — THE SAME GEOMETRIC QUESTION, ON THE SEAT WHERE THE BUG WAS
 * ACTUALLY CAUGHT.
 *
 * `sail_containment_probe.mjs` asked "are the sail squares reachable on a phone viewport?" and got
 * a NEGATIVE result on solo (390x844, first sail prompt: 0 outside, 0 unreachable) — the failure was
 * caught on a CREW GUEST (`crew-phone`, `sea-trial-shots/crew-phone-guest-006-settled.png`, DAY 1:
 * "clickable off-screen: sailCell", "a sail square <- nothing (outside any element)"). Solo and
 * crew-guest are different DIRECTORS (guest listens; host drives — CLAUDE.md rule 23), so a clean
 * solo board proves nothing about the guest path. This probe reaches the guest's own first sail
 * prompt in a real two-browser crew room and asks the identical geometric question there.
 *
 * Boot flow copied from scripts/playtest_gate.mjs (bootHost/bootJoin/hostStart, crew-phone's own
 * viewport: 390x664) rather than re-guessed — docs/DRIVING-THE-GAME.md exists to stop that.
 *
 * WYATT'S RULE 26: "don't touch bubble placement again without a posed comparison — the same seeded
 * sail prompt, before and after, two screenshots." This probe is the "before" half: it prints the
 * room code (so a re-run can be compared) and screenshots BOTH host and guest at the moment the
 * guest holds its first sail prompt, settled.
 *
 *   node scripts/qa/sail_containment_crew_probe.mjs
 */
"use strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(fileURLToPath(import.meta.url), "..", "..", "..");
const { openChrome, sleep } = await import(pathToFileURL(path.join(ROOT, "scripts/lib/cdp.mjs")).href);
const { GATE_SRC, makePlayer } = await import(pathToFileURL(path.join(ROOT, "scripts/lib/player.mjs")).href);
const { gameURL } = await import(pathToFileURL(path.join(ROOT, "scripts/lib/chrome.mjs")).href);

const HTTP_PORT = 8302;
const OUTDIR = path.join(ROOT, "sea-trial-shots");

// crew-phone's own geometry, copied from playtest_gate.mjs LEGS — both seats phone-sized, because a
// crew game between two phones is what he and a friend actually play.
const W = 390, H = 664;

async function freshPage(c, idSuffix) {
  await c.nav(gameURL(c.httpPort)); await sleep(2200);
  await c.ev(`localStorage.clear(); localStorage.setItem('pp_id', 'qa-sail-crew-probe-${idSuffix}'); 1`);
  await c.nav(gameURL(c.httpPort)); await sleep(2600);
  await c.ev(GATE_SRC);
}
async function nameModal(c, name) {
  await sleep(800);
  const g = await c.ev(`__gate(document.getElementById('nameModalInput'))`);
  if (g && g.ok) {
    await c.send("Input.dispatchMouseEvent", { type: "mousePressed", x: g.x, y: g.y, button: "left", clickCount: 3 });
    await c.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: g.x, y: g.y, button: "left", clickCount: 3 });
    await c.type(name);
  }
  const b = await c.ev(`__gate(document.getElementById('btnNameConfirm'))`);
  if (!b || !b.ok) throw new Error("name confirm not clickable");
  await c.clickXY(b.x, b.y);
}
async function bootHost(c, name) {
  await freshPage(c, "host");
  const g = await c.ev(`__gate(document.getElementById('choiceHost'))`); if (!g || !g.ok) throw new Error("host card not clickable");
  await c.clickXY(g.x, g.y); await nameModal(c, name);
  const t0 = Date.now(); let code = "";
  while (Date.now() - t0 < 30_000) { await sleep(600);
    code = await c.ev(`(document.getElementById('roomCode')||{textContent:''}).textContent.trim()`);
    if (/^[A-Z0-9]{4}$/.test(code)) return code; }
  throw new Error("room code never appeared: " + JSON.stringify(code));
}
async function bootJoin(c, name, code) {
  await freshPage(c, "guest");
  const g = await c.ev(`__gate(document.getElementById('choiceJoin'))`); if (!g || !g.ok) throw new Error("join card not clickable");
  await c.clickXY(g.x, g.y); await sleep(700);
  const hasModal = await c.ev(`(()=>{const m=document.getElementById('nameModal');
    return !!(m && getComputedStyle(m).display !== 'none');})()`);
  if (hasModal) { await nameModal(c, name); await sleep(700); }
  await c.ev(`(() => { const jc = document.getElementById('joinCode'); if (jc) jc.value = ${JSON.stringify(code)};
    const jn = document.getElementById('joinName'); if (jn) jn.value = ${JSON.stringify(name)}; return 1; })()`);
  const b = await c.ev(`__gate(document.getElementById('btnJoin'))`); if (!b || !b.ok) throw new Error("join button not clickable");
  await c.clickXY(b.x, b.y);
}
async function hostStart(c) {
  const t0 = Date.now();
  while (Date.now() - t0 < 60_000) { await sleep(700);
    const b = await c.ev(`__gate(document.getElementById('btnStart'))`);
    if (b && b.ok) { await c.clickXY(b.x, b.y); break; } }
  await sleep(1000);
  const t1 = Date.now();
  while (Date.now() - t1 < 20_000) { await sleep(600);
    const b = await c.ev(`__gate(document.getElementById('btnConfirmStart'))`);
    if (b && b.ok) { await c.clickXY(b.x, b.y); return; } }
  throw new Error("start confirm never clickable");
}

/* DRIVE BOTH SEATS UNTIL THE GUEST HOLDS A SAIL PROMPT, CHECKING BEFORE EVERY TICK ON EITHER SIDE.
   player.tick()'s own answerSail() would CLICK a sail square the instant one appears -- exactly the
   state this probe exists to measure before anything touches it. So .sailCell is checked on the
   guest immediately before every tick call (host's or guest's), never after, and the loop stops the
   moment one appears rather than letting tick() answer it. */
async function driveUntilGuestSail(host, guest, maxIters = 220) {
  const hp = makePlayer(host, { log: () => {} });
  const gp = makePlayer(guest, { log: () => {} });
  const guestHasCells = async () => {
    await guest.ev(GATE_SRC);
    return await guest.ev(`document.querySelectorAll(".sailCell").length`);
  };
  for (let i = 0; i < maxIters; i++) {
    if (await guestHasCells()) return true;
    try { await hp.tick(); } catch (e) { /* keep driving */ }
    if (await guestHasCells()) return true;
    try { await gp.tick(); } catch (e) { /* keep driving */ }
    await sleep(250);
  }
  return false;
}

// the same geometric question sail_containment_probe.mjs asks, run against whichever page is passed
async function measureSailCells(c, label) {
  const cells = await c.ev(`document.querySelectorAll(".sailCell").length`);
  if (!cells) return { label, cells: 0 };
  await sleep(1200); // let the camera fit and its lerp finish
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
    /* WIDEN THE TIME HORIZON (CLAUDE.md rule 27): before guessing at a cause, measure whether the
       stage-hold mechanism (src/ui/stage.js camTo(): a centre-stage card or the flip veil defers a
       requested camera move) was actually in play at the moment the squares were measured -- not
       "was it plausible", an actual read of the same two DOM signals stageHoldsAttention() itself
       reads, plus whether the turn-announcement narration bubble was still up and not yet .out. */
    const ap = document.getElementById("actionPanel");
    const diag = {
      bodyClasses: document.body.className,
      apPp4Stage: ap ? (ap.dataset.pp4Stage || null) : null,
      bubCount: document.querySelectorAll(".pp4Bub").length,
      bubOutCount: document.querySelectorAll(".pp4Bub.out").length,
    };
    return JSON.stringify({ vw, vh, cells: out, diag });
  })()`);
  return { label, cells: JSON.parse(report) };
}

function printReport(r) {
  const { label, cells } = r;
  if (!cells || cells === 0) { console.log(`[${label}] NO SAIL PROMPT REACHED — nothing measured.`); return; }
  const outside = cells.cells.filter(x => x.anyOutside);
  const centreOut = cells.cells.filter(x => x.centreOutside);
  const unhittable = cells.cells.filter(x => x.hit === null);
  console.log(`\n[${label}] viewport ${cells.vw}x${cells.vh}   sail squares: ${cells.cells.length}`);
  console.log(`[${label}] squares with ANY part outside the viewport: ${outside.length}`);
  console.log(`[${label}] squares whose CENTRE is outside (untappable):  ${centreOut.length}`);
  console.log(`[${label}] squares whose centre hits NOTHING at all:      ${unhittable.length}`);
  for (const x of outside) {
    const how = [];
    if (x.left < 0) how.push(`${-x.left}px off the LEFT`);
    if (x.top < 0) how.push(`${-x.top}px off the TOP`);
    if (x.right > cells.vw) how.push(`${x.right - cells.vw}px off the RIGHT`);
    if (x.bottom > cells.vh) how.push(`${x.bottom - cells.vh}px off the BOTTOM`);
    console.log(`  (${x.gx},${x.gy}) ${x.w}x${x.h} at [${x.left},${x.top}] — ${how.join(", ")}${x.centreOutside ? "  ⚠ CENTRE OUTSIDE" : ""}${x.hit === null ? "  ⚠ HITS NOTHING" : ""}`);
  }
  if ((centreOut.length || unhittable.length) && cells.diag) {
    console.log(`[${label}] diag at measurement time: body classes="${cells.diag.bodyClasses}"  actionPanel.dataset.pp4Stage=${JSON.stringify(cells.diag.apPp4Stage)}  narration bubbles on screen=${cells.diag.bubCount} (${cells.diag.bubOutCount} already .out)`);
  }
  return { centreOut: centreOut.length, unhittable: unhittable.length, outside: outside.length };
}

let host = null, guest = null;
try {
  host = await openChrome({ W, H, dbgPort: 9412, httpPort: HTTP_PORT, serveRoot: ROOT,
    profileDir: path.join(OUTDIR, "prof-sail-crew-host"), mobile: true, dsf: 2 });
  const code = await bootHost(host, "test1");
  console.log("room code:", code, "— re-run to compare; the seed is random per room, not yet pinned.");

  guest = await openChrome({ W, H, dbgPort: 9413, httpPort: HTTP_PORT,
    profileDir: path.join(OUTDIR, "prof-sail-crew-guest"), mobile: true, dsf: 2 });
  await bootJoin(guest, "test2", code);

  await hostStart(host);
  await sleep(2000);

  /* MEASURE EVERY GUEST SAIL DECISION IN THIS VOYAGE, NOT ONLY THE FIRST. The originally caught
     screenshot (crew-phone-guest-006-settled.png) was already several turns in (the guest's hold
     was not empty) — "the first prompt reached" and "the prompt that actually failed" are not
     provably the same moment. This is still ONE posed room, not a rate across separate runs: every
     occurrence is measured exactly, and the loop stops the instant one reproduces the bug. */
  const MAX_OCCURRENCES = 12;
  let reproduced = null;
  for (let occ = 1; occ <= MAX_OCCURRENCES; occ++) {
    const reached = await driveUntilGuestSail(host, guest);
    if (!reached) { console.log(`\nno further guest sail prompt reached after ${occ - 1} occurrence(s) — voyage may have ended or stalled.`); break; }

    const day = await guest.ev(`(document.body.innerText.match(/DAY \\d+/) || ["day?"])[0]`);
    const guestReport = await measureSailCells(guest, `GUEST #${occ} (${day})`);
    const shotG = path.join(OUTDIR, `sail-crew-guest-${String(occ).padStart(2, "0")}.png`);
    const shotH = path.join(OUTDIR, `sail-crew-host-${String(occ).padStart(2, "0")}.png`);
    await guest.shot(shotG);
    await host.shot(shotH);
    const stats = printReport(guestReport);

    if (stats && (stats.centreOut || stats.unhittable)) {
      reproduced = { occ, day, stats, shotG, shotH };
      console.log(`\n*** REPRODUCED at occurrence #${occ} (${day}) — screenshots: ${shotG}, ${shotH} ***`);
      break;
    }
    // advance PAST this occurrence's sail decision so driveUntilGuestSail can reach the next one
    const gp = makePlayer(guest, { log: () => {} });
    try { await gp.tick(); } catch (e) { /* keep driving */ }
  }

  if (reproduced) {
    console.log(`\nRESULT: REPRODUCED — the guest has an untappable sail square at occurrence #${reproduced.occ} (${reproduced.day}). Ground truth for a fix.`);
  } else {
    console.log(`\nRESULT: every guest sail square was reachable across all ${MAX_OCCURRENCES} occurrences measured in this room. Not proof of the general case — re-run to sample another room.`);
  }
} finally {
  try { if (host) host.close(); } catch {}
  try { if (guest) guest.close(); } catch {}
}
