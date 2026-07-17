'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cities = require('../data/catalog/original-cities.json');
const worldBuffer = fs.readFileSync(path.join(__dirname, '..', 'data', 'world', 'WORLD.CDS'));
const world = new Uint16Array(worldBuffer.buffer, worldBuffer.byteOffset, worldBuffer.length / 2);
const W = 2500;
function isLand(x, y) { return ((world[y * W + x] >> 14) & 1) === 1; }
assert.equal(cities.length, 225);
assert.equal(cities.filter((c) => c.canEnterFromSea).length, 134);
assert.equal(cities.filter((c) => !c.canEnterFromSea).length, 91);
for (const city of cities) {
  assert.ok(city.originalMarkerCells.length > 0, `${city.name}: marker missing`);
  assert.ok(city.originalLandEntryCells.length > 0, `${city.name}: land entry missing`);
  assert.equal(city.canEnterFromSea, city.originalSeaEntryCells.length > 0, `${city.name}: sea flag mismatch`);
  assert.equal(city.access, city.canEnterFromSea ? 'port' : 'land', `${city.name}: access mismatch`);
  for (const [x, y] of city.originalSeaEntryCells) assert.equal(isLand(x, y), false, `${city.name}: sea entry is land`);
  for (const [x, y] of city.originalLandEntryCells) assert.equal(isLand(x, y), true, `${city.name}: land entry is sea`);
}
const byName = new Map(cities.map((c) => [c.name, c]));
assert.equal(byName.get('한양').canEnterFromSea, true);
assert.equal(byName.get('북경').canEnterFromSea, false);
assert.equal(byName.get('카이로').canEnterFromSea, false);
assert.equal(byName.get('리스본').canEnterFromSea, true);
assert.equal(byName.get('런던').canEnterFromSea, true);
assert.equal(byName.get('포토시').canEnterFromSea, false);
console.log(JSON.stringify({ok:true,cities:225,seaAccessible:134,landOnly:91,hanyang:'sea+land',beijing:'land-only'}));
