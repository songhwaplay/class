const assert = require('node:assert/strict');
const fs = require('node:fs');
const Terrain = require('../public/js/terrain.js');

const worldBuffer = fs.readFileSync('data/world/WORLD.CDS');
const world = new Uint16Array(worldBuffer.buffer, worldBuffer.byteOffset, worldBuffer.length / 2);
const maskBuffer = fs.readFileSync('data/world/NATURAL_EARTH_LAND_MASK.bin');
Terrain.setNaturalEarthLandMask(new Uint8Array(maskBuffer.buffer, maskBuffer.byteOffset, maskBuffer.length));

function cell(lat, lon) {
  return {
    x: Math.floor((lon + 180) / 360 * Terrain.WORLD_W),
    y: Math.floor((90 - lat) / 180 * Terrain.WORLD_H)
  };
}
function isSea(x, y) {
  return Terrain.terrainAtCell(world, x, y).type === 'sea';
}
function routeExists(startLatLon, endLatLon, bounds) {
  const start = cell(...startLatLon);
  const goal = cell(...endLatLon);
  assert.equal(isSea(start.x, start.y), true, 'route start must be sea');
  assert.equal(isSea(goal.x, goal.y), true, 'route goal must be sea');
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  const dirs = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
  for (let i = 0; i < queue.length; i += 1) {
    const point = queue[i];
    if (point.x === goal.x && point.y === goal.y) return true;
    for (const [dx, dy] of dirs) {
      const x = point.x + dx;
      const y = point.y + dy;
      const lon = x / Terrain.WORLD_W * 360 - 180;
      const lat = 90 - y / Terrain.WORLD_H * 180;
      if (lon < bounds.west || lon > bounds.east || lat < bounds.south || lat > bounds.north) continue;
      const key = `${x},${y}`;
      if (seen.has(key) || !isSea(x, y)) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return false;
}

for (const [lat, lon] of [[40.00,26.15],[40.15,26.30],[40.30,26.50],[40.45,26.70],[40.56,26.83]]) {
  const p = cell(lat, lon);
  assert.equal(isSea(p.x, p.y), true, `Dardanelles blocked at ${lat},${lon}`);
}
for (const [lat, lon] of [[40.95,28.82],[41.10,29.03],[41.25,29.15]]) {
  const p = cell(lat, lon);
  assert.equal(isSea(p.x, p.y), true, `Bosporus blocked at ${lat},${lon}`);
}
assert.equal(routeExists([39.85,25.75],[40.75,27.50], { west:25, east:28.5, south:39.5, north:41.2 }), true, 'Aegean to Marmara route is disconnected');
assert.equal(routeExists([40.75,28.40],[41.45,29.35], { west:28, east:29.7, south:40.5, north:41.7 }), true, 'Marmara to Black Sea route is disconnected');
const ankara = cell(39.93, 32.86);
assert.notEqual(Terrain.terrainAtCell(world, ankara.x, ankara.y).type, 'sea', 'Ankara must remain land');
console.log(JSON.stringify({ ok:true, corridors:['dardanelles','bosporus'] }));
