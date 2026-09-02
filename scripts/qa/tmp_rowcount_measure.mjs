// throwaway (posed pair, in text): the SAME live CHART.md through the OLD generator and the NEW
// one. A screenshot pair taken minutes apart is confounded here — a peer session committed a new
// Chart row between the two shots — so the honest A/B renders both from one file, right now.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = process.argv[2] || "8838d73d"; // the commit before this watch touched anything
const chart = readFileSync(".planning/CHART.md", "utf8");

function render(ref) {
  const dir = mkdtempSync(join(tmpdir(), "glass-ab-"));
  mkdirSync(join(dir, "scripts", "wyclau", "lib"), { recursive: true });
  mkdirSync(join(dir, ".planning", "wyclau"), { recursive: true });
  const at = (p) => ref === null
    ? readFileSync(p)
    : execFileSync("git", ["show", `${ref}:${p}`], { maxBuffer: 1 << 24 });
  writeFileSync(join(dir, "scripts", "wyclau", "glass.mjs"), at("scripts/wyclau/glass.mjs"));
  writeFileSync(join(dir, "scripts", "wyclau", "lib", "chart_model.mjs"), at("scripts/wyclau/lib/chart_model.mjs"));
  writeFileSync(join(dir, ".planning", "CHART.md"), chart);
  execFileSync(process.execPath, [join(dir, "scripts", "wyclau", "glass.mjs"), "--note", "A/B"], { stdio: "pipe" });
  const html = readFileSync(join(dir, ".planning", "wyclau", "glass.html"), "utf8");
  const ol = (/<ol>[\s\S]*?<\/ol>/.exec(html) || [""])[0];
  return [...ol.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
}

const before = render(base), after = render(null);
console.log(`rows: before ${before.length}, after ${after.length}\n`);
let changed = 0;
for (let i = 0; i < Math.min(before.length, after.length); i++) {
  if (before[i] === after[i]) continue;
  changed++;
  if (changed <= 8) console.log(`${i + 1}.\n  BEFORE  ${before[i]}\n  AFTER   ${after[i]}\n`);
}
console.log(`${changed} of ${before.length} rows read differently.`);
