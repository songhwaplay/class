'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
const ROOM = `RACE${Date.now().toString(36).slice(-5)}`;
function connect(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:6000});}
function once(s,e,p=()=>true,t=12000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{s.off(e,on);reject(new Error(`timeout:${e}`));},t);function on(d){if(!p(d))return;clearTimeout(timer);s.off(e,on);resolve(d)}s.on(e,on)});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),9000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
(async()=>{
  const teacher=connect(),students=[connect(),connect(),connect()];
  await Promise.all([once(teacher,'connect'),...students.map(s=>once(s,'connect'))]);
  const tj=await ack(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'});assert.equal(tj.ok,true,tj.error);
  const real=Date.now(),game=tj.classGameMinutes,rate=tj.clockRateHoursPerSecond;
  const beat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:game+(Date.now()-real)/1000*rate*60}),300);
  const pub=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'bosporus',startPlaceIds:['istanbul','lisbon','london','havana']});
  assert.equal(pub.ok,true,pub.error);assert.equal(pub.mission.kind,'arrivalRace');assert.equal(pub.mission.startOptions.length,4);assert.equal(pub.mission.targetPlace.name,'보스포루스 해협');
  for(let i=0;i<students.length;i++){
    const join=await ack(students[i],'joinClass',{roomCode:ROOM,name:`순위학생${i+1}`});assert.equal(join.ok,true,join.error);assert.equal(join.mission.kind,'arrivalRace');
    const option=join.mission.startOptions.find(o=>o.startPlace.id==='istanbul');assert.ok(option);
    const chosen=await ack(students[i],'chooseStartCity',{optionId:option.id});assert.equal(chosen.ok,true,chosen.error);
    students[i].emit('setTarget',pub.mission.targetPlace.point);
    const complete=await once(students[i],'snapshot',s=>s.progress?.status==='completed',16000);
    assert.equal(complete.progress.finishRank,i+1);
    assert.equal(complete.progress.selectedStartPlaceName,'이스탄불');
  }
  const snap=await once(teacher,'teacherSnapshot',s=>s.progress.filter(p=>p.status==='completed').length===3);
  const ranks=snap.progress.filter(p=>p.status==='completed').sort((a,b)=>a.finishRank-b.finishRank).map(p=>p.finishRank);
  assert.deepEqual(ranks,[1,2,3]);
  const retry=await ack(students[0],'chooseStartCity',{optionId:'lisbon'});assert.equal(retry.ok,false);
  console.log(JSON.stringify({ok:true,room:ROOM,target:pub.mission.targetPlace.name,starts:pub.mission.startOptions.map(o=>o.startPlace.name),ranks},null,2));
  clearInterval(beat);teacher.disconnect();students.forEach(s=>s.disconnect());
})().catch(e=>{console.error(e);process.exit(1)});
