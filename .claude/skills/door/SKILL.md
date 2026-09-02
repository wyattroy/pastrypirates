---
name: door
description: The one way into work on this project (wyclau charter, part 2). Use at the START of any session — a Bell-started watch runs one item through the full Proof and ends; any session Wyatt opens becomes the Advisor. Syncs, orients, then works or advises.
---

> **VENDORED FROM claude-kit (`plugins/wyclau`) — edit THERE, not here.** Re-vendor:
> `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by
> `scripts/qa/vendor_check.mjs`.

# The Door

Every session enters here. Orientation budget: **two minutes**. If any step below is impossible,
say what you actually observed and park a question — never guess past it.

**Which mode?** If your launch prompt says the Bell started you as a **watch**, run THE WATCH.
Otherwise a person opened this session: you are THE ADVISOR. There is no third kind of session.

## First, both modes: sync and orient

```bash
git fetch origin && git pull --rebase
```

**Then, BEFORE any work, ask whether this tree can publish at all:**

```bash
node scripts/wyclau/can_push.mjs
```

**Exit 1 means STOP: end the turn, and say why in your reply or the local ledger.** A watch that
cannot push is invisible — its commits reach nobody, its edits still change a shared tree, and a
sailing sea trial may be reading those very files. Earned 2026-09-01: watch 1 on the Razer did
everything right, committed its ledger entry, and the commit landed on no branch because the
checkout was in detached HEAD after a stuck rebase. Nothing reached the branch, and from every
other machine it looked exactly like a watch that never woke. **Working perfectly into a void is
worse than not working**, because it also hides the fault. The script names which of the four
faults it found (detached HEAD, no upstream, rebase in progress, merge in progress) and the repair;
a human does the repair, never an unattended watch.

Run it where you stand — every way into the Door starts in the repo root. Never `cd` to one
machine's absolute path first: the repo lives at a different path on every machine, and a failed
`cd` short-circuits the `&&` chain so the sync silently does nothing — on every ring of the Bell,
forever. If the pull moved `.claude/CLAUDE.md` or `.claude/rules/`, re-read them from disk — your
context copy predates the pull.

Then read, do not re-derive:

1. `.planning/wyclau/INBOX.md` — **Wyatt's words, verbatim. They outrank everything below.**
2. `.planning/CHART.md` — the plan, the checklist, what's blocked on Wyatt.
3. `.claude/memory/DECISIONS.md` — his rulings (top entries; stop when dates look familiar).
4. `.planning/CTO-LEDGER.md` — tail only: what other live sessions or a detached trial have claimed.

**Harvest the Glass before anything republishes it** (the hook enforces this): read the live
artifact (Artifact tool, `action: "read"`, the URL `glass.mjs` prints), copy every idea and every
ruling from its state into the INBOX / `DECISIONS.md`, commit. A republish without the harvest
deletes his words. If this session has no Artifact tool, write that fact to the ledger — plainly,
as "no Artifact tool in this session", never as a guess about why — and continue; the next capable
session harvests.

---

## THE WATCH — one item, full loop, then END

You are one watch in an endless relay. The Bell rings a fresh watch a few minutes after you end,
forever. **Ending your turn is the design working, not a failure** — a watch that tries to work
forever is the failure, and everything that goes with it (context rot, phantom engines, a stale
Glass) died when the relay replaced the long-lived engine (Wyatt's ruling, 2026-09-01).

1. **State the situation** — six lines to the ledger: watch started (UTC) · last progress · what
   the previous watch closed · blocked on Wyatt · any detached trial in flight (read its report,
   check its pid) · what THIS watch will do. Then pulse:
   `node scripts/wyclau/glass.mjs --note "watch <UTC>: <what this watch is taking up>"` — and
   republish + `node scripts/wyclau/mark_glass_published.mjs --version=<id>` (a pulse he cannot see
   is not a pulse). **`--version` is the id the Artifact publish returned, and it is REQUIRED** — a
   bare call exits 1 and writes nothing. **If you have no version id you did not publish, and you
   must not stamp:** a Bell-launched watch has no Artifact tool on some machines and cannot publish
   at all. Write what you wanted shown into `.planning/wyclau/GLASS-NOTE.md` and commit it, for the
   next session that can. Earned 2026-09-01: the stamp used to take no arguments and record a
   publish unconditionally, so a watch that could not publish still marked the Glass as fresh.
2. **Pick ONE item.** INBOX first — the oldest OPEN item; his words outrank the Chart. Otherwise
   the top unblocked Chart item. **Claim it in the ledger before touching anything.**
3. **Work it through the Proof, with the teeth** (his rulings, 2026-09-01, all three):
   - **His stated solution first.** If the item carries `solution:` in his words, your FIRST act
     is to implement and measure exactly that — before any investigation, before any tooling.
     You may disagree only AFTER showing the measured result of his version.
   - **A failed tool means look at the game the way he would** — screenshot it, play it. Never a
     second instrument for the same bug.
   - Otherwise the loop is unchanged: gear → red check first → fix → same check green → posed
     pair or played verification at the gear's depth → fresh-context CEO → verdict appended to
     `.planning/CEO-REVIEWS.md`.
4. **A long job never runs inside your session.** A sea trial is started detached —
   `node scripts/wyclau/start_trial_detached.mjs` — and belongs to the machine, not to you. Start
   it, note it in the ledger, and END; later watches read its report. Three trials died in one day
   riding sessions that ended. Never again.
   **⚠ AND COMMIT BEFORE YOU END — this is not optional and it is not the close gate.** Starting a
   long job is not "closing an item", so step 5's gate never runs for it, and on 2026-09-01 that
   meant watch 1 started a real trial and pushed NOTHING: no claim, no status file. From outside,
   a watch doing real work looked identical to a watch that never woke — the exact blindness this
   relay exists to remove. So: write the claim and what you started to `.planning/CTO-LEDGER.md`,
   run `node scripts/wyclau/publish_status.mjs`, update the INBOX item to IN FLIGHT with the
   marker's own numbers, `git pull --rebase`, commit, PUSH — and only then end. The same applies
   to any turn that ends without closing an item: **a watch that pushes nothing is invisible, and
   an invisible watch is indistinguishable from a dead one.**
5. **Close ONLY through the gate:** `node scripts/wyclau/close_item.mjs …`. It refuses to tick the
   item without a CEO verdict on file, a game-code diff or a stated one-line reason, and the
   solution-first evidence. Do not tick the Chart or the INBOX by hand — the gate writes the tick,
   the ledger entry, and the INBOX fate together, so they cannot disagree.
6a. **RE-PRIORITISE THE CHART BEFORE YOU PUBLISH IT:**
   `node scripts/wyclau/chartkeeper.mjs --rank --write`. It orders the open list so the
   next-to-be-completed is at the top and gives every row a `why-now:` phrase Wyatt can overrule.
   **It never ticks a box** — closing stays yours, behind `close_item.mjs`. Include `CHART.md` in
   the commit you were already making.
   **NOT `--sweep`:** its current form is the seven-day-with-a-stub version he OVERRULED (every
   completed row leaves immediately, no stub), and sweeping today would zero the done count on his
   page before that count is re-sourced from `CHART-LOG.md`. That is kit patch 6.
   **WHY THIS LINE EXISTS, because it is the whole story of 2026-09-02:** he asked for the Chart to
   re-prioritise itself **four times**. The tool was built, gated and green — and this line was
   missing, so it ran only when a human typed it. His top ask sat at **31 of 39** and kept sinking.
   The reason the line was missing is that this file was VENDORED and no watch was allowed to edit
   it; his ruling inverted that (the project owns its copy), and this is the first edit under it.
   **A capability nothing invokes is a capability that never runs.**
6. **Republish the Glass** (harvest first — always), `mark_glass_published.mjs --version=<id>`, then
   `node scripts/wyclau/publish_status.mjs` — exit 0 means this machine's instruments changed:
   include `.planning/wyclau/status/` in your commit so no machine's log ever needs Wyatt as its
   transport. Commit (`git pull --rebase` first), push.
7. **END THE TURN.** One item per watch. Blocked mid-item? Park it in the Chart with the reason,
   note it in the ledger, and end — the next watch sees it in orientation. Nothing unblocked at
   all? Write that to the ledger, pulse the Glass, and end. Never wait, never spin, never take a
   second item.

## THE ADVISOR — Wyatt's window

A person opened this session, so this session's job is HIM: strategy, second opinions, questions
answered from the record, and the work he directly asks for. No Stop hooks apply to you; end turns
whenever the conversation does.

- **Every instruction he gives lands in `.planning/wyclau/INBOX.md` verbatim, in the same turn he
  gives it** — timestamped, with `solution:` filled in if he stated one — committed and pushed,
  and restated back to him in your next reply. This is the fix for the failure he named on
  2026-09-01 ("the quartermaster sometimes forgot my instructions"): his words move to a file the
  moment they exist, and the next watch obeys the file. An instruction he wants done RIGHT NOW you
  also just do — the INBOX entry is the record, not a queue you hide behind.
- **Every ruling he makes lands in `.claude/memory/DECISIONS.md` in the same turn**, quoted, with
  the alternative he did not pick.
- **Teach as you go** — plain English first, the real term once, one short lesson a day tied to
  the live work (his amendment, 2026-08-31: daily, because he learns fast).
- Taste is never defaulted: park taste questions to the Chart's BLOCKED ON WYATT table with a
  recommendation — or ask him, he is right there.
- If he asks you to do game work, it goes through the same Proof as a watch's (gear, red first,
  CEO per item, close through the gate).

## Close (both modes)

One short report in his ruled shape — **WHAT WORKED · WHAT I LEARNED (and where it is written) ·
WHAT'S NEXT** — new information only, one daily lesson if none has been given today. Kill every
browser and server you started. Never end on an offer.
