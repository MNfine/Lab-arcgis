require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/request",
], function (
  Map,
  SceneView,
  GeoJSONLayer,
  GraphicsLayer,
  Graphic,
  esriRequest
) {
  var createGraphic = function (data) {
    return new Graphic({
      geometry: data,
      symbol: data.symbol,
      attributes: data,
      popupTemplate: data.popupTemplate,
    });
  };

  const json_options = {
    query: {
      f: "json",
    },
    responseType: "json",
  };

  esriRequest("./data/json/doc-len-ben-phai.json", json_options).then(function (
    response
  ) {
    var graphicsLayer = new GraphicsLayer();
    response.data.forEach(function (data) {
      graphicsLayer.add(createGraphic(data));
    });
    map.add(graphicsLayer);
  });

  esriRequest("./data/json/doc-len-ben-trai.json", json_options).then(function (
    response
  ) {
    var graphicsLayer = new GraphicsLayer();
    response.data.forEach(function (data) {
      graphicsLayer.add(createGraphic(data));
    });
    map.add(graphicsLayer);
  });

  esriRequest("./data/json/mep-doc-len-ben-phai.json", json_options).then(
    function (response) {
      var graphicsLayer = new GraphicsLayer();
      response.data.forEach(function (data) {
        graphicsLayer.add(createGraphic(data));
      });
      map.add(graphicsLayer);
    }
  );

  esriRequest("./data/json/mep-doc-len-ben-trai.json", json_options).then(
    function (response) {
      var graphicsLayer = new GraphicsLayer();
      response.data.forEach(function (data) {
        graphicsLayer.add(createGraphic(data));
      });
      map.add(graphicsLayer);
    }
  );

  esriRequest("./data/json/quoc-ky-viet-nam.json", json_options).then(function (
    response
  ) {
    var graphicsLayer = new GraphicsLayer();
    response.data.forEach(function (data) {
      graphicsLayer.add(createGraphic(data));
    });
    map.add(graphicsLayer);
  });

  const tangHamLayer = new GeoJSONLayer({
    url: "./data/geojson/tang-ham.geojson",
  });

  tangHamLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 3.6,
          material: {
            color: "rgb(193, 146, 98)",
          },
        },
      ],
    },
  };

  const cauThangLayer = new GeoJSONLayer({
    url: "./data/geojson/cau-thang.geojson",
  });

  cauThangLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.2,
          material: {
            color: "rgb(200, 200, 200)",
          },
        },
      ],
    },
  };

  const nenTangTretLayer = new GeoJSONLayer({
    url: "./data/geojson/nen-tang-tret.geojson",
  });
  nenTangTretLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.05,
          material: {
            color: "rgb(200, 200, 200)",
          },
        },
      ],
    },
  };

  const tuongTangTretLayer = new GeoJSONLayer({
    url: "./data/geojson/tuong-tang-tret.geojson",
  });
  tuongTangTretLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 5.5,
          material: {
            color: "rgb(80, 78, 72)",
          },
        },
      ],
    },
  };

  const vienTangTretLayer = new GeoJSONLayer({
    url: "./data/geojson/vien-tang-tret.geojson",
  });
  vienTangTretLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.2,
          material: {
            color: "rgb(149, 139, 127)",
          },
        },
      ],
    },
  };

  const lanCanLayer = new GeoJSONLayer({
    url: "./data/geojson/lan-can.geojson",
  });
  lanCanLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(205 , 186 ,150)",
          },
        },
      ],
    },
  };

  const cotTruChinhLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-tru-chinh.geojson",
  });
  cotTruChinhLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 17,
          material: {
            color: "rgb(208, 198, 191)",
          },
        },
      ],
    },
  };

  const cotPhuLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-phu.geojson",
  });
  cotPhuLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 4.5,
          material: {
            color: "rgb(105,105,105)",
          },
        },
      ],
    },
  };

  const cuaRaVaoLayer = new GeoJSONLayer({
    url: "./data/geojson/cua-ra-vao.geojson",
  });
  cuaRaVaoLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 4,
          material: {
            color: [39, 56, 64],
          },
        },
      ],
    },
  };

  const nenTangMotLayer = new GeoJSONLayer({
    url: "./data/geojson/nen-tang-mot.geojson",
  });
  nenTangMotLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 9,
          material: {
            color: "rgb(197, 187, 170)",
          },
        },
      ],
    },
  };

  const vienNhaTangTretLayer = new GeoJSONLayer({
    url: "./data/geojson/vien-nha-tang-tret.geojson",
  });
  vienNhaTangTretLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const maiHienLayer = new GeoJSONLayer({
    url: "./data/geojson/mai-hien.geojson",
  });
  maiHienLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const nenBanCongMatTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/nen-ban-cong-mat-truoc.geojson",
  });
  nenBanCongMatTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const lanCanBanCongMatTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/lan-can-ban-cong-mat-truoc.geojson",
  });
  lanCanBanCongMatTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.8,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const cotTruChinhTangMot = new GeoJSONLayer({
    url: "./data/geojson/cot-tru-chinh-tang-mot.geojson",
  });
  cotTruChinhTangMot.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 12.35,
          material: {
            color: "rgb(208, 198, 191)",
          },
        },
      ],
    },
  };

  const cuaSoTangHamLayer = new GeoJSONLayer({
    url: "./data/geojson/cua-so-tang-ham.geojson",
  });
  cuaSoTangHamLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 3.5,
          material: {
            color: [39, 56, 64],
          },
          edges: {
            type: "solid",
            color: [177, 177, 153],
            size: 2,
          },
        },
      ],
    },
  };

  const thanhNgangCuaSoLayer = new GeoJSONLayer({
    url: "./data/geojson/thanh-ngang-cua-so.geojson",
  });
  thanhNgangCuaSoLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 1,
          material: {
            color: "rgb(148, 140, 127)",
          },
        },
      ],
    },
  };

  const matKinhBenTrenLayer = new GeoJSONLayer({
    url: "./data/geojson/mat-kinh-ben-tren.geojson",
  });
  matKinhBenTrenLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 2,
          material: {
            color: [39, 56, 64],
          },
        },
      ],
    },
  };

  const matKinhBenDuoiLayer = new GeoJSONLayer({
    url: "./data/geojson/mat-kinh-ben-duoi.geojson",
  });
  matKinhBenDuoiLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 4,
          material: {
            color: [39, 56, 64],
          },
        },
      ],
    },
  };

  const cuaSoTangTretLayer = new GeoJSONLayer({
    url: "./data/geojson/cua-so-tang-tret.geojson",
  });
  cuaSoTangTretLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 2,
          material: {
            color: [39, 56, 64],
          },
          edges: {
            type: "solid",
            color: [177, 177, 153],
            size: 2,
          },
        },
      ],
    },
  };

  const thanhNgangLayer = new GeoJSONLayer({
    url: "./data/geojson/thanh-ngang.geojson",
  });
  thanhNgangLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(156  , 156  ,156 )",
          },
        },
      ],
    },
  };

  const matKinhNgangLayer = new GeoJSONLayer({
    url: "./data/geojson/mat-kinh-ngang.geojson",
  });
  matKinhNgangLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 1.5,
          material: {
            color: [39, 56, 64],
          },
        },
      ],
    },
  };

  const nenSanThuongToaTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/nen-san-thuong-toa-truoc.geojson",
  });
  nenSanThuongToaTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.55,
          material: {
            color: "rgb(199, 187, 172)",
          },
        },
      ],
    },
  };

  const vienNenSanThuongToaTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/vien-nen-san-thuong-toa-truoc.geojson",
  });
  vienNenSanThuongToaTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const sanThuongLayer = new GeoJSONLayer({
    url: "./data/geojson/san-thuong.geojson",
  });
  sanThuongLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 1,
          material: {
            color: "rgb(156  , 156  ,156)",
          },
        },
      ],
    },
  };

  const vienSanThuongLayer = new GeoJSONLayer({
    url: "./data/geojson/vien-san-thuong.geojson",
  });
  vienSanThuongLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.15,
          material: {
            color: "rgb(199, 187, 172)",
          },
        },
      ],
    },
  };

  const lanCanSanThuongNuaTrenLayer = new GeoJSONLayer({
    url: "./data/geojson/lan-can-san-thuong-nua-tren.geojson",
  });
  lanCanSanThuongNuaTrenLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.7,
          material: {
            color: "rgb(140  , 140  ,140)",
          },
        },
      ],
    },
  };

  const phaMaiSanThuongLayer = new GeoJSONLayer({
    url: "./data/geojson/phan-mai-san-thuong.geojson",
  });
  phaMaiSanThuongLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(249, 167, 129)",
          },
        },
      ],
    },
  };

  const phaMaiSanThuongGiuaLayer = new GeoJSONLayer({
    url: "./data/geojson/pha-mai-san-thuong-giua.geojson",
  });
  phaMaiSanThuongGiuaLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.75,
          material: {
            color: "rgb(249, 167, 129)",
          },
        },
      ],
    },
  };

  const kinhChanSanThuongLayer = new GeoJSONLayer({
    url: "./data/geojson/kinh-chan-san-thuong.geojson",
  });
  kinhChanSanThuongLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 2,
          material: {
            color: [75, 75, 75, 0.9],
          },
        },
      ],
    },
  };

  const cotChanSanThuongLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-chan-san-thuong.geojson",
  });
  cotChanSanThuongLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 2,
          material: {
            color: [75, 75, 75, 0.9],
          },
        },
      ],
    },
  };

  const sanThuongSauLayer = new GeoJSONLayer({
    url: "./data/geojson/san-thuong-sau.geojson",
  });
  sanThuongSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.1,
          material: {
            color: [199, 187, 172],
          },
        },
      ],
    },
  };

  const lanCanSanThuongSauLayer = new GeoJSONLayer({
    url: "./data/geojson/lan-can-san-thuong-sau.geojson",
  });
  lanCanSanThuongSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.7,
          material: {
            color: "rgb(140,140,140)",
          },
        },
      ],
    },
  };

  const vienSanThuongSauLayer = new GeoJSONLayer({
    url: "./data/geojson/vien-san-thuong-sau.geojson",
  });
  vienSanThuongSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(177,177,177)",
          },
        },
      ],
    },
  };

  const thanhChanSangThuongSauLayer = new GeoJSONLayer({
    url: "./data/geojson/thanh-chan-san-thuong-sau.geojson",
  });
  thanhChanSangThuongSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 2.5,
          material: {
            color: "rgb(140,140,140)",
          },
        },
      ],
    },
  };

  const phanMaiSanThuongSauLayer = new GeoJSONLayer({
    url: "./data/geojson/phan-mai-san-thuong-sau.geojson",
  });
  phanMaiSanThuongSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(199, 187, 172)",
          },
        },
      ],
    },
  };

  const khuVucGiengTroiLayer = new GeoJSONLayer({
    url: "./data/geojson/khu-vuc-gieng-troi.geojson",
  });
  khuVucGiengTroiLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.2,
          material: {
            color: "rgb(230,230,230)",
          },
        },
      ],
    },
  };

  const giengTroiLayer = new GeoJSONLayer({
    url: "./data/geojson/gieng-troi.geojson",
  });
  giengTroiLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: [39, 40, 58, 0.8],
          },
        },
      ],
    },
  };

  const lanCanGiengTroiLayer = new GeoJSONLayer({
    url: "./data/geojson/lan-can-gieng-troi.geojson",
  });
  lanCanGiengTroiLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(140,140,140)",
          },
        },
      ],
    },
  };

  const maiBanCongMatTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/mai-ban-cong-mat-truoc.geojson",
  });
  maiBanCongMatTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 1,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const cotPhanCachLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-phan-cach.geojson",
  });
  cotPhanCachLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 5,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const cuaChinhLayer = new GeoJSONLayer({
    url: "./data/geojson/cua-chinh.geojson",
  });
  cuaChinhLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 5,
          material: {
            color: [39, 56, 64],
          },
        },
      ],
    },
  };

  const khoiPhiaTrenCuaChinhLayer = new GeoJSONLayer({
    url: "./data/geojson/khoi-phia-tren-cua-chinh.geojson",
  });
  khoiPhiaTrenCuaChinhLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 1.5,
          material: {
            color: "rgb(207, 206, 208)",
          },
        },
      ],
    },
  };

  const cuaKinhBanCongMatTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/cua-kinh-ban-cong-tang-mot.geojson",
  });
  cuaKinhBanCongMatTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 5,
          material: {
            color: [75, 75, 75, 0.9],
          },
        },
      ],
    },
  };

  const cotPhuTangHaiPhiaSauLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-phu-tang-hai-phia-sau.geojson",
  });
  cotPhuTangHaiPhiaSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 10,
          material: {
            color: "rgb(130 ,130 ,130)",
          },
        },
      ],
    },
  };

  const lanCanTangHaiLayer = new GeoJSONLayer({
    url: "./data/geojson/lan-can-tang-hai.geojson",
  });
  lanCanTangHaiLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 10,
          material: {
            color: "rgb(219, 196, 156)",
          },
        },
      ],
    },
  };

  const maiNhaToaSauLayer = new GeoJSONLayer({
    url: "./data/geojson/mai-nha-toa-sau.geojson",
  });
  maiNhaToaSauLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0.5,
          material: {
            color: "rgb(170,170,170)",
          },
        },
      ],
    },
  };

  const phanKinhBanCongMatTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/phan-kinh-ban-cong-mat-truoc.geojson",
  });
  phanKinhBanCongMatTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 7,
          material: {
            color: [39, 40, 58],
          },
        },
      ],
    },
  };

  const cotPhuBanCongMatTruocLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-phu-ban-cong-mat-truoc.geojson",
  });
  cotPhuBanCongMatTruocLayer.renderer = {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 12.35,
          material: {
            color: "rgb(208, 198, 191)",
          },
        },
      ],
    },
  };

  const cotCoLayer = new GeoJSONLayer({
    url: "./data/geojson/cot-co.geojson",
  });
  cotCoLayer.renderer = {
    type: "simple",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          width: 0.13,
          height: 9.63,
          depth: 0.13,
          material: { color: "rgb(204, 204, 204)" },
        },
      ],
    },
  };

  const cucTronDinhCotCoLayer = new GeoJSONLayer({
    url: "./data/geojson/cuc-tron-dinh-cot-co.geojson",
  });
  cucTronDinhCotCoLayer.renderer = {
    type: "simple",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          width: 0.33,
          height: 0.33,
          depth: 0.33,
          material: { color: "rgb(204, 204, 204)" },
        },
      ],
    },
  };

  const map = new Map({
    basemap: "dark-gray-vector",
    ground: "world-elevation",
    layers: [
      tangHamLayer,
      cauThangLayer,
      nenTangTretLayer,
      tuongTangTretLayer,
      vienTangTretLayer,
      lanCanLayer,
      cotTruChinhLayer,
      cotPhuLayer,
      cuaRaVaoLayer,
      nenTangMotLayer,
      vienNhaTangTretLayer,
      maiHienLayer,
      nenBanCongMatTruocLayer,
      lanCanBanCongMatTruocLayer,
      cotTruChinhTangMot,
      cuaSoTangHamLayer,
      thanhNgangCuaSoLayer,
      matKinhBenTrenLayer,
      matKinhBenDuoiLayer,
      cuaSoTangTretLayer,
      thanhNgangLayer,
      matKinhNgangLayer,
      nenSanThuongToaTruocLayer,
      vienNenSanThuongToaTruocLayer,
      sanThuongLayer,
      vienSanThuongLayer,
      lanCanSanThuongNuaTrenLayer,
      phaMaiSanThuongLayer,
      phaMaiSanThuongGiuaLayer,
      kinhChanSanThuongLayer,
      cotChanSanThuongLayer,
      sanThuongSauLayer,
      lanCanSanThuongSauLayer,
      vienSanThuongSauLayer,
      thanhChanSangThuongSauLayer,
      phanMaiSanThuongSauLayer,
      khuVucGiengTroiLayer,
      giengTroiLayer,
      lanCanGiengTroiLayer,
      maiBanCongMatTruocLayer,
      cotPhanCachLayer,
      cuaChinhLayer,
      khoiPhiaTrenCuaChinhLayer,
      cuaKinhBanCongMatTruocLayer,
      cotPhuTangHaiPhiaSauLayer,
      lanCanTangHaiLayer,
      maiNhaToaSauLayer,
      phanKinhBanCongMatTruocLayer,
      cotPhuBanCongMatTruocLayer,
      cotCoLayer,
      cucTronDinhCotCoLayer,
    ],
  });

  // tùy chọn camera mặc định
  const defaultCamera = {
    position: [106.69686000803644, 10.777206782229955, 73.85002393834293],
    heading: 262.8197452067017,
    tilt: 71.76522024538839,
  };

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: defaultCamera,
    qualityProfile: "high",
  });

  window.view = view;
  view.popup.defaultPopupTemplateEnabled = true;

  // đổi basemap
  window.changeBasemap = function (basemap) {
    map.basemap = basemap;
  };

  // reset view về mặc định
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    view.goTo(defaultCamera, {
      speedFactor: 0.5,
      easing: "in-out",
    });
  });

  // thông số camera
  view.watch("camera", (camera) => {
    const { latitude, longitude, z } = camera.position;
    const heading = camera.heading.toFixed(2);
    const tilt = camera.tilt.toFixed(2);

    document.getElementById("cameraInfo").innerHTML = `
    <strong>Thông số camera</strong><br>
    Kinh độ: ${longitude.toFixed(5)}<br>
    Vĩ độ: ${latitude.toFixed(5)}<br>
    Độ cao: ${z.toFixed(2)}<br>
    Hướng: ${heading}°<br>
    Góc: ${tilt}°
  `;
  });

  // Get the modal
  var modal = document.getElementById("locationImgModal");

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var img = document.getElementById("locationImg");
  var modalImg = document.getElementById("enlargedLocationImage");
  var captionText = document.getElementById("caption");
  img.onclick = function () {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
  };

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };
});
