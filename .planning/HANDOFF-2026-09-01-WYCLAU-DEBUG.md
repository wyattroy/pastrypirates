# The wyclau system, 2026-09-01 — what worked, what broke, and where to start

**Written by the Quartermaster (the cloud session) at Wyatt's instruction, after he called the
morning "an absolute mess" and opened a fresh session to debug it. He is right, and this file is
written to be useful rather than exculpatory.**

Everything below is either measured, or explicitly marked as unverified. Where a fault is mine, it
says so — not as penance, but because the *mechanism* by which a session produces a confident wrong
answer is the thing you are here to fix.

---

## 1. THE SYSTEM, IN ONE SCREEN

| part | what it is | where |
|---|---|---|
| **The watchdog** | a Windows scheduled task, every 10 min. Decides whether to launch an engine | `scripts/wyclau/watchdog.ps1` |
| **The Bosun** | the engine: `claude -p "/door ..."` launched by the watchdog on the Razer | — |
| **The Quartermaster** | a cloud session Wyatt talks to; no browser, no PowerShell | — |
| **The keep-working hook** | a Stop hook that refuses to let a session end while Chart work remains | `.claude/hooks/wyclau-stop-keep-working.cjs` |
| **The Glass** | the published status page Wyatt reads | artifact `74034bde-…` |
| **The record** | Chart (plan) · CTO-LEDGER (append-only log) · DECISIONS (his rulings) · CEO-REVIEWS | `.planning/`, `.claude/memory/` |

**Liveness files are gitignored and machine-local**: `HEARTBEAT`, `restarts.log`, `LONG-RUN`,
`LAST-ACTIVITY`, `LAST-PUBLISH` (`.gitignore:77-96`). This is the root of fault F9.

**Seven files are VENDORED from `claude-kit`** — the hook, `watchdog.ps1`, `glass.mjs`,
`wyclau-pulse.cjs`, `mark_glass_published.mjs`, `watchdog.sh`, `door/SKILL.md`. Editing them in this
repo fails `scripts/qa/vendor_check.mjs` and is overwritten on the next vendor run. **`scripts/qa/`
is NOT vendored** — that is why the Quartermaster's work all landed there.

---

## 2. WHAT ACTUALLY WORKS — verified, with the evidence

**These are the parts to keep. Do not redesign them while debugging the rest.**

- **The watchdog's new decision logic is live and correct.** Wyatt's own `restarts.log` for
  2026-09-01 shows it: `hold off: a commit landed 25 min ago (within 45) -- the Chart is moving`,
  and `hold off: long run "sea trial, 10 legs" is progressing (4/10 legs)`. Both branches are the
  chain audit's fixes running in production overnight.
- **Judgement moved out of PowerShell into node helpers** (`should_launch.mjs`, `longrun_status.mjs`,
  `may_publish.mjs`), leaving PowerShell as a shim that runs them and reads an exit code. This is
  what made three untestable fixes testable from any machine. **It is the single best structural
  decision of the last two days — keep it.**
- **Red-gate-first with two hands.** The Quartermaster wrote failing checks; the Bosun made them
  pass. It caught real defects that a self-certifying session would have shipped.
- **CEO review by ADVERSARIAL CONSTRUCTION.** CEO Review 56 did not reason about the gate — it
  **wrote lazy implementations and ran them**, and four checks that looked rigorous passed anyway.
  *This technique is the most valuable thing discovered this week. Use it on every gate.*
- **The ledger works as a graveyard.** One grep killed a wrong theory in seconds (see F6).
- **Per-machine ownership** as the pattern for shared artifacts (`--report=`, `sailed on <machine>`).
  It is the answer to F9 too, and it was already in the repo.

---

## 3. WHAT FAILED — ten faults, each with its mechanism

### F1 · A ruling existed only in a session's head, so a later session repealed it
**Wyatt, 2026-08-31: "I want ONLY the bosun session to have this hook."** It was implemented
(`PP_BOSUN` env stamp) and **never written to `DECISIONS.md`.** A day later the Quartermaster's chain
audit recommended replacing that gate with "is this session working"; Wyatt approved five fixes as a
batch; fix 2 was the repeal. Nothing flagged the contradiction because nothing in the record held the
ruling. **CLAUDE.md §5 already names this exact failure.** *Restored 2026-09-01, commit `b2bbd895`.*
**Mine.**

