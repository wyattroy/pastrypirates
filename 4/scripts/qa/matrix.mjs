/* THE COVERAGE MATRIX — one command, every check, every mode, every width.
 *
 * Wyatt, 2026-08-26: "I want you to design a unit test for every single feature and option in the
 * game and run every single mode, every single device size, every single thing through them as your
 * QA pass. we need a different process here."
 *
 * WHAT THIS REPLACES, and why it had to: the first attempt at that instruction produced TEN
 * SEPARATE SCRIPTS, each named after one bug, eight of them solo-only, all at 390px, and NONE wired
 * into npm test. 22 fixes shipped with 4 verified. A script named after a bug can only ever answer
 * that bug in whatever mode it happened to boot, and it is never run again.
 *
 * THE RULE THAT FELL OUT OF THAT, and it is the point of this file: THE RIG IS NOT A BUG. When the
 * crew rig hung it was parked under a per-bug budget, which silently turned "test every mode" into
 * "test solo" — and nothing said so out loud. A cell that does not run is reported as NOT RUN, in
 * its own column, because the number that matters is the one nobody wants to print.
 *
 *   node 4/scripts/qa/matrix.mjs                 all modes, all widths
 *   node 4/scripts/qa/matrix.mjs --mode=solo     one mode
 *   node 4/scripts/qa/matrix.mjs --quick         phone width only
 *
 * Everything is bounded twice (iterations AND wall clock) and everything is killed at the end.
 */
import { serve, launch, attach, makeHost, makeGuest, driver, killAll, sleep } from "../mp_rig.mjs";
import { CHECKS } from "./checks.mjs";

const ARG = s => (process.argv.find(a => a.startsWith(s)) || "").split("=")[1];
const QUICK = process.argv.includes("--quick");
const ONLY_MODE = ARG("--mode");

const WIDTHS = QUICK
  ? [{ name: "phone", w: 390, h: 844, dsf: 2, mobile: true }]
  : [{ name: "phone", w: 390, h: 844, dsf: 2, mobile: true },
     { name: "tablet", w: 820, h: 1180, dsf: 2, mobile: true },
     { name: "desktop", w: 1280, h: 900, dsf: 1, mobile: false }];

const MODES = ["solo", "passplay", "crew"].filter(m => !ONLY_MODE || m === ONLY_MODE);

let port = 8600, dbg = 9400;
const say = (...a) => console.log(...a);

