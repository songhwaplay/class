'use strict';
const assert=require('node:assert/strict');
const bgm=require('../public/js/bgm.js');

// 원작 Windows판 Track02~Track29 파일명을 그대로 사용한다.
assert.equal(bgm.TRACKS.city_africa.file,'Track02.mp3');
assert.equal(bgm.TRACKS.city_america.file,'Track04.mp3');
assert.equal(bgm.TRACKS.city_mediterranean.file,'Track05.mp3');
assert.equal(bgm.TRACKS.city_china.file,'Track06.mp3');
assert.equal(bgm.TRACKS.city_middle_east.file,'Track07.mp3');
assert.equal(bgm.TRACKS.city_scandinavia.file,'Track09.mp3');
assert.equal(bgm.TRACKS.city_iberia.file,'Track10.mp3');
assert.equal(bgm.TRACKS.city_india.file,'Track12.mp3');
assert.equal(bgm.TRACKS.sailing_indian_ocean.file,'Track13.mp3');
assert.equal(bgm.TRACKS.sailing_near_europe.file,'Track15.mp3');
assert.equal(bgm.TRACKS.city_japan.file,'Track18.mp3');
assert.equal(bgm.TRACKS.sailing_polar.file,'Track19.mp3');
assert.equal(bgm.TRACKS.voyage_preparation.file,'Track23.mp3');
assert.equal(bgm.TRACKS.sailing_pacific.file,'Track24.mp3');
assert.equal(bgm.TRACKS.sailing_atlantic.file,'Track25.mp3');
assert.equal(bgm.TRACKS.land_expedition.file,'Track26.mp3');
assert.equal(bgm.TRACKS.city_southeast_asia.file,'Track27.mp3');

// 도시 분류
assert.equal(bgm.cityTrack({region:'동북아시아',countryCode:'JP'}),'city_japan');
assert.equal(bgm.cityTrack({region:'동북아시아',countryCode:'CN'}),'city_china');
assert.equal(bgm.cityTrack({region:'동북아시아',countryCode:'KR'}),'city_china');
assert.equal(bgm.cityTrack({region:'동남아시아',countryCode:'VN'}),'city_southeast_asia');
assert.equal(bgm.cityTrack({region:'중앙아시아',countryCode:'UZ'}),'city_southeast_asia');
assert.equal(bgm.cityTrack({region:'인도',countryCode:'IN'}),'city_india');
assert.equal(bgm.cityTrack({region:'서아프리카',countryCode:'GH'}),'city_africa');
assert.equal(bgm.cityTrack({region:'북아프리카',countryCode:'EG'}),'city_middle_east');
assert.equal(bgm.cityTrack({region:'북유럽',countryCode:'NO'}),'city_scandinavia');
assert.equal(bgm.cityTrack({region:'이베리아',countryCode:'PT'}),'city_iberia');
assert.equal(bgm.cityTrack({region:'이탈리아',countryCode:'IT'}),'city_mediterranean');
assert.equal(bgm.cityTrack({region:'발칸',countryCode:'GR'}),'city_mediterranean');
assert.equal(bgm.cityTrack({region:'흑해',countryCode:'TR'}),'city_middle_east');
assert.equal(bgm.cityTrack({region:'중앙아메리카',countryCode:'MX'}),'city_america');

// 항해 분류: V72부터 원작의 실제 사용 감각을 반영한다.
assert.equal(bgm.seaTrack({lat:70,lon:20}),'sailing_polar');
assert.equal(bgm.seaTrack({lat:-65,lon:20}),'sailing_polar');
assert.equal(bgm.seaTrack({lat:36,lon:15}),'sailing_near_europe');
assert.equal(bgm.seaTrack({lat:55,lon:3}),'sailing_near_europe');
assert.equal(bgm.seaTrack({lat:-15,lon:75}),'sailing_indian_ocean');
assert.equal(bgm.seaTrack({lat:20,lon:150}),'sailing_indian_ocean');
assert.equal(bgm.seaTrack({lat:25,lon:-45}),'sailing_indian_ocean');

assert.equal(bgm.resolveTrack({joined:false}),'voyage_preparation');
assert.equal(bgm.resolveTrack({joined:true,waitingForStart:true,mode:'sea',position:{lat:20,lon:-45}}),'voyage_preparation');
assert.equal(bgm.resolveTrack({joined:true,mode:'land'}),'land_expedition');
console.log('v66 original Track filename BGM routing ok');
