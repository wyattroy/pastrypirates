# PREDICTION — `T-206`, the unstarted half of his analytics ask

**Written 2026-09-03T10:16Z by watch f1, BEFORE any measurement.** Nothing below has been checked.
His ask, `INBOX-20260902T214507Z`: *"Add google analytics to playpastrypirates.com and create a
firebase admin console so I can see how many people are playing"*. The console half shipped
(CEO 159); this is the Google Analytics half.

## What I expect, and why

**P1 — Google Analytics cannot be installed by a session at all, and the blocker is mechanical, not
taste.** A GA4 tag is `<script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX">`, and
that `G-` measurement ID is minted inside a Google Analytics property, which lives in **his** Google
account. No session can create one. *Why I expect it:* that is how GA4 works everywhere; there is no
anonymous form of the tag.
**Consequence if true:** the row is not "not started because nobody picked it up" — it is **waiting
on one string from him**, and every watch that has skipped it has skipped it for the wrong reason.

**P2 — the repo contains no `G-` measurement ID and no `gtag`/`googletagmanager` reference today.**
*Why:* the row says GA "is not started", and nobody could have added the tag without P1's ID.

**P3 — `src/ui/usage.js` exists and already writes a per-boot record to Firebase.** *Why:* the Chart
row cites it by name and the console half (`stats.html`, CEO 159) was built on top of something.

**P4 — the numbers on the row (237 page boots, 123 distinct browsers, fourteen days) are ANOTHER
WATCH'S measurement, not mine, and I expect them to have MOVED — probably up.** *Why:* they were
taken 2026-09-03 earlier in the day against a live database that keeps receiving boots. **I will not
repeat them to him as current without re-reading them**, which is the whole of rule 6.

**P5 — the honest deliverable for this watch is a QUESTION to him with the measurement in it, not a
tag.** *Why:* P1 blocks the build, and consent/third-party-script-on-a-children's-page is his call by
the row's own words. The row also names four surfaces that would each need a decision —
`index.html`, `about.html`, `classic/`, `stats.html`.

## What would prove me WRONG

- **P1/P2 die** if a `G-`… id, a `gtag(` call, a `googletagmanager` URL, or a GA property id in any
  config/env/notes file already exists in this repo. Then GA is installable *today* and this watch
  should be installing it, not asking. **This is the check that matters most; run it first.**
- **P1 also dies** if the ask can be met without a GA property — e.g. if he only wants the numbers
  and a first-party counter already answers it. That is not GA, so it would make the row's title
  wrong rather than my prediction wrong; I have to say which.
- **P3 dies** if `src/ui/usage.js` does not exist, or exists and writes nothing — in which case the
  row's "the game already collects this" claim is false and must be corrected in the open.
- **P4 dies** if the live numbers come back at or below 237/123, i.e. the counter has stopped. That
  would be a finding of its own and would make the console half less useful than CEO 159 recorded.
- **P5 dies** if, after P1–P4, there turns out to be a complete, unblocked, non-taste piece of the
  GA half a watch can ship alone. If so I should ship it and not hand him a question.

## The rule-27 half I expect to owe

If the deliverable really is a question (P5), it must reach him as a **tappable thing on his page**,
with the real numbers inside it and a marked recommendation — not a file path, and not four vague
questions collapsed into one. This watch has **no Artifact tool**, so it can put the question into
`BLOCKED ON WYATT` and into `GLASS-NOTE.md` and no further; the publish belongs to a session that has
the tool. **I must say that out loud rather than implying he will see it.**