/* ---- one cell: boot the mode at the width, play, sample every check ------- */
async function runCell(mode, size) {
  const tag = `${mode}/${size.name}`;
  const t0 = Date.now();
  const cell = { mode, size: size.name, results: {}, note: null };
  for (const c of CHECKS) cell.results[c.id] = { seen: 0, ok: 0, fail: 0, why: null };

  const PORT = port++, DBG_A = dbg++, DBG_B = dbg++;
  const url = serve(PORT);
  let A = null, B = null;
  try {
    launch(DBG_A, `/tmp/chrome-mx-${PORT}a`);
    A = await attach(DBG_A);
    await A.send("Emulation.setDeviceMetricsOverride",
      { width: size.w, height: size.h, deviceScaleFactor: size.dsf, mobile: size.mobile });

    if (mode === "crew") {
      launch(DBG_B, `/tmp/chrome-mx-${PORT}b`);
      B = await attach(DBG_B);
      await B.send("Emulation.setDeviceMetricsOverride",
        { width: size.w, height: size.h, deviceScaleFactor: size.dsf, mobile: size.mobile });
      say(`  ${tag}: hosting…`);
      const code = await makeHost(A, url, "Host");
      say(`  ${tag}: room ${code}, joining…`);
      await makeGuest(B, url, code, "Guest");
      await sleep(2000);
      say(`  ${tag}: setting sail…`);
      await A.ev(`(()=>{const b=document.getElementById('btnStart');
        if(b&&b.getBoundingClientRect().width>10){b.click();return true}return false})()`);
      await sleep(1200);
      await A.waitFor(`(()=>{const b=document.getElementById('btnConfirmStart');
        return !!(b&&b.getBoundingClientRect().width>10)})()`, 25000, "Everyone's aboard?");
      await A.ev(`document.getElementById('btnConfirmStart').click();true`);
      await sleep(2500);
      await driver(A, url);            // the host plays on so the guest keeps being asked
      await driver(B, url);            // the guest plays its own turns too
    } else {
      await A.goto(url);
      await A.waitFor(`document.readyState==='complete'`, 25000, "load");
      await A.ev(`localStorage.clear();localStorage.setItem('pp_id','mx-'+Math.floor(Math.random()*1e9));true`);
      await A.goto(url);
      await A.waitFor(`document.readyState==='complete'`, 25000, "reload");
      await sleep(1000);
      const btn = mode === "solo" ? "choiceSolo" : "choicePassPlay";
      await A.waitFor(`(()=>{const e=document.getElementById('${btn}');return !!(e&&e.getBoundingClientRect().width>10)})()`, 20000, btn);
      await A.ev(`document.getElementById('${btn}').click();true`);
      await sleep(800);
      if (await A.ev(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.getBoundingClientRect().width>10)})()`)) {
        await A.ev(`document.getElementById('nameModalInput').value='Davy Probe';document.getElementById('btnNameConfirm').click();true`);
        await sleep(900);
      }
      if (mode === "passplay") {
        await A.waitFor(`(()=>{const b=document.getElementById('btnStartPassPlay');return !!(b&&b.getBoundingClientRect().width>10)})()`, 20000, "pass&play names");
        await A.ev(`['Davy Probe','Dough Hook','Flaky Jack','Crustbeard'].forEach((n,i)=>{const e=document.getElementById('ppName'+i);if(e)e.value=n;});
                    document.getElementById('btnStartPassPlay').click();true`);
        await sleep(2000);
      }
      await sleep(1500);
      await driver(A, url);
    }

    /* ---- play, sampling every check on the tier that matters -------------- */
    // For crew the GUEST is the tier that has never been verified, so it is the one sampled.
    const S = mode === "crew" ? B : A;
    const BEATS = mode === "crew" ? 45 : 40;
    for (let i = 0; i < BEATS; i++) {
      for (const c of CHECKS) {
        let r;
        try { r = JSON.parse(await S.ev(c.expr)); } catch (e) { continue; }
        const slot = cell.results[c.id];
        if (r.skip) continue;
        slot.seen++;
        if (r.ok) slot.ok++;
        else { slot.fail++; if (!slot.why) slot.why = r.why; }
      }
      await sleep(900);
    }
    await S.shot(`matrix-${mode}-${size.name}.png`);
  } catch (e) {
    cell.note = String(e.message || e).slice(0, 120);
    say(`  ${tag}: DID NOT RUN — ${cell.note}`);
  } finally {
    killAll();
    await sleep(400);
  }
  cell.secs = Math.round((Date.now() - t0) / 1000);
  return cell;
}

/* ---- run the matrix ------------------------------------------------------ */
say(`\nCOVERAGE MATRIX — ${MODES.length} mode(s) x ${WIDTHS.length} width(s) x ${CHECKS.length} checks = ${MODES.length*WIDTHS.length*CHECKS.length} cells\n`);
const cells = [];
for (const mode of MODES) for (const size of WIDTHS) {
  say(`▶ ${mode} @ ${size.name} (${size.w}x${size.h})`);
  cells.push(await runCell(mode, size));
}

/* ---- the table ----------------------------------------------------------- */
const verdict = (cell, id) => {
  const r = cell.results[id];
  if (cell.note) return "—";                 // the cell never ran
  if (!r.seen) return "·";                   // never reached: NOT RUN, not a pass
  return r.fail ? "FAIL" : "ok";
};
const colw = Math.max(...CHECKS.map(c => c.id.length)) + 2;
say(`\n${"".padEnd(colw)}${cells.map(c => `${c.mode}/${c.size}`.padEnd(17)).join("")}`);
for (const c of CHECKS) say(`${c.id.padEnd(colw)}${cells.map(x => verdict(x, c.id).padEnd(17)).join("")}`);

let green = 0, red = 0, notrun = 0;
const failures = [];
for (const cell of cells) for (const c of CHECKS) {
  const v = verdict(cell, c.id);
  if (v === "ok") green++;
  else if (v === "FAIL") { red++; failures.push(`${cell.mode}/${cell.size}  ${c.id} — ${cell.results[c.id].why}`); }
  else notrun++;
}
say(`\n  green ${green}   FAIL ${red}   NOT RUN ${notrun}   of ${green+red+notrun}`);
for (const cell of cells) if (cell.note) say(`  cell ${cell.mode}/${cell.size} never ran: ${cell.note}`);
if (failures.length) { say("\nFAILURES:"); for (const f of failures) say("  - " + f); }
say("");
process.exit(red ? 1 : 0);
