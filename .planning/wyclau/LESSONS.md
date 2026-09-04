# THE LESSONS — one a day, tied to the live work

*The apprenticeship's canonical record (charter: co-equal goal; his amendment 2026-08-31: daily,
"I learn fast"). The Glass renders the newest entry as "Today's lesson" and lists every title in
the Captain's log — so this file is the source of truth and the page only points at it. Format:
`## YYYY-MM-DD — Title`, then the lesson body: plain English first, the real term ONCE, under
five minutes to read. At most one entry per day; a day with none shows honestly on the Glass as
"the day's close owes one".*

## 2026-09-04 — A gate can hold the SHAPE of a decision and not the decision

The Bell rang every watch on Opus for weeks because its launch line carried no --model flag. Nobody chose Opus; it fell out of an argument list nobody read. The fix was one line, and it came with three checks so it could never silently un-happen. Then the CEO put the Watch back on Opus, ran those checks, and they all said PASS. They were asserting that SOME model was named -- the shape of the launch line -- while the thing Wyatt actually ruled, sonnet 5, was held by nothing. A nonsense model string passed too, which would have killed every watch at startup while the log cheerfully recorded a ring. The lesson is not 'write more checks'. It is that a check written straight after a fix tends to describe the fix rather than the decision behind it, because the fix is what is in your head. Ask instead: what did he actually decide, and what edit would reverse it without failing anything? Here that edit was one word in one string. A ruling that one line can undo silently is a default wearing a ruling's clothes.

## 2026-09-03 — The check that says PASS may never have run

Today I wrote checks to protect your Glass, and then had to check the checks — because three of them were quietly measuring nothing at all, while printing PASS.

One went looking through your page for a function called `saveRuling` and found the words *"function saveRuling("* — inside one of my own commit messages, which your Glass renders as readable prose in the ledger. It then carefully examined six thousand characters of English and reported on it. It had found its subject's **name** and measured that instead of its subject.

The second read your page for the code that runs on it, and found the *second* copy — the Glass carries its own source a second time so it can republish itself, so every function on that page exists twice and only one of them ever runs. The third looked for a line spelled `const lessonHtml` when the file says `function lessonHtml`, got back "not found", and — because "not found" is the number −1 — went and read the very last character of the file instead, then announced that your lesson was no longer being escaped properly. It was blaming the code for something it had never actually looked at.

And then the same thing happened one level up, to me. To prove a check really works, you break the thing on purpose and confirm the check screams. I did that three times tonight and got PASS, PASS, PASS — and briefly believed the check was weak. It wasn't. **My sabotage was never applied.** I had written a newline where I meant to write the two characters backslash-n, so the text I was searching for did not exist and the edit changed nothing. I was testing an untouched file and reading the result as evidence.

So here is the whole thing in one sentence, and it is the same sentence in all four cases: **an instrument that reports "fine" may not have reached its subject at all, and nothing about the word "fine" tells you which.** The fix is never to look harder at the answer. It is to ask, before you believe it, *what would this have printed if the thing were broken?* — and then actually make it broken and watch. If it prints the same thing either way, you have not measured anything; you have just read a label. That is why every gate here has to be shown failing before it is allowed to be trusted passing, and it is why I now make the sabotage prove it applied before I read what came out.

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
