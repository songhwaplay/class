'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cities = JSON.parse(fs.readFileSync('data/catalog/original-cities.json', 'utf8'));
const byName = new Map(cities.map((c) => [c.name, c]));
const expected = {
  '부쿠레슈티':[44.43225,26.10626], '바르나':[43.21667,27.91667],
  '몬카스트로':[46.19484,30.34827], '이스탄불':[41.01384,28.94966],
  '카파':[45.03199,35.38153], '타나':[47.1069,39.41486],
  '시높':[42.02683,35.16253], '트레비존드':[41.005,39.72694],
  '앙골라':[39.91987,32.85427], '아스트라한':[46.34968,48.04076]
};
for (const [name,[lat,lon]] of Object.entries(expected)) {
  const c=byName.get(name); assert.ok(c, name);
  assert.equal(c.naturalEarthPositionOverride, true, `${name} override`);
  assert.ok(Math.abs(c.lat-lat)<1e-6 && Math.abs(c.lon-lon)<1e-6, `${name} coordinates`);
}
assert.equal(fs.statSync('data/world/NATURAL_EARTH_LAND_MASK.bin').size, 2500*1250);
assert.ok(fs.statSync('public/assets/maps/natural-earth-land-mask-v59.bin.gz').size > 1000);
const terrain = fs.readFileSync('public/js/terrain.js','utf8');
assert.match(terrain,/setNaturalEarthLandMask/);
assert.match(terrain,/function usesNaturalEarthMask\(\) \{[\s\S]*return true;/);
const server = fs.readFileSync('server.js','utf8');
assert.match(server,/useNaturalEarthPosition/);
assert.match(server,/resolvedSeaEntryPoints/);
assert.match(server,/resolvedLandEntryPoints/);
console.log('v59 black sea position unit ok');
