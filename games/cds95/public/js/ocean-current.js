(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CDS95Current = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WORLD_PIXEL_W = 2500 * 16;
  const WORLD_PIXEL_H = 1250 * 16;
  const DEG = Math.PI / 180;
  const GENERAL_TAIL_FACTOR = 0.40;
  const STRONG_CORE_TAIL_FACTOR = 0.80;
  const HEAD_FACTOR = 0.23;
  const CROSS_FACTOR = 0.14;
  const STRONG_CORE_IDS = new Set(['gulf-north-atlantic', 'kuroshio']);

  // 초·중등 사회/지구과학에서 다루는 세계의 핵심 표층 해류만 단순화했다.
  // path는 해류가 흐르는 방향 순서이며, strength는 게임 안 해류 세기(0~1)다.
  const MAJOR_CURRENTS = Object.freeze([
    { id: 'gulf-north-atlantic', name: '멕시코만류·북대서양 해류', type: 'warm', strength: 1.00, width: 8.5, speed: 1.18, path: [[-86, 23], [-80, 31], [-68, 39], [-48, 46], [-25, 51], [2, 56]] },
    { id: 'canary', name: '카나리아 해류', type: 'cold', strength: 0.78, width: 6.5, speed: 0.88, path: [[2, 43], [-8, 35], [-17, 25], [-23, 15]] },
    { id: 'labrador', name: '래브라도 해류', type: 'cold', strength: 0.82, width: 6.0, speed: 0.96, path: [[-58, 66], [-58, 55], [-53, 45], [-47, 39]] },
    { id: 'north-equatorial-atlantic', name: '북적도 해류', type: 'warm', strength: 0.72, width: 6.2, speed: 0.90, path: [[-18, 16], [-38, 15], [-58, 16], [-75, 20]] },
    { id: 'brazil', name: '브라질 해류', type: 'warm', strength: 0.78, width: 6.2, speed: 0.94, path: [[-34, -5], [-39, -17], [-45, -29], [-51, -38]] },
    { id: 'benguela', name: '벵겔라 해류', type: 'cold', strength: 0.72, width: 6.0, speed: 0.86, path: [[17, -38], [12, -27], [8, -17], [5, -8]] },
    { id: 'south-equatorial-atlantic', name: '남적도 해류', type: 'warm', strength: 0.70, width: 6.2, speed: 0.90, path: [[8, -10], [-12, -10], [-31, -8], [-43, -5]] },

    { id: 'kuroshio', name: '쿠로시오 해류', type: 'warm', strength: 1.00, width: 7.2, speed: 1.16, path: [[123, 14], [128, 24], [136, 33], [147, 38], [160, 40]] },
    { id: 'oyashio', name: '오야시오 해류', type: 'cold', strength: 0.82, width: 5.8, speed: 0.98, path: [[166, 57], [159, 49], [151, 42], [144, 37]] },
    { id: 'north-pacific', name: '북태평양 해류', type: 'warm', strength: 0.75, width: 7.5, speed: 0.92, path: [[153, 41], [178, 43], [204, 42], [229, 39]] },
    { id: 'california', name: '캘리포니아 해류', type: 'cold', strength: 0.72, width: 6.0, speed: 0.86, path: [[-132, 44], [-127, 35], [-122, 26], [-116, 19]] },
    { id: 'north-equatorial-pacific', name: '북적도 해류', type: 'warm', strength: 0.72, width: 6.5, speed: 0.92, path: [[-116, 16], [-142, 15], [-169, 15], [-198, 16]] },
    { id: 'east-australian', name: '동오스트레일리아 해류', type: 'warm', strength: 0.82, width: 6.2, speed: 0.98, path: [[149, -13], [153, -23], [156, -33], [160, -42]] },
    { id: 'peru', name: '페루 해류', type: 'cold', strength: 0.78, width: 6.0, speed: 0.90, path: [[-80, -46], [-77, -35], [-77, -24], [-81, -13]] },
    { id: 'south-equatorial-pacific', name: '남적도 해류', type: 'warm', strength: 0.72, width: 6.5, speed: 0.92, path: [[-82, -10], [-111, -11], [-143, -11], [-176, -12]] },

    { id: 'aguhlas', name: '아굴라스 해류', type: 'warm', strength: 0.90, width: 6.5, speed: 1.05, path: [[43, -14], [40, -24], [34, -33], [23, -40]] },
    { id: 'south-equatorial-indian', name: '남적도 해류', type: 'warm', strength: 0.70, width: 6.5, speed: 0.90, path: [[104, -12], [83, -12], [63, -13], [45, -16]] },
    { id: 'antarctic-circumpolar', name: '남극 순환류', type: 'cold', strength: 0.85, width: 9.5, speed: 1.02, path: [[-180, -51], [-120, -53], [-60, -51], [0, -52], [60, -51], [120, -53], [180, -51]] }
  ]);

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothstep01(v) { const x = clamp(v, 0, 1); return x * x * (3 - 2 * x); }
  function wrapLon(lon) { let v = Number(lon) || 0; while (v < -180) v += 360; while (v >= 180) v -= 360; return v; }
  function wrapLonNear(lon, reference) {
    let v = lon;
    while (v - reference > 180) v -= 360;
    while (v - reference < -180) v += 360;
    return v;
  }
  function lonLat(x, y) {
    return { lon: wrapLon((x / WORLD_PIXEL_W) * 360 - 180), lat: 90 - (y / WORLD_PIXEL_H) * 180 };
  }
  function pixelFromLonLat(lon, lat) {
    return {
      x: ((wrapLon(lon) + 180) / 360) * WORLD_PIXEL_W,
      y: ((90 - clamp(lat, -90, 90)) / 180) * WORLD_PIXEL_H
    };
  }
  function projectedSegment(pointLon, pointLat, a, b) {
    const refLon = (a[0] + b[0]) * 0.5;
    const lon = wrapLonNear(pointLon, refLon);
    const meanLat = (a[1] + b[1] + pointLat) / 3;
    const cosLat = Math.max(0.25, Math.cos(meanLat * DEG));
    const ax = a[0] * cosLat;
    const ay = -a[1];
    const bx = b[0] * cosLat;
    const by = -b[1];
    const px = lon * cosLat;
    const py = -pointLat;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1) : 0;
    const qx = ax + dx * t;
    const qy = ay + dy * t;
    const distance = Math.hypot(px - qx, py - qy);
    const length = Math.sqrt(len2);
    return { distance, t, dx: length ? dx / length : 0, dy: length ? dy / length : 0, length, cosLat };
  }
  function currentAtPixel(x, y) {
    const { lon, lat } = lonLat(x, y);
    const acc = { x: 0, y: 0, best: 0, bestCenterWeight: 0, name: '잔잔한 해역', type: 'neutral', id: '' };

    for (const current of MAJOR_CURRENTS) {
      for (let i = 0; i < current.path.length - 1; i++) {
        const segment = projectedSegment(lon, lat, current.path[i], current.path[i + 1]);
        if (segment.distance >= current.width) continue;
        const centerWeight = smoothstep01(1 - segment.distance / current.width);
        const localStrength = current.strength * centerWeight;
        acc.x += segment.dx * localStrength;
        acc.y += segment.dy * localStrength;
        if (localStrength > acc.best) {
          acc.best = localStrength;
          acc.name = current.name;
          acc.type = current.type;
          acc.id = current.id;
          acc.bestCenterWeight = centerWeight;
        }
      }
    }

    const mag = Math.hypot(acc.x, acc.y);
    if (mag < 0.035) return { x: 0, y: 0, strength: 0, name: '잔잔한 해역', type: 'neutral', id: '', tailFactor: GENERAL_TAIL_FACTOR, coreBlend: 0, lon, lat };
    // 겹치는 해류에서도 가속/감속 상한을 넘지 않도록 세기는 반드시 1 이하로 제한한다.
    const strength = clamp(mag, 0, 1);
    // 멕시코만류·쿠로시오도 가장 강한 중심부에서만 +80%까지 올라간다.
    // 중심부 밖에서는 다른 주요 해류와 같은 +40% 상한을 사용한다.
    const coreBlend = STRONG_CORE_IDS.has(acc.id)
      ? smoothstep01((acc.bestCenterWeight - 0.72) / 0.28)
      : 0;
    const tailFactor = GENERAL_TAIL_FACTOR + (STRONG_CORE_TAIL_FACTOR - GENERAL_TAIL_FACTOR) * coreBlend;
    return { x: acc.x / mag, y: acc.y / mag, strength, name: acc.name, type: acc.type, id: acc.id, tailFactor, coreBlend, lon, lat };
  }

  // 반환값은 배 자체 속도에 더해지는 해류의 비율이다.
  // 일반 주요 해류는 완전한 순류 +40%, 멕시코만류·쿠로시오 핵심부만 +80%,
  // 완전한 역류 -23%, 횡류는 옆으로 최대 14% 밀어낸다.
  function movementFactor(alignment, tail = GENERAL_TAIL_FACTOR, head = HEAD_FACTOR, cross = CROSS_FACTOR) {
    const a = clamp(Number(alignment) || 0, -1, 1);
    if (a >= 0) return cross + (tail - cross) * a;
    return cross + (head - cross) * (-a);
  }
  function directionArrow(x, y) {
    const a = Math.atan2(y, x);
    const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];
    return arrows[(Math.round(a / (Math.PI / 4)) + 8) % 8];
  }
  function currentById(ref) {
    if (typeof ref === 'number') return MAJOR_CURRENTS[((ref % MAJOR_CURRENTS.length) + MAJOR_CURRENTS.length) % MAJOR_CURRENTS.length];
    if (ref && typeof ref === 'object' && Array.isArray(ref.path)) return ref;
    return MAJOR_CURRENTS.find((item) => item.id === ref) || MAJOR_CURRENTS[0];
  }
  function pointAlongCurrent(ref, progress, lane = 0) {
    const current = currentById(ref);
    const path = current.path;
    const lengths = [];
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const meanLat = (a[1] + b[1]) * 0.5;
      const cosLat = Math.max(0.25, Math.cos(meanLat * DEG));
      const length = Math.hypot((b[0] - a[0]) * cosLat, b[1] - a[1]);
      lengths.push(length);
      total += length;
    }
    let target = (((Number(progress) || 0) % 1) + 1) % 1 * total;
    let index = 0;
    while (index < lengths.length - 1 && target > lengths[index]) { target -= lengths[index]; index++; }
    const a = path[index];
    const b = path[index + 1];
    const t = lengths[index] > 0 ? target / lengths[index] : 0;
    let lon = a[0] + (b[0] - a[0]) * t;
    let lat = a[1] + (b[1] - a[1]) * t;
    const meanLat = (a[1] + b[1]) * 0.5;
    const cosLat = Math.max(0.25, Math.cos(meanLat * DEG));
    const dx = (b[0] - a[0]) * cosLat;
    const dy = -(b[1] - a[1]);
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const laneOffset = clamp(Number(lane) || 0, -1, 1) * current.width * 0.48;
    const projectedLon = lon * cosLat + (-uy) * laneOffset;
    const projectedY = -lat + ux * laneOffset;
    lon = projectedLon / cosLat;
    lat = -projectedY;
    const pixel = pixelFromLonLat(lon, lat);
    return { ...pixel, lon: wrapLon(lon), lat, xDir: ux, yDir: uy, strength: current.strength, name: current.name, type: current.type, id: current.id };
  }

  return {
    WORLD_PIXEL_W,
    WORLD_PIXEL_H,
    GENERAL_TAIL_FACTOR,
    STRONG_CORE_TAIL_FACTOR,
    HEAD_FACTOR,
    CROSS_FACTOR,
    MAJOR_CURRENTS,
    currentAtPixel,
    movementFactor,
    directionArrow,
    lonLat,
    pixelFromLonLat,
    pointAlongCurrent
  };
});
