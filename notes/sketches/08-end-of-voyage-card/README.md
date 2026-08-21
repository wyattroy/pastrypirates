# Item 8 — the end-of-voyage card, three different answers

His words: *"Be a UX designer and suggest a solution."* His one hard requirement: the card must be
**collapsible (or hold-the-sea)** so the final board can be seen behind it. These are three genuinely
different mechanisms for doing that, not three colour schemes on the same idea — open each one and
try it.

- **Option A — Hold-the-sea.** `option-a-hold-the-sea.html`
  Reuses the game's existing gesture exactly as it already works everywhere else (press and hold
  anywhere, the card fades to 13% opacity, lift your finger and it's back). **Costs nothing new to
  build** — it's the same class the game already toggles — and it's consistent with every other
  floating box (rule 8). Downside: it's momentary. You can't hold the card down AND do something on
  the board at the same time (e.g. reread a captain's row while the recap stays out of the way).

- **Option B — Tap a tab to tuck it away.** `option-b-tab-collapse.html`
  A handle sits on top of the card; tapping it slides the whole card down to the bottom edge,
  leaving just the handle visible, and it *stays* tucked away until tapped again. Persistent state,
  not momentary — you can look at the board for as long as you like. Costs a bit more: a new
  slide transition and a handle element, but no drag handling.

- **Option C — Drag it down to a corner badge.** `option-c-swipe-badge.html`
  Drag the card downward and it shrinks into a small floating crown badge in the corner; tap the
  badge to bring the card back. Most physical-feeling of the three, and the badge stays as a
  permanent reminder that there's a recap to come back to. Costs the most: drag tracking plus a
  second persistent UI element (the badge) that has to be placed somewhere it never blocks anything
  else on screen.

**My recommendation:** Option A ships fastest and is the most consistent with the rest of the game
(same gesture the mute peek, every prompt, and the narration bubbles already use). Option B is the
better answer if the real complaint is "the board should stay visible for a while, not just while
my thumb is down" — worth it if the game.

Open any file directly in a browser — no server needed, no imports, nothing else on the page.
