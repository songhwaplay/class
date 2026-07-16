'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Terrain = require('../public/js/terrain.js');

const bytes = fs.readFileSync(path.join(__dirname, '..', 'data', 'world', 'WORLD.CDS'));
const world = new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.length / 2);

function atLonLat(lon, lat) {
  const cx = Math.floor((lon + 180) / 360 * Terrain.WORLD_W);
  const cy = Math.floor((90 - lat) / 180 * Terrain.WORLD_H);
  return Terrain.terrainAtCell(world, cx, cy);
}

const himalaya = atLonLat(85, 30);
const sahara = atLonLat(10, 25);
const amazon = atLonLat(-60, -5);
const lisbon = atLonLat(-9.1, 38.7);

assert.equal(himalaya.type, 'highMountain');
assert.equal(himalaya.passable, true);
assert.equal(himalaya.multiplier, 0.18);
for (const terrain of [sahara, amazon, lisbon]) {
  assert.notEqual(terrain.type, 'sea');
  assert.equal(terrain.passable, true);
  assert.ok(terrain.multiplier > 0);
}
assert.ok(Object.entries(Terrain.SPEED).every(([, speed]) => speed > 0));

const terrainSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'terrain.js'), 'utf8');
const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const client = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
assert.ok(!terrainSource.includes('passable: false'));
assert.ok(!server.includes('높은 산맥은 통과할 수 없습니다'));
assert.ok(!client.includes('높은 산맥은 통과할 수 없습니다'));
assert.ok(server.includes("nextTerrain.type !== 'sea'"));
assert.ok(client.includes("next.type!=='sea'"));

console.log(JSON.stringify({
  ok: true,
  allLandTerrainPassable: true,
  highMountainSpeedPercent: 18,
  onlyTransportBoundaryBlocks: true
}));
