'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const T=require('../public/js/terrain.js');const b=fs.readFileSync(path.join(__dirname,'..','data','world','WORLD.CDS'));const world=new Uint16Array(b.buffer,b.byteOffset,b.length/2);
function xy(lon,lat){return [(lon+180)/360*T.WORLD_W,(90-lat)/180*T.WORLD_H];}
function type(lon,lat){return T.terrainAtCell(world,...xy(lon,lat));}
assert.equal(type(10,25).type,'desert');assert.equal(type(-60,-5).type,'forest');assert.equal(type(85,30).type,'highMountain');assert.equal(type(85,30).passable,true);assert.equal(type(-9.1,38.7).passable,true);
assert.deepEqual(T.SPEED,{sea:1,plain:.88,coast:.76,river:.58,forest:.54,desert:.43,mountain:.30,highMountain:.18});
console.log(JSON.stringify({ok:true,sahara:type(10,25),amazon:type(-60,-5),himalaya:type(85,30),lisbon:type(-9.1,38.7)}));
