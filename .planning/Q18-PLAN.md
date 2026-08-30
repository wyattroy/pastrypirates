# Q-18 — send the event alongside the picture. His ruling, 2026-08-29.

**His words, from the question UI:** *"Send the event too (additive, reversible): the guest prefers
the real event and falls back to today's picture when it's absent. Kills this whole class of bug at
the source."*

## What is wrong today, in one sentence

The wire carries a **finished sentence**. Every drawing decision the guest needs has to be either
re-derived from that sentence, or shipped as its own extra field. Six CEO reviews found six
divergences of exactly that shape.

The subject is the case already paid for. The host decides it from the event and ships the answer as
`subj`, with `-1` meaning "deliberately none" so an older client still falls back to the old
sentence-sniff. That works — and it is one field per decision, forever.

## The change, and it is small

**1. ONE RULE, IN ONE PLACE.** `src/shared/index.js` is imported by `src/orchestrator.js:77` and by
`src/ui/panel.js:37` — the only module both tiers already share. Move the subject rule there:

```js
// an event that names TWO captains is not about either of them
export function subjectOf(e){
  if(!e) return undefined;
  const twoCaptains = e.d!=null && e.a!=null && e.d!==e.a;
  return twoCaptains ? null : (e.p!=null ? e.p : (e.a!=null ? e.a : null));
}
```
`panel.js` calls it instead of inlining the test. Nothing changes on the host.

**2. THE EVENT RIDES ALONG.** `netSetNarr` gains `ev` — the event object the host was already
holding. Additive: an older guest ignores a field it does not read.

**3. THE GUEST PREFERS THE EVENT.** In `watchNarr` (`orchestrator.js:1741`):
```
v.ev present   -> subject = subjectOf(v.ev)      // computed here, by the same rule
v.ev absent    -> today's behaviour exactly: v.subj, with -1 meaning "none"
```

## Why this is worth doing even though `subj` already works

Because the NEXT decision costs nothing. Whatever the guest needs to know next — which captain a line
is about, whether a beat is a fight, who paid — it can ask the event instead of waiting for someone
to add a field and remember to send it. That is the difference between a fix and a floor.

## What it must not break, and how that is held

- **A guest on an older build.** `ev` absent must behave EXACTLY as today. Red-proof by deleting `ev`
  from the payload and confirming the subject still arrives.
- **`w42_battle_bubble_check.mjs`** already holds the two-captain rule. It must keep passing, and it
  must now read the SHARED function rather than the inlined test, or it stops watching anything.
- **Rule 23's own question** — what makes these two agree? After this, one function, called by both.
  Before this, a value computed on one side and shipped.

## Sized honestly

Half a day was the estimate he approved. The three edits above are perhaps an hour; the rest is the
gate, the red-proofs, a two-browser run to prove the guest still anchors single-captain lines and
still centres fights, and a CEO review.

## NOT in this change

Removing `variants`, or having the guest phrase its own sentence. That was option 2 and he did not
pick it. `subj` also stays on the wire — it is the fallback that makes this reversible.
