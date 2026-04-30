from __future__ import annotations

import csv
import json
import math
import re
from pathlib import Path
import argparse

def circle_ring(cx: float, cy: float, radius: float, n: int = 18, rot_deg: float = 0.0) -> list[tuple[float, float]]:
    # Sinh polygon hình tròn quanh tâm (cx, cy)
    a0 = math.radians(rot_deg)
    return [
        (
            cx + radius * math.cos(a0 + 2 * math.pi * i / n),
            cy + radius * math.sin(a0 + 2 * math.pi * i / n)
        )
        for i in range(n)
    ] + [(
        cx + radius * math.cos(a0),
        cy + radius * math.sin(a0)
    )]

def arch_ring(cx: float, cy: float, w: float, d: float, rot_deg: float = 0.0, n: int = 12) -> list[tuple[float, float]]:
    # Sinh polygon hình cửa vòm chữ U (nửa ellipse + đáy)
    hw = w / 2.0
    hd = d / 2.0
    pts = []
    for i in range(n + 1):
        t = math.pi * i / n
        x = hw * math.cos(t)
        y = hd * math.sin(t)
        pts.append((cx + x, cy + y))
    pts.append((cx + hw, cy - hd))
    pts.append((cx - hw, cy - hd))
    pts.append(pts[0])
    if abs(rot_deg) > 1e-9:
        a = math.radians(rot_deg)
        c = math.cos(a)
        s = math.sin(a)
        pts = [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in pts]
    return pts

def roof_tier_ring(cx: float, cy: float, w: float, d: float, rot_deg: float = 0.0) -> list[tuple[float, float]]:
    # Sinh polygon mái dốc hình thang
    hw = w / 2.0
    hd = d / 2.0
    pts = [(-hw, -hd), (hw, -hd), (hw * 0.7, hd), (-hw * 0.7, hd)]
    if abs(rot_deg) < 1e-9:
        out = [(cx + x, cy + y) for x, y in pts]
    else:
        a = math.radians(rot_deg)
        c = math.cos(a)
        s = math.sin(a)
        out = [(cx + x * c - y * s, cy + x * s + y * c) for x, y in pts]
    out.append(out[0])
    return out

ANCHOR_LON = 106.70015
ANCHOR_LAT = 10.77995
OUT_NAME = "buu-dien-central-lod3.geojson"

# Sheet transform defaults (meters / degrees)
# rotate_deg: positive = clockwise rotation
SHEET_ROTATE_DEG = 45.0
SHEET_OFFSET_EAST_M = -6.0
SHEET_OFFSET_NORTH_M = 0.0


def meters_per_deg(lat: float) -> tuple[float, float]:
    m_lat = 111_320.0
    m_lon = m_lat * math.cos(math.radians(lat))
    return m_lon, m_lat


def parse_num(v: str, default: float = 0.0) -> float:
    s = (v or "").strip()
    if not s or s.lower() == "auto":
        return default
    try:
        return float(s)
    except ValueError:
        return default


def parse_int(v: str, default: int = 1) -> int:
    s = (v or "").strip()
    if not s or s.lower() == "auto":
        return default
    try:
        return max(1, int(float(s)))
    except ValueError:
        return default


def parse_color(v: str) -> str:
    s = (v or "").strip()
    if re.match(r"^#[0-9a-fA-F]{6}$", s):
        return s
    return "#D9C07F"


def slug(text: str) -> str:
    s = (text or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "part"


def rect_ring(cx: float, cy: float, w: float, d: float, rot_deg: float = 0.0) -> list[tuple[float, float]]:
    hw = max(0.05, w) / 2.0
    hd = max(0.05, d) / 2.0
    pts = [(-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd)]
    if abs(rot_deg) < 1e-9:
        out = [(cx + x, cy + y) for x, y in pts]
    else:
        a = math.radians(rot_deg)
        c = math.cos(a)
        s = math.sin(a)
        out = [(cx + x * c - y * s, cy + x * s + y * c) for x, y in pts]
    out.append(out[0])
    return out


def tiled_rect_rings(cx: float, cy: float, w: float, d: float, rot_deg: float, nx: int, ny: int) -> list[list[tuple[float, float]]]:
    nx = max(1, min(8, nx))
    ny = max(1, min(8, ny))
    if nx == 1 and ny == 1:
        return [rect_ring(cx, cy, w, d, rot_deg)]

    cell_w = max(0.05, w / nx)
    cell_d = max(0.05, d / ny)
    start_x = cx - w / 2 + cell_w / 2
    start_y = cy - d / 2 + cell_d / 2

    rings: list[list[tuple[float, float]]] = []
    for ix in range(nx):
        for iy in range(ny):
            sub_cx = start_x + ix * cell_w
            sub_cy = start_y + iy * cell_d
            rings.append(rect_ring(sub_cx, sub_cy, cell_w, cell_d, rot_deg))
    return rings


def to_lonlat_ring(ring_m: list[tuple[float, float]], base_lon: float, base_lat: float,
                   rotate_deg: float | None = None, offset_e: float | None = None, offset_n: float | None = None) -> list[list[float]]:
    """
    Convert a list of local-meter coordinates to lon/lat using base_lon/base_lat.
    Optionally apply a clockwise rotation (degrees) and meter offsets (east, north)
    before converting to geographic coordinates. If rotate_deg/offsets are None
    the module-level SHEET_* defaults are used.
    """
    if rotate_deg is None:
        rotate_deg = SHEET_ROTATE_DEG
    if offset_e is None:
        offset_e = SHEET_OFFSET_EAST_M
    if offset_n is None:
        offset_n = SHEET_OFFSET_NORTH_M

    m_lon, m_lat = meters_per_deg(base_lat)
    out: list[list[float]] = []

    # If no transform requested, fast-path to previous behaviour
    if abs(rotate_deg) < 1e-9 and abs(offset_e) < 1e-9 and abs(offset_n) < 1e-9:
        for x_m, y_m in ring_m:
            lon = base_lon + x_m / m_lon
            lat = base_lat + y_m / m_lat
            out.append([round(lon, 9), round(lat, 9)])
        return out

    # Apply clockwise rotation and offsets (meters), then convert
    a = math.radians(rotate_deg)
    c = math.cos(a)
    s = math.sin(a)
    for x_m, y_m in ring_m:
        # clockwise rotation: re = c*x + s*y ; rn = -s*x + c*y
        xr = c * x_m + s * y_m + offset_e
        yr = -s * x_m + c * y_m + offset_n
        lon = base_lon + xr / m_lon
        lat = base_lat + yr / m_lat
        out.append([round(lon, 9), round(lat, 9)])
    return out


def distribute_perimeter(i: int, n: int, w: float, d: float, inset: float) -> tuple[float, float, float]:
    n = max(1, n)
    t = i / n
    w2 = max(2.0, w - inset * 2)
    d2 = max(2.0, d - inset * 2)
    per = 2 * (w2 + d2)
    s = t * per

    if s < w2:
        return (-w2 / 2 + s, -d2 / 2, 0.0)
    s -= w2
    if s < d2:
        return (w2 / 2, -d2 / 2 + s, 90.0)
    s -= d2
    if s < w2:
        return (w2 / 2 - s, d2 / 2, 0.0)
    s -= w2
    return (-w2 / 2, d2 / 2 - s, 90.0)


def build_features(rows: list[dict[str, str]], width: float, depth: float) -> list[dict]:
    features: list[dict] = []
    fid = 1

    for row in rows:
        comp = slug(row.get("component", ""))
        sub = slug(row.get("sub_component", ""))
        shape = slug(row.get("shape_type", ""))
        part_type = f"{comp}-{sub}" if sub else comp

        count = parse_int(row.get("count", "1"), 1)
        min_h = parse_num(row.get("min_height_m", "0"), 0.0)
        max_h = parse_num(row.get("height_m", "0"), min_h + 1.0)
        if max_h < min_h:
            max_h = min_h + 0.5
        extrude_h = max(0.1, max_h - min_h)

        w = parse_num(row.get("width_m", "auto"), 0.0)
        d = parse_num(row.get("depth_m", "auto"), 0.0)
        th = parse_num(row.get("thickness_m", "auto"), 0.0)
        off_x = parse_num(row.get("offset_x_m", "0"), 0.0)
        off_y = parse_num(row.get("offset_y_m", "0"), 0.0)
        rot = parse_num(row.get("rotation_deg", "0"), 0.0)
        color = parse_color(row.get("color_hex", ""))

        if w <= 0:
            w = 0.45 if "column" in sub else 1.4 if "window" in comp else width * 0.85
        if d <= 0:
            d = 0.55 if "column" in sub else 0.35 if "window" in comp else depth * 0.65
        if th > 0 and d < th:
            d = th

        n = count if count <= 120 else 120
        for i in range(n):
            cx = off_x
            cy = off_y
            r = rot

            if comp in {"window", "facade"} or "window" in sub or "column" in sub:
                px, py, pr = distribute_perimeter(i, n, width, depth, inset=1.2)
                cx += px
                cy += py
                r += pr
                if "window" in comp or "window" in sub:
                    d_use = max(0.12, min(d, 0.35))
                    w_use = max(0.25, min(w, 1.2))
                else:
                    d_use = max(0.2, min(d, 0.8))
                    w_use = max(0.2, min(w, 0.9))
            elif comp == "stairs" or "stair" in sub or "step" in shape:
                # Place step bands in front area.
                d_use = max(0.35, d)
                w_use = max(width * 0.34, w)
                cy = -depth * 0.58 - i * (d_use * 0.65)
            elif comp == "roof":
                if "wing-left" in sub:
                    cx = -width * 0.24 + off_x
                    cy = -depth * 0.02 + off_y
                    d_use = max(depth * 0.56, d)
                    w_use = max(width * 0.34, w)
                elif "wing-right" in sub:
                    cx = width * 0.24 + off_x
                    cy = -depth * 0.02 + off_y
                    d_use = max(depth * 0.56, d)
                    w_use = max(width * 0.34, w)
                elif "center-pyramid" in sub:
                    cx = off_x
                    cy = -depth * 0.04 + off_y
                    d_use = max(depth * 0.42, d)
                    w_use = max(width * 0.28, w)
                elif "upper-bay-left" in sub:
                    cx = -width * 0.14 + off_x
                    cy = -depth * 0.05 + off_y
                    d_use = max(depth * 0.16, d)
                    w_use = max(width * 0.18, w)
                elif "upper-bay-right" in sub:
                    cx = width * 0.14 + off_x
                    cy = -depth * 0.05 + off_y
                    d_use = max(depth * 0.16, d)
                    w_use = max(width * 0.18, w)
                elif "roof-top-bay" in sub:
                    d_use = max(depth * 0.22, d)
                    w_use = max(width * 0.22, w)
                    cy = -depth * 0.05 + off_y
                else:
                    d_use = max(depth * 0.30, d)
                    w_use = max(width * 0.44, w)
            elif comp == "mass":
                if "base-mass" in sub:
                    d_use = max(depth * 0.92, d)
                    w_use = max(width * 0.98, w)
                    cy = -depth * 0.02 + off_y
                elif "main-body" in sub:
                    d_use = max(depth * 0.74, d)
                    w_use = max(width * 0.90, w)
                    cy = -depth * 0.01 + off_y
                elif "wing-mass-left" in sub:
                    d_use = max(depth * 0.62, d)
                    w_use = max(width * 0.30, w)
                    cx = -width * 0.25 + off_x
                elif "wing-mass-right" in sub:
                    d_use = max(depth * 0.62, d)
                    w_use = max(width * 0.30, w)
                    cx = width * 0.25 + off_x
                elif "wing-mass" in sub:
                    d_use = max(depth * 0.62, d)
                    w_use = max(width * 0.30, w)
                    cx = (-width * 0.25 if i % 2 == 0 else width * 0.25) + off_x
                elif "portal-mass" in sub:
                    d_use = max(depth * 0.24, d)
                    w_use = max(width * 0.24, w)
                    cy = -depth * 0.34 + off_y
                elif "upper-block" in sub:
                    d_use = max(depth * 0.36, d)
                    w_use = max(width * 0.56, w)
                    cy = -depth * 0.05 + off_y
                else:
                    d_use = max(depth * 0.72, d)
                    w_use = max(width * 0.86, w)
            elif comp == "envelope":
                d_use = max(depth * 0.86, d)
                w_use = max(width * 0.94, w)
            elif comp in {"decor", "entrance"}:
                d_use = max(0.2, min(depth * 0.9, d if d > 0 else 0.35))
                w_use = max(width * 0.5, min(width * 0.92, w if w > 0 else width * 0.8))
                if comp == "entrance":
                    cy = -depth * 0.43 + off_y
                    if "grand-arch-inner" in sub:
                        w_use = max(width * 0.18, min(width * 0.30, w if w > 0 else width * 0.22))
                        d_use = max(depth * 0.18, d if d > 0 else depth * 0.2)
                    elif "grand-arch" in sub:
                        w_use = max(width * 0.24, min(width * 0.36, w if w > 0 else width * 0.28))
                        d_use = max(depth * 0.22, d if d > 0 else depth * 0.24)
                else:
                    cy = 0.0
            else:
                d_use = d
                w_use = w


            # Tăng chi tiết chia nhỏ theo count, hoặc tự động với các nhóm lớn
            nx = 1
            ny = 1
            if comp == "facade":
                nx = max(2, min(6, int(math.sqrt(count) + 1)))
                ny = max(1, min(4, int(count / nx) or 1))
            elif comp == "window":
                nx = max(1, min(4, count))
                ny = 1
            elif comp == "roof":
                nx = max(1, min(4, int(math.sqrt(count) + 1)))
                ny = max(1, min(3, int(count / nx) or 1))
            elif comp in {"mass", "decor", "entrance"}:
                nx = max(1, min(3, int(math.sqrt(count) + 1)))
                ny = max(1, min(3, int(count / nx) or 1))


            # Sheet: geometry luôn là mặt phẳng đáy (min_height), extrude lên đến height
            # Sinh hình học đặc biệt nếu có
            if "circle" in shape:
                for ring_m in [circle_ring(cx, cy, max(w_use, d_use) / 2.0, n=18, rot_deg=r)]:
                    ring_ll = to_lonlat_ring(ring_m, ANCHOR_LON, ANCHOR_LAT)
                    feat = {
                        "type": "Feature",
                        "id": fid,
                        "properties": {
                            "name": row.get("component", "component"),
                            "component_id": row.get("component_id", ""),
                            "component": row.get("component", ""),
                            "sub_component": row.get("sub_component", ""),
                            "part_type": part_type,
                            "min_height": round(min_h, 3),
                            "height": round(max_h, 3),
                            "extrude_height": round(extrude_h, 3),
                            "color": color,
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [ring_ll],
                        },
                    }
                    features.append(feat)
                    fid += 1
            elif "arch" in shape:
                for ring_m in [arch_ring(cx, cy, w_use, d_use, rot_deg=r, n=14)]:
                    ring_ll = to_lonlat_ring(ring_m, ANCHOR_LON, ANCHOR_LAT)
                    feat = {
                        "type": "Feature",
                        "id": fid,
                        "properties": {
                            "name": row.get("component", "component"),
                            "component_id": row.get("component_id", ""),
                            "component": row.get("component", ""),
                            "sub_component": row.get("sub_component", ""),
                            "part_type": part_type,
                            "min_height": round(min_h, 3),
                            "height": round(max_h, 3),
                            "extrude_height": round(extrude_h, 3),
                            "color": color,
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [ring_ll],
                        },
                    }
                    features.append(feat)
                    fid += 1
            elif "roof_tier" in shape:
                for ring_m in [roof_tier_ring(cx, cy, w_use, d_use, rot_deg=r)]:
                    ring_ll = to_lonlat_ring(ring_m, ANCHOR_LON, ANCHOR_LAT)
                    feat = {
                        "type": "Feature",
                        "id": fid,
                        "properties": {
                            "name": row.get("component", "component"),
                            "component_id": row.get("component_id", ""),
                            "component": row.get("component", ""),
                            "sub_component": row.get("sub_component", ""),
                            "part_type": part_type,
                            "min_height": round(min_h, 3),
                            "height": round(max_h, 3),
                            "extrude_height": round(extrude_h, 3),
                            "color": color,
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [ring_ll],
                        },
                    }
                    features.append(feat)
                    fid += 1
            else:
                for ring_m in tiled_rect_rings(cx, cy, w_use, d_use, r, nx, ny):
                    ring_ll = to_lonlat_ring(ring_m, ANCHOR_LON, ANCHOR_LAT)
                    feat = {
                        "type": "Feature",
                        "id": fid,
                        "properties": {
                            "name": row.get("component", "component"),
                            "component_id": row.get("component_id", ""),
                            "component": row.get("component", ""),
                            "sub_component": row.get("sub_component", ""),
                            "part_type": part_type,
                            "min_height": round(min_h, 3),
                            "height": round(max_h, 3),
                            "extrude_height": round(extrude_h, 3),
                            "color": color,
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [ring_ll],
                        },
                    }
                    features.append(feat)
                    fid += 1

    return features


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    # CLI: allow overriding sheet transform parameters when generating GeoJSON
    parser = argparse.ArgumentParser(description="Generate LOD3 GeoJSON (optional sheet rotation/offset)")
    parser.add_argument("--sheet-rotate-deg", type=float, default=SHEET_ROTATE_DEG,
                        help="Rotate sheet clockwise (degrees)")
    parser.add_argument("--sheet-offset-east", type=float, default=SHEET_OFFSET_EAST_M,
                        help="Offset sheet east (meters)")
    parser.add_argument("--sheet-offset-north", type=float, default=SHEET_OFFSET_NORTH_M,
                        help="Offset sheet north (meters)")
    args = parser.parse_args()
    # apply CLI overrides to module-level defaults without using 'global'
    globals()["SHEET_ROTATE_DEG"] = args.sheet_rotate_deg
    globals()["SHEET_OFFSET_EAST_M"] = args.sheet_offset_east
    globals()["SHEET_OFFSET_NORTH_M"] = args.sheet_offset_north
    buu_dien_root = script_dir.parent
    param = script_dir / "DATA - PARAM_SHEET_TEMPLATE.csv"
    out = buu_dien_root / OUT_NAME

    if not param.exists():
        raise FileNotFoundError(f"Param sheet not found: {param}")

    with param.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    width = 67.237
    depth = 22.880
    for r in rows:
        if slug(r.get("component", "")) == "envelope" and slug(r.get("sub_component", "")) == "building-width":
            width = parse_num(r.get("width_m", "auto"), width)
        if slug(r.get("component", "")) == "envelope" and slug(r.get("sub_component", "")) == "building-depth":
            depth = parse_num(r.get("depth_m", "auto"), depth)

    features = build_features(rows, width, depth)
    collection = {
        "type": "FeatureCollection",
        "name": "buu-dien-central-lod3",
        "source": str(param),
        "feature_count": len(features),
        "features": features,
    }

    out.write_text(json.dumps(collection, ensure_ascii=False), encoding="utf-8")
    print(f"Generated {out}")
    print(f"Features: {len(features)}")


if __name__ == "__main__":
    main()
