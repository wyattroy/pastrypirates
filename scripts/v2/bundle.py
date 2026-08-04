import re, json, pathlib
ROOT=pathlib.Path("/home/user/pastrypirates")
SCR=pathlib.Path("/tmp/claude-0/-home-user-pastrypirates/c9013cf3-8ba9-52b4-bcd5-b2ae34d292ec/scratchpad/bundle")
MODS=[("shared","src/shared/index.js"),("engine","src/engine/index.js"),
      ("events","v2/events.js"),
      ("v2engine","v2/engine.js"),("strategy","v2/strategy.js"),("ui","v2/ui.js"),("main","v2/main.js")]
ALIAS={"../src/shared/index.js":"shared","../shared/index.js":"shared",
       "../src/engine/index.js":"engine","./engine.js":None,"./strategy.js":"strategy","./ui.js":"ui",
       "./events.js":"events"}
def alias_for(spec, key):
    if spec=="./engine.js": return "v2engine" if key in ("strategy","ui","main") else None
    return ALIAS.get(spec)

IMP = re.compile(r'^import\s+(\*\s+as\s+(\w+)|\{([^}]*)\})\s+from\s+"([^"]+)"\s*;?\s*$', re.M|re.S)
EXPLIST = re.compile(r'^export\s*\{([^}]*)\}\s*;?\s*$', re.M|re.S)

def transform(key, src):
    names=set()
    def imp(m):
        star, starname, named, spec = m.group(1), m.group(2), m.group(3), m.group(4)
        a = alias_for(spec, key)
        if not a: raise SystemExit(f"unresolved import {spec} in {key}")
        if starname: return f"const {starname} = M_{a};"
        ids=[]
        for x in named.replace("\n"," ").split(","):
            x=x.strip()
            if not x: continue
            ids.append(re.sub(r'\s+as\s+', ': ', x))
        return "const { " + ", ".join(ids) + f" }} = M_{a};"
    src = IMP.sub(imp, src)
    def explist(m):
        for n in m.group(1).replace("\n"," ").split(","):
            n=n.strip()
            if not n: continue
            if " as " in n:
                loc, ext = [t.strip() for t in n.split(" as ")]
                names.add(ext + ": " + loc)
            else: names.add(n)
        return ""
    src = EXPLIST.sub(explist, src)
    # inline `export function/const/let/class`
    for m in re.finditer(r'^export\s+(?:async\s+)?(function|const|let|var|class)\s+(\w+)', src, re.M):
        names.add(m.group(2))
    # `export const A = ..., B = ...`
    for m in re.finditer(r'^export\s+const\s+([^=;]+)=', src, re.M):
        for part in m.group(1).split(","):
            p=part.strip().split("=")[0].strip()
            if re.fullmatch(r'\w+',p): names.add(p)
    src = re.sub(r'^export\s+', '', src, flags=re.M)
    ret = ", ".join(sorted(names))
    return f"/* ==== {key} ==== */\nconst M_{key} = (function(){{\n{src}\nreturn {{ {ret} }};\n}})();\n", names

parts=[]
for key, rel in MODS:
    s=(ROOT/rel).read_text()
    if key=="ui":
        s=s.replace('const A = u => (u && !/^(\\.\\.|https?:|data:)/.test(u)) ? "../" + u : u;',
                    'const A = u => (window.__PPASSETS && window.__PPASSETS[u]) || u;')
        s=s.replace('export const A = u => (u && !/^(\\.\\.|https?:|data:)/.test(u)) ? "../" + u : u;',
                    'export const A = u => (window.__PPASSETS && window.__PPASSETS[u]) || u;')
    code, names = transform(key, s)
    parts.append(code)
    print(f"  {key:9s} {len(s)//1024:4d}KB  exports {len(names)}")
js = "\n".join(parts) + "\nwindow.startV2 = M_main.start;\n"
SCR.joinpath("bundle.js").write_text(js)
print("bundle JS:", len(js)//1024, "KB")
