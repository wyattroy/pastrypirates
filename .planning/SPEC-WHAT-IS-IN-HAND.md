# SPEC — "WHAT IS BEING WORKED ON RIGHT NOW", under the status dot

*Design only. Written by the Advisor 2026-09-02 at his instruction, **rewritten after CEO review
found two of its premises false.** His ask: **"what is being worked on RIGHT NOW? that needs to be
visible just underneath the emoji status."***

> ## 🛑 THE FIRST DRAFT STOOD ON TWO CLAIMS THAT ARE WRONG. BOTH WERE RE-MEASURED AND BOTH ARE.
>
> **1 · "The fact is already on disk in a clean shape" — FALSE.** `.planning/CTO-LEDGER.md` holds
> **15** `### WATCH` headings and **exactly 4** match the shape the draft proposed to parse. The
> others are free prose written by whoever was on watch — `— SITUATION AND CLAIM`,
> `— DID NOT CLOSE ITS ITEM, DELIBERATELY`, and one with a short timestamp and no date at all. **The
> four tidy ones are all from the last two hours.** A regex over that would have found nothing this
> morning. *(Counted, not sampled — the draft's error was reading `tail -4` and calling it a format.)*
> **And nothing prescribes the shape:** `door/SKILL.md` step 2 says only *"Claim it in the ledger."*
>
> **2 · "The age must be computed in the browser" — IT ALREADY IS.** `glass.mjs:900-930` is a client
> script that parses `glassState` and renders **two** clocks — *"last progress N min ago"* and
> *"page published N min ago"* — deliberately, since 2026-08-31. **The clock was never the fault.**
> Its own comment names the real one: *"Neither can see work that happens after this page was
> generated; only republishing closes that gap."* `lastProgressAt` is the newest commit **at
> generation time**, so a page cannot learn about a commit made after it was published.
> **⇒ QUESTION 2 IS ALREADY FIXED, BY A DIFFERENT ROUTE.** The Door's new **step 6b** has the watch
> message the Glass to publish the moment it lands work. **Do not book question 2 against this
> spec.**

## THE DESIGN — write the claim the way the CLOSE is already written

**Stop parsing prose.** The close half of this is already machine-written and durable:
`close_item.mjs` appends a fixed line every time. The claim half is a human sentence. **Make them
symmetrical.**

`publish_status.mjs` already writes `.planning/wyclau/status/<machine>.md` — tracked, machine-written
— and **`glass.mjs` already reads it** (`:614`, splitting on `## Long run in flight`). That block is
*already the exact shape needed*: a named section carrying what/when, read under the rule **every
doubt resolves to NOT LIVE**.

**Add an `## In hand` block of the same shape**, written by the same script the Door already runs
twice (steps 4 and 6), carrying: **the item, the claiming watch's UTC, and the watch id.**

```
🟢 last progress 4 min ago
   In hand: T-088 — his five Glass asks · claimed 12 min ago
```

**What this buys over the regex, and it is the whole argument:**
- **No free-prose parse**, so it cannot go silent the day a watch words its heading differently —
  which, at 4 of 15, is the *likely* case rather than the edge case.
- **The reader is a copy of one already hardened by a real incident** — the false red of 2026-08-31.
- **The ledger stays the human narrative it is good at**, instead of being asked to be a database.

## FOUR STATES, and the fourth is the one he is actually complaining about

| state | when | rendered |
|---|---|---|
| **in hand** | a claim, recent | `In hand: <item> · claimed N min ago` |
| **nothing in hand** | no open claim | `Nothing in hand — the next watch takes the top of the Chart` |
| **⚠ claimed but COLD** | a claim whose watch is gone | `Claimed N min ago — no watch has moved since` |
| **unreadable** | the block is missing or malformed | says so; **never renders silence as "nothing"** |

**COLD is the state the first draft missed and he is complaining about.** A watch can claim and end
without closing — **that happened twice today, deliberately.** An open claim outliving its watch is
normal here, not a malfunction, and it must not read as *"being worked on right now."*

**HOW COLD IS DERIVED, without a new constant:** the block declares its own `staleAfterMinutes`,
exactly as `## Long run in flight` already does. The page compares, and every doubt resolves to COLD.

**AND THE AGE STILL DOES THE HONEST WORK.** *"claimed 3 hours ago"* tells him something is wrong
without the page judging — the same instrument as *"last progress N min ago"*, which he already reads
correctly. The page's **45-minute red dot** already covers an hour-old claim.

## THE BOUND, STATED HONESTLY — the first draft hedged here

The draft said a stale claim is *"bounded and self-clearing within one Bell interval."* **False.**
The Bell rings a watch; that watch then works before writing its own claim. Measured today, rings
were **40, 60, 50 and 30 minutes apart**, and `door/SKILL.md` step 4 exists precisely because **a
watch can end having pushed nothing at all.**
**The real bound is up to about an hour, and unbounded when the Bell is not ringing.** That is why
the COLD state is required rather than optional.

## WHAT THIS DELIBERATELY DOES NOT DO

- **No second definition of "working".** It reports the claim the Door already requires (rule 23).
- **No timer, no polling, no publishing more often.** He charged the timer design once; CEO 80
  upheld him. Step 6b makes the page move on work landing, which is better than any cadence.
- **No process inspection.** The page must be readable on his phone.

## SIZING

**Small.** One writer (`publish_status.mjs` gains a block), one reader (`glass.mjs` gains a second
`split` beside the one it has), one line of markup, and one line in `door/SKILL.md` step 2 telling
the watch to record its claim through the script. **A gate is worth it** — assert the block exists
and the page renders one of the four states — because the thing this replaces went silent for
exactly the reason a gate would catch.
