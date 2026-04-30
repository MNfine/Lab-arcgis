# Ghi chú cách làm từ mẫu TH2/4

## Thư mục chính
- `index.html` — trang hiển thị `SceneView`.
- `buu-dien-central-lod3.geojson` — dữ liệu GeoJSON sinh từ sheet.
- `workflow-sheet/` — pipeline đồng bộ / kiểm tra / build theo sheet.
- `workflow-glb/` — nguồn model GLB để hiển thị trực tiếp.
- `workflow-obj/` — luồng so sánh OBJ → GeoJSON (mesh tam giác).
- `tham-khao/` — khung tham khảo, chia team theo layer chi tiết (TH2/4, TH2/7).
- `workflow-sheet/generate_multitier_lod3_geojson.py` — script build GeoJSON semantic.
- `WORKFLOW_OVERVIEW.md` — tài liệu vận hành.

## Kiến trúc hiển thị
1. Sử dụng ArcGIS API for JavaScript (`SceneView`) để render 3D trên web.
2. Thứ tự ưu tiên nguồn dữ liệu tại runtime:
   - GLB (nếu có file trong `workflow-glb/input-models/`)
   - SHEET → GeoJSON (`buu-dien-central-lod3.geojson`)
   - OBJ compare (`workflow-obj/output/obj-faces-triangles.geojson`)
3. Khi chạy theo SHEET, mô hình được tách thành nhiều lớp nhỏ theo thuộc tính `part_type`.
4. Mỗi lớp dùng renderer `polygon-3d` + `extrude`, các thuộc tính chính:
   - `min_height`, `height`, `extrude_height`, `color`.
5. Cách tách lớp theo mẫu TH2/4: ưu tiên chi tiết theo cụm kiến trúc thay vì gộp thành một lớp lớn.
6. Luồng SHEET hiện sử dụng cấu hình taxonomy-driven để gom `part_type` vào các nhóm:
   - `roof-main`, `cornice`, `window-arch`, `column`, `stair`, `portal`, `facade-base`.
7. Script builder có quy tắc đặt hình học theo `sub_component` (ví dụ: wing trái/phải, khối giữa, cổng chính, mái), giúp silhouette mô hình gần với Bưu điện Trung tâm hơn.

## Ưu điểm
- Dễ đạt mức chi tiết cao nhờ tách nhiều lớp mang nghĩa semantic.
- Dễ QA dữ liệu vì mỗi `part_type` có ý nghĩa nghiệp vụ rõ ràng.
- Dễ tinh chỉnh cục bộ (màu, độ cao, extrude) mà không ảnh hưởng toàn cảnh.
- Kết hợp được hai hướng: GLB cho hình ảnh trung thực, SHEET cho chỉnh sửa nhanh và kiểm soát cấu trúc.
- Giữ luồng OBJ để so sánh mật độ face và kiểm tra chất lượng.

## Hạn chế
- Nếu số `part_type` tăng mạnh thì số layer sẽ tăng theo, gây phức tạp cho việc quản lý.
- Chất lượng hiển thị của SHEET phụ thuộc nhiều vào cách định nghĩa hình học trong template.
- Cần giữ quy ước đặt tên `part_type` ổn định để tránh trùng lặp và phân nhóm sai.
- Luồng OBJ compare không mang thông tin semantic `part_type` — chủ yếu dùng để kiểm tra và có thể nặng khi bật nhiều feature.

## Gợi ý tiếp theo
- Chuẩn hóa bộ `part_type` cho mặt đứng: `facade-base`, `facade-column`, `facade-window-arch`, `cornice`, `roof-main`, `dome`, `stair`, `portal`.
- Với các nhóm quan trọng (window / cornice / roof), tách thêm sub-part để tăng chi tiết.
- Tạo bảng mapping style theo `part_type` (màu, viền, độ ưu tiên hiển thị) để đồng bộ toàn mô hình.
- Khi trình bày báo cáo: chiến lược "dual-track":
  - Hiển thị chính: GLB + semantic SHEET
  - Benchmark kỹ thuật: OBJ (face-density compare)
