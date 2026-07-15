'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const pin = process.env.TEST_TEACHER_PIN || '2468';
function connect(){return io(url,{transports:['websocket'],forceNew:true,reconnection:false});}
function once(s,e,t=6000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),6000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
async function nextMatching(s,pred,timeout=6000){const end=Date.now()+timeout;while(Date.now()<end){const snap=await once(s,'snapshot',Math.max(500,end-Date.now()));if(pred(snap))return snap;}throw new Error('matching snapshot timeout');}
(async()=>{
  const teacher=connect(),a=connect(),b=connect();
  await Promise.all([once(teacher,'connect'),once(a,'connect'),once(b,'connect')]);
  const tr=await ack(teacher,'teacherJoin',{roomCode:'CLOCK14',pin});
  assert.equal(tr.ok,true,tr.error);
  const anchorReal=Date.now(),anchorGame=tr.classGameMinutes,rate=tr.clockRateHoursPerSecond;
  const heartbeat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:anchorGame+(Date.now()-anchorReal)/1000*rate*60}),400);
  const [ar,br]=await Promise.all([
    ack(a,'joinClass',{roomCode:'CLOCK14',name:'학생A'}),
    ack(b,'joinClass',{roomCode:'CLOCK14',name:'학생B'})
  ]);
  assert.equal(ar.ok,true);assert.equal(br.ok,true);
  const [as,bs]=await Promise.all([once(a,'snapshot'),once(b,'snapshot')]);
  assert.ok(Math.abs(as.classGameMinutes-bs.classGameMinutes)<40,'class clocks must match');
  const before=as.classGameMinutes;
  await new Promise(r=>setTimeout(r,700));
  const advanced=await once(a,'snapshot');
  assert.ok(advanced.classGameMinutes-before>120,'shared clock should advance even while idle');

  a.emit('setTarget',{x:1185.5*16,y:357.5*16});
  await new Promise(r=>setTimeout(r,900));
  const entry=await ack(a,'enterPort');
  assert.equal(entry.ok,true,entry.error);assert.ok(entry.self.transition);assert.equal(entry.self.mode,'sea');
  const during=await nextMatching(a,s=>s.you.transition&&s.you.mode==='sea');
  const city=await nextMatching(a,s=>s.you.mode==='city'&&!s.you.transition,5000);
  assert.ok(city.classGameMinutes-during.classGameMinutes>=250,'entry must consume shared game time');
  const cityClock=city.classGameMinutes;
  await new Promise(r=>setTimeout(r,600));
  const cityLater=await once(a,'snapshot');
  assert.ok(cityLater.classGameMinutes-cityClock>100,'class time must continue in city');

  const depart=await ack(a,'departPort');
  assert.equal(depart.ok,true,depart.error);assert.ok(depart.self.transition);assert.equal(depart.self.mode,'city');
  const sea=await nextMatching(a,s=>s.you.mode==='sea'&&!s.you.transition,4000);
  assert.ok(sea.classGameMinutes>cityLater.classGameMinutes,'departure must consume time');
  clearInterval(heartbeat);
  teacher.disconnect();
  await new Promise(r=>setTimeout(r,250));
  const frozen1=await once(a,'snapshot');await new Promise(r=>setTimeout(r,700));const frozen2=await once(a,'snapshot');
  assert.ok(Math.abs(frozen2.classGameMinutes-frozen1.classGameMinutes)<2,'clock must freeze when teacher authority disconnects');
  console.log(JSON.stringify({ok:true,sharedClockDelta:+(advanced.classGameMinutes-before).toFixed(1),entryMinutes:+(city.classGameMinutes-during.classGameMinutes).toFixed(1),cityContinues:+(cityLater.classGameMinutes-cityClock).toFixed(1),teacherDisconnectFreezes:true}));
  a.disconnect();b.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
