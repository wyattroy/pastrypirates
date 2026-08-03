import base64, io, json, os
from PIL import Image
ROOT="/home/user/pastrypirates/"
# downscale to what a phone actually renders, then inline. board.png is 4.5MB at source and
# is drawn at ~560px; islands are drawn at ~100px each.
SPEC=[("assets/board.png",760,"WEBP"),("assets/dock.png",64,"WEBP"),
      ("assets/icons/coin-emoji.png",40,"WEBP")]
SPEC+=[(f"assets/islands/{i}.png",180,"WEBP") for i in range(1,8)]
SPEC+=[(f"assets/boats/{i}.png",84,"WEBP") for i in range(1,5)]
SPEC+=[(f"assets/ingredients/{n}.png",56,"WEBP") for n in
       ["wheat","dairy","eggs","sugar","cocoa","vanilla","spice"]]
out={}
tot=0
for path,px,fmt in SPEC:
    f=ROOT+path
    if not os.path.exists(f): print("MISSING",path); continue
    im=Image.open(f).convert("RGBA")
    w,h=im.size; s=min(1.0,px/max(w,h))
    if s<1.0: im=im.resize((max(1,int(w*s)),max(1,int(h*s))),Image.LANCZOS)
    buf=io.BytesIO(); im.save(buf,fmt,quality=82,method=6)
    b=buf.getvalue(); tot+=len(b)
    out[path]="data:image/webp;base64,"+base64.b64encode(b).decode()
print("assets:",len(out),"total KB:",round(tot/1024))
open("/tmp/claude-0/-home-user-pastrypirates/c9013cf3-8ba9-52b4-bcd5-b2ae34d292ec/scratchpad/bundle/assets.json","w").write(json.dumps(out))
