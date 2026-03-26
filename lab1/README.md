# Lab 1 - ArcGIS JS: Bản đồ Nam Bộ

## 1. Mục tiêu bài lab
- Hiển thị bản đồ Nam Bộ với 8 đơn vị hành chính sau sáp nhập.
- Thể hiện lớp ranh giới hành chính, lớp tuyến quốc lộ/cao tốc, lớp trường đại học.
- Có popup thông tin đầy đủ cho từng đối tượng.
- Đáp ứng checklist môn học: Starter Map, Graphics, Popup, Picture Marker.

## 2. Trạng thái hiện tại
- File chính: southern-vietnam-map.html
- Mô hình dữ liệu: dữ liệu tuyến/trường được khai báo thủ công trong code để kiểm soát độ chính xác khi demo.
- Ranh giới hành chính: đọc từ southern-provinces-data.js (snapshot local).
- Ghi chú quan trọng: trong quá trình kiểm thử, team nhận thấy dữ liệu tuyến/trường lấy từ API bị lệch hoặc sai khá nhiều so với thực tế, nên chuyển sang cập nhật thủ công theo bộ dữ liệu đã chốt; riêng dữ liệu ranh giới tỉnh/thành từ nguồn ADM1 vẫn đủ tin cậy để sử dụng.
- Chuẩn hóa hiển thị đã áp dụng:
	- Lọc điểm trùng liên tiếp trong path tuyến đường trước khi vẽ.
	- Sắp xếp danh sách tuyến và trường theo tên trước khi render để ổn định thứ tự hiển thị.

## 3. API sử dụng (ghi rõ theo từng phần)
- ArcGIS JavaScript API 4.26:
	- Runtime map, view, graphics, popup, locate widget.
	- URL nạp API: https://js.arcgis.com/4.26/
	- URL CSS theme: https://js.arcgis.com/4.26/esri/themes/light/main.css
- geoBoundaries ADM1 GeoJSON (dùng cho ranh giới tỉnh/thành):
	- Runtime fallback URL trong map: https://raw.githubusercontent.com/wmgeolab/geoBoundaries/9469f09592ced973a3448cf66b6100b741b64c0d/releaseData/gbOpen/VNM/ADM1/geoBoundaries-VNM-ADM1.geojson
	- URL dùng trong script snapshot: https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/VNM/ADM1/geoBoundaries-VNM-ADM1.geojson
- Tuyến đường và trường đại học:
	- Không dùng API runtime ở phiên bản hiện tại.
	- Dữ liệu được chốt và nhập thủ công do kết quả API trong giai đoạn kiểm thử bị sai lệch nhiều.
	- Các API đã từng gọi thử cho tuyến/trường:
	  - OpenStreetMap Nominatim API (tìm kiếm địa danh/trường).
	  - OpenStreetMap Overpass API (truy vấn đối tượng đường và đại học).
	  - ArcGIS World Geocoding/Feature query endpoints (đối chiếu vị trí tên trường/địa danh).
	- Lý do không dùng tiếp: sai lệch hình học tuyến, sai hoặc thiếu POI trường, và không đồng nhất thuộc tính giữa các nguồn.

## 4. Cấu trúc thư mục
- starter-map.html
- graphics.html
- graphic-json.html
- get-location.html
- southern-vietnam-map.html
- southern-provinces-data.js
- generate_provinces_snapshot.py
- README.md
- QUY_TRINH_NGHIEP_VU.md

## 5. Cách chạy
1. Mở thư mục lab1 bằng VS Code.
2. Chạy southern-vietnam-map.html bằng Live Server hoặc một local web server bất kỳ.
3. Kiểm tra popup của 3 nhóm dữ liệu:
	 - Đơn vị hành chính
	 - Tuyến đường
	 - Trường đại học

## 6. Quy tắc dữ liệu trong southern-vietnam-map.html
- Biến n điều khiển số lượng hiển thị theo yêu cầu 2n:
	- roads = allRoads.slice(0, 2 * n)
	- universities = allUniversities.slice(0, 2 * n)
- Khi thêm/sửa path tuyến đường:
	- Giữ nguyên thứ tự điểm theo tuyến thực tế.
	- Có thể nhập điểm trùng nếu nguồn dữ liệu có, hệ thống sẽ tự lọc điểm trùng liên tiếp.
- Khi thêm/sửa trường đại học:
	- Cập nhật đồng bộ name, major, students, location, longitude, latitude.

## 7. Tái tạo snapshot ranh giới (khi cần)
Chạy trong thư mục lab1:

```bash
python generate_provinces_snapshot.py
```

Kết quả sẽ ghi đè southern-provinces-data.js.

## 8. Kiểm tra nhanh trước khi nộp
- Không có lỗi cú pháp ở southern-vietnam-map.html.
- Popup mở đúng cho cả 3 lớp.
- Số đối tượng hiển thị đúng 2n tuyến và 2n trường.
- Tên đơn vị hành chính, tuyến, trường khớp với bộ dữ liệu đã chốt.

## 9. Tên trường chuẩn và file logo đang dùng
- Trường Đại học Tiền Giang: ./assets/logos/Logo_trường_Đại_học_Tiền_Giang.svg.png
- Phân hiệu Đại học Quốc gia TP Hồ Chí Minh tại Bến Tre: ./assets/logos/ben-tre-quoc-gia.jpg
- Trường Đại học Xây dựng Miền Tây: ./assets/logos/Logo_Trường_Đại_học_Xây_dựng_Miền_Tây.png
- Trường Đại học Cửu Long: ./assets/logos/ff93a9479e9b.png
- Trường Đại học Cần Thơ: ./assets/logos/Logo_Dai_hoc_Can_Tho.svg.png
- Trường Đại học Nam Cần Thơ: ./assets/logos/logo-truong-dai-hoc-nam-can-tho-inkythuatso-01-24-10-57-15.jpg
- Trường Đại học Võ Trường Toản: ./assets/logos/logo_hao_quang_chon_07_2007-1.jpg
- Trường Đại học Bạc Liêu: ./assets/logos/logoBLUNI_8648350e-1989-4408-b863-53b1ecfa6108.png
- Phân hiệu Trường Đại học Bình Dương tại Cà Mau: ./assets/logos/Logo-chinh.png
- Trường Đại học An Giang - ĐHQG TP.HCM: ./assets/logos/Dai_hoc_An_Giang.svg.png
- Trường Đại học Đồng Tháp: ./assets/logos/Đại_học_Đồng_Tháp.png
- Phân hiệu Đại học Kinh tế TP Hồ Chí Minh tại Vĩnh Long: ./assets/logos/Logo_Phân_hiệu_Vĩnh_Long_(Tiếng_Anh)_(Chữ_xanh)_(1).png
