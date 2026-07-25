// src/ui/handlers.js
//
// Phase 11 (SPLIT-03/06), wave 11-04. The injected-handler seam — the criterion-1 mechanism
// that keeps D-07's directional boundary ("ui may never import net") mechanically true as the
// UI functions that need a networking side effect leave the classic <script> region.
//
// This is the reverse of Phase 9's net->UI handler injection (src/net/watchers.js: net
// publishes, consumers subscribe via injected callbacks). Here UI PUBLISHES the render/turn
// events it produces, and the composition root (src/main.js) INJECTS the net-adjacent
// operations the UI needs to trigger as a result — so src/ui/ never needs its own `from
// "../net"` import to reach them.
//
// Two of the six UI->orchestration edges RESEARCH.md's Q1b table identified are resolved
// through this seam this wave: src/ui/panel.js's flash() calls the injected `onBroadcast`
// (was a direct netNarrate(...) call) and liveRender() calls the injected `onEvents` (was a
// direct pushEvents() call). netNarrate/pushEvents are themselves still classic-script globals
// this wave — not yet modularized into src/net/ — so src/main.js wires them in through the
// still-present PP bridge as a deliberate, temporary, explicitly-commented composition-root-only
// use of globalThis. This is formalized to real src/net/ imports once the room-lifecycle /
// orchestration functions themselves modularize (11-06). The remaining 4 of 6 edges are resolved
// in 11-05/11-06 as more of the classic script moves.
//
// setNetHandlers() merges onto the existing handler set (Object.assign, never a full replace)
// so a later wave can register additional handlers without every earlier caller needing to know
// about them, or without clobbering handlers a different wave already registered.

let _h = {};

export function setNetHandlers(h) {
  Object.assign(_h, h);
}

// Narrow read accessor for the UI functions that need to reach an injected handler. Deliberately
// a function (not the object exported directly) so every caller always sees the LIVE handler
// set at call time, never a snapshot taken before setNetHandlers() ran (module-load order between
// src/ui/index.js's barrel and src/main.js's composition-root wiring is not otherwise guaranteed).
export function netHandlers() {
  return _h;
}
