#!/usr/bin/env python3
"""
Generate PMTiles from DuckDB spatial data.

Requirements:
- tippecanoe (brew install tippecanoe / apt-get install tippecanoe)
- pmtiles (pip install pmtiles)
- duckdb (pip install duckdb)
"""

import duckdb
import json
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "duckdb" / "opendata.db"
OUTPUT_DIR = PROJECT_ROOT / "data" / "tiles"


def export_provinces(conn) -> tuple[Path, Path]:
    """Export provinces as GeoJSON (polygons + centroids)."""
    sql = """
        SELECT json_group_array(json_object(
            'type', 'Feature',
            'properties', json_object(
                'id', p.id,
                'name', p.name
            ),
            'geometry', json(ST_AsGeoJSON(p.geometry))
        )) as features
        FROM provinces p
    """

    result = conn.execute(sql).fetchone()
    features = json.loads(result[0]) if result and result[0] else []

    geojson = {"type": "FeatureCollection", "features": features}
    output_path = OUTPUT_DIR / "provinces.geojson"
    output_path.write_text(json.dumps(geojson))

    centroids_sql = """
        SELECT json_group_array(json_object(
            'type', 'Feature',
            'properties', json_object(
                'id', p.id,
                'name', p.name
            ),
            'geometry', json(ST_AsGeoJSON(ST_Centroid(p.geometry)))
        )) as features
        FROM provinces p
    """

    result = conn.execute(centroids_sql).fetchone()
    centroid_features = json.loads(result[0]) if result and result[0] else []

    centroids_geojson = {"type": "FeatureCollection", "features": centroid_features}
    centroids_path = OUTPUT_DIR / "province-labels.geojson"
    centroids_path.write_text(json.dumps(centroids_geojson))

    print(f"Exported {len(features)} provinces to {output_path}")
    print(f"Exported {len(centroid_features)} province centroids to {centroids_path}")
    return output_path, centroids_path


def export_regions(conn) -> tuple[Path, Path]:
    """Export regions as GeoJSON (polygons + centroids)."""
    sql = """
        SELECT json_group_array(json_object(
            'type', 'Feature',
            'properties', json_object(
                'id', r.id,
                'name', r.name,
                'province', r.province,
                'type', r.type
            ),
            'geometry', json(ST_AsGeoJSON(r.geometry))
        )) as features
        FROM regions r
    """

    result = conn.execute(sql).fetchone()
    features = json.loads(result[0]) if result and result[0] else []

    geojson = {"type": "FeatureCollection", "features": features}
    output_path = OUTPUT_DIR / "regions.geojson"
    output_path.write_text(json.dumps(geojson))

    centroids_sql = """
        SELECT json_group_array(json_object(
            'type', 'Feature',
            'properties', json_object(
                'id', r.id,
                'name', r.name,
                'province', r.province,
                'type', r.type
            ),
            'geometry', json(ST_AsGeoJSON(ST_Centroid(r.geometry)))
        )) as features
        FROM regions r
    """

    result = conn.execute(centroids_sql).fetchone()
    centroid_features = json.loads(result[0]) if result and result[0] else []

    centroids_geojson = {"type": "FeatureCollection", "features": centroid_features}
    centroids_path = OUTPUT_DIR / "region-labels.geojson"
    centroids_path.write_text(json.dumps(centroids_geojson))

    print(f"Exported {len(features)} regions to {output_path}")
    print(f"Exported {len(centroid_features)} region centroids to {centroids_path}")
    return output_path, centroids_path


def generate_pmtiles(
    provinces_path: Path,
    province_labels_path: Path,
    regions_path: Path,
    region_labels_path: Path
) -> Path:
    """Generate pmtiles directly using tippecanoe."""
    output_path = OUTPUT_DIR / "indonesia.pmtiles"

    cmd = [
        "tippecanoe",
        "-o", str(output_path),
        "--force",
        "--minimum-zoom=3",
        "--maximum-zoom=10",
        f"--named-layer=provinces:{provinces_path}",
        f"--named-layer=province-labels:{province_labels_path}",
        f"--named-layer=regions:{regions_path}",
        f"--named-layer=region-labels:{region_labels_path}",
        "--simplification=10",
        "--detect-shared-borders",
        "--no-feature-limit",
        "--no-tile-size-limit",
        "--buffer=64",
        "-r1",
        "-B3",
    ]

    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"Generated {output_path} ({size_mb:.2f} MB)")
    return output_path


def cleanup(*paths: Path):
    """Remove intermediate files."""
    for path in paths:
        if path.exists():
            path.unlink()
            print(f"Removed {path}")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Connecting to {DB_PATH}...")
    conn = duckdb.connect(str(DB_PATH), read_only=True)
    conn.execute("LOAD spatial")

    provinces_path, province_labels_path = export_provinces(conn)
    regions_path, region_labels_path = export_regions(conn)
    conn.close()

    pmtiles_path = generate_pmtiles(
        provinces_path, province_labels_path,
        regions_path, region_labels_path
    )

    cleanup(provinces_path, province_labels_path, regions_path, region_labels_path)

    print(f"\nDone! Output: {pmtiles_path}")


if __name__ == "__main__":
    main()
