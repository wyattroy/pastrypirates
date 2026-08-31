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

// --- the Chart: checklist tallies + blocked-on-Wyatt + inbox ---
const chart = tryRead(join(ROOT, ".planning", "CHART.md"));
let checklist = null, blocked = null, inboxCount = null;
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
  inboxCount = /\(empty/.test(inboxSec) ? 0 : (inboxSec.match(/^[-*] /gm) || []).length;
}

// --- restarts (the watchdog appends here) ---
const restartsRaw = tryRead(RESTARTS);
const restarts = restartsRaw === null ? [] : restartsRaw.trim().split("\n").filter(Boolean).slice(-5);

const rows = (list, empty) => list === null
  ? `<p class="bad">unreadable: source file could not be parsed</p>`
  : list.length === 0 ? `<p class="muted">${empty}</p>`
  : `<ul>${list.map((x) => `<li>${x}</li>`).join("")}</ul>`;

const html = `<title>The Glass</title>
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
</style>
<div class="sheet">
  <h1>The Glass</h1>
  <p class="muted">Pastry Pirates — the engine's one honest window. Branch <code>${esc(branch)}</code>.</p>

  <div class="pulse" id="pulse">
    <div class="verdict" id="verdict">CHECKING…</div>
    <div class="age" id="age">—</div>
    <div class="note">Now: ${esc(note)}</div>
  </div>

  <h2>Shipped today (${commits === null ? "?" : commits.length} commits)</h2>
  ${commits === null ? `<p class="bad">unreadable: git log failed</p>`
    : commits.length === 0 ? `<p class="muted">Nothing yet today.</p>`
    : `<ul>${commits.slice(0, 12).map((c) => `<li><code>${esc(c.h)}</code> ${esc(c.s)}</li>`).join("")}${commits.length > 12 ? `<li class="muted">…and ${commits.length - 12} more</li>` : ""}</ul>`}

  <h2>Blocked on Wyatt (${blocked === null ? "?" : blocked.length})</h2>
  ${blocked === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
    : blocked.length === 0 ? `<p class="muted">Nothing — the engine has what it needs.</p>`
    : `<table>${blocked.map((b) => `<tr><td>${esc(b.q)}</td><td class="muted">${esc(b.rec)}</td></tr>`).join("")}</table>`}

  <h2>The reboot checklist</h2>
  ${checklist === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
    : `<p><span class="count">${checklist.done}</span> done · <span class="count">${checklist.open}</span> open — detail in <code>.planning/CHART.md</code></p>`}

  <h2>Idea inbox</h2>
  <p>${inboxCount === null ? `<span class="bad">unreadable</span>` : inboxCount === 0 ? `<span class="muted">Empty — drop ideas into any session in any words.</span>` : `<span class="count">${inboxCount}</span> waiting for a fate.`}</p>

  <h2>Watchdog restarts (last 5)</h2>
  ${rows(restarts.map(esc), "None recorded — either no stalls, or the watchdog isn't live yet (see the Chart).")}

  <p class="meta">Generated ${esc(nowIso)} by scripts/wyclau/glass.mjs — every number above is derived, none hand-typed. Stale &gt; 45 min = something is wrong; the watchdog should have restarted the engine.</p>
</div>
<script>
  (function(){
    var t = new Date("${nowIso}");
    function tick(){
      var m = Math.floor((Date.now() - t.getTime())/60000);
      var el = document.getElementById("age"), v = document.getElementById("verdict"), p = document.getElementById("pulse");
      el.textContent = m < 1 ? "moments ago" : m + " min since last progress";
      var stale = m > 45;
      v.textContent = stale ? "STALE — THE ENGINE MAY BE DOWN" : "ALIVE";
      p.className = stale ? "pulse stale" : "pulse";
    }
    tick(); setInterval(tick, 30000);
  })();
</script>
`;
writeFileSync(OUT, html);
console.log(`GLASS ok — heartbeat stamped ${nowIso}; page written to ${OUT}`);
console.log(`note: ${note}`);

/* WRITING THE PAGE IS NOT PUBLISHING IT, AND THAT GAP HAD NO OWNER UNTIL 2026-08-31.
   This script writes glass.html to disk. The page WYATT reads lives at the URL below, and only a
   session holding the Artifact tool can push one to the other -- a hook cannot, so this cannot be
   automated the way LAST-ACTIVITY was. For most of that day the local page was minutes old while
   the published one sat at 12:16Z, and Wyatt is the one who noticed: "the published page is stale
   from 12:16Z while the local one is fresh."

   TWO THINGS WENT WRONG AND ONLY ONE WAS FORGETFULNESS. The republish step existed solely as a
   sentence in a comment at the top of this file, and THE URL WAS WRITTEN DOWN NOWHERE IN THE REPO
   -- so a session that did remember still could not act without going and listing every artifact
   on the account. An instruction whose target cannot be found is not an instruction. */
console.log(`
REPUBLISH THE GLASS -- writing the file is only half of it:`);
console.log(`  ${GLASS_URL}`);
console.log(`  Publish ${OUT} to that URL (Artifact tool, pass it as \`url\`). Do it at every item`);
console.log(`  boundary and before you go quiet, or he is reading a page that has stopped moving.`);
