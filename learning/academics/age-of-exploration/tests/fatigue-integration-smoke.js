'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const pin = process.env.TEST_TEACHER_PIN || '2468';
function connect(){return io(url,{transports:['websocket'],forceNew:true,reconnection:false});}
function once(s,e,t=6000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),6000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
async function latest(s, waitMs){await new Promise(r=>setTimeout(r,waitMs));return once(s,'snapshot');}
(async()=>{
  const teacher=connect(), student=connect();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  const tr=await ack(teacher,'teacherJoin',{roomCode:'FATIGUE16',pin});
  assert.equal(tr.ok,true,tr.error);
  const anchorReal=Date.now(),anchorGame=tr.classGameMinutes,rate=tr.clockRateHoursPerSecond;
  const heartbeat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:anchorGame+(Date.now()-anchorReal)/1000*rate*60}),400);
  const jr=await ack(student,'joinClass',{roomCode:'FATIGUE16',name:'피로학생'});
  assert.equal(jr.ok,true,jr.error);
  const initial=await once(student,'snapshot');
  assert.equal(initial.you.fatigue,0);
  student.emit('input',{left:true});
  const moved=await latest(student,4200);
  student.emit('input',{left:false});
  console.log('moved snapshot',JSON.stringify({fatigue:moved.you.fatigue,mult:moved.you.fatigueSpeedMultiplier,x:moved.you.x,moving:moved.you.moving}));assert.ok(moved.you.fatigue>0.5,'moving should accumulate fatigue');
  assert.equal(moved.you.fatigueSpeedMultiplier,1,'fatigue below 60 must not reduce speed');
  const tired=moved.you.fatigue;
  const rested=await latest(student,2400);
  assert.ok(rested.you.fatigue<tired,'stopping should recover fatigue slowly');
  console.log(JSON.stringify({ok:true,fatigueAfterMove:moved.you.fatigue,speedMultiplier:moved.you.fatigueSpeedMultiplier,fatigueAfterRest:rested.you.fatigue}));
  clearInterval(heartbeat);student.disconnect();teacher.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
