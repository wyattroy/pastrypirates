#!/usr/bin/env node
/* Red-proof for parked-work-is-mine.cjs — run: node .claude/hooks/parked-work-is-mine.test.cjs
   The cases are the REAL lines from 2026-09-10, not invented ones: a hook written after a failure
   should fire on that failure's own text or it has not been tested against anything. */
"use strict";
const { findings } = require("./parked-work-is-mine.cjs");
let fails = 0;
const t = (name, lines, want) => {
  const got = findings(lines).length > 0;
  const ok = got === want;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — fired=${got}, want=${want}`}`);
  if (!ok) fails++;
};

console.log("parked-work-is-mine — does it catch the day it was written for?");

// THE ACTUAL PROSE I FILED THAT DAY, both items, verbatim in shape
t("prose: 'NOT ACTED ON' + 'wants checking on a real screen'", [
  "## 1. \"you made the cards TOO big\" — NOT ACTED ON",
  "That is arithmetic off the stylesheet, not a measurement — it wants checking on a real screen",
  "before anyone acts on it.",
], true);

t("prose: 'Measure the icon inset ... first, then derive'", [
  "**Why this is not just \"use a smaller number\":** matching at every width means the picture has",
  "to track the grid's own centring. **Measure the icon inset across the desktop range first, then",
  "derive.**",
], true);

// a parked item that really is his
t("[?] a genuine taste call stays quiet", [
  "- [?] Is 365x353 still too big for his eye? measured at six widths, nothing protrudes",
], false);

// the same item, but asking for a measurement -> mine
t("[?] that asks for a measurement fires", [
  "- [?] the image inset — measure it across the desktop range, then derive",
], true);

t("[?] measurable but honestly excused stays quiet", [
  "- [?] the image inset — measure across the range. CANNOT MEASURE: his laptop is dying, 2026-09-10",
], true === false ? true : false);

// results, not to-dos
t("a RESULT in past tense does not fire", [
  "## Done: the inset was measured at 24 / 26 / 29 and now tracks the icons within 1px",
], false);

t("prose undone, but a live-list item WAS added -> the list can see it, stay quiet", [
  "## the alignment is not started yet",
  "- [ ] measure the icon inset across the desktop range, then derive",
], false);

t("ordinary backlog prose with no undone-claim stays quiet", [
  "The crate reference is 57x56 and lives in .planning/art-refs/.",
], false);

console.log(fails ? `\n${fails} failure(s).` : "\nAll checks passed.");
process.exit(fails ? 1 : 0);
