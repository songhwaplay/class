'use strict';

const assert = require('node:assert/strict');
const History = require('../public/js/library-history.js');
const catalog = require('../public/data/library-books.json');
const cityCatalog = require('../data/catalog/original-cities.json');

function city(id, name, region, libraryRegion) {
  return { id, name, region, originalRegion: region, libraryRegion };
}

function shelfBooks(shelf) {
  return catalog.books.filter((book) => book.shelves.includes(shelf) || book.shelves.includes('공통'));
}

const lisbon = History.contextualBooks(city('lisbon', '리스본', '이베리아', '이베리아'), shelfBooks('이베리아'));
assert.equal(lisbon[0].contextKind, 'regionHistory');
assert.equal(lisbon[0].title, '이베리아 지역사 한눈에 보기');
assert.equal(lisbon[1].contextKind, 'cityHistory');
assert.match(lisbon[1].title, /리스본/);
assert.ok(lisbon[1].sections.length >= 3);
assert.equal(lisbon.length, 14);

const paris = History.contextualBooks(city('original_city_210', '파리', '프랑스', '지중해'), shelfBooks('지중해'));
assert.equal(paris[0].title, '프랑스 지역사 한눈에 보기');
assert.match(paris[0].intro, /왕권/);

const istanbul = History.cityHistoryBook(city('istanbul', '이스탄불', '흑해', '중근동·북아프리카'));
assert.match(istanbul.intro, /보스포루스/);

const hanyang = History.cityHistoryBook(city('original_city_035', '한양', '동북아시아', '중국·조선'));
assert.match(hanyang.sections.map((section) => section.text).join(' '), /한강/);

const ordinary = History.contextualBooks(city('original_city_223', '오포르토', '이베리아', '이베리아'), shelfBooks('이베리아'));
assert.equal(ordinary[0].contextKind, 'regionHistory');
assert.equal(ordinary.some((book) => book.contextKind === 'cityHistory'), false);
assert.equal(ordinary.length, 13);

assert.ok(Object.keys(History.REGION_HISTORIES).length >= 23);
assert.ok(Object.keys(History.CITY_PROFILES).length >= 30);
const cityIds = new Set(cityCatalog.map((entry) => entry.id));
assert.deepEqual([...new Set(cityCatalog.map((entry) => entry.originalRegion || entry.region))].filter((region) => !History.REGION_HISTORIES[region]), []);
assert.deepEqual(Object.keys(History.CITY_PROFILES).filter((id) => !cityIds.has(id)), []);
assert.equal(cityCatalog.every((entry) => History.regionalHistoryBook(entry, null)?.sections.length >= 3), true);
console.log(JSON.stringify({ ok: true, regionCount: Object.keys(History.REGION_HISTORIES).length, specialCityCount: Object.keys(History.CITY_PROFILES).length, coveredCities: cityCatalog.length, lisbonBooks: lisbon.length }));
