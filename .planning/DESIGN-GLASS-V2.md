# THE GLASS, VERSION 2 — a design

*Written 2026-09-02 from `SPEC-GLASS-REQUIREMENTS.md`, by a session that read the requirements
before it read the current implementation, on purpose.*

> **The one-sentence version.** Stop publishing a page and start sharing a notebook: Wyatt and every
> session — attended or not, on any machine — read and write the **same live store**, and the page
> is a window onto it rather than a copy of it. Nothing is published, nothing is harvested, nothing
> is stamped, and there is no second thing to keep in step.

---

## PART 0 — THE ARGUMENT, BEFORE THE MECHANISM

Part 3 of the requirements ends with the real brief:

> *Two things that must agree, kept in step by discipline rather than by construction, always drift.*

So I started by listing every such pair in the current Glass and asking what would make each one a
single thing. That list, and its answers, **is** the design:

| The pair that drifts today | What makes them ONE thing |
|---|---|
| The record (`CHART.md`) and the page | **There is no page-copy.** The page subscribes to the record and redraws when it changes. "Changed" and "he sees it" are the same event because there is nothing in between. |
| His answer, and the question going away | **The answer is a field on the question.** A question is "open" *because* no answer exists at its address. Writing the answer is the retirement — one write, not two. |
| His words, and our regeneration of the file they live in | **His words live at an address only he writes, and the database refuses to overwrite it.** We cannot destroy them because we are not allowed to write there twice. |
| The rank he reads, and the queue a watch pops | **One list, two readers.** The page renders it; the Door takes its first row. Neither computes its own. |
| The freshness stamp, and the freshness | **Stamps are deleted.** Freshness is the server's own timestamp on the newest thing that happened, compared to now. |
| A question's id, and the question | **The store mints the id.** Nothing about it derives from the text, so two similar questions cannot become one. |
| The relay note and the page that consumes it | **Deleted.** `GLASS-NOTE.md` is read and reset non-atomically (`glass.mjs:222-228`) — a second session writing in that window is simply lost. A session with a direct write path needs no relay at all. |

Everything below is the consequence of that table. Where the current design needed a hook, a gate, a
runbook, a cron job, a stamp file and a hand-started session to hold a pair together, this design
usually needs an *address*.

**The other realisation, and it is the load-bearing one.** Almost every operational failing in
Part 3 — the 429, the stale page, the harvest race, the hand-started publisher, the cron dispatcher,
the thin-context rule, the nine-step runbook — is not a failure of judgement. It is the same
mechanical fact showing up in nine costumes:

> **The current Glass lives inside a walled garden that an unattended session cannot reach.**
> A published artifact is written with the Artifact tool. A `claude -p` watch has no Artifact tool.
> So the only writer is a human-started session, and everything else is scaffolding built to work
> around that one sentence.

You cannot fix that from inside. **So the design decision that matters is: move the Glass to a place
both halves can reach.** Everything else is detail.

### What is actually there today, so it is clear what is being replaced

Read before designing, and worth stating in four lines because three of them surprised me:

- **Nothing in the toolchain publishes.** `glass.mjs` writes a file and prints a runbook
  (`glass.mjs:1420-1439`); the publish is a human-started session calling the Artifact tool against
  one hardcoded url (`glass.mjs:84`). There is no HTTP client anywhere in the system.
- **The page stores his words by rewriting its own source and republishing itself** — `buildDoc()`
  re-inserts an escaped copy of the whole document into itself and calls `cap.publish()`
  (`glass.mjs:1180-1194`, `:1367`). **That is what spends the 200-a-day quota, and there is no
  throttle, no backoff, no retry and no queue anywhere in the code.** The only rate control is the
  change gate deciding not to publish at all.
- **The self-republish has an unexplained corruption bug that is still open.** Three separate reload
  strategies were tried after a save and all three reproduced page corruption, so the page now never
  reloads (`glass.mjs:1196-1209`), and CEO 54 disproved the suspected cause. **A live, un-root-caused
  fault in the mechanism that holds his only copy of his writing** is on its own sufficient reason
  to stop storing his words there.
- **Ranking and picking were never joined.** `chartkeeper.mjs:806-937` scores and sorts; the choice
  of what to work on is a sentence of prose in `.claude/skills/door/SKILL.md:80-81` telling an agent
  to read two files and decide. *RANK is a recommendation, the Door is the policy, and nothing
  connects them* — which is exactly why ranks 1, 2, 3 and 5 went unclaimed for ninety minutes.

