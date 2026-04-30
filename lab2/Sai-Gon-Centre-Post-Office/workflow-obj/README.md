# workflow-obj (compare only)

Muc tieu: giu duong OBJ de doi chieu voi GLB/SHEET, khong dung lam runtime mac dinh.

## Dau vao
- OBJ da georeference (toa do x,y,z phu hop ban do)

## Dau ra
- output/obj-faces-triangles.geojson

## Cac buoc chay
```powershell
Set-Location "d:\UIT\Hệ thống thông tin địa lý 3 chiều\arcgis-sample\lab2\Sai-Gon-Centre-Post-Office\workflow-obj"
.\run-obj-compare.ps1 -ObjPath "D:\duong-dan-that\model.obj"
```

Vi du ban da canh chinh de doi chieu voi GLB (mesh day):
```powershell
.\run-obj-compare.ps1 -ObjPath "D:\duong-dan-that\model.obj" -MaxFeatures 180000 -RotateRightDeg 43
```

Khong dung chuoi mau <duong-dan-file.obj> khi chay that.

Mac dinh script dung `UnitScale=0.001` (OBJ theo mm -> m).
Mac dinh map truc OBJ theo kieu Z-up: X=east, Y=north, Z=up.
Mac dinh `MaxFeatures=120000` de giu mat do tam giac cao hon.
Mac dinh xoay sang phai `RotateRightDeg=35`.
Neu canh theo bo tham so hien dang dung de so sanh truc quan, co the dat `RotateRightDeg=43`.

## Cach xem tren web
- Mo index voi query source=obj
- Vi du: ./index.html?source=obj

## Luu y
- OBJ compare duoc render dang mesh tam giac (GeoJSON Polygon 3D), dung cho doi chieu "chuan mesh".
- Neu OBJ khong georeference thi du lieu co the khong hien thi dung vi tri ban do.

