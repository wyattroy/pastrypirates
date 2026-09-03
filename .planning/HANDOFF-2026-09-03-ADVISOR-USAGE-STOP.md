# HANDOFF — Advisor session stopped for usage, 2026-09-03

**Written at Wyatt's instruction**, verbatim: *"we're running out of usage. i need to stop your work,
and start you on a different model with smaller context. write a handoff file."* And in the same
breath: *"we also need to start having the Watch use a different model setting -- what is it
currently using?"*

**Branch:** `claude/cloud-handoff-planning-a9ay1u` — in sync with origin (0 ahead, 0 behind at the
time of writing). **Not `main`.** Nothing here has reached real players.

---

## ⛔ READ THIS FIRST: THE WATCH IS BURNING OPUS 5, AND NOBODY CHOSE THAT

**Measured, not assumed.** `scripts/wyclau/bell.ps1:122` launches every watch as:

```powershell
Start-Process -FilePath "claude" -WorkingDirectory $Repo -ArgumentList (
  @("-p", "`"$doorPrompt`"") + $kitArgs
)
```

**There is no `--model` flag anywhere in it.** So each watch inherits the CLI default, and the
default is set one place: `C:\Users\wyatt\.claude\settings.json`, line 2 —

```json
"model": "claude-opus-5",
```

`ANTHROPIC_MODEL` is unset; neither `.claude/settings.json` nor `.claude/settings.local.json` in the
repo names a model. **So the answer to his question is: the Watch is running Opus 5, the most
expensive model, unattended, every fifteen minutes, around the clock.** It fell out of a launch line
that carries no model flag — the same shape of accident as the `--add-dir` fence the Bell's own
comments describe. Nobody decided it.

### The fix, and why it is one line and not the settings file

**Do NOT change `~/.claude/settings.json`.** That key is also what Wyatt's own interactive sessions
inherit — downgrading it would quietly downgrade him while he works. The Watch is what should be
cheap, not him.

Add `--model` to the Bell's argument list only:

```powershell
@("-p", "`"$doorPrompt`"", "--model", "claude-sonnet-5") + $kitArgs
```

**The model is HIS pick and it is not made yet** — it is a cost-versus-quality call, which is taste,
and taste is never defaulted. My recommendation is **Sonnet 5**: a watch works one small item through
a written loop with the Proof and a fresh-context CEO checking it afterwards, which is exactly the
shape of work that does not need the expensive model. Ask him in the question UI, one question, and
put his answer in `.claude/memory/DECISIONS.md` before editing the file.

**When you make the edit, gate it.** `scripts/wyclau/bell.ps1` has a `-DryRun` path that prints the
real argument list precisely so a check can read it (see its comment about paraphrases). A gate that
asserts the launch line carries an explicit `--model` is worth having, because the whole fault here
is a flag that was never there and nothing ever said so.

---

## WHAT IS UNCOMMITTED IN THE TREE RIGHT NOW

**The tree is shared — at least one peer session is live in it.** Sort mine from theirs before you
commit anything, and never `git add -A`.

### Mine, finished, verified, and NOT yet committed

His ruling on the front-card copy (question UI, 2026-09-03): **"Short line, and the detail on
About."**

| file | what |
|---|---|
| `index.html:2767` | front card now reads *"We record anonymised play and visit data. No cookies are set. [More on the About page]."* — replaces a sentence that said nothing beyond a name is collected, which stops being true the moment GA is on that page |
| `about.html` | new `#privacy` card, **"What we record"**, before Credits. **In his own plain voice, NOT pirate speak** — About sits outside the game world (rule 12). There is a comment in the markup saying so, because a retroactive audit once "fixed" the credits into pirate voice when the shipped text was right |
| `.claude/memory/DECISIONS.md` | the ruling, quoted, with the two options he declined |
| `scripts/qa/_t206_analytics_shots.mjs` | extended to navigate to `about.html#privacy`, assert the anchor actually brings the card on screen, and photograph it |
| `.planning/posed/t206-index.png`, `t206-about.png`, `t206-about-privacy.png` | rule 19 evidence, all three read pixel by pixel before I stopped |

**Evidence, already gathered:** all three public pages drew; `src/analytics.js` was fetched on each;
`installed=false`, `dataLayer=null`, zero googletagmanager scripts, `cookieChars=0`, no page errors —
i.e. **analytics correctly does not fire off the live domain**, so a sea trial can never be counted
as players. The `#privacy` card renders at 316px with both bullets. `npm test` was exit 0 before the
peer's in-flight gate 131 landed in the tree.

**A commit message for it was written and Wyatt interrupted before it ran.** Re-write it; do not
hunt for the old one.

### A peer's, in flight, DO NOT TOUCH

`package.json` (gates 130 → 131), `scripts/qa/analytics_consent_check.mjs`,
`scripts/qa/_t206_gate_redproof.mjs`, `.planning/SEA-TRIAL-2026-09-03T2031Z-Wy-Blade.md`,
`.planning/posed/t076-*.png`, `.planning/posed/totop-phone-*.png`, and the `scratchpad/` and
`scripts/qa/_t102_*` files. That peer is building the **red proof for gate 130** — the only thing in
the suite that checks a gate can still fail. Leave it alone; commit your paths by name.

---

## WHAT IS OWED, IN PRIORITY ORDER

1. **The Watch's model** — above. His pick, then one line, then a gate.
2. **Commit the copy work** (paths listed above), then spawn a **fresh-context CEO on the copy item**
   — rule 25, CEO after every item, and this item has not had one.
3. **CEO 189's standing precondition, and it must not be dropped:** in its own words —
   *"**Raising it was right, not blocking.** Nothing has shipped — production is analytics-free
   tonight and staging can't fire. The copy is his. But it must stay a hard precondition on the merge
   to `main`, not a task."* **So: analytics must not reach production until this copy ships with it.**
   Once the copy is committed the precondition is satisfied, but the merge is still Wyatt's call.
4. **CEO 189 finding 6, still open:** `analyticsShouldRun()` in `src/analytics.js:48` is a second
   hostname policy sitting beside `devHost()` (`scripts/qa/dev_flag_gate_check.js:48-52`). Two things
   kept in step by discipline — rule 23's exact shape. CEO called it "cheapest to fix now".
5. **The FULL sea trial on the analytics change is OWED, not skipped.** `gear.mjs` returns FULL. A
   trial was already at sea (8/10 legs) when the change landed, so a second would have fought it for
   browsers and for the report file. It is recorded as a debt, not as done. **Do not let anyone write
   "trial green" until one has actually sailed on this build.**
6. **His three other rulings are unbuilt** — all harvested from the Glass 2026-09-03, all in
   `DECISIONS.md`:
   - **T-216, Best Baker tiebreak** — *"Change the game to match the page — record the day each
     captain lights their ovens and rank on it."* **This is real game work and the only game-facing
     one of the three.** It touches end-of-voyage ranking, so it is a FULL-gear change.
   - **T-220, shallow trial** — *"Let a depth you chose come back green when its own checks pass."*
   - **T-245** — every Chart row moveable as a *property*, not a snapshot.

---

## THINGS THAT WILL BITE YOU IF NOBODY SAYS THEM

- **`git pull --rebase` fails on peers' unstaged files in this tree.** Use
  `git -c rebase.autoStash=true pull --rebase`.
- **`rules.html` is GENERATED** from `scripts/lib/rules_page.mjs` via `scripts/build_rules_page.mjs`.
  Hand-edit it and a drift gate fails the build. Edit the generator, then regenerate.
- **The CEO cadence hook can block a commit.** Its own message tells you to retry if the item is
  genuinely mid-flight; that works.
- **`pkill`/`pgrep` do not exist in Git Bash on this machine.** Rule 17's tidy-up is
  `node scripts/qa/stray_probe_check.mjs`, which says what it actually saw instead of printing an
  all-clear on a blind look. 183 abandoned Chrome processes holding 15 GB were found on this laptop
  on 2026-09-02 by exactly that blindness.
- **Staging is current:** `2026.09.03.4-staging@a72f2f12`, verified on the wire. Production has no
  analytics on it at all.

---

## THE ONE THING TO CARRY OVER ABOVE ALL

He is out of usage because an unattended relay has been running the most expensive model for days,
and the reason is a missing flag that nothing ever reported. **That is this project's own recurring
fault wearing new clothes** — an instrument, or in this case a launcher, silently doing something
other than what everyone assumed, with no signal that it was. Fix the flag; then make something say
so out loud if it ever goes missing again.

**Written by the Advisor session, 2026-09-03. Nothing in this file is a prediction — every claim in
it was read off the tree or a command's output at the time of writing.**
