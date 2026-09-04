# Prediction — footer-overlap finding from SEA-TRIAL-2026-09-04T0744Z, before publishing to staging

**Context:** T-138 (player-count console) is rank 2 on the Chart and its last blocker was "no
fresh FULL trial of the code that would actually ship". `2026-09-04T0744Z-Wy-Blade` just finished
(10/10 legs sailed, build `2026.09.04.1`, matches the tree). Before treating that trial as
clearance to publish, I read its report. The vision judge flagged the SAME pattern — "Privacy
Policy / About footer links overlap the bottom captain row" — on 7+ independent screens across
THREE modes: solo-phone (3), passplay-phone (2), crew-phone-host (5), crew-phone-guest (1).

**What I expect, before opening any screenshot:** this is a REAL, NEW, widespread regression, not
a judge hallucination — because the footer links (Privacy Policy / About) at the bottom of
index.html are themselves brand new (his ruling `T-206`, harvested 2026-09-04T00:35:50Z: *"small
links to Privacy Policy and About at the bottom of the index.html screen"*), so this is their
FIRST sea trial. A brand-new fixed-position element at the bottom of a phone screen colliding with
the captains panel (also bottom-anchored, `#pp4Cap`, `position:fixed; bottom:0`) is exactly the
kind of collision this project has hit before with other bottom-anchored UI (T-142, T-023).

**WHY THIS MATTERS FOR THE ITEM I WAS ABOUT TO DO:** if real, this is a fresh, widespread,
player-visible defect on the very build I was about to publish to staging. Publishing over it
without flagging it would be shipping something nobody looked at, the exact class of error rule 24
exists to prevent.

**What would prove me wrong:** opening 2-3 of the cited screenshots by eye and finding the footer
links do NOT visibly overlap the captains panel — i.e., the judge's text does not match the pixels
(rule 22: never trust a judge's paraphrase as a measurement; open the image).
