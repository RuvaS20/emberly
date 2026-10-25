import json, time
from datetime import date, timedelta
from pathlib import Path
import numpy as np
import requests

DATA = Path("backend/data")
CACHE = DATA / "raw" / "nasa_power"          # one file per district, so reruns are instant
CACHE.mkdir(parents=True, exist_ok=True)

CAUTION = 30.05                               # Heil et al. 2026, preterm birth, 5% level
URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
START = "19810101"
END = (date.today() - timedelta(days=7)).strftime("%Y%m%d")   # NASA POWER lags a few days

centroids = json.loads((DATA / "centroids.json").read_text())

def fetch(c):
    f = CACHE / f"{c['id']}.json"
    if f.exists():
        return json.loads(f.read_text())
    params = {"parameters": "T2M_MAX", "community": "RE",
              "latitude": c["lat"], "longitude": c["lon"],
              "start": START, "end": END, "format": "JSON"}
    for attempt in range(3):
        r = requests.get(URL, params=params, timeout=120)
        if r.ok:
            series = r.json()["properties"]["parameter"]["T2M_MAX"]
            f.write_text(json.dumps(series))
            time.sleep(1)                     # be polite to the API
            return series
        print(f"   retry {attempt + 1} for {c['name']} (status {r.status_code})")
        time.sleep(5)
    raise RuntimeError(f"NASA POWER failed for {c['name']}")

local, history = {}, {}
for i, c in enumerate(centroids, 1):
    print(f"[{i}/{len(centroids)}] {c['name']}")
    series = fetch(c)
    vals = {d: v for d, v in series.items() if v is not None and v > -900}  # -999 = missing
    temps = np.array(list(vals.values()))

    local[c["id"]] = {"name": c["name"], "province": c["province"],
                      "p90": round(float(np.percentile(temps, 90)), 1),
                      "p95": round(float(np.percentile(temps, 95)), 1)}

    years = {}
    for d, v in vals.items():
        y = years.setdefault(int(d[:4]), {"hot": 0, "recorded": 0})
        y["recorded"] += 1
        y["hot"] += v >= CAUTION
    history[c["id"]] = {"name": c["name"], "province": c["province"],
                        "years": [{"year": y, "days_at_or_above_30": n["hot"],
                                   "days_recorded": n["recorded"],
                                   "partial": n["recorded"] < 360}
                                  for y, n in sorted(years.items())]}

(DATA / "local_thresholds.json").write_text(json.dumps(local, indent=2))
(DATA / "history.json").write_text(json.dumps(history, indent=2))
print("Saved local_thresholds.json and history.json")