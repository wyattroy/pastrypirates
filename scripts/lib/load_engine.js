// scripts/lib/load_engine.js
//
// Single indirection seam for obtaining the real `Game`/`roundCfg` engine out of index.html.
// Phase 7: performs the same vm + string-slice extraction the two existing harnesses
// (real_game_test.js, dlog_replay_test.js) each did independently. Phase 8 replaces the body of
// loadEngine() with a native `import` of the relocated engine module — every caller keeps
// calling this the same (already-async) way, so Phase 8's diff stays contained to this one file
// (D-12).
//
// Loud-failure-on-drift convention preserved verbatim from the harnesses this consolidates: a
// harness that silently passes because its slice boundaries moved is worse than no harness.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadEngine() {
  const html = fs.readFileSync(path.join(__dirname, "..", "..", "index.html"), "utf8");
  const scriptStart = html.indexOf("<script>") + "<script>".length;
  // roundCfg() sits just past the "UI" marker (before any real UI/DOM code) — extend the cut to
  // its end so both Game and roundCfg (a hoisted function declaration, so order doesn't matter to
  // JS, but the slice still has to physically include its source) are in the extracted region.
  const scriptEnd = html.indexOf("function escHtml");
  if (scriptStart < 8 || scriptEnd === -1) {
    throw new Error("Could not locate the Game-class/roundCfg region in index.html — has the file structure changed?");
  }
  const region = html.slice(scriptStart, scriptEnd);
  // D-11: hash the raw extracted region BEFORE the export suffix is concatenated, so the hash
  // describes index.html's own content, not this file's own scaffolding.
  const sourceHash = crypto.createHash("sha256").update(region).digest("hex");
  // `class`/`const` top-level declarations don't attach to the vm context object the way `var`/
  // `function` do — export the two we need explicitly so they're retrievable after execution.
  const engineSrc = region + "\nthis.Game=Game;this.roundCfg=roundCfg;\n";

  const sandbox = {
    // `document.body.innerHTML = emojify(...)` runs at boot inside the extracted region (the
    // emoji→<img> swap), so the stub needs a writable body as well as the documentElement style
    // setter.
    document: { documentElement: { style: { setProperty() {} } }, body: { innerHTML: "" } },
    console,
    Math, Array, Object, Set, Map, JSON, Date, String, Number, Boolean,
  };
  vm.createContext(sandbox);
  vm.runInContext(engineSrc, sandbox, { filename: "index.html (engine region)" });

  const { Game, roundCfg } = sandbox;
  if (typeof Game !== "function" || typeof roundCfg !== "function") {
    throw new Error("Game/roundCfg didn't come out of the extracted region — extraction boundaries may be wrong.");
  }

  return { Game, roundCfg, sourceHash };
}
