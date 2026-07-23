'use strict';
const assert=require('node:assert/strict');
const Wind=require('../public/js/wind.js');

function at(lon,lat,month){
  const p=Wind.pixelFromLonLat(lon,lat);
  const daysBefore=[0,31,59,90,120,151,181,212,243,273,304,334][month-1];
  return Wind.windAtPixel(p.x,p.y,daysBefore*1440);
}

const northTrade=at(-30,15,3);
assert.equal(northTrade.name,'북동 무역풍');
assert.ok(northTrade.x<0&&northTrade.y>0,'북동 무역풍은 남서쪽으로 불어야 한다.');
const southTrade=at(-30,-15,3);
assert.equal(southTrade.name,'남동 무역풍');
assert.ok(southTrade.x<0&&southTrade.y<0,'남동 무역풍은 북서쪽으로 불어야 한다.');
const northWesterly=at(-30,45,3);
assert.equal(northWesterly.name,'북반구 편서풍');
assert.ok(northWesterly.x>0&&northWesterly.y<0,'북반구 편서풍은 북동쪽으로 불어야 한다.');
const summerMonsoon=at(75,15,7);
assert.equal(summerMonsoon.name,'여름 남서 계절풍');
assert.ok(summerMonsoon.x>0&&summerMonsoon.y<0);
const winterMonsoon=at(75,15,1);
assert.equal(winterMonsoon.name,'겨울 북동 계절풍');
assert.ok(winterMonsoon.x<0&&winterMonsoon.y>0);

assert.equal(Wind.speedMultiplier(1,1,1,.65),2);
assert.equal(Wind.speedMultiplier(-1,1,1,.65),.35);
assert.equal(Wind.speedMultiplier(0,1,1,.65),1);
assert.equal(Wind.assistPercent(1,1,1,.65),100);
assert.equal(Wind.assistPercent(-1,1,1,.65),-65);

console.log(JSON.stringify({ok:true,northTrade:northTrade.name,southTrade:southTrade.name,westerly:northWesterly.name,summerMonsoon:summerMonsoon.name,winterMonsoon:winterMonsoon.name,tailwind:100,headwind:-65},null,2));
