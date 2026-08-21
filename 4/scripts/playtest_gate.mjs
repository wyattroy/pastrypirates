// playtest_gate.mjs — THE GATE, as Wyatt specified it (2026-08-21): "go to the website and play an
// entire game from start to finish while looking at every screen and making sure that it looks
// right, and do this in all the modes" + "play them FULLY. click all the buttons; make sure
// everything works."
//
// ARCHITECTURE (deliberately general — no per-bug assertions anywhere):
//   lib/player.mjs  — plays FULLY: coverage-first button choices, real mouse, every click must
//                     produce an effect (dead buttons are findings), side quests (menu/chat/recipe).
//   lib/checks.mjs  — five UNIVERSAL structural rules run on every distinct screen (nothing
//                     off-screen/occluded/piled/clipped, panels hug content).
//   lib/vision.mjs  — the automatic vision judge (Wyatt's pick): a model looks at every distinct
//                     screen the way he does and says PASS/FAIL with reasons. `claude -p`, no keys.
//   this file       — the legs (modes × sizes), boot flows, verdicts, contact sheets, exit code.
//
// LEGS (default all): solo-desktop, solo-phone, passplay-phone, crew-desktop.
//   Crew plays to the TRUE end-of-voyage (Wyatt's ruling) with players named test1/test2 so the
//   permanent Firebase gamelog rows are trivially filterable from any future player-data analysis.
//
// Usage: node 4/scripts/playtest_gate.mjs [--legs=solo-desktop,...] [--out=DIR] [--port=8800]
//        [--dbg=9800] [--judge=on|off] [--model=claude-sonnet-5] [--max-min=35] [--parallel=2]
// Exit 1 on any failure. Keeps every screenshot + a contact sheet per leg. Read them.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { REPO } from "./lib/chrome.mjs";
import { openChrome, sleep } from "./lib/cdp.mjs";
import { MEASURE, structuralChecks } from "./lib/checks.mjs";
import { judgeAll } from "./lib/vision.mjs";
import { makePlayer, sideQuests, GATE_SRC } from "./lib/player.mjs";

const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const LEGS = arg("legs", "solo-desktop,solo-phone,passplay-phone,crew-desktop").split(",");
const OUT = path.resolve(arg("out", path.join(process.cwd(), "playtest-gate")));
const PORT0 = +arg("port", 8800), DBG0 = +arg("dbg", 9800);
const JUDGE = arg("judge", "on") !== "off";
const MODEL = arg("model", "claude-sonnet-5");
const MAX_MS = +arg("max-min", 35) * 60_000;
const PAR = Math.max(1, +arg("parallel", 2));
const JUDGE_CAP = 30;                     // distinct screens judged per leg (all get structural checks)
fs.mkdirSync(OUT, { recursive: true });
const T0 = Date.now();
const log = (...a) => { const s = `[${((Date.now() - T0) / 1000 | 0) + ""}s] ` + a.join(" "); console.log(s); fs.appendFileSync(path.join(OUT, "log.txt"), s + "\n"); };
const ownPorts = { dbg: new Set(), http: new Set() };
const killAll = () => { for (const d of ownPorts.dbg) { try { execSync(`pkill -f "remote-debugging-port=${d}"`, { stdio: "ignore" }); } catch {} }
  for (const h of ownPorts.http) { try { execSync(`pkill -f "http.server ${h}"`, { stdio: "ignore" }); } catch {} } };
process.on("exit", killAll); for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => { killAll(); process.exit(1); });

// ONE http server for the whole run (fresh port per gate invocation = fresh module cache). Legs
// must NOT own servers: the contact sheet renders after a leg's Chrome closes, and a per-leg server
// would already be dead by then. Do not edit game files while the gate runs — this serves the disk.
import { spawn } from "node:child_process";
const SRV = spawn("python3", ["-m", "http.server", String(PORT0)], { cwd: REPO, stdio: "ignore" });
ownPorts.http.add(PORT0);
process.on("exit", () => { try { SRV.kill("SIGKILL"); } catch {} });
await sleep(900);

