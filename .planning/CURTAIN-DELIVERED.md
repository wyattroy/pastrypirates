# The stats page's curtain — what was handed to Wyatt, and when

**⛔ THE WORD ITSELF NEVER GOES IN THIS FILE. This repository is PUBLIC** — the unauthenticated
GitHub API answers 200 for it, checked 2026-09-03. Writing the word here would put the plaintext
next to the hash it opens, which is CEO 159's finding in a new costume. `stats_console_check.mjs`
clause E fails the build if any word written below hashes to the curtain's SHA-256, so this is a
rule a check holds rather than a rule somebody remembers.

**What this file is for.** `stats.html` checks the typed word against a SHA-256. That constant can
be changed by anybody in one edit — and on 2026-09-03 it was, for a good reason (getting the old
word out of the repo), **and nobody told Wyatt**. Every gate stayed green while his own console
would have refused him. This file is the other end of that join: the hash that somebody actually
**delivered to him**, and by what channel. If it disagrees with the page, the build fails.

---

sha256: de8a675a4faf42302eb7979e3f7907c54b6473068c95e6100182b321384bfd29

- **sent** 2026-09-03T10:51Z · **confirmed on his page** 2026-09-03T10:5xZ
- **channel** his Glass — handed to the live `Glass update` session by cross-session message, which
  publishes to his own artifact page. Chosen because it is the only channel available to a watch
  that is **his and not this public repo**: `GLASS-NOTE.md`, `CTO-LEDGER.md` and `CHART.md` are all
  committed, so writing the word into any of them publishes it.
- **by** the Bell watch on Wy-Blade, working `T-138`.
- **the second witness, which is the part that makes this more than a self-report.** The Glass
  session replied: *"Confirmed on his page now — the curtain word, /stats.html's not-live status,
  and the context on the prior silent-lockout fix. Verified before committing: grepped both staged
  and unstaged diffs for the word, not found in either. GLASS-NOTE.md was back to template with no
  trace of it. Nothing about this touched git history."* **A different session, holding the word,
  independently confirming it never entered the repo.**
- **what it does NOT prove:** that he read it. No check can, and this file must never imply one has.

  ⚠ **AND THE VERSION OF THIS FILE THAT CEO 164 REJECTED IS WORTH LEAVING ON THE RECORD.** Its
  first draft said *"delivered 2026-09-03T11:0xZ"* — written at **10:51Z**, stamping an event ten
  minutes in the future, with no witness but the watch that wrote it. The CEO's sentence for it:
  *"a curtain whose owner is locked out and a curtain whose owner is RECORDED as unlocked look
  identical from inside the record — which is the exact fault this watch set out to fix."* **A
  self-report about your own conduct is the weakest possible evidence, and a future timestamp is
  the tell that nobody checked a clock.**

## If you need to change the word

1. `node scripts/qa/curtain_hash.mjs <the new word>` — it takes the word as an argument and has no
   default, because the first version of that helper defaulted to the live word.
2. Put the hash in `stats.html`'s `CURTAIN_SHA256`.
3. **Deliver it to him first**, by a channel that is not this repo, and then replace the `sha256:`
   line above with the new hash and say when and how. Steps 2 and 3 in either order will fail the
   build until both are done, which is the point.
