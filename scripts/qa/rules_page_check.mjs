/* A-7 — THE RULES PAGE DERIVES FROM THE GAME, NOT FROM MEMORY. Wyatt, 2026-08-28: "Add a
 * mechanism (perhaps a hook? please suggest the most efficient, durable method) to the build
 * process that automatically updates the rules page according to the latest rules (eg. i'm not
 * sure if black market is in there either)".
 *
 * MEASURED BEFORE CHANGING: the How-to-Play modal hand-typed every number (roundCfg's own comment
 * had already filed it: "the how-to-play modal still hardcodes its numbers — that is a filed
 * todo"), still documented the SHOT CLOCK (removed 2026-08-28, A-10), still described the old
 * "declare victory + one last turn" ending (the bake-off replaced it), and never mentioned the
 * black market (live since 2026-08-12). He was right to be suspicious.
 *
 * THE MECHANISM, two halves — chosen over a hook because a hook only fires in Claude sessions
 * while this fires for anything that runs npm test, which the release loop requires:
 *   1. RUNTIME DERIVATION (the automatic half): every tuned number on the page is an empty
 *      <b data-rule="key"> span, filled from rulesFacts(cfg) — the same cfg the engine plays by —
 *      when the game boots and again each time the modal opens. A retuned constant can never
 *      disagree with the page, because the page holds no copy of it.
 *   2. THIS GATE (the fence for prose): numbers can derive themselves; sentences cannot. So the
 *      gate fails the build when the page's PROSE drifts from the code — a mechanic the code
 *      carries that the page never mentions, a mechanic the code dropped that the page still
 *      teaches, a hand-typed amount that bypasses the span mechanism, or a span nothing fills.
 *      Each prose requirement is ANCHORED TO A LIVE CODE SYMBOL, so the requirement itself
 *      retires with the feature instead of rotting into a false alarm.
 *
 * Run RED against the pre-A-7 page: shot clock present, black market and bake-off absent,
 * every number hand-typed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
/* ONE STRIPPER (2026-08-29). Every gate carried its own copy that deletes BLOCK comments
   first — so a LINE comment containing the characters that open one swallowed 152 lines of
   src/orchestrator.js, the whole import block included. MEASURED: it also blinded 10 lines
   of src/shared/index.js and 10 of src/ui/util.js. scripts/qa/lib/strip_comments.mjs. */
import { stripComments as sharedStrip } from "./lib/strip_comments.mjs";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };

const { roundCfg } = await import(pathToFileURL(path.join(REPO, "src/engine/index.js")).href);
const shared = await import(pathToFileURL(path.join(REPO, "src/shared/index.js")).href);
if (typeof shared.rulesFacts !== "function") {
  fail("src/shared/index.js does not export rulesFacts() — there is no one source both the page filler and this gate can read");
  console.log(`\nFAILED — ${fails} assertion(s)`);
  process.exit(1);
}
const facts = shared.rulesFacts(roundCfg(["human", "bot", "bot", "bot"]));

