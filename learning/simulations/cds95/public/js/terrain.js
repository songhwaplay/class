(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UW3Terrain = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WORLD_W = 2500;
  const WORLD_H = 1250;
  const TILE = 16;
  const WORLD_PIXEL_W = WORLD_W * TILE;
  const WORLD_PIXEL_H = WORLD_H * TILE;
  let naturalEarthLandMask = null;

  const SPEED = Object.freeze({
    sea: 1.00,
    plain: 0.88,
    coast: 0.76,
    river: 0.58,
    forest: 0.54,
    desert: 0.43,
    mountain: 0.30,
    highMountain: 0.18
  });

  const LABEL = Object.freeze({
    sea: '바다',
    plain: '평원',
    coast: '해안·구릉',
    river: '강',
    forest: '숲·밀림',
    desert: '사막',
    mountain: '산악',
    highMountain: '고산'
  });

  const RIVER_FAMILIES = new Set([60, 61, 62, 68, 88, 92, 97]);
  const FOREST_FAMILIES = new Set([93, 94, 95]);
  // WORLD.CDS 타일 아틀라스에서 큰 산맥 그림이 들어 있는 행이다.
  // 지리 좌표 범위가 아니라 실제 지도에 찍힌 타일로만 고산을 판정한다.
  const HIGH_MOUNTAIN_FAMILIES = new Set([
    44,45,46,47,48,49,50,51,52,53,54,55,56,57,58
  ]);

  const MOUNTAIN_FAMILIES = new Set([
    44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,
    63,64,65,66,67,69,70,71,72,73,74,78,79,80,81,82,
    84,85,86,96,98,99,100,101,102,103,104
  ]);

  // Natural Earth의 0.144도 격자 마스크에서는 폭이 매우 좁은 해협이 육지로 닫힐 수 있다.
  // 실제로 선박이 통과해야 하는 자연 해협만 별도 항로로 열어 둔다.
  // path 좌표는 [위도, 경도], widthDeg는 항로 중심선에서 허용할 반폭이다.
  const NAVIGABLE_SEA_CORRIDORS = Object.freeze([
    Object.freeze({
      id: 'messina',
      widthDeg: 0.26,
      path: Object.freeze([
        Object.freeze([37.88, 15.62]),
        Object.freeze([38.00, 15.60]),
        Object.freeze([38.10, 15.58]),
        Object.freeze([38.20, 15.61]),
        Object.freeze([38.30, 15.65]),
        Object.freeze([38.40, 15.68])
      ])
    }),
    Object.freeze({
      id: 'dardanelles',
      widthDeg: 0.22,
      path: Object.freeze([
        Object.freeze([39.96, 26.05]),
        Object.freeze([40.12, 26.27]),
        Object.freeze([40.28, 26.47]),
        Object.freeze([40.43, 26.66]),
        Object.freeze([40.56, 26.83])
      ])
    }),
    Object.freeze({
      id: 'bosporus',
      widthDeg: 0.20,
      path: Object.freeze([
        Object.freeze([40.94, 28.78]),
        Object.freeze([41.02, 28.92]),
        Object.freeze([41.10, 29.03]),
        Object.freeze([41.18, 29.10]),
        Object.freeze([41.27, 29.16])
      ])
    })
  ]);

  function wrapCellX(cx) {
    cx %= WORLD_W;
    return cx < 0 ? cx + WORLD_W : cx;
  }

  function wrapPixelX(x) {
    x %= WORLD_PIXEL_W;
    return x < 0 ? x + WORLD_PIXEL_W : x;
  }

  function cellValue(world, cx, cy) {
    if (!world || cy < 0 || cy >= WORLD_H) return 0x4000;
    return world[cy * WORLD_W + wrapCellX(cx)];
  }

  function isLandValue(value) {
    return (value & 0x4000) !== 0;
  }

  function setNaturalEarthLandMask(mask) {
    if (!mask) { naturalEarthLandMask = null; return; }
    const view = mask instanceof Uint8Array ? mask : new Uint8Array(mask);
    if (view.length !== WORLD_W * WORLD_H) throw new Error('Natural Earth land mask size mismatch');
    naturalEarthLandMask = view;
  }

  function usesNaturalEarthMask() {
    // V60: Natural Earth 배경과 이동 판정을 전 세계에서 같은 해안선으로 통일한다.
    return true;
  }

  function pointToSegmentDistanceDeg(lat, lon, a, b) {
    const refLat = (lat + a[0] + b[0]) / 3 * Math.PI / 180;
    const lonScale = Math.max(0.2, Math.cos(refLat));
    const px = lon * lonScale;
    const py = lat;
    const ax = a[1] * lonScale;
    const ay = a[0];
    const bx = b[1] * lonScale;
    const by = b[0];
    const dx = bx - ax;
    const dy = by - ay;
    const denom = dx * dx + dy * dy;
    const t = denom > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denom)) : 0;
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }

  function navigableSeaCorridorAtCell(cx, cy) {
    const { lon, lat } = lonLat(cx + 0.5, cy + 0.5);
    for (const corridor of NAVIGABLE_SEA_CORRIDORS) {
      for (let i = 1; i < corridor.path.length; i += 1) {
        if (pointToSegmentDistanceDeg(lat, lon, corridor.path[i - 1], corridor.path[i]) <= corridor.widthDeg) return corridor.id;
      }
    }
    return null;
  }

  function isLandAt(world, cx, cy) {
    cx = wrapCellX(Math.floor(cx));
    cy = Math.max(0, Math.min(WORLD_H - 1, Math.floor(cy)));
    if (navigableSeaCorridorAtCell(cx, cy)) return false;
    if (naturalEarthLandMask && usesNaturalEarthMask(cx, cy)) return naturalEarthLandMask[cy * WORLD_W + cx] === 1;
    return isLandValue(cellValue(world, cx, cy));
  }

  function lonLat(cx, cy) {
    return {
      lon: wrapCellX(cx) / WORLD_W * 360 - 180,
      lat: 90 - cy / WORLD_H * 180
    };
  }

  function inBox(lon, lat, west, east, south, north) {
    return lon >= west && lon <= east && lat >= south && lat <= north;
  }

  function isAridRegion(lon, lat) {
    return (
      inBox(lon, lat, -18, 38, 12, 34) ||       // 사하라
      inBox(lon, lat, 35, 63, 12, 32) ||        // 아라비아
      inBox(lon, lat, 60, 118, 32, 50) ||       // 중앙아시아·고비
      inBox(lon, lat, 112, 148, -37, -16) ||    // 호주 내륙
      inBox(lon, lat, -77, -67, -31, -15) ||    // 아타카마
      inBox(lon, lat, -121, -99, 20, 38) ||     // 북미 남서부
      inBox(lon, lat, 11, 31, -31, -16)         // 칼라하리
    );
  }

  function isForestRegion(lon, lat) {
    return (
      inBox(lon, lat, -81, -47, -17, 9) ||      // 아마존
      inBox(lon, lat, 9, 31, -11, 9) ||         // 콩고 분지
      inBox(lon, lat, 89, 142, -12, 25) ||      // 동남아시아
      inBox(lon, lat, -94, -76, 6, 20)          // 중앙아메리카
    );
  }

  function isCoastalLand(world, cx, cy) {
    const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];
    return neighbors.some(([dx, dy]) => !isLandAt(world, cx + dx, cy + dy));
  }

  function terrainAtCell(world, cx, cy) {
    cx = wrapCellX(Math.floor(cx));
    cy = Math.floor(cy);
    const value = cellValue(world, cx, cy);
    if (!isLandAt(world, cx, cy)) return { type: 'sea', multiplier: SPEED.sea, passable: true };

    const tileId = value & 0x3fff;
    const family = tileId >> 7;
    const special = (value & 0x8000) !== 0;
    const { lon, lat } = lonLat(cx, cy);

    if (special) return { type: isCoastalLand(world, cx, cy) ? 'coast' : 'plain', multiplier: isCoastalLand(world, cx, cy) ? SPEED.coast : SPEED.plain, passable: true };
    if (RIVER_FAMILIES.has(family)) return { type: 'river', multiplier: SPEED.river, passable: true };
    if (HIGH_MOUNTAIN_FAMILIES.has(family)) return { type: 'highMountain', multiplier: SPEED.highMountain, passable: true };
    if (FOREST_FAMILIES.has(family) || isForestRegion(lon, lat)) return { type: 'forest', multiplier: SPEED.forest, passable: true };
    if (isAridRegion(lon, lat)) return { type: 'desert', multiplier: SPEED.desert, passable: true };
    if (MOUNTAIN_FAMILIES.has(family)) return { type: 'mountain', multiplier: SPEED.mountain, passable: true };
    if (isCoastalLand(world, cx, cy)) return { type: 'coast', multiplier: SPEED.coast, passable: true };
    return { type: 'plain', multiplier: SPEED.plain, passable: true };
  }

  function terrainAtPixel(world, x, y) {
    return terrainAtCell(world, Math.floor(wrapPixelX(x) / TILE), Math.floor(y / TILE));
  }

  return Object.freeze({
    WORLD_W, WORLD_H, TILE, WORLD_PIXEL_W, WORLD_PIXEL_H,
    SPEED, LABEL, HIGH_MOUNTAIN_FAMILIES, NAVIGABLE_SEA_CORRIDORS, wrapCellX, wrapPixelX, cellValue, setNaturalEarthLandMask, navigableSeaCorridorAtCell, terrainAtCell, terrainAtPixel, lonLat
  });
}));
