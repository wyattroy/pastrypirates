// src/main.js
//
// Module entry point (D-13, D-14). Phase 7 proved the zero-build
// module-loading contract here; Phase 8 extends this same file to populate
// the window.PP bridge (D-14/D-15) and invert control so this module — not
// the classic script — triggers window.boot() after the bridge is ready.

import { MODULE_OK_FLAG } from "./module-contract.js";
import * as shared from "./shared/index.js";
import * as engine from "./engine/index.js";

// D-15 (amended): the marker assignment must be guarded — `window` is
// undeclared under plain Node and a bare reference throws ReferenceError,
// which would break the Node-side half of Success Criterion 1. Indexing
// `window` with the imported flag (rather than a literal property name)
// makes the leaf import load-bearing: a silent resolution failure would
// leave the marker unset, not merely unused.
if (typeof window !== "undefined") {
  window[MODULE_OK_FLAG] = true;

  // D-17: standing tripwire for a classic-before-module load-order
  // regression in Phases 8-11. Scoped to the browser branch alongside the
  // `typeof window` guard — under Node there is no script ordering to
  // regress, so this has nothing to report there. `typeof` is used because
  // it is the one operator safe on an undeclared identifier; a truthiness
  // check on a bare `firebase` reference would throw under exactly the
  // conditions this tripwire exists to catch.
  if (typeof firebase === "undefined") {
    console.error(
      "[src/main.js] firebase global not found — classic script load order may be broken."
    );
  }

  // The bridge (D-14/D-15): named, documented, temporary — removed in
  // Phase 11 (ROADMAP Phase 11 criterion 3 greps for the token on each of
  // the two lines below). Publishes every shared/engine export as a
  // global-object property so the ~150+ pre-existing bare-identifier call
  // sites in the classic region resolve with zero edits (D-15's
  // minimal-blast-radius mandate).
  const PP = { ...shared, ...engine };
  window.PP = PP; // PP-BRIDGE
  Object.assign(globalThis, PP); // PP-BRIDGE

  // Inversion of control (D-14): the classic script no longer self-invokes
  // `boot()` — it is a classic-script `function` declaration, so it is
  // already an own property of `window` with no bridge entry needed. The
  // module drives startup only after the bridge above is populated.
  window.boot();
}
