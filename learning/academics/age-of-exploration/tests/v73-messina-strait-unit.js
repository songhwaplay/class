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

for (const [lat, lon] of [[37.92,15.62],[38.08,15.59],[38.22,15.63],[38.36,15.66]]) {
  const point = cell(lat, lon);
  assert.equal(isSea(point.x, point.y), true, `Strait of Messina blocked at ${lat},${lon}`);
}
assert.equal(
  routeExists([37.70,15.80], [38.65,15.45], { west:14.5, east:16.4, south:37.2, north:39.0 }),
  true,
  'Ionian Sea to Tyrrhenian Sea route through Messina is disconnected'
);
const palermo = cell(38.12, 13.36);
assert.notEqual(Terrain.terrainAtCell(world, palermo.x, palermo.y).type, 'sea', 'Palermo must remain land');
console.log(JSON.stringify({ ok:true, corridor:'messina', landPreserved:'palermo' }));
