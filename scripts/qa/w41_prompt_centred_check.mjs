/* W4-1 — THE PROMPT CARD IS CENTRED, IN EVERY MODE. Wyatt: "Choose yer recipe card is not
 * horizontally centred. Seen in pass-and-play." And the standing instruction on it: "Don't apply
 * this fix only for pass-and-play, it should apply to all games architecturally."
 *
 * MEASURED BEFORE CHANGING (Chromium, solo at 1200x950): the two recipe cards are perfectly
 * centred INSIDE their own row, and the row is centred inside #actionPanel — so nothing is wrong
 * with the cards. #actionPanel itself is what sits off-centre: capped at max-width 628px inside a
 * much wider column, its group centre landed 53px left of the board's centre at 1200px and 17px
 * left on a 390px phone. Seen in a screenshot too: the cream panel's right edge stops ~105px short
 * of the board's while its left edge matches — the signature of a capped box that is not centred.
 *
 * THE CAUSE, and it is one line, not a mode: `#actionPanel` carries `margin: 0 auto` in its base
 * rule, and TWO later rules replace it with `margin:0` — `#pp4Prompt #actionPanel` and
 * `body.pp4Stage #actionPanel`. The second applies in every mode, which is exactly why this is
 * architectural rather than a pass-and-play quirk. The centre-stage variant escapes it only
 * because `#pp4Prompt.pp4Center` is a flex container with justify-content:center — so the ordinary
 * prompt, which is most of the game, is the one left aligned.
 *
 * THE RULE: no rule may strip #actionPanel's horizontal auto-margins unless it is inside a
 * container that centres it some other way. Run RED against the margin:0 pair.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };

const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8");
const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [, ""])[1].replace(/\/\*[\s\S]*?\*\//g, "");

/* every rule that targets #actionPanel and sets a horizontal margin */
const offenders = [], centred = [];
{
  const stack = [];
  let buf = "", i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "{") {
      const head = buf.replace(/\s+/g, " ").trim();
      let d = 1, j = i + 1;
      for (; j < css.length && d; j++) { if (css[j] === "{") d++; else if (css[j] === "}") d--; }
      const body = css.slice(i + 1, j - 1);
      if (/#actionPanel\s*$/.test(head.split(",")[0].trim()) || /#actionPanel[^ ]*\s*$/.test(head)) {
        const m = body.match(/(?:^|;)\s*margin\s*:\s*([^;]+)/);
        if (m) {
          const parts = m[1].trim().split(/\s+/);
          // horizontal margin is parts[1] for 2-value, parts[1]/parts[3] for 4-value, parts[0] for 1
          const horiz = parts.length === 1 ? parts[0] : parts.length === 4 ? parts[3] : parts[1];
          (horiz === "auto" ? centred : offenders).push({ head, margin: m[1].trim(), body });
        }
      }
      stack.push(head); buf = ""; i++; continue;
    }
    if (ch === "}") { stack.pop(); buf = ""; i++; continue; }
    buf += ch; i++;
  }
}

/* A rule may legitimately strip the margin if its own container centres the panel by flex —
   `#pp4Prompt.pp4Center` does exactly that, and its card really is centred on screen. */
const flexCentred = sel => {
  const anc = sel.split("#actionPanel")[0].trim();
  if (!anc) return false;
  const re = new RegExp(anc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{[^}]*justify-content\\s*:\\s*center");
  return re.test(css);
};

/* A SECOND LEGITIMATE EXEMPTION, derived from the rule's own body rather than its name: a rule
   that also strips background AND padding is not styling a card at all — it is turning the panel
   into invisible scaffolding (the radial prompt does this, and its buttons are fixed-position in
   an arc). There is no visible box there to centre. Stated as UNMEASURED: the radial arc geometry
   was not re-measured under a centred panel, so this is reasoning, not evidence. If the arc ever
   drifts, this exemption is the first thing to suspect. */
const nonVisual = body => /background\s*:\s*none/.test(body) && /padding\s*:\s*0/.test(body);
const real = offenders.filter(o => !flexCentred(o.head) && !nonVisual(o.body || ""));
if (!real.length) pass(`no rule strips #actionPanel's centring (${offenders.length} margin-0 rule(s), all inside a flex-centred container)`);
else for (const o of real)
  fail(`"${o.head}" sets margin:${o.margin} on #actionPanel and its container does not centre it — the panel is capped at 628px, so it sits LEFT in that state (Wyatt's W4-1)`);

if (centred.length) pass(`${centred.length} rule(s) keep the auto horizontal margin`);
else fail("nothing gives #actionPanel an auto horizontal margin at all — it can only ever be left-aligned");

console.log(fails ? `\nFAILED — ${fails} assertion(s)` : "\nPASSED — the prompt card is centred in every mode, not just the stage");
process.exit(fails ? 1 : 0);
