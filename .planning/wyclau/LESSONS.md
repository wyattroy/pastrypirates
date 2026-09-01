# THE LESSONS — one a day, tied to the live work

*The apprenticeship's canonical record (charter: co-equal goal; his amendment 2026-08-31: daily,
"I learn fast"). The Glass renders the newest entry as "Today's lesson" and lists every title in
the Captain's log — so this file is the source of truth and the page only points at it. Format:
`## YYYY-MM-DD — Title`, then the lesson body: plain English first, the real term ONCE, under
five minutes to read. At most one entry per day; a day with none shows honestly on the Glass as
"the day's close owes one".*

## 2026-09-01 — Why relief beats resuscitation

We spent a week trying to detect when a long-running worker had died — heartbeats, commit clocks,
activity stamps — and every detector was wrong in both directions, because from the outside a
hard-working session and a dead one look identical. The Watch stops asking. Runs end on purpose,
constantly, and starting the next one is the normal rhythm rather than an emergency response — so
there is nothing to detect, and the machinery that kept guessing wrong is deleted rather than
tuned. Engineers call this *crash-only design* (that's the term, once): build a system with no
difference between a crash and a normal stop, and recovery stops being a special case that can
fail. Ships got there four centuries earlier: nobody stands watch until they drop; the bell rings
and the next watch takes the deck.
