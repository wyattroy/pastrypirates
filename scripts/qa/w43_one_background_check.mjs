/* W4-3 — ONE BACKGROUND BEHIND THE STAGE. Wyatt: "The centre div has its own blue background,
 * layered on top of the page gradient under the board and the captains box. The gradient should
 * be the only background."
 *
 * MEASURED BEFORE CHANGING, in a browser, because the static read alone got it wrong twice:
 *   - `html` (index.html, inside @media min-width:601px) paints the DELIBERATE surround — five
 *     radial gradients whose colours were sampled from the board art itself. That is the "page
 *     gradient" he wants to see, and it is desktop/tablet only by design ("the phone's board fills
 *     the viewport, so there is no surround to paint").
 *   - `body.pp4Stage` painted a FLAT #3d7d99 GLOBALLY. body is max-width:430px and centred while
 *     the stage is up, so on a wide screen that flat colour covered the gradient in exactly the
 *     centre column — a visible flat band behind the board and the captains box, with the real
 *     gradient showing either side of it. Confirmed in a screenshot, not inferred.
 *   - On a PHONE the html gradient does not exist, so there the flat colour IS the only ground and
 *     must stay. That is why this is a scoping fix, not a deletion.
 *
 * THE RULE THIS ASSERTS: wherever the page paints its own surround (>=601px), the stage column
 * must not paint over it. A flat stage background may exist ONLY inside a phone-width media
 * query. Run RED against the global rule.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };

const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [, ""])[1];

/* Walk the stylesheet tracking @media context, and collect every rule whose selector mentions
   body.pp4Stage together with a background declaration. Comment-stripped first: the graveyard
   note explaining the removal names the old colour and must not read as the rule surviving. */
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const found = [];
/* A CHARACTER-ACCURATE CONTEXT WALK. The first version of this tracked @media by peeking at the
   text after a rule's closing brace, which mis-popped and reported a phone media context for a
   GLOBAL rule — so the gate PASSED against the very tree it was written to condemn. A gate that
   cannot fail is worse than no gate (CLAUDE.md), so this one pushes every block header onto a
   stack and pops on its own closing brace, which is the only way to know what a rule is nested in. */
{
  const stack = [];       // headers of every open block, in order
  let buf = "", i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if (ch === "{") {
      const head = buf.replace(/\s+/g, " ").trim();
      /* ONLY THE PAGE GROUND. `body.pp4Stage #someChild { background: ... }` paints a child
         element and is nobody's business here; what this gate is about is the rule that paints
         BODY ITSELF, because that is the box sitting between the board and the page's surround.
         Narrowed after the corrected scanner flagged four legitimate descendant rules alongside
         the one true finding — the finding survived the narrowing, which is how you tell a
         narrowing from a fudge. */
      if (/^body\.pp4Stage(\.[\w-]+)*$/.test(head)) {
        // capture this rule's declarations up to its matching close
        let d = 1, j = i + 1;
        for (; j < clean.length && d; j++) { if (clean[j] === "{") d++; else if (clean[j] === "}") d--; }
        const body = clean.slice(i + 1, j - 1);
        /* CLEARING IS NOT PAINTING. `background:none` is the fix, not the fault — the gate is
           about a ground that COVERS the page's surround, so a declaration resolving to none or
           transparent must pass. */
        if (/background(-color)?\s*:\s*(?!none|transparent)[^;]+/.test(body))
          found.push({ head, media: stack.filter(h => /^@media/.test(h)).join(" | "), body: body.replace(/\s+/g, " ").trim().slice(0, 80) });
      }
      stack.push(head); buf = ""; i++; continue;
    }
    if (ch === "}") { stack.pop(); buf = ""; i++; continue; }
    buf += ch; i++;
  }
}

if (!found.length) pass("no body.pp4Stage rule paints a background at all — the page's own surround is the only ground");
else for (const f of found) {
  const phoneOnly = /max-width\s*:\s*(\d+)px/.test(f.media) && Number(f.media.match(/max-width\s*:\s*(\d+)px/)[1]) <= 600;
  if (phoneOnly) pass(`the flat stage background is scoped to phone width (${f.media.trim().slice(0, 40)}) — where the page paints no surround of its own`);
  else fail(`body.pp4Stage paints a background outside a phone-width media query (context: ${f.media || "GLOBAL"}; ${f.body}) — on a wide screen that covers the html surround gradient in exactly the centre column, which is the flat band Wyatt reported`);
}

/* The surround itself must still exist — a "fix" that deleted the gradient would satisfy the
   assertion above and destroy the thing he wants to see. */
if (/background-color:#0c3442/.test(clean) && (clean.match(/radial-gradient\(ellipse/g) || []).length >= 4)
  pass("the page's own art-derived surround gradient is still there");
else fail("the html surround gradient is gone — that is the background he wants VISIBLE, not removed");

console.log(fails ? `\nFAILED — ${fails} assertion(s)` : "\nPASSED — one background behind the stage, and it is the page's own");
process.exit(fails ? 1 : 0);
