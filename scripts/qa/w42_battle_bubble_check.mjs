/* W4-2 — A BATTLE'S NARRATION IS ABOUT TWO CAPTAINS, SO IT IS NOT ANCHORED TO ONE.
 * Wyatt: "Guest battle narration box is not centred." Narrowed by him 2026-08-27: his screenshot
 * shows the guest's tap-to-sail box correctly centred, so it is specific to the BATTLE box.
 *
 * MEASURED IN A REAL TWO-BROWSER CREW GAME (room NJCU) BEFORE CHANGING ANYTHING, and the
 * measurement corrects his premise in one way and sharpens it in another:
 *   - NOT guest-only. The battle RESULT bubble sat 44px right of centre on BOTH seats.
 *   - Within ONE battle, two lines were drawn two different ways:
 *       "Dough Hook attacks Flaky Jack!"  -> off 0   (centred)
 *       "Dough Hook wins 1–0…"           -> off 44  (anchored to a boat)
 *
 * WHY: a bubble with a SUBJECT anchors to that captain's boat and grows a tail — that is the design
 * and it is right for "Flaky Jack takes the wheel". `panel.js` sets the subject from the event as
 * `e.p ?? e.a ?? null`, and a battle event is `{t:"battle", a:attacker, d:defender}`, so the result
 * anchored to the ATTACKER. The opening line is emitted directly by the orchestrator with no
 * subject, hence centred. Two halves of one beat, two placements.
 *
 * THE RULE, DERIVED FROM THE EVENT'S OWN SHAPE rather than a typed list of event names: an event
 * that names TWO captains is not about one of them. It gets no subject, so its bubble is ambient
 * and centred — which is also what the codebase already says out loud about fights, in the camera
 * hold: "the director should focus battles on the players fighting, not the player calling the
 * battle."
 *
 * WHAT THIS MUST NOT BREAK: boat-anchoring for ordinary single-captain lines. That is the design,
 * not a bug, and a gate that only checked "battles are centred" would happily pass a tree where
 * NOTHING anchors any more.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const panel = strip(fs.readFileSync(path.join(REPO, "src/ui/panel.js"), "utf8"));
const stage = strip(fs.readFileSync(path.join(REPO, "src/ui/stage.js"), "utf8"));

/* (1) THE SUBJECT IS WITHHELD WHEN AN EVENT NAMES TWO CAPTAINS. Read the assignment itself. */
{
  /* READ THE WHOLE BLOCK, NOT ONE LINE. The first version captured only the text after
     `__pp4.subject =` up to the semicolon, and went red on a CORRECT tree the moment the two-captain
     test was hoisted to its own `const` on the line above — the logic spans two lines, the
     assertion read one. An assertion that fails a safe refactor teaches sessions to loosen it. */
  const blk = panel.match(/if\s*\(\s*window\.__pp4\s*\)\s*\{[\s\S]*?\n  \}/);
  const m = blk ? [blk[0], (blk[0].match(/__pp4\.subject\s*=\s*([^;]+);/) || [, blk[0]])[1]] : null;
  if (!m) fail("could not find where the narration subject is set in panel.js — re-anchor this assertion, do not delete it");
  else {
    const expr = m[1];
    const block = m[0];
    /* it must consult the DEFENDER — the only way to know two captains are named — and yield null
       when one is present. Checked by shape, so renaming the event type cannot defeat it. */
    const consultsBoth = /\be\.d\b/.test(block) && /null/.test(block);
    if (consultsBoth)
      pass(`the narration subject is withheld when an event names two captains — it consults the defender, so a fight is not anchored to one fighter (${expr.replace(/\s+/g, " ").slice(0, 96)})`);
    else
      fail(`the narration subject is still \`${expr.replace(/\s+/g, " ").slice(0, 72)}\` — it never looks at the defender, so a battle event {t:"battle",a,d} anchors its result bubble to the ATTACKER. Measured in a real crew game: the result sat 44px off centre on BOTH seats while the opening line of the same battle sat centred`);
  }
}

/* (2) AND ORDINARY LINES STILL ANCHOR. Without this, "make battles centred" passes on a tree where
   every bubble is ambient and the tail/boat design is gone. */
{
  /* BOTH ENDS, because either alone is defeatable. Red-proofing found it: setting the subject to a
     bare `null` strips anchoring from EVERY line, and a check that only looks at stage.js's
     machinery still passes — the machinery is intact, nothing feeds it. So stage.js must still be
     able to anchor AND panel.js must still supply a subject for a single-captain event. */
  const drawsAnchored = /subj\s*==\s*null\s*\?\s*" ambient"/.test(stage) && /boatUXY\(subj\)/.test(stage);
  const blk2 = (panel.match(/if\s*\(\s*window\.__pp4\s*\)\s*\{[\s\S]*?\n  \}/) || [""])[0];
  const stillSupplies = /e\.p\s*!=\s*null/.test(blk2) && /e\.a\s*!=\s*null/.test(blk2);
  const anchors = drawsAnchored && stillSupplies;
  if (anchors) pass("a single-captain line still anchors to that captain's boat and grows a tail — stage.js can draw it AND panel.js still supplies the seat, so the design is intact and only fights are exempt");
  else fail(`bubbles no longer anchor to a boat at all (stage can draw anchored:${drawsAnchored} panel still supplies a seat:${stillSupplies})`.slice(0,0) + "bubbles no longer anchor to a boat at all — that is the design for single-captain lines (\"Flaky Jack takes the wheel\"), not a bug, and this item did not ask for it to go");
}

/* (3) THE TWO HALVES OF ONE BATTLE ARE DRAWN THE SAME WAY (rule 8). The opening line is emitted
   with no subject; the result must match it. If the opening ever gains one, this fails too — the
   assertion is about them AGREEING, not about either one's value. */
{
  const orch = strip(fs.readFileSync(path.join(REPO, "src/orchestrator.js"), "utf8"));
  const open = orch.match(/await flash\(`[^`]*attacks \$\{pn\(def\.idx\)\}[^`]*`[^;]*\)/);
  if (!open) fail("could not find the battle's opening narration in orchestrator.js — re-anchor this assertion");
  else if (/subject/.test(open[0]))
    fail("the battle's OPENING line now sets a subject while the result withholds one — the two halves of one fight are drawn two ways again, which is the fault this item is about");
  else
    pass("the battle's opening line and its result are both subject-less, so one fight is drawn one way (rule 8)");
}

console.log(fails ? `\nFAILED — ${fails} assertion(s)`
  : "\nPASSED — a fight's narration is centred on both seats, ordinary lines still anchor to their captain's boat, and both halves of a battle are drawn alike");
process.exit(fails ? 1 : 0);
