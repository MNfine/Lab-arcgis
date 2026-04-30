# Tổng quan các luồng dữ liệu đang dùng

Tài liệu này là hướng dẫn vận hành cho thư mục `Sai-Gon-Centre-Post-Office`.

## 1) workflow-sheet
- **Mục đích:** Team nhập tham số trên Google Sheets/CSV để build mô hình procedural.
- **Thư mục:** `workflow-sheet/`
- **Đầu vào chính:** `workflow-sheet/DATA - PARAM_SHEET_TEMPLATE.csv`
- **Script chạy:** `workflow-sheet/run-sheet-pipeline.ps1`
- **Đầu ra:** `buu-dien-central-lod3.geojson`

### Chạy nhanh workflow-sheet
```powershell
Set-Location "d:\UIT\Hệ thống thông tin địa lý 3 chiều\arcgis-sample\lab2\Sai-Gon-Centre-Post-Office\workflow-sheet"
.\run-sheet-pipeline.ps1 -ParamSheetUrl "https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<PARAM_GID>"
```

### File nhóm cần dùng
- `DATA - PARAM_SHEET_TEMPLATE.csv`: template tham số chính để build.
- `PARTS_ASSIGNMENT_TEMPLATE.csv`: phân công thành viên.
- `COLUMN_DICTIONARY_GOOGLE_IMPORT.csv`: giải nghĩa các cột.
- `validate_param_sheet.py`: kiểm tra nhanh dữ liệu trước khi build.

### QA nhanh cho workflow-sheet
- `feature_count > 0`
- `height_m >= min_height_m`
- `color_hex` đúng định dạng `#RRGGBB`

## 2) workflow-glb
- **Mục đích:** Lưu và hiển thị trực tiếp model GLB chất lượng cao trên bản đồ 3D.
- **Thư mục:** `workflow-glb/`
- **Đầu vào chính:** `workflow-glb/input-models/*.glb`
- **Ghi chú:** Không cần script build; `index.html` sẽ đọc trực tiếp file GLB.

## 3) workflow-obj (compare)
- **Mục đích:** Giữ OBJ để đối chiếu mật độ tam giác (face density) với GLB và SHEET.
- **Thư mục:** `workflow-obj/`
- **Đầu vào chính:** file OBJ đã georeference.
- **Script chạy:** `workflow-obj/run-obj-compare.ps1`
- **Đầu ra:** `workflow-obj/output/obj-faces-triangles.geojson`
- **Ghi chú:** Đây là luồng so sánh, KHÔNG phải luồng runtime mặc định.
- **Ghi chú vận hành:** Mặc định script dùng `MaxFeatures=120000` và `RotateRightDeg=35`; khi cần so sánh trực quan có thể tune lên `MaxFeatures=180000` và `RotateRightDeg=43`.

## 4) workflow-tham-khao (layered reference)
- **Mục đích:** Tạo bộ tham khảo để chia team theo từng layer chi tiết, theo cấu trúc giống TH2/4 và TH2/7.
- **Thư mục:** `workflow-tham-khao/`
- **Đầu vào chính:** `workflow-tham-khao/LAYER_CATALOG_TEMPLATE.csv` và `data/geojson-layers/*.geojson`
- **Script chạy:** `workflow-tham-khao/scripts/run-reference-workflow.ps1`
- **Đầu ra:** `workflow-tham-khao/output/buu-dien-reference-lod3.geojson`
- **Ghi chú:** Đây là luồng tham khảo chi tiết để phân chia công việc và benchmark; có thể chứa nhiều dữ liệu hơn luồng sheet.

## Vì sao OBJ chỉ để so sánh
- Model OBJ gốc có mật độ tam giác rất cao; nếu render trực tiếp sẽ tăng tải lên GPU/CPU trình duyệt.
- Quá trình chuyển OBJ sang đối tượng web GIS thường phải lấy mẫu/giảm mặt, làm sai khác màu/kiểu khi dùng để trình bày chính.
- Cấu trúc semantic trong OBJ thường kém hơn luồng SHEET (ít thông tin `part_type`), nên khó QA nghiệp vụ.
- Vì vậy, OBJ giữ để benchmark và đối chiếu chất lượng; luồng trình bày chính vẫn là GLB + SHEET.

## Lựa chọn thay thế
- **GLB:** dùng cho hình ảnh 3D trung thực, hiệu năng hiển thị tốt.
- **SHEET → GeoJSON (semantic):** dùng cho mô hình nghiệp vụ, tách nhiều lớp nhỏ, dễ kiểm thử và bảo trì.

## Thứ tự ưu tiên dữ liệu trên bản đồ
`index.html` sẽ tự động ưu tiên:
1. `workflow-glb/input-models/*.glb`
2. `buu-dien-central-lod3.geojson`
3. `workflow-obj/output/obj-faces-triangles.geojson` (chỉ khi hai nguồn trên không có, hoặc khi chọn `source=obj`)

