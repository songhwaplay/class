'use strict';
const assert = require('node:assert/strict');
const zones = require('../data/catalog/arrival-zones.json');
const places = require('../data/catalog/places.json');
const ArrivalZones = require('../lib/arrival-zones.js');

const nonPorts = places.filter((p) => p.access !== 'port');
for (const place of nonPorts) assert.ok(zones[place.id], `${place.name}: 도착 영역 정의 누락`);

function representative(zone) {
  if (zone.type === 'circle') return zone.center;
  if (zone.type === 'multiCircle') return [zone.circles[0][0], zone.circles[0][1]];
  if (zone.type === 'polygon') {
    const n = zone.points.length;
    return [zone.points.reduce((a,p)=>a+p[0],0)/n, zone.points.reduce((a,p)=>a+p[1],0)/n];
  }
  if (zone.type === 'corridor') return zone.path[Math.floor(zone.path.length / 2)];
  throw new Error(`unknown zone type ${zone.type}`);
}

for (const place of nonPorts) {
  const zone = zones[place.id];
  const [lat, lon] = representative(zone);
  assert.equal(ArrivalZones.containsLatLon(zone, lat, lon), true, `${place.name}: 대표 지점이 영역 안이 아님`);
}

assert.equal(ArrivalZones.containsLatLon(zones.crimea_peninsula, 45.3, 34.1), true);
assert.equal(ArrivalZones.containsLatLon(zones.crimea_peninsula, 42.0, 34.1), false);
assert.equal(ArrivalZones.containsLatLon(zones.gibraltar_strait, 35.95, -5.6), true);
assert.equal(ArrivalZones.containsLatLon(zones.gibraltar_strait, 39.0, -5.6), false);
assert.equal(ArrivalZones.containsLatLon(zones.japanese_archipelago, 35.5, 139.0), true);
assert.equal(ArrivalZones.containsLatLon(zones.aleutian_islands, 51.8, 179.2), true);
assert.equal(ArrivalZones.containsLatLon(zones.niagara_falls, 43.08, -79.07), true);
console.log(`arrival zones ok: ${nonPorts.length} geographic destinations`);
