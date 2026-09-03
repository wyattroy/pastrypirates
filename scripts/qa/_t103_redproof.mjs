#!/usr/bin/env node
/* SCRATCH — watch 2026-09-03T01:10Z, T-103. NOT A GATE, not in npm test, safe to delete.
 *
 * Step 1 of the four steps: SHOW IT BROKEN. It restores glass.mjs and chartkeeper.mjs to their
 * committed state, runs do_now_check.mjs, prints what that check says about a tree with no drag in
 * it, and puts both files back — in a finally block, so an exception cannot leave the tree holding
 * yesterday's code. Two other sessions may be on this branch, so the window is kept to one run.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FILES = ["scripts/wyclau/glass.mjs", "scripts/wyclau/chartkeeper.mjs"];
const mine = FILES.map((f) => readFileSync(join(ROOT, f), "utf8"));

const head = FILES.map((f) =>
  execFileSync("git", ["show", `HEAD:${f}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 }));

try {
  FILES.forEach((f, i) => writeFileSync(join(ROOT, f), head[i]));
  let out = "";
  try {
    out = execFileSync(process.execPath, [join(ROOT, "scripts", "qa", "do_now_check.mjs")],
      { cwd: ROOT, encoding: "utf8" });
    console.log("!! the gate PASSED against the committed tree — the new cases cannot fail, which");
    console.log("!! means they are not measuring the drag at all. Read them again before believing them.");
  } catch (e) {
    out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
  }
  console.log(out);
} finally {
  FILES.forEach((f, i) => writeFileSync(join(ROOT, f), mine[i]));
  console.log("restored: both files are back to this watch's versions.");
}
