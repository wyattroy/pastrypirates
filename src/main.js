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
import * as ui from "./ui/index.js";

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
  const PP = { ...shared, ...engine, ...net, ...ui, appState: stateNs.appState }; // PP-BRIDGE
  window.PP = PP; // PP-BRIDGE
  Object.assign(globalThis, PP); // PP-BRIDGE

  // 11-04/11-05: the injected-handler seam (D-07/criterion 1). src/ui/panel.js's
  // flash()/liveRender() and src/ui/flow.js's remotePickHighlights()/endReplay()/
  // wireRestoreFail() no longer call netNarrate()/pushEvents()/sendResponse()/
  // setRecoveryState()/leaveGame() directly (that would be a UI->net import) — they call through
  // src/ui/handlers.js's netHandlers() accessor instead, and THIS composition root wires the
  // actual net-adjacent operations in. All five targets are themselves still classic-script
  // globals this wave (not yet modularized into src/net/), so this reaches them via the
  // still-present PP bridge (globalThis) rather than a real src/net/ import — a deliberate,
  // temporary, composition-root-only use, formalized to real src/net/ imports once the
  // room-lifecycle/orchestration functions themselves modularize (11-06). This is all 5 of the
  // milestone's UI-side seam edges (RESEARCH.md Q1b) — the 6th (battleAsk) is orchestration,
  // homed in 11-06, not a UI-side injected-handler edge.
  ui.setNetHandlers({
    onBroadcast: (...a) => globalThis.netNarrate(...a),
    onEvents: (...a) => globalThis.pushEvents(...a),
    onRespond: (...a) => globalThis.sendResponse(...a),
    onRecovery: (...a) => globalThis.setRecoveryState(...a),
    onLeave: (...a) => globalThis.leaveGame(...a),
  });

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

  // GLOBAL-03/D-09: the fourth named debug hook, landed under the same "single documented
  // mechanism" umbrella as the three above rather than a new ad-hoc window.* global. Unlike
  // __pp_net_debug (a namespace of live function references, safe to call at any time),
  // exposing appState directly would hand a console/MCP session the SAME mutable object every
  // classic-script write mutates — see src/state/index.js's header on why the appState BINDING
  // must never be reassigned; exposing the live object as a debug hook has the identical hazard
  // one level down, since calling this and writing back into the result would silently corrupt
  // authoritative game state with no error. So this is a helper FUNCTION, not a plain property
  // assignment of the object itself: each call returns a fresh `{...appState}` shallow copy,
  // safe to inspect and safe to mutate without touching the real state. Deliberately carries no
  // PP-BRIDGE tag, matching __pp_net_debug: it is meant to outlive the Phase 11 bridge-removal
  // grep, as a permanent, named, read-only observation surface.
  window.__pp_app_state_debug = function () {
    return { ...stateNs.appState };
  };

  // 08-02: the relocated D-06 impurities and the ASSET_BASE top-level hazard
  // must run before boot()'s element-lookup/event-wiring (wireWelcome,
  // wireLobby, wireRecipeModal) does — the relocated comment inside
  // applyEngineBootstrapEffects() states exactly that invariant, and boot()
  // is where that wiring happens, so this ordering preserves it.
  window.applyEngineBootstrapEffects();
  window.attachPastryArt();

  // Standing tripwire (mirrors the module-ok marker's convention): the
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
