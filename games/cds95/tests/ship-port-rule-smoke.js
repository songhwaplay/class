'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
function client(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:7000});}
function once(socket,event,predicate=()=>true,timeout=15000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{socket.off(event,on);reject(new Error(`timeout:${event}`));},timeout);function on(data){if(!predicate(data))return;clearTimeout(timer);socket.off(event,on);resolve(data);}socket.on(event,on);});}
function ack(socket,event,payload={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${event}`)),12000);socket.emit(event,payload,data=>{clearTimeout(timer);resolve(data);});});}
(async()=>{
  const teacher=client(),student=client();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  const created=await ack(teacher,'teacherCreateClass',{pin:'2468'});assert.equal(created.ok,true,created.error);
  const room=created.roomCode;
  const baseReal=Date.now(),baseGame=created.classGameMinutes,rate=created.clockRateHoursPerSecond;
  const heartbeat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:baseGame+(Date.now()-baseReal)/1000*rate*60}),250);
  const invalid=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'crimea_peninsula',startPlaceIds:['lisbon','london','istanbul','original_city_210']});
  assert.equal(invalid.ok,false,'내륙 도시 파리는 출발지로 허용되면 안 됨');
  assert.match(invalid.error,/항구 도시/);
  const published=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'crimea_peninsula',startPlaceIds:['lisbon','london','istanbul','original_city_195']});
  assert.equal(published.ok,true,published.error);
  const joined=await ack(student,'joinClass',{roomCode:room,name:'정박학생'});assert.equal(joined.ok,true,joined.error);
  const chosen=await ack(student,'chooseStartCity',{optionId:'lisbon'});assert.equal(chosen.ok,true,chosen.error);
  assert.equal(chosen.self.shipPortId,'lisbon');
  const started=await ack(teacher,'teacherStartArrivalRace',{});assert.equal(started.ok,true,started.error);
  const seaAtLisbon=await once(student,'snapshot',s=>s.you.mode==='sea'&&s.portInteraction?.placeId==='lisbon'&&s.portInteraction?.canUse===true);
  assert.equal(seaAtLisbon.you.shipPortName,'리스본');
  const disembark=await ack(student,'useCatalogPort',{placeId:'lisbon'});assert.equal(disembark.ok,true,disembark.error);
  const land=await once(student,'snapshot',s=>s.you.mode==='land'&&s.you.shipPortId==='lisbon',18000);
  assert.equal(land.you.shipPortName,'리스본');
  const wrongPort=await ack(student,'useCatalogPort',{placeId:'london'});
  assert.equal(wrongPort.ok,false);
  assert.match(wrongPort.error,/배는 리스본에 정박해 있습니다/);
  const ownPort=await ack(student,'useCatalogPort',{placeId:'lisbon'});assert.equal(ownPort.ok,true,ownPort.error);
  const seaAgain=await once(student,'snapshot',s=>s.you.mode==='sea'&&s.you.shipPortId==='lisbon',18000);
  assert.equal(seaAgain.you.shipPortName,'리스본');
  clearInterval(heartbeat);teacher.disconnect();student.disconnect();
  console.log(JSON.stringify({ok:true,room,portOnlyStarts:true,shipStayedAt:'리스본',wrongPortBoardingBlocked:true,ownPortBoardingAllowed:true}));
})().catch(error=>{console.error(error);process.exit(1);});
