#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path

HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate DATA - PARAM_SHEET_TEMPLATE.csv before build")
    parser.add_argument("--param", default="DATA - PARAM_SHEET_TEMPLATE.csv", help="Path to param sheet")
    return parser.parse_args()


def parse_float(value: str) -> float | None:
    v = (value or "").strip()
    if not v or v.lower() == "auto":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def parse_int(value: str) -> int | None:
    v = (value or "").strip()
    if not v or v.lower() == "auto":
        return None
    try:
        return int(float(v))
    except ValueError:
        return None


def main() -> None:
    args = parse_args()
    path = Path(args.param)
    if not path.exists():
        raise FileNotFoundError(f"Param sheet not found: {path}")

    with path.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    required = [
        "component_id",
        "sub_component",
        "count",
        "min_height_m",
        "height_m",
        "color_hex",
    ]
    errs: list[str] = []

    for i, row in enumerate(rows, start=2):
        for key in required:
            if key not in row:
                errs.append(f"Line {i}: missing column '{key}'")

        cid = (row.get("component_id") or "").strip()
        if not cid:
            errs.append(f"Line {i}: empty component_id")

        count = parse_int(row.get("count", ""))
        if count is None or count <= 0:
            errs.append(f"Line {i}: invalid count for {cid}")

        min_h = parse_float(row.get("min_height_m", ""))
        height = parse_float(row.get("height_m", ""))
        if min_h is None:
            errs.append(f"Line {i}: invalid min_height_m for {cid}")
        if height is None:
            errs.append(f"Line {i}: invalid height_m for {cid}")
        if min_h is not None and height is not None and height < min_h:
            errs.append(f"Line {i}: height_m < min_height_m for {cid}")

        color = (row.get("color_hex") or "").strip()
        if color and not HEX_COLOR.match(color):
            errs.append(f"Line {i}: invalid color_hex for {cid}: {color}")

    if errs:
        print("VALIDATION FAILED")
        for e in errs:
            print("-", e)
        raise SystemExit(1)

    print(f"VALIDATION OK - rows={len(rows)}")


if __name__ == "__main__":
    main()
