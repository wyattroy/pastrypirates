# 🏴‍☠️ Pastry Pirates *on the Sugar Seas*

A board game in development — plunder the Caribbean for baking ingredients, flip the gold bullion, and become the Best Baker in Barbados.

**[▶️ Open the rules lab](https://YOUR_GITHUB_USERNAME.github.io/pastrypirates/)** — an interactive simulator where you can tweak every rule, watch bot games play out, scrub the timeline, and run 400-game balance checks.

## What's here

- `index.html` — the Pastry Pirates Lab (self-contained, no dependencies)
- `cocoa_pirates_sim.py` — the Python simulation engine used for balance research (~50,000 games)
- `DESIGN_REPORT.md` — full findings: strategy win rates, coin-flip math, and the recommended ruleset

## Running the Python sim

    python3 cocoa_pirates_sim.py baseline    # current rules, strategy tournament
    python3 cocoa_pirates_sim.py variants    # rule variant comparisons
    python3 cocoa_pirates_sim.py final2      # recommended ruleset

