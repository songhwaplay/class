'use strict';
const assert=require('node:assert/strict');
const bgm=require('../public/js/bgm.js');
const cities=require('../data/catalog/original-cities.json');
const byId=new Map(cities.map(c=>[c.id,c]));

// 원작 체감형 항해곡 적용 범위
assert.equal(bgm.seaTrack({lat:36,lon:15}),'sailing_near_europe','지중해');
assert.equal(bgm.seaTrack({lat:55,lon:3}),'sailing_near_europe','북해');
assert.equal(bgm.seaTrack({lat:25,lon:-45}),'sailing_indian_ocean','북대서양 신대륙 항로');
assert.equal(bgm.seaTrack({lat:20,lon:-75}),'sailing_indian_ocean','카리브 북부');
assert.equal(bgm.seaTrack({lat:8,lon:-75}),'sailing_pacific','카리브 남부');
assert.equal(bgm.seaTrack({lat:-20,lon:-20}),'sailing_atlantic','남대서양');
assert.equal(bgm.seaTrack({lat:20,lon:140}),'sailing_indian_ocean','서태평양');
assert.equal(bgm.seaTrack({lat:-30,lon:150}),'sailing_pacific','호주 남방 해역');
assert.equal(bgm.seaTrack({lat:70,lon:20}),'sailing_polar','북극');
assert.equal(bgm.TRACKS.sailing_indian_ocean.label,'신대륙·동방 원양 항해');
assert.equal(bgm.TRACKS.sailing_pacific.label,'남방·카리브 항해');
assert.equal(bgm.TRACKS.sailing_atlantic.label,'남대서양 항해');

// 확정된 도시 오류
const verde=byId.get('original_city_134');
assert.equal(verde.name,'베르데 곶');
assert.equal(verde.countryCode,'SN');
assert.equal(verde.modernLocationName,'Cap-Vert / Dakar');
assert.ok(Math.abs(verde.lat-14.7167)<1e-6&&Math.abs(verde.lon+17.4677)<1e-6);
assert.equal(byId.get('original_city_124').name,'루안다');
assert.equal(byId.get('original_city_107').name,'앙고라');
assert.equal(byId.get('original_city_191').canEnterFromSea,false,'로마는 원작상 내륙 도시');
assert.equal(byId.get('original_city_101').canEnterFromSea,false,'메카는 원작상 내륙 도시');
assert.equal(cities.filter(c=>c.canEnterFromSea).length,134);
console.log(JSON.stringify({ok:true,bgm:'original-feel-regions',correctedCities:['베르데 곶','루안다','앙고라','로마','메카']}));
