require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/request"
], function(Map, SceneView, GraphicsLayer, Graphic, esriRequest) {

  const baseUrl = "data/geojson-layers/";

  // Default list (fallback) of GeoJSON files (order matters)
  const defaultFilenames = [];

  // Transformation settings for local coordinate tuning (meters / degrees)
  // Edit these values to fine-tune placement, rotation and vertical scale.
  // - `rotateDeg` is degrees clockwise (use negative to rotate counter-clockwise)
  // - `translateX` / `translateY` are in local meters (applied after rotation)
  const transform = {
    swapXY: false,
    invertX: false,
    invertY: false,
    rotateDeg: 43, // rotate clockwise 45° by default for preview
    translateX: 0,  // meters: positive moves east (local X)
    translateY: -6, // meters: negative moves south (local Y) — tweak as needed
    translateZ: 0,
    verticalScale: 1.0
  };

  // Using filenameStyleMap for all layer styling (no taxonomy fallback)

  // Exact filename → style mapping (scanned and tuned).
  // This ensures files get the intended color even when their names don't match taxonomy keys exactly.
  const filenameStyleMap = {
    "wall.geojson": { color: [255, 243, 224, 1] },
    "lower_wall_1.geojson": { color: [255, 243, 224, 1] },
    "lower_wall_2.geojson": { color: [114, 114, 114, 1] },
    "middle_wall.geojson": { color: [255, 243, 224, 1] },
    "big_wall.geojson": { color: [255, 243, 224, 1] },
    "wall_floor_1.geojson": { color: [231, 226, 135, 1] },
    "floor_3.geojson": { color: [240, 240, 240, 1] },
    "column_floor_3.geojson": { color: [255, 255, 255, 1] },
    "top_column.geojson": { color: [231, 208, 88, 1] },
    "high_column.geojson": { color: [231, 226, 135, 1] },
    "low_column.geojson": { color: [231, 208, 88, 1] },
    "top_roof.geojson": { color: [244, 143, 65, 1] },
    "left_roof.geojson": { color: [244, 143, 65, 1] },
    "right_roof.geojson": { color: [244, 143, 65, 1] },
    "top_roof_bars.geojson": { color: [244, 143, 65, 1] },
    "bottom_roof_bars.geojson": { color: [244, 143, 65, 1] },
    "eaves.geojson": { color: [244, 143, 65, 1] },
    "lean-to.geojson": { color: [124, 124, 124, 1] },
    "arched_window_floor_1.geojson": { color: [76, 175, 80, 1] },
    "arched_window_floor_2.geojson": { color: [76, 175, 80, 1] },
    "square_window.geojson": { color: [76, 175, 80, 1] },
    "window_floor_3.geojson": { color: [76, 175, 80, 1] },
    "window_dark_green.geojson": { color: [76, 175, 80, 1] },
    "big_window_on_the_side.geojson": { color: [76, 175, 80, 1] },
    "main_gate.geojson": { color: [68, 121, 68, 1] },
    "main_gate_arch.geojson": { color: [200, 200, 200, 1] },
    "clock.geojson": { color: [255, 255, 240, 1] },
    "phu_dieu_1.geojson": { color: [255, 255, 240, 1] },
    "phu_dieu_2.geojson": { color: [255, 255, 240, 1] },
    "phu_dieu_3.geojson": { color: [255, 255, 240, 1] },
    "phu_dieu_4.geojson": { color: [255, 255, 240, 1] },
    "gate_wall.geojson": { color: [231, 181, 123, 1] },
    "gate_high_column.geojson": { color: [231, 208, 88, 1] },
    "gate_low_column.geojson": { color: [231, 208, 88, 1] },
    "base.geojson": { color: [167, 168, 167, 1] },
    "stairs.geojson": { color: [126, 130, 126, 1] }
  };

  function getStyle(filename) {
    const base = filename.toLowerCase().split('/').pop();
    return filenameStyleMap[base] || { color: [200, 200, 200, 1] };
  }

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    viewingMode: "global", // Dùng global để tránh lỗi clipping với WGS84
    environment: {
      background: { type: "color", color: [255, 255, 255, 1] },
      starsEnabled: false,
      atmosphereEnabled: false,
      lighting: {
        directShadowsEnabled: true,
        ambientOcclusionEnabled: true
      }
    },
    camera: {
      position: { x: 106.70015, y: 10.779, z: 200, spatialReference: { wkid: 4326 } },
      heading: 0,
      tilt: 45
    }
  });

  // Quan trọng: Để mode là relative-to-ground để tòa nhà nằm trên mặt đất
  const graphicsLayer = new GraphicsLayer({ 
    elevationInfo: { mode: "relative-to-ground" } 
  });
  map.add(graphicsLayer);

  // Expose a reset camera function and attach to the RESET button in index.html
  try {
    view.when(() => {
      try {
        window.defaultCamera = view.camera.clone();
        window.resetCamera = () => view.goTo(window.defaultCamera).catch(()=>{});
        const btn = document.getElementById('resetBtn');
        if (btn) btn.onclick = window.resetCamera;
      } catch (e) { /* ignore */ }
    });
  } catch (e) { /* ignore environments without DOM */ }

  // Create a small English legend overlay so annotations are clear
  (function createLegend(){
    try {
      const viewDiv = document.getElementById('viewDiv');
      const legend = document.createElement('div');
      legend.id = 'modelLegend';
      // place the legend a bit lower and above other UI so it isn't covered
      legend.style.cssText = 'position:absolute;top:120px;right:12px;z-index:110;background:rgba(255,255,255,0.95);padding:8px;border-radius:6px;border:1px solid #ccc;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;box-shadow:0 1px 4px rgba(0,0,0,0.15)';
      const title = document.createElement('div'); title.textContent = 'Legend'; title.style.fontWeight = '700'; title.style.marginBottom = '6px';
      legend.appendChild(title);
      const items = [
        { label: 'Roof', color: [244,143,65,1] },
        { label: 'Wall', color: [255,243,224,1] },
        { label: 'Window', color: [76,175,80,1] },
        { label: 'Column', color: [255,255,255,1] },
        { label: 'Ornament', color: [255,255,240,1] },
        { label: 'Gate', color: [68,121,68,1] }
      ];
      items.forEach(it => {
        const row = document.createElement('div'); row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.marginBottom = '6px';
        const sw = document.createElement('span'); sw.style.display = 'inline-block'; sw.style.width = '18px'; sw.style.height = '12px'; sw.style.marginRight = '8px'; sw.style.backgroundColor = `rgba(${it.color.join(',')})`; sw.style.border = '1px solid rgba(0,0,0,0.08)';
        const lbl = document.createElement('span'); lbl.textContent = it.label;
        row.appendChild(sw); row.appendChild(lbl); legend.appendChild(row);
      });
      if (viewDiv && viewDiv.parentElement) viewDiv.parentElement.appendChild(legend); else document.body.appendChild(legend);
    } catch (e) { console.warn('Could not create legend overlay', e); }
  })();

  // Load files in batches (parallel within a chunk) and return loaded objects
  async function loadInBatches(list, batchSize = 5, timeoutMs = 120000) {
    const loaded = [];
    for (let i = 0; i < list.length; i += batchSize) {
      const chunk = list.slice(i, i + batchSize);
      await Promise.all(chunk.map(async filename => {
        const style = getStyle(filename);
          try {
            const response = await esriRequest(baseUrl + filename, { responseType: "json", timeout: timeoutMs });
            const geojson = response.data;
            if (!geojson || !Array.isArray(geojson.features)) return;
            loaded.push({ filename, geojson, style });
            console.log('Loaded:', filename);
          } catch (err) {
            console.error('Error loading ' + filename, err);
          }
      }));
    }
    return loaded;
  }

  // Try to read layers.json for canonical order; fall back to defaults
  esriRequest(baseUrl + 'layers.json', { responseType: 'json' }).then(r => {
    const list = Array.isArray(r.data) && r.data.length ? r.data : defaultFilenames;
    console.log('Using layers.json for file order:', list.length, 'files');
    return loadInBatches(list, 5, 120000);
  }).catch(err => {
    console.warn('layers.json not found or failed to load, using default list');
    return loadInBatches(defaultFilenames, 5, 120000);
  }).then(async (loadedFiles) => {
    console.log('All files loaded. Preparing to render...');
    if (!loadedFiles || loadedFiles.length === 0) return;

    // Scan coordinates to compute model frame
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity;
    let maxAbs = 0;

    function scanCoord(pt) {
      if (!pt || !Array.isArray(pt)) return;
      const x = Number(pt[0]), y = Number(pt[1]);
      const z = pt.length >= 3 ? Number(pt[2]) : 0;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      minZ = Math.min(minZ, z);
      maxAbs = Math.max(maxAbs, Math.abs(x), Math.abs(y));
    }

    loadedFiles.forEach(file => {
      file.geojson.features.forEach(feature => {
        const geom = feature.geometry;
        if (geom.type === 'Polygon') {
          geom.coordinates.forEach(ring => ring.forEach(scanCoord));
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach(poly => poly.forEach(ring => ring.forEach(scanCoord)));
        }
      });
    });

    const anchor_lon = 106.69999;
    const anchor_lat = 10.77996;
    const anchor_z = 0.5;
    
    const meanX = (minX + maxX) / 2.0;
    const meanY = (minY + maxY) / 2.0;
    const treatAsLocal = maxAbs < 500;

    let frame = treatAsLocal ? { x_center: meanX, y_center: meanY, z_min: minZ } : null;

    function local_to_wgs84(x, y, z) {
      const east_m = (x - frame.x_center);
      const north_m = (y - frame.y_center);
      const up_m = (z - frame.z_min);
      // apply clockwise rotation (transform.rotateDeg is degrees clockwise)
      const theta = (transform && typeof transform.rotateDeg === 'number') ? (transform.rotateDeg * Math.PI / 180.0) : 0;
      const cosT = Math.cos(theta), sinT = Math.sin(theta);
      const rotatedEast = cosT * east_m + sinT * north_m; // clockwise rotation
      const rotatedNorth = -sinT * east_m + cosT * north_m;
      const m_per_lat = 111320.0;
      const m_per_lon = m_per_lat * Math.cos(anchor_lat * Math.PI / 180.0);
      const lon = anchor_lon + (rotatedEast / m_per_lon);
      const lat = anchor_lat + (rotatedNorth / m_per_lat);
      return [lon, lat, anchor_z + up_m];
    }

    // Zoom camera before rendering
    await view.goTo({
      target: [anchor_lon, anchor_lat],
      zoom: 19,
      tilt: 65,
      heading: 35
    }, { duration: 2000 });

    // Start rendering graphics progressively
    let addedCount = 0;
    for (const file of loadedFiles) {
      const style = file.style;
      
      for (const feature of file.geojson.features) {
        let rings = feature.geometry.type === 'Polygon' ? feature.geometry.coordinates : 
                    feature.geometry.coordinates.flat(1);

        for (const ring of rings) {
          const convertedRing = ring.map(pt => treatAsLocal ? local_to_wgs84(pt[0], pt[1], pt[2]||0) : [Number(pt[0]), Number(pt[1]), pt.length >= 3 ? Number(pt[2]) : 0]);

          const graphic = new Graphic({
            geometry: {
              type: "polygon",
              rings: [convertedRing],
              hasZ: true, 
              spatialReference: { wkid: 4326 }
            },
            symbol: {
              type: "polygon-3d",
              symbolLayers: [{
                type: "fill",
                material: { color: style.color },
                edges: { type: "solid", color: [50, 50, 50, 0.4], size: 0.5 } 
              }]
            }
          });
          
          graphicsLayer.add(graphic);
          addedCount++;
          
          // Small delay to avoid jank and create a build-up render effect
          if (addedCount % 20 === 0) {
            await new Promise(r => setTimeout(r, 1));
          }
        }
      }
      await new Promise(r => setTimeout(r, 50));
    }

    console.log('All files processed. Total graphics added (Optimized):', addedCount);

    // compute extent from added graphics and zoom in with tilt (and markers)
    const gfx = graphicsLayer.graphics.toArray ? graphicsLayer.graphics.toArray() : (graphicsLayer.graphics && graphicsLayer.graphics.items) || [];
    const total = gfx ? gfx.length : 0;
    console.log('Graphics count for zoom:', total);
    if (!gfx || total === 0) return;

    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
    gfx.forEach(g => {
      try {
        const geom = g.geometry;
        if (!geom) return;
        const rings = geom.rings || (geom.coordinates ? (Array.isArray(geom.coordinates[0]) ? geom.coordinates[0] : geom.coordinates) : []);
        if (!rings || rings.length === 0) return;
        for (const ring of rings) {
          if (!Array.isArray(ring)) continue;
          for (const pt of ring) {
            if (!pt || typeof pt[0] !== 'number' || typeof pt[1] !== 'number') continue;
            xmin = Math.min(xmin, pt[0]);
            ymin = Math.min(ymin, pt[1]);
            xmax = Math.max(xmax, pt[0]);
            ymax = Math.max(ymax, pt[1]);
          }
        }
      } catch (e) { /* ignore */ }
    });

    if (!isFinite(xmin)) return;

    const extent = { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax, spatialReference: { wkid: 4326 } };
    console.log('Computed extent:', extent);

    const centerX = (xmin + xmax) / 2;
    const centerY = (ymin + ymax) / 2;
    console.log('Extent center coords:', centerX, centerY);

    try {
      const centerMarker = new Graphic({
        geometry: { type: 'point', x: centerX, y: centerY, spatialReference: { wkid: 4326 } },
        symbol: {
          type: 'point-3d',
          symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [255, 0, 0, 1] }, size: '14px' }]
        }
      });
      graphicsLayer.add(centerMarker);

      const anchorMarker = new Graphic({
        geometry: { type: 'point', x: anchor_lon, y: anchor_lat, spatialReference: { wkid: 4326 } },
        symbol: {
          type: 'point-3d',
          symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [0, 0, 255, 1] }, size: '12px' }]
        }
      });
      graphicsLayer.add(anchorMarker);
    } catch (e) { console.warn('Could not add debug markers', e); }

    view.goTo({ target: extent, tilt: 60, heading: 30 }, { duration: 2000 }).catch(() => {
      view.goTo({ center: [centerX, centerY], zoom: 18, tilt: 60 }).catch(()=>{});
    });
  });
});