'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const pin = process.env.TEST_TEACHER_PIN || '2468';
function connect(){return io(url,{transports:['websocket'],forceNew:true,reconnection:false});}
function once(s,e,t=7000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),7000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
async function nextSnapshot(s){for(let i=0;i<5;i++){const snap=await once(s,'snapshot');if(snap?.you)return snap;}throw new Error('no snapshot');}
async function waitForX(s,predicate,tries=15){let snap;for(let i=0;i<tries;i++){snap=await nextSnapshot(s);if(predicate(snap.you.x))return snap;}return snap;}
(async()=>{
  const room=`C${Date.now().toString(36).slice(-6)}`,teacher=connect(),student=connect();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  assert.equal((await ack(teacher,'teacherJoin',{roomCode:room,pin})).ok,true);
  const joined=await ack(student,'joinClass',{roomCode:room,name:'통제학생'});assert.equal(joined.ok,true);
  student.emit('input',{left:true});await new Promise(r=>setTimeout(r,450));let moving=await nextSnapshot(student);const x1=moving.you.x;
  const paused=await ack(teacher,'teacherSetPaused',{paused:true});assert.equal(paused.ok,true);await new Promise(r=>setTimeout(r,500));let stopped=await nextSnapshot(student);assert.ok(Math.abs(stopped.you.x-x1)<5,`paused movement=${stopped.you.x-x1}`);
  const resumed=await ack(teacher,'teacherSetPaused',{paused:false});assert.equal(resumed.ok,true);student.emit('input',{left:true});let movedAgain=await waitForX(student,x=>stopped.you.x-x>15);student.emit('input',{left:false});assert.ok(stopped.you.x-movedAgain.you.x>15,`resumed movement=${stopped.you.x-movedAgain.you.x}`);
  const returned=await ack(teacher,'teacherReturnAll',{});assert.equal(returned.count,1);await new Promise(r=>setTimeout(r,150));const city=await nextSnapshot(student);assert.equal(city.you.mode,'city');
  const locked=await ack(teacher,'teacherSetLocked',{locked:true});assert.equal(locked.settings.locked,true);const late=connect();await once(late,'connect');const denied=await ack(late,'joinClass',{roomCode:room,name:'늦은학생'});assert.equal(denied.ok,false);late.disconnect();
  console.log(JSON.stringify({ok:true,paused:true,resumed:true,returned:city.you.mode,locked:true}));
  teacher.disconnect();student.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
