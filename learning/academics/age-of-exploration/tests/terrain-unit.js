'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const T=require('../public/js/terrain.js');const b=fs.readFileSync(path.join(__dirname,'..','data','world','WORLD.CDS'));const world=new Uint16Array(b.buffer,b.byteOffset,b.length/2);
function xy(lon,lat){return [(lon+180)/360*T.WORLD_W,(90-lat)/180*T.WORLD_H];}
function type(lon,lat){return T.terrainAtCell(world,...xy(lon,lat));}
function firstHighMountain(){for(let cy=0;cy<T.WORLD_H;cy++)for(let cx=0;cx<T.WORLD_W;cx++){const value=T.cellValue(world,cx,cy);const family=(value&0x3fff)>>7;if((value&0x4000)&&!(value&0x8000)&&T.HIGH_MOUNTAIN_FAMILIES.has(family))return {cx,cy,family,terrain:T.terrainAtCell(world,cx,cy)};}throw new Error('고산 타일을 찾지 못했습니다.');}
const visualHigh=firstHighMountain();
assert.equal(type(10,25).type,'desert');assert.equal(type(-60,-5).type,'forest');
assert.notEqual(type(85,30).type,'highMountain','좌표 범위만으로 고산이 되면 안 된다.');
assert.equal(visualHigh.terrain.type,'highMountain');assert.equal(visualHigh.terrain.passable,true);assert.equal(type(-9.1,38.7).passable,true);
assert.deepEqual(T.SPEED,{sea:1,plain:.88,coast:.76,river:.58,forest:.54,desert:.43,mountain:.30,highMountain:.18});
console.log(JSON.stringify({ok:true,sahara:type(10,25),amazon:type(-60,-5),formerCoordinateFalsePositive:type(85,30),visualHigh}));
