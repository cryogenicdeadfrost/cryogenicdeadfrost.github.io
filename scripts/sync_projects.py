#!/usr/bin/env python3
import base64, hashlib, html, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OWNER=os.getenv("PORTFOLIO_OWNER","cryogenicdeadfrost")
TOKEN=os.getenv("GITHUB_TOKEN","")
OV=ROOT/"data/project-overrides.json"
MANIFEST=ROOT/"data/project-list.json"
STATE=ROOT/"data/github-repo-state.json"
OUT=ROOT/"generated/projects.json"
COLORS=[("#ff3b30","#ff9500"),("#00f0ff","#7c3aed"),("#39ff14","#00f0ff"),("#ff007f","#ffe600"),("#ff9500","#ff2d55"),("#5ac8fa","#af52de"),("#34c759","#30d158"),("#bf5af2","#64d2ff")]

def get(path):
    req=urllib.request.Request("https://api.github.com"+path)
    req.add_header("Accept","application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version","2026-03-10")
    req.add_header("User-Agent","portfolio-sync")
    if TOKEN: req.add_header("Authorization","Bearer "+TOKEN)
    with urllib.request.urlopen(req,timeout=20) as r: return json.loads(r.read().decode())

def repos():
    out=[]
    page=1
    while True:
        batch=get(f"/users/{OWNER}/repos?per_page=100&page={page}&type=owner&sort=updated")
        if not batch: break
        out += batch
        page += 1
    return [r for r in out if r["name"] not in {"cryogenicdeadfrost","cryogenicdeadfrost.github.io"} and not r.get("fork") and not r.get("archived") and r.get("visibility")=="public"]

def state(rs):
    return {r["name"]:{"updated_at":r.get("updated_at",""),"pushed_at":r.get("pushed_at","")} for r in rs}

def read_state():
    if not STATE.exists(): return {}
    try: return json.loads(STATE.read_text()).get("repos",{})
    except Exception: return {}

def readme(name):
    try: return base64.b64decode(get(f"/repos/{OWNER}/{name}/readme")["content"]).decode("utf-8","replace")
    except Exception: return ""

def langs(name):
    try: return get(f"/repos/{OWNER}/{name}/languages")
    except Exception: return {}

def clean(s):
    s=re.sub(r"<!--.*?-->"," ",s,flags=re.S)
    s=re.sub(r"\x60\x60\x60.*?\x60\x60\x60"," ",s,flags=re.S)
    s=re.sub(r"\x60([^\x60]+)\x60",r"\1",s)
    s=re.sub(r"!\[[^]]*\]\([^)]*\)"," ",s)
    s=re.sub(r"\[([^]]+)\]\([^)]*\)",r"\1",s)
    s=re.sub(r"<[^>]+>"," ",s)
    s=re.sub(r"^\s*#+\s*","",s,flags=re.M)
    return re.sub(r"\s+"," ",s).strip()

def build(repo,ov):
    name=repo["name"]
    md=readme(name)
    bits=[clean(x) for x in re.split(r"\n\s*\n+",md) if len(clean(x))>25]
    raw=langs(name)
    total=sum(raw.values()) or 1
    ls=[{"name":k,"bytes":v,"percent":round(v*100/total,1)} for k,v in sorted(raw.items(),key=lambda x:x[1],reverse=True)][:6]
    short=(repo.get("description") or "").strip() or (bits[0] if bits else "A project from the lab.")
    detail=" ".join(x for x in bits if x.lower()!=short.lower())[:900].rstrip() or short
    meta=ov.get(name,{})
    colors=meta.get("colors") or COLORS[hashlib.sha256(name.encode()).digest()[0]%len(COLORS)]
    tags=meta.get("tags") or repo.get("topics",[])[:5] or [x["name"].lower() for x in ls[:3]]
    return {"name":name,"url":repo["html_url"],"description":short.rstrip(".")+".","details":detail,"languages":ls,
            "language_line":" · ".join(x["name"] for x in ls[:4]),"tags":tags,
            "architecture":meta.get("architecture","README → implementation → output"),"quip":meta.get("quip","Built, tested, pushed."),
            "accent":colors[0],"secondary":colors[1]}

def esc(x): return html.escape(str(x),quote=True)

def normal(p):
    return f'<div class="proj">\n<h3><a href="{esc(p["url"])}">{esc(p["name"])}</a> ({esc(p["language_line"])})</h3>\n<p>{esc(p["details"])}</p>\n</div>'

