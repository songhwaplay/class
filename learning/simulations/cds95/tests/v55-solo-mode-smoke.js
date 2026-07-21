'use strict';
const {io}=require('socket.io-client');
const assert=require('node:assert/strict');
const BASE=process.env.TEST_URL||'http://127.0.0.1:3000';
function once(socket,event,predicate=()=>true,timeout=12000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{socket.off(event,onEvent);reject(new Error(`timeout:${event}`));},timeout);function onEvent(data){if(!predicate(data))return;clearTimeout(timer);socket.off(event,onEvent);resolve(data)}socket.on(event,onEvent)})}
function ack(socket,event,payload={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${event}`)),8000);socket.emit(event,payload,result=>{clearTimeout(timer);resolve(result)})})}
(async()=>{
  const student=io(BASE,{transports:['websocket'],forceNew:true,reconnection:false});
  await once(student,'connect');
  const joined=await ack(student,'joinSolo',{name:'개인탐험가'});
  assert.equal(joined.ok,true,joined.error);
  assert.equal(joined.sessionMode,'solo');
  assert.equal(joined.mission,null);
  const sea=await once(student,'snapshot',snap=>snap.sessionMode==='solo'&&snap.you.mode==='sea'&&snap.portInteraction?.placeId==='lisbon');
  const landStart=await ack(student,'useCatalogPort',{placeId:'lisbon'});
  assert.equal(landStart.ok,true,landStart.error);
  const land=await once(student,'snapshot',snap=>snap.you.mode==='land'&&snap.cityInteraction?.placeId==='lisbon');
  const entered=await ack(student,'enterCity',{placeId:'lisbon'});
  assert.equal(entered.ok,true,entered.error);
  const cityA=await once(student,'snapshot',snap=>snap.you.mode==='city');
  await new Promise(resolve=>setTimeout(resolve,350));
  const cityB=await once(student,'snapshot',snap=>snap.you.mode==='city'&&snap.classGameMinutes>cityA.classGameMinutes+100);
  const left=await ack(student,'leaveCity',{});
  assert.equal(left.ok,true,left.error);
  assert.equal(left.self.mode,'land');
  console.log(JSON.stringify({ok:true,teacherRequired:false,soloClockAdvancedInCity:Math.round(cityB.classGameMinutes-cityA.classGameMinutes),port:land.portInteraction?.placeName||'리스본'}));
  student.disconnect();
})().catch(error=>{console.error(error);process.exit(1)});