const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const m = html.match(/<div id="howToPlayModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
if (!m) { fail("could not locate the howToPlayModal block in index.html"); console.log(`\nFAILED — ${fails}`); process.exit(1); }
const modal = m[0];
const modalNoComments = modal.replace(/<!--[\s\S]*?-->/g, "");

/* 1. every derivable fact appears on the page as a data-rule span, and no span is an orphan */
{
  const used = [...modalNoComments.matchAll(/data-rule="([a-zA-Z0-9_]+)"/g)].map(x => x[1]);
  for (const k of Object.keys(facts))
    if (used.includes(k)) pass(`fact "${k}" (${facts[k]}) reaches the page through its span`);
    else fail(`fact "${k}" (${facts[k]}) has no data-rule span in the modal — that number is either missing from the rules or hand-typed`);
  for (const k of new Set(used))
    if (!(k in facts)) fail(`the modal carries data-rule="${k}" but rulesFacts() computes no such fact — the span would render blank`);
  if (new Set(used).size && [...new Set(used)].every(k => k in facts)) pass("every data-rule span on the page maps to a computed fact");
}

/* 2. no hand-typed amount bypasses the mechanism: a digit glued to 🌕 or "squares" outside a span
      is the exact drift A-7 exists to end */
{
  const prose = modalNoComments.replace(/<b data-rule="[^"]*">[^<]*<\/b>/g, "").replace(/<span data-rule="[^"]*">[^<]*<\/span>/g, "");
  const money = [...prose.matchAll(/\d+\s*🌕/g)].map(x => x[0]);
  if (money.length) fail(`hand-typed coin amount(s) in the modal outside data-rule spans: ${JSON.stringify(money)} — these rot the moment the cfg moves`);
  else pass("no hand-typed coin amount outside a data-rule span");
  const squares = [...prose.matchAll(/\b\d+\s+squares?\b/g)].map(x => x[0]);
  if (squares.length) fail(`hand-typed distance(s) in the modal outside data-rule spans: ${JSON.stringify(squares)}`);
  else pass("no hand-typed square-count outside a data-rule span");
}

/* 3. prose coverage, each requirement anchored to a live code symbol */
{
  const eng = fs.readFileSync(path.join(REPO, "src/engine/index.js"), "utf8");
  const modalText = modalNoComments.toLowerCase();
  // black market: live iff the engine can settle one
  if (/canBlackMarket\(/.test(eng)) {
    if (modalText.includes("black market")) pass("the black market is live (engine.canBlackMarket) and the page teaches it");
    else fail("the engine carries canBlackMarket() but the rules page never mentions the black market — Wyatt's own example of the drift");
  }
  // the bake-off: live iff its UI module exists
  if (fs.existsSync(path.join(REPO, "src/ui/bakeoff.js"))) {
    if (/bake-?off/.test(modalText)) pass("the bake-off ships (src/ui/bakeoff.js) and the page teaches it");
    else fail("the bake-off ships but the rules page still describes the old ending — a new player reads rules for a game that no longer exists");
  }
  // the shot clock: the page may teach it only while the game has one
  const srcFiles = [];
  (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) srcFiles.push(p); } })(path.join(REPO, "src"));
  // comments stripped first: util.js's graveyard tombstone NAMES the removed clock functions, and
  // an unstripped scan read that as the clock being alive (caught on this gate's first green run)
  const stripJs = sharedStrip;
  const clockLive = srcFiles.some(p => /startShotClock|shotClockTick/.test(stripJs(fs.readFileSync(p, "utf8"))));
  if (!clockLive) {
    if (modalText.includes("shot clock")) fail("the shot clock is gone from src/ (removed 2026-08-28) but the rules page still teaches it — a player will wait for a timer that never comes");
    else pass("the shot clock is gone and the page no longer teaches it");
  } else pass("shot clock live in src/ — its page section is its own business");
}