---

## PART 1 — THE SHAPE

Three parts, and only three.

### 1. The Store — one live record, reachable from both sides

A **Firebase Realtime Database** holding the whole conversation between Wyatt and the fleet.

Why this one, plainly:

- **A `node` script reaches it over ordinary HTTPS, with no libraries and no build step.** I measured
  it from this machine while writing this: a request to the game's existing database answered in
  **221 ms**. That is the whole reason it works where the artifact does not — a watch started by the
  Bell can write to it, and reading his decisions costs one HTTP GET.
- **A browser page reaches it too, and gets live updates for free** — the page is told the instant
  anything changes, which is what makes "the record changed" and "he sees it" the same event.
- **The project already depends on Firebase** and already permits `*.firebaseio.com` in its network
  policy (`docs/GIT-AND-DEPLOY.md:348`). This adds no new vendor and no new hole to punch.
- **The privacy question becomes one file, changeable in a minute, at any time** — see Part 4.

**Use a NEW Firebase project, not the game's.** The requirements note that a probe found every game
room world-readable. Whether or not that gets fixed, his private working record should not share a
database with a known access problem, and a separate project means a mistake in one cannot reach the
other. *(Measured while writing: an unauthenticated read of an arbitrary path on the game's database
is refused — `401 Permission denied` — so the world-readable finding is path-specific, not
project-wide. It is still the wrong place to put this.)*

### 2. The Page — a window, not a document

**One static HTML file**, served from its own tiny GitHub Pages repository, containing **no content
at all**. Every word on it arrives live from the Store. He opens a URL; he signs in once per device;
he sees the truth.

> **This was considered and rejected once already, and the objection was right at the time.**
> `CHART.md` → `## FATES DECIDED`: *"GitHub Pages was considered and set aside for the private
> interface (public by nature, no write path without glue)."* Both halves of that objection are
> answered here, and neither was answerable before: **the page is public and empty**, so a public
> host does not make his record public; and **the write path is the Store**, which is not glue but
> the same thing everything else reads.

The page is separate from the game's repository, so `rsync --delete` on a game deploy can never
touch it, and — this matters — **it has no `CNAME`, so it makes no claim on any domain.** Rule 14 is
satisfied by construction rather than by remembering.

*(Considered and rejected: Firebase Hosting for the shell — one fewer vendor, but it needs a CLI and
a login token on every machine, where a git push to a repo the fleet already knows how to use needs
nothing new. Rejected: keeping the page an artifact and having it talk to the Store — the artifact
sandbox blocks all outbound network calls, so it is not possible, and that is worth writing down so
nobody re-proposes it.)*

### 3. The Scripts — five small commands, replacing twelve

```
node scripts/glass/next.mjs            # what should this watch take? (JSON, or "store unreachable")
node scripts/glass/claim.mjs <id>      # I am working on this
node scripts/glass/say.mjs …           # something happened / here is a question for him
node scripts/glass/pulse.mjs           # I am alive, this is what I am doing
node scripts/glass/export.mjs          # write the archive copy into git
```

Each is ~40 lines of plain Node using `https`. No dependency, no build step, in the house style.

---

## PART 2 — HOW IT ACTUALLY WORKS

### The data, in full

```
/glass
  /entries/<id>          ← WRITE-ONCE. Words. Never modified, by anyone, ever.
      at        server timestamp
      by        "wyatt" | "<machine>/<watch>"
      kind      said | asked | working | shipped | blocked | note
      text      the words, verbatim, whole
      detail    (optional) the long version
      evidence  (asked only) the measurement, in plain English
      options   (asked only) [{label, whatItMeans, recommended}]
      ref       (optional) commit / file / url

  /answers/<entryId>     ← WRITE-ONCE, AND ONLY HE MAY WRITE IT.
      at, choice, text

  /work/<entryId>        ← mutable, holds no words
      state     open | doing | done | parked
      by, since, reason

  /order                 ← mutable: [entryId, entryId, …]     one writer: the ranker
  /pin                   ← mutable: entryId | null            one writer: Wyatt
  /pulse/<machine>       ← mutable: {at, watch, item}         one writer: that machine
```

**The whole design is in the first two blocks.** Words are immutable and live at one address;
status is mutable and lives at a different one. Nothing that changes ever touches anything he wrote.

