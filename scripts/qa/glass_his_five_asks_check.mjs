#!/usr/bin/env node
// GATE: the five things Wyatt asked the Glass to do on 2026-09-02T16:1xZ — plus the note his page
// was cutting in half on the same screenshot.
//
// HIS WORDS: "claude my friend, you just HAVE to fix the glass. Don't do it yourself -- put it to
// the TOP of the chart." The five, verbatim in `.planning/CHART.md` row T-088:
//   1. "what is being worked on RIGHT NOW? that needs to be visible just underneath the emoji status"
//   2. "last progress 25 min ago" while work was four minutes old
//   3. "if there are no calls for me to make, don't show the Your Call box"
//   4. "the Chart is still not using numbers -- it's using bullet points. it needs numbers"
//   5. the page shouting his own ALL-CAPS row titles back at him
//
// WHY EACH CASE IS SHAPED THE WAY IT IS — the failure this page keeps having is not "the feature is
// missing", it is "the feature is present and says something untrue". So every case below pairs the
// thing he asked for with the LIE it could become:
//   in hand ......... must never show a FINISHED item as still in hand
//   page age ........ must never present a frozen number as current
//   Your call ....... must hide an EMPTY card and never an UNREADABLE one
//   de-shouting ..... must never eat an acronym or a row handle
//
// ⚠ WHAT THIS GATE CANNOT SEE, stated so nobody reads it as more than it is: it asserts what the
// page SAYS, by rendering the real generator into a throwaway tree and reading the HTML. It does not
// run a browser, so it cannot prove the live minute-counter ticks. The clause it checks for is
// therefore required in BOTH the server-rendered default and the client's own assignment — the
// no-JavaScript first paint and the tick after it — because a claim that exists in only one of those
// is a claim he might never read.
//
// House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GLASS = join(ROOT, "scripts", "wyclau", "glass.mjs");

