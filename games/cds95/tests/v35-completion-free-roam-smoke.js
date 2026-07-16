'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
function connect(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:6000});}
function once(s,e,p=()=>true,t=15000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{s.off(e,on);reject(new Error(`timeout:${e}`));},t);function on(d){if(!p(d))return;clearTimeout(timer);s.off(e,on);resolve(d)}s.on(e,on);});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),9000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
(async()=>{
  const teacher=connect(),student=connect();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  const created=await ack(teacher,'teacherCreateClass',{pin:process.env.TEST_TEACHER_PIN||'2468'});assert.equal(created.ok,true,created.error);
  const joined=await ack(student,'joinClass',{roomCode:created.roomCode,name:'완료자'});assert.equal(joined.ok,true,joined.error);
  const published=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'bosporus',startPlaceIds:['istanbul','lisbon','london','havana']});assert.equal(published.ok,true,published.error);
  assert.equal((await ack(student,'chooseStartCity',{optionId:'istanbul'})).ok,true);
  assert.equal((await ack(teacher,'teacherStartArrivalRace',{})).ok,true);
  student.emit('setTarget',published.mission.targetPlace.point);
  const completed=await once(student,'snapshot',s=>s.progress?.status==='completed',20000);
  assert.equal(completed.you.finishRank,1);assert.equal(completed.you.speedBoostMultiplier,4);assert.equal(completed.you.missionCompleted,true);
  const origin={x:completed.you.x,y:completed.you.y};let moved=null;
  for(const dir of ['right','left','down','up']){student.emit('input',{[dir]:true});await new Promise(r=>setTimeout(r,650));student.emit('input',{[dir]:false});const snap=await once(student,'snapshot',s=>s.you?.missionCompleted===true,5000);if(distance(origin,snap.you)>10){moved=snap;break;}}
  assert.ok(moved,'완료한 학생이 자유 탐험으로 이동하지 못했습니다.');
  const teacherSnap=await once(teacher,'teacherSnapshot',s=>s.players?.some(p=>p.name==='완료자'&&p.finishRank===1&&p.speedBoostMultiplier===4));
  assert.ok(teacherSnap.players.some(p=>p.name==='완료자'&&p.missionCompleted));
  console.log(JSON.stringify({ok:true,rank:1,speedBoost:4,movedPixels:Math.round(distance(origin,moved.you))}));
  teacher.disconnect();student.disconnect();
})().catch(error=>{console.error(error);process.exit(1);});
