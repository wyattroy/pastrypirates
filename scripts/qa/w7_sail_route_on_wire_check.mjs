/* W7 — THE ROUTE NEVER REACHES THE WIRE, SO THE GUEST'S BOAT DOES NOT SAIL IT.
 *
 * Wyatt saw this in a two-tab crew game: the host's boat threads between the islands and the
 * guest's boat slides in a straight line, cutting across land.
 *
 * The shape of it, in this tree:
 *   - the engine computes a REAL legal path — Game.sailPath (src/engine/index.js)
 *   - only src/ui/flow.js asks for that path, and only src/ui/flow.js walks it (animateSailRoute)
 *   - flow.js's turn loop runs under runLiveNet(), which src/orchestrator.js attaches on the HOST ONLY
 *   - the event published to the guest is {t:"sail", p:<seat>} plus Game.ev's baked snapshot, and
 *     that snapshot carries each captain's FINAL pos and nothing about how it got there
 *   - the guest consumes through watchEvents -> consumeEvent, assigns p.pos, and calls render(),
 *     which glides the ship from wherever it was straight to the destination
 *
 * So the route is computed, drawn once on the host, and thrown away. There is nothing on the wire
 * for a guest to walk even if it wanted to.
 *
 * THIS GATE IS RED ON PURPOSE UNTIL THAT IS FIXED. It asserts the REQUIREMENT (a route reaches the
 * wire and the guest walks it), not the current behaviour — so it goes green when the defect goes,
 * and it cannot be satisfied by anything less.
 *
 * WHY IT IS STATIC. All the parity gates in this suite are assertions on source text; a live
 * two-browser measurement of this needs Firebase and real timing and would flake, and a flaky gate
 * gets switched off. What a static gate CANNOT see is named in the report: whether the guest's
 * glide actually crosses land on any given board.
 *
 * RUN IT AGAINST A DIFFERENT TREE:  node scripts/qa/w7_sail_route_on_wire_check.mjs --tree=/some/copy
 * (used to red-proof it: a hand-edited copy where the route IS on the wire makes it pass.)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments as strip } from "./lib/strip_comments.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const treeArg = process.argv.find(a => a.startsWith("--tree="));
const TREE = treeArg ? path.resolve(treeArg.slice(7)) : REPO;

let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };
/* An instrument that reports NOT FOUND has told you about ITSELF, not about the world. If the
   subject is missing, this gate must ABORT loudly rather than pass on an empty search. */
const missed = m => { console.log("INSTRUMENT DID NOT REACH ITS SUBJECT — " + m); process.exit(2); };

const read = rel => {
  const p = path.join(TREE, rel);
  if (!fs.existsSync(p)) missed(`${rel} does not exist under ${TREE}`);
  return fs.readFileSync(p, "utf8");
};
const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

const engine = read("src/engine/index.js");
const flow   = read("src/ui/flow.js");
const orch   = read("src/orchestrator.js");

/* ─── STEP 0. PROVE THE INSTRUMENT TOUCHED ITS SUBJECT ────────────────────────────────────────
   Every pattern below is reported with the file:line it matched, so a reader can check that this
   gate looked at the real thing and not at an empty string. */
