#!/usr/bin/env python3
"""
Generate static GeoJSON files for CDN serving.
Run at deploy time to avoid runtime DB queries for map data.
"""

import json
import gzip
import duckdb
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "data/duckdb/opendata.db"
OUTPUT_DIR = PROJECT_ROOT / "data/geojson"


def get_latest_year(conn) -> int:
    result = conn.execute("SELECT MAX(year) FROM wages").fetchone()
    return result[0] if result[0] else 2026


def generate_provinces(conn, year: int):
    """Generate provinces GeoJSON with wage stats."""
    print("Generating provinces.geojson...")

    sql = """
        WITH province_stats AS (
            SELECT
                r.province,
                AVG(w.umr) as avg_umr,
                COUNT(r.id) as region_count
            FROM regions r
            LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
            GROUP BY r.province
        )
        SELECT
            p.name,
            ST_AsGeoJSON(p.geometry) as geometry,
            COALESCE(ps.region_count, 0) as region_count,
            ps.avg_umr
        FROM provinces p
        LEFT JOIN province_stats ps ON p.name = ps.province
        ORDER BY p.name
    """

    rows = conn.execute(sql, [year]).fetchall()

    features = []
    for name, geom, region_count, avg_umr in rows:
        features.append({
            "type": "Feature",
            "geometry": json.loads(geom),
            "properties": {
                "name": name,
                "regionCount": region_count,
                "avgUmr": float(avg_umr) if avg_umr else None
            }
        })

    geojson = {"type": "FeatureCollection", "features": features}
    return geojson


def generate_regions(conn, year: int):
    """Generate kabupaten/kota GeoJSON with wages."""
    print("Generating regions.geojson...")

    sql = """
        SELECT
            r.id,
            r.name,
            r.province,
            r.type,
            ST_AsGeoJSON(r.geometry) as geometry,
            w.umr
        FROM regions r
        LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
        ORDER BY r.province, r.name
    """

    rows = conn.execute(sql, [year]).fetchall()

    features = []
    for id, name, province, rtype, geom, umr in rows:
        features.append({
            "type": "Feature",
            "id": id,
            "geometry": json.loads(geom),
            "properties": {
                "id": id,
                "name": name,
                "province": province,
                "type": rtype,
                "umr": float(umr) if umr else None,
                "costs": {}
            }
        })

    geojson = {"type": "FeatureCollection", "features": features}
    return geojson


def write_geojson(data: dict, name: str):
    """Write GeoJSON and gzipped version."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    json_path = OUTPUT_DIR / f"{name}.geojson"
    gz_path = OUTPUT_DIR / f"{name}.geojson.gz"

    json_str = json.dumps(data, separators=(',', ':'))

    with open(json_path, 'w') as f:
        f.write(json_str)

    with gzip.open(gz_path, 'wt', compresslevel=9) as f:
        f.write(json_str)

    json_size = json_path.stat().st_size
    gz_size = gz_path.stat().st_size
    ratio = (1 - gz_size / json_size) * 100

    print(f"  {name}.geojson: {json_size:,} bytes")
    print(f"  {name}.geojson.gz: {gz_size:,} bytes ({ratio:.1f}% smaller)")


def main():
    print(f"Connecting to {DB_PATH}")
    conn = duckdb.connect(str(DB_PATH), read_only=True)
    conn.execute("LOAD spatial")

    year = get_latest_year(conn)
    print(f"Using year: {year}\n")

    provinces = generate_provinces(conn, year)
    write_geojson(provinces, "provinces")
    print(f"  {len(provinces['features'])} provinces\n")

    regions = generate_regions(conn, year)
    write_geojson(regions, "regions")
    print(f"  {len(regions['features'])} regions\n")

    conn.close()
    print("Done!")


if __name__ == "__main__":
    main()
