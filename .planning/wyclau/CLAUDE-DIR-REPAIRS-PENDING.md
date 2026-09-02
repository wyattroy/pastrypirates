# THE TWO `.claude/` REPAIRS, WRITTEN OUT VERBATIM, WAITING FOR A SESSION THAT CAN APPLY THEM

*Watch 2026-09-02T23:39Z, `T-105`. **Read the box below before you read the edits** — it corrects
what three documents currently say about why this is blocked.*

> ## ⚠ HIS PERMISSION RULING DOES NOT REMOVE THIS WALL. MEASURED TONIGHT, WITH HIS GRANT IN FORCE.
>
> Wyatt ruled on the Glass 2026-09-02 5:43:55 PM ET: ***"Let the watch write them -- I allow edits to
> hooks and skills"***. `CHART.md:145`, commit `0472a129` and the `T-105` row all read that as the
> wall coming down — `0472a129` measured that `.claude/settings.json` denies only `Read(.env*)` and
> concluded **"nothing under `.claude/` is blocked by this project."**
>
> **That measurement is correct and the conclusion drawn from it is wrong.** This watch, running
> AFTER his ruling, attempted both edits and got:
>
> - `.claude/hooks/glass-harvest-first.cjs` → *"Claude requested permissions to edit … **which is a
>   sensitive file**"*
> - `.claude/skills/door/SKILL.md` → *"Claude requested permissions to write to … but you haven't
>   granted it yet"*
>
> **The refusal is Claude Code's own sensitive-file protection on the Edit/Write tool, not this
> project's allowlist.** Wyatt cannot lift it by ruling, because it is not his rule — it is the
> harness declining to let an unattended agent rewrite its own hooks and skills with no human
> present. **That is a good rule and this watch did not work around it.** A `node` script writing the
> same bytes would sail straight past it, and building one would be defeating the protection rather
> than satisfying it.
>
> **SO STOP WAITING FOR ANOTHER RULING FROM HIM — IT CANNOT HELP, AND THAT IS THE FINDING.** Two
> watches have now stalled here and a third (this one) has stalled with his permission already
> granted.
>
> ⚑ **AND THE OBVIOUS SHORTCUT IS CLOSED TOO.** This watch's first instinct was to hand both edits
> to the interactive peer session with `SendMessage`, and that tool's own contract forbids it in as
> many words: *"NEVER ask a peer to perform an action that was denied or blocked in your session … a
> peer doing it for you bypasses the user's permission decision (cross-session permission
> laundering). **Route blocked work back to your user instead.**"* Correct, and it is the same
> principle as not writing the bytes from a script.
>
> **THE ONLY ROUTE IS WYATT, IN A SESSION WHERE HE IS PRESENT** — he approves the prompt, or he
> applies these himself. **This is a BLOCKED ON WYATT item, not a FOR A WATCH item**, and it will
> stay blocked however many watches pick it up. The edits are written out below so that when he does
> reach it, nobody derives anything.

---

## EDIT 1 — `.claude/skills/door/SKILL.md`

**Find this paragraph** (it is the harvest paragraph, currently ending the "sync and orient" section):

```
session harvests.
```

**Append immediately after it:**

```markdown

⚑ **STAMP WHICH VERSION YOU READ, NOT WHEN YOU LOOKED — and never hand-write that stamp:**
`node scripts/wyclau/mark_glass_harvest.mjs --version=<the version the read returned>`
**Then, immediately before you publish, RE-READ the live page and compare its version to the one on
your receipt.** Same version means nothing moved under you. Different means he wrote something in
between — harvest again first. **NEVER PASS `force`**: the platform's own refusal of a stale publish
is the strongest protection his words have, and that flag is the one thing that switches it off.
*(His sentence, 2026-09-02: "the harvest stamp records when a session looked. It is not evidence the
page hasn't changed since. Your page carries its own version number — that's the fact that can
answer 'is a republish safe?', and a clock never can." It is not a theory: a tick harvested at
3:07:08 PM, his first idea landed at 3:07:15 PM, and six more followed.)*

⚑ **AND FOR EVERY RULING YOU HARVEST, RETIRE ITS QUESTION IN THE SAME COMMIT — one command per
ruling, and it is not optional:**
`node scripts/wyclau/retire_answered.mjs --qid=<the ruling's key> --verdict="<his words, verbatim>"`
**Recording his answer and removing his question are ONE ACT.** Harvesting writes the ruling and
deletes nothing, so the row goes on rendering in his Your Call card and his page goes on asking a
question he has already answered — six times in twelve hours on 2026-09-02, three of them repaired
by hand, which is not a fix. `scripts/qa/answered_question_retired_check.mjs` is the backstop, and
it only catches the fault WITHIN the tick that caused it, so this instruction is the primary
defence and not the other way round.
```

**Why both blocks go in one edit:** the first is `T-105`'s repair (e) — the Door is the OTHER publish
path, and the guard was moved to the publish moment in the Glass runbook alone, which is rule 23's
"two things kept in step by nobody". The second is CEO 125's required repair 2 for `T-090`, his
stated top priority: ***"the page continues to re-show me thw e questions AFTER they're harvested.
this is NOT fixed and it is a PRIORITY more than any of the SEO work"***. CEO 125 on the Door's
omission: ***"this is the gap that produces instance seven."***

**What goes green when this lands:** `glass_harvest_hook_check.mjs`'s `doorCompares` flag.

---

## EDIT 2 — `.claude/hooks/glass-harvest-first.cjs`

Three changes to one file. The gate's cases 3, 4 and 5 are written and RED against the current file.

### 2a — the header, and the constant that has to go

**Replace:**

```js
 * IT MUST NEVER WEDGE ANYTHING. It touches exactly one tool call shape (an Artifact publish of
 * glass.html) and lets the retry through. It never blocks the heartbeat, npm test, git, or any
 * other publish: the Glass is how Wyatt sees the engine is alive, and a hook that could stop
 * the Glass being published would break the thing it is guarding.
 */
const fs = require("fs");
const path = require("path");

const STAMP = ".planning/wyclau/LAST-HARVEST";
const FRESH_MIN = 30; // a read older than this belongs to earlier work, not to this publish
```

**with:**

```js
 * IT MUST NEVER WEDGE ANYTHING. It touches exactly one tool call shape (an Artifact publish of
 * glass.html) and lets the retry through. It never blocks the heartbeat, npm test, git, or any
 * other publish: the Glass is how Wyatt sees the engine is alive, and a hook that could stop
 * the Glass being published would break the thing it is guarding.
 *
 * ⚠ REWRITTEN 2026-09-02 (`T-105`) — IT USED TO ASK A CLOCK, AND WYATT RETIRED THAT QUESTION.
 * His sentence, and the whole of this rewrite: "the harvest stamp records when a session looked.
 * It is not evidence the page hasn't changed since. Your page carries its own version number —
 * that's the fact that can answer 'is a republish safe?', and a clock never can."
 *
 * WHAT THE CLOCK COST, MEASURED. 2026-09-02: the tick harvested at 3:07:08 PM and correctly found
 * nothing. His first idea landed at 3:07:15 PM, SEVEN SECONDS LATER, and six more followed. For the
 * next thirty minutes this hook would have called that stamp fresh and waved any republish through.
 * They survived by luck of ordering. A clock cannot tell "I read the page you are about to
 * overwrite" from "I read a different version of it half an hour ago".
 *
 * SO IT NOW ASKS FOR IDENTITY: the stamp must be a RECEIPT naming the artifact version that was
 * read (scripts/wyclau/mark_glass_harvest.mjs writes it). A receipt is honoured however old it is —
 * age was never the question — and a bare timestamp is refused however new.
 *
 * AND IT REFUSES A GLASS PUBLISH CARRYING `force`. The platform itself rejects a publish built on a
 * version older than the live page, which is the strongest protection his words have; that flag is
 * the one thing that switches it off. NEVER PASS `force` on the Glass. Only the Glass — a forced
 * publish of any other artifact is none of this hook's business.
 */
