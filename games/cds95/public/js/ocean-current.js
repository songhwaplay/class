(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CDS95Current = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const WORLD_PIXEL_W = 2500 * 16;
  const WORLD_PIXEL_H = 1250 * 16;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothBand(v, min, max, feather) {
    const enter = clamp((v - min) / feather, 0, 1);
    const leave = clamp((max - v) / feather, 0, 1);
    return Math.min(enter, leave);
  }
  function wrapLon(lon) { let v = lon; while (v < -180) v += 360; while (v >= 180) v -= 360; return v; }
  function lonLat(x, y) {
    return { lon: wrapLon((x / WORLD_PIXEL_W) * 360 - 180), lat: 90 - (y / WORLD_PIXEL_H) * 180 };
  }
  function add(acc, vx, vy, strength, weight, name) {
    if (weight <= 0) return;
    acc.x += vx * strength * weight;
    acc.y += vy * strength * weight;
    acc.weight += weight;
    if (strength * weight > acc.bestStrength) { acc.bestStrength = strength * weight; acc.name = name; }
  }
  function regionWeight(lon, lat, box, feather = 7) {
    return smoothBand(lon, box[0], box[1], feather) * smoothBand(lat, box[2], box[3], feather);
  }
  function currentAtPixel(x, y) {
    const { lon, lat } = lonLat(x, y);
    const a = { x: 0, y: 0, weight: 0, bestStrength: 0, name: '잔잔한 해역' };

    // 교육용 단순화 해류 모델: 실제 주요 해류의 대략적인 위치와 흐름을 표현한다.
    add(a, 0.93, -0.37, 1.00, regionWeight(lon, lat, [-82, -28, 24, 52]), '멕시코만류·북대서양 해류');
    add(a, -0.25, 0.97, 0.62, regionWeight(lon, lat, [-32, 8, 18, 42]), '카나리아 해류');
    add(a, -1.00, 0.06, 0.70, regionWeight(lon, lat, [-65, 12, 4, 24]), '북적도 해류');
    add(a, 0.10, 0.99, 0.58, regionWeight(lon, lat, [-66, -42, 44, 68]), '래브라도 해류');
    add(a, -0.55, -0.84, 0.58, regionWeight(lon, lat, [-58, -28, -42, -18]), '브라질 해류');
    add(a, 0.02, -1.00, 0.56, regionWeight(lon, lat, [-25, 18, -38, -15]), '벵겔라 해류');
    add(a, -1.00, 0.03, 0.64, regionWeight(lon, lat, [-55, 20, -20, -4]), '남적도 해류');

    add(a, 0.72, -0.69, 0.92, regionWeight(lon, lat, [118, 178, 18, 48]), '쿠로시오 해류');
    add(a, -0.94, 0.33, 0.58, regionWeight(lon, lat, [-180, -125, 28, 52]), '북태평양 해류');
    add(a, 0.04, 1.00, 0.56, regionWeight(lon, lat, [-145, -112, 20, 44]), '캘리포니아 해류');
    add(a, -1.00, 0.02, 0.70, regionWeight(lon, lat, [120, 180, 3, 23]), '북적도 해류');
    add(a, 0.94, -0.34, 0.62, regionWeight(lon, lat, [135, 180, -42, -18]), '동오스트레일리아 해류');
    add(a, 0.05, -1.00, 0.52, regionWeight(lon, lat, [-100, -72, -42, -15]), '페루 해류');

    add(a, -0.98, -0.20, 0.62, regionWeight(lon, lat, [42, 110, -24, -5]), '남적도 해류');
    add(a, 0.30, -0.95, 0.60, regionWeight(lon, lat, [20, 48, -40, -18]), '아굴라스 해류');
    add(a, 0.92, 0.38, 0.46, regionWeight(lon, lat, [42, 100, 5, 24]), '인도양 계절 해류');

    // 남극 순환류와 저위도 배경 흐름을 약하게 더해 빈 해역도 방향을 읽을 수 있게 한다.
    add(a, 1.00, 0.00, 0.48, smoothBand(-lat, 38, 68, 8), '남극 순환류');
    if (Math.abs(lat) < 18) add(a, -1.00, 0.03 * Math.sign(lat || 1), 0.22, 1, '적도 해류');

    const mag = Math.hypot(a.x, a.y);
    if (mag < 0.02) return { x: 0, y: 0, strength: 0, name: '잔잔한 해역', lon, lat };
    const strength = clamp(mag, 0, 1.25);
    return { x: a.x / mag, y: a.y / mag, strength, name: a.name, lon, lat };
  }
  function movementFactor(alignment, tail = 0.30, head = 0.08, cross = 0.14) {
    const a = clamp(Number(alignment) || 0, -1, 1);
    if (a >= 0) return cross + (tail - cross) * a;
    return cross + (head - cross) * (-a);
  }
  function directionArrow(x, y) {
    const a = Math.atan2(y, x);
    const arrows = ['→','↘','↓','↙','←','↖','↑','↗'];
    return arrows[(Math.round(a / (Math.PI / 4)) + 8) % 8];
  }
  return { WORLD_PIXEL_W, WORLD_PIXEL_H, currentAtPixel, movementFactor, directionArrow, lonLat };
});
