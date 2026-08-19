#!/usr/bin/env python3
"""Round-3 audition page: the drumroll, the clash (third attempt), and the bowl lift."""
import json, os, html

WS = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(WS, "gallery3.json")))
SLOTS = D["slots"]

SETTLED = [
 ("Cannon — the opening broadside", "explosion_med_long_tail_01.wav", "round 1 — you preferred this"),
 ("Victory", "EFX EXT GROUP Battle Celebration 02 A.wav", "round 1"),
 ("Time running low", "Beep,Clean,Pure,Simple,High,x4,Fast.wav", "round 1"),
 ("Time up — the buzzer", "Beep,Buzz,Clean,Tight,Mid,x3.wav", "round 1"),
 ("Wind — the compass turns", "Designed Fire - Winds - Binaural, swoosh, waves 02.wav", "round 1"),
 ("The sea — ambient bed", "Ocean Waves 2017 Kauai Night Waves.WAV", "round 1"),
 ("Bake-off — covers come down", "impactWood_light_000.ogg + bookClose.ogg", "round 1"),
 ("Bake-off — correct ladder", "jingles-pizzicato_02.ogg", "round 1"),
 ("The ovens fire up", "sm-fire-firewood-small-03-DPAmono.wav", "round 1"),
 ("Hailing the table", "EFX EXT GROUP Unrest Murmur 01 A .wav", "round 1"),
 ("A deal struck", "Coins_Hand_Jingle_Movement_Takes_6.wav", "round 1"),
 ("The anchor bites", "Heavy_Chain-Foley_On_Wood.wav", "round 1"),
 ("The storm shoves you", "Thunder_Boom_005 + Thunder_Crack_016", "round 1"),
 ("The coin lands", "chipLay1.ogg", "round 1"),
 ("Interface tap", "click_001.ogg", "round 1"),
 ("Something in the water", "Bluezone_BC0256_water_splash_008.wav", "round 1"),
 ("Blocked", "impactWood_heavy_000.ogg", "round 1"),
 ("Rigging creak", "BOAT_078 Pulleys + Wood Door Creaks", "round 1"),
 ("Bake-off — a miss, as a squawk", "Macaw, Stressed, Shouting, Close", "round 2 — your idea"),
 ("Gulls — ambient scatter", "Seagull Ambient 1, 3, 5, 6", "round 2"),
 ("Bake-off — bowls on the bench", "Draging Kitchen Cabinets 04.wav", "round 2"),
 ("Bake-off — the verdict", "Timpani_Hit_Fienup_001.wav", "round 2"),
]
OPEN = [("A new day — the ship's bell", "no free library has one"),
        ("Your turn", "wants a bosun's pipe; nothing free has it")]

n_c = sum(len(s["cands"]) for s in SLOTS)


def bars(env):
    return "".join('<i style="height:%d%%"></i>' % max(3, v) for v in env) if env else ""


def card(sid, i, c):
    lic = "cc0" if c["lic"] == "CC0" else ("built" if c.get("built") else "rf")
    licl = {"CC0": "CC0"}.get(c["lic"], "Assembled" if c.get("built") else "Royalty-free")
    return f'''<article class="cand{' isbuilt' if c.get('built') else ''}" data-k="{sid}:{i}">
  <button class="wave" type="button" aria-label="Play {html.escape(c['name'])}">
    <span class="bars">{bars(c['env'])}</span><span class="play">▶</span></button>
  <div class="meta">
    <p class="fn" title="{html.escape(c['name'])}">{html.escape(c['name'])}</p>
    <p class="lib">{html.escape(c['src'])} · {html.escape(c['lib'][:38])}</p>
    <p class="nums"><span>{c['dur']}s</span><span class="lic {lic}">{licl}</span></p></div>
  <div class="verdict">
    <button class="keep" type="button" data-v="keep">Keep</button>
    <button class="rej" type="button" data-v="reject">Reject</button></div>
  <audio preload="none" src="data:audio/mpeg;base64,{c['audio']}"></audio>
</article>'''


def slot_html(s):
    said = f'<p class="said">{html.escape(s["said"])}</p>' if s.get("said") else ""
    spec = f'<p class="spec2"><b>Timing.</b> {html.escape(s["spec"])}</p>' if s.get("spec") else ""
    gap = f'<p class="gap"><b>Note.</b> {html.escape(s["gap"])}</p>' if s["gap"] else ""
    cards = "".join(card(s["id"], i, c) for i, c in enumerate(s["cands"]))
    return f'''<section class="slot">
  <header class="sh"><h3>{html.escape(s['title'])}</h3>
    <span class="len">{html.escape(s['length'])}</span>
    <span class="cnt" data-cnt="{s['id']}"></span></header>
  <p class="why">{html.escape(s['why'])}</p>
  {said}{spec}{gap}<div class="cands">{cards}</div></section>'''


