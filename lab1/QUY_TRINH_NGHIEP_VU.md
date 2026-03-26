# Quy trình nghiệp vụ - Lab 1 Bản đồ Nam Bộ

## 1. Phạm vi nghiệp vụ
- Bài toán hiển thị 3 lớp thông tin trên ArcGIS JS:
	- 8 đơn vị hành chính sau sáp nhập.
	- Các tuyến quốc lộ/cao tốc phục vụ yêu cầu 2n.
	- Các trường đại học phục vụ yêu cầu 2n.
- Dữ liệu được duy trì theo hướng local-first để ổn định khi demo trên lớp.

## 2. Nguồn dữ liệu và nguyên tắc sử dụng
### 2.1 Ranh giới hành chính
- Nguồn gốc: geoBoundaries ADM1 Việt Nam.
- Dạng sử dụng trong project: snapshot local tại southern-provinces-data.js.
- Mục tiêu: tránh phụ thuộc mạng khi mở map.

### 2.2 Tuyến đường và trường đại học
- Nguồn gốc: bộ dữ liệu đã chốt theo yêu cầu nhóm/lab.
- Dạng sử dụng: khai báo thủ công trong southern-vietnam-map.html.
- Mục tiêu: kiểm soát chính xác nội dung popup và vị trí hiển thị.

### 2.3 Quyết định nghiệp vụ trong kiểm thử
- Trong quá trình kiểm thử, team đã thử lấy dữ liệu tuyến/trường từ API nhưng phát hiện sai lệch đáng kể về vị trí, tuyến đi và một phần thuộc tính.
- Các API đã thử cho tuyến/trường:
	- OpenStreetMap Nominatim API (search theo tên trường/địa danh).
	- OpenStreetMap Overpass API (lọc highway, amenity=university).
	- ArcGIS World Geocoding/Feature query endpoints (đối chiếu tọa độ theo tên).
- Vì vậy, dữ liệu tuyến/trường được chuyển sang phương án nhập thủ công từ bộ đã đối soát.
- Dữ liệu ranh giới tỉnh/thành ở cấp ADM1 vẫn có độ tin cậy cao, nên tiếp tục sử dụng theo cơ chế snapshot local.

### 2.4 Danh mục API và phạm vi áp dụng
- ArcGIS JavaScript API 4.26:
	- Dùng để hiển thị map và thao tác lớp đồ họa (MapView, GraphicsLayer, Popup, Locate).
	- URL: https://js.arcgis.com/4.26/
- geoBoundaries ADM1 GeoJSON:
	- Dùng cho dữ liệu ranh giới hành chính cấp tỉnh.
	- Runtime fallback URL trong bản đồ:
	  https://raw.githubusercontent.com/wmgeolab/geoBoundaries/9469f09592ced973a3448cf66b6100b741b64c0d/releaseData/gbOpen/VNM/ADM1/geoBoundaries-VNM-ADM1.geojson
	- URL nguồn cho script tạo snapshot:
	  https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/VNM/ADM1/geoBoundaries-VNM-ADM1.geojson
- Dữ liệu tuyến đường và trường đại học:
	- Không sử dụng API runtime trong phiên bản nộp hiện tại.
	- Quản lý bằng dữ liệu thủ công đã đối soát nội bộ.

## 3. Quy trình cập nhật dữ liệu
### Bước 1: Chốt dữ liệu đầu vào
- Chốt block dữ liệu cho từng nhóm:
	- mergedAdminUnits
	- allRoads
	- allUniversities
- Khi có thay đổi, cập nhật trực tiếp đúng object theo name.

### Bước 2: Cập nhật ranh giới (nếu cần)
- Chạy generate_provinces_snapshot.py để tái tạo southern-provinces-data.js.
- Kiểm tra số đơn vị và thuộc tính component/population/area.

### Bước 3: Cập nhật tuyến đường
- Sửa các trường: name, type, length, rightofway, provinces, path.
- Duy trì thứ tự điểm theo hướng tuyến.
- Không cần tự xóa điểm trùng liên tiếp bằng tay, hệ thống đã có normalizeRoadPath xử lý trước khi render.

### Bước 4: Cập nhật trường đại học
- Sửa đồng bộ các trường:
	- name
	- founded
	- major
	- students
	- location
	- longitude/latitude

### Bước 5: Kiểm soát hiển thị 2n
- Biến n quyết định số phần tử hiển thị:
	- roads = allRoads.slice(0, 2 * n)
	- universities = allUniversities.slice(0, 2 * n)
- Danh sách hiển thị được sắp theo tên để ổn định thứ tự xuất hiện.

## 4. Quy trình kiểm tra chất lượng (QA)
### 4.1 Kiểm tra kỹ thuật
- File southern-vietnam-map.html không lỗi cú pháp.
- Map tải được basemap, các layer và widget Locate.

### 4.2 Kiểm tra dữ liệu nghiệp vụ
- Hiển thị đủ 8 đơn vị hành chính sau sáp nhập.
- Hiển thị đúng 2n tuyến và 2n trường theo n hiện tại.
- Popup có đủ trường thông tin theo yêu cầu checklist.

### 4.3 Kiểm tra trực quan
- Tuyến đường không bị gãy do lỗi điểm path.
- Marker đại học hiển thị đúng vị trí.
- Màu vùng và popup tỉnh/thành nhất quán.

## 5. Quản trị thay đổi
- Mỗi lần chỉnh dữ liệu lớn cần cập nhật lại:
	- README.md
	- QUY_TRINH_NGHIEP_VU.md
- Không xóa các file cốt lõi khi dọn project:
	- southern-vietnam-map.html
	- southern-provinces-data.js
	- generate_provinces_snapshot.py

## 6. Kết quả mong đợi khi bàn giao
- Mở southern-vietnam-map.html là chạy được ngay.
- Dữ liệu nhất quán với bộ đã chốt.
- Tài liệu mô tả đầy đủ cách chạy, cách cập nhật và cách kiểm tra.