### F2 · The symptom was misread, and the fix landed on the wrong component
*"When I intervene with bosun, it stops him from being in a loop"* means **the Bosun's loop breaks
when Wyatt interrupts it** — a RESUME problem. It was read as "the session carrying his instruction
should keep working", and the loop was widened to every session. **The fault he reported is still
open.** **Mine.**

### F3 · The widened hook turned a watcher into a worker, and then blocked a conversation
The Quartermaster was started only to check the exit test every 2 hours. Once the hook fired in it,
it could not end a turn — **it blocked seven turns of a live conversation with Wyatt**, including
replies to his direct questions. A never-stop rule in an interactive session takes away his terminal.

### F4 · The hook judges from a STALE WORKING TREE
It blocked on "re-sail crew-desktop" — an item the Bosun had closed and ticked at 05:55Z. The hook
reads `.planning/CHART.md` from the working tree; this session had last run `git fetch`, not
`git pull`. **Measured both ways: blocked before the pull, silent after.** In a system whose premise
is multiple live sessions, its central input is the one file rule 15 says never to trust unfetched.
*Ledger `23860108`.*

### F5 · The hook has no notion of CAPABILITY
It pointed a cloud container at items needing a browser (`trial_honesty_check` exits 1 there). A
container and a laptop are not interchangeable workers. Brake 2 stops a hang after three blocks; it
does not stop the loop. **Open design question.** *Ledger `623f87a5`.*

### F6 · CLAUDE.md itself named a cause the project had already measured dead
The "widen the time horizon" section used the untappable sail square as its worked example and stated
the camera's stage-holds-attention refusal as the settled cause. **The ledger disproved that on
2026-08-29** (18 prompts, real guest: *"the stage reads `-` throughout … NOTHING WAS REFUSED"*) and
nobody reconciled them. The Quartermaster then read the rule, predicted the cause it named, and burned
a pass on a buried theory — the **third** geometry theory to die on this bug. *Corrected `db719e2e`.*

### F7 · An unverified claim was repeated to Wyatt as a finding
The Quartermaster told him **"the Bosun cannot publish the Glass at all"** on the strength of one
commit message. He said he was 99% sure that was wrong. **He was right:** the live page was
regenerated and published at 08:27:50Z and had grown 67.9KB → 100.2KB. One tool call disproved it.
The narrower truth is still interesting and still unexplained — see O2. **Mine, and it is rule 6's
exact failure.**

### F8 · A fix's own contract repeated the fault it was fixing
The `LONG-RUN` marker was specified as *"stalled if `updatedAt` is older than `staleAfterMinutes`"* —
a **freshness** test named as a **progress** test. Wyatt's `restarts.log` shows the cost: five
consecutive hold-offs 10:16Z–10:56Z on `progressing (0/10 legs)` — 51 minutes held off for zero
completed legs. **Fixed in the gate (`db47bb04`): the marker now needs `progressAt`, which moves only
when `progress` increases.** `longrun_status.mjs` still has to honour it. **Mine.**

### F9 · Wyatt is the transport for his own laptop's instruments
`HEARTBEAT` / `restarts.log` / `LONG-RUN` are gitignored, so the only files that answer "is the engine
alive" live on one machine. He had to open the Blade and paste 57 lines into chat. **Design and red
gate written (`4dbce63e`): a tracked per-machine file at `.planning/wyclau/status/<hostname>.md`,
published only when content changes (exit 0) so a quiet night costs nothing (exit 3).** Unbuilt.

### F10 · Instrument accumulation instead of fixes
**Seven sail-square probes across four days; no placement or containment fix visible in the subject
lines of `stage.js`/`flow.js` in that window.** Rule 26 was *earned on this exact bug* and the
response to it has been four more instruments. *Ledger `81450edc`.* Not the Bosun's fault
specifically — it is what the system rewards.

