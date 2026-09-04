# PREDICTION — 2026-09-04T03:00Z — "which host is this?" is answered in three places

His ask: fix CEO 189 finding 6 — *"`analyticsShouldRun()` in `src/analytics.js:48` is a second
hostname policy sitting beside `devHost()`. Two things kept in step by discipline — rule 23's exact
shape. CEO called it cheapest to fix now."*

## What I have READ (not yet measured)

CEO 189 said **two**. Reading the tree, there are **three**:

| # | where | what it answers | its answer |
|---|---|---|---|
| 1 | `src/shared/index.js:543-544` `devHost()` | is this a developer's machine? | `localhost`, `127.0.0.1`, `0.0.0.0`, `""`, `*.local`, `staging.playpastrypirates.com` |
| 2 | `src/analytics.js:48` `analyticsShouldRun()` | should Google Analytics fire? | `hostname === "playpastrypirates.com"` — **exactly one host** |
| 3 | `src/ui/usage.js:46` | should a usage ping fire? | `playpastrypirates.com` **or `www.playpastrypirates.com`** |

## What I expect, and #3 is the part CEO 189 did not see

1. **2 and 3 DISAGREE about `www.`** — and that is not a stylistic duplication, it is a live
   behavioural split. A visitor on `www.playpastrypirates.com` would be counted by his own usage
   counter and **invisible to Google Analytics**. His whole reason for choosing the cookieless
   configuration was that his own counter already gives him unique visitors; the two numbers
   disagreeing by an unknown margin undermines exactly that trade.
2. **Whichever way it is resolved, it must be resolved once.** Rule 23's design-time question —
   *what makes these two agree?* — currently has the answer "nothing", three ways.
3. **`devHost()` already claims to be the one definition** (`src/shared/index.js:533`, in its own
   words: *"ONE definition"*). So the shape of the fix already exists; analytics and usage simply
   never joined it.

## What I will MEASURE before touching anything

- **Does `www.playpastrypirates.com` actually serve the game?** If it does not resolve, or redirects
  to the apex, then #3's `www` branch is dead code and the disagreement is theoretical.
- **Can `src/analytics.js` import from `src/shared/index.js`** without breaking
  `module_graph_check.js` or the no-build-step ES-module loading on the live pages?

## What would prove me WRONG

- **`www.` does not resolve or 301s to the apex** → the split has no player consequence today; the
  fix is still worth making for rule 23, but I must NOT describe it to him as a live undercount.
- **`analytics.js` cannot import shared** (it is loaded standalone by `about.html` and would pull the
  whole game in) → converging on one exported function is the wrong mechanism, and the honest second
  best is what `analytics_consent_check.mjs` already does for `MEASUREMENT_ID`: two places a GATE
  compares, with the file saying so.
- **A fourth policy exists somewhere I did not grep** → my "three" is as wrong as CEO 189's "two",
  and I should say so plainly, having just miscounted CEO duplicates six-versus-two.

## The trap I am naming

**I have miscounted once already tonight** — I predicted six invisible CEO verdicts and there were
two. So I am now primed to find MORE than the review did, and I have just done that (three, not
two). **That is the same pull.** The count above comes from a grep I will show, not from wanting the
bigger number, and if `www` turns out dead I will report this as a tidy-up rather than a defect.

---

## OUTCOME — measured

**THE FIRST FALSIFIER FIRED, and it is the honest headline.** `curl -L https://www.playpastrypirates.com/`
returns **200 with `final=https://playpastrypirates.com/`** — `www.` 301s to the apex, so by the time
any of this code runs `location.hostname` is already the apex and the `www` branch was unreachable.

**So this is a convergence, NOT the repair of a live undercount, and I am saying so rather than
letting the finding sound bigger than it is.** The three policies genuinely disagreed; the
disagreement had no player consequence today. Had I skipped the measurement I would have reported an
undercount of his own analytics numbers that never happened — which is exactly the class of claim
this project has lost days to.

| # | prediction | verdict |
|---|---|---|
| 1 | 2 and 3 disagree about `www.` | **held** — but dead in practice, see above |
| 2 | it must be resolved once | **held**, and done |
| 3 | `devHost()` already claims to be the one definition | **held** (`src/shared/index.js:533`) |
| — | a FOURTH policy exists | **no** — the grep found three and only three |

**The second falsifier half-fired, and it changed the mechanism.** `src/analytics.js` *can* import,
but `src/shared/index.js` is **756 lines and imports nothing** — a leaf, so pulling it in would not
drag the game onto the About page, yet it would put 756 lines of shared helpers on a page that loads
one small module to answer one question. So the fix is **a new leaf, `src/shared/host.js`**, imported
by all three consumers, rather than everyone importing `shared/index.js`. `devHost()` moved there and
is re-exported under its old name, so every dev flag and `dev_flag_gate_check.js` call exactly what
they called before — verified: all nine `devHost()` host cases still pass.

**The trap I named fired too, in miniature.** I predicted "three, not two" while primed to out-count
the review, having just miscounted six-versus-two. Three was right — but the extra one turned out to
be inert, so the instinct to find more found something real and unimportant. **Worth keeping as the
pattern: being right about the count is not the same as being right about the size.**

**And the gate's first run failed a correct tree** — it flagged `src/analytics.js:44`, a line inside
the block comment explaining why the domain moved. The comment-skip only handled lines *starting*
with `//` or `*`. Comments are now blanked (preserving line numbers) before anything is counted,
which is the same repair the peek-hint gate needed for the same reason: *an instrument that reads
comments is measuring intent, not code.*

**Red-proofed:** appended `location.hostname === "playpastrypirates.com"` to `src/ui/audio.js` — the
sweep failed at `audio.js:374` naming the file and line; removing it restored green. `npm test`
134/134, exit 0. Three public pages loaded in a real browser: all drew, module fetched on each,
`installed=false`, no dataLayer, no Google script, `cookieChars=0`, no page errors.

**⚠ THE SEA TRIAL IS OWED AND IS NOT CLAIMED.** `gear.mjs` reads FULL for this change. Tonight's
trial FAILED — `0 of 10 voyage(s) sailed, 10 NOT RUN`. Nobody may write "trial green" on this build.
