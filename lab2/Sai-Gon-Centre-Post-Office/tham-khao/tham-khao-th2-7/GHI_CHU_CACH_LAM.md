# Ghi chú cách làm từ mẫu TH2/7

## Thư mục đã clone
- index.html (trang chính, chứa khung UI và nạp ArcGIS JS 4.16)
- script.js (toàn bộ logic dựng SceneView + layers + tương tác)
- styles.css (style cho map, panel, modal ảnh)
- images/** (favicon và ảnh minh họa địa điểm)

## Kiến trúc hiển thị của mẫu
1. Dùng ArcGIS JS 4.16 với SceneView.
2. Mô hình được tách thành nhiều lớp thành phần kiến trúc và dựng theo kiểu thủ công trong code.
3. Phần lớn chi tiết là GeoJSONLayer, mỗi thành phần gắn một renderer riêng (simple).
4. Renderer chủ đạo:
   - polygon-3d + extrude cho khối kiến trúc
   - point-3d + object cho các chi tiết dạng điểm (ví dụ cột cờ)
5. Mỗi layer tự khai báo:
   - url GeoJSON
   - kích thước extrude (size)
   - màu vật liệu (material.color)
   - một số layer có edges để tạo viền
6. Ngoài GeoJSONLayer, mẫu còn dùng esriRequest đọc JSON và tạo Graphic đưa vào GraphicsLayer
   cho một số chi tiết phụ (ví dụ quốc kỳ, mảng trang trí).
7. Tất cả layer được add vào Map theo danh sách cố định, sau đó SceneView chạy với:
   - ground: world-elevation
   - qualityProfile: high
   - camera mặc định được đặt sẵn.

## Tương tác và UI
- Dropdown đổi basemap qua hàm toàn cục changeBasemap.
- Nút reset camera gọi view.goTo(defaultCamera).
- Theo dõi camera bằng view.watch("camera") để hiển thị kinh độ, vĩ độ, độ cao, heading, tilt.
- Ảnh địa điểm có modal phóng to (click ảnh để mở, click nút close để đóng).

## Điểm mạnh của cách làm
- Trực quan, dễ học vì mỗi bộ phận tương ứng một layer rõ ràng.
- Kiểm soát chi tiết tốt: chỉnh màu, cao độ, độ dày theo từng phần kiến trúc.
- Phù hợp demo LoD3 khi cần nhấn mạnh nhiều chi tiết nhỏ.

## Hạn chế
- Code dài do lặp lại nhiều khối cấu hình layer/renderer, khó bảo trì khi mở rộng.
- Cấu hình đang hard-code, chưa chuyển thành data-driven config.
- Bản clone hiện tại chưa có thư mục data (GeoJSON/JSON), nên muốn chạy đúng mẫu cần bổ sung dữ liệu tương ứng.

## Gợi ý áp dụng cho bài hiện tại
- Giữ cách tách theo part_type/nhóm chi tiết như mẫu để dễ tinh chỉnh riêng lẻ.
- Nên gom cấu hình layer thành mảng config (url, type, size, color) rồi loop để tạo layer tự động.
- Tách phần UI tương tác (basemap, camera info, modal) thành module riêng để script chính gọn hơn.
