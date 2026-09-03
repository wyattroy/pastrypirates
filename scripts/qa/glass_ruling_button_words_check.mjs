#!/usr/bin/env node
// GATE: the buttons Wyatt rules with are NUMBERED in his words, and the value under them never moves.
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

console.log("his ruling buttons are NUMBERED (his 15:56Z ruling), and the value under them never moves\n");

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

/* ⛔ SUPERSEDED BY HIS OWN LATER RULING, THREE AND A HALF HOURS AFTER THE ONE ABOVE.
   Glass, 2026-09-03T15:56:28Z (11:56 AM ET): *"this is a perfect example of why 'approve' and
   'deny' make no sense here — what would 'approve' even mean in response to your above question?
   Replace Approve and Deny with 1 2 3 Other, to bring Glass into parity with Claude's question UI,
   and leave the box as a space to write 'other' content in."*

   **THIS GATE WAS ENFORCING THE WORDS HE HAD ALREADY ASKED US TO REMOVE.** It is the second gate
   in one day to do that — CEO 174 caught the first, in `numbered_options_check`, asserting that
   the word "Approve" must never disappear. Both were written in good faith from his 10:22 AM
   instruction and both outlived it.

   ⚑ **THE LESSON, AND IT IS WHY THIS COMMENT IS LONG: A GATE PINS A DECISION HARDER THAN CODE
   DOES.** Wrong code gets changed by the next person who reads it; a wrong gate makes doing what
   he asked look like breaking the build, so the next session "fixes" his instruction back out
   again. When you gate a piece of his wording, gate the PROPERTY he wanted (every call is
   numbered; the stored key never moves) rather than the literal string — the string is the part
   he keeps changing, and he is entitled to.

   AND HIS 10:22 INSTRUCTION IS NOT DISCARDED, because it had two halves: *"Change the buttons…
   AND ALWAYS WHEN GIVING ME OPTIONS TO CHOOSE NUMBER OR LETTER THEM."* The second half is the one
   that survived and it is now the rule for every card. Cases 4, 5 and 6 below are untouched: the
   stored value must still never move, or every ruling on his live page comes un-pressed. */
const NUMBERED = /^\s*\d+\s/;

// 1/5 — THE FIRST BUTTON IS NUMBERED, and carries words that say what it does.
{
  if (ruleRow === null) fail("there is no ruling row on the page at all — the Your call card renders no buttons, so he cannot rule on anything");
  else if (labelFor("yes") === undefined) fail(`no button carries data-choice="yes" — the buttons found were ${JSON.stringify(buttons)}`);
  else if (/^(do it|approve)$/i.test(labelFor("yes"))) fail(`the first button reads "${labelFor("yes")}" — a bare verb with no number. His 15:56Z ruling: "Replace Approve and Deny with 1 2 3 Other."`);
  else if (!NUMBERED.test(labelFor("yes"))) fail(`the first button reads "${labelFor("yes")}" — it must open with its number so he can reply "1"`);
  else pass(`the first button is numbered ("${labelFor("yes")}")`);
}

// 2/5 — THE SECOND BUTTON IS NUMBERED TOO. Same ruling; see the note above case 1.
{
  if (labelFor("no") === undefined) fail(`no button carries data-choice="no" — the buttons found were ${JSON.stringify(buttons)}`);
  else if (/^(don.?t|deny)$/i.test(labelFor("no"))) fail(`the second button reads "${labelFor("no")}" — a bare verb with no number. His 15:56Z ruling replaced Approve/Deny with 1 2 3 Other.`);
  else if (!NUMBERED.test(labelFor("no"))) fail(`the second button reads "${labelFor("no")}" — it must open with its number so he can reply "2"`);
  else pass(`the second button is numbered ("${labelFor("no")}")`);
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
