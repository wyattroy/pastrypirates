#!/usr/bin/env python3
"""dxf.py — writes the set's DXF files via ezdxf, from the JSON the generator emits.

Why a python step: Wyatt's Rhino (ODA importer) refused a hand-written R2000 file outright
("Opendesign error: null object id ... Can't recover file", 2026-08-25). ODA wants the complete
R2000 object structure — handles, owners, block records, root dictionary — and ezdxf is the
reference implementation that produces it. RASTER items arrive as SOLID hatches (odd-parity, so
holes stay open); CUT as plain polylines and circles. One-time setup: pip3 install --user ezdxf
"""
import json, sys
import ezdxf

docs = json.load(open(sys.argv[1]))
for d in docs:
    doc = ezdxf.new("R2000", setup=False)
    doc.header["$INSUNITS"] = 4                        # millimetres
    doc.layers.add("CUT", color=1)
    doc.layers.add("RASTER", color=7)
    msp = doc.modelspace()
    for e in d["entities"]:
        if e["type"] == "hatch":
            h = msp.add_hatch(color=7, dxfattribs={"layer": "RASTER", "hatch_style": 0})
            # A HOLE MUST NOT BE FLAGGED EXTERNAL. ezdxf's add_polyline_path defaults to
            # flags=EXTERNAL(1), so every loop — outer AND hole — was announcing itself as its own
            # filled region. Odd-parity style says the geometry decides, but an importer that trusts
            # the flags fills each loop instead, and a ring lands as a solid disc. Wyatt, 2026-08-30,
            # at the laser: "your hatching in the dxf was calculated wrong and I had to delete many
            # layers of fully filled in black from the board in order to have it printed correctly."
            # Measured on board-one-piece.dxf that day: both loops of each rim band flagged 3, the
            # loops 401.7 and 400.3 mm across — two solid black discs the width of the whole board.
            # So: nest by containment. Depth 0 is EXTERNAL; anything inside another loop is DEFAULT,
            # and odd parity opens the holes as it always should have.
            # Sample SEVERAL points and take the majority, never one. The first version of this fix
            # tested loop[0] alone and left 146 real holes flagged external across the set: a slit
            # whose first vertex sits exactly ON the deck edge reads as outside, while its centroid
            # and every edge midpoint read as inside. A hole never partly overlaps its parent, so a
            # majority of interior samples is decisive where any single one is not.
            def pt_in(px, py, poly):
                r, n = False, len(poly)
                for a in range(n):
                    x1, y1 = poly[a]
                    x2, y2 = poly[(a + 1) % n]
                    if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1:
                        r = not r
                return r
            def samples(loop):
                n = len(loop)
                pts = [(sum(p[0] for p in loop) / n, sum(p[1] for p in loop) / n)]
                step = max(1, n // 8)
                for a in range(0, n, step):
                    x1, y1 = loop[a]
                    x2, y2 = loop[(a + 1) % n]
                    pts.append(((x1 + x2) / 2, (y1 + y2) / 2))
                return pts
            loops = e["loops"]
            for i, loop in enumerate(loops):
                pts = samples(loop)
                depth = 0
                for j, other in enumerate(loops):
                    if i == j:
                        continue
                    hits = sum(1 for (px, py) in pts if pt_in(px, py, other))
                    if hits * 2 > len(pts):
                        depth += 1
                h.paths.add_polyline_path(loop, is_closed=True, flags=1 if depth == 0 else 0)
        elif e["type"] == "circle":
            msp.add_circle((e["cx"], e["cy"]), e["r"], dxfattribs={"layer": e["layer"]})
        else:
            msp.add_lwpolyline(e["pts"], close=e["closed"], dxfattribs={"layer": e["layer"]})
    doc.saveas(d["path"])
print(f"dxf.py: {len(docs)} DXF files written by ezdxf {ezdxf.__version__}")
