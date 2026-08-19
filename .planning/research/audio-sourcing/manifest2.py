# ROUND 2 — the eight slots Wyatt rejected outright, re-searched in the game's own world.
#
# His note: "we can get more piratey with the sounds here — eg. a wrong bowl can be a squawk?"
# That is the whole brief. Round 1 offered game audio; these offer things that exist on a ship.
#
# Struck this round, on his instruction: "ovens-off" (the moment no longer exists in the game)
# and "coin-slip" (paying the kitchen hand does not need a sound).

SLOTS = [
 dict(id="clash", tier=1, title="The broadside lands — timber, not steel", len="0.5–1.2s",
      why="You rejected all four swords, and you were right — nobody is fencing. The cannon fires "
          "and then a ball hits a hull. These are cannon strikes on ships and wood breaking apart, "
          "which is what the second half of your battle actually is.",
      said="the smoke clears and neither has a thing to show for it",
      pats=["cannon_hit_ship_short", "cannon_hit_1", "ship_ram_ship_shortened",
            "wood_breaking_01", "Small Wood Pile, Smash", "Wooden Tearing 09"]),

 dict(id="wrong", tier=2, title="Bake-off — a miss, as a squawk", len="≤0.6s",
      why="Your idea, and it is a much better one than a dull thud. The parrot is the one voice on "
          "the ship allowed to editorialise, and a bad guess is exactly when you would hear from it.",
      pats=["Macaw, Stressed,Shouting,Close", "Macaw,Vocals,Chill,Close",
            "birds-isaiah658_0", "birdchirping071414.wav"]),

 dict(id="seabird", tier=3, title="Gulls — ambient scatter", len="1–3s", amb=True,
      why="Round 1 had no gull at all — geese, ravens and an owl, none of which belong at sea. "
          "This is a dedicated seagull library, twenty-one recordings of nothing but gulls.",
      pats=["Seagull Ambient 1", "Seagull Ambient 3", "Seagull Ambient 5",
            "Seagull Ambient 6"]),

 dict(id="bell", tier=1, title="A new day — the ship's bell", len="0.6–1.2s",
      why="Still the thinnest slot on the board. These are a struck bell, a waiter's bell and real "
          "bell-ringers — closer than a cowbell, but none of them is a ship's bell hung in a "
          "rolling sea.",
      pats=["pleasing-bell", "Bell_Waiter_Fienup_001", "22 BELLMEN_Kukuljanski Bell ringers",
            "metal_hit_03"]),

 dict(id="your-turn", tier=1, title="Your turn — a call, not a blip", len="0.5–1.2s",
      why="You rejected four interface sounds, which is the right verdict on all of them: a menu "
          "chirp cannot summon a captain. A whistle or a horn is how a real crew is called.",
      pats=["steam_whistle", "steamwhistle_0", "23 BELLMEN_Traditional horns",
            "Bell_Waiter_Fienup_001"]),

 dict(id="swap", tier=2, title="Bake-off — bowls sliding on the bench", len="~1s",
      why="The whooshes were cinema, not a galley. These are real vessels being moved across a "
          "surface — pots, china and board-game pieces — which is literally what is happening.",
      pats=["metalPot1", "moving_china_plates_002", "Placing Pieces on the Board 2",
            "Arranging Glasses 06", "Draging Kitchen Cabinets 04"]),

 dict(id="reveal", tier=2, title="Bake-off — the bowl lifts", len="≤0.6s",
      why="Not a card fan or a UI open — a physical vessel being picked up off a bench.",
      pats=["metalPot2", "metalPot3", "Arranging Bottles 01", "metal_open_01",
            "KITCHEN drawer opening closing"]),

 dict(id="verdict", tier=2, title="Bake-off — the verdict", len="≤1.3s",
      why="The cinematic hits belonged in a film trailer. A struck drum is a fairground judgment "
          "and it suits the scene the code itself describes as wanting to feel like a fairground.",
      pats=["Timpani_Hit_Fienup_001", "HandDrum_Reverse_SlowDown_Fienup_003",
            "Banjo_Drum_Hit_Fienup_016", "PERCUSSION GUIRO LP SUPER BIG WOOD BEATER"]),
]

KNOWN_GAPS = {
 "bell": "Still no true ship's bell anywhere in CC0. If none of these three land, this is the "
         "clearest ElevenLabs job on the whole list — a specific object with a specific sound.",
 "your-turn": "A steam whistle is industrial and the horns are folk-festival. Neither is a "
              "bosun's pipe, which is the sound this moment actually wants.",
}
