'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const cities=JSON.parse(fs.readFileSync(path.join(root,'data','catalog','original-cities.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'public','data','library-books.json'),'utf8'));
const student=fs.readFileSync(path.join(root,'public','index.html'),'utf8');
const groups={
  "이베리아": [
    "lisbon",
    "original_city_220",
    "original_city_217",
    "original_city_212",
    "original_city_214"
  ],
  "지중해": [
    "original_city_198",
    "genoa",
    "original_city_195",
    "original_city_194",
    "original_city_191",
    "original_city_190",
    "original_city_152"
  ],
  "북유럽": [
    "original_city_210",
    "amsterdam",
    "london",
    "original_city_170",
    "original_city_162",
    "original_city_158"
  ],
  "중근동·북아프리카": [
    "alexandria",
    "original_city_145",
    "original_city_142",
    "istanbul",
    "original_city_105",
    "original_city_104",
    "original_city_101",
    "original_city_097",
    "original_city_094"
  ],
  "인도": [
    "original_city_079"
  ],
  "중앙아시아": [
    "original_city_092"
  ],
  "중국·조선": [
    "original_city_051",
    "original_city_048",
    "original_city_047",
    "original_city_043",
    "original_city_041",
    "original_city_040",
    "original_city_037",
    "original_city_035"
  ],
  "일본": [
    "original_city_032"
  ],
  "아메리카": [
    "original_city_025",
    "original_city_024"
  ]
};
const expectedIds=new Set(Object.values(groups).flat());
const libraryCities=cities.filter(c=>c.hasLibrary);
assert.equal(libraryCities.length,40,'원작 도서관 도시는 40곳이어야 한다');
assert.equal(expectedIds.size,40);
for(const city of cities){
  assert.equal(city.hasLibrary,expectedIds.has(city.id),`${city.name} 도서관 여부 불일치`);
  if(city.hasLibrary){
    assert.equal(city.libraryRegion,Object.entries(groups).find(([,ids])=>ids.includes(city.id))[0]);
    assert.ok(city.facilities.includes('도서관'));
  }else{
    assert.equal(city.libraryRegion,'');
    assert.ok(!city.facilities.includes('도서관'));
  }
}
assert.equal(catalog.version,67);
assert.equal(catalog.books.length,77);
assert.equal(catalog.sectionCount,385);
assert.equal(catalog.collections.length,9);
assert.ok(catalog.books.every(b=>b.id&&b.title&&b.category&&b.intro&&Array.isArray(b.shelves)&&b.shelves.length===1&&Array.isArray(b.sections)&&b.sections.length===5));
const common=catalog.books.filter(b=>b.shelves.includes('공통'));
assert.equal(common.length,5);
for(const [group,ids] of Object.entries(groups)){
  const regional=catalog.books.filter(b=>b.shelves.includes(group));
  assert.equal(regional.length,8,`${group} 지역책 수`);
  const shelf=[...regional,...common].map(b=>b.id);
  assert.equal(shelf.length,13);
  for(const cityId of ids){
    const city=cities.find(c=>c.id===cityId);
    assert.equal(city.libraryRegion,group);
    const sameShelf=[...catalog.books.filter(b=>b.shelves.includes(city.libraryRegion)),...common].map(b=>b.id);
    assert.deepEqual(sameShelf,shelf,`${city.name} 장서 순서가 지역 공통 장서와 달라서는 안 된다`);
  }
}
assert.match(student,/id="libraryBtn" hidden/);
assert.match(student,/function currentLibraryCity/);
assert.match(student,/catalogCity\?\.hasLibrary&&catalogCity\?\.libraryRegion/);
assert.match(student,/libraryBtn\.hidden=!hasLibrary/);
assert.match(student,/book\.shelves\.includes\(shelf\)/);
assert.match(student,/이 도시는 원작 기준 도서관이 없습니다/);
assert.match(student,/fetch\('\/data\/library-books\.json\?v=67'/);
console.log(JSON.stringify({ok:true,libraryCities:libraryCities.length,nonLibraryCities:cities.length-libraryCities.length,collections:catalog.collections.length,books:catalog.books.length,sections:catalog.sectionCount,booksPerLibrary:13,sectionsPerLibrary:65}));
