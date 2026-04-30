import argparse
import json
import math
from pathlib import Path


def centroid3(a, b, c):
    return (
        (a[0] + b[0] + c[0]) / 3.0,
        (a[1] + b[1] + c[1]) / 3.0,
        (a[2] + b[2] + c[2]) / 3.0,
    )


def parse_vertex(parts):
    if len(parts) < 4:
        return None
    try:
        return (float(parts[1]), -float(parts[3]), float(parts[2]))
    except ValueError:
        return None


def parse_face_indices(parts):
    idx = []
    for token in parts[1:]:
        if not token:
            continue
        head = token.split("/")[0].strip()
        if not head:
            continue
        try:
            i = int(head)
            if i < 0:
                idx.append(i)
            elif i > 0:
                idx.append(i - 1)
        except ValueError:
            continue
    return idx


def resolve_index(i, vertex_count):
    if i >= 0:
        return i
    return vertex_count + i


def load_obj_faces(obj_path):
    vertices = []
    face_triangles = []
    src_face_id = 0

    with obj_path.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if line.startswith("v "):
                v = parse_vertex(line.split())
                if v is not None:
                    vertices.append(v)
                continue

            if line.startswith("f "):
                src_face_id += 1
                idx = parse_face_indices(line.split())
                if len(idx) < 3:
                    continue

                resolved = [resolve_index(i, len(vertices)) for i in idx]
                resolved = [i for i in resolved if 0 <= i < len(vertices)]
                if len(resolved) < 3:
                    continue

                tri_count_for_face = max(1, len(resolved) - 2)
                anchor = resolved[0]
                for k in range(1, len(resolved) - 1):
                    tri = (anchor, resolved[k], resolved[k + 1])
                    face_triangles.append((src_face_id, tri_count_for_face, tri))

    return vertices, face_triangles


def sample_stride(total, max_features):
    if max_features <= 0 or total <= max_features:
        return 1
    return int(math.ceil(total / float(max_features)))


def compute_model_frame(vertices):
    xs = [v[0] for v in vertices]
    ys = [v[1] for v in vertices]
    zs = [v[2] for v in vertices]
    return {
        "x_center": (min(xs) + max(xs)) / 2.0,
        "y_center": (min(ys) + max(ys)) / 2.0,
        "z_min": min(zs),
    }


def local_to_wgs84(x, y, z, frame, anchor_lon, anchor_lat, anchor_z, unit_scale, rotate_right_deg):
    # This model uses Z-up: X (east-west), Y (north-south), Z (up)
    east_m = (x - frame["x_center"]) * unit_scale
    north_m = (y - frame["y_center"]) * unit_scale
    up_m = (z - frame["z_min"]) * unit_scale

    # Positive rotate_right_deg rotates clockwise in top view.
    theta = math.radians(rotate_right_deg)
    east_rot = east_m * math.cos(theta) + north_m * math.sin(theta)
    north_rot = -east_m * math.sin(theta) + north_m * math.cos(theta)

    meters_per_deg_lat = 111320.0
    meters_per_deg_lon = meters_per_deg_lat * math.cos(math.radians(anchor_lat))
    if abs(meters_per_deg_lon) < 1e-9:
        meters_per_deg_lon = 1e-9

    lon = anchor_lon + (east_rot / meters_per_deg_lon)
    lat = anchor_lat + (north_rot / meters_per_deg_lat)
    alt = anchor_z + up_m
    return lon, lat, alt


def build_geojson(vertices, face_triangles, stride, anchor_lon, anchor_lat, anchor_z, unit_scale, rotate_right_deg):
    frame = compute_model_frame(vertices)
    features = []
    for i, (face_id, tri_count, (a_i, b_i, c_i)) in enumerate(face_triangles):
        if i % stride != 0:
            continue

        a = vertices[a_i]
        b = vertices[b_i]
        c = vertices[c_i]
        lon_a, lat_a, alt_a = local_to_wgs84(a[0], a[1], a[2], frame, anchor_lon, anchor_lat, anchor_z, unit_scale, rotate_right_deg)
        lon_b, lat_b, alt_b = local_to_wgs84(b[0], b[1], b[2], frame, anchor_lon, anchor_lat, anchor_z, unit_scale, rotate_right_deg)
        lon_c, lat_c, alt_c = local_to_wgs84(c[0], c[1], c[2], frame, anchor_lon, anchor_lat, anchor_z, unit_scale, rotate_right_deg)

        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lon_a, lat_a, alt_a],
                        [lon_b, lat_b, alt_b],
                        [lon_c, lat_c, alt_c],
                        [lon_a, lat_a, alt_a],
                    ]],
                },
                "properties": {
                    "face_id": face_id,
                    "triangle_id": i + 1,
                    "triangles_in_face": tri_count,
                    "source": "obj-compare",
                },
            }
        )

    return {
        "type": "FeatureCollection",
        "features": features,
    }


def main():
    parser = argparse.ArgumentParser(description="Convert OBJ faces to sampled GeoJSON triangles for visual comparison")
    parser.add_argument("--obj", required=True, help="Input OBJ path")
    parser.add_argument("--out", required=True, help="Output GeoJSON path")
    parser.add_argument("--max-features", type=int, default=60000, help="Maximum sampled triangle features in output")
    parser.add_argument("--anchor-lon", type=float, default=106.69999, help="WGS84 longitude anchor")
    parser.add_argument("--anchor-lat", type=float, default=10.77996, help="WGS84 latitude anchor")
    parser.add_argument("--anchor-z", type=float, default=0.2, help="Altitude offset in meters")
    parser.add_argument("--unit-scale", type=float, default=0.001, help="Scale OBJ units to meters (default assumes OBJ in mm)")
    parser.add_argument("--rotate-right-deg", type=float, default=0.0, help="Clockwise rotation in degrees in top view")
    args = parser.parse_args()

    obj_path = Path(args.obj)
    out_path = Path(args.out)

    if not obj_path.exists():
        raise FileNotFoundError(f"OBJ not found: {obj_path}")

    vertices, face_triangles = load_obj_faces(obj_path)
    stride = sample_stride(len(face_triangles), args.max_features)
    fc = build_geojson(
        vertices,
        face_triangles,
        stride,
        args.anchor_lon,
        args.anchor_lat,
        args.anchor_z,
        args.unit_scale,
        args.rotate_right_deg,
    )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(fc, f, ensure_ascii=False)

    print(f"vertices={len(vertices)}")
    print(f"triangles={len(face_triangles)}")
    print(f"stride={stride}")
    print(f"output_features={len(fc['features'])}")
    print(f"written={out_path}")


if __name__ == "__main__":
    main()
