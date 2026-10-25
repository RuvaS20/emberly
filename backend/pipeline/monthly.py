import json
from calendar import monthrange
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "backend" / "data" / "raw" / "nasa_power"     # written by history.py
OUT = ROOT / "frontend" / "public" / "data" / "monthly_anomaly.json"
OUT.parent.mkdir(parents=True, exist_ok=True)
BASELINE = (1991, 2020)                                      # WMO climate normal period

# 1. Monthly mean of daily max temperature, per district
monthly = {}                                                 # (year, month) -> list of district means
for f in sorted(CACHE.glob("*.json")):
    days = {}
    for d, v in json.loads(f.read_text()).items():
        if v is not None and v > -900:                       # -999 = missing
            days.setdefault((int(d[:4]), int(d[4:6])), []).append(v)
    for (y, m), vals in days.items():
        if len(vals) >= 0.9 * monthrange(y, m)[1]:           # skip part-months (e.g. the current one)
            monthly.setdefault((y, m), []).append(np.mean(vals))

# 2. National average (all districts equally), then the difference from that month's baseline
tmax = {k: float(np.mean(v)) for k, v in monthly.items()}
normal = {m: np.mean([t for (y, mm), t in tmax.items() if mm == m and BASELINE[0] <= y <= BASELINE[1]])
          for m in range(1, 13)}

rows = [{"year": y, "month": m, "tmax": round(t, 2), "anomaly": round(t - normal[m], 2)}
        for (y, m), t in sorted(tmax.items())]
OUT.write_text(json.dumps({
    "baseline": f"{BASELINE[0]}–{BASELINE[1]}",
    "normals": {m: round(float(t), 2) for m, t in normal.items()},
    "districts": len(list(CACHE.glob("*.json"))),
    "source": "NASA POWER daily T2M_MAX at 91 district centroids",
    "rows": rows,
}, indent=1))
print(f"Saved {len(rows)} months ({rows[0]['year']}-{rows[0]['month']:02} to {rows[-1]['year']}-{rows[-1]['month']:02}) to {OUT}")
