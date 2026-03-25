#!/usr/bin/env python3
"""Generate southern-provinces-data.js from geoBoundaries Vietnam ADM1 data.

Output format:
  window.SOUTHERN_PROVINCES_GEOJSON = { ... };
"""

from __future__ import annotations

import json
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

SOURCE_URL = (
    "https://github.com/wmgeolab/geoBoundaries/raw/main/"
    "releaseData/gbOpen/VNM/ADM1/geoBoundaries-VNM-ADM1.geojson"
)
OUTPUT_FILE = "southern-provinces-data.js"

MERGED_UNITS = [
    {
        "name": "TP.HCM",
        "components": ["Ho Chi Minh", "Bình Dương", "Bà Rịa–Vũng Tàu"],
    },
    {
        "name": "Đồng Nai",
        "components": ["Đồng Nai", "Bình Phước"],
    },
    {
        "name": "Tây Ninh",
        "components": ["Tây Ninh", "Long An"],
    },
    {
        "name": "Cần Thơ",
        "components": ["Cần Thơ", "Sóc Trăng", "Hậu Giang"],
    },
    {
        "name": "Vĩnh Long",
        "components": ["Bến Tre", "Vĩnh Long", "Trà Vinh"],
    },
    {
        "name": "Đồng Tháp",
        "components": ["Tiền Giang", "Đồng Tháp"],
    },
    {
        "name": "Cà Mau",
        "components": ["Bạc Liêu", "Cà Mau"],
    },
    {
        "name": "An Giang",
        "components": ["An Giang", "Kiên Giang"],
    },
]


def norm(text: str) -> str:
    text = text.replace("–", "-")
    text = "".join(ch for ch in unicodedata.normalize("NFKD", text) if not unicodedata.combining(ch))
    return text.lower().strip()


def feature_name(feature: dict) -> str:
    props = feature.get("properties", {})
    return (
        props.get("shapeName")
        or props.get("name")
        or props.get("ADM1_EN")
        or props.get("shapeISO")
        or ""
    )


def to_multipolygon_coordinates(geometry: dict) -> list:
    geo_type = geometry.get("type")
    coords = geometry.get("coordinates", [])
    if geo_type == "Polygon":
        return [coords]
    if geo_type == "MultiPolygon":
        return coords
    return []


def main() -> None:
    with urlopen(SOURCE_URL, timeout=30) as response:
        source_geojson = json.load(response)

    name_to_feature = {}
    for feature in source_geojson.get("features", []):
        key = norm(feature_name(feature))
        if key:
            name_to_feature[key] = feature

    merged_features = []
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    for merged in MERGED_UNITS:
        merged_name = merged["name"]
        components = merged["components"]

        all_coords = []
        matched_components = []

        for comp in components:
            feature = name_to_feature.get(norm(comp))
            if not feature:
                continue
            matched_components.append(comp)
            all_coords.extend(to_multipolygon_coordinates(feature.get("geometry", {})))

        if not all_coords:
            raise RuntimeError(f"No geometry found for merged unit: {merged_name}")

        merged_features.append(
            {
                "type": "Feature",
                "properties": {
                    "shapeName": merged_name,
                    "shapeCode": merged_name,
                    "components": ", ".join(matched_components),
                    "shapeType": "ADM1-MERGED",
                    "source": "geoBoundaries ADM1 snapshot",
                    "fetchedAt": now,
                },
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": all_coords,
                },
            }
        )

    out = {
        "type": "FeatureCollection",
        "features": merged_features,
    }

    text = "window.SOUTHERN_PROVINCES_GEOJSON = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n"
    Path(OUTPUT_FILE).write_text(text, encoding="utf-8")

    print(f"Generated {OUTPUT_FILE} with {len(merged_features)} merged units.")


if __name__ == "__main__":
    main()
