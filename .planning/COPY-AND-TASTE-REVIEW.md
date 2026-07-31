# Copy & taste calls made overnight — for Wyatt's approval

**Written 2026-07-30/31, while you slept.** You said: *"make taste calls and please invent player
facing copy and use it, but flag all of them for me so i can approve/edit it in the morning."*

This is that list. **Everything below is already live on the branch** — none of it is a proposal
waiting on you. If you disagree with any row, say the number and I'll change it.

Two things are deliberately NOT here because they are not mine: your **"Dozed at the helm!"**
wording, which you chose from three drafts, and your ruling to remove **both** 30-second shot-clock
penalties. Those are recorded in the commits as yours.

---

## A. Invented player-facing copy — 1 string

Only one genuinely new player-facing string was invented. Everything else routes into wording you
had already approved.

### A1 — the Ko-Fi footer button label

| | |
|---|---|
| **Where** | Footer, immediately right of Feedback (`index.html`, `#btnKofi`) |
| **Ships as** | `🍪 Buy me a cookie` |
| **Why this** | "Buy me a cookie" is **your own text**, taken verbatim from the widget snippet you sent. The only invented part is the **🍪 emoji prefix**, added because every other footer button carries one (📖 🎗️ 📜 💬 🚪) and a bare label would have been the odd one out. |
| **If you want it different** | The emoji is the only real decision. 🍪 was chosen over ☕ (Ko-Fi's own cup) because the label says cookie, and over 🧁 because the game already uses a cupcake for the bakeoff. |

**Not invented, for the record:** the Credits-modal button renders Ko-Fi's own widget with your
exact values — `init('Buy me a cookie', '#e89827', 'T4P423RFHW')`. Its label and styling are theirs.

---

## B. Taste calls — visual

### B1 — UI-01, one 14px rhythm everywhere

**What I did.** Two edits, both removing extra space rather than adding any:

- `#actionPanel` was `margin: 8px auto`. `#layout` is a grid with `gap: 14px`, so that 8px was
  **added** to the gap — the narration box alone sat 22px from its neighbours while every other
  panel sat 14px. Now `margin: 0 auto` (the horizontal `auto` still centres it).
- `#footerRow` had `padding: 4px 14px 18px`. It is a **sibling** of `#layout`, not a grid item, so
  the space above it was `#layout`'s own 14px bottom padding **plus** that 4px = 18px. Now `0` on
  top, making it exactly 14px like everything else.

**The judgement call:** I kept the footer's **18px bottom** padding rather than making it 14px. That
one is breathing room at the end of the page, not a rhythm step. Say the word and it becomes 14.

**Verified in the browser:** gap 14px, layout padding 14px, actionPanel margin `0px auto`, footer
padding `0px 14px 18px`.

### B2 — UI-02, where exactly "1 second" lands

**What you asked for:** icons rising out of boats stay fully opaque for 1 second before fading.

**The call.** The animation is 2.5s and was `0% → 18% (opacity 1) → 100% (opacity 0)`, i.e. it
started fading the instant it arrived, at 450ms. I added a hold: `18% → 58%` at full opacity. 58% of
2.5s is 1450ms, exactly 1000ms after arrival.

**What I also changed, and you should know:** I added an intermediate **transform** at 58%
(`translateY(-14px) scale(1.13)`) so the icon keeps drifting upward during the hold instead of
freezing in place for a second and then jumping. Holding opacity alone looked stalled.

**The fragility, stated where it matters:** the percentages only mean "1 second" because the
duration is 2.5s. There is a shouted comment in the CSS saying so. It is not gated.

### B3 — UI-03, what "10% smaller" was applied to

**The call.** Applied to the **resting geometry only**, in the shared builder
(`sailHighlightRect`, `src/ui/flow.js`) — side length × 0.9, with the inset derived from the scale
rather than hand-tuned to a second number.

**What I deliberately did NOT touch:** the bounce keyframes still scale 1 → 1.11. So the square is
10% smaller at rest and still bounces by the same proportion. The alternative reading — shrink the
animation too — would have flattened the bounce rather than shrunk the square.

**Why it went in the shared builder:** that function exists because host and guest boards used to
drift apart (D-55). A size change made in one renderer would have recreated exactly that bug. The
parity gate confirms one builder still serves both.

**Verified in the browser:** cell 42.67px → old side 38.67px → new side **34.8px**. Exactly 0.9×.

### B4 — UI-04, three hover cues instead of one

**What you asked for:** a more distinct mouse-hover effect.

**The call.** Was opacity .85 + brightness 1.12 + a 4px glow — on an already-pulsing square that read
as "slightly brighter", not "this one". Now: **full opacity**, a **2px white outline**, and a
**two-stage glow** (6px tight, 14px soft).

The white outline is the one doing the real work — it survives on a busy board where a glow gets
lost against the sea. **Screenshotted and confirmed clearly distinct** from its neighbours.

**A constraint worth recording:** hover cannot use a transform. `animation-play-state: paused`
freezes the bounce mid-frame, and that frozen keyframe transform beats anything set on `:hover`. So
"make it bigger on hover" is not available without restructuring the animation.

### B5 — UI-07, hiding the box at end of voyage, and how it meets your F6 rule

**What I did.** `showStats()` now clears and hides the narration/action box.

**The flag, and it is the important one on this page:** this is in tension with **F6, your own rule
— "the blue box should never be empty."** My reading is that F6 governs the box **during play**,
where an empty box means a message got dropped. At end of voyage the box has no further job and the
summary is the thing to look at. **If you meant F6 to hold at EOV too, this is the row to reject.**

Safe to hide unconditionally: `panel()` sets its own display on any later call, so a new line
re-shows the box without anything needing to be undone.

---

## C. Taste calls — engineering, with player-visible consequences

### C1 — Ko-Fi: your snippet, but `getHTML()` instead of `draw()`

**You said "use this code."** I used your three values exactly. I did **not** call `draw()`.

**Why, and this is not a style preference.** I fetched the served CDN file and checked: `draw()` is
`document.writeln(...)`. `document.write` after a page has finished loading implicitly opens a *new*
document — so the first time a player clicked Credits, **the entire game would have been replaced by
a lone Ko-Fi button.** The same script exposes `getHTML()`, which returns byte-identical markup as a
string.

**Verified in the browser:** widget mounts (2638 chars, correct `ko-fi.com/T4P423RFHW` link), and
the page is still alive afterwards — which is the specific thing `draw()` would have destroyed.

### C2 — Ko-Fi loads on first Credits open, not at boot

**The call.** The snippet is a render-blocking third-party `<script>`. The game already waits on two
Firebase CDN scripts in `<head>`. Nobody should wait on ko-fi.com to *start a game* they may never
open Credits from. It now loads the first time Credits opens, and a failed load is retried on a
later open.

**Deliberate silence on failure:** an ad-blocker eating the request is common. A broken-donation
error message is worse than no button — and the **footer link is a plain `<a>` with no script at
all**, so the ability to support the game survives the widget failing entirely.

### C3 — Ko-Fi footer button colours

Your brand hue `#e89827` (from your snippet) run through the **same light-tint recipe** every other
footer button uses: `border #e89827 / background #fdf3e3 / text #8a5a12`. So "styled the same" means
same shape, size and weight as its neighbours — not Ko-Fi's own pill dropped into the row. The
Credits modal is where Ko-Fi's real branding appears.

### C4 — UI-05: `#stepHost` kept, not deleted

"Host a Crew" now creates the room directly. The old screen — whose entire content was one "Create
the game" button, asking you to confirm what you just clicked — is **no longer reachable**, but its
markup is kept with a comment. `showStep()` enumerates it by id and `#btnCreate` is still wired.
Deleting both is a separate cleanup, not part of UI-05.

### C5 — CR-03: the flee refund was deleted, not made real

The todo proposed debiting the stake at collection "to make the refund honest." **I checked, and
that would have been wrong.** `settleSideBets` computes `won ? 1+2*amt : -amt` — the losing arm *is*
the stake. The maths is already self-consistent with no debit at collection. Debiting there would
have meant rewriting win/loss economics you have playtested. That is a balance change, not a bug fix.

**One thing I noticed and did NOT act on** — flagging because it is yours: with no debit at
collection, a winning bettor nets `+1 + 2×stake`. Read strictly, "double or nothing" would net
`+1 + stake`. So a winning side bet may pay one stake more than the rules text implies. **This is
long-standing, playtested behaviour and I did not touch it.** If it should change, say so.

### C6 — a third bucket in assertion 8, your 209-row review gate

**What happened.** Removing the crate penalty killed a card (`table:shotclockskip~crate`) that one of
your 209 reviewed rows pointed at. The gate **refused** — correctly — because that row's tag is
`rewrite`, and the existing retirement path only accepts `merge`. It was protecting your work.

**The call.** I did **not** loosen that rule. I added a **separate** bucket, `mechanic-removed`, kept
as an **exact pinned list** (never a count or a reason string), with one extra condition retirement
does not have: **each id must name a card that is genuinely not live**, so this can never become a
way to hide a still-rendering card from your review. The arithmetic still covers all 209.

**Red-proofed:** I put the dead card back and watched the gate fail with
*"refusing to drop table:shotclockskip~crate as mechanic-removed — that card is STILL LIVE."*

### C7 — audit-page card label (not player-facing)

The card title in your review tool now reads **"Clock ran out — the turn is lost, nothing else"**,
replacing "No crate held — coins tumble overboard". Card titles describe a branch to you; they never
reach a player. Flagged only because it is text I wrote and you will see it.

---

## D. What I did NOT decide for you

- **Whether a winning side bet pays one stake too many** (C5). Long-standing; untouched.
- **Whether F6 applies at end of voyage** (B5). I assumed not.
- **Anything requiring the live site.** Nothing was merged or deployed while you were asleep.
