import hashlib, json, sys
from datetime import datetime, timezone
from pathlib import Path
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(str(Path(__file__).resolve().parents[1] / "pipeline"))
from chain import fingerprint, onchain_record

DATA = Path(__file__).resolve().parents[1] / "data"
ALERTS = DATA / "alerts"

app = FastAPI(title="Pregnancy Heat Alerts API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def load(path):
    if not path.exists():
        raise HTTPException(404, f"{path.name} not found")
    return json.loads(path.read_text())

def alert_dates():
    return sorted(p.stem for p in ALERTS.glob("*.json") if not p.name.endswith(".anchor.json"))

def latest_alert():
    dates = alert_dates()
    if not dates:
        raise HTTPException(404, "No alerts yet. Run backend/pipeline/forecast.py")
    return load(ALERTS / f"{dates[-1]}.json")

def find(items, key):
    key = key.lower()
    for k, v in items:
        if k.lower() == key or v.get("name", "").lower() == key:
            return v
    raise HTTPException(404, f"District '{key}' not found")

@app.get("/districts")
def districts(day: int = 0):
    """GeoJSON coloured by risk level. day=0 is today, up to day=6."""
    geo = load(DATA / "districts.geojson")
    alert = latest_alert()
    by_id = {str(d["id"]): d for d in alert["districts"]}
    for f in geo["features"]:
        d = by_id.get(str(f["properties"].get("id")))
        if d and 0 <= day < len(d["days"]):
            f["properties"].update({k: d["days"][day][k] for k in ("date", "tmax", "level", "colour", "boosted")})
            f["properties"]["week_extra_preterm"] = d["week_extra_preterm"]
    return geo

@app.get("/forecast/{district}")
def forecast(district: str):
    alert = latest_alert()
    return find(((str(d["id"]), d) for d in alert["districts"]), district)

@app.get("/history")
def all_history():
    """Yearly hot-day counts for every district, keyed by id (for the heat stripes)."""
    return load(DATA / "history.json")

@app.get("/history/{district}")
def history(district: str):
    return find(load(DATA / "history.json").items(), district)

@app.get("/alerts")
def list_alerts():
    return alert_dates()

@app.get("/alerts/{date}")
def get_alert(date: str):
    alert = load(ALERTS / f"{date}.json")
    anchor_file = ALERTS / f"{date}.anchor.json"
    return {"alert": alert, "fingerprint": fingerprint(alert),
            "anchor": json.loads(anchor_file.read_text()) if anchor_file.exists() else None}

def check(date: str, alert: dict):
    fp = fingerprint(alert)
    rec = onchain_record(date)
    anchor_file = ALERTS / f"{date}.anchor.json"
    anchor = json.loads(anchor_file.read_text()) if anchor_file.exists() else {}
    if rec is None:
        status = "not_anchored"
    else:
        status = "verified" if rec["fingerprint"] == fp else "tampered"
    return {
        "date": date,
        "status": status,                       # verified = green, tampered = red
        "fingerprint": fp,
        "onchain_fingerprint": rec["fingerprint"] if rec else None,
        "anchored_at": datetime.fromtimestamp(rec["timestamp"], timezone.utc).isoformat() if rec else None,
        "explorer_tx": anchor.get("explorer_tx"),
    }

@app.get("/verify/{date}")
def verify_file_on_disk(date: str):
    """Checks the saved file for that date against the blockchain."""
    return check(date, load(ALERTS / f"{date}.json"))

@app.post("/verify")
def verify_upload(payload: dict = Body(...)):
    """Upload an alert file as-is (or {"date":..., "alert":...}) and check it."""
    alert = payload.get("alert", payload)
    date = payload.get("date") or alert.get("date")
    if not date:
        raise HTTPException(400, "Couldn't find a date in the file")
    return check(date, alert)