
# workflow-sheet

**Mục đích:** Quản lý tham số mô hình 3D LoD3 qua Google Sheet/CSV, tự động build dữ liệu và kiểm tra chất lượng.

## Quy ước file
- **DATA - PARAM_SHEET_TEMPLATE.csv**: Template nhập tham số cho từng part, dùng để build mô hình. Chỉnh sửa file này hoặc đồng bộ từ Google Sheet.
- **DATA - PARTS_ASSIGNMENT_TEMPLATE.csv**: Template phân công thành viên nhập liệu từng part.
- **DATA - COLUMN_DICTIONARY.csv**: Giải nghĩa các cột, quy tắc nhập liệu.
- **run-sheet-pipeline.ps1**: Script đồng bộ, kiểm tra, build dữ liệu từ sheet.
- **validate_param_sheet.py**: Kiểm tra nhanh lỗi nhập liệu.
- **generate_multitier_lod3_geojson.py**: Build GeoJSON từ PARAM sheet.

## Cách sử dụng nhanh
1. Cập nhật tham số vào PARAM_SHEET_TEMPLATE.csv (hoặc Google Sheet, rồi đồng bộ về).
2. Chạy lệnh:
	```powershell
	./run-sheet-pipeline.ps1 -ParamSheetUrl "<link_csv_export>"
	```
	hoặc chỉnh sửa trực tiếp file CSV rồi chạy lại script.
3. Kiểm tra kết quả file GeoJSON xuất ra, mở index.html để xem mô hình.

## Lưu ý nhập liệu
- `component_id` duy nhất, không trùng.
- `height_m >= min_height_m`.
- `color_hex` đúng định dạng `#RRGGBB`.
- Tham khảo DATA - COLUMN_DICTIONARY.csv để hiểu rõ ý nghĩa từng cột.

## Dọn dẹp file
Chỉ giữ lại các file sau:
- DATA - PARAM_SHEET_TEMPLATE.csv
- DATA - PARTS_ASSIGNMENT_TEMPLATE.csv
- DATA - COLUMN_DICTIONARY.csv
- run-sheet-pipeline.ps1
- validate_param_sheet.py
- generate_multitier_lod3_geojson.py
- README.md
Xóa các file khác nếu không còn dùng.

