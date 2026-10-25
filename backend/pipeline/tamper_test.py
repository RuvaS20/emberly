import copy, json, sys
from pathlib import Path
from chain import fingerprint, onchain_record

DATA = Path(__file__).resolve().parents[1] / "data"
dates = sorted(p.stem for p in (DATA / "alerts").glob("*.json") if not p.name.endswith(".anchor.json"))
date = sys.argv[1] if len(sys.argv) > 1 else dates[-1]

original = json.loads((DATA / "alerts" / f"{date}.json").read_text())
tampered = copy.deepcopy(original)
d = tampered["districts"][0]["days"][0]
before = d["tmax"]
d["tmax"] = round(before - 2.0, 1)          # quietly lower one temperature by 2°C

rec = onchain_record(date)
for name, data in [("Original", original), ("Tampered", tampered)]:
    fp = fingerprint(data)
    ok = rec is not None and fp == rec["fingerprint"]
    print(f"{name:9} {fp[:16]}...  {'GREEN: matches blockchain' if ok else 'RED: does not match blockchain record'}")

demo = DATA / "demo"
demo.mkdir(exist_ok=True)
(demo / f"{date}.tampered.json").write_text(json.dumps(tampered, indent=2, sort_keys=True))
print(f"\nChanged {tampered['districts'][0]['name']} from {before}°C to {d['tmax']}°C.")
print(f"Saved a tampered copy to {demo} for the dashboard demo.")