<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Your rules page: five questions are waiting in Your Call, and the homework is done.**

You asked me to settle the content split before anything gets built, and not to write any code. No
code was written — `index.html`, `about.html` and `src/` are untouched.

**The thing I found while doing the homework changes the question.** You said there are "two
overlapping accounts of the rules". There aren't. **There is one correct account trapped in the
in-game modal, and one on your public About page that is wrong in at least four places:**

- **"or fish for a quick coin"** — there is no fish. The four actions are Dock, Attack, Trade and
  Muse. Fishing was deleted from the game outright.
- **"dock and flip a coin for a crate"** — the flip pays you coins; buying a crate is a separate
  step, at a price that rises as the island empties.
- **"first baker home wins", with the bake-off as a tiebreak** — getting home doesn't win. It lights
  your ovens, and you win by naming your shuffled crates back in the recipe's order from memory.
  Two captains home the same day bake **together**.
- **"the wind sets your sailing budget — cheap with it, dear against it"** — sailing is **free**.
  The wind caps your range; it never charges you.

So a stranger arriving from Google reads the wrong rules and a player who opens the modal reads the
right ones. That's backwards, and it's a better argument for giving the rules a real page than the
search one you opened with.

**My recommendation, in one line: give the modal's text a URL at `/rules.html`, and take the rules
OUT of About rather than adding a third account.** That leaves two pages where there are two today,
one of them newly correct, and nothing competing for the same search.

**The five questions in Your Call**, each one tap, recommendation marked: which page becomes THE
rules page · what About keeps · does the modal show the full rules or link out · does the rules page
speak pirate or in your own voice · and once Credits has its own page, does About keep its list.

**Question 3 has a measured reason behind it worth knowing:** the modal's numbers aren't typed in —
they're filled from the settings of the voyage you're actually playing, so a two-player table sees
its own crate prices. A static page can only ever show the four-seat default. That's why I'd keep
the full text in the modal rather than link out of a game on a shot clock.

Nothing gets built until you answer question 1 — you said so yourself, and the build item quotes it.

⚠ *This note was written, committed, and then wiped by `npm test` — the open Chart row that says
`npm test` destroys whatever is waiting here. Restored from its own commit. Second bite today.*