settled_rows = "".join(
    f'<tr><td>{html.escape(m)}</td><td class="f">{html.escape(f)}</td><td class="s">{html.escape(r)}</td></tr>'
    for m, f, r in SETTLED)
open_rows = "".join(
    f'<tr><td>{html.escape(m)}</td><td class="f" colspan="2">{html.escape(w)} → ElevenLabs</td></tr>'
    for m, w in OPEN)

CSS = open(os.path.join(WS, "gallery.html"), encoding="utf-8").read()
CSS = CSS[CSS.index("<style>"):CSS.index("</style>") + 8]

PAGE = f'''<title>Pastry Pirates — Sound Audition, Round 3</title>
{CSS}
<style>
.locked{{width:100%;border-collapse:collapse;font-family:var(--mono);font-size:.72rem;margin-top:.8rem}}
.locked td{{padding:.34rem .6rem;border-bottom:1px solid var(--rule);vertical-align:top}}
.locked td.f,.locked td.s{{color:var(--text3)}}
.locked td.s{{text-align:right;white-space:nowrap}}
details.lockedwrap{{background:var(--paper2);border:1px solid var(--rule);padding:1rem 1.2rem;margin-top:1.4rem}}
details.lockedwrap summary{{cursor:pointer;font-weight:600;font-size:1rem}}
.lic.built{{color:#B27A2F;border-color:#B27A2F}}
.cand.isbuilt{{background:linear-gradient(0deg,var(--paper2),var(--paper2)) padding-box;
 border-style:dashed}}
.spec2{{background:var(--paper2);border-left:3px solid var(--brass);padding:.6rem .8rem;
 margin:0 0 .8rem;font-size:.9rem;color:var(--text2);max-width:80ch}}
.spec2 b{{color:var(--brass)}}
</style>

<div class="wrap">
<header class="mast">
  <p class="eyebrow">Round 3 · {n_c} candidates · the drumroll, the clash, the bowl</p>
  <h1>The drumroll the game already asks for, and a clash with some fight in it.</h1>
  <p class="stand">Three slots. The cannon is settled — you preferred round one's explosion, so
    that one is closed and off this page.</p>
</header>

<div class="stats">
  <div class="stat"><b>3</b><span>Slots open here</span></div>
  <div class="stat"><b>{n_c}</b><span>Candidates</span></div>
  <div class="stat"><b>22</b><span>Moments already settled</span></div>
  <div class="stat"><b>2</b><span>Going to ElevenLabs</span></div>
  <div class="stat"><b>2.55s</b><span>The drumroll window</span></div>
</div>

<div class="note">
  <h3>The drumroll is the easiest win left on the board</h3>
  <p>Your game <em>already</em> does this moment. The board pulls back for a last look, the blue box
  types the word <b>"Drumroll..."</b>, holds, fades, and the gold banner reveals the winner. Every
  part of it is built and staged. <b>It is simply silent.</b></p>
  <p><b>And the window is exact, not estimated.</b> The narration box holds every line for a minimum
  of 2550 milliseconds, and "Drumroll..." is short enough to take precisely that floor — so the roll
  is 2.55 seconds and its final hit lands as the box fades into the reveal.</p>
  <p><b>Three of the six below I built myself</b>, marked with a dashed border. No free library on
  earth has a drumroll — so I took one real drum strike and rebuilt it into an accelerating,
  rising roll that lands on the beat. The shape is right by construction. Whether it convinces is
  entirely your ear, because I still cannot hear any of this.</p>
</div>

<div class="bar">
  <span class="tally" id="tally"></span><span class="sp"></span>
  <button type="button" id="clear">Clear all</button>
  <button type="button" id="export">Export picks</button>
</div>

<div class="tier">
  <div class="tierhead"><span class="tnum">Round 3</span><h2>Still open</h2>
    <span class="tmeta">{len(SLOTS)} slots</span></div>
  {''.join(slot_html(s) for s in SLOTS)}
</div>

<details class="lockedwrap">
  <summary>Settled so far — 22 moments, plus 2 for ElevenLabs</summary>
  <table class="locked">{settled_rows}{open_rows}</table>
</details>

<footer>
  Pastry Pirates sound audition, round 3 · 19 August 2026<br>
  OpenGameArt (CC0) · Kenney (CC0) · Sonniss #GameAudioGDC (royalty-free for game use) ·
  assembled rolls built from a royalty-free strike<br>
  Level-matched to −20 dBFS RMS, peak-limited, mono 32kHz — audition quality only
</footer>
</div>

<dialog id="dlg">
  <h3>Your round-3 picks</h3>
  <textarea id="out" readonly></textarea>
  <div class="row"><button type="button" id="copy">Copy</button><button type="button" id="close">Close</button></div>
</dialog>

<script>
(function(){{
  var KEY = "pp_sfx_picks_r3";
  var picks = {{}};
  try {{ picks = JSON.parse(localStorage.getItem(KEY) || "{{}}"); }} catch(e) {{ picks = {{}}; }}
  var cards = Array.prototype.slice.call(document.querySelectorAll(".cand"));
  var cur = null;
  function save(){{ try {{ localStorage.setItem(KEY, JSON.stringify(picks)); }} catch(e) {{}} }}
  function paint(){{
    cards.forEach(function(c){{
      var v = picks[c.dataset.k];
      c.classList.toggle("keep", v === "keep");
      c.classList.toggle("reject", v === "reject");
    }});
    var kept = 0, decided = 0;
    for (var k in picks) {{ decided++; if (picks[k] === "keep") kept++; }}
    document.getElementById("tally").innerHTML =
      "<b>" + kept + " kept</b> · " + decided + " decided of {n_c}";
    document.querySelectorAll("[data-cnt]").forEach(function(el){{
      var id = el.getAttribute("data-cnt"), n = 0;
      for (var k in picks) if (k.indexOf(id + ":") === 0 && picks[k] === "keep") n++;
      el.textContent = n ? n + " kept" : "";
      el.classList.toggle("done", n > 0);
    }});
  }}
  function stop(){{
    if (!cur) return;
    var a = cur.querySelector("audio");
    a.pause(); a.currentTime = 0;
    cur.classList.remove("playing");
    cur.querySelectorAll(".bars i").forEach(function(b){{ b.classList.remove("on"); }});
    cur = null;
  }}
  cards.forEach(function(c){{
    var audio = c.querySelector("audio"), bars = c.querySelectorAll(".bars i");
    c.querySelector(".wave").addEventListener("click", function(){{
      if (cur === c) {{ stop(); return; }}
      stop(); cur = c; c.classList.add("playing");
      audio.currentTime = 0;
      audio.play().catch(function(){{ stop(); }});
    }});
    audio.addEventListener("timeupdate", function(){{
      if (cur !== c || !audio.duration) return;
      var upto = Math.floor(audio.currentTime / audio.duration * bars.length);
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle("on", i <= upto);
    }});
    audio.addEventListener("ended", stop);
    c.querySelectorAll(".verdict button").forEach(function(b){{
      b.addEventListener("click", function(){{
        var k = c.dataset.k, v = b.dataset.v;
        if (picks[k] === v) delete picks[k]; else picks[k] = v;
        save(); paint();
      }});
    }});
  }});
  document.getElementById("clear").addEventListener("click", function(){{
    if (!confirm("Clear every round-3 keep and reject?")) return;
    picks = {{}}; save(); paint();
  }});
  var DATA = {json.dumps({s["id"]: {"title": s["title"],
      "cands": [{"name": c["name"], "lib": c["lib"], "src": c["src"], "lic": c["lic"]}
                for c in s["cands"]]} for s in SLOTS})};
  document.getElementById("export").addEventListener("click", function(){{
    var out = {{ round: 3, generated: new Date().toISOString(),
                kept: [], rejected: [], still_undecided: [] }};
    Object.keys(DATA).forEach(function(sid){{
      var slot = DATA[sid], any = false;
      slot.cands.forEach(function(c, i){{
        var v = picks[sid + ":" + i];
        var row = {{ slot: sid, moment: slot.title, file: c.name,
                    library: c.lib, source: c.src, licence: c.lic }};
        if (v === "keep") {{ out.kept.push(row); any = true; }}
        else if (v === "reject") out.rejected.push(row);
      }});
      if (!any) out.still_undecided.push({{ slot: sid, moment: slot.title }});
    }});
    document.getElementById("out").value = JSON.stringify(out, null, 2);
    document.getElementById("dlg").showModal();
  }});
  document.getElementById("copy").addEventListener("click", function(){{
    var t = document.getElementById("out"); t.select();
    try {{ document.execCommand("copy"); this.textContent = "Copied"; }} catch(e) {{}}
    var self = this; setTimeout(function(){{ self.textContent = "Copy"; }}, 1400);
  }});
  document.getElementById("close").addEventListener("click", function(){{
    document.getElementById("dlg").close();
  }});
  document.addEventListener("keydown", function(e){{ if (e.key === "Escape") stop(); }});
  paint();
}})();
</script>
'''

open(os.path.join(WS, "gallery3.html"), "w").write(PAGE)
print("wrote gallery3.html  %.2f MB" % (len(PAGE) / 1048576))
