'use strict';
const fs=require('node:fs');
const html=fs.readFileSync('public/index.html','utf8');
for(const token of ['currentTracers','drawCurrentTracer','screenPointIsSea','drawOceanCurrents','CURRENT_FLOW_FRAME_COUNT=8','frame*CURRENT_FLOW_FRAME_W']){
  if(!html.includes(token))throw new Error(`해류 시각화 요소 누락: ${token}`);
}
if(html.includes('currentClouds')||html.includes('drawOriginalCurrentCloud'))throw new Error('바람과 혼동되는 해류 구름 구현이 남아 있음');
console.log(JSON.stringify({ok:true,seaFlowTracers:true,animatedWaterFrames:8,seaMask:true,cloudsReservedForWind:true},null,2));
