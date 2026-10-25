import json, sys, time
from datetime import datetime, timezone
from pathlib import Path
import requests
from classify import classify, CUTS
from estimate import extra_preterm, CRUDE_BIRTH_RATE, BASELINE_PRETERM, UPPER_ADDED_RISK

DATA = Path(__file__).resolve().parents[1] / "data"
ALERTS = DATA / "alerts"
ALERTS.mkdir(exist_ok=True)
URL = "https://api.open-meteo.com/v1/forecast"

centroids = json.loads((DATA / "centroids.json").read_text())
local = json.loads((DATA / "local_thresholds.json").read_text())
population = json.loads((DATA / "population.json").read_text())

def fetch(batch):
    params = {"latitude": ",".join(str(c["lat"]) for c in batch),
              "longitude": ",".join(str(c["lon"]) for c in batch),
              "daily": "temperature_2m_max,temperature_2m_min",
              "forecast_days": 7, "timezone": "Africa/Harare"}
    r = requests.get(URL, params=params, timeout=60)
    r.raise_for_status()
    data = r.json()
    return data if isinstance(data, list) else [data]

results = []
for i in range(0, len(centroids), 50):                  # Open-Meteo takes many locations per call
    batch = centroids[i:i + 50]
    results += fetch(batch)
    time.sleep(1)

districts = []
for c, fc in zip(centroids, results):
    p95 = local.get(c["id"], {}).get("p95")
    pop = population.get(c["id"], {}).get("population")
    days = []
    for date, tmax, tmin in zip(fc["daily"]["time"], fc["daily"]["temperature_2m_max"], fc["daily"]["temperature_2m_min"]):
        k = classify(tmax, p95 if p95 is not None else 99)
        k.update({"date": date, "tmin": round(tmin, 1),
                  "extra_preterm": round(extra_preterm(pop, k["added_risk"]), 2) if pop else None,
                  "extra_preterm_upper": round(extra_preterm(pop, UPPER_ADDED_RISK), 2) if pop and k["added_risk"] > 0 else 0 if pop else None})
        days.append(k)
    week = [d["extra_preterm"] for d in days if d["extra_preterm"] is not None]
    upper = [d["extra_preterm_upper"] for d in days if d["extra_preterm_upper"] is not None]
    districts.append({"id": c["id"], "name": c["name"], "province": c["province"],
                      "population": pop, "p95": p95, "days": days,
                      "week_extra_preterm": round(sum(week), 1) if pop else None,
                      "week_extra_preterm_upper": round(sum(upper), 1) if pop else None})

today = districts[0]["days"][0]["date"]
out = ALERTS / f"{today}.json"
if out.exists() and (ALERTS / f"{today}.anchor.json").exists():
    sys.exit(f"{out.name} is already anchored on-chain. Not overwriting it.")
if out.exists() and "--force" not in sys.argv:
    sys.exit(f"{out.name} exists. Run with --force to replace it (only before anchoring).")

alert = {
    "date": today,
    "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "label": "Zimbabwe daily pregnancy heat alerts",
    "method": {"thresholds_tmax_c": CUTS, "threshold_source": "Heil et al. 2026, preterm birth",
               "local_boost": "one level up if Tmax >= district 95th percentile (NASA POWER 1981-present)",
               "crude_birth_rate": CRUDE_BIRTH_RATE, "baseline_preterm": BASELINE_PRETERM,
               "upper_added_risk": UPPER_ADDED_RISK, "estimate_note": "modelled estimate, not a prediction"},
    "sources": ["Open-Meteo forecast", "NASA POWER", "ZIMSTAT 2022 census", "HDX COD-AB"],
    "districts": districts,
}
out.write_text(json.dumps(alert, indent=2, sort_keys=True))
alerting = sum(d["days"][0]["level"] != "Normal" for d in districts)
print(f"Saved {out}: {alerting}/{len(districts)} districts on alert today")