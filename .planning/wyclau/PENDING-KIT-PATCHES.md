# PENDING CLAUDE-KIT PATCHES — changes this repo needs that only the Mac can make

*The wyclau tooling in `scripts/wyclau/` and `.claude/skills/door/SKILL.md` is VENDORED from
claude-kit (see `.claude/wyclau/VENDORED-FROM`). `scripts/qa/vendor_check.mjs` fails the build on
any edit to those files here, correctly — the kit is the source and it lives on Wyatt's MacBook.*

> ### ⚠ THE STRUCTURAL PROBLEM THIS FILE EXISTS TO MAKE VISIBLE
>
> **The relay runs on the Razer. The tooling the relay runs on can only be fixed from the Mac.**
> So a watch that finds a bug in the Bell, the Glass, `can_push`, `close_item` or
> `start_trial_detached` can measure it, prove it and write the patch — and cannot ship it. Every
> such fix waits for a session on the other machine.
>
> **That is worth knowing before it is worth solving.** It has now cost two items in one day
> (below). If it costs a third, it is probably time to ask Wyatt whether the wyclau scripts should
> live in this repo and be vendored INTO the kit, rather than the other way round.

**How to apply:** from the claude-kit checkout on the Mac, edit the file named, then
`bash install.sh vendor <path to pastrypirates> wyclau`, then run `npm test` here. Delete the entry
below in the same commit. Each entry names the gate that will catch a re-vendor silently reverting
it, so nothing here can rot unnoticed.

---

## 1. The rulings card's empty state says "Nothing ruled yet", which is false

**File:** `scripts/wyclau/glass.mjs`, the "Your rulings, in hand" card — the `ruled.length === 0`
branch.

**Why now:** Wyatt's INBOX-20260901T1310Z gave that card a triage lifecycle, so the card is
*supposed* to reach zero — that is the success state, not the day-one state. The sentence under it
still reads "Nothing ruled yet", which tells him his rulings were lost rather than handled.

**Current:**

```js
: ruled.length === 0 ? `<p class="muted">Nothing ruled yet.</p>`
```

**Replace with:**

```js
/* AN EMPTY CARD MUST SAY WHERE THEY WENT. "Nothing ruled yet" was true on day one and became a
   lie the moment the triage lifecycle landed (his INBOX-20260901T1310Z): he would read an empty
   card as his rulings having been lost rather than handled. The Chart's ## SETTLED RULINGS
   section holds every triaged one, and the ones still owing work are in the Tasks card above,
   tagged "Your ruling:". */
: ruled.length === 0 ? `<p class="muted">Every ruling you have made is triaged. The ones that still need something from you are in Tasks, tagged <b>Your ruling</b>; the rest are finished. All of them stay on the record in the Chart's SETTLED RULINGS table.</p>`
```

**What catches a silent revert:** nothing — this is wording, and no gate reads it. It is the one
entry here that depends on somebody applying it. **The lifecycle itself is safe**:
`scripts/qa/rulings_triage_check.mjs` (in `npm test`) enforces the record's side and renders the
real page, so a re-vendor cannot undo the triage, only leave this sentence wrong.

---

## 2. Pulsing the Glass consumes GLASS-NOTE.md even when the session cannot publish

**File:** `scripts/wyclau/glass.mjs`, the note-relay step (it folds
`.planning/wyclau/GLASS-NOTE.md` into the page and resets the file to its template).

**The bug:** the reset is unconditional. A session with no Artifact tool — which is *every* watch
on the Razer so far, six consecutively — folds the note into a page it then cannot publish, and
clears the file anyway. The note reaches nobody and is gone from the only surface Wyatt can read.

**What it cost, twice in one watch (2026-09-01T19:29Z):** the previous watch's warning —
*"THE BLACK CONSOLE WINDOW ON YOUR SCREEN IS THE TRIAL. Closing it kills the run"* — was consumed
by a pulse, restored by hand, then consumed by the NEXT pulse in the same watch and not noticed
until CEO Review 77 found it. An 88-minute release trial was in flight at the time.

**Fix shape:** reset the note only when the page is actually published — i.e. when
`mark_glass_published.mjs` runs, not when the file is merely written. That is the same
*"writing the file is only half of it"* rule `glass.mjs` already prints at itself on every run.

**What catches a silent revert:** `scripts/qa/glass_note_relay_check.mjs` already exercises the
relay ("picked up once, gone by the second run"). Whoever applies this fix should extend that gate
with a case for the unpublished path, red-proofed, in the same commit.
