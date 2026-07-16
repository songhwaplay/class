'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
const ROOM = `V26START${Date.now().toString(36).slice(-5)}`;
function connect(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:6000});}
function once(s,e,p=()=>true,t=12000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{s.off(e,on);reject(new Error(`timeout:${e}`));},t);function on(d){if(!p(d))return;clearTimeout(timer);s.off(e,on);resolve(d);}s.on(e,on);});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),9000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d);});});}
(async()=>{
  const teacher=connect(), a=connect(), b=connect();
  await Promise.all([once(teacher,'connect'),once(a,'connect'),once(b,'connect')]);
  const tj=await ack(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'});assert.equal(tj.ok,true,tj.error);
  const pub=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'gibraltar_strait',startPlaceIds:['lisbon','london','original_city_140','amsterdam']});
  assert.equal(pub.ok,true,pub.error);assert.equal(pub.mission.phase,'selecting');
  const ja=await ack(a,'joinClass',{roomCode:ROOM,name:'출발대기학생A'});const jb=await ack(b,'joinClass',{roomCode:ROOM,name:'출발대기학생B'});
  assert.equal(ja.ok,true,ja.error);assert.equal(jb.ok,true,jb.error);
  const ca=await ack(a,'chooseStartCity',{optionId:'lisbon'});assert.equal(ca.ok,true,ca.error);assert.equal(ca.progress.status,'assigned');
  const ax=ca.self.x, ay=ca.self.y;
  a.emit('setTarget',pub.mission.targetPlace.point);
  await new Promise(r=>setTimeout(r,650));
  const locked=await once(a,'snapshot');assert.ok(Math.hypot(locked.you.x-ax,locked.you.y-ay)<1,'교사 출발 전 학생이 이동함');
  const tooSoon=await ack(teacher,'teacherStartArrivalRace',{});assert.equal(tooSoon.ok,false);assert.match(tooSoon.error,/고르지 않은 학생/);
  const cb=await ack(b,'chooseStartCity',{optionId:'london'});assert.equal(cb.ok,true,cb.error);
  const startedEventA=once(a,'missionStarted',d=>d?.mission?.phase==='running');
  const started=await ack(teacher,'teacherStartArrivalRace',{});assert.equal(started.ok,true,started.error);assert.equal(started.mission.phase,'running');await startedEventA;
  a.emit('setTarget',pub.mission.targetPlace.point);
  const moved=await once(a,'snapshot',s=>Math.hypot(s.you.x-ax,s.you.y-ay)>3,10000);
  assert.ok(Math.hypot(moved.you.x-ax,moved.you.y-ay)>3);
  const late=connect();await once(late,'connect');const jl=await ack(late,'joinClass',{roomCode:ROOM,name:'늦은학생'});assert.equal(jl.ok,true,jl.error);const lateChoose=await ack(late,'chooseStartCity',{optionId:'original_city_140'});assert.equal(lateChoose.ok,false);
  console.log(JSON.stringify({ok:true,blockedBeforeTeacherStart:true,requiresAllStudentsReady:true,movesAfterTeacherStart:true,lateChoiceBlocked:true},null,2));
  teacher.disconnect();a.disconnect();b.disconnect();late.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
