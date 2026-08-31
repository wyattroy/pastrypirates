#!/usr/bin/env node
// THE GLASS (wyclau charter, part 4) — the one status page, derived, never hand-typed.
//
// Usage:  node scripts/wyclau/glass.mjs --note "what is happening right now"
//         node scripts/wyclau/glass.mjs --note "..." --demo   (adds 2 EXAMPLE asks to the
//         rendered page ONLY, for a design screenshot — never saved, never part of the real
//         republish workflow; see "DEMO MODE" below)
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
// V2.1 — THE HELM IS FOLDED IN (his instruction, 2026-08-31: "incorporate those changes into
// glass v2"). He can RULE on each blocked question from this page — tap an option, add a note —
// exactly as the separate Helm page allowed. Two pages was one interface too many, and it cost
// something real: he ruled on five questions at 17:02-17:10Z on the Helm and NO SESSION READ
// THEM, so the Glass went on printing "Blocked on Wyatt (6)" while five were already answered.
// Rulings are read by sessions the same way ideas are (the harvest step reads BOTH), which is
// the whole reason they had to live on one page.
//
// V2.2 — THE DASHBOARD REDESIGN (Wyatt's seven priorities, given 2026-08-31 to a cloud session
// and then redirected here: "wait -- i just realized you're in a cloud container. stop this
// work" — visual work needs the rendered picture, and this machine can screenshot and iterate
// locally). What changed, and which of his seven items each change answers:
//   1. Dropped the subtitle line ("Pastry Pirates -- the engine's one honest window. Branch...").
//   2. The boxed ALIVE/STALE verdict is gone. One small line under the title: an emoji plus the
//      age, at a glance. The note text (what is happening right now) sits beside it, muted.
//   3. "Write to Claude" is renamed "Ideas" and moved below "Your call".
//   4. "Shipped today" drops the commit hash and reformats each line to ~5-7 words via
//      shortSubject() below -- THE GENERATOR HALF of his ask. THE OTHER HALF IS A CONVENTION,
//      NOT CODE: a generator cannot summarise a bad subject line into a good one, so this only
//      works if commit subjects keep being written as a short "what" a stripped prefix and an
//      em-dash "why" can split cleanly -- which is already this repo's own commit-message habit.
//   5. "Your call" is its own card, above "Shipped today". DEMO MODE (see above) renders two
//      example asks so the empty state's real format can still be judged from a screenshot.
//   6. "On the Chart" and "The reboot checklist" merge into one "Tasks" list -- open checklist
//      items plus any Chart-inbox items, one source instead of two counts.
//   7. Every section is a bordered card on a background gradient and font matching the game's
//      own palette (index.html's --sea/--teal/--mint/--orange/--ink, Avenir Next), not a generic
//      status-page look.
//
// ⚠ THE HARVEST RULE, AND WHY IT IS LOAD-BEARING: anything Wyatt writes or taps on the page —
// an IDEA or a RULING — lives ONLY in the page's state until a session moves it into
// .planning/CHART.md (ideas → "THE IDEA INBOX"; rulings → "RULED" + .claude/memory/DECISIONS.md).
// This script regenerates the page with an EMPTY ideas list and NO rulings — it cannot read the
// live artifact. So: REPUBLISHING WITHOUT HARVESTING FIRST DELETES BOTH. Before any republish:
// read the artifact (Artifact tool, action "read"), copy every glassState.ideas entry AND every
// glassState.rulings entry into the record, commit, THEN regenerate and republish. Enforced by
// .claude/hooks/glass-harvest-first.cjs; the Door states the step; this is for the code reader.
//
// Publishing note: the page needs the "artifact" capability to save itself. The declaration is
// stored with the artifact and carries forward automatically on every later publish that omits
// `capabilities` — it only needs passing once (capabilities: {artifact: {}}), or again if the
// page reports it cannot save.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hostname } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");
const HEARTBEAT = join(WY, "HEARTBEAT");
const LAST_ACTIVITY = join(WY, "LAST-ACTIVITY");
const RESTARTS = join(WY, "restarts.log");
/* THE PAGE WYATT ACTUALLY READS. Recorded here because it was recorded nowhere, and a session
   cannot republish what it cannot find. If this ever moves, change it here and nowhere else. */
const GLASS_URL = "https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2";
/* The Helm — RETIRED 2026-08-31, folded into this page at Wyatt's instruction ("one place to go
   to see and decide everything"). Kept only so the retirement notice can be republished to it,
   and so the next reader knows where the five rulings of 17:02-17:10Z came from. Do not build a
   second decision surface again: he ruled there, nobody harvested it for over an hour, and the
   Glass went on printing "Blocked on Wyatt (6)" while five of the six were already answered. */
