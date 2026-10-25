import io, json, re
from pathlib import Path
import pandas as pd
import requests

DATA = Path(__file__).resolve().parents[1] / "data"
URL = "https://citypopulation.de/en/zimbabwe/admin/"
MANUAL = DATA / "population_manual.csv"     # fallback: columns name,population
OVERRIDES = {                                # {"Boundary Name": "Census Name"} where spellings differ
    "Centenary/ Muzarabani": "Muzarabani (Centenary)",
    "Gokwe South Urban": "Gokwe Urban",
    "Harare": "Harare Urban",                # "Harare Rural" is its own boundary
    "Hurungwe": "Hurungwe (Karoi Rural)",
    "Hwedza": "Hwedza (Wedza)",
    "Plumtree": "Mangwe Urban (Plumtree)",
    "Shurugwi Town": "Shurugwi Urban",
    "Uzumba Maramba Pfungwe": "Uzumba-Maramba-Pfungwe (UMP)",
}

def load_census():
    if MANUAL.exists():
        df = pd.read_csv(MANUAL)
        return {str(n).strip(): int(p) for n, p in zip(df.name, df.population)}
    html = requests.get(URL, headers={"User-Agent": "Mozilla/5.0"}, timeout=60).text
    t = max(pd.read_html(io.StringIO(html)), key=len)
    name_col = t.columns[0]
    pop_col = [c for c in t.columns if "2022" in str(c)][0]
    status_col = next((c for c in t.columns if "status" in str(c).lower()), None)
    if status_col is not None:
        t = t[~t[status_col].astype(str).str.contains("Province", case=False)]
    out = {}
    for n, p in zip(t[name_col], t[pop_col]):
        n = str(n).strip()
        if n.lower() == "zimbabwe":
            continue
        try:
            out[n] = int(re.sub(r"[^\d]", "", str(p)))
        except ValueError:
            pass
    return out

census = load_census()
by_lower = {k.lower(): k for k in census}
centroids = json.loads((DATA / "centroids.json").read_text())

result, unmatched, used = {}, [], {}
for c in centroids:
    name = OVERRIDES.get(c["name"], c["name"])
    # "Chiredzi" is the rural district: "Chiredzi Urban" has its own boundary, so never sum the two
    key = next((by_lower[n.lower()] for n in (name, f"{name} Rural") if n.lower() in by_lower), None)
    if key is None:
        unmatched.append(c["name"])
        continue
    result[c["id"]] = {"name": c["name"], "population": census[key], "matched": key}
    used.setdefault(key, []).append(c["name"])

(DATA / "population.json").write_text(json.dumps(result, indent=2))
total = sum(r["population"] for r in result.values())
print(f"Matched {len(result)}/{len(centroids)} districts. Total population: {total:,} (census total: {sum(census.values()):,})")
if unmatched:
    print("Unmatched (add to OVERRIDES):", unmatched)
dupes = {k: v for k, v in used.items() if len(v) > 1}
if dupes:
    print("Census entries counted more than once (fix in OVERRIDES):", dupes)
missing = sorted(set(census) - set(used))
if missing:
    print("Census entries not used:", missing)