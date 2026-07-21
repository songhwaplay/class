'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cities = JSON.parse(fs.readFileSync('data/catalog/original-cities.json','utf8'));
assert.equal(cities.length,225);
assert.equal(cities.filter(c=>c.naturalEarthPositionOverride===true).length,225,'모든 도시가 Natural Earth 좌표를 사용해야 함');
for(const c of cities){
  assert.ok(Number.isFinite(c.lat)&&c.lat>=-90&&c.lat<=90,`${c.name} 위도`);
  assert.ok(Number.isFinite(c.lon)&&c.lon>=-180&&c.lon<=180,`${c.name} 경도`);
  assert.ok(c.modernLocationName,`${c.name} 현대 지명 누락`);
  assert.ok(['GeoNames','manual-historical'].includes(c.coordinateSource),`${c.name} 출처 누락`);
  const centerX=((c.lon+180)/360)*2500;
  const centerY=((90-c.lat)/180)*1250;
  assert.ok(Math.abs((c.cellX+c.markerWidth/2)-centerX)<0.76,`${c.name} X셀 불일치`);
  assert.ok(Math.abs((c.cellY+c.markerHeight/2)-centerY)<0.76,`${c.name} Y셀 불일치`);
}
const byName=new Map(cities.map(c=>[c.name,c]));
const expected={
  '리스본':[38.72509,-9.1498], '런던':[51.50853,-0.12574],
  '악숨':[14.12109,38.72337], '말라카':[2.196,102.2405],
  '광주':[23.11667,113.25], '산티아고':[20.02287,-75.82171],
  '찬찬':[-8.111,-79.075], '아르킨':[20.601,-16.472]
};
for(const [name,[lat,lon]] of Object.entries(expected)){
  const c=byName.get(name); assert.ok(c,name);
  assert.ok(Math.abs(c.lat-lat)<1e-5&&Math.abs(c.lon-lon)<1e-5,`${name} 실제 좌표`);
}
assert.notEqual(byName.get('테노치티틀란').displayOffsetCellsX,undefined);
assert.notEqual(byName.get('멕시코').displayOffsetCellsX,undefined);
const terrain=fs.readFileSync('public/js/terrain.js','utf8');
assert.match(terrain,/function usesNaturalEarthMask\(\) \{[\s\S]*return true;/);
assert.doesNotMatch(terrain,/p\.lon >= 20 && p\.lon <= 55/);
const server=fs.readFileSync('server.js','utf8');
assert.match(server,/displayOffsetCellsX/);
assert.match(server,/displayedLandPoint/);
const audit=JSON.parse(fs.readFileSync('data/catalog/city-coordinate-audit-v60.json','utf8'));
assert.equal(audit.length,225);
console.log(JSON.stringify({ok:true,cities:225,allNaturalEarth:true,globalCoastMask:true,shiftedMoreThan2Degrees:audit.filter(x=>x.shiftDegrees>2).length}));