/* 4. something actually fills the spans: the filler must exist and be reachable from the modal's
      own button, or the page ships blanks */
{
  const orch = fs.readFileSync(path.join(REPO, "src/orchestrator.js"), "utf8");
  if (/rulesFacts\(/.test(orch) && /data-rule/.test(orch)) pass("orchestrator fills [data-rule] spans from rulesFacts()");
  else fail("no filler found in src/orchestrator.js — the data-rule spans would render empty");
}

/* 5. ONE RULES SURFACE. Wyatt's ruling, 2026-09-02T22:50:32Z, Glass question "rules page 2 of 4",
      confirmed by him in the question UI two minutes later ("That's the whole instruction"):
        "Agree with your rec -- delete "how it plays"
      About keeps "What the captains are saying" and "Credits"; the rules live on ONE page.

      WHY THIS GATE AND NOT A NEW ONE: sections 1-4 above exist because a rules page written from
      memory drifts from the game. about.html carried a SECOND rules section, hand-typed, that
      those sections never looked at — and it drifted FOUR ways while the modal above stayed
      correct, which is the cleanest evidence this project has that the derivation is what did the
      work. Rule 23: two things that must agree are one thing, or they will drift.

      Each assertion below is ANCHORED TO A LIVE CODE SYMBOL, like the ones above, so it retires
      with the feature instead of rotting into a false alarm: put fishing back in src/ and the
      fish assertion stops firing on its own. */
{
  /* HTML COMMENTS STRIPPED FIRST, and this gate caught itself on it: the tombstone left where the
     section used to be NAMES the four false sentences so the next reader knows what went and why —
     and the first run of these assertions read that tombstone as live copy and failed on it. Same
     trap as the shot-clock check above, which read util.js's graveyard comment as a live clock.
     A gate must judge what a READER SEES. sharedStrip is for JavaScript; this is HTML. */
  const aboutPath = path.join(REPO, "about.html");
  const about = fs.readFileSync(aboutPath, "utf8").replace(/<!--[\s\S]*?-->/g, "");

  /* THE STRIP'S OWN RED-PROOF, and it is permanent rather than a one-off run. A stripper is a
     silencer: if it ever ate live markup — one unterminated `<!--` is enough — every assertion
     below would pass on an empty string and this gate would report all-clear on a page it had
     never actually read. So: the two cards Wyatt's ruling KEEPS must still be visible after the
     strip. They are the canary, and they are chosen because his ruling names them by name.

     ⚠ THE CANARY HAS AN ORDERING DEPENDENCY, NAMED HERE BECAUSE CEO 154 FOUND IT AND NOTHING ELSE
     WOULD. It works because the tombstone above (about.html, where the section used to be) sits
     ABOVE the two live cards, and a non-greedy left-to-right strip therefore consumes the
     tombstone BEFORE it could reach them — so any over-strip that ate the cards has already eaten
     the tombstone, and the canary fires. The tombstone happens to quote both card titles
     verbatim. MOVE THE TOMBSTONE BELOW THE CREDITS CARD, or add any comment below them quoting
     those two phrases, and this canary becomes self-satisfying: it would pass on a page whose
     live cards had been eaten. If you ever move it, change the canary to assert on markup a
     comment cannot contain — an element, not a phrase. */
  if (/What the captains are saying/.test(about) && /Credits/.test(about))
    pass("the comment strip left about.html's live cards intact — the assertions below are reading a real page");
  else
    fail("the comment strip ate live markup in about.html — every assertion below is now reading a page that is not there, and would pass on nothing");

  // The structural one — his instruction, and the only one that cannot be satisfied by a rewrite.
  // Two independent teeth: the heading a reader sees, and the class that IS the rules block. A
  // section re-added under a different <h2> still trips the second.
  if (/<h2>\s*How it plays\s*<\/h2>/i.test(about))
    fail('about.html still carries its own "How it plays" rules section — his ruling of 2026-09-02 deletes it, and it is the second rules surface rule 23 forbids');
  else pass('about.html carries no "How it plays" section — one rules surface, not two');

  if (/class="abtRules"/.test(about))
    fail("about.html still carries an .abtRules block — the hand-typed rules body, under whatever heading");
  else pass("about.html carries no .abtRules block");

  // Fishing: live iff a fishing path exists in src/ at all. flow.js's tombstone NAMES the deleted
  // function, so comments are stripped first — the same trap the shot-clock check above hit on its
  // first green run.
  const js = [];
  (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) js.push(p); } })(path.join(REPO, "src"));
  const fishLive = js.some(p => /fishCast|startFishing/.test(sharedStrip(fs.readFileSync(p, "utf8"))));
  if (!fishLive) {
    if (/<b>fish<\/b>/i.test(about))
      fail("about.html offers fish as a turn action and there is no fishing path in src/ — a stranger arriving from Google is taught an action the game does not have");
    else pass("fishing is gone from src/ and about.html no longer offers it");
  } else pass("a fishing path is live in src/ — about.html may teach it");

  // The bake-off decides winning, so "first baker home wins" is false while it ships.
  if (/BAKEOFF_ENABLED\s*=\s*true/.test(fs.readFileSync(path.join(REPO, "src/shared/index.js"), "utf8"))) {
    if (/first baker\s*\n?\s*home wins/i.test(about))
      fail('about.html says "first baker home wins" while the bake-off ships — every captain wins by baking, and two home on the same day bake together');
    else pass('the bake-off ships and about.html no longer says "first baker home wins"');
  }

  // Sailing is free — the modal says so in the prose this gate already reads. The wind caps RANGE;
  // it never charges. "Sailing budget ... cheap with it, dear against it" tells a stranger it costs.
  if (/Sailing is\s*<b>\s*free\s*<\/b>/i.test(fs.readFileSync(path.join(REPO, "index.html"), "utf8"))) {
    if (/sailing budget/i.test(about))
      fail('about.html says the wind sets a "sailing budget" while the game says sailing is free — the wind caps the range, it never charges');
    else pass("sailing is free in the game and about.html no longer prices it");
  }
}

console.log(fails ? `\nFAILED — ${fails} assertion(s)` : "\nPASSED — the rules page derives its numbers and its prose is fenced to the code");
process.exit(fails ? 1 : 0);