let failed = false;
const fail = (m) => { console.log(`  FAIL  ${m}`); failed = true; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("the Glass does the five things he asked for, and none of them lie\n");

/* THE REAL GENERATOR, IN A THROWAWAY TREE — never a paraphrase of it, and never the real
   .planning/. `glass.mjs --note` REWRITES .planning/wyclau/glass.html AND CLEARS GLASS-NOTE.md
   unconditionally; a watch's unpublished note to Wyatt has already been destroyed once by a command
   run only to inspect the page (INBOX-20260902T0350Z). A gate must not be the second time. */
function render({ chart, status = HELD, note = "gate: glass_his_five_asks" }) {
  const dir = mkdtempSync(join(tmpdir(), "glass-five-asks-"));
  mkdirSync(join(dir, "scripts", "wyclau", "lib"), { recursive: true });
  mkdirSync(join(dir, ".planning", "wyclau", "status"), { recursive: true });
  writeFileSync(join(dir, "scripts", "wyclau", "glass.mjs"), readFileSync(GLASS));
  writeFileSync(join(dir, "scripts", "wyclau", "lib", "chart_model.mjs"),
    readFileSync(join(ROOT, "scripts", "wyclau", "lib", "chart_model.mjs")));
  writeFileSync(join(dir, ".planning", "CHART.md"), chart);
  if (status !== null) writeFileSync(join(dir, ".planning", "wyclau", "status", "a-machine.md"), status);
  execFileSync(process.execPath, [join(dir, "scripts", "wyclau", "glass.mjs"), "--note", note], { stdio: "pipe" });
  const html = readFileSync(join(dir, ".planning", "wyclau", "glass.html"), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return html;
}

/* THE REAL WRITER, NEVER A PARAPHRASE OF ITS OUTPUT — the fixture is produced by running
   claim_item.mjs and publish_status.mjs, so a change to either shape fails this gate instead of
   quietly passing against a hand-typed copy of last week's format. */
function statusFile({ item, ageMinutes = 0, stale = 90 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "glass-claim-"));
  mkdirSync(join(dir, ".planning", "wyclau"), { recursive: true });
  if (item !== null) {
    execFileSync(process.execPath, [join(ROOT, "scripts", "wyclau", "claim_item.mjs"), `--dir=${dir}`, `--item=${item}`, `--stale=${stale}`], { stdio: "pipe" });
    if (ageMinutes) {
      const p = join(dir, ".planning", "wyclau", "IN-HAND");
      const m = JSON.parse(readFileSync(p, "utf8"));
      m.claimedAt = new Date(Date.now() - ageMinutes * 60000).toISOString();
      writeFileSync(p, JSON.stringify(m, null, 2) + "\n");
    }
  }
  try { execFileSync(process.execPath, [join(ROOT, "scripts", "wyclau", "publish_status.mjs"), `--dir=${dir}`], { stdio: "pipe" }); } catch { /* exit 3 = unchanged */ }
  const out = readFileSync(join(dir, ".planning", "wyclau", "status", `${hostname()}.md`), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return out;
}
const HELD = statusFile({ item: "T-088 — his five Glass asks" });
const RELEASED = statusFile({ item: null });
const COLD = statusFile({ item: "T-088 — his five Glass asks", ageMinutes: 200 });
// A status file written before the In hand block existed: it says NOTHING about what is in hand,
// which is not the same as saying nothing is.
const OLD_SHAPE = HELD.split("## In hand")[0];

const CHART = (blockedBody, tasks = "- [ ] **A THING STILL TO DO.**") => `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

${tasks}

## BLOCKED ON WYATT
${blockedBody}
## THE IDEA INBOX

*(empty)*
`;

const EMPTY_TABLE = `
| Question | Recommendation | since |
|---|---|---|

`;
const ONE_ROW = `
| Question | Recommendation | since |
|---|---|---|
| Ship the coin? | Yes — it is one line | 16:00Z |

`;
const PROSE_ONLY = `
*A real question, written as a paragraph instead of a row: should the trial's red proof be
allowed to flash a console window on every npm test?*

`;

// The one place the page names what is in hand. Located by id, not by its words, so renaming the
// label does not silently retire this whole gate (the correction rulings_triage_check.mjs had to
// make when he renamed a card).
const inHandLine = (html) => (/<p[^>]*id="inHand"[^>]*>([\s\S]*?)<\/p>/.exec(html) || [null, null])[1];
const plain = (line) => String(line).replace(/<[^>]+>/g, "").trim();

// 1/9 — WHAT IS BEING WORKED ON RIGHT NOW. His ask 1.
{
  const line = inHandLine(render({ chart: CHART(ONE_ROW), status: HELD }));
  if (line === null) fail('nothing on the page says what is being worked on right now — his ask 1 ("that needs to be visible just underneath the emoji status") is not rendered at all');
  else if (!/T-088/.test(line)) fail(`the in-hand line reads "${plain(line)}" — it does not name the item the status file says is claimed`);
  else pass("a live claim reaches the top of the page");
}

// 2/9 — AND IT MUST GO QUIET WHEN THE WATCH ENDS. His own words in the row: "Between watches there
//       is no claim: render 'nothing in hand', NEVER the last thing finished." This is the case that
//       makes the feature worth having; a status line that keeps showing a completed item is the lie
//       the page told all day.
{
  const line = inHandLine(render({ chart: CHART(ONE_ROW), status: RELEASED }));
  if (line === null) fail("the in-hand line vanishes entirely once the item is released — he cannot tell 'nothing in hand' from 'this feature broke'");
  else if (/T-088/.test(line)) fail(`the claim was released and the page still shows it as in hand: "${plain(line)}"`);
  else if (/nothing in hand\b/i.test(plain(line))) fail(`the line reads "${plain(line)}" — only the claim RECORD is readable from here, so asserting nothing is in hand is a statement the page cannot support (CEO 112: the same class of lie he complained about, inverted)`);
  else if (!/nothing recorded in hand/i.test(plain(line))) fail(`between watches the line reads "${plain(line)}" rather than saying no claim is on record`);
  else pass("a released claim renders as nothing RECORDED in hand — a fact about the record, not about the world");
}

// 3/9 — CLAIMED BUT COLD. The state the design's first draft missed and the one he is actually
//       complaining about: a watch can claim and END WITHOUT CLOSING — twice on 2026-09-02, both
//       deliberate. An open claim outliving its watch is normal here and must never read as work in
//       progress. Derived from a staleAfterMinutes the block declares itself, so no new constant.
{
  const line = inHandLine(render({ chart: CHART(ONE_ROW), status: COLD }));
  if (line === null) fail("the in-hand line is missing on a stale claim");
  else if (!/cold/i.test(plain(line))) fail(`a claim 200 minutes old, past its own 90-minute staleness, still reads as work in progress: "${plain(line)}"`);
  else if (!/T-088/.test(line)) fail("a cold claim stops naming its item — he cannot tell what was abandoned");
  else pass("a claim past its own declared staleness reads as cold, and still names the item");
}

// 4/9 — SILENCE IS NOT "NOTHING". Two ways the page can have no claim to show and they must not look
//       alike: no status file at all, and a status file written before this block existed. Both are
//       "nobody has said", which is not "nothing is in hand" — and "nothing in hand" is a claim
//       about the whole relay.
{
  const none = inHandLine(render({ chart: CHART(ONE_ROW), status: null }));
  if (none === null) fail("no status file at all and the in-hand line is simply absent — a page that cannot read its source must say so");
  else if (/nothing (recorded )?in hand/i.test(none)) fail("no status file at all and the page reports nothing in hand — it is stating a fact it has no source for");
  else if (!/unreadable/i.test(none)) fail(`no status file, and the line reads "${plain(none)}" instead of naming itself unreadable`);
  else pass("no status file renders as unreadable rather than a confident 'nothing in hand'");

  const old = inHandLine(render({ chart: CHART(ONE_ROW), status: OLD_SHAPE }));
  if (/nothing (recorded )?in hand/i.test(old)) fail("a status file written before the In hand block existed renders as nothing in hand — the page is answering a question that machine never answered");
  else if (!/unreadable/i.test(old)) fail(`a status file with no In hand block reads "${plain(old)}"`);
  else pass("a status file that predates the block says so rather than answering for it");
}

// 4/9 — THE PAGE IS A PHOTOGRAPH AND MUST SAY SO. His ask 2: he read "last progress 25 min ago"
//       while work was four minutes old. The number was honest; the page was 13 minutes stale and
//       nothing on it said the first number is bounded by the second.
{
  const html = render({ chart: CHART(ONE_ROW), status: HELD });
  const served = (/<p class="publishedline"[^>]*>([^<]*)<\/p>/.exec(html) || [null, ""])[1];
  const blind = /cannot see (anything|work) newer/i;
  if (!blind.test(served)) fail(`the published line's first paint reads "${served.trim()}" — with JavaScript off, or before the first tick, nothing tells him this page cannot see work newer than its own publish`);
  else pass("the first paint says the page cannot see anything newer than its publish");

  /* ONE DEFINITION, AND EVERY WRITER USES IT (rule 23). The clause could have been typed into each
     assignment; two copies of a sentence are two things kept in step by nothing, and this page has
     already been bitten by exactly that (the fate rule, which diverged by eleven rows in hours). So
     the assertion is in two parts: the constant says the true thing, and no assignment writes the
     line without it. */
  const decl = (/var BLIND\s*=\s*("[^"]*")/.exec(html) || [null, ""])[1];
  if (!blind.test(decl)) fail(`the client's blindness clause is ${decl || "missing entirely"} — the live line no longer tells him the number is bounded by the page's own age`);
  else pass("the client carries one definition of the blindness clause and it says the true thing");

  const assignments = html.match(/pub\.textContent\s*=\s*[^;]+;/g) || [];
  const bare = assignments.filter((a) => !/\bBLIND\b/.test(a));
  if (assignments.length === 0) fail("the client script no longer sets the published line at all — the live minute count is gone");
  else if (bare.length) fail(`${bare.length} of ${assignments.length} published-line assignments write the age without the blindness clause — after one tick he is back to reading a frozen number as current`);
  else pass("every live update of the published line goes through that one clause");

  /* AND THE CLAUSE MUST BE ON THE NUMBER HE READS, not only on the line under it. CEO 112: "the
     number he objected to is unchanged and still the prominent one." The frozen figure is the one
     labelled "last progress"; once the page is more than a minute old that label must say whose
     clock it is on. This is a mitigation and the file says so — the cure is republishing on landing. */
  const ageAssign = (/age\.textContent\s*=\s*"last progress"?[^;]*;/.exec(html) || [""])[0];
  if (!/as of this page/i.test(ageAssign)) fail(`the "last progress" figure is written as \`${ageAssign.slice(0, 90)}\` — on a page that is minutes old it presents a frozen number as current, which is exactly what he reported at 16:12`);
  else if (!/publishedMs/.test(ageAssign)) fail("the 'as of this page' clause is unconditional — a page published seconds ago should not disclaim itself");
  else pass("the last-progress figure says whose clock it is on once the page is no longer fresh");
}

// 5/9 — HIDE "YOUR CALL" WHEN IT IS EMPTY. His ask 3, one conditional.
{
  const html = render({ chart: CHART(EMPTY_TABLE), status: HELD });
  if (/Your call/i.test(html)) fail('the BLOCKED ON WYATT table is empty and the "Your call" card is still on the page — his ask 3 was "if there are no calls for me to make, don\'t show the Your Call box"');
  else pass("an empty blocked table hides the Your call card entirely");
}

// 6/9 — AND NEVER HIDE AN UNREADABLE ONE. The dangerous half, and it is a live defect (T-077): the
//       renderer takes only `|` rows, so a question written as a paragraph renders as (0) while it
//       genuinely waits. Hiding the card at (0) would bury it completely.
{
  const html = render({ chart: CHART(PROSE_ONLY), status: HELD });
  if (!/Your call/i.test(html)) fail("a question written into BLOCKED ON WYATT as a paragraph makes the card vanish — the page now hides a real question instead of merely miscounting it");
  else if (!/could not read/i.test(html)) fail('the card is shown but says nothing about the paragraph it could not parse — he reads "(0)" beside a section that has content');
  else pass("a blocked section with unparseable content keeps the card and says so");
}

// 7/9 — NUMBERS, NOT BULLETS. His ask 4, and the second time he has asked (INBOX-20260902T13xxZ).
//       RANK orders the list now, so without numbers the ordering he asked for four times is
//       invisible.
{
  const html = render({ chart: CHART(ONE_ROW, "- [ ] **First thing.**\n- [ ] **Second thing.**"), status: HELD });
  const card = (/<h2>The Chart \(Tasks To Do\)[\s\S]*?<\/section>/.exec(html) || [""])[0];
  if (!card) fail("the Tasks card could not be found at all");
  else if (!/<ol>/.test(card)) fail("the Tasks list is still bullets — he has asked twice for numbers, and the rank order the Chartkeeper writes is unreadable without them");
  else pass("the Tasks list is numbered");
}

// 8/9 — STOP SHOUTING HIS OWN ROWS BACK AT HIM. His ask 5. The rule has to tell an ACRONYM from
//       SHOUTING, and the distinguishing fact is not the word, it is the phrase: two or more
//       all-caps words in a row is emphasis; one is a name. The one-letter case is here because a
//       first version failed it on his real Chart — "FROM A HAND-TYPED NUMBER" survived intact
//       because the `A` in the middle ended the run.
{
  const rows = [
    "- [ ] **FIX THE GLASS — his five asks.**",
    "- [ ] **CEO 110 said the gate claimed inheritance it never tested.**",
    "- [ ] **T-088 covers the npm test flash.**",
    "- [ ] **The trial decides it FROM A HAND-TYPED NUMBER.**",
    "- [ ] **I asked him and the answer was no.**",
    "- [ ] **STILL WORD-SEARCHES FOR THE HEADING — CEO 104's one residual.**",
  ].join("\n");
  const html = render({ chart: CHART(ONE_ROW, rows), status: HELD });
  const card = (/<h2>The Chart \(Tasks To Do\)[\s\S]*?<\/section>/.exec(html) || [""])[0];
  if (/FIX THE GLASS/.test(card)) fail('the Tasks card still shouts "FIX THE GLASS" at him — his ask 5');
  else if (!/Fix the glass/.test(card)) fail("the shouting row is neither shouted nor sentence-cased — the de-shouting mangled it");
  else pass("a run of all-caps words is sentence-cased");

  if (!/from a hand-typed number/.test(card)) fail("a one-letter word in the middle of a shouting phrase ends the run — 'FROM A HAND-TYPED NUMBER' is still shouted at him");
  else pass("a one-letter word carries the run through instead of breaking it");

  if (!/CEO 110/.test(card)) fail("de-shouting ate the acronym in 'CEO 110' — a single all-caps word is a name, not shouting");
  else pass("a lone acronym survives");
  // Found on his REAL Chart, not invented: a punctuation-only token was carrying a shouting run
  // across a clause boundary and eating the acronym on the far side.
  if (!/heading — CEO 104/.test(card)) fail("a dash carried the shouting run past the end of the clause and lowercased the acronym after it — his page read 'the heading — ceo 104's'");
  else pass("a dash ends a shouting run rather than carrying it into the next clause");
  if (!/T-088/.test(card)) fail("de-shouting ate the row handle 'T-088' — a token carrying a digit is an identifier, not shouting");
  else pass("a row handle carrying a digit survives");
  if (!/>I asked him/.test(card) && !/<li>I asked him/.test(card)) fail("the lone English word 'I' was lowercased — it is always capital, which is a fact about the language rather than an exception list");
  else pass("a lone 'I' is left alone");
}

// 9/9 — HIS NOTE, CUT IN HALF BY A VERSION NUMBER. Same screenshot, same class as the five: the page
//       clipping content rather than the content being wrong. His note read "evidence from before
//       today's 2026." and stopped — the sentence splitter treated the dot inside `2026.09.01.8` as
//       a full stop. A sentence ends with punctuation FOLLOWED BY A SPACE; a version number never is.
{
  const note = "This is evidence from before today's 2026.09.01.8 build and it still stands.";
  const html = render({ chart: CHART(ONE_ROW), status: HELD, note });
  const shown = (/<span class="pulsenote" id="noteText">([^<]*)<\/span>/.exec(html) || [null, ""])[1];
  if (/2026\.$/.test(shown.trim())) fail(`his note is cut at the version number: "${shown.trim()}" — the dot inside 2026.09.01.8 is being read as the end of a sentence`);
  else if (!/still stands/.test(shown)) fail(`his note is truncated to "${shown.trim()}" — the whole sentence is one sentence and fits`);
  else pass("a note containing a version number is not cut at the version number");
}

console.log(failed ? "\nFAIL" : "\nPASS");
process.exit(failed ? 1 : 0);
