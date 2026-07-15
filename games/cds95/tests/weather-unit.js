'use strict';
const assert=require('node:assert/strict');
const Weather=require('../public/js/weather.js');

const a=Weather.weatherAtPixel(1000,1000,12345,'sea');
const b=Weather.weatherAtPixel(1000,1000,12345,'sea');
assert.deepEqual(a,b,'같은 위치와 공용 시간의 날씨는 동일해야 한다.');
assert.ok(['clear','rain','snow'].includes(a.type));

let foundRain=false,foundSnow=false;
for(let slot=0;slot<500&&!foundRain;slot++){
  const w=Weather.weatherAtPixel(1250*16,625*16,slot*Weather.WEATHER_SLOT_MINUTES,'jungle');
  if(w.type==='rain')foundRain=true;
}
for(let slot=0;slot<500&&!foundSnow;slot++){
  const w=Weather.weatherAtPixel(1250*16,100*16,slot*Weather.WEATHER_SLOT_MINUTES,'highMountain');
  if(w.type==='snow')foundSnow=true;
}
assert.equal(foundRain,true,'강수 모델에서 비가 발생해야 한다.');
assert.equal(foundSnow,true,'한랭·고산 지역에서 눈이 발생해야 한다.');

console.log(JSON.stringify({ok:true,deterministic:true,rain:true,snow:true,movementEffect:false}));