### The database itself enforces the promises

The access rules are four lines, and they turn three requirements from process into physics:

```jsonc
"entries": { "$id": { ".write": "!data.exists() && auth != null" } }   // create once; never edit
"answers": { "$id": { ".write": "!data.exists() && auth.uid == WYATT" } }
```

- **E1 / C2 — "never lose or alter his words."** We *cannot*. A second write to an existing entry is
  refused by the server. There is no `force` flag, no override, no path where a bad script or a
  confused session destroys what he typed. Today this is guaranteed by a hook, a stamp, a runbook,
  a gate and a session's discipline; here it is guaranteed by the four words `!data.exists()`.
- **B6 — "never truncated, never paraphrased."** His answer is written by his own browser, verbatim,
  and can never be rewritten. No session stands between his keyboard and the record.
- **B4 / A7 — answering and retiring are one act.** A question renders as *open* if and only if
  `/answers/<id>` does not exist. His tap creates it. There is no window in which the answer exists
  and the question still asks — not a short window, **no window** — because it is one fact.

### What he sees, top to bottom

Five blocks, phone-first, and three of them vanish when they are empty:

1. **A single status line, always.**
   `● Working now: "the guest's sail square can't be tapped on a phone"` — the words of the work, not
   an identifier (A1). Or `○ Nothing is being worked on. Last watch ended 14 minutes ago.` (A2)
   Beside it: `Live` — or, when the connection drops, `Not connected · showing what I last saw at
   8:14 PM` (A3, D7, Q7).

2. **NEEDS YOU** — the unanswered questions, each with the measurement, 2–4 options with one marked
   *recommended*, and a text box that always outranks the buttons (B1, B2). Tap → the card turns
   grey in place and reads `✓ You said: "…"` (B3). **It resolves where it stands rather than
   vanishing** — he sees his own answer land, and it can never come back.

3. **His writing box** — always in the same place, one field, one Send, one *Do this now* toggle
   (C1, C3). No category to choose, no destination to pick. Sending shows `sending…` until the
   *server* confirms, never before.

4. **NEXT UP** — the open work, in the order it will actually be taken, top row marked
   `← the next watch takes this`. Each row carries the one fact that decided its place —
   `you asked for this 40 min ago`, `pinned by you`, `blocks the launch line` (A4).

5. **TODAY** — what shipped, in words a player would recognise (A6). Then the rest of the feed,
   collapsed.

Blocks 2 and 3 are the whole of "decide" and "direct". Blocks 1, 4, 5 are "see". Nothing else is on
the page (D4).

### The eight questions in Part 5, answered directly

**1. What makes "the record changed" and "he sees it" the same event?**
The page holds a live subscription to the Store. There is no publish step, no page artefact, no
regeneration. A write lands and his open page redraws — typically inside a second. He is not looking
at a rendering of the record; he is looking at the record.

**2. What makes his answer and the question's disappearance the same act?**
The question's open-ness is *defined* as the absence of `/answers/<id>`. Creating that document is
the only thing that happens when he answers, and the page's render rule reads the same fact.

**3. Where do his words live such that nothing we do can destroy them?**
At a write-once address in the Store, keyed by an id the server minted, under a rule that refuses a
second write. Plus a downstream copy in git (see Part 5) that is generated *from* the Store and never
read back as authority.

**4. How does an unattended session read his decisions and write progress?**
`node scripts/glass/next.mjs` — a plain HTTPS GET. No special tool, no interactive session, no human
at a keyboard. **This is the single change that dissolves the Glass-update session, the cron
dispatcher, the fresh-subagent-per-tick rule, the nine-step runbook, `GLASS-NOTE.md`, and the
"one publisher" doctrine.** None of them have anything left to solve.

**5. What is a question's identity, such that two similar questions cannot collide?**
The id the Store mints when the question is created — chronologically sortable, unique by
construction, with a random component. Nothing about it derives from the text. Two identical
questions asked in the same millisecond are two different questions, correctly.
*(Today it is a hand-written `<!--qid:…-->` marker with a fallback that slugs the first 40
characters of the question — `chart_model.mjs:173-185`. The fallback still exists because every
past ruling is keyed by it, and the marker only works when a human remembers to type it. A minted id
needs neither the discipline nor the migration: the id is created with the question or the question
does not exist.)*

