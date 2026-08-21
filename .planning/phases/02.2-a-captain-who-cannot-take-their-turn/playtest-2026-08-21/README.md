# Playtest gate — full run, 2026-08-21 (build 2026-08-21f)

All four legs played a COMPLETE voyage to the end-of-voyage card:
  solo-desktop  end of voyage, day 17
  solo-phone    end of voyage, day 15
  passplay-phone end of voyage, day 14
  crew-desktop  end of voyage, day 15 — HOST AND GUEST BOTH (test1 / test2, room KHGF)

Structural rules (the six universal checks): 4 failures across ~60 days of play.
Vision judge: 53 screens failed. THE DISTRIBUTION IS THE FINDING —
  solo-phone      19
  passplay-phone  21   <- 40 of 53 are PHONE
  solo-desktop     5
  crew-desktop     4

By theme: 33 clipped at a screen edge, 21 overlapping/obscured, 8 empty dead space.

READ THIS AS: the desktop layout work of 2026-08-21 landed — desktop and crew are now
the quiet legs. The PHONE has the same class of problems desktop had this morning, and
nobody has done for it what was done for desktop. That is the next body of work, and it
is well evidenced: every line in judge-findings.txt names a screenshot in this folder's
contact sheets.

THE CONTACT SHEETS WERE BROKEN AND HAVE BEEN DELETED. They were screenshots of a 404 page —
all four byte-identical — because the sheet's HTML was written into this folder while the web
server serving it was rooted at the repo. They were committed as evidence and pointed at in a
handoff without anyone opening one, which is the same failure the gate exists to prevent, one
level up. `4/scripts/contact_sheet.mjs` now serves the folder it builds from AND refuses to
claim success unless every image actually rendered.

WHAT TO USE INSTEAD:
  judge-findings.txt — all 53 findings in the vision judge's own words, each naming the exact
                       screenshot it came from. THIS IS THE WORK QUEUE.
  gate-log.txt       — the full run, including the four structural failures.

To see the screens themselves, re-run the gate — it takes ~45 minutes unattended and writes
its own screenshots:
  node 4/scripts/playtest_gate.mjs --out=DIR
then, if you want one picture per mode:
  node 4/scripts/contact_sheet.mjs DIR --out=DIR/sheet.png --findings=DIR/judge-findings.txt
