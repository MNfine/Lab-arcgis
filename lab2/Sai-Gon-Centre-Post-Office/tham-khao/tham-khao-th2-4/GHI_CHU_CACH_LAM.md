# Ghi chú cách làm từ mẫu TH2/4

## Thư mục đã clone
- index.html (trang nguồn)
- dataGeojson/** (79 file GeoJSON liên quan)
- datajson/** (các file JSON dùng cho GraphicsLayer)

## Kiến trúc hiển thị của mẫu
1. Dùng ArcGIS JS 4.16 với SceneView.
2. Model được tách thành rất nhiều lớp nhỏ theo từng bộ phận kiến trúc:
   - thân nhà, viền, bậc tam cấp, mái, vòm, ban công, dome, wall prism...
3. Mỗi bộ phận là một GeoJSONLayer riêng.
4. Mỗi layer gắn renderer kiểu polygon-3d + extrude với:
   - size khác nhau (độ dày hoặc chiều cao từng khối)
   - material.color khác nhau (màu vật liệu)
5. Một số chi tiết dùng esriRequest đọc JSON rồi tạo Graphic để đưa vào GraphicsLayer.

## Điểm mạnh của cách làm
- Mô phỏng LoD3 tốt nhờ tách nhiều lớp chi tiết.
- Kiểm soát từng bộ phận rõ ràng: cao độ, màu sắc, độ dày.
- Dễ tinh chỉnh cục bộ mà không ảnh hưởng toàn bộ mô hình.

## Hạn chế
- Số lượng layer lớn nên code dài và khó bảo trì nếu không có quy ước nhóm.
- Cấu hình đang hard-code nhiều, chưa gom thành cấu trúc dữ liệu chung.

## Gợi ý áp dụng cho bài hiện tại
- Chuẩn hóa part_type thành các nhóm cố định như:
  roof, cornice, window-arch, window-lower, column, stair, portal, dome.
- Nếu muốn bám sát mẫu hơn, có thể tách một part_type thành nhiều feature con,
  mỗi feature có min_height, height và color riêng.
