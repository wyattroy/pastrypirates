# API Coverage — Phase 20 (The Board Comes Alive)

No external API integration: this phase adds client-side board decoration (wind dots, channel specks, rotating whirlpools, a rim-sweep highlight and ghost boat) inside `src/ui/board.js` / `src/ui/flow.js` / `src/ui/panel.js` plus a derived narration string in `src/ui/util.js`, and it installs no packages, opens no network surface, adds no Firebase field or broadcast payload, and calls no external service — every mechanism is either purely local rendering or a pure function of data already carried on the existing `newround` event.
