# Rebuilding the sea trial to finish in 20–30 minutes

**Wyatt, 2026-08-30, ~02:15Z:** *"Build your full new sea trial with all proposed ideas tonight in
the next eight hours."* Branch: `claude/sea-trial-performance-0xfrkj`, merged from
`claude/cloud-handoff-planning-a9ay1u` (build `2026.08.30.2`) so this is built on the CURRENT trial,
not on `main`, which is three days behind and still carries the deleted `4/` tree.

**His stated value, which outranks the clock:** *"Judge is important because everything must be seen
visually, or else you don't catch your own code errors."* **No structure below may reduce what is
looked at. Speed comes from removing dead time and from batching, never from seeing less.**

---

## THE MEASUREMENTS THIS IS BUILT ON — taken 2026-08-30, this container, 4 cores, idle

| what | measured |
|---|---|
| `npm test` | 4.2 s |
| a game day | ~45 s solo, ~52 s crew |
| **crew-desktop, alone, to END OF VOYAGE (day 18)** | **938 s — 15.7 min** |
| contact sheet, in-leg, same run | **123 s, then ABANDONED at its 2-min cap — produced nothing** |
| crew-desktop leg total | 1066 s — 17.8 min |
| screens captured, that leg | 55 settled (112 files, 273 MB) |
| **CPU for that ONE leg** | **load 2.75 of 4 cores** |
| judge, one screen, one `claude -p` | **$0.049, 8.7 s** (another took 42.6 s) |
| **judge, five screens, one call** | **$0.103, 31.3 s** |
| judge red-proof: planted broken layout | **FAIL**, named overlap + clipping + dead space |
| judge red-proof: same planted image hidden among 4 real ones | **FAIL — still caught** |

### Two corrections to the record, made before building on them

1. **crew-desktop is NOT a 40-minute leg.** The 40 in `docs/CLOUD-VS-LOCAL.md` was a contended Mac
   sharing itself with two Claude sessions; that document says so in its own warning and an earlier
   version of this plan quoted the number past the warning. **The real floor is ~16 min**, which is
   the only reason 20–30 min is reachable at all.
2. **The vision judge is not broken.** The `2026.08.29.2` failure had a known environmental cause
   (the container's CA bundle rotated at 18:27, mid-run). Verified working here tonight, and
   red-proofed twice.

### The blind spot that matters more than any of it

`JUDGE_CAP = 30` (`scripts/playtest_gate.mjs`). **The judge only ever sees the first 30 distinct
screens of a leg**, and the report prints no denominator. One recorded run: **349 captured, 267
judged, 82 never looked at** — with crew-desktop at *60 captured, 30 judged, all 30 PASS*, reading
clean while half of it was never opened. Given his value above, **this is the defect, and batching
is what makes closing it affordable.**

---

## WHAT IS BEING BUILT — three structures, one trial

**A · THE FLEET** — everything today's trial does, in ~20–25 min. Legs only play, capture and
structural-check. Judging becomes one service that batches 5 screens per call and runs *while* the
voyages sail. Contact sheets render once, at the end. Wall clock = longest leg + a short tail.
Gives up nothing. Costs cores: ten legs is twelve browsers, ~16 cores to run unthrottled; this box
has 4, so the leg concurrency must be derived from `os.cpus()`, never typed (rule 9).

**B · THE CATALOGUE** — a new gear, 8–12 min, runnable on every change. Pose the screens
(`DRIVING-THE-GAME.md` §5e) instead of sailing 18 days to reach them. Gives up: dead buttons, the
coverage ledger, everything that only breaks *between* screens, and multiplayer (injection is
unsafe there by rule) — so one short real crew leg stays. **A different subject, not a smaller
trial**, and its report must say so in its own NOT-LOOKED-AT column.

**C · MATCHED PAIRS** — the crew leg rebuilt around one shutter, two cameras. Today's crew shots are
indexed per seat, so host `014` and guest `014` are different moments: **the trial cannot show a
host/guest divergence in pictures, by construction** — the fault he cares most about. Capture both
seats on a shared trigger; hand the judge the PAIR with his own question, *do these two show the
same game?*

## ORDER OF WORK, and why this order

1. **Contact sheet out of the leg** — measured 2 min/leg for nothing. Free minutes, zero risk.
2. **Batch the judge (5/call) and LIFT `JUDGE_CAP`** — the blind spot, closed, and cheaper than today.
   Report prints `judged N of M` from here on.
3. **Pipeline judging alongside the voyages** (A).
4. **Matched-pair crew capture** (C).
5. **The Catalogue gear** (B).
6. **Sail it end to end**, put the real numbers in the report, run CEO on it before he sees it.

## STANDING RULES FOR THIS BUILD

- **Every step: show it broken, change it, show that same check passing, sweep.** No step is done on
  reasoning alone.
- **A prediction goes in writing BEFORE each measurement**, with what would prove it wrong.
- **Hold this session active during any trial run.** Two runs died on 2026-08-29 at 933 s and 246 s
  while the session went idle; attempt 3 survived on a polling loop. Hypothesis, not established —
  but cheap to respect.
- **Never `pkill -f chromium` in this container** — the shell wrapper matches and it kills the
  session. Kill by debug port.
- **Do not touch game code.** This is the instrument, not the game. If a game bug is found, it is
  written down, not fixed here.
