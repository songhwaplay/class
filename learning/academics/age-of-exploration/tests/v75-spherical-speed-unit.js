'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const GeoMotion = require('../public/js/geo-motion.js');
const Terrain = require('../public/js/terrain.js');

const { WORLD_PIXEL_W: width, WORLD_PIXEL_H: height } = Terrain;
const yAt = (latitude) => (90 - latitude) / 180 * height;

assert.ok(Math.abs(GeoMotion.longitudeScaleAtY(yAt(0), height) - 1) < 1e-12);
assert.ok(Math.abs(GeoMotion.longitudeScaleAtY(yAt(60), height) - 0.5) < 1e-12);

const equatorDelta = GeoMotion.localDeltaToMap(10, 0, yAt(0), height);
const polarDelta = GeoMotion.localDeltaToMap(10, 0, yAt(80), height);
assert.ok(polarDelta.x > equatorDelta.x * 5.7 && polarDelta.x < equatorDelta.x * 5.8);

const x0 = width / 2;
const equatorKm = GeoMotion.greatCircleDistanceKm(x0, yAt(0), x0 + equatorDelta.x, yAt(0), width, height);
const polarKm = GeoMotion.greatCircleDistanceKm(x0, yAt(80), x0 + polarDelta.x, yAt(80), width, height);
assert.ok(Math.abs(equatorKm - polarKm) < 0.01, 'east-west speed must stay physically constant by latitude');

const baseSeaKmh = 132 * 2 * GeoMotion.kilometersPerPixel(width) / 30;
const baseLandKmh = 96 * 2 * GeoMotion.kilometersPerPixel(width) / 30;
assert.ok(baseSeaKmh > 8.7 && baseSeaKmh < 8.9);
assert.ok(baseLandKmh > 6.3 && baseLandKmh < 6.5);

const server = fs.readFileSync('server.js', 'utf8');
const student = fs.readFileSync('public/index.html', 'utf8');
assert.match(server, /GeoMotion\.initialDirection/);
assert.match(server, /GeoMotion\.localDeltaToMap/);
assert.match(server, /speedKmh:/);
assert.match(student, /id="speedValue"/);
assert.match(student, /게임 시간과 구면거리를 기준으로 계산한 실제 이동속력/);
assert.match(student, /GAME_HOURS_PER_REAL_SECOND=30/);

console.log(JSON.stringify({
  ok: true,
  baseSeaKmh: Number(baseSeaKmh.toFixed(1)),
  baseSeaKnots: Number((baseSeaKmh / 1.852).toFixed(1)),
  baseLandKmh: Number(baseLandKmh.toFixed(1)),
  eastWestMultiplierAt80: Number((polarDelta.x / equatorDelta.x).toFixed(2))
}));
