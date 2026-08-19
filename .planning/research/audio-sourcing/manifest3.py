# ROUND 3 — three slots.
#
# 1. clash, third attempt. "I still don't like any of the fight resolves clashes, they have no
#    energy to them." Rounds 1 and 2 both failed the same way: round 1 was steel (wrong object),
#    round 2 was wood breaking (right object, no punch). Energy is the brief now — crashes with a
#    tail, an anvil, a shout, debris. A hit you feel rather than identify.
# 2. drumroll, NEW. The narration literally says "Drumroll..." before the winner is revealed and
#    nothing plays. 4/src/orchestrator.js:1078.
# 3. reveal, second attempt. All five kitchen options rejected. The pirate answer is a cloth
#    whipped off a covered bowl, not a drawer.

SLOTS = [
 dict(id="drumroll", tier=1, secs=3.2,
      title="Drumroll — before the winner is revealed", len="2.55s exactly",
      why="The blue box already says the word and then sits there in silence. This is the last "
          "beat of the whole voyage and it is the easiest win on the board — the moment is already "
          "built, staged and timed, it is just mute.",
      said="Drumroll...",
      spec="The window is not a guess: the narration box holds every line for at least 2550ms and "
           "this line is short enough to take exactly that floor. So the roll runs 2.55s and the "
           "final hit lands as the box fades into the gold banner.",
      pats=["roll_handdrum", "roll_timpani", "roll_deep", "Riser 027", "Riser 078",
            "HandDrum_Reverse_SlowDown"]),

 dict(id="clash", tier=1, secs=2.5,
      title="The broadside lands — third attempt, for energy", len="0.5–1.2s",
      why="Steel was the wrong object and breaking wood had no punch. These are chosen for impact "
          "rather than for accuracy: metal crashes with a long tail, an anvil, a scrap pile coming "
          "down, and one human shout — because a crew reacting is energy that no object can give you.",
      said="the smoke clears and neither has a thing to show for it",
      pats=["Metal_Hit_Crash_090", "Metal_Hit_Crash_199",
            "Bluezone_BC0258_cinematic_metal_anvil_impact_005",
            "Bluezone-BC0214-explosion-whooshe-020", "Male_Grunt-Shout_317",
            "Pile of Scrap Metal", "ship_destroyed_short", "Braam 013"]),

 dict(id="reveal", tier=2, secs=2.0,
      title="Bake-off — the cloth comes off the bowl", len="≤0.6s",
      why="You rejected all five drawers and pots. A bowl on a fairground bench is not opened, it "
          "is uncovered — so this is cloth being whipped away, plus one cork pop as the outlier.",
      pats=["rpg-sound-pack/cloth.wav", "cloth-heavy", "cloth1.ogg",
            "Whoosh_Cloth_Leather_Fight_174", "Swoosh_Rope_Whip_075",
            "SQUEAKS AND CREAKS TWO 045 Bottle Cork"]),
]

KNOWN_GAPS = {
 "drumroll": "Nothing in any free library is an actual drumroll. The three named roll_* below are "
             "ASSEMBLED — I took one real drum strike and rebuilt it into an accelerating, "
             "rising roll ending on the beat. The shape is right by construction; whether it "
             "convinces is entirely your ear, because I cannot hear it.",
}