**6. What decides what is worked on next, and is it the same thing he is looking at?**
`/pin` first, then `/order`. The page renders that list in that order; `next.mjs` returns its first
open, unclaimed row. **They are the same list, read twice.** He can reorder it himself and the next
watch obeys immediately, with no session in between (C3, C5).

**7. How does the page tell him it does not know?**
Three separate honesty signals, each about a different unknown:
   - *Connection*: the Store tells the page when it is disconnected. The page says so and dates what
     it is showing.
   - *Liveness of the work*: if no machine has pulsed for longer than a watch normally takes, the
     status line reads `nothing being worked on` — it never keeps showing the last item as if live.
   - *Missing inputs*: a value the Store does not hold renders as `—  not recorded`, never as zero,
     never as an old number. **No field on this page is ever computed by a human and typed in.**

**8. What does he give up — and is he being asked or told?**
Asked. Part 6 lists it, and the one thing that is genuinely his to decide — whether his working
record may be world-readable — is put to him as a question with a recommendation, not settled here.

---

## PART 3 — WHERE I DISAGREE WITH THE REQUIREMENTS

Four, and I would act on three of them.

**1. "Ordered … with a reason he can overrule" (A4) — keep the ordering, drop the generated
sentence.** The current tool writes a `why-now:` phrase for every row. A generated sentence about
why something is important is a comment, and comments rot exactly the way this project has learned
they rot — the `T-090` incident is precisely this: ten rows carried a sentence, it covered three
unrelated conditions, and he acted on it and was misled. **Show the fact that decided the order, not
a sentence about it**: `pinned by you`, `you asked 40 min ago`, `blocks the launch line`. Four words,
derived, cannot rot, and he can still overrule by dragging.

**2. "A question reaches him with the homework done" (B1) is not something a surface can promise.**
It is a rule about how sessions write, and rules that are prose fail. What the surface *can* do is
**refuse the question**: an `asked` entry without `evidence` and without at least two `options` is
rejected by `say.mjs` before it ever reaches the Store. That converts a habit into construction,
which is the whole point of this exercise.

**3. "🟢 Progress: 6 min ago. 🟢 Updated: 4 min ago." (A3) — the second line stops being true, in a
good way.** With a live subscription, "Updated" is always "now", so printing it teaches him to trust
a number that cannot be wrong and therefore says nothing. The honest second line is **`Live` /
`Not connected`** — the thing that genuinely can be false. His underlying requirement (*tell me the
freshness of the work, not of the page*) is fully met by the first line and better met by replacing
the second. **This is a change to his own stated wording, so it is his to reject.**

**4. "Every idea gets a visible fate within a day" (C4) — I would keep it, and I want to flag a
risk.** It was earned when ideas could genuinely be lost. Once nothing can be lost, a 24-hour clock
starts generating *parked-with-a-reason* entries written to clear a counter. I am not proposing to
drop it — it is his charter and it protects his sense of agency, which he named as the point. I am
saying: watch for the day the fates all start reading "parked — batching with the others", because
that is the ritual arriving.

**And one requirement I would make stronger than written.** D5 says "any session can read from it
and write to it — including an unattended one." I would write it as: **"reading and writing the
Glass must require no special tool and no human at a keyboard."** As written, D5 can be satisfied by
adding more scaffolding to a walled garden. As restated, it can only be satisfied by moving.

---

## PART 4 — THE PRIVACY DECISION, WHICH IS HIS

The requirements are explicit that this gates the design, so it is isolated here and the design is
built so that **either answer works and the answer can change later without a redesign.**

The page is public and empty. What is private is the Store, and that is one rules file:

| His choice | The rule | What it means |
|---|---|---|
| **Private (recommended)** | `auth.uid == <his Google account> \|\| auth.uid == fleet` | He signs in with Google once per device. Nobody else can read a word. A stranger who finds the URL sees an empty page and a sign-in button. |
| Semi-open | `auth != null` for reads | Anyone signed in to Google can read. Easier; I do not recommend it. |
| Open | public read | Becomes a public status page for the game. A real option later, at launch; wrong now. |

**Cost of the recommended option, stated honestly:** he signs in once on the laptop and once on the
phone. If the phone drops the session he signs in again. That is the entire ongoing cost, and it is
the only thing this design asks of him that the current one does not.

