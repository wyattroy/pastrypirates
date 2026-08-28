/* W4-4 — THE CAPTAINS BOX AND THE BOARD SHARE ONE WIDTH. Wyatt, from his playtest list:
 * "At tablet width the captains box is narrower than the board, leaving a ~10px dead strip."
 *
 * MEASURED IN A BROWSER BEFORE ANY CHANGE, at three sizes, because the number in the backlog was
 * an estimate and the real one is bigger:
 *   tablet 768x954 — board 756 wide, panel 726: inset 14px on EACH side, 28px total.
 *   desktop 1200   — board 225..975, panel 239..961: the same 14px each side.
 *   phone  390x844 — board 0..390, panel 0..390: EXACTLY FLUSH. The fault does not exist there.
 *
 * THE CAUSE IS ONE VARIABLE DOING TWO UNRELATED JOBS. `--pp4CapGap` is declared in index.html as
 * "the gap between board and captains column" — a SEPARATION, for the side-by-side layout, and it
 * is read by computeStageGeometry() as such. The stacked rule at >=601px then reuses the same
 * number as a left/right INSET:  left: var(--pp4CapGap); right: var(--pp4CapGap).
 * A separation and an inset are different quantities that happened to want the same value once.
 * The phone escapes only because that rule is gated behind the media query.
 *
 * WHAT THIS ASSERTS, and why it is not just "left must be 0": the stacked captains panel must not
 * inset itself from its own containing block AT ALL, because that block is the board's box — so
 * any non-zero left/right is by definition the panel disagreeing with the board about how wide the
 * stage is. Stated that way it survives the value 14 changing, and it survives the variable being
 * renamed.
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
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

/* Every rule with its @media context — same brace walk the other gates use, kept local so this
   file can be read on its own. */
const RULES = [];
{
  const stack = []; let buf = "", i = 0;
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
  }
}

/* THE PANEL IS FOUND BY ROLE, NOT BY ID — the rule that positions the stage's captains panel while
   it is STACKED under the board (i.e. explicitly not the side-by-side column). If the element is
   renamed the selector below still finds it, and if nothing matches the gate says so loudly rather
   than passing on an empty set. */
const stacked = RULES.filter(r => /pp4Stage/.test(r.head) && /:not\(\.pp4Side\)/.test(r.head) &&
                                  /#pp4Cap|captains/i.test(r.head));
if (!stacked.length) {
  fail("could not find the rule that positions the stacked captains panel — re-anchor this assertion, do not delete it");
} else {
  for (const r of stacked) {
    const decl = k => {
      const m = r.body.match(new RegExp(`(?:^|;)\\s*${k}\\s*:\\s*([^;]+)`));
      return m ? m[1].trim() : null;
    };
    const bad = [];
    for (const side of ["left", "right"]) {
      const v = decl(side);
      /* auto / 0 / 0px / unset are all "do not inset". Anything else — a length, a var(), a calc()
         — pushes the panel inside the board's box. */
      if (v !== null && !/^(0(px|%)?|auto|unset|initial)$/.test(v)) bad.push(`${side}: ${v}`);
    }
    if (bad.length)
      fail(`the stacked captains panel insets itself from the board's box (${r.head} { ${bad.join("; ")} }${r.media ? " in " + r.media : ""}) — that is the dead strip either side of the box Wyatt reported; measured at 14px per side, 28px total, at tablet and desktop`);
    else
      pass(`the stacked captains panel does not inset itself — it fills the same box as the board (${r.head}${r.media ? ", " + r.media : ""})`);
  }
}

/* THE GAP VARIABLE MUST STILL MEAN ONE THING. --pp4CapGap is the SEPARATION between the board and
   the captains column in the side-by-side layout, and computeStageGeometry() reads it as that. A
   future edit that puts it back into a left/right inset would recreate this exact fault under a
   different number, so the gate holds the meaning rather than the value. */
{
  /* STRIP `:not(...)` BEFORE ASKING WHETHER THIS IS THE SIDE LAYOUT. The first version of this
     tested for ".pp4Side" anywhere in the selector — and `body.pp4Stage:not(.pp4Side) #pp4Cap`
     CONTAINS that string, inside the negation. So the one rule at fault was excluded from the very
     check written to catch it, and this assertion printed PASS against the broken tree. A gate that
     cannot fail is worse than no gate; caught by running it RED and reading which lines passed. */
  const positive = head => head.replace(/:not\([^)]*\)/g, "");
  const misuse = RULES.filter(r => /#pp4Cap/.test(r.head) && !/\.pp4Side/.test(positive(r.head)) &&
    /(?:^|;)\s*(?:left|right)\s*:\s*[^;]*--pp4CapGap/.test(r.body));
  if (!misuse.length) pass("--pp4CapGap is used as a separation, never as a left/right inset on the stacked panel");
  else for (const m of misuse)
    fail(`--pp4CapGap is being used as a horizontal INSET in ${m.head} — it means "the gap between board and captains column", a separation, and reusing it here is what made the panel narrower than the board`);
}