const HELM_URL = "https://claude.ai/code/artifact/e33ae884-12f2-4dd3-a2c2-9b69f12bc0c1";
const OUT = join(WY, "glass.html");
/* ONE PUBLISHER (Wyatt's ruling, 2026-08-31, on session sprawl: one WORKER, everything else
   scaffolding). TRACKED, not gitignored: any session, on any machine, writes here by committing,
   rather than publishing the Glass itself. Measured cost of NOT having this, same day: the
   Razer engine and a second session both published the artifact within five minutes, and the
   platform's own conflict guard fired three times before it cleared -- nothing was lost, but it
   is "two things kept in step by nothing" at the publish layer, and it does not scale past two.
   This file is the fix's other half: read on every generation, folded into the note if it holds
   real content, then reset to the template -- so the next run does not re-show a stale message,
   and the reset rides along with whatever commit already follows a generation. */
const GLASS_NOTE = join(ROOT, ".planning", "wyclau", "GLASS-NOTE.md");
const GLASS_NOTE_TEMPLATE = `<!-- GLASS-NOTE.md -- if you are not the Bosun (the Claude session on the Razer that the
     watchdog revives), write what you want shown or said on the Glass BELOW the marker line,
     then commit and push -- do not publish the Glass artifact yourself. The Bosun reads this on
     its next pulse, folds it into the page, and clears this file back to this template. If the
     Bosun is not running (check the Glass's own staleness first), that is a different problem;
     leaving a note here will still reach it the moment it revives. -->
---
`;

const argv = process.argv.slice(2);
const note = (() => {
  const i = argv.indexOf("--note");
  return i > -1 && argv[i + 1] ? argv[i + 1] : "(no note given)";
})();
/* DEMO MODE — screenshot-only, never part of a real publish. Wyatt's item 5 asked to "show him a
   few test calls" so the Your-call format can be judged even while the real list is empty (the
   common case: he answers fast). This flag injects two EXAMPLE asks into the RENDERED page only;
   the state block's `ideas`/`rulings` stay real and empty either way, so a --demo render can
   never be mistaken for a page that has actually been published with fake blockers. */
const DEMO = argv.includes("--demo");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tryReadTimestamp = (p) => {
  let raw;
  try { raw = readFileSync(p, "utf8"); } catch { return null; }
  const iso = raw.split("\t")[0]?.trim();
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};

/* LAST PROGRESS VS PAGE PUBLISHED — Wyatt, 2026-08-31: the Glass was showing the page's own AGE
   as if it were the WORKER's age. At 19:55Z it read "🔴 54 min ago" while a commit had landed 12
   minutes earlier — a false alarm on a healthy engine, because the old code drove the dot from
   `state.generatedAt` (when this HTML was written), not from any evidence that work happened.
   ⚠ WHAT THIS CAN AND CANNOT FIX, so nobody re-derives false confidence from it: this page is
   STATIC once published — its numbers tick forward from references frozen at generation time, and
   no reference computed here can retroactively reflect work that happens AFTER this run. So this
   fix cannot make an unpublished-for-hours page stop looking stale; only actually republishing can
   (see mark_glass_published.mjs, and the publish-lag brake in
   .claude/hooks/wyclau-stop-keep-working.cjs — the mechanical half of "make publishing part of
   pulsing", moved there from npm test by CEO Review 52: it had been wired into the game's own
   release gate, so a stale DASHBOARD could block a real GAME fix from reaching players).
   ⚠ CORRECTED, CEO Review 52: an earlier version of this comment claimed an administrative re-run
   "now correctly shows an OLDER last progress than page published" as a settled behaviour. Measured
   instead of assumed: `.claude/hooks/wyclau-pulse.cjs` stamps LAST-ACTIVITY on EVERY tool call by
   ANY session, rate-limited to once a minute — so on any page a LIVE session generates, the two
   numbers are typically within about a minute of each other, and the distinction is real but small
   in the common case. It matters for the case this was actually built for: a page regenerated after
   real work had already gone quiet for a while (lastActivityAt genuinely old), not as a general
   "narration vs evidence" gap during active work. What THIS fix does: "last progress" is read from
   REAL evidence — the newer of HEARTBEAT and LAST-ACTIVITY, read BEFORE this run overwrites
   HEARTBEAT, so the act of running glass.mjs itself is never, by construction, mistaken for
   progress on its own. */
const prevHeartbeatAt = tryReadTimestamp(HEARTBEAT);
const lastActivityAt = tryReadTimestamp(LAST_ACTIVITY);
const lastProgressMs = Math.max(prevHeartbeatAt ?? 0, lastActivityAt ?? 0) || null;

