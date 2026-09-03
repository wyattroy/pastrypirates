#!/usr/bin/env node
// GATE: the two buttons Wyatt rules with say HIS words — Approve and Deny.
//
// HIS WORDS, Glass DO NOW pin, 2026-09-03 10:22 AM ET (INBOX-20260903T142249Z):
//   "Change the buttons that say Do It and Don't to Approve and Deny— and always when giving me
//    options to choose number or letter them"
//
// WHY A GATE AND NOT JUST AN EDIT. Two strings are the easiest thing in this repo to lose: the
// Glass generator is edited by every session that touches his page, and the buttons carry no test
// of their own. He has had to ask twice for the Lesson to move and four times for the Chart to
// re-prioritise. A label he asked for once, with nothing checking it, is a label that comes back.
//
// AND THE HALF THAT IS NOT ABOUT WORDS AT ALL — case 4. The button's `data-choice` is the VALUE
// stored in `glassState.rulings` and re-read at `glass.mjs`'s redraw to decide which button shows
// as pressed. Renaming the value while relabelling the button would orphan every ruling already
// saved on his live page: he would open it and find his own answers un-pressed. **The label is his
// to name; the value is a key and must not move.** That is the failure this gate exists to make
// impossible, and it is the one a careless "rename it everywhere" would cause.
//
// CASE 5 IS THE SWEEP (rule 8, same thing said the same way everywhere). `harvest_glass.mjs`
// writes his ruling into DECISIONS.md, and it wrote the raw value — so from the day of the
// relabel his page would say Approve while his own decision record said "yes".
//
// House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GLASS = join(ROOT, "scripts", "wyclau", "glass.mjs");
const HARVEST = join(ROOT, "scripts", "wyclau", "harvest_glass.mjs");

let failed = false;
const fail = (m) => { console.log(`  FAIL  ${m}`); failed = true; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("his ruling buttons say Approve and Deny, and the value under them never moves\n");

const CHART = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] **A thing still to do.**

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|
| Ship the coin? | Yes — it is one line | 16:00Z |

## THE IDEA INBOX