### Also, smaller but real
- **Two sessions on one branch conflict constantly.** Nearly every commit needed a rebase;
  `.planning/CTO-LEDGER.md` and `package.json`'s gate count collided repeatedly. Ledger conflicts
  must be resolved by **keeping both sides** — it is append-only.
- **The CEO cadence fence unstages your files when it rejects a commit.** Re-`git add` before retrying.
- **A `json.dump` round-trip of `package.json` mangles em-dashes.** Edit it surgically, never
  re-serialise.

---

## 4. THE STRUCTURAL DIAGNOSIS — every fault above is one of two shapes

> **SHAPE A — an instrument measures something other than what it names.**
> The timer heartbeat (a clock called liveness). The Glass dot (page age called work age).
> `updatedAt` (freshness called progress). The hook's Chart read (a stale cache called the plan).
> `LAST-ACTIVITY` (a tool call called progress).
>
> **SHAPE B — a decision lived in a context window instead of a file.**
> F1 is the pure case. F6 is its twin: the decision *was* written down, in the rulebook, and then
> disproved somewhere else, and the two were never reconciled.

**If you fix nothing else, fix the two habits underneath:** every instrument states in its own output
what it actually looked at, and every ruling is written to `DECISIONS.md` **in the turn it is made**.

---

## 5. OPEN, AND WHAT IS UNVERIFIED

| | |
|---|---|
| **O1 · Staging is blocked** | `deploy-staging.sh:133` needs `rsync`; git-bash on Windows lacks it. The Bosun correctly refused to swap in `tar`/`robocopy` — the 45-entry exclude list is what keeps `CNAME` out of the staging repo, and getting one pattern wrong takes the live domain down. **Recommendation: install rsync on the Razer.** |
| **O2 · Glass publish capability varies by session** | It published at 08:27Z; a session at 10:11Z reported no Artifact tool. **Unexplained.** Ask the Bosun plainly: absent, or refused? |
| **O3 · The sail square** | Still broken. Best evidence is the Bosun's repeatable reproduction (two rooms, same `[-23,258]`). **Next step is a POSED comparison, not an eighth probe.** |
| **O4 · `PP_BOSUN` propagation was never verified** | Nobody has confirmed `Start-Process` passes it through on the Razer. If it silently does not, F1's fix is inert. |
| **O5 · The exit test** | Bar met — **zero** heartbeat-stale restarts inside the window. **But the engine needed reviving four times in five hours** (06:16, 07:56, 09:36, 11:06Z). "The watchdog worked" ≠ "the engine ran 24 hours". Carry the second number into the cutover call. |
| **O6 · Two red gates are deliberately outside `npm test`** | `npm run test:wyclau-audit` runs both. They are red on purpose. **Do not wire them into `npm test` until green** — a red wyclau gate in the release chain blocks real game fixes (CEO Review 52). |

---

## 6. TRAPS — read before you touch anything

1. **The rulebook has been wrong twice.** Check `git log` on a CLAUDE.md claim before trusting it.
2. **Read the graveyard first.** `git log -S`, and grep the ledger, *before* writing a prediction.
   F6 cost a pass precisely by skipping this.
3. **Vendored files cannot be fixed here.** Edit in `claude-kit` and re-vendor.
4. **`scripts/qa/` is the Quartermaster's lane, vendored files are the Bosun's.** Cross-lane edits
   caused most of the merge pain.
5. **A green gate proves only what it measures.** Build a lazy implementation and try to pass it.

---

## 7. WHERE I WOULD START

1. **Restore `PP_BOSUN`** (F1/F3) — it is Wyatt's standing ruling and it stops the hook eating his
   conversations. Then update the three loop-gate checks in `wyclau_chain_audit_check.mjs`, which
   currently assert the overruled behaviour.
2. **Make the hook read `origin/<branch>`, not the working tree** (F4). One line, removes a whole
   class of false blocks.
3. **Solve the real reported fault** (F2): after answering Wyatt, the Bosun returns to the Chart in
   the same session. That is a resume mechanism, not a hook scope.
4. **Build `publish_status.mjs`** (F9). Six red checks already specify it.
5. **Then stop building instruments and fix the sail square** (F10) with a posed pair.