const nowIso = new Date().toISOString();
const lastProgressIso = lastProgressMs ? new Date(lastProgressMs).toISOString() : nowIso;
mkdirSync(WY, { recursive: true });
writeFileSync(HEARTBEAT, `${nowIso}\t${note}\n`);
const tryRead = (p) => { try { return readFileSync(p, "utf8"); } catch (e) { return null; } };

// --- pick up whatever another session left in GLASS-NOTE.md, then reset it. Absent, unreadable,
// or holding only the template's own marker line all mean "nothing pending" -- never an error;
// a session that has never written here is the common case, not a fault.
let relayedNote = null;
{
  const raw = tryRead(GLASS_NOTE);
  const body = raw === null ? "" : raw.split(/^---\s*$/m)[1] ?? "";
  const trimmed = body.trim();
  if (trimmed) {
    relayedNote = trimmed;
    writeFileSync(GLASS_NOTE, GLASS_NOTE_TEMPLATE);
  }
}
const tryGit = (args) => {
  try { return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim(); }
  catch (e) { return null; }
};

/* THE GENERATOR HALF OF ITEM 4. Strips a conventional-commit-style prefix ("word:" or
   "word(scope):") and this repo's own em-dash/double-hyphen "why" clause. It cannot invent a good
   subject from a bad one — the durable half is the commit-message convention itself, unchanged
   by this file.

   ⚠ A RELAY CAUGHT THE FIRST VERSION, 2026-08-31: it hard-chopped at 8 words with a trailing "…",
   which was tested against Wyatt's own two named-bad examples (both happen to carry a "--" clause
   and split cleanly) and never checked against the list it actually renders. Measured against the
   real 12 lines on the page that day: 6 of 12 ended mid-sentence. FIX: prefer the first natural
   CLAUSE boundary (a comma, semicolon or colon) over a hard word count -- most subjects in this
   repo's own style already have one, because they are written as a claim followed by a reason.
   Only a subject with NO such boundary within a reasonable length falls back to a word chop, and
   only THAT path keeps the "…" -- a clause-bounded result is a complete thought and gets none. */
function shortSubject(s) {
  let t = String(s).replace(/^[a-z][a-z0-9_.-]*(\([^)]*\))?:\s*/i, "").trim();
  t = t.split(/\s+(?:—|--)\s+/)[0].trim();
  const clause = t.match(/^[^,;:]+/);
  if (clause && clause[0].trim().length >= 12 && clause[0].trim().length < t.length) {
    return clause[0].trim();
  }
  const words = t.split(/\s+/).filter(Boolean);
  return words.length > 9 ? words.slice(0, 9).join(" ") + "…" : t;
}
/* Checklist/task lines carry real operational detail (not a commit subject), so this keeps more
   of them — it only drops markdown bold and a trailing *(parenthetical aside)*, then caps long
   ones so the Tasks card stays scannable rather than a wall of text. */
function shortTask(s) {
  let t = String(s).replace(/\*\*/g, "").replace(/\s*\*\([^)]*\)\*\s*$/, "").trim();
  const words = t.split(/\s+/).filter(Boolean);
  return words.length > 16 ? words.slice(0, 16).join(" ") + "…" : t;
}

// --- shipped today: commits since local midnight, this branch ---
const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
const logRaw = tryGit(["log", `--since=${midnight.toISOString()}`, "--pretty=%h\t%s"]);
const commits = logRaw === null
  ? null
  : logRaw === "" ? [] : logRaw.split("\n").map((l) => { const [h, ...s] = l.split("\t"); return { h, s: s.join("\t") }; });
const branch = tryGit(["rev-parse", "--abbrev-ref", "HEAD"]) ?? "unreadable: git failed";