const subj = {};
{
  const m = engine.match(/\n\s*sailPath\s*\(/);
  if (!m) missed("src/engine/index.js has no sailPath( — the engine's legal-path search. Re-anchor this gate; do not delete it.");
  subj.sailPath = `src/engine/index.js:${lineOf(engine, m.index + 1)}`;

  const w = flow.match(/export\s+async\s+function\s+animateSailRoute\s*\(/);
  if (!w) missed("src/ui/flow.js has no animateSailRoute( — the only code that walks a route square by square.");
  subj.walker = `src/ui/flow.js:${lineOf(flow, w.index)}`;

  const b = engine.match(/o\.state\s*=\s*this\.players\.map\(/);
  if (!b) missed("src/engine/index.js: Game.ev() no longer bakes o.state — that bake IS the wire payload this gate inspects.");
  subj.bake = `src/engine/index.js:${lineOf(engine, b.index)}`;

  const c = orch.match(/export\s+async\s+function\s+consumeEvent\s*\(/);
  if (!c) missed("src/orchestrator.js has no consumeEvent( — the one event consumer the guest draws from.");
  subj.consumer = `src/orchestrator.js:${lineOf(orch, c.index)}`;

  const wch = orch.match(/export\s+function\s+watchEvents\s*\(/);
  if (!wch) missed("src/orchestrator.js has no watchEvents( — the guest's Firebase feed.");
  subj.watch = `src/orchestrator.js:${lineOf(orch, wch.index)}`;

  console.log(`SUBJECT REACHED — route search ${subj.sailPath} · route walker ${subj.walker} · wire payload bake ${subj.bake} · guest consumer ${subj.consumer} · guest feed ${subj.watch}`);
  console.log(`TREE UNDER TEST — ${TREE}\n`);
}

/* the shape of a field that could carry a route: a list of squares, under any of these names */
const ROUTE_KEY = /\b(route|path|legs|via|squares|waypoints)\b/;

/* ─── 1. THE WIRE. Every sail event published must carry the route the engine chose. ───────────
   Today each emitter publishes {t:"sail",p:<seat>} — the seat and nothing else — and Game.ev's
   baked snapshot adds only each captain's FINAL pos. */
{
  const emitters = [...`${flow}`.matchAll(/ev\(\{\s*t\s*:\s*"sail"[^}]*\}/g)]
        .map(m => ({ file: "src/ui/flow.js", src: flow, idx: m.index, text: m[0] }))
    .concat([...`${engine}`.matchAll(/ev\(\{\s*t\s*:\s*"sail"[^}]*\}/g)]
        .map(m => ({ file: "src/engine/index.js", src: engine, idx: m.index, text: m[0] })));

  if (!emitters.length) missed('no ev({t:"sail"…}) emitter found in flow.js or engine/index.js — this gate has lost its subject.');
  console.log(`  (found ${emitters.length} sail emitter(s))`);

  for (const e of emitters) {
    const where = `${e.file}:${lineOf(e.src, e.idx)}`;
    if (ROUTE_KEY.test(e.text)) pass(`${where} publishes a route with the sail event — ${e.text}`);
    else fail(`${where} publishes the seat and nothing else — ${e.text} — so no guest can know which squares the boat sailed through`);
  }

  /* the per-event snapshot: the other half of what lands on the wire */
  const bakeLine = engine.slice(engine.indexOf("o.state=this.players.map(")).split("\n")[0];
  if (ROUTE_KEY.test(bakeLine)) pass(`${subj.bake} bakes the route into the per-event snapshot`);
  else fail(`${subj.bake} bakes only each captain's FINAL pos into the snapshot (${bakeLine.trim().slice(0, 120)}…) — the guest is handed a destination, never a journey`);
}

/* ─── 2. THE GUEST. The one event consumer must walk the route. ────────────────────────────────
   consumeEvent assigns p.pos from the baked state and calls render(); render glides the ship to
   wherever it now is, in a straight line, across whatever is in between. */
{
  const i = orch.search(/export\s+async\s+function\s+consumeEvent\s*\(/);
  let j = orch.indexOf("{", i), depth = 0, k = j;
  for (; k < orch.length; k++) { if (orch[k] === "{") depth++; else if (orch[k] === "}") { depth--; if (!depth) break; } }
  const body = strip(orch.slice(j, k + 1));
  if (/animateSailRoute/.test(body)) pass(`${subj.consumer} walks the route (animateSailRoute reached from the one event consumer)`);
  else fail(`${subj.consumer} never reaches animateSailRoute — it assigns p.pos from the baked state and calls render(), so the guest's boat slides straight from where it was to the destination`);

  const imports = strip(orch).match(/import[^;]*from\s*["'][^"']*flow\.js["']/g) || [];
  if (imports.some(s => /animateSailRoute/.test(s))) pass("src/orchestrator.js imports animateSailRoute — the guest tier can reach the walker");
  else fail("src/orchestrator.js does not import animateSailRoute from src/ui/flow.js — the walker is not even in scope on the tier that draws the guest");
}

/* ─── 3. REACHABILITY. The only code that walks a route must not be host-only. ─────────────────
   Every caller of animateSailRoute is inside flow.js's turn loop, and that loop runs under
   runLiveNet(), which orchestrator.js attaches on the host branch alone. */
{
  const files = fs.readdirSync(path.join(TREE, "src"), { recursive: true })
    .filter(f => typeof f === "string" && f.endsWith(".js"))
    .map(f => path.join("src", f));
  const callers = new Set();
  for (const rel of files) {
    const src = strip(fs.readFileSync(path.join(TREE, rel), "utf8"));
    for (const m of src.matchAll(/(?<!function\s)animateSailRoute\s*\(/g)) {
      if (/export\s+async\s+function\s+animateSailRoute/.test(src.slice(Math.max(0, m.index - 40), m.index + 20))) continue;
      callers.add(rel);
    }
  }
  if (!callers.size) missed("no call site of animateSailRoute anywhere under src/ — the walker is dead code, or this gate's pattern has rotted.");
  console.log(`  (route walker is called from: ${[...callers].join(", ")})`);

  const hostGate = orch.match(/if\s*\(\s*appState\.isHost\s*\)\s*\{\s*runLiveNet\(\)/);
  if (!hostGate) missed("src/orchestrator.js: cannot find the isHost gate on runLiveNet() — re-anchor this assertion before trusting its verdict.");
  const gateAt = `src/orchestrator.js:${lineOf(orch, hostGate.index)}`;

  const outsideFlow = [...callers].filter(f => f !== "src/ui/flow.js");
  if (outsideFlow.length) pass(`the route walker is called from outside the host-only turn loop as well (${outsideFlow.join(", ")})`);
  else fail(`every caller of the route walker is inside src/ui/flow.js, whose turn loop runs only under runLiveNet() — gated on the host at ${gateAt}. A guest can never call it, so a guest's boat can never sail the route.`);
}

console.log(fails
  ? `\nFAILED — ${fails} assertion(s). The route the engine chose is computed, drawn once on the host, and thrown away; the guest is sent a destination and glides to it in a straight line.`
  : "\nPASSED — the engine's route reaches the wire and the guest walks it");
process.exit(fails ? 1 : 0);
