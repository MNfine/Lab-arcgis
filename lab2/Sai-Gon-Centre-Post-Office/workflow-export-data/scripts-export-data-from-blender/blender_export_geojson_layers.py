"""
Run inside Blender (Scripting tab).

Exports mesh faces from the current .blend into per-layer GeoJSON files,
compatible with workflow-tham-khao/data/geojson-layers.

How to use:
1. Open .blend in Blender.
2. Scripting -> New -> paste this script (or open this file).
3. Adjust CONFIG values below.
4. Run Script.

Output:
- One GeoJSON file per inferred layer key, e.g. roof.geojson, window.geojson.
- Files are written to EXPORT_DIR (default: ./workflow-tham-khao/data/geojson-layers
  relative to the .blend file directory).
"""

import bpy
import json
import os

# --- CẤU HÌNH ĐƯỜNG DẪN TẠI ĐÂY ---
# Hãy đổi đường dẫn này theo ổ đĩa máy (Ví dụ: D:/Documents/buudien.geojson)
output_file = "D:/UIT/Hệ thống thông tin địa lý 3 chiều/arcgis-sample/lab2/Sai-Gon-Centre-Post-Office/workflow-export-data/output/top_column_floor_3.geojson"

def export_geojson():
    # Kiểm tra xem có chọn vật thể nào không
    obj = bpy.context.active_object
    if not obj or obj.type != 'MESH':
        print("Lỗi: Hãy chọn một vật thể (Mesh) trước khi chạy!")
        return

    # Lấy dữ liệu lưới
    mesh = obj.to_mesh()
    matrix = obj.matrix_world
    
    all_polygons = []

    # Duyệt qua từng mặt phẳng của mô hình
    for poly in mesh.polygons:
        coords = []
        for vert_idx in poly.vertices:
            # Chuyển tọa độ sang World Space
            v = matrix @ mesh.vertices[vert_idx].co
            # Làm tròn 4 chữ số thập phân cho nhẹ file
            coords.append([round(v.x, 4), round(v.y, 4), round(v.z, 4)])
        
        # Đóng vòng Polygon (điểm cuối = điểm đầu)
        coords.append(coords[0])
        all_polygons.append([coords])

    # Tạo cấu trúc GeoJSON dạng MultiPolygon
    geojson_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": all_polygons
                },
                "properties": {
                    "name": obj.name,
                    "height": round(obj.dimensions.z, 2)
                }
            }
        ]
    }

    # Xuất file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=4)
        
    print(f"--- THÀNH CÔNG! File lưu tại: {output_file} ---")

# Chạy hàm
export_geojson()

