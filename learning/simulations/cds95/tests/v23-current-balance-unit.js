'use strict';
const assert=require('node:assert/strict');
const Current=require('../public/js/ocean-current.js');

const generalTail=Current.movementFactor(1,.40,.23,.14);
const strongTail=Current.movementFactor(1,.80,.23,.14);
const cross=Current.movementFactor(0,.40,.23,.14);
const head=Current.movementFactor(-1,.40,.23,.14);
assert.equal(generalTail,.40);
assert.equal(strongTail,.80);
assert.equal(cross,.14);
assert.equal(head,.23);
assert.ok(strongTail>generalTail&&generalTail>head&&head>cross);
assert.ok(Current.MAJOR_CURRENTS.length>=12&&Current.MAJOR_CURRENTS.length<=20);
for(const flow of Current.MAJOR_CURRENTS){
  assert.ok(flow.path.length>=2,`${flow.name} 경로 누락`);
  assert.ok(flow.strength>0&&flow.strength<=1,`${flow.name} 세기 범위 오류`);
}
function sample(id,progress=.35){
  const point=Current.pointAlongCurrent(id,progress,0);
  return Current.currentAtPixel(point.x,point.y);
}
const gulf=sample('gulf-north-atlantic');
const kuroshio=sample('kuroshio');
const canary=sample('canary');
assert.ok(gulf.tailFactor>.75,'멕시코만류 핵심부 +80% 누락');
assert.ok(kuroshio.tailFactor>.75,'쿠로시오 핵심부 +80% 누락');
assert.equal(canary.tailFactor,.40,'일반 주요 해류는 +40% 상한이어야 함');
assert.equal(Current.movementFactor(-1,gulf.tailFactor,.23,.14),.23,'강한 해류도 역류 감속은 -23% 상한');
console.log(JSON.stringify({ok:true,generalTail,strongTail,cross,head,gulfCore:gulf.tailFactor,kuroshioCore:kuroshio.tailFactor,majorCurrents:Current.MAJOR_CURRENTS.length}));