**The one-time setup, with him at the keyboard: about 30 minutes.** Create the project, turn on
Google sign-in, paste one config block into the page, sign in once, and put a key file on each
machine (outside the repo, gitignored). The charter already names this class of thing as a risk —
the watchdog needed the same kind of session — so it should be scheduled deliberately rather than
discovered mid-build.

---

## PART 5 — WHAT HAPPENS TO THE RECORD IN GIT

`CHART.md` and `INBOX.md` stop being sources and become **exports**.

On every watch close, `export.mjs` writes `.planning/GLASS-LOG.md` from the Store: append-only, one
block per entry, his words verbatim. It exists so the record is greppable, diffable, and survives
Firebase disappearing. It carries a banner saying it is generated and that nothing may read it as
authority, and a gate fails the build if any script does.

**This is the design's most dangerous part and I want to name it rather than bury it.** A generated
copy in a repo full of authoritative documents is exactly how a second source of truth is born — the
fault this whole document exists to remove. Three guards: it is generated, never edited; it is
one-directional; and a gate enforces that no code path reads it. If those slip, this file becomes
`CHART.md` again in a month.

`CHART.md` gets a banner pointing at the Store, the way `ROADMAP.md` got one. Its 58 open rows are
imported once, titles and all, so nothing is retyped.

---

## PART 6 — WHAT THIS GIVES UP

Stated plainly, because being told is worse than being asked.

1. **He signs in.** Once per device, occasionally again. The current Glass asks nothing.
2. **A 30-minute setup with him, once.**
3. **A new URL.** The old artifact link stops being the place.
4. **A slower loop for changing the page itself** — a git push instead of a republish. Fine for a
   page that rarely changes; annoying on the day we are redesigning it.
5. **One more thing that can be down at read time.** Today: the artifact. Tomorrow: the page host
   *and* the Store. Mitigated — the page keeps its last view in the browser and shows it clearly
   marked stale rather than blank — but it is genuinely two dependencies where there was one.
6. **It still does not tell him anything.** He must still remember to open it. **This is the biggest
   gap in the requirements and in my design**: nothing in Part 2 asks for a nudge, and after five
   questions sitting unanswered for a day, the honest observation is that the surface being perfect
   does not make him look at it. I am not bolting a chat bot on — that would immediately be a second
   thing to keep in step, and "one of everything" is the charter's first principle. **I am flagging
   it as the next design question after this one lands.**
7. **The Glass stops being a place to publish one-off documents.** Reports, comparisons and posed
   pairs stay as artifacts, linked from an entry. The Glass shows the live conversation; it is not a
   document viewer.

---

## PART 7 — WHAT WOULD PROVE THIS WRONG

In order, cheapest and most fatal first. **Run 1 before writing a line of anything else.**

1. **A Bell-started `claude -p` watch cannot make an outbound HTTPS request to `*.firebaseio.com`.**
   *(15 minutes. If true, the entire premise collapses and the answer is a different store, not a
   different page.)* I measured this from an interactive session on the Blade — 221 ms, fine — which
   is **not** the same thing as measuring it from a `-p` watch. Measure the one that matters.
2. **A service-account key cannot be placed on the Razer and the Mac** (policy, or he does not want
   a credential file on disk). Then the fleet's write path needs rethinking.
3. **His iPhone does not keep the sign-in overnight.** Then the page has friction on the device he
   uses to direct, and friction is what killed the last surface's usefulness. Test it across one
   night before building blocks 4 and 5.
4. **Two watches pulsing at the same second produce a wrong "working now".** Red-proof it by running
   two writers deliberately, both directions, before trusting the status line.
5. **He opens it and cannot tell in three seconds what is happening.** Show him a screenshot of the
   status line and the NEEDS YOU block before anything else is built. If that fails, the data model
   is still right and the page is wrong — cheap to fix, but only if we find out early.

---

## PART 8 — SIZE, AND THE SMALLEST USEFUL FIRST VERSION

**Total: about two days of watch-work, and it deletes more than it adds.** Counted, not estimated:

| Goes away entirely | Why it has nothing left to do |
|---|---|
| `glass.mjs` (1,439 lines) | there is no page to generate |
| `glass_needs_publish.mjs`, `glass_gate_log.mjs` | there is no publish to gate |
| `mark_glass_harvest.mjs`, `mark_glass_published.mjs` | there is nothing to stamp |
| `publish_status.mjs` + `status/<machine>.md` | a pulse is a write, not a committed file |
| `GLASS-NOTE.md` and the relay doctrine | every session writes directly |
| `.claude/hooks/glass-harvest-first.cjs` | there is no harvest |
| `GLASS-UPDATE-SESSION.md`, its cron job, its fresh-subagent-per-tick rule, and the hand-started session itself | all of it existed to give a `-p` watch a publisher |
| `glass_calm_check`, `glass_needs_publish_check`, `glass_gate_verdict_logged_check`, `glass_session_thin_check`, `answered_question_retired_check` | five gates guarding mechanisms that no longer exist |