// --- the Chart: checklist tallies + task text + blocked-on-Wyatt + inbox items ---
const chart = tryRead(join(ROOT, ".planning", "CHART.md"));
let checklist = null, blocked = null, inboxItems = null, ruled = null, tasks = null;
if (chart !== null) {
  const blockSec = chart.split(/^## BLOCKED ON WYATT$/m)[1]?.split(/^## /m)[0] ?? "";
  blocked = blockSec.split("\n")
    .filter((l) => l.startsWith("|") && !/^\|\s*Question|^\|-+/.test(l) && !/^\|\s*---/.test(l))
    .map((l) => l.split("|").map((c) => c.trim()).filter(Boolean))
    .filter((c) => c.length >= 2)
    // A stable id per question so a ruling survives the wording being edited on the Chart:
    // first 40 chars of the question, lowercased, punctuation stripped.
    .map(([q, rec, since]) => ({
      id: q.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40).replace(/^-|-$/g, ""),
      q: q.replace(/\*\*/g, ""), rec: (rec ?? "").replace(/\*\*/g, ""), since: since ?? "",
    }));
  const inboxSec = chart.split(/^## THE IDEA INBOX$/m)[1]?.split(/^## /m)[0] ?? "";
  inboxItems = /\(empty/.test(inboxSec) ? [] : (inboxSec.match(/^[-*] .*$/gm) || []).map((l) => l.replace(/^[-*] /, ""));
  // HIS RULINGS, DERIVED — the Helm's record migrated into this page. Sourced from the Chart's
  // RULED table (never hand-typed here), so a ruling shows on the Glass the moment it is
  // harvested, and cannot drift from the record the engine works to.
  const ruledSec = chart.split(/^## RULED[^\n]*$/m)[1]?.split(/^## /m)[0] ?? "";
  ruled = ruledSec.split("\n")
    .filter((l) => l.startsWith("|") && !/^\|\s*item\b/i.test(l) && !/^\|\s*-+/.test(l))
    .map((l) => l.split("|").map((c) => c.trim().replace(/\*\*/g, "")).filter(Boolean))
    .filter((c) => c.length >= 2)
    .map(([item, call, now]) => ({ item, call, now: now ?? "" }));
  // ITEM 6 — ONE MERGED TASK LIST, not two counts kept in step by nothing. Open items from the
  // reboot checklist (the only checklist section today) plus any Chart-inbox items, in that
  // order — the checklist is the standing plan, the inbox is what just arrived.
  const stepSec = chart.split(/^## STEP 1 CHECKLIST[^\n]*$/m)[1]?.split(/^## /m)[0] ?? "";
  const openChecklist = (stepSec.match(/^- \[ \] .*$/gm) || []).map((l) => shortTask(l.replace(/^- \[ \] /, "")));
  tasks = [...openChecklist, ...(inboxItems ?? []).map(shortTask)];
  // ⚠ A RELAY CAUGHT THE FIRST VERSION, 2026-08-31: the heading's done/open counts were scanning
  // the WHOLE Chart file for any "- [x]"/"- [ ]" while the list underneath came from ONE section
  // plus the inbox -- they happened to agree that day only because every checkbox in the file
  // lived in that one section. Scoped to the same source as the list, so the two cannot drift:
  // done = checked items in STEP 1 CHECKLIST; open = the list this card actually renders.
  const doneChecklist = (stepSec.match(/^- \[x\]/gim) || []).length;
  checklist = { done: doneChecklist, open: tasks.length };
}

// --- restarts (the watchdog appends here) ---
// ⚠ THE HONESTY GAP A RELAY CAUGHT, 2026-08-31: restarts.log is machine-local and gitignored
// (.gitignore:82), so a page generated anywhere but the Razer has NO file to read, and the old
// code rendered that identically to "a log exists and is genuinely empty" -- both said "None
// recorded", which is exactly the fail-open this file's own header rule forbids ("a source that
// cannot be read renders as unreadable, never as empty success"). The restart log IS the 24-hour
// exit test's evidence; a page that understates it understates the proof. So: distinguish FILE
// ABSENT from FILE PRESENT AND EMPTY, and name the machine either way, so "no restarts" always
// answers "on which machine, and did it even have a log to check".
const MACHINE = hostname();
const restartsRaw = tryRead(RESTARTS);
const restarts = restartsRaw === null ? [] : restartsRaw.trim().split("\n").filter(Boolean).slice(-5);
const restartsEmptyMsg = restartsRaw === null
  ? `No restarts.log on this machine (<b>${esc(MACHINE)}</b>) — it is local and gitignored, so this page cannot see another machine's log. This is NOT evidence of zero restarts.`
  : `None recorded on <b>${esc(MACHINE)}</b> — the watchdog has not needed to restart the Bosun here.`;

const rows = (list, empty) => list === null
  ? `<p class="bad">unreadable: source file could not be parsed</p>`
  : list.length === 0 ? `<p class="muted">${empty}</p>`
  : `<ul>${list.map((x) => `<li>${x}</li>`).join("")}</ul>`;

// --- v2 state: what the page needs to rebuild itself. A fresh generation always starts with an
// EMPTY ideas list — page-born ideas must already have been harvested to the Chart (see header).
// `rulings` is keyed by the question id above: {id: {choice, note, at}}. Same harvest contract
// as ideas — the generator always starts empty, so a republish without harvesting loses them.
const state = { v: 2, generatedAt: nowIso, lastProgressAt: lastProgressIso, ideas: [], rulings: {} };

// DEMO MODE renders two example asks INTO THE PAGE ONLY (blocked/asks markup below); it never
// touches `state`, so glassState.ideas/rulings on a --demo render are identical to a real one.
const demoAsks = !DEMO ? [] : [
  { id: "demo-1", q: "Should the wind gauge show forecast, or just the current push?", rec: "Current only — the forecast lives in the narration line already." },
  { id: "demo-2", q: "Ship a small music bed under the lobby screen?", rec: "Not yet — the mute control redesign should land first." },
];
const askList = [...(blocked ?? []), ...demoAsks];

/* THE PAGE, WITH TWO TOKENS. __GLASS_STATE__ is replaced by the state JSON; __GLASS_TPL__ by a
   JS string literal holding the FULL-DOCUMENT template (tokens intact) so the page can rebuild
   and save itself. Substitution order and document order are load-bearing: the state block sits
   BEFORE the client script, and .replace() takes the first occurrence, so the copies of the
   tokens embedded inside the TPL string are never touched by mistake. The client script uses no
   backticks and no ${} so this outer template literal stays honest. */
const PAGE = `<meta charset="utf-8">
<title>The Glass</title>
<style id="glass-style">
  /* index.html's own :root (~line 45), copied EXACTLY, not approximated: --sea/--sea2/--ink/
     --parch/--paleblue/--teal/--mint/--orange/--lemon/--pink are all the game's own hex values.
     ⚠ CORRECTED, a relay caught the first version overclaiming this: --bg/--bg2/--bg3, the three
     tokens the eye actually sees most (the page background), are NOT from the game -- they are
     invented to sit near the game's palette rather than copied from it. The game's own ground is
     a pale blue sea gradient (index.html:57, var(--sea) to var(--sea2)); this page's is sage to
     parchment. A deliberate choice for readability at status-page scale, not a measurement. */
  :root{--sea:#d3f0f4;--sea2:#bfe8ee;--ink:#1f4249;--parch:#ffffff;--paleblue:#dff3fb;
    --teal:#29a3b2;--mint:#45dfa6;--orange:#fdb63d;--lemon:#fef48b;--pink:#fdaecb;
    --bg:#dcece9;--bg2:#e6efe1;--bg3:#f5f0dd;--surface:var(--parch);--muted:#5c7a80;
    --line:var(--sea2);--accent:var(--teal);--ok:var(--teal);--stale:#c65a3d;
    --warn-bg:#fff6c2;--signal:var(--orange);}
  @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
    --ink:#e4f3f6;--parch:#152225;--paleblue:#1c2f33;--muted:#8fb3ba;
    --bg:#0f1a1c;--bg2:#122420;--bg3:#1c1f14;--surface:var(--parch);--line:#234146;
    --accent:#54c2cf;--ok:#54c2cf;--stale:#ff9068;--warn-bg:#3a2f12;--signal:var(--orange);}}
  :root[data-theme="dark"]{
    --ink:#e4f3f6;--parch:#152225;--paleblue:#1c2f33;--muted:#8fb3ba;
    --bg:#0f1a1c;--bg2:#122420;--bg3:#1c1f14;--surface:var(--parch);--line:#234146;
    --accent:#54c2cf;--ok:#54c2cf;--stale:#ff9068;--warn-bg:#3a2f12;--signal:var(--orange);}
  body{background:var(--bg);
    background-image:linear-gradient(160deg,var(--bg) 0%,var(--bg2) 45%,var(--bg3) 100%);
    background-attachment:fixed;color:var(--ink);
    font:1rem/1.55 'Avenir Next',Avenir,'Segoe UI','Trebuchet MS',sans-serif;
    margin:0;padding:1rem 1rem 4rem;}
  .sheet{max-width:40rem;margin:0 auto;}
  h1{font-size:1.6rem;margin:.8rem 0 .15rem;color:var(--ink);}
  h2{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);
    margin:0 0 .7rem;font-family:ui-monospace,monospace;font-weight:700;}
  /* ITEM 2 — one line, no box: an emoji and the age, at a glance. The note (what is happening)
     rides beside it, muted, so context is still there without competing for attention. */
  .pulseline{display:flex;align-items:baseline;gap:.5rem;flex-wrap:wrap;margin:0 0 .25rem;
    font-size:.95rem;}
  .pulseline .age{font-weight:700;color:var(--ink);}
  .pulseline .pulsenote{color:var(--muted);}
  .pulseline.stale .age{color:var(--stale);}
  /* ITEM (a) of the age fix — a second, quieter line: when was this PAGE last regenerated and
     published, as distinct from when real WORK last happened (the line above). The two can
     legitimately differ; showing both is the point. */
  .publishedline{font-size:.78rem;color:var(--muted);margin:0 0 1.3rem;}
  .relayNote{font-size:.88rem;color:var(--muted);margin:-.7rem 0 1.3rem;font-style:italic;}
  .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;
    padding:1rem 1.15rem;margin-bottom:1.1rem;box-shadow:0 1px 2px rgba(31,66,73,.05);}
  .card.accentCard{border-color:var(--signal);border-width:1.5px;}
  ul{margin:.3rem 0;padding-left:1.2rem;} li{margin-bottom:.35rem;font-size:.95rem;}
  .muted{color:var(--muted);} .bad{color:var(--stale);}
  code{font-family:ui-monospace,monospace;font-size:.85em;background:var(--paleblue);
    padding:.05em .3em;border-radius:4px;}
  table{border-collapse:collapse;width:100%;font-size:.9rem;}
  td{padding:.45rem .5rem;border-bottom:1px solid var(--line);vertical-align:top;}
  .meta{font-family:ui-monospace,monospace;font-size:.72rem;color:var(--muted);margin-top:1.5rem;}
  .count{font-weight:700;color:var(--signal);}
  /* ITEM 4 — shipped-today as a scannable strip, no hashes: a small dot, the short subject. */
  .shipList{list-style:none;margin:.2rem 0;padding:0;}
  .shipList li{position:relative;padding-left:1.1rem;margin-bottom:.5rem;font-size:.93rem;}
  .shipList li::before{content:"";position:absolute;left:0;top:.45em;width:.5rem;height:.5rem;
    border-radius:50%;background:var(--mint);}
  #ideaText{width:100%;box-sizing:border-box;background:var(--paleblue);color:var(--ink);
    border:1px solid var(--line);border-radius:8px;padding:.7rem;font:inherit;resize:vertical;}
  #ideaSend{margin-top:.5rem;background:var(--teal);color:var(--parch);border:none;
    border-radius:8px;padding:.6rem 1.1rem;font:inherit;font-weight:600;cursor:pointer;}
  #ideaSend:disabled{opacity:.5;cursor:default;}
  #ideaText:focus-visible,#ideaSend:focus-visible{outline:2px solid var(--signal);outline-offset:2px;}
  .ask{background:var(--paleblue);border:1px solid var(--line);border-radius:10px;
    padding:.9rem 1rem;margin-bottom:.9rem;}
  .ask.ruled{border-color:var(--signal);}
  .ask .q{font-weight:700;margin:0 0 .3rem;}
  .ask .rec{color:var(--muted);font-size:.92rem;margin:0 0 .7rem;}
  .ask .rec b{color:var(--ink);}
  .ruleRow{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem;}
  .rb{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:8px;
    padding:.5rem .9rem;font:inherit;cursor:pointer;}
  .rb[aria-pressed="true"]{background:var(--teal);color:var(--parch);border-color:var(--teal);font-weight:600;}
  .rnote{width:100%;box-sizing:border-box;background:var(--surface);color:var(--ink);border:1px solid var(--line);
    border-radius:8px;padding:.5rem;font:inherit;font-size:.93rem;resize:vertical;}
  .rstate{margin:.4rem 0 0;font-size:.88rem;}
  .rb:focus-visible,.rnote:focus-visible{outline:2px solid var(--signal);outline-offset:2px;}
  .demoTag{display:inline-block;font-family:ui-monospace,monospace;font-size:.68rem;
    letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border:1px dashed var(--line);
    border-radius:6px;padding:.1rem .4rem;margin-left:.4rem;}
</style>
<script type="application/json" id="glassState">__GLASS_STATE__</script>
<div class="sheet">
  <h1>The Glass</h1>
  <div class="pulseline" id="pulse">
    <span id="pulseEmoji">🟢</span><span class="age" id="age">—</span>
    <span class="pulsenote" id="noteText">${esc(note)}</span>
  </div>
  <p class="publishedline" id="publishedLine">page published —</p>
  ${relayedNote ? `<p class="relayNote">From another session, folded in on this pulse: ${esc(relayedNote)}</p>` : ""}

  <section class="card accentCard">
    <h2>Your call (${askList.length}${DEMO ? " + 2 demo" : ""})</h2>
    ${askList.length === 0
      ? `<p class="muted">Nothing waiting — every question you've been asked is ruled, and the Bosun has what it needs.</p>`
      : `<div id="asks">${askList.map((b) => `<div class="ask" data-id="${esc(b.id)}">
      <p class="q">${esc(b.q)}${b.id.startsWith("demo-") ? `<span class="demoTag">example — not real</span>` : ""}</p>
      <p class="rec"><b>My recommendation:</b> ${esc(b.rec)}</p>
      <div class="ruleRow">
        <button type="button" class="rb" data-choice="yes">Do it</button>
        <button type="button" class="rb" data-choice="no">Don't</button>
        <button type="button" class="rb" data-choice="talk">Let's talk</button>
      </div>
      <textarea class="rnote" rows="2" placeholder="A note, if you want one — your words outrank the button."></textarea>
      <p class="muted rstate"></p>
    </div>`).join("")}</div>`}
  </section>

  <section class="card">
    <h2>Ideas</h2>
    <p class="muted" id="ideaCapNote">Checking whether this view can save…</p>
    <div id="ideaForm" hidden>
      <textarea id="ideaText" rows="3" placeholder="An idea, feedback, a bug you noticed — any words. It lands on the Chart and gets a fate."></textarea>
      <button id="ideaSend" type="button">Send to the Chart</button>
      <p class="muted" id="ideaStatus"></p>
    </div>
    <div id="ideaList"></div>
  </section>

  <section class="card">
    <h2>Shipped today (${commits === null ? "?" : commits.length} commits)</h2>
    ${commits === null ? `<p class="bad">unreadable: git log failed</p>`
      : commits.length === 0 ? `<p class="muted">Nothing yet today.</p>`
      : `<ul class="shipList">${commits.slice(0, 12).map((c) => `<li>${esc(shortSubject(c.s))}</li>`).join("")}${commits.length > 12 ? `<li class="muted">…and ${commits.length - 12} more</li>` : ""}</ul>`}
  </section>

  <section class="card">
    <h2>Your rulings, in hand (${ruled === null ? "?" : ruled.length})</h2>
    ${ruled === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
      : ruled.length === 0 ? `<p class="muted">Nothing ruled yet.</p>`
      : `<table id="ruled">${ruled.map((r) => `<tr><td>${esc(r.item)}</td><td><b>${esc(r.call)}</b><br><span class="muted">${esc(r.now)}</span></td></tr>`).join("")}</table>
    <p class="muted">Migrated from the Helm and derived from the Chart — the Bosun works to these.</p>`}
  </section>

  <section class="card">
    <h2>Tasks (${checklist === null ? "?" : checklist.done} done · ${checklist === null ? "?" : checklist.open} open)</h2>
    ${tasks === null ? `<p class="bad">unreadable: CHART.md missing or unparseable</p>`
      : rows(tasks.map(esc), "Nothing open — full detail in .planning/CHART.md.")}
  </section>

  <section class="card">
    <h2>Watchdog restarts (last 5, on ${esc(MACHINE)})</h2>
    ${rows(restarts.map(esc), restartsEmptyMsg)}
  </section>

  <p class="meta">Generated ${esc(nowIso)} on <b>${esc(MACHINE)}</b> by scripts/wyclau/glass.mjs — every number above is derived, none hand-typed. Stale &gt; 45 min = something is wrong; the watchdog should have restarted the Bosun.</p>
</div>
<script>
  (function(){
    "use strict";
    var state;
    try { state = JSON.parse(document.getElementById("glassState").textContent); }
    catch (e) { state = { v: 2, generatedAt: "${nowIso}", lastProgressAt: "${nowIso}", ideas: [] }; }

    // --- freshness (the Bosun's clock, untouched by page saves: an idea is not progress).
    // TWO clocks, on purpose (Wyatt, 2026-08-31): tProgress answers "is the worker alive", read
    // from real evidence (HEARTBEAT/LAST-ACTIVITY at generation time); tPublished answers "how
    // old is THIS page" — the two can legitimately disagree, and showing both is the fix. Neither
    // can see work that happens after this page was generated; only republishing closes that gap.
    var tProgress = new Date(state.lastProgressAt || state.generatedAt);
    var tPublished = new Date(state.generatedAt);
    function fmtAge(ms){
      var m = Math.floor(ms/60000);
      return m < 1 ? "moments ago" : m + " min ago";
    }
    function tick(){
      var age = document.getElementById("age"), emoji = document.getElementById("pulseEmoji"),
          p = document.getElementById("pulse"), pub = document.getElementById("publishedLine");
      var progressMs = Date.now() - tProgress.getTime();
      var publishedMs = Date.now() - tPublished.getTime();
      age.textContent = "last progress " + fmtAge(progressMs);
      var stale = Math.floor(progressMs/60000) > 45;
      emoji.textContent = stale ? "🔴" : "🟢";
      p.className = stale ? "pulseline stale" : "pulseline";
      if (pub) pub.textContent = "page published " + fmtAge(publishedMs);
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

    // Compare the TRIMMED draft — ideas are trimmed before saving, and comparing untrimmed
    // refilled the box with an already-saved idea (CEO Review 47, correction 2).
    var saved = state.ideas.some(function(i){ return i.text === getDraft().trim(); });
    if (saved) setDraft("");
    text.value = getDraft();
    text.addEventListener("input", function(){ setDraft(text.value); });

    // --- the Helm, folded in: rule on each open question right here.
    // ⚠ SELECT BY ID, ALWAYS. The artifact host injects its OWN reset stylesheet and wrapper
    // before this document's content, so a tag-or-position selector (document.querySelector
    // ("style"), firstElementChild, "the second script") can silently resolve to the HOST's
    // asset instead of ours. Everything this page owns carries an id: #glass-style, #glassState,
    // #asks, #ideaForm. Ledger lesson, 2026-08-31 — earned on the Helm before this page existed.
    if (!state.rulings) state.rulings = {};
    var asksBox = document.getElementById("asks");
    var asks = asksBox ? Array.prototype.slice.call(asksBox.getElementsByClassName("ask")) : [];
    function paintAsk(el){
      var id = el.getAttribute("data-id");
      var r = state.rulings[id];
      var note = el.querySelector(".rnote"), st = el.querySelector(".rstate");
      Array.prototype.forEach.call(el.querySelectorAll(".rb"), function(b){
        b.setAttribute("aria-pressed", String(!!r && r.choice === b.getAttribute("data-choice")));
      });
      if (r) {
        el.className = "ask ruled";
        if (r.note && note.value !== r.note) note.value = r.note;
        st.textContent = "Ruled " + r.at.slice(0, 16).replace("T", " ") + "Z — waiting for a session to pick it up.";
      } else { st.textContent = ""; }
    }
    asks.forEach(paintAsk);

    function saveRuling(el, choice){
      if (!cap) return;
      if (el.getAttribute("data-id").indexOf("demo-") === 0) return; // demo cards never save
      var id = el.getAttribute("data-id");
      var st = el.querySelector(".rstate");
      st.textContent = "Saving your ruling…";
      var next = JSON.parse(JSON.stringify(state));
      if (!next.rulings) next.rulings = {};
      next.rulings[id] = {
        choice: choice,
        note: el.querySelector(".rnote").value.trim(),
        q: el.querySelector(".q").textContent,
        at: new Date().toISOString(),
      };
      cap.publish(buildDoc(next)).catch(function(e){
        st.textContent = "Couldn’t save (" + ((e && e.code) || e) + "). Your note is still on screen — try again, or tell a session.";
      });
    }
    asks.forEach(function(el){
      Array.prototype.forEach.call(el.querySelectorAll(".rb"), function(b){
        b.addEventListener("click", function(){ saveRuling(el, b.getAttribute("data-choice")); });
      });
      // A note with no button press is still a ruling — his words outrank the buttons.
      el.querySelector(".rnote").addEventListener("blur", function(){
        var v = el.querySelector(".rnote").value.trim();
        var r = state.rulings[el.getAttribute("data-id")];
        if (v && (!r || r.note !== v)) saveRuling(el, (r && r.choice) || "note");
      });
    });

    var cap = null;
    var useFn = (window.claude && window.claude.use) ? window.claude.use.bind(window.claude) : null;
    (useFn ? useFn("artifact") : Promise.resolve(null)).then(function(a){
      cap = a;
      if (cap) { capNote.hidden = true; form.hidden = false; }
      else {
        capNote.textContent = "This view can’t save to the page (preview, or the grant is missing) — but any idea still reaches Claude if you say it in any session.";
        asks.forEach(function(el){ el.querySelector(".rstate").textContent = "This view can’t save rulings — open the artifact itself."; });
      }
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
console.log(`GLASS ok — heartbeat stamped ${nowIso}; page written to ${OUT}${DEMO ? "  [DEMO MODE — do not publish this render]" : ""}`);
console.log(`note: ${note}`);
if (relayedNote) {
  console.log(`relayed note picked up from GLASS-NOTE.md and folded in; the file has been reset — commit that reset with your next commit.`);
}

console.log(`
REPUBLISH THE GLASS -- writing the file is only half of it:`);
console.log(`  ${GLASS_URL}`);
console.log(`  ⚠ HARVEST FIRST: read the live artifact and move any glassState.ideas AND`);
console.log(`  glassState.rulings entries into .planning/CHART.md before republishing — a`);
console.log(`  republish without the harvest DELETES both (this page always regenerates empty).`);
console.log(`  Publish ${OUT} to that URL (Artifact tool, pass it as \`url\`). Do it at every item`);
console.log(`  boundary and before you go quiet, or he is reading a page that has stopped moving.`);
console.log(`  (v2: the page saves itself via the "artifact" capability — pass`);
console.log(`  capabilities {artifact:{}} on a fresh publish, or if the page says it can't save.)`);
console.log(`  ⚠ THEN RUN: node scripts/wyclau/mark_glass_published.mjs`);
console.log(`  This is the OTHER HALF of "publishing is part of pulsing" (CEO Review 52) — the`);
console.log(`  keep-working Stop hook checks the gap it records and will block a stale, unpublished`);
console.log(`  pulse. Skipping this step is skipping the whole mechanism, not a shortcut past it.`);
