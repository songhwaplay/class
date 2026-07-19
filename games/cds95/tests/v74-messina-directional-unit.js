const assert = require('node:assert/strict');
const fs = require('node:fs');
const Terrain = require('../public/js/terrain.js');

const worldBuffer = fs.readFileSync('data/world/WORLD.CDS');
const world = new Uint16Array(worldBuffer.buffer, worldBuffer.byteOffset, worldBuffer.length / 2);
const maskBuffer = fs.readFileSync('data/world/NATURAL_EARTH_LAND_MASK.bin');
Terrain.setNaturalEarthLandMask(new Uint8Array(maskBuffer.buffer, maskBuffer.byteOffset, maskBuffer.length));

function pixel(lat, lon) {
  return {
    x: (lon + 180) / 360 * Terrain.WORLD_PIXEL_W,
    y: (90 - lat) / 180 * Terrain.WORLD_PIXEL_H
  };
}

function isSeaPixel(x, y) {
  return Terrain.terrainAtPixel(world, x, y).type === 'sea';
}

// 서버의 클릭 이동 충돌 후보 순서와 V74 기준 최대 1틱 이동량을 그대로 재현한다.
function targetTravelSucceeds(startLatLon, endLatLon) {
  let { x, y } = pixel(...startLatLon);
  const target = pixel(...endLatLon);
  assert.equal(isSeaPixel(x, y), true, `start must be sea: ${startLatLon}`);
  assert.equal(isSeaPixel(target.x, target.y), true, `target must be sea: ${endLatLon}`);

  for (let tick = 0; tick < 400; tick += 1) {
    const dx = target.x - x;
    const dy = target.y - y;
    const distance = Math.hypot(dx, dy);
    if (distance < 4) return true;
    const vx = dx / distance;
    const vy = dy / distance;
    const step = Math.min(13.2, distance);
    const candidates = [[x + vx * step, y + vy * step]];
    if (Math.abs(vx) > 0.001 && Math.abs(vy) > 0.001) {
      candidates.push([x + vx * step, y], [x, y + vy * step]);
    }
    let moved = false;
    for (const [nx, ny] of candidates) {
      if (!isSeaPixel(nx, ny)) continue;
      x = nx;
      y = ny;
      moved = true;
      break;
    }
    if (!moved) return false;
  }
  return false;
}

const passages = [
  // V73에서 남→북만 되고 북→남은 막히던 동쪽 진입선.
  [[37.80, 15.95], [38.55, 15.75]],
  // 해협 중앙과 서쪽 진입선도 양방향 여유를 확인한다.
  [[37.70, 15.75], [38.60, 15.55]],
  [[37.70, 15.55], [38.45, 15.35]]
];

for (const [south, north] of passages) {
  assert.equal(targetTravelSucceeds(south, north), true, `south-to-north blocked: ${south} -> ${north}`);
  assert.equal(targetTravelSucceeds(north, south), true, `north-to-south blocked: ${north} -> ${south}`);
}

for (const [name, lat, lon] of [
  ['Sicily inland', 37.95, 15.15],
  ['Calabria inland', 38.25, 16.05],
  ['Palermo', 38.12, 13.36]
]) {
  const point = pixel(lat, lon);
  assert.notEqual(Terrain.terrainAtPixel(world, point.x, point.y).type, 'sea', `${name} must remain land`);
}

console.log(JSON.stringify({ ok: true, corridor: 'messina', directions: ['south-north', 'north-south'], approachLanes: passages.length }));