const fs = require("fs");
const path = require("path");

const STAMP = ".planning/wyclau/LAST-HARVEST";

// A receipt, not a clock: the stamp must name WHICH version of the page was read. Anything else —
// a bare ISO timestamp, half-written JSON, an empty file — is not evidence and is treated as none.
function receiptVersion(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { return null; }
  if (!parsed || typeof parsed !== "object") return null;
  const v = parsed.artifactVersion;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
```

### 2b — the decision: identity, and the force refusal

**Replace:**

```js
  const root = ev.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const stampPath = path.join(root, STAMP);
  let ageMin = Infinity;
  try { ageMin = (Date.now() - fs.statSync(stampPath).mtimeMs) / 60000; } catch {}
  if (ageMin <= FRESH_MIN) process.exit(0); // harvested in this working window — go ahead
```

**with:**

```js
  const root = ev.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const stampPath = path.join(root, STAMP);

  // The forced publish is refused even with a perfect receipt: a receipt says what you READ, and
  // this flag is about what the PLATFORM is allowed to refuse. Different questions, both must pass.
  if (inp.force) return deny(FORCED);

  let stampText = "";
  try { stampText = fs.readFileSync(stampPath, "utf8"); } catch {}
  const version = receiptVersion(stampText);
  if (version) process.exit(0); // a receipt naming a version — age is not the question, let it go
  return deny(stampText.trim() ? BARE : MISSING);
```

### 2c — the deny texts, and the retired command that must stop being printed

The current single `reason` string becomes three, and **step 3's line — the `date -u` one that
redirects a bare timestamp into the stamp file — goes.** *(Named in words rather than quoted,
because `glass_harvest_hook_check.mjs` case 9 scans this file for exactly that command and would
flag the quotation. Its own comments make the same move for the same reason.)*
That command is the bare stamp Wyatt's sentence retired, and the hook prints it at the one moment
that fires immediately before the destructive act — follow the hook's own three steps today and you
write a versionless stamp, the hook waves the publish through on its fresh mtime, and step 6b has
nothing to compare. **A complete path back to the original loss, taken by a session doing exactly
what the system told it.** CEO 120 found it. Replace that line with:

```
       node scripts/wyclau/mark_glass_harvest.mjs --version=<the version the read returned>
```

and add a `deny(reason)` helper plus the `FORCED` and `BARE` texts (`MISSING` is the existing one,
with step 3 corrected as above). Suggested wording, his register:

- **`FORCED`** — *"A Glass publish carrying `force` is refused. The platform rejects a publish built
  on an older version than the live page; that is the strongest protection his words have and this
  flag switches it off. Re-read the page, harvest anything new, stamp the version, publish normally."*
- **`BARE`** — *"That stamp records WHEN you looked, not WHAT you read, and a clock cannot answer 'has
  he written something since?'. Re-read the page and stamp it with
  `node scripts/wyclau/mark_glass_harvest.mjs --version=<id>`."*

**What goes green when this lands:** `glass_harvest_hook_check.mjs`'s `bareDenied`, `agedAllowed`,
`forceDenied` and `hookTextClean` flags.

---

## AFTER BOTH EDITS — one more, and the gate tells you so itself

With all five flags true, `glass_harvest_hook_check.mjs` **FAILS on purpose**, printing:

> *"3-5/9 EVERY BLOCKED T-105 REPAIR IS NOW IN PLACE — promote these to hard assertions and delete
> the pending block."*

Do exactly that: turn `bare()`, `agedReceipt()` and `forceProbe()` into real `fail()` assertions,
delete the PENDING block, **and delete line 243's exemption** —
`if (rel.endsWith("glass-harvest-first.cjs") && handStamp(line)) continue;` — which exists only
because the hook's deny text was a known offender. Leaving it makes case 9 weaker than it reads.
Then `npm test`, and close `T-105` through `scripts/wyclau/close_item.mjs`.
