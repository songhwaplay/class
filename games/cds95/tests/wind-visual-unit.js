'use strict';
const fs=require('node:fs');
const html=fs.readFileSync('public/index.html','utf8');
for(const token of ['/js/wind.js','windCloudAtlas','/assets/weather/cloud_original_12frames.png','drawWindClouds','WIND_CLOUD_FRAME_W','WIND_CLOUD_SEQUENCE_FRAMES=6','sequenceBase=small?6:0','windHud','WIND_VISUAL_FLOW_RATE=5.6','WIND_CLOUD_FRAME_MS=64']){
  if(!html.includes(token))throw new Error(`바람·구름 시각화 요소 누락: ${token}`);
}
if(html.includes('currentClouds')||html.includes('drawOriginalCurrentCloud'))throw new Error('해류를 구름처럼 표시하는 이전 구현이 남아 있음');
const server=fs.readFileSync('server.js','utf8');
for(const token of ["require('./public/js/wind.js')",'windMultiplier','windAssistPercent','WIND_TAIL_FACTOR = 1.00','WIND_HEAD_FACTOR = 0.65'])if(!server.includes(token))throw new Error(`서버 바람 영향 누락: ${token}`);
console.log(JSON.stringify({ok:true,originalCloudSprite:true,largeCloudFrames:6,smallCloudFrames:6,serverMovementEffect:true,currentAndWindVisuallySeparated:true},null,2));
