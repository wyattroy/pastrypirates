# Phase 13 — API Coverage Declaration

**Detector fired on:** "Firebase" / "sync" appearing in phase scope.

**Disposition:** OPT-OUT (reasoned declaration, not a coverage matrix).

No external API integration: this phase extends the already-integrated Firebase
RTDB with one room-scoped boolean node (`rooms/{room}/paused`) mirroring the
existing `timerOff` sync path (`src/net/writers.js` `netSetTimerOff` /
`src/net/watchers.js` `netWatchTimerOff`). No new external API/SDK/service is
added — the Firebase RTDB compat SDK (v12.15.0) is already wired through
`src/net/index.js`, and the new node uses the identical `db.ref(...).set()` /
`registry.attach(... event:"value" ...)` shapes already in use for ~18 existing
room nodes. A full API coverage matrix is therefore not applicable.

**Reason required (like an opt-out reason):** The only external service is an
already-integrated one; the phase's Firebase surface area is a single boolean
mirror of an existing node, not a new integration whose endpoint/method coverage
could meaningfully be enumerated.