def modern(p,i):
    bars="".join(f'<span style="width:{x["percent"]}%;background:{esc(p["accent"])};"></span>' for x in p["languages"][:4])
    tags="".join(f'<span class="d-proj-tag">{esc(x)}</span>' for x in p["tags"])
    return f'''<div class="d-proj-card reveal reveal-delay-{i%4+1}" style="--card-accent:{esc(p["accent"])};--card-secondary:{esc(p["secondary"])};">
<div class="d-proj-name">{esc(p["name"])}</div><div class="d-proj-lang">{esc(p["language_line"])}</div>
<div class="d-proj-desc">{esc(p["description"])}</div><div class="d-proj-detail-desc" aria-hidden="true">{esc(p["details"])}</div>
<div class="d-proj-tags">{tags}</div><div class="d-proj-reveal"><div class="d-proj-arch">{esc(p["architecture"])}</div>
<div class="d-proj-lang-bar">{bars}</div><div class="d-proj-quip">"{esc(p["quip"])}"</div></div>
<div class="d-proj-footer"><a href="{esc(p["url"])}" class="d-proj-link" target="_blank" rel="noopener noreferrer">github ↗</a></div></div>'''

def gh_card(p):
    lang=p["languages"][0]["name"] if p["languages"] else "—"
    return f'''<a href="{esc(p["url"])}" target="_blank" rel="noopener noreferrer" class="d-gh-repo-card">
<div class="d-gh-repo-name">{esc(p["name"])}</div>
<div class="d-gh-repo-desc">{esc(p["description"])}</div>
<div class="d-gh-repo-meta"><span style="color:{esc(p["accent"])}">● {esc(lang)}</span></div>
</a>'''

def gh_langs(projects):
    totals={}
    for p in projects:
        for x in p["languages"]: totals[x["name"]]=totals.get(x["name"],0)+x["bytes"]
    total=sum(totals.values()) or 1
    palette=["#555","#dea584","#3572A5","#3be133","#00ADD8","#7c3aed","#ff9500","#ff007f"]
    rows=[]
    for i,(name,bytes_) in enumerate(sorted(totals.items(),key=lambda x:x[1],reverse=True)[:6]):
        pct=round(bytes_*100/total)
        rows.append(f'<div class="d-gh-lang-item"><span class="d-gh-lang-dot" style="background:{palette[i%len(palette)]}"></span> {esc(name)} <span style="color:#4b5563">{pct}%</span></div>')
    stops=[]; at=0
    for i,(name,bytes_) in enumerate(sorted(totals.items(),key=lambda x:x[1],reverse=True)[:6]):
        pct=bytes_*100/total
        stops.append(f'{palette[i%len(palette)]} {at:.1f}% {at+pct:.1f}%')
        at+=pct
    return ",".join(stops),"
".join(rows)

def slot(page,start,end,body):
    a=page.index(start)+len(start)
    b=page.index(end,a)
    return page[:a]+"\n"+body+"\n"+page[b:]

def sync():
    rs=repos()
    now=state(rs)
    old=read_state()
    current=set(now)
    tracked=set(json.loads(MANIFEST.read_text()).get("projects",[])) if MANIFEST.exists() else set()
    added=sorted(current-set(old))
    tracked.update(added)
    tracked.intersection_update(current)

    ov=json.loads(OV.read_text()) if OV.exists() else {}
    wanted=[r for r in rs if r["name"] in tracked]
    with ThreadPoolExecutor(max_workers=8) as pool:
        projects=list(pool.map(lambda r:build(r,ov),wanted))
    projects.sort(key=lambda p:p["name"].lower())

    MANIFEST.parent.mkdir(exist_ok=True)
    MANIFEST.write_text(json.dumps({"projects":[p["name"] for p in projects]},indent=2)+"\n")
    STATE.write_text(json.dumps({"repos":now},indent=2,sort_keys=True)+"\n")
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(projects,indent=2,ensure_ascii=False)+"\n")

    path=ROOT/"index.html"
    page=path.read_text()
    page=slot(page,'<div data-projects="normal">','</div><!-- projects-normal-end -->',"\n".join(normal(p) for p in projects))
    page=slot(page,'<div class="d-proj-grid" data-projects="modern">','</div><!-- projects-modern-end -->',"\n".join(modern(p,i) for i,p in enumerate(projects)))
    page=slot(page,'<!-- github-repos-start -->','<!-- github-repos-end -->',"\n".join(gh_card(p) for p in projects))
    donut,legend=gh_langs(projects)
    page=re.sub(r'(<div class="d-gh-donut" id="gh-donut" style="background: )[^"]*(")',r'\1conic-gradient('+donut+r')\2',page)
    page=slot(page,'<!-- github-langs-start -->','<!-- github-langs-end -->',legend)
    path.write_text(page)
    print(f"portfolio sync: {len(projects)} projects, {len(added)} new repos")

def main():
    rs=repos()
    current=state(rs)
    old=read_state()
    changed=current != old
    if "--check" in sys.argv:
        print(f"changed={'true' if changed else 'false'}")
        return
    sync()

if __name__=="__main__": main()
