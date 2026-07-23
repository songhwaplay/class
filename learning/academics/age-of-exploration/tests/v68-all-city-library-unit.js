'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const cities = JSON.parse(fs.readFileSync(path.join(root, 'data', 'catalog', 'original-cities.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'library-books.json'), 'utf8'));
const student = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const finalQuiz = require(path.join(root, 'lib', 'final-quiz.js'));

assert.equal(cities.length, 225, '원작 도시는 225곳이어야 한다');
assert.equal(cities.filter((city) => city.hasLibrary).length, 40, '원작 자료의 역사적 도서관 표시는 40곳으로 보존한다');
assert.equal(catalog.version, 68);
assert.equal(catalog.libraryCityCount, 225);
assert.equal(catalog.books.length, 77);
assert.equal(catalog.sectionCount, 385);
assert.equal(catalog.collections.length, 9);

const common = catalog.books.filter((book) => book.shelves.includes('공통'));
assert.equal(common.length, 5);
const collectionByLabel = new Map(catalog.collections.map((collection) => [collection.label, collection]));
const assigned = new Set();

for (const city of cities) {
  const shelf = finalQuiz.libraryShelfForCity(city);
  assert.notEqual(shelf, '공통', `${city.name}에 지역 장서가 배정되지 않았다`);
  const collection = collectionByLabel.get(shelf);
  assert.ok(collection, `${city.name}의 ${shelf} 장서 묶음을 찾지 못했다`);
  assert.ok(collection.cityIds.includes(city.id), `${city.name}이 ${shelf} 도서관 목록에 없다`);
  assert.ok(!assigned.has(city.id), `${city.name}이 여러 도서관 묶음에 중복 배정됐다`);
  assigned.add(city.id);
  const regional = catalog.books.filter((book) => book.shelves.includes(shelf));
  assert.equal(regional.length, 8, `${shelf} 지역 장서는 8권이어야 한다`);
  assert.equal(new Set([...regional, ...common].map((book) => book.id)).size, 13, `${city.name} 도서관은 13권이어야 한다`);
}
assert.equal(assigned.size, 225);
assert.equal(catalog.collections.reduce((sum, collection) => sum + collection.cityIds.length, 0), 225);

assert.match(student, /const LIBRARY_SHELF_BY_REGION=Object\.freeze/);
assert.match(student, /return \{\.\.\.catalogCity,libraryRegion:libraryShelfForCity\(catalogCity\),hasLibrary:true\}/);
assert.match(student, /libraryBtn\.hidden=false/);
assert.match(student, /book\.shelves\.includes\(shelf\)/);
assert.doesNotMatch(student, /이 도시는 원작 기준 도서관이 없습니다/);
assert.match(student, /fetch\('\/data\/library-books\.json\?v=68'/);
assert.match(server, /hasLibrary: true/);
assert.match(server, /libraryRegion: FinalQuiz\.libraryShelfForCity\(place\)/);
assert.match(server, /facilities: \[\.\.\.new Set/);

console.log(JSON.stringify({
  ok: true,
  libraryCities: assigned.size,
  collections: catalog.collections.map((collection) => ({ label: collection.label, cities: collection.cityIds.length })),
  booksPerLibrary: 13
}));
