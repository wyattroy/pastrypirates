# The slot list. Each slot is a moment in Pastry Pirates that needs a sound.
#
# "pats" are substring patterns matched against the crawled indexes (case-insensitive).
# Order matters — the first N distinct matches become the candidates.
#
# tier:  1 must-have | 2 nice-to-have | 3 lower priority
# len:   target length in seconds for the shipped sound (drives the preview trim)
# amb:   True for looping/ambient material (longer preview, judged differently)

SLOTS = [
 # ---------------------------------------------------------------- tier 1
 dict(id="cannon", tier=1, title="Cannon — the opening broadside", len="0.8–1.5s",
      why="The battle is written as gunpowder 57 times over and currently sounds like swords. "
          "Fires the moment a fight is joined.",
      said="ye load another broadside (−3 dubloons)",
      pats=["explosion_large_no_tail", "explosion_med_long_tail", "Distant Blast 17",
            "Distant Blast 05", "Rifled Flintlock Pistol M1820 - FIRING - Close",
            "Impact_Boom_Distorted"]),

 dict(id="clash", tier=1, title="The fight resolves — steel", len="0.5–1s",
      why="The second half of a battle. Cannon opens it, this closes it. Replaces the current "
          "clipped sword file.",
      said="the smoke clears and neither has a thing to show for it",
      pats=["Knife_Sword_Hit_Multiple", "Machete_Hit_Ring", "Knife_Sword_Shing",
            "WOODEN SWORD HIT-11"]),

 dict(id="victory", tier=1, title="Victory", len="2–4s",
      why="The most-screenshotted moment in the game. Currently plays the quietest file you own — "
          "the sound of a crate being stowed.",
      pats=["Battle Celebration 02", "Roller Coaster Voices Cheers", "jingles-hit_09",
            "jingles-hit_16", "jingles-pizzicato_09"]),

 dict(id="timer-tick", tier=1, title="Time running low — the warning", len="0.15–0.3s",
      why="A soft tick under the last few seconds so you feel it coming. Nothing like it exists today.",
      pats=["Beep,Clean,Pure,Simple,High", "/tick", "lowDown", "Interface Sounds/click"]),

 dict(id="timer-out", tier=1, title="Time up — the buzzer", len="0.6–1.2s",
      why="Its whole job is to reach you when you have looked away. Currently a clipped sword clash.",
      pats=["SW011_Alarms_Siren", "Beep,Buzz,Clean,Tight,Mid", "Interface Sounds/error",
            "zapThreeToneDown"]),

 dict(id="wind", tier=1, title="Wind — the compass turns", len="1–2s",
      why="The central mechanic of the game, and it makes no noise at all. A one-shot gust, not a bed.",
      pats=["Wind_Heavy_Fienup", "Wind Gusts 2016 Lookout Snow", "Wind_INT_Window Whistle",
            "Designed Fire - Winds - Binaural"]),

 dict(id="bell", tier=1, title="A new day — the ship's bell", len="0.6–1.2s",
      why="The round boundary is the game's chapter break and nothing marks it. Fires every round, "
          "so it must be short and quiet.",
      pats=["MODERN LP BELL COWBELL", "BELL TREE UP DOWN", "impactBell_heavy",
            "Swell_Metallic Ring"]),

 dict(id="your-turn", tier=1, title="Your turn", len="0.5–1s",
      why="Personal, and distinct from the bell. Needs your ruling on whether it breaks the "
          "hear-the-whole-table rule.",
      pats=["Interface Sounds/confirmation", "highUp", "pepSound", "Interface Sounds/question"]),

 dict(id="sea-bed", tier=1, title="The sea — ambient bed", len="15–30s loop", amb=True,
      why="The biggest jump in perceived quality per unit of work anywhere on this list. Sits under "
          "everything, well below the effects.",
      pats=["Ocean Waves Surf Close 2", "Ocean Waves 2017 Kauai Night Waves",
            "Coast 2014 Coast Mono 1", "Ocean Waves Surf On Rocks Close"]),

 # ---------------------------------------------------------------- tier 2
 dict(id="bowl-cover", tier=2, title="Bake-off — the covers come down", len="≤0.28s",
      why="Five bowls covered 280ms apart. Turns a visual beat into a physical one.",
      pats=["impactWood_light", "impactWood_medium", "Interface Sounds/close", "bookClose"]),

 dict(id="swap", tier=2, title="Bake-off — the shuffle", len="~1s",
      why="Tells you a swap happened even if your eye lost it. That is the difference between a "
          "memory puzzle and an arbitrary one.",
      pats=["Action Swish_HW 02", "Fast Action Swish_HW 05", "Swirl Whoosh_HW 42",
            "cardSlide3", "cardShove2"]),

 dict(id="reveal", tier=2, title="Bake-off — the bowl lifts", len="≤0.5s",
      why="Bowls lift one at a time, 520ms apart, in recipe order.",
      pats=["Casino Audio/cardFan1", "Interface Sounds/open", "bookOpen",
            "SQUEAKS AND CREAKS TWO 045 Bottle Cork"]),

 dict(id="correct", tier=2, title="Bake-off — correct, as a rising ladder", len="≤0.4s each",
      why="A run of three right before a miss should climb. This is the one place sound adds drama "
          "the visuals cannot.",
      pats=["jingles-pizzicato_00", "jingles-pizzicato_01", "jingles-pizzicato_02",
            "Interface Sounds/tone", "pluck"]),

 dict(id="wrong", tier=2, title="Bake-off — a miss", len="≤0.5s",
      why="Flat and dull, and it must break the run the ladder was building.",
      pats=["Interface Sounds/lowDown", "impactSoft_heavy", "jingles-hit_00", "Interface Sounds/error"]),

 dict(id="verdict", tier=2, title="Bake-off — the verdict", len="≤1.3s",
      why="A 1.3-second window for the result to land. A sting, not a fanfare — save that for winning.",
      pats=["CHT2_Cinematic_Hit_096", "CHT2_Cinematic_Hit_214", "jingles-hit_11", "Impact_Drum Hit"]),

 dict(id="ovens-on", tier=2, title="The ovens fire up", len="1–2s",
      why="The moment you have played the entire game for, and it is silent. The one sound that "
          "should smell like a bakery rather than a ship.",
      said="ye reach Tortuga with a full recipe and fire up the ovens!",
      pats=["Designed Fire - Impacts - Large, ignition", "Designed Fire - Swooshes - Burst",
            "sm-fire-firewood-small", "sm-fire-cotton"]),

 dict(id="ovens-off", tier=2, title="The ovens go cold", len="1–2s",
      why="One of the cruellest moments in the game. Lands a beat after the raid that caused it.",
      said="ye ovens go cold — the stolen crate was part of the recipe",
      pats=["Designed Fire - Textures - Rumbling", "Bluezone_BC0256_water_splash_small",
            "Interface Sounds/lowRandom"]),

 dict(id="hail", tier=2, title="Hailing the table", len="~1s",
      why="A captain shouting an open offer across the water. Makes the table feel populated.",
      said="Who'll give me sugar for two crates of flour?",
      pats=["Call Out Help Make Weapons", "Battle Cry 03", "WHISTLE SAMABA",
            "Unrest Murmur 01"]),

 dict(id="deal", tier=2, title="A deal struck", len="~0.7s",
      why="Currently borrows the crate-loading sound. A deal closing is a social moment, not a "
          "cargo one.",
      pats=["Coins_Hand_Jingle_Movement", "Money,Coins,Handle", "Coins_Pouch_Leather_Drop_Into",
            "handleCoins"]),

 dict(id="anchor", tier=2, title="The anchor bites", len="1.5–2.5s",
      why="Chain running out and timber taking the strain. One of the more heroic moments in a storm.",
      pats=["Heavy_Chain-Foley_On_Wood", "Jingle_Chain-Sustained_Foley",
            "BOAT_042-PU011_Fast_Pulley_Tension_Release", "Dog_Chain-Hits"]),

 dict(id="storm-shove", tier=2, title="The storm shoves you", len="~1s",
      why="The bed announces the weather arriving. This is the moment it physically moves your ship.",
      pats=["Thunder_Boom_Fienup", "Thunder_Crack_Fienup", "Thunder_Rumble_Deep_Fienup",
            "Thunder_Rumble_Mid_Fienup"]),

 dict(id="coin-land", tier=2, title="The coin lands", len="~0.4s",
      why="The most theatrical frame in the game — it shudders and flares gold — and it has no "
          "impact behind it. The spin has a sound; the landing does not.",
      pats=["Coin_Wood_Table_Singles_Drop_Spin", "impactMetal_light", "Money,Coins,Drop In Cash Register",
            "chipLay1"]),

 # ---------------------------------------------------------------- tier 3
 dict(id="ui-tap", tier=3, title="Interface tap", len="≤0.15s",
      why="Buttons and the radial prompt. Fires constantly, so it must be very quiet.",
      pats=["Interface Sounds/click", "UI Audio/click", "Interface Sounds/select",
            "Interface Sounds/switch", "rollover"]),

 dict(id="coin-slip", tier=3, title="Paying the kitchen hand", len="~0.5s",
      why="Currently silent by accident. A single coin slipped across a counter.",
      said="ye slip the kitchen hand 2 dubloons for another look at the crates",
      pats=["Money,Coins,Hand,Count", "coins throwing from hand to hand", "Coins_Wood_Slide_Gather"]),

 dict(id="splash", tier=3, title="Something in the water", len="~1s",
      why="The look-into-the-ocean moment already has lovely writing behind it.",
      said="looks into the ocean",
      pats=["Bluezone_BC0256_water_splash_008", "Bluezone_BC0256_water_splash_distant",
            "Bluezone_BC0256_water_splash_drop"]),

 dict(id="blocked", tier=3, title="Blocked", len="~0.4s",
      why="A dull bump when you cannot go where you meant to.",
      pats=["impactWood_heavy", "impactSoft_medium", "impactPlank_medium"]),

 dict(id="creak", tier=3, title="Rigging creak — ambient scatter", len="1–3s", amb=True,
      why="Fired at random gaps over the sea bed. The scatter is what stops your ear finding the "
          "loop point.",
      pats=["Creaks and Snaps 2017.03.20 - Gentle Tree Creaks", "BOAT_078-PU020_Swing_2_Pulleys_Medium",
            "SQUEAKS AND CREAKS TWO 136 Wood Door 03 Creaks", "Interface Sounds/creak"]),

 dict(id="seabird", tier=3, title="Seabird — ambient scatter", len="1–3s", amb=True,
      why="The other half of the scatter. No true gull exists in these libraries — these are the "
          "nearest neighbours.",
      pats=["Geese 2016 Steens Dawn Goose Flyby Pair", "Ravens 2015 Medlock Raven Close",
            "Owls 2016 Owl Chirp + Flyby"]),
]

# Slots where I expect CC0 to fall short and ElevenLabs is the honest answer.
# Recorded here so the gallery can say so out loud rather than quietly shipping a weak match.
KNOWN_GAPS = {
 "bell": "No true ship's bell in any CC0 library I crawled — these are a cowbell, a bell tree and "
         "a metal ring. A ship's bell is a specific, recognisable object and none of these is it.",
 "your-turn": "Generic interface blips. Nothing here says *you specifically* — which is this cue's "
              "entire job.",
 "seabird": "No gull. Geese, ravens and an owl are the closest, and none of them belongs at sea.",
 "hail": "These are battle crowds and a whistle, not one voice calling across water.",
 "victory": "The cheers are a crowd, the jingles are generic game-over stings. Neither is a pirate "
            "fanfare.",
}
