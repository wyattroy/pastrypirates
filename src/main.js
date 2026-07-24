// src/main.js
//
// Module entry point (D-13, D-14). Phase 7 proved the zero-build
// module-loading contract here; Phase 8 extends this same file to populate
// the window.PP bridge (D-14/D-15) and invert control so this module — not
// the classic script — triggers window.boot() after the bridge is ready.

import { MODULE_OK_FLAG } from "./module-contract.js";
import * as shared from "./shared/index.js";
import * as engine from "./engine/index.js";
import * as net from "./net/index.js";
import * as stateNs from "./state/index.js";

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
  // the three lines below). Publishes every shared/engine/net export as a
  // global-object property so the ~150+ pre-existing bare-identifier call
  // sites in the classic region resolve with zero edits (D-15's
  // minimal-blast-radius mandate).
  //
  // Phase 10 (GLOBAL-01/D-05) adds ONE more key: `appState`. Unlike every
  // other key here, `appState` is not a namespace of independent read-only
  // exports — it is the SAME single mutable object stateNs.appState holds,
  // published by REFERENCE (not copied field-by-field). That distinction is
  // load-bearing: `Object.assign(globalThis, PP)` below copies `PP.appState`
  // (an object reference) onto `globalThis.appState` as a plain assignment —
  // the value copied is the reference itself, so both `globalThis.appState`
  // and every module's own `stateNs.appState` keep pointing at the identical
  // object afterward. A later classic-script write like
  // `appState.room=code` mutates that one shared object; nothing here ever
  // holds a stale copy of its fields the way Phase 8's snapshot bridge would
  // if `appState` here meant "the current field values" rather than "the
  // object itself". See src/state/index.js's own header and
  // 10-RESEARCH.md's "Why a snapshot bridge cannot work" for the full
  // mechanism. NAMED `appState`, not the RESEARCH/CONTEXT-illustrative
  // `state` — `state` already collides with unrelated local
  // parameter/variable names inside the classic script (see
  // src/state/index.js's header for the full account); `appState` was
  // confirmed to have zero pre-existing occurrences before being chosen.
  const PP = { ...shared, ...engine, ...net, appState: stateNs.appState }; // PP-BRIDGE
  window.PP = PP; // PP-BRIDGE
  Object.assign(globalThis, PP); // PP-BRIDGE

  // Phase 9's debug hook (NET-03 observation point, GLOBAL-03's seed for a
  // future single documented debug mechanism). Deliberately carries no
  // bridge-removal tag: the two lines above are deleted in a later phase,
  // but this hook is meant to outlive them as a permanent, named
  // observation surface for the registry's own bookkeeping.
  window.__pp_net_debug = {
    size: net.netRegistrySize,
    list: net.netRegistryList,
    detachRoom: net.netDetachRoom,
    detachAll: net.netDetachAll,
  };

  // 08-02: the relocated D-06 impurities and the ASSET_BASE top-level hazard
  // must run before boot()'s element-lookup/event-wiring (wireWelcome,
  // wireLobby, wireRecipeModal) does — the relocated comment inside
  // applyEngineBootstrapEffects() states exactly that invariant, and boot()
  // is where that wiring happens, so this ordering preserves it.
  window.applyEngineBootstrapEffects();
  window.attachPastryArt();

  // Standing tripwire (mirrors window.__pp_module_ok's convention): the
  // document.body.innerHTML rewrite above now runs at module time instead
  // of mid-parse, so it re-serialises and re-parses the whole body —
  // including the classic <script> elements, which the HTML parser marks
  // non-executable on innerHTML insertion and will not re-run. This counter
  // proves src/main.js itself still only runs once, rather than assuming it.
  window.__pp_boot_count = (window.__pp_boot_count || 0) + 1;

  // Inversion of control (D-14): the classic script no longer self-invokes
  // `boot()` — it is a classic-script `function` declaration, so it is
  // already an own property of `window` with no bridge entry needed. The
  // module drives startup only after the bridge above is populated.
  window.boot();
}
