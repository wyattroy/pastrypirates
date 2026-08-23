// scripts/lib/pick_tree.js
//
// ONE SPELLING OF "WHICH TREE", READ IN ONE PLACE.
//
// ============================================================================
// Why this is a shared module and not a copied function
// ============================================================================
// The selector idiom was written first at the foot of scripts/host_guest_parity_check.js
// (02.15-01 / D-28). Phase 3 gives the same selector to six more gates. Six copies of a
// twelve-line function is precisely the shape CLAUDE.md rule 23 forbids: *what makes these
// agree?* — and if the honest answer is "nothing, we keep them in step", that is the defect,
// before a line is written. So there is ONE of it, and host_guest_parity_check.js was converged
// onto it rather than left running beside it.
//
// ============================================================================
// The contract every caller depends on
// ============================================================================
//   node scripts/<gate>.js               -> the ROOT tree. BYTE-FOR-BYTE the behaviour these
//                                           gates had before Phase 3. The root game still has a
//                                           suite and this must never quietly change.
//   node scripts/<gate>.js --tree=4      -> 4/, the game actually being developed.
//   node scripts/<gate>.js --tree=root   -> the root tree, said out loud.
//   node scripts/<gate>.js --tree=<path> -> an arbitrary root. This is what a red-proof uses when
//                                           it needs a synthetic tree under os.tmpdir().
//
// `--tree` with no value means `4` — the same shorthand the parity gate has accepted since D-28.
//
// ============================================================================
// EVERY CALLER MUST PRINT `label` AS ITS FIRST LINE OF OUTPUT
// ============================================================================
// docs/HARD-WON-LESSONS.md §3: *"a gate scanning the wrong tree is not silent, it is
// reassuring."* A run that does not say which game it read is the entire fault Phase 3 exists to
// close, and the cheapest possible protection against it is one line of output. `treeLine()`
// below is that line; do not hand-format it at each call site.
//
// ROOT-ONLY BY DESIGN — no `4/scripts/lib/` twin, and there must never be one.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Marker token above is read by 4/scripts/lib_twin_check.js. Its sibling tools in this directory
// (load_engine.js, tiny_dom.mjs, js_region_tokenizer.js, audit_page_headless.mjs) are byte-
// identical to their 4/scripts/lib/ copies BECAUSE they resolve everything tree-relatively — the
// 4/ copy of load_engine.js loads the 4/ engine for exactly that reason. This file is the
// opposite: it computes the repo root from its OWN location, so a copy sitting in 4/scripts/lib/
// would resolve `--tree=4` to `4/4/` and scan nothing at all — silently, and green.

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// scripts/lib/ -> scripts/ -> the repo root.
export const REPO_ROOT = path.join(__dirname, "..", "..");

const ROOT_LABEL = "root (the OLD game — not the tree under development)";
const FOUR_LABEL = "4/ (the game actually being developed)";

export function pickTree(argv) {
  const arg = argv.find((a) => a.startsWith("--tree"));
  if (!arg) return { root: REPO_ROOT, label: ROOT_LABEL, isFour: false, name: "root" };
  const v = arg.includes("=") ? arg.split("=").slice(1).join("=") : "4";
  if (v === "root") return { root: REPO_ROOT, label: ROOT_LABEL, isFour: false, name: "root" };
  if (v === "4") return { root: path.join(REPO_ROOT, "4"), label: FOUR_LABEL, isFour: true, name: "4" };
  const abs = path.resolve(v);
  return { root: abs, label: abs, isFour: false, name: abs };
}

// The mandatory first line of every gate's output. Takes the count of things actually scanned,
// because a count is falsifiable and a bare "OK" is not (HARD-WON-LESSONS §1b: seat_arg_check.js
// prints the 161 call sites it read, so a green run over an empty set cannot hide).
export function treeLine(picked, scannedDescription) {
  return `tree: ${picked.label}${scannedDescription ? ` — ${scannedDescription}` : ""}`;
}
