'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
const ROOM = `V27PORT${Date.now().toString(36).slice(-4)}`;
const starts = [
  ['lisbon','항구학생1','리스본'],
  ['london','항구학생2','런던'],
  ['original_city_195','항구학생3','베니스'],
  ['original_city_035','항구학생4','한양']
];
function c(){ return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:7000}); }
function once(s,e,p=()=>true,t=15000){return new Promise((r,j)=>{const x=setTimeout(()=>{s.off(e,on);j(new Error(`timeout:${e}`));},t);function on(d){if(!p(d))return;clearTimeout(x);s.off(e,on);r(d);}s.on(e,on);});}
function ack(s,e,p={}){return new Promise((r,j)=>{const x=setTimeout(()=>j(new Error(`ack:${e}`)),10000);s.emit(e,p,d=>{clearTimeout(x);r(d);});});}
(async()=>{
  const teacher=c(), students=starts.map(()=>c());
  await Promise.all([once(teacher,'connect'),...students.map(s=>once(s,'connect'))]);
  const tj=await ack(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'}); assert.equal(tj.ok,true,tj.error);
  const real=Date.now(),base=tj.classGameMinutes,rate=tj.clockRateHoursPerSecond;
  const hb=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:base+(Date.now()-real)/1000*rate*60}),250);
  const pub=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'crimea_peninsula',startPlaceIds:starts.map(x=>x[0])}); assert.equal(pub.ok,true,pub.error);
  for(let i=0;i<students.length;i++){
    const j=await ack(students[i],'joinClass',{roomCode:ROOM,name:starts[i][1]}); assert.equal(j.ok,true,j.error);
    const ch=await ack(students[i],'chooseStartCity',{optionId:starts[i][0]}); assert.equal(ch.ok,true,ch.error);
  }
  const go=await ack(teacher,'teacherStartArrivalRace',{}); assert.equal(go.ok,true,go.error);
  for(let i=0;i<students.length;i++){
    const s=students[i], id=starts[i][0], name=starts[i][2];
    const near=await once(s,'snapshot',x=>x.portInteraction?.placeId===id&&x.you.mode==='sea');
    assert.equal(near.portInteraction.placeName,name);
    const enter=await ack(s,'useCatalogPort',{placeId:id}); assert.equal(enter.ok,true,enter.error);
    const city=await once(s,'snapshot',x=>x.you.mode==='city'&&x.you.currentCityId===id,18000);
    assert.equal(city.you.currentCityName,name);
  }
  const landStart=await ack(students[0],'startLandExpedition',{}); assert.equal(landStart.ok,true,landStart.error);
  const land=await once(students[0],'snapshot',x=>x.you.mode==='land',18000); assert.equal(land.you.lastCityId,'lisbon');
  const landGate=await once(students[0],'snapshot',x=>x.you.mode==='land'&&x.portInteraction?.placeId==='lisbon');
  const back=await ack(students[0],'useCatalogPort',{placeId:landGate.portInteraction.placeId}); assert.equal(back.ok,true,back.error);
  const cityAgain=await once(students[0],'snapshot',x=>x.you.mode==='city'&&x.you.currentCityId==='lisbon',18000); assert.equal(cityAgain.you.currentCityName,'리스본');
  const depart=await ack(students[0],'departPort',{}); assert.equal(depart.ok,true,depart.error);
  const sea=await once(students[0],'snapshot',x=>x.you.mode==='sea',18000); assert.equal(sea.you.lastCityId,'lisbon');
  console.log(JSON.stringify({ok:true,testedPorts:starts.map(x=>x[2]),landTransition:true,cityNames:true}));
  clearInterval(hb); teacher.disconnect(); students.forEach(s=>s.disconnect());
})().catch(e=>{console.error(e);process.exit(1);});
