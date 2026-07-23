'use strict';
const assert = require('node:assert/strict');
const catalog = require('../lib/mission-catalog.js');
const cities = catalog.ORIGINAL_CITIES;
assert.equal(cities.length, 225, '원작 도시 수는 225개여야 함');
assert.equal(new Set(cities.map((c) => c.id)).size, 225, '도시 ID 중복');
assert.equal(cities.filter((c) => c.canEnterFromSea === true).length, 134, '원작 지도 기준 바다 입항 가능 도시 수 불일치');
for (const city of cities) {
  assert.ok(Number.isFinite(city.cellX) && Number.isFinite(city.cellY), `${city.name} 원작 좌표 누락`);
  assert.ok(city.displayOnMap, `${city.name} 지도 표시 누락`);
  assert.ok(['port','land'].includes(city.access), `${city.name} 접근 유형 오류`);
  assert.equal(city.canEnterFromSea, city.originalSeaEntryCells.length > 0, `${city.name} 바다 진입 규칙 오류`);
}
const byName = new Map(cities.map((c) => [c.name, c]));
assert.deepEqual([byName.get('리스본').cellX, byName.get('리스본').cellY], [1185,355]);
assert.deepEqual([byName.get('런던').cellX, byName.get('런던').cellY], [1248,266]);
assert.equal(byName.get('카이로').access, 'land');
assert.equal(byName.get('한양').access, 'port');
console.log(JSON.stringify({ok:true,cities:cities.length,ports:cities.filter((c)=>c.canEnterFromSea).length,inland:cities.filter((c)=>!c.canEnterFromSea).length}));
