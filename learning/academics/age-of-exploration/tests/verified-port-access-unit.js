'use strict';

const assert = require('node:assert/strict');
const catalog = require('../lib/mission-catalog.js');

const blockedDirectSeaAccess = new Set([
  '에든버러',
  '아테네',
  '튀니스',
  '이페',
  '안티오키아',
  '유에',
  '메리다',
  '레온',
  '코로',
  '찬찬',
  '리마',
  '나스카'
]);

const explicitlyReviewed = catalog.ORIGINAL_CITIES.filter((city) => city.verifiedSeaAccess === false);
assert.deepEqual(
  new Set(explicitlyReviewed.map((city) => city.name)),
  blockedDirectSeaAccess,
  '검토된 비항구 도시 목록이 달라짐'
);

const effectiveCities = catalog.ORIGINAL_CITIES.map(catalog.normalizePlaceAccess);
assert.equal(effectiveCities.filter((city) => city.canEnterFromSea).length, 122);
assert.equal(effectiveCities.filter((city) => !city.canEnterFromSea).length, 103);

for (const name of blockedDirectSeaAccess) {
  const original = catalog.ORIGINAL_CITIES.find((city) => city.name === name);
  const effective = effectiveCities.find((city) => city.name === name);
  assert.equal(original?.canEnterFromSea, true, `${name}: 원작 지도 입항 정보가 보존되어야 함`);
  assert.equal(effective?.canEnterFromSea, false, `${name}: 실제 지리 기준 직접 입항이 차단되어야 함`);
  assert.equal(effective?.access, 'land', `${name}: 육상 도시로 표시되어야 함`);
  assert.equal(effective?.category, '도시', `${name}: 항구 도시 분류가 제거되어야 함`);
  assert.ok(!effective?.facilities?.includes('항구'), `${name}: 항구 시설이 제거되어야 함`);
}

const publicCities = catalog.publicCatalog().places.filter((place) => place.isOriginalCity);
for (const name of blockedDirectSeaAccess) {
  const city = publicCities.find((place) => place.name === name);
  assert.equal(city?.canEnterFromSea, false, `${name}: 공개 카탈로그에서 입항이 차단되어야 함`);
  assert.equal(city?.access, 'land', `${name}: 공개 카탈로그에서 육상 도시여야 함`);
}

for (const name of ['런던', '세빌리아', '함부르크', '한양']) {
  const city = effectiveCities.find((place) => place.name === name);
  assert.equal(city?.canEnterFromSea, true, `${name}: 실제 하항의 입항 기능은 유지되어야 함`);
}

console.log(JSON.stringify({
  ok: true,
  originalSeaAccessible: 134,
  verifiedSeaAccessible: 122,
  blockedDirectSeaAccess: [...blockedDirectSeaAccess]
}));
