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
/* THE BOARD'S OWN ANCESTORS — derived from the markup, so this list cannot rot when the layout
   moves. Anything that wraps #board is a box wide enough to cover the page's surround, which is
   what makes it a candidate "ground" (CEO Review 13). */
const BLEED = (() => {
  /* A REAL STACK WALK. The first version pushed every open tag and then sliced by the count of
     closers, which invented two elements that are not ancestors at all and MISSED #game, which is
     — so `body.pp4Stage #game { background: … }` sailed straight through the gate. Walk the tags
     in order, push on open, pop on close, and whatever is still on the stack when #board appears
     IS the ancestor chain. */
  const upto = html.slice(0, html.indexOf('id="board"'));
  const stack = [];
  for (const m of upto.matchAll(/<(\/?)(div|main|section|body)\b([^>]*)>/g)) {
    const [, slash, , attrs] = m;
    if (slash) stack.pop();
    else if (!/\/\s*$/.test(attrs)) stack.push(attrs);
  }
  const out = new Set();
  for (const attrs of stack) {
    const id = (attrs.match(/id="([^"]+)"/) || [])[1];
    if (id) out.add("#" + id);
  }
  return [...out];
})();

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
      /* WHAT COUNTS AS "THE GROUND", and this is wider than the one rule that was at fault.
         CEO Review 13 broke the first version three ways it did not notice — `html body.pp4Stage`,
         `body.pp4Stage #boardwrap` and `body.pp4Stage #game` each put the identical flat band back
         while the gate printed PASS. A fence around one selector, announcing the whole idea.
         So a rule is "the ground" if it paints EITHER:
           (a) body itself, however the selector reaches it (`body.pp4Stage`, `html body.pp4Stage`,
               `body.pp4Stage.foo`) — the last compound is body.pp4Stage and nothing follows it; or
           (b) any FULL-BLEED ANCESTOR OF THE BOARD. That list is DERIVED from the markup below,
               never typed: the elements that wrap #board are exactly the boxes big enough to cover
               the surround, so when the layout changes the list changes with it. */
      const lastCompound = head.split(",")[0].trim().split(/\s+|>/).filter(Boolean).pop() || "";
      const isBodyGround = /^body\.pp4Stage(\.[\w-]+)*$/.test(lastCompound);
      const isBleedGround = /body\.pp4Stage/.test(head) &&
        BLEED.some(sel => new RegExp(`(^|[\\s>])${sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([.:#\\s]|$)`).test(head));
      if (isBodyGround || isBleedGround) {
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

/* AND IT PAINTS AT EVERY WIDTH — Wyatt, 2026-08-28, with a screenshot: "i want the page's
   5-gradient background to show up behind it. On all screen widths, including phone." It used to
   live inside @media(min-width:601px), which is why the phone had a flat colour instead. A future
   edit that re-gates it would restore exactly the thing he asked to be rid of, so the gate holds
   the ruling rather than trusting the comment. Walked with the same brace stack the rules use. */
{
  let inMedia = null, depth = 0, buf = "", i = 0;
  const stack = [];
  while (i < clean.length) {
    const ch = clean[i];
    if (ch === "{") {
      const head = buf.replace(/\s+/g, " ").trim();
      if (/^html\b/.test(head)) {
        let d = 1, j = i + 1;
        for (; j < clean.length && d; j++) { if (clean[j] === "{") d++; else if (clean[j] === "}") d--; }
        if (/background-color:#0c3442/.test(clean.slice(i + 1, j - 1)))
          inMedia = stack.filter(h => /^@media/.test(h)).join(" | ");
      }
      stack.push(head); buf = ""; i++; continue;
    }
    if (ch === "}") { stack.pop(); buf = ""; i++; continue; }
    buf += ch; i++;
  }
  if (inMedia === null) fail("could not locate the html surround rule — re-anchor this assertion, do not delete it");
  else if (inMedia === "") pass("the surround paints at EVERY width, phone included — his 2026-08-28 ruling");
  else fail(`the surround is gated behind ${inMedia} — Wyatt asked for it "on all screen widths, including phone"`);
}

/* THE TOP BAR IS NOT A GROUND EITHER. Wyatt, 2026-08-28, with the bar circled in red on a
   screenshot: "remove this gradient from the top bar too… i want the page's 5-gradient background
   to show up behind it. On all screen widths, including phone."
   THE BAR IS FOUND BY SHAPE, NEVER BY ID — a rule that pins an element to all of top/left/right at
   position:fixed IS the full-width top bar, whatever it gets called next year. That also scopes the
   assertion correctly for free: the bar's CHILDREN (the ☰ chip, the wind pill) are chips he did not
   circle, they are not full-bleed, and so they fall outside by construction rather than by a typed
   exception somebody has to remember. */
{
  /* Every rule in the sheet with its @media context — a self-contained walk, so this section can
     be read and trusted on its own. */
  const RULES = [];
  { const stack = []; let buf = "", i = 0;
    while (i < clean.length) {
      const ch = clean[i];
      if (ch === "{") {
        const head = buf.replace(/\s+/g, " ").trim();
        let d = 1, j = i + 1;
        for (; j < clean.length && d; j++) { if (clean[j] === "{") d++; else if (clean[j] === "}") d--; }
        RULES.push({ head, body: clean.slice(i + 1, j - 1), media: stack.filter(h => /^@media/.test(h)).join(" | ") });
        stack.push(head); buf = ""; i++; continue;
      }
      if (ch === "}") { stack.pop(); buf = ""; i++; continue; }
      buf += ch; i++;
    } }
  const last = h => h.split(",")[0].trim().split(/[\s>]+/).filter(Boolean).pop() || "";
  const pinned = b => /position\s*:\s*fixed/.test(b) &&
    ["top", "left", "right"].every(k => new RegExp(`(^|;)\\s*${k}\\s*:\\s*0`).test(b));
  const BARS = [...new Set(RULES.filter(r => pinned(r.body)).map(r => last(r.head)).filter(Boolean))];
  if (!BARS.length)
    fail("no full-width fixed top bar found in the sheet — re-anchor this assertion, do not delete it");
  const paints = RULES.filter(r => BARS.includes(last(r.head)) &&
    /background(-image|-color)?\s*:\s*(?!none|transparent)[^;]+/.test(r.body));
  if (BARS.length && !paints.length)
    pass(`the top bar (${BARS.join(", ")}) paints nothing of its own — the page's 5-gradient ground shows through it at every width`);
  for (const p of paints)
    fail(`${last(p.head)} paints its own background (${((p.body.match(/background[^;]*/) || [])[0] || "").replace(/\s+/g, " ").slice(0, 58)}…)${p.media ? " in " + p.media : ""} — that is the slab over the page surround Wyatt circled in red on 2026-08-28`);
}

console.log(fails ? `\nFAILED — ${fails} assertion(s)`
  : `\nPASSED — nothing paints over the page surround: body itself, nor any of the board's ${BLEED.length} wrapper(s) (${BLEED.join(", ") || "none"})`);
process.exit(fails ? 1 : 0);