// ---------- boot flows (from docs/DRIVING-THE-GAME.md §3/§3b/§5c — the documented ways in) -------
/* THE GATE'S GAMES ARE STAMPED SO REAL PLAYER DATA CAN BE READ WITHOUT THEM (Wyatt, 2026-08-21).
   A finished game writes a permanent, undeletable row to the shared `gamelogs/` node, and that
   payload records `names` (what each player typed) and `pid` (the browser's stored player id) —
   verified in orchestrator.js writeGameLog(). His plan is to name the players test1/test2 so the
   rows filter out of any later analysis; this pins the id too, so there are TWO independent
   handles and a real player who happens to type "test1" is never mistaken for the harness.
   Nothing in the game reads gamelogs back, so these rows cannot affect what any player sees. */
const QA_PLAYER_ID = "qa-playtest-gate";
async function freshPage(c, idSuffix = "a") {
  await c.nav(`http://127.0.0.1:${c.httpPort}/4/`); await sleep(2200);
  // each browser needs its OWN id or the second one rejoins as the first's seat (§5c) — the shared
  // prefix is what makes both filterable, the suffix is what keeps them distinct captains.
  await c.ev(`localStorage.clear(); localStorage.setItem('pp_id', ${JSON.stringify(QA_PLAYER_ID)} + '-' + ${JSON.stringify(idSuffix)}); 1`);
  await c.nav(`http://127.0.0.1:${c.httpPort}/4/`); await sleep(2600);
  await c.ev(GATE_SRC);
}
async function nameModal(c, name) {
  await sleep(800);
  const g = await c.ev(`__gate(document.getElementById('nameModalInput'))`);
  if (g && g.ok) { await c.send("Input.dispatchMouseEvent", { type: "mousePressed", x: g.x, y: g.y, button: "left", clickCount: 3 });
    await c.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: g.x, y: g.y, button: "left", clickCount: 3 });
    await c.type(name); }
  const b = await c.ev(`__gate(document.getElementById('btnNameConfirm'))`);
  if (!b || !b.ok) throw new Error("name confirm not clickable");
  await c.clickXY(b.x, b.y);
}
async function bootSolo(c, name) {
  await freshPage(c, "solo");
  const g = await c.ev(`__gate(document.getElementById('choiceSolo'))`); if (!g || !g.ok) throw new Error("solo card not clickable");
  await c.clickXY(g.x, g.y); await nameModal(c, name);
}
async function bootPassPlay(c, names) {
  await freshPage(c, "pp");
  const g = await c.ev(`__gate(document.getElementById('choicePassPlay'))`); if (!g || !g.ok) throw new Error("pass&play card not clickable");
  await c.clickXY(g.x, g.y); await nameModal(c, names[0]); await sleep(700);
  await c.ev(`(() => { const v = ${JSON.stringify(names)}; for (let i = 0; i < 4; i++) { const el = document.getElementById('ppName' + i); if (el) el.value = v[i] || ''; } return 1; })()`);
  const s = await c.ev(`__gate(document.getElementById('btnStartPassPlay'))`); if (!s || !s.ok) throw new Error("pass&play start not clickable");
  await c.clickXY(s.x, s.y);
}
async function bootHost(c, name) {
  await freshPage(c, "host");
  const g = await c.ev(`__gate(document.getElementById('choiceHost'))`); if (!g || !g.ok) throw new Error("host card not clickable");
  await c.clickXY(g.x, g.y); await nameModal(c, name);
  // UI-05: hosting creates the room outright; wait for the 4-letter code
  const t0 = Date.now(); let code = "";
  while (Date.now() - t0 < 30_000) { await sleep(600);
    code = await c.ev(`(document.getElementById('roomCode')||{textContent:''}).textContent.trim()`);
    if (/^[A-Z0-9]{4}$/.test(code)) return code; }
  throw new Error("room code never appeared: " + JSON.stringify(code));
}
async function bootJoin(c, name, code) {
  await freshPage(c, "guest");
  const g = await c.ev(`__gate(document.getElementById('choiceJoin'))`); if (!g || !g.ok) throw new Error("join card not clickable");
  await c.clickXY(g.x, g.y); await nameModal(c, name); await sleep(700);
  await c.ev(`(() => { const jc = document.getElementById('joinCode'); if (jc) jc.value = ${JSON.stringify(code)};
    const jn = document.getElementById('joinName'); if (jn) jn.value = ${JSON.stringify(name)}; return 1; })()`);
  const b = await c.ev(`__gate(document.getElementById('btnJoin'))`); if (!b || !b.ok) throw new Error("join button not clickable");
  await c.clickXY(b.x, b.y);
}
async function hostStart(c) {
  // wait for Start to appear (guest seated), then the two-step confirm (§3b)
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

// ---------- one seat's play loop: tick, capture every distinct screen, structural-check it -------
async function playSeat(c, tag, rec, { untilOver = true, quests = true } = {}) {
  const player = makePlayer(c, { log: (m) => log(`  [${tag}] ${m}`) });
  rec.player = player.P;
  let shotN = 0, questsDone = false, lastDay = -1;
  const t0 = Date.now();
  while (Date.now() - t0 < MAX_MS) {
    await sleep(650);
    await c.ev(GATE_SRC);
    // capture + structurally check every screen we have not seen before
    const f = await player.captureIfNew(OUT, tag, ++shotN);
    if (f) {
      const m = await c.ev(MEASURE);
      const checks = (m && !m.__err) ? structuralChecks(m) : [{ ok: false, rule: "measure", what: String(m && m.__err) }];
      const fails = checks.filter(k => !k.ok);
      rec.screens.push({ shot: f, sig: player.P.screens.at(-1).sig, fails });
      if (fails.length) for (const k of fails) log(`  [${tag}] STRUCT FAIL ${k.rule}: ${k.what}`);
    } else shotN--;
    const st = await player.state();
    if (st && st.day !== lastDay) { lastDay = st.day; log(`  [${tag}] DAY ${st.day}`); }
    if (st && st.over) { log(`  [${tag}] END OF VOYAGE at day ${st.day}`);
      const f2 = `${OUT}/${tag}-eov.png`; await c.shot(f2); rec.screens.push({ shot: f2, sig: "end of voyage", fails: [] });
      rec.finished = true; return; }
    // side quests once the game is properly underway (day 2+, between prompts)
    if (quests && !questsDone && st && st.day >= 2) { questsDone = true; await sideQuests(c, player, (m) => log(`  [${tag}] ${m}`)); }
    await player.tick();
    if (!untilOver && st && st.day >= 3) { rec.finished = true; return; }   // (unused today; kept for cheap smoke legs)
  }
  rec.finished = false;
  // never report a stall without first ruling out the environment (see ensureVisible)
  const wasHidden = await player.ensureVisible();
  log(`  [${tag}] TIMED OUT after ${MAX_MS / 60000} min without reaching the end of voyage` +
      (wasHidden ? " — BUT THE TAB WAS HIDDEN, so the game had correctly paused itself; this is NOT a game stall" : ""));
}

// ---------- verdicts --------------------------------------------------------------------------
function legVerdict(rec) {
  const v = [];
  if (!rec.finished) v.push("did not finish the voyage");
  const structFails = rec.screens.flatMap(s => s.fails);
  if (structFails.length) v.push(`${structFails.length} structural check failure(s)`);
  for (const seat of rec.seats || [rec]) {
    const P = seat.player; if (!P) continue;
    if (P.deadButtons.length) v.push(`${P.deadButtons.length} dead control(s): ${P.deadButtons.map(d => d.label).slice(0, 5).join(", ")}`);
    if (P.findings.length) v.push(`${P.findings.length} unreachable control(s): ${P.findings.map(f => f.what).slice(0, 3).join("; ")}`);
    // coverage: a kind the game OFFERED but the player never successfully exercised
    const unexercised = [...P.coverage.entries()].filter(([k, r]) => r.seen > 2 && r.clicked === 0 && !/back|menu close|chat close/.test(k)).map(([k]) => k);
    if (unexercised.length) v.push(`offered but never exercised: ${unexercised.join(", ")}`);
  }
  if (rec.consoleErrs && rec.consoleErrs.length) v.push(`${rec.consoleErrs.length} console error(s): ${rec.consoleErrs[0]}`);
  const judgeFails = (rec.judged || []).filter(j => j.r.verdict === "FAIL");
  if (judgeFails.length) v.push(`vision judge FAILED ${judgeFails.length} screen(s)`);
  const judgeErrs = (rec.judged || []).filter(j => j.r.verdict === "ERROR");
  if (judgeErrs.length) v.push(`vision judge errored on ${judgeErrs.length} screen(s) — those screens are NOT cleared`);
  return v;
}

async function contactSheet(rec, tag, idx) {
  try {
    const c = await openChrome({ W: 1700, H: 1000, dbgPort: DBG0 + 90 + idx, httpPort: null, serveRoot: REPO, profileDir: path.join(OUT, "prof-sheet-" + tag) });
    ownPorts.dbg.add(DBG0 + 90 + idx);
    const tiles = rec.screens.map(s => { const j = (rec.judged || []).find(x => x.shot === s.shot);
      const bad = s.fails.length || (j && j.r.verdict !== "PASS");
      return { cap: `${path.basename(s.shot)} · ${s.fails.length ? "STRUCT×" + s.fails.length : "struct ok"}${j ? " · judge " + j.r.verdict : ""}`,
        notes: [...s.fails.map(f => f.what), ...((j && j.r.issues) || [])], src: path.basename(s.shot), bad }; });
    const html = `<!doctype html><body style="margin:0;background:#1c2f38;color:#fff;font:13px/1.35 -apple-system,sans-serif">
      <div style="padding:12px 16px;font-size:16px">playtest_gate · ${tag} · ${rec.finished ? "finished voyage" : "DID NOT FINISH"} · ${new Date().toISOString().slice(0, 16)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 16px 16px">${tiles.map(t =>
        `<div style="background:#0f1d24;border:2px solid ${t.bad ? "#ff2d55" : "#27c78d"};border-radius:8px;padding:7px">
         <div style="font-weight:bold;margin-bottom:5px">${t.cap}</div><img src="${t.src}" style="width:100%;display:block;border-radius:4px;background:#000">
         ${t.notes.map(n => `<div style="color:#ff8fa5;margin-top:3px">✗ ${String(n).replace(/</g, "&lt;")}</div>`).join("")}</div>`).join("")}</div></body>`;
    fs.writeFileSync(path.join(OUT, `contact-${tag}.html`), html);
    const rel = path.relative(REPO, path.join(OUT, `contact-${tag}.html`)).split(path.sep).join("/");
    await c.nav(`http://127.0.0.1:${PORT0}/${rel}`); await sleep(1200);
    await c.ev("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))");
    const h = await c.ev("document.documentElement.scrollHeight");
    await c.send("Emulation.setDeviceMetricsOverride", { width: 1700, height: Math.max(400, Math.min(h || 0, 16000)), deviceScaleFactor: 1, mobile: false }); await sleep(400);
    await c.shot(path.join(OUT, `contact-${tag}.png`)); c.close();
    log(`[${tag}] contact sheet: ${path.join(OUT, `contact-${tag}.png`)}`);
  } catch (e) { log(`[${tag}] contact sheet failed: ${e.message}`); }
}

// ---------- legs ------------------------------------------------------------------------------
/* `mobile` and `dsf` are not decoration: without them a 390px window still reports
   `pointer: fine`, so the phone legs were exercising the DESKTOP branch of anything that asks what
   kind of pointer it has — D-40's "Tap and hold" vs "Click and hold" among them, which is how a
   phone screenshot came back saying "Click". A phone leg that does not emulate a phone is testing
   the wrong game. */
const legDefs = {
  "solo-desktop":  { W: 1890, H: 960 },
  "solo-phone":    { W: 390, H: 844, mobile: true, dsf: 2 },
  "passplay-phone":{ W: 390, H: 844, mobile: true, dsf: 2 },
  "crew-desktop":  { W: 1890, H: 960, guestW: 1400, guestH: 900 },
};

async function runLeg(name, idx) {
  const def = legDefs[name]; if (!def) { log(`unknown leg ${name}`); return { name, verdict: ["unknown leg"] }; }
  const rec = { name, screens: [], consoleErrs: [], seats: [] };
  const dbg = DBG0 + idx * 4;
  ownPorts.dbg.add(dbg); ownPorts.dbg.add(dbg + 1);
  let host = null, guest = null;
  try {
    host = await openChrome({ W: def.W, H: def.H, dbgPort: dbg, httpPort: null, serveRoot: REPO,
      profileDir: path.join(OUT, `prof-${name}-a`), mobile: !!def.mobile, dsf: def.dsf || 1 });
    host.httpPort = PORT0;   // navigate against the run's shared server
    if (name === "crew-desktop") {
      // Wyatt's ruling: crew plays to the TRUE end; players are test1/test2 so the permanent
      // gamelog rows are filterable. Two separate Chromes = separate localStorage/pp_id (§5c).
      const code = await bootHost(host, "test1");
      log(`[${name}] room ${code} created by test1`);
      guest = await openChrome({ W: def.guestW, H: def.guestH, dbgPort: dbg + 1, httpPort: null, serveRoot: REPO, profileDir: path.join(OUT, `prof-${name}-b`) });
      guest.httpPort = PORT0;
      await bootJoin(guest, "test2", code);
      log(`[${name}] test2 joined ${code}`);
      await hostStart(host);
      const recA = { screens: rec.screens, finished: false }, recB = { screens: rec.screens, finished: false };
      rec.seats = [recA, recB];
      await Promise.all([playSeat(host, `${name}-host`, recA), playSeat(guest, `${name}-guest`, recB, { quests: true })]);
      rec.finished = recA.finished || recB.finished;
    } else {
      const seat = { screens: rec.screens, finished: false }; rec.seats = [seat];
      if (name === "passplay-phone") await bootPassPlay(host, ["Davy Scones", "Peg Leg Meg"]);
      else await bootSolo(host, "Davy Scones");   // the long name — the one that cliped, on purpose
      await playSeat(host, name, seat);
      rec.finished = seat.finished;
    }
    rec.consoleErrs.push(...host.consoleErrs.slice(0, 10)); if (guest) rec.consoleErrs.push(...guest.consoleErrs.slice(0, 10));
  } catch (e) {
    rec.error = String(e.message || e); log(`[${name}] ERROR: ${rec.error}`);
    try { if (host) { const f = `${OUT}/${name}-error.png`; await host.shot(f); rec.screens.push({ shot: f, sig: "ERROR", fails: [{ ok: false, rule: "run", what: rec.error }] }); } } catch {}
  } finally { try { if (host) host.close(); } catch {} try { if (guest) guest.close(); } catch {} }
  // vision judge over every distinct screen (capped)
  if (JUDGE && rec.screens.length) {
    const items = rec.screens.slice(0, JUDGE_CAP).map(s => ({ path: s.shot, context: `${name} — ${s.sig.slice(0, 60)}`, shot: s.shot }));
    log(`[${name}] vision-judging ${items.length} screen(s)…`);
    const results = await judgeAll(items, { concurrency: 3, model: MODEL, onEach: (it, r) => { if (r.verdict !== "PASS") log(`  [judge ${r.verdict}] ${path.basename(it.shot)}: ${(r.issues || []).slice(0, 2).join("; ")}`); } });
    rec.judged = items.map((it, i) => ({ shot: it.shot, r: results[i] }));
  }
  await contactSheet(rec, name, idx);
  rec.verdict = legVerdict(rec);
  if (rec.error) rec.verdict.push("leg error: " + rec.error);
  return rec;
}

// ---------- main ------------------------------------------------------------------------------
const results = [];
{ let next = 0; await Promise.all(Array.from({ length: Math.min(PAR, LEGS.length) }, async () => {
    while (next < LEGS.length) { const i = next++; results[i] = await runLeg(LEGS[i], i); } })); }

let anyFail = false;
for (const r of results) {
  const ok = r.verdict.length === 0;
  if (!ok) anyFail = true;
  log(`\n== ${r.name}: ${ok ? "PASS" : "FAIL"}${r.finished ? "" : " (voyage incomplete)"}`);
  for (const v of r.verdict) log(`   ✗ ${v}`);
  const P = (r.seats && r.seats[0] && r.seats[0].player) ? r.seats[0].player : null;
  if (P) log(`   coverage: ${[...P.coverage.entries()].map(([k, c]) => `${k}:${c.clicked}/${c.seen}`).join("  ")}`);
}
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, (k, v) => v instanceof Map ? Object.fromEntries(v) : k === "screens" && Array.isArray(v) && v.length > 60 ? v.slice(0, 60) : v, 2));
log(anyFail ? "\nRESULT: FAIL" : "\nRESULT: PASS");
killAll(); process.exit(anyFail ? 1 : 0);
