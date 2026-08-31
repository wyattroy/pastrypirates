#!/usr/bin/env node
// scripts/qa/glass_script_tag_purity_check.mjs
//
// THE GLASS'S REAL SCRIPT TAGS, AND ONLY THEM. Wyatt, 2026-08-31, reported the Glass "css breaks"
// right after he saved an idea through the Ideas box, and sent two screenshots. The second showed
// raw JS SOURCE CODE rendering as visible page text, in the exact spot the client's own script
// block should have been running silently. Root cause, measured: a comment inside that very script
// block read `// The state block is a JSON <script>, so it takes raw JSON text...` — a literal,
// unescaped, tag-shaped substring sitting inside the real script element's own text content. Once
// the client's self-publish path (buildDoc()) re-embeds the whole page as a string and republishes
// it, that stray substring survives the round-trip and something downstream mistook it for a
// second tag, corrupting the render.
//
// THE INVARIANT THIS GUARDS: outside the two real, deliberately-placed script elements (the JSON
// state block and the client behaviour block), the generated page must contain ZERO characters
// that look like a script tag -- no "<script" and no "</script" anywhere else, comments included.
// A fix that removes today's one bad comment but leaves the door open for tomorrow's is not a fix.
//
// ⚠ THIS CHECKS THE REAL GENERATED OUTPUT, NEVER A COPY (HARD-WON-LESSONS §12i): it runs
// scripts/wyclau/glass.mjs exactly as the Bosun does, in a throwaway working directory, and reads
// the glass.html it actually writes -- not a re-typed excerpt of the template.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const GLASS_MJS = join(REPO_ROOT, "scripts", "wyclau", "glass.mjs");
// glass.mjs resolves its own paths from ITS OWN file location, not CLAUDE_PROJECT_DIR -- it always
// writes the real repo's .planning/wyclau/glass.html (local, gitignored). Every other Glass gate in
// this suite already accepts that side effect; this one reads the same real file, never a copy.
const OUT = join(REPO_ROOT, ".planning", "wyclau", "glass.html");

function generate() {
  execFileSync("node", [GLASS_MJS, "--note", "script tag purity check"], { cwd: REPO_ROOT });
  return readFileSync(OUT, "utf8");
}

// ⚠ THE BUG THIS GATE ITSELF HAD, red-proofed into existence and fixed before trusting this file:
// an earlier version stripped each script block's ENTIRE span (open tag through its own close) and
// then checked what was OUTSIDE both spans -- which throws away the exact place the real defect
// lives (a stray tag-shaped substring INSIDE a script's own running text) before ever looking at
// it. Planting the real bug back and running this file's own logic against it still PASSED, which
// is what caught the mistake. The fix: extract each block's INNER content (between its tags, not
// including them) and check THAT for any extra "<script"/"</script" occurrence -- the boundary
// tags are expected and excluded; anything else inside is the failure mode.
function checkBlockInterior(html, label, openTag, findClose) {
  const failures = [];
  const openIdx = html.indexOf(openTag);
  if (openIdx === -1) { failures.push(`${label}: could not find its opening tag at all`); return failures; }
  const contentStart = openIdx + openTag.length;
  const closeIdx = findClose(html, contentStart);
  if (closeIdx === -1) { failures.push(`${label}: opening tag has no closing </script> after it`); return failures; }
  const interior = html.slice(contentStart, closeIdx);
  const stray = interior.match(/<\/?script/gi) || [];
  if (stray.length > 0) {
    failures.push(`${label}: ${stray.length} stray script-tag-shaped substring(s) inside its OWN content: ${JSON.stringify(stray)}`);
  }
  return failures;
}

const html = generate();
const failures = [
  ...checkBlockInterior(html, "state script block", '<script type="application/json" id="glassState">', (h, from) => h.indexOf("</script>", from)),
  // The client block is the LAST script tag in the fragment, so its close is the document's last
  // </script> -- found from the end, not from the first occurrence after its own open tag (which
  // would find the wrong, nearer one whenever a stray "</script"-shaped substring sits inside it).
  ...checkBlockInterior(html, "client script block", "<script>", (h) => h.lastIndexOf("</script>")),
];

if (failures.length) {
  console.error("FAIL — glass script tag purity");
  for (const f of failures) console.error(`  - ${f}`);
  console.error("\nA stray \"<script\" or \"</script\" substring anywhere outside the two real script");
  console.error("elements can corrupt the page after a self-publish round-trip. Say \"script element\"");
  console.error("or \"script tag\" in prose instead of the bracketed form.");
  process.exit(1);
}

console.log("PASS — no script-tag-shaped substrings found outside the two real script elements");
process.exit(0);
