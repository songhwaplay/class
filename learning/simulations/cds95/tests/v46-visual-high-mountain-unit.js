'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Terrain=require('../public/js/terrain.js');
const bytes=fs.readFileSync(path.join(__dirname,'..','data','world','WORLD.CDS'));
const world=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.length/2);

function atLonLat(lon,lat){const cx=Math.floor((lon+180)/360*Terrain.WORLD_W),cy=Math.floor((90-lat)/180*Terrain.WORLD_H);const value=Terrain.cellValue(world,cx,cy);return {cx,cy,value,family:(value&0x3fff)>>7,terrain:Terrain.terrainAtCell(world,cx,cy)};}

const oldFalsePositive=atLonLat(85,30);
assert.equal(oldFalsePositive.family,8);
assert.notEqual(oldFalsePositive.terrain.type,'highMountain');

let visualCell=null;
for(let cy=0;cy<Terrain.WORLD_H&&!visualCell;cy++)for(let cx=0;cx<Terrain.WORLD_W;cx++){
  const value=Terrain.cellValue(world,cx,cy),family=(value&0x3fff)>>7;
  if((value&0x4000)&&!(value&0x8000)&&Terrain.HIGH_MOUNTAIN_FAMILIES.has(family)){visualCell={cx,cy,value,family,terrain:Terrain.terrainAtCell(world,cx,cy)};break;}
}
assert.ok(visualCell,'실제 산맥 그림 타일이 있어야 한다.');
assert.equal(visualCell.terrain.type,'highMountain');
assert.equal(visualCell.terrain.multiplier,0.18);
assert.equal(visualCell.terrain.passable,true);

const source=fs.readFileSync(path.join(__dirname,'..','public','js','terrain.js'),'utf8');
assert.ok(source.includes('HIGH_MOUNTAIN_FAMILIES'));
assert.ok(!source.includes('isMajorHighMountainBelt'));
assert.ok(!source.includes("inBox(lon, lat, 69, 106, 24, 39)"));
console.log(JSON.stringify({ok:true,oldFalsePositive:{family:oldFalsePositive.family,type:oldFalsePositive.terrain.type},visualCell:{family:visualCell.family,type:visualCell.terrain.type,speed:visualCell.terrain.multiplier}}));
