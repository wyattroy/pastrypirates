// src/main.js
//
// Module entry point (D-13, D-14). Proves the zero-build module-loading
// contract: this exact file imports cleanly under plain Node (no DOM, no
// Firebase present) and executes in the browser with no bundler.
//
// It does nothing beyond proving the contract — it does not read or write
// game state, does not touch initialization, and adds nothing to the
// existing startup sequence (D-18).

import { MODULE_OK_FLAG } from "./module-contract.js";

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
}
