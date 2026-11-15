#!/usr/bin/env python3
import json,re
from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=(r/"index.html").read_text()
data_path=r/"generated/projects.json"
if data_path.exists():
    d=json.loads(data_path.read_text())
    assert d and len({x["name"] for x in d})==len(d)
    assert all(x["url"].startswith("https://github.com/") and x["languages"] for x in d)
assert 'data-projects="normal"' in p and 'data-projects="modern"' in p
assert "</html>" in p and not re.search(r'href=["\']javascript:',p,re.I)
print(f"site check: {len(d) if data_path.exists() else 'generated data not built yet'} projects")
