'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');

const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const teacherPin = process.env.TEST_TEACHER_PIN || '2468';
function connect() {
  return io(url, { transports: ['websocket'], forceNew: true, reconnection: false });
}
function once(socket, event, timeout=4000) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error(`timeout: ${event}`)),timeout);
    socket.once(event,(data)=>{clearTimeout(timer);resolve(data)});
  });
}
function emitAck(socket,event,payload){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error(`ack timeout: ${event}`)),4000);
    socket.emit(event,payload,(data)=>{clearTimeout(timer);resolve(data)});
  });
}
(async()=>{
  const a=connect(), b=connect(), teacher=connect();
  await Promise.all([once(a,'connect'),once(b,'connect'),once(teacher,'connect')]);
  const [ar,br,tr]=await Promise.all([
    emitAck(a,'joinClass',{roomCode:'TEST4',name:'하늘'}),
    emitAck(b,'joinClass',{roomCode:'TEST4',name:'바다'}),
    emitAck(teacher,'teacherJoin',{roomCode:'TEST4',pin:teacherPin})
  ]);
  assert.equal(ar.ok,true);assert.equal(br.ok,true);assert.equal(tr.ok,true);
  const as=await once(a,'snapshot');
  assert.equal(as.online,2);assert.ok(as.nearby.some(p=>p.name==='바다'));
  const before=as.you.x;
  a.emit('input',{right:true});
  await new Promise(r=>setTimeout(r,350));
  const after=await once(a,'snapshot');
  assert.ok(after.you.x>before,'player should move right');
  const ts=await once(teacher,'teacherSnapshot');
  assert.equal(ts.players.length,2);
  assert.ok(ts.players.some(p=>p.name==='하늘'));
  console.log(JSON.stringify({ok:true,online:after.online,nearby:after.nearby.length,moved:after.you.x-before,teacherPlayers:ts.players.length}));
  a.disconnect();b.disconnect();teacher.disconnect();
})().catch(err=>{console.error(err);process.exitCode=1});
