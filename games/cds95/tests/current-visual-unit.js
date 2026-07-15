
'use strict';
const fs=require('node:fs');
const html=fs.readFileSync('public/index.html','utf8');
for(const token of ['currentClouds','currentTracers','drawCurrentTracer','drawOriginalCurrentCloud','screenPointIsSea']){
  if(!html.includes(token))throw new Error(`해류 시각화 요소 누락: ${token}`);
}
if(html.includes('const currentParticles=[]'))throw new Error('이전 구름 입자 구현이 남아 있음');
console.log(JSON.stringify({ok:true,cloudSprites:true,seaFlowTracers:true,seaMask:true},null,2));
