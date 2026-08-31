#!/usr/bin/env node
// THE GLASS (wyclau charter, part 4) — the one status page, derived, never hand-typed.
//
// Usage:  node scripts/wyclau/glass.mjs --note "what is happening right now"
//
// One command does both halves of the liveness contract:
//   1. stamps the heartbeat (.planning/wyclau/HEARTBEAT — untracked; the watchdog reads it)
//   2. regenerates .planning/wyclau/glass.html from the ground truth
// The session then republishes glass.html to its artifact URL. Everything on the page is
// DERIVED (git, the Chart, the heartbeat, the restart log); nothing here is typed by hand,
// because every hand-typed status number in this project's record went stale.
//
// Honesty rule: a source that cannot be read renders as "unreadable: <why>" — never as empty
// success. (A status page that fails open is a gate aimed at the wrong tree.)
//
// V2 — THE PAGE IS TWO-WAY (Wyatt's ruling, 2026-08-31: "it becomes our interface").
// The page carries a JSON state block and, when Wyatt writes an idea on it, rebuilds its own
// full document with the idea appended and SAVES ITSELF as the new artifact version (the
// "artifact" runtime capability). Sessions watching the artifact are woken by that save.
//
// ⚠ THE HARVEST RULE, AND WHY IT IS LOAD-BEARING: an idea Wyatt writes on the page lives ONLY
// in the page's state until a session moves it into .planning/CHART.md ("THE IDEA INBOX").
// This script regenerates the page with an EMPTY page-ideas list — it cannot read the live
// artifact. So: REPUBLISHING WITHOUT HARVESTING FIRST DELETES HIS UNHARVESTED IDEAS. Before
// any republish: read the artifact (Artifact tool, action "read"), copy every entry of the
// page's glassState.ideas into the Chart inbox, commit, THEN regenerate and republish. The
// Door states this step; this comment is for whoever reads the code instead.
//
// Publishing note: the page needs the "artifact" capability to save itself. The declaration is
// stored with the artifact and carries forward automatically on every later publish that omits
// `capabilities` — it only needs passing once (capabilities: {artifact: {}}), or again if the
// page reports it cannot save.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");
const HEARTBEAT = join(WY, "HEARTBEAT");
const RESTARTS = join(WY, "restarts.log");
/* THE PAGE WYATT ACTUALLY READS. Recorded here because it was recorded nowhere, and a session
   cannot republish what it cannot find. If this ever moves, change it here and nowhere else. */
const GLASS_URL = "https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2";
/* The Helm — Wyatt's decision sheet for the BLOCKED ON WYATT items (engine-built 2026-08-31 at
   his request). Two interface pages is one more than principle 1 allows; until the fold-in
   (Chart item), the Glass links it so there is one place to START from. */
const HELM_URL = "https://claude.ai/code/artifact/e33ae884-12f2-4dd3-a2c2-9b69f12bc0c1";
const OUT = join(WY, "glass.html");

const note = (() => {
  const i = process.argv.indexOf("--note");
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : "(no note given)";
})();

const nowIso = new Date().toISOString();
mkdirSync(WY, { recursive: true });
writeFileSync(HEARTBEAT, `${nowIso}\t${note}\n`);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tryRead = (p) => { try { return readFileSync(p, "utf8"); } catch (e) { return null; } };
const tryGit = (args) => {
  try { return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim(); }
  catch (e) { return null; }
};

// --- shipped today: commits since local midnight, this branch ---
const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
const logRaw = tryGit(["log", `--since=${midnight.toISOString()}`, "--pretty=%h\t%s"]);
const commits = logRaw === null
  ? null
  : logRaw === "" ? [] : logRaw.split("\n").map((l) => { const [h, ...s] = l.split("\t"); return { h, s: s.join("\t") }; });
const branch = tryGit(["rev-parse", "--abbrev-ref", "HEAD"]) ?? "unreadable: git failed";

