// src/main.js
//
// Module entry point (D-13, D-14). Phase 7 proved the zero-build
// module-loading contract here; Phase 8 extends this same file to populate
// the window.PP bridge (D-14/D-15) and invert control so this module — not
// the classic script — triggers startup (calling `boot()` directly, 11-06)
// after the bridge is ready.

import { MODULE_OK_FLAG } from "./module-contract.js";
import * as shared from "./shared/index.js";
import * as engine from "./engine/index.js";
import * as net from "./net/index.js";
import * as stateNs from "./state/index.js";
import * as ui from "./ui/index.js";
// 11-06: src/orchestrator.js is the last tier this composition root wires in — the 44
// orchestration (net-caller) functions that used to be the classic <script> region's own
// top-level declarations. `boot` is also imported by name so this file can call it directly
// (D-14's inversion of control, formalized this wave — see the `boot()` call at the bottom).
import * as orchestrator from "./orchestrator.js";
import { boot } from "./orchestrator.js";

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

  // 11-06: src/orchestrator.js's exports are published as globals through this SEPARATE
  // statement, not folded into the PP object literal above (that line, and the two PP-BRIDGE
  // lines around it, are left untouched this wave — only this new line is added). Same
  // motivation as `...ui`/`...net`/`...shared`/`...engine` above: dozens of already-moved
  // src/ui/flow.js and src/ui/util.js function bodies (11-04/11-05) call these 44
  // orchestration functions by bare identifier — broadcastFlip, netNarrate, netBroadcast,
  // renderBattle, battleAsk, asyncBattle, remotePrompt, remoteDraftPrompt, logDecision,
  // beginGame, broadcastClock, expireShotClock, watchTimer, and more — and src/ui/ can never
  // `import` src/orchestrator.js directly (module_graph_check.js's "ui -> shared/engine/state"
  // shape assertion would fail exactly the way a ui->net import would, since orchestrator.js's
  // own tier is "main", not one of those three). Publishing these as globals is what lets every
  // one of those already-moved call sites keep resolving with zero edits, mirroring D-15's
  // original minimal-blast-radius mandate for the PP bridge itself. Removed alongside the rest
  // of the bridge in 11-07 (the same grep to delete these can target this line too).
  Object.assign(globalThis, orchestrator); // PP-BRIDGE (orchestrator, 11-06)

  // 11-04/11-05/11-06: the injected-handler seam (D-07/criterion 1), now fully formalized.
  // src/ui/panel.js's flash()/liveRender() and src/ui/flow.js's remotePickHighlights()/
  // endReplay()/wireRestoreFail() never call netNarrate()/pushEvents()/sendResponse()/
  // setRecoveryState()/leaveGame() directly (that would be a UI->net import) — they call
  // through src/ui/handlers.js's netHandlers() accessor instead, and THIS composition root
  // wires the actual net-adjacent operations in. 11-04/11-05 wired these five targets to
  // still-classic globals via the PP bridge as a deliberate, temporary, composition-root-only
  // measure; now that all five are real src/orchestrator.js exports, they are bound directly by
  // reference — no bridge/globalThis indirection remains in this wiring. This is all 5 of the
  // milestone's UI-side seam edges (RESEARCH.md Q1b) — the 6th (battleAsk) is orchestration,
  // homed in src/orchestrator.js, not a UI-side injected-handler edge.
  ui.setNetHandlers({
    onBroadcast: orchestrator.netNarrate,
    onEvents: orchestrator.pushEvents,
    onRespond: orchestrator.sendResponse,
    onRecovery: orchestrator.setRecoveryState,
    onLeave: orchestrator.leaveGame,
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

  // Inversion of control (D-14), formalized (11-06): `boot()` is now a real
  // src/orchestrator.js export, imported by name at the top of this file — this module calls
  // it directly rather than through the `window`-property indirection 08-02 introduced (boot
  // was, until this wave, a classic-script `function` declaration, hence a bare `window`
  // property with no import available). The module still drives startup only after the bridge
  // above is populated, same ordering as before.
  boot();
}
