// src/net/watchers.js
//
// Phase 9 (SPLIT-04/NET-01/NET-02, D-05/D-06). Thin transport wrappers: each
// function builds the Firebase Reference, picks a scope and a label, and
// hands the caller's own handler straight to the registry's attach() as the
// callback itself. Nothing here wraps, adapts, or inspects the handler, and
// nothing here reads any state belonging to the caller.
//
// The handler is passed through unmodified on purpose. The caller's handler
// receives exactly the argument the underlying transport passes to it — no
// extraction, no truthiness check, no shape change happens in this file.
// That is what lets a callback body move across as a plain function
// argument with zero edits: the identity the registry later hands to its
// own teardown call is the exact same function object the caller supplied,
// never a wrapper around it. Any wrapping layer here would break that
// identity and reintroduce the reference-identity problem this whole
// module exists to close, just one level removed.
//
// No emitter, no deferred dispatch: every attach below is a direct pass of
// the caller's handler into the registry, which itself performs the one
// permitted listener-attach call synchronously, in the same tick the
// underlying transport fires. Nothing in this file defers that call to a
// later turn of the event loop.
//
// This file has exactly one dependency: the registry. It reads no state
// belonging to whatever calls it, and it never reads a value out of the
// page beyond what's passed in as an argument.

import * as registry from "./registry.js";

export function netWatchFlip(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/flip");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "flip" });
}

// Session-scoped (D-04's Pattern 3 scoping): attached once per page life
// from the caller's own connection-setup routine, independent of which
// room (if any) is open. Must never be torn down by a room-scoped teardown
// — see registry.js's detachRoom(), which only ever touches "room" entries.
export function netWatchConnected(db, handler, onCancel) {
  const ref = db.ref(".info/connected");
  return registry.attach({ scope: "session", ref, event: "value", callback: handler, cancelCallback: onCancel, label: "connected" });
}

export function netWatchPresence(db, handler, onCancel) {
  const ref = db.ref("presence");
  return registry.attach({ scope: "session", ref, event: "value", callback: handler, cancelCallback: onCancel, label: "presence" });
}

// ---------------------------------------------------------------------
// Phase 9 Plan 2 (SPLIT-04/NET-01, D-05/D-06). Thirteen further room-scoped
// wrappers, same shape as the three above: build the Reference, preserve
// the caller's own guard (some call sites carry one, some do not — that
// split is preserved exactly rather than normalised in either direction),
// and hand the caller's own handler straight to the registry's attach
// entry point as the callback itself.
// ---------------------------------------------------------------------

export function netWatchTimerOff(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/timerOff");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "timerOff" });
}

export function netWatchClock(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/clock");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "clock" });
}

export function netWatchChat(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/chat");
  return registry.attach({ scope: "room", ref, event: "child_added", callback: handler, label: "chat" });
}

export function netWatchBattle(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/battle");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "battle" });
}

export function netWatchRecovery(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/recovery");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "recovery" });
}

// The seat is supplied by the caller as a plain argument rather than read
// from a global — this module reads no state belonging to whatever calls
// it (see the file header). The call site this replaces carried no guard,
// so none is added here.
export function netWatchDraftPrompt(db, room, seat, handler) {
  const ref = db.ref("rooms/" + room + "/draftPrompts/" + seat);
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "draftPrompts" });
}

// No guard at the call site this replaces — none added here.
export function netWatchEvents(db, room, handler) {
  const ref = db.ref("rooms/" + room + "/ev");
  return registry.attach({ scope: "room", ref, event: "child_added", callback: handler, label: "ev" });
}

// No guard at the call site this replaces — none added here.
export function netWatchPrompt(db, room, handler) {
  const ref = db.ref("rooms/" + room + "/prompt");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "prompt" });
}

// No guard at the call site this replaces — none added here.
export function netWatchNarr(db, room, handler) {
  const ref = db.ref("rooms/" + room + "/narr");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "narr" });
}