// --- the Chart: checklist tallies + blocked-on-Wyatt + inbox items ---
const chart = tryRead(join(ROOT, ".planning", "CHART.md"));
let checklist = null, blocked = null, inboxItems = null;
if (chart !== null) {
  const done = (chart.match(/^- \[x\]/gim) || []).length;
  const open = (chart.match(/^- \[ \]/gim) || []).length;
  checklist = { done, open };
  const blockSec = chart.split(/^## BLOCKED ON WYATT$/m)[1]?.split(/^## /m)[0] ?? "";
  blocked = blockSec.split("\n")
    .filter((l) => l.startsWith("|") && !/^\|\s*Question|^\|-+/.test(l) && !/^\|\s*---/.test(l))
    .map((l) => l.split("|").map((c) => c.trim()).filter(Boolean))
    .filter((c) => c.length >= 2)
    .map(([q, rec, since]) => ({ q, rec, since: since ?? "" }));
  const inboxSec = chart.split(/^## THE IDEA INBOX$/m)[1]?.split(/^## /m)[0] ?? "";
  inboxItems = /\(empty/.test(inboxSec) ? [] : (inboxSec.match(/^[-*] .*$/gm) || []).map((l) => l.replace(/^[-*] /, ""));
}

// --- restarts (the watchdog appends here) ---
const restartsRaw = tryRead(RESTARTS);
const restarts = restartsRaw === null ? [] : restartsRaw.trim().split("\n").filter(Boolean).slice(-5);

const rows = (list, empty) => list === null
  ? `<p class="bad">unreadable: source file could not be parsed</p>`
  : list.length === 0 ? `<p class="muted">${empty}</p>`
  : `<ul>${list.map((x) => `<li>${x}</li>`).join("")}</ul>`;

// --- v2 state: what the page needs to rebuild itself. A fresh generation always starts with an
// EMPTY ideas list — page-born ideas must already have been harvested to the Chart (see header).
const state = { v: 2, generatedAt: nowIso, ideas: [] };

/* THE PAGE, WITH TWO TOKENS. __GLASS_STATE__ is replaced by the state JSON; __GLASS_TPL__ by a
   JS string literal holding the FULL-DOCUMENT template (tokens intact) so the page can rebuild
   and save itself. Substitution order and document order are load-bearing: the state block sits
   BEFORE the client script, and .replace() takes the first occurrence, so the copies of the
   tokens embedded inside the TPL string are never touched by mistake. The client script uses no
   backticks and no ${} so this outer template literal stays honest. */
const PAGE = `<title>The Glass</title>
<style>
  :root{--bg:#eef0ea;--surface:#f8f9f5;--ink:#182720;--muted:#57675c;--line:#c9d0c5;
    --accent:#0f6b52;--ok:#0f6b52;--stale:#8a3b2a;--warn-bg:#f3e2dc;--signal:#8a6d1a;}
  @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
    --bg:#101613;--surface:#18211c;--ink:#e4e9e2;--muted:#93a297;--line:#31403a;
    --accent:#3fae8a;--ok:#3fae8a;--stale:#d98a75;--warn-bg:#301b15;--signal:#d4af5a;}}
  :root[data-theme="dark"]{
    --bg:#101613;--surface:#18211c;--ink:#e4e9e2;--muted:#93a297;--line:#31403a;
    --accent:#3fae8a;--ok:#3fae8a;--stale:#d98a75;--warn-bg:#301b15;--signal:#d4af5a;}
  body{background:var(--bg);color:var(--ink);font:1rem/1.55 ui-sans-serif,system-ui,sans-serif;
    margin:0;padding:1rem 1rem 4rem;}
  .sheet{max-width:40rem;margin:0 auto;}
  h1{font-size:1.5rem;margin:.8rem 0 .2rem;} h2{font-size:.8rem;letter-spacing:.12em;
    text-transform:uppercase;color:var(--accent);margin:1.8rem 0 .5rem;font-family:ui-monospace,monospace;}
  .pulse{border-radius:10px;padding:1rem 1.2rem;background:var(--surface);border:2px solid var(--ok);}
  .pulse.stale{border-color:var(--stale);background:var(--warn-bg);}
  .pulse .age{font-size:1.6rem;font-weight:700;} .pulse .verdict{font-family:ui-monospace,monospace;
    font-size:.75rem;letter-spacing:.1em;}
  .pulse .note{color:var(--muted);margin-top:.3rem;}
  ul{margin:.3rem 0;padding-left:1.2rem;} li{margin-bottom:.35rem;font-size:.95rem;}
  .muted{color:var(--muted);} .bad{color:var(--stale);}
  code{font-family:ui-monospace,monospace;font-size:.85em;}
  table{border-collapse:collapse;width:100%;font-size:.9rem;}
  td{padding:.45rem .5rem;border-bottom:1px solid var(--line);vertical-align:top;}
  .meta{font-family:ui-monospace,monospace;font-size:.72rem;color:var(--muted);margin-top:2.2rem;}
  .count{font-weight:700;color:var(--signal);}
  #ideaText{width:100%;box-sizing:border-box;background:var(--surface);color:var(--ink);
    border:1px solid var(--line);border-radius:8px;padding:.7rem;font:inherit;resize:vertical;}
  #ideaSend{margin-top:.5rem;background:var(--accent);color:var(--bg);border:none;border-radius:8px;
    padding:.6rem 1.1rem;font:inherit;font-weight:600;cursor:pointer;}
  #ideaSend:disabled{opacity:.5;cursor:default;}
  #ideaText:focus-visible,#ideaSend:focus-visible{outline:2px solid var(--signal);outline-offset:2px;}
</style>
<script type="application/json" id="glassState">__GLASS_STATE__</script>
<div class="sheet">
  <h1>The Glass</h1>
  <p class="muted">Pastry Pirates — the engine's one honest window. Branch <code>${esc(branch)}</code>.</p>

  <div class="pulse" id="pulse">
    <div class="verdict" id="verdict">CHECKING…</div>
    <div class="age" id="age">—</div>
    <div class="note">Now: ${esc(note)}</div>
  </div>

  <h2>Write to Claude</h2>
  <p class="muted" id="ideaCapNote">Checking whether this view can save…</p>
  <div id="ideaForm" hidden>
    <textarea id="ideaText" rows="3" placeholder="An idea, feedback, a bug you noticed — any words. It lands on the Chart and gets a fate."></textarea>
    <button id="ideaSend" type="button">Send to the Chart</button>
    <p class="muted" id="ideaStatus"></p>
  </div>
  <div id="ideaList"></div>

  <h2>Shipped today (${commits === null ? "?" : commits.length} commits)</h2>
  ${commits === null ? `<p class="bad">unreadable: git log failed</p>`
    : commits.length === 0 ? `<p class="muted">Nothing yet today.</p>`
    : `<ul>${commits.slice(0, 12).map((c) => `<li><code>${esc(c.h)}</code> ${esc(c.s)}</li>`).join("")}${commits.length > 12 ? `<li class="muted">…and ${commits.length - 12} more</li>` : ""}</ul>`}

  <h2>Blocked on Wyatt (${blocked === null ? "?" : blocked.length})</h2>
  ${blocked === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
    : blocked.length === 0 ? `<p class="muted">Nothing — the engine has what it needs.</p>`
    : `<table>${blocked.map((b) => `<tr><td>${esc(b.q)}</td><td class="muted">${esc(b.rec)}</td></tr>`).join("")}</table>
  <p class="muted">Rule on these at <a href="${HELM_URL}">the Helm</a> — your taps there are rulings.</p>`}

  <h2>The reboot checklist</h2>
  ${checklist === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
    : `<p><span class="count">${checklist.done}</span> done · <span class="count">${checklist.open}</span> open — detail in <code>.planning/CHART.md</code></p>`}

  <h2>On the Chart, awaiting a fate</h2>
  ${inboxItems === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
    : rows(inboxItems.map(esc), "The Chart inbox is empty.")}

  <h2>Watchdog restarts (last 5)</h2>
  ${rows(restarts.map(esc), "None recorded — either no stalls, or the watchdog isn't live yet (see the Chart).")}

  <p class="meta">Generated ${esc(nowIso)} by scripts/wyclau/glass.mjs — every number above is derived, none hand-typed. Stale &gt; 45 min = something is wrong; the watchdog should have restarted the engine.</p>
</div>
<script>
  (function(){
    "use strict";
    var state;
    try { state = JSON.parse(document.getElementById("glassState").textContent); }
    catch (e) { state = { v: 2, generatedAt: "${nowIso}", ideas: [] }; }

    // --- freshness (the engine's clock, untouched by page saves: an idea is not engine progress)
    var t = new Date(state.generatedAt);
    function tick(){
      var m = Math.floor((Date.now() - t.getTime())/60000);
      var el = document.getElementById("age"), v = document.getElementById("verdict"), p = document.getElementById("pulse");
      el.textContent = m < 1 ? "moments ago" : m + " min since last progress";
      var stale = m > 45;
      v.textContent = stale ? "STALE — THE ENGINE MAY BE DOWN" : "ALIVE";
      p.className = stale ? "pulse stale" : "pulse";
    }
    tick(); setInterval(tick, 30000);

    // --- the two-way half: the page rebuilds and saves itself with a new idea appended.
    var TPL = __GLASS_TPL__;
    function jsEsc(s){ return JSON.stringify(s).replace(/</g, "\\u003c"); }
    // Function-form replacements, both here and in the generator: a plain string replacement
    // interprets "$&"-style sequences inside the inserted value, and idea text is user text.
    function buildDoc(st){
      var d = TPL;
      d = d.replace("__GLASS_TPL__", function(){ return jsEsc(TPL); });
      // The state block is a JSON <script>, so it takes raw JSON text with "<" made safe —
      // < is a legal escape inside JSON strings, and "<" can only occur inside strings.
      d = d.replace("__GLASS_STATE__", function(){ return JSON.stringify(st).replace(/</g, "\\u003c"); });
      return d;
    }

    function renderIdeas(){
      var box = document.getElementById("ideaList");
      while (box.firstChild) box.removeChild(box.firstChild);
      if (!state.ideas.length) return;
      var h = document.createElement("p"); h.className = "muted";
      h.textContent = "Written here, waiting for a session to harvest to the Chart:";
      box.appendChild(h);
      var ul = document.createElement("ul");
      state.ideas.forEach(function(i){
        var li = document.createElement("li");
        li.textContent = i.text + "  (" + i.at.slice(0, 16).replace("T", " ") + "Z)";
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    renderIdeas();

    // Draft guard: a save that conflicts reloads the page and drops the edit; the draft brings
    // his words back instead of eating them. Every touch is try/caught — storage can throw.
    var DRAFT = "glassIdeaDraft";
    function getDraft(){ try { return localStorage.getItem(DRAFT) || ""; } catch (e) { return ""; } }
    function setDraft(v){ try { v ? localStorage.setItem(DRAFT, v) : localStorage.removeItem(DRAFT); } catch (e) {} }

    var capNote = document.getElementById("ideaCapNote");
    var form = document.getElementById("ideaForm");
    var text = document.getElementById("ideaText");
    var send = document.getElementById("ideaSend");
    var status = document.getElementById("ideaStatus");

    var saved = state.ideas.some(function(i){ return i.text === getDraft(); });
    if (saved) setDraft("");
    text.value = getDraft();
    text.addEventListener("input", function(){ setDraft(text.value); });

    var cap = null;
    var useFn = (window.claude && window.claude.use) ? window.claude.use.bind(window.claude) : null;
    (useFn ? useFn("artifact") : Promise.resolve(null)).then(function(a){
      cap = a;
      if (cap) { capNote.hidden = true; form.hidden = false; }
      else { capNote.textContent = "This view can’t save to the page (preview, or the grant is missing) — but any idea still reaches Claude if you say it in any session."; }
    });

    send.addEventListener("click", function(){
      var v = text.value.trim();
      if (!v || !cap) return;
      send.disabled = true; status.textContent = "Saving to the page…";
      var st = JSON.parse(JSON.stringify(state));
      st.ideas.push({ id: "i" + Date.now(), text: v, at: new Date().toISOString() });
      cap.publish(buildDoc(st)).then(function(){
        // Success reloads every open view to the new version; the draft clears itself on load.
      }).catch(function(e){
        send.disabled = false;
        status.textContent = "Couldn’t save (" + ((e && e.code) || e) + "). Your words are kept as a draft here — try again, or just tell a session.";
      });
    });
  })();
</script>
`;

/* The full-document shape, for the page's own saves — the artifact capability requires a complete
   document, doctype first. The tool-published fragment and this wrapper share PAGE by
   construction, so the two shapes cannot drift. */
const FULLDOC = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
${PAGE}
</body></html>`;

const jsEsc = (s) => JSON.stringify(s).replace(/</g, "\\u003c");
const stateJson = JSON.stringify(state).replace(/</g, "\\u003c");
// Order is load-bearing (see the PAGE comment): TPL first, then the first state token.
// Function-form replacements so "$&"-style sequences in the values are inserted literally.
const html = PAGE
  .replace("__GLASS_TPL__", () => jsEsc(FULLDOC))
  .replace("__GLASS_STATE__", () => stateJson);

writeFileSync(OUT, html);
console.log(`GLASS ok — heartbeat stamped ${nowIso}; page written to ${OUT}`);
console.log(`note: ${note}`);

console.log(`
REPUBLISH THE GLASS -- writing the file is only half of it:`);
console.log(`  ${GLASS_URL}`);
console.log(`  ⚠ HARVEST FIRST: read the live artifact and move any glassState.ideas entries into`);
console.log(`  .planning/CHART.md's IDEA INBOX before republishing — a republish without the`);
console.log(`  harvest DELETES his unharvested ideas (this page always regenerates with none).`);
console.log(`  Publish ${OUT} to that URL (Artifact tool, pass it as \`url\`). Do it at every item`);
console.log(`  boundary and before you go quiet, or he is reading a page that has stopped moving.`);
console.log(`  (v2: the page saves itself via the "artifact" capability — pass`);
console.log(`  capabilities {artifact:{}} on a fresh publish, or if the page says it can't save.)`);