*(empty)*
`;

/* THE REAL GENERATOR, IN A THROWAWAY TREE — never the real .planning/. `glass.mjs --note`
   rewrites .planning/wyclau/glass.html, and a watch's unpublished note to Wyatt has already been
   destroyed once by a command run only to inspect the page (INBOX-20260902T0350Z). */
function render() {
  const dir = mkdtempSync(join(tmpdir(), "glass-ruling-words-"));
  mkdirSync(join(dir, "scripts", "wyclau", "lib"), { recursive: true });
  mkdirSync(join(dir, ".planning", "wyclau"), { recursive: true });
  writeFileSync(join(dir, "scripts", "wyclau", "glass.mjs"), readFileSync(GLASS));
  writeFileSync(join(dir, "scripts", "wyclau", "lib", "chart_model.mjs"),
    readFileSync(join(ROOT, "scripts", "wyclau", "lib", "chart_model.mjs")));
  writeFileSync(join(dir, ".planning", "CHART.md"), CHART);
  execFileSync(process.execPath, [join(dir, "scripts", "wyclau", "glass.mjs"), "--note", "gate: glass_ruling_button_words"], { stdio: "pipe" });
  const html = readFileSync(join(dir, ".planning", "wyclau", "glass.html"), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return html;
}

const html = render();
const ruleRow = (/<div class="ruleRow">([\s\S]*?)<\/div>/.exec(html) || [null, null])[1];

// The buttons, read out of the rendered row as (value, label) pairs. Located by the attribute the
// page's own click handler reads, so a label change can never make this gate stop looking.
const buttons = ruleRow === null ? [] :
  [...ruleRow.matchAll(/<button[^>]*data-choice="([^"]*)"[^>]*>([\s\S]*?)<\/button>/g)]
    .map((m) => ({ value: m[1], label: m[2].replace(/<[^>]+>/g, "").trim() }));
const labelFor = (v) => (buttons.find((b) => b.value === v) || {}).label;

// 1/5 — THE APPROVE BUTTON. His word, not ours.
{
  if (ruleRow === null) fail("there is no ruling row on the page at all — the Your call card renders no buttons, so he cannot rule on anything");
  else if (labelFor("yes") === undefined) fail(`no button carries data-choice="yes" — the buttons found were ${JSON.stringify(buttons)}`);
  else if (/^do it$/i.test(labelFor("yes"))) fail(`the approve button still reads "${labelFor("yes")}" — he asked for "Approve" (INBOX-20260903T142249Z, and he pressed DO NOW on it)`);
  else if (labelFor("yes") !== "Approve") fail(`the approve button reads "${labelFor("yes")}" — his word is "Approve", exactly`);
  else pass('the approve button reads "Approve"');
}

// 2/5 — THE DENY BUTTON.
{
  if (labelFor("no") === undefined) fail(`no button carries data-choice="no" — the buttons found were ${JSON.stringify(buttons)}`);
  else if (/^don.?t$/i.test(labelFor("no"))) fail(`the deny button still reads "${labelFor("no")}" — he asked for "Deny"`);
  else if (labelFor("no") !== "Deny") fail(`the deny button reads "${labelFor("no")}" — his word is "Deny", exactly`);
  else pass('the deny button reads "Deny"');
}

// 3/5 — AND THE THIRD BUTTON IS NOT HIS TO LOSE. He named two buttons. A rename that tidied the
//       third one as well would be a session substituting its taste for his ask — the exact move
//       rule 1 draws the line at ("taste, placement and wording are his").
{
  if (labelFor("talk") === undefined) fail("the third button is gone — he asked for two labels to change, not for a button to be removed");
  else if (!/talk/i.test(labelFor("talk"))) fail(`the third button now reads "${labelFor("talk")}" — he did not ask for that one to change`);
  else pass(`the third button is untouched ("${labelFor("talk")}")`);
}

// 4/5 — ⛔ THE VALUE UNDER THE LABEL MUST NOT MOVE. `glass.mjs`'s redraw compares a saved ruling's
//       `choice` against this attribute to decide which button shows as pressed. Every ruling
//       already saved on his live page carries yes/no/talk. Renaming the value un-presses his own
//       answers, on a page he cannot re-rule from memory.
{
  const values = buttons.map((b) => b.value).sort().join(",");
  if (values !== "no,talk,yes") fail(`the stored choice values are now ${JSON.stringify(values)} — they must stay yes,no,talk or every ruling already saved on his live page stops showing as answered`);
  else pass("the stored values are still yes/no/talk, so rulings saved before the relabel still redraw as pressed");
}

// 5/5 — THE SWEEP: his own decision record must say the same word his page said. `harvest_glass.mjs`
//       carries a ruling into DECISIONS.md; it used to print the raw value, so his page would read
//       "Approve" and his record "yes" — the same thing said two ways, which is rule 8.
{
  const dir = mkdtempSync(join(tmpdir(), "glass-ruling-harvest-"));
  const page = join(dir, "page.html");
  const decisions = join(dir, "DECISIONS.md");
  const inbox = join(dir, "INBOX.md");
  const state = { ideas: [], comments: {}, rulings: {
    "t999-fixture": { q: "Ship the coin?", choice: "yes", at: "2026-09-03T14:30:00.000Z" },
    "t998-fixture": { q: "Rebuild the Glass on Firebase?", choice: "no", at: "2026-09-03T14:31:00.000Z" },
  } };
  writeFileSync(page, `<script type="application/json" id="glassState">${JSON.stringify(state)}</script>`);
  writeFileSync(decisions, "# DECISIONS — fixture\n\n");
  writeFileSync(inbox, "# THE INBOX — fixture\n\n");
  execFileSync(process.execPath, [HARVEST, `--html=${page}`, `--decisions=${decisions}`, `--inbox=${inbox}`], { stdio: "pipe" });
  const out = readFileSync(decisions, "utf8");
  rmSync(dir, { recursive: true, force: true });

  if (/Wyatt ruled "yes"/.test(out)) fail('his decision record still says he ruled "yes" — his page says "Approve", and the record he reads should say the word he pressed');
  else if (!/Wyatt ruled "Approve"/.test(out)) fail(`the harvested ruling does not name his word: ${JSON.stringify((/\*\*Wyatt ruled[^*]*\*\*/.exec(out) || ["not found"])[0])}`);
  else if (!/Wyatt ruled "Deny"/.test(out)) fail('a "no" ruling does not land in the record as "Deny"');
  else pass("a harvested ruling reaches DECISIONS.md in the same words the button showed him");
}

// 6/6 — THE OTHER HALF OF HIS SENTENCE, AND IT IS NOT A BUTTON. "and always when giving me options
//        to choose number or letter them" is a standing WRITING rule: it governs the question UI,
//        a BLOCKED ON WYATT row that offers alternatives, and any reply laying out ways to go.
//
// ⚠ WHAT THIS CASE HONESTLY CHECKS, AND WHAT IT CANNOT. It checks that the RULE IS STILL WRITTEN
//   DOWN where a session reads it. It cannot check that a session obeyed it — no gate can read
//   prose for that, and pretending otherwise would be the "green suite that proves nothing about
//   what he sees" this project already owns a rule about.
//   IT IS HERE ANYWAY BECAUSE THE RULE IS IN THE WRONG HOME AND EVERYONE SHOULD KNOW IT. The
//   canonical place is `.claude/CLAUDE.md` §1 and `.claude/memory/DECISIONS.md`; a watch is fenced
//   out of `.claude/` (measured 2026-09-03 — both edits refused as protected files), so the rule
//   lives in the wyclau CHARTER, which is the most-read file this watch could write. A rule in an
//   unusual home is a rule somebody tidies away, so it is pinned.
{
  const charter = readFileSync(join(ROOT, ".planning", "wyclau", "CHARTER.md"), "utf8");
  if (!/number or letter/i.test(charter)) fail("his 2026-09-03 rule — number or letter every option you put in front of him — is no longer written in .planning/wyclau/CHARTER.md, and it is not in .claude/ either, so nothing a session reads carries it");
  else if (!/INBOX-20260903T142249Z/.test(charter)) fail("the numbering rule is in the CHARTER but no longer cites the instruction it came from — a rule with no source is a rule the next session argues with");
  else pass("his numbering rule is still written where a session reads it, and still cites his own words");
}

console.log(failed ? "\nFAIL" : "\nPASS");
process.exit(failed ? 1 : 0);