**Survives, changed:** `close_item.mjs` keeps its real job — refusing to close without a CEO verdict
and evidence — and writes `/work/<id>/state` instead of editing three files. `chartkeeper.mjs`'s
`score()` survives as the ranker and writes `/order`; its `--reap` survives as a judgement a session
still makes. `claim_item.mjs` becomes `claim.mjs`.

**Counted with `wc -l`, not estimated: 3,745 lines out.** In: one page (~250), five scripts (~200),
one rules file (~20) — call it **500 in, 3,745 out**. That is the charter's first fear — *it must
delete more than it adds* — met by a factor of seven, and it is the single strongest thing this
design has going for it.

### First version — half a day. This is what I would build and stop.

**The spine only:** the status line, the feed, his writing box, and questions that resolve in place.
No task list, no ordering, no shipped summary, no import, no export.

- One Firebase project, one rules file, one static page (~250 lines), two scripts (`say`, `pulse`).
- **What he gets:** a page that is never stale, that he can write to at any moment, where his words
  cannot be destroyed and an answered question never comes back.
- **How much of the problem that covers:** eight of the ten failings in Part 3 — everything except
  the ordering split (#5) and the "flag that means three things" (#8).
- **What it leaves undone:** he still reads the task list on the old Glass, which keeps running
  beside it, unchanged, exactly as the constraint requires.

### Second — half a day. `/order`, `/pin`, the NEXT UP block, and the Door taking `next.mjs`.
Closes failing #5: the list he reads becomes the list a watch works.

### Third — half a day. Import `CHART.md`'s 58 rows; the git export; the shipped list.

### Fourth — half a day, and only when he says the new one is better. Delete the old machinery.
Until then `glass.mjs` is repointed to render **from the Store**, so the artifact keeps working as a
mirror during the overlap and there is still exactly one record. **Two records running side by side
for a week would be this document's own fault, committed at the moment of avoiding it.**

---

## APPENDIX — THINGS I CONSIDERED AND REJECTED, IN A SENTENCE EACH

- **Keep the artifact, add the `db` capability.** The store is real and would fix his-words-durability
  beautifully — but nothing outside a browser can read it, so an unattended watch stays blind and
  every piece of scaffolding survives. Rejected for that alone.
- **A chat surface (Slack / Telegram / SMS) instead of a page.** Genuinely better at *decide* and
  *direct*, genuinely unable to show a current list, and it would immediately need a page beside it —
  two things to keep in step, on day one.
- **A small server (Cloudflare Worker, Deno Deploy) with its own store.** More flexible, and it could
  push notifications. Rejected because it is a new vendor, a new account and a new thing that can be
  down, to buy something Firebase already gives him and the project already trusts.
- **Git as the store, with the page reading GitHub's API.** Writes from a browser need a token in the
  page. Dead on arrival.
- **Firebase Hosting for the page shell.** One fewer vendor; needs a CLI and a login on every
  machine. GitHub Pages needs nothing new.
- **Keeping the page as its own record, the way it works now.** Not a rejected alternative so much as
  a correction to how it is usually described: the page already *is* the store — every idea he types
  makes the page rewrite its own source and republish itself (`glass.mjs:1180-1194`, `:1367`). It is
  a genuinely clever design and it is the direct cause of three of Part 3's failings: the 200-a-day
  ceiling, the harvest race, and the unexplained corruption that killed reload-after-save. Kept only
  if falsifier 1 in Part 7 comes back negative and there is nowhere else to go.
- **Keeping `LAST-ACTIVITY`-style stamps but writing them more carefully.** `glass.mjs:206` reads a
  file whose writing hook was deleted, while `glass.mjs:174-181` still describes that hook's live
  behaviour as *measured*. That is failing #8 in miniature, and no amount of care fixes a class of
  bug whose whole nature is that the careful version looks identical. **Server timestamps on the
  events themselves are the only version that cannot say something nobody checked.**