/* And the side-by-side column must keep using it, or the "fix" has deleted a real gap. */
{
  const sideUse = RULES.some(r => /\.pp4Side/.test(r.head) && /--pp4CapGap/.test(r.body));
  if (sideUse) pass("the side-by-side column still reads --pp4CapGap for its real job — the gap between board and column");
  else fail("nothing reads --pp4CapGap as a separation any more — the side-by-side gap has been deleted, which is not what this item asked for");
}

/* AND THE ROWS MUST FILL THE BOX — the second half of what Wyatt reported, and it is a SECOND
   fault with a second cause. His words: the captain rows end short of the panel's own right edge.
   MEASURED at tablet 768x954, with the panel already widened by the fix above:
     --boardW              = 632px   (the CLASSIC layout's board width)
     #pp4Cap               = 7..761  (754 wide — the STAGE board's width)
     #captainsPanel.panel  = 19..651 (632 wide, max-width 632px)   <- capped by --boardW
     #players / .player-row= 606 wide
   So 111px of the box sat empty to the right of every row. The shared classic rule
   `#controlsRow, #actionPanel, #captainsPanel, … { max-width: var(--boardW) }` still governs a
   panel that has been RE-PARENTED into a stage container whose width is computed differently.
   FIXING ONLY THE BOX WOULD HAVE MADE THIS WORSE, and did in measurement — widening the box grew
   the empty strip from 84px to 111px. Both halves ship together or neither does.
   Scoped deliberately to the captains box: the same cap also sizes the recipe card, and widening
   THAT is a taste decision Wyatt has not made (parked as a question), not a bug he reported. */
{
  /* #pp4Cap MUST BE AN ANCESTOR HERE, NOT THE TARGET — and this is the THIRD time in one session
     that an assertion in this repo passed by matching something adjacent to its subject. The first
     version accepted `body.pp4Stage.pp4Side #pp4Col > #pp4Cap { max-width:none }`, which clears the
     cap on the SIDE layout's own box and says nothing whatever about the panel INSIDE the stacked
     one. It printed PASS against the tree it was written to condemn. So: strip :not(...), split the
     selector into compounds, and require #pp4Cap to appear somewhere BEFORE the last one. */
  const compounds = head => head.replace(/:not\([^)]*\)/g, "").split(/[\s>+~]+/).filter(Boolean);
  const cleared = RULES.filter(r => {
    if (!/pp4Stage/.test(r.head)) return false;
    if (!/(?:^|;)\s*max-width\s*:\s*none/.test(r.body)) return false;
    const c = compounds(r.head.split(",")[0]);
    const at = c.findIndex(x => x.includes("#pp4Cap"));
    return at >= 0 && at < c.length - 1;          // #pp4Cap is an ancestor of the thing being sized
  });
  if (cleared.length)
    pass(`the classic --boardW cap is cleared inside the stage captains box, so its rows fill it (${cleared[0].head})`);
  else
    fail("nothing clears the classic `max-width: var(--boardW)` cap inside the stage captains box — the rows stay at the OLD layout's board width while the box is at the new one, leaving an empty strip to their right that the width fix above makes wider, not narrower");
}

console.log(fails ? `\nFAILED — ${fails} assertion(s)`
  : `\nPASSED — the captains box and the board agree on one width, and the gap variable means one thing`);
process.exit(fails ? 1 : 0);
