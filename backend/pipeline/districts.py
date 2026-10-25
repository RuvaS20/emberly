import json
from pathlib import Path
import geopandas as gpd

RAW = Path("backend/data/raw/zwe_boundaries")
OUT = Path("backend/data")
OUT.mkdir(parents=True, exist_ok=True)

# 1. Find the district-level (admin 2) file
files = [p for p in RAW.rglob("*")
         if any(k in p.name.lower() for k in ("adm2", "admin2")) and p.suffix.lower() in {".shp", ".geojson", ".json", ".gpkg"}]
if not files:
    raise SystemExit(f"No adm2 file found in {RAW}. Check that you unzipped the download there.")
src = files[0]
print("Reading:", src)
gdf = gpd.read_file(src)
print("Columns in the file:", list(gdf.columns))

# 2. Find the name, code and province columns, whatever they're called
def pick(*options):
    lower = {c.lower(): c for c in gdf.columns}
    for o in options:
        if o.lower() in lower:
            return lower[o.lower()]
    return None

name_col = pick("ADM2_EN", "adm2_name", "ADM2_NAME", "shapeName")
code_col = pick("ADM2_PCODE", "adm2_pcode", "shapeID")
prov_col = pick("ADM1_EN", "adm1_name", "ADM1_NAME")
if not name_col:
    raise SystemExit("Couldn't find the district name column. Look at the column list above and add it to pick().")

districts = gpd.GeoDataFrame({
    "id": gdf[code_col] if code_col else gdf.index.astype(str),
    "name": gdf[name_col],
    "province": gdf[prov_col] if prov_col else "",
}, geometry=gdf.geometry, crs=gdf.crs)

# 3. Centroids: compute in metres (UTM zone 36S covers Zimbabwe), then convert back to lat/lon
projected = districts.to_crs(epsg=32736)
pts = projected.geometry.centroid
inside = pts.within(projected.geometry)
pts = pts.where(inside, projected.geometry.representative_point())  # odd shapes: keep the point inside the district
pts = gpd.GeoSeries(pts, crs=32736).to_crs(epsg=4326)

centroids = [
    {"id": str(r.id), "name": r.name, "province": r.province,
     "lat": round(p.y, 4), "lon": round(p.x, 4)}
    for r, p in zip(districts.itertuples(), pts)
]
(OUT / "centroids.json").write_text(json.dumps(centroids, indent=2))

# 4. Boundaries for the map: lat/lon, lightly simplified so the file loads fast in the browser
districts = districts.to_crs(epsg=4326)
districts["geometry"] = districts.geometry.simplify(0.002, preserve_topology=True)
districts.to_file(OUT / "districts.geojson", driver="GeoJSON")

print(f"Saved {len(districts)} districts to {OUT/'districts.geojson'}")
print(f"Saved {len(centroids)} centroids to {OUT/'centroids.json'}")
print("Sample:", centroids[:3])