(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CDS95Wind = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WORLD_PIXEL_W = 2500 * 16;
  const WORLD_PIXEL_H = 1250 * 16;
  const DEG = Math.PI / 180;
  const GAME_EPOCH = Date.UTC(1492, 0, 1);
  const TAIL_FACTOR = 1.00;
  const HEAD_FACTOR = 0.65;

  const WIND_BELTS = Object.freeze([
    { id: 'north-polar-easterlies', name: '북극 동풍', from: '북동쪽', latMin: 60, latMax: 90 },
    { id: 'north-westerlies', name: '북반구 편서풍', from: '남서쪽', latMin: 32, latMax: 60 },
    { id: 'north-trade-winds', name: '북동 무역풍', from: '북동쪽', latMin: 5, latMax: 28 },
    { id: 'equatorial-doldrums', name: '적도 무풍대', from: '일정하지 않음', latMin: -5, latMax: 5 },
    { id: 'south-trade-winds', name: '남동 무역풍', from: '남동쪽', latMin: -28, latMax: -5 },
    { id: 'south-westerlies', name: '남반구 편서풍', from: '북서쪽', latMin: -60, latMax: -32 },
    { id: 'south-polar-easterlies', name: '남극 동풍', from: '남동쪽', latMin: -90, latMax: -60 }
  ]);

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function wrapLon(lon) { let v = Number(lon) || 0; while (v < -180) v += 360; while (v >= 180) v -= 360; return v; }
  function normalize(x, y) { const m = Math.hypot(x, y) || 1; return { x: x / m, y: y / m }; }
  function rotate(x, y, radians) { const c = Math.cos(radians), s = Math.sin(radians); return { x: x * c - y * s, y: x * s + y * c }; }
  function lonLat(x, y) {
    return {
      lon: wrapLon((Number(x) || 0) / WORLD_PIXEL_W * 360 - 180),
      lat: 90 - clamp((Number(y) || 0) / WORLD_PIXEL_H, 0, 1) * 180
    };
  }
  function pixelFromLonLat(lon, lat) {
    return {
      x: ((wrapLon(lon) + 180) / 360) * WORLD_PIXEL_W,
      y: ((90 - clamp(lat, -90, 90)) / 180) * WORLD_PIXEL_H
    };
  }
  function dateParts(gameMinutes) {
    const date = new Date(GAME_EPOCH + Math.max(0, Number(gameMinutes) || 0) * 60000);
    return { month: date.getUTCMonth() + 1, dayOfYear: Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000) + 1 };
  }
  function beltWind(lat) {
    const a = Math.abs(lat);
    if (a < 5) return { id: 'equatorial-doldrums', name: '적도 무풍대', x: -1, y: lat >= 0 ? .08 : -.08, strength: .10 };
    if (a < 28) {
      const north = lat > 0;
      return { id: north ? 'north-trade-winds' : 'south-trade-winds', name: north ? '북동 무역풍' : '남동 무역풍', x: -.82, y: north ? .57 : -.57, strength: .84 };
    }
    if (a < 34) return { id: lat > 0 ? 'north-subtropical-high' : 'south-subtropical-high', name: '아열대 고압대', x: 1, y: 0, strength: .16 };
    if (a < 60) {
      const north = lat > 0;
      return { id: north ? 'north-westerlies' : 'south-westerlies', name: north ? '북반구 편서풍' : '남반구 편서풍', x: .86, y: north ? -.51 : .51, strength: .78 + clamp((a - 34) / 26, 0, 1) * .13 };
    }
    const north = lat > 0;
    return { id: north ? 'north-polar-easterlies' : 'south-polar-easterlies', name: north ? '북극 동풍' : '남극 동풍', x: -.84, y: north ? .54 : -.54, strength: .58 + clamp((a - 60) / 30, 0, 1) * .20 };
  }
  function monsoonWind(lon, lat, month) {
    // 인도양·남아시아의 대표적인 계절풍만 교육용으로 단순화한다.
    if (lon < 38 || lon > 122 || lat < -12 || lat > 31) return null;
    if (month >= 6 && month <= 9) return { id: 'summer-southwest-monsoon', name: '여름 남서 계절풍', x: .72, y: -.69, strength: .92 };
    if (month === 11 || month === 12 || month <= 2) return { id: 'winter-northeast-monsoon', name: '겨울 북동 계절풍', x: -.74, y: .67, strength: .78 };
    return { id: 'monsoon-transition', name: '계절풍 전환기', x: lat >= 0 ? -.65 : -.88, y: lat >= 0 ? .35 : -.16, strength: .32 };
  }
  function windAtPixel(x, y, gameMinutes = 0) {
    const { lon, lat } = lonLat(x, y);
    const { month, dayOfYear } = dateParts(gameMinutes);
    const base = monsoonWind(lon, lat, month) || beltWind(lat);
    // 같은 학급 시간에는 모든 학생에게 동일하고, 날마다 아주 조금만 굽이친다.
    const wobble = Math.sin((lon * .75 + dayOfYear * 2.4) * DEG) * 4.5 * DEG;
    const dir = rotate(base.x, base.y, wobble);
    const norm = normalize(dir.x, dir.y);
    const strengthWave = .93 + .07 * Math.sin((lon * 1.1 - dayOfYear * 1.7) * DEG);
    return {
      x: norm.x,
      y: norm.y,
      strength: clamp(base.strength * strengthWave, 0, 1),
      id: base.id,
      name: base.name,
      lon,
      lat,
      month
    };
  }
  function speedMultiplier(alignment, strength = 1, tail = TAIL_FACTOR, head = HEAD_FACTOR) {
    const a = clamp(Number(alignment) || 0, -1, 1);
    const s = clamp(Number(strength) || 0, 0, 1);
    return a >= 0 ? 1 + tail * s * a : 1 + head * s * a;
  }
  function assistPercent(alignment, strength = 1, tail = TAIL_FACTOR, head = HEAD_FACTOR) {
    return Math.round((speedMultiplier(alignment, strength, tail, head) - 1) * 100);
  }
  function directionArrow(x, y) {
    const a = Math.atan2(y, x);
    const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];
    return arrows[(Math.round(a / (Math.PI / 4)) + 8) % 8];
  }

  return {
    WORLD_PIXEL_W,
    WORLD_PIXEL_H,
    WIND_BELTS,
    TAIL_FACTOR,
    HEAD_FACTOR,
    lonLat,
    pixelFromLonLat,
    windAtPixel,
    speedMultiplier,
    assistPercent,
    directionArrow,
    dateParts
  };
});
