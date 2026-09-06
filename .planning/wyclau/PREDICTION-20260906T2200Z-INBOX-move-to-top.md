# Prediction — INBOX-20260903T182856Z (mobile move-to-top button)

**Item:** Wyatt, 2026-09-03T18:28:56Z, DO NOW: *"Def to move doesn't work on mobile. New idea: add
a 'move to top' button to the right of each item in the list. I click it once, it puts it at the
top of the list."*

**Why I picked this one.** Every higher-ranked Chart row is either CLAIMED (T-073, on the Mac),
blocked purely on Wyatt's own approval (T-138, T-238, the Netlify/Cloudflare scoping), a stale
ranking artifact of an already-closed row (T-243), or explicitly flagged by multiple prior watches
as needing careful non-rushed empirical work in the same ~900-line fragile `stage.js` function that
has repeatedly re-broken things when rushed (T-237, T-013, T-214 — I ran T-214's own posed check,
`t211_reframe_on_new_captains_check.mjs`, and it PASSED clean on seed 20260903, giving me no fresh
red signal to work from without a longer investigation prior watches already declined to rush). This
INBOX item is old, still marked `status: OPEN` with "take this before anything ranked", and I have
not found a Chart row for it — it looks like exactly the kind of stale-fate-marker (T-264's own
subject) that never got closed even though the work landed.

**What I expect, before checking anything further:** the move-to-top button (`button.totop`, "▲
top") that I found in `scripts/wyclau/glass.mjs` was built AS THE DIRECT ANSWER to this exact
request, and it already works correctly on mobile (uses standard `click` + `pointerdown` DOM
events, not drag-and-drop, which is what he said was broken). If that holds, this item is DONE and
should be closed through the gate rather than left open forever.

**What would prove me wrong:** if the button's event wiring turns out to depend on
mouse-only events (e.g. only `mousedown`/`dragstart`) that do not fire from a touch tap, or if the
button is not actually reachable/visible on a narrow viewport (e.g. hidden by CSS, clipped off
screen, or gated behind a hover state) — any of that would mean his mobile complaint is NOT
resolved by what's in the file, and the item stays open with that finding written down instead of
closed on an assumption.

**How I'll check it:** read the CSS around `.totop` for anything hover-only or `:hover`-gated
placement, and confirm the click handler path doesn't route through anything mouse-specific
upstream (e.g. a parent `dragstart` handler stealing the event).
