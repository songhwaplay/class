'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const pin = process.env.TEST_TEACHER_PIN || '2468';
function connect(){return io(url,{transports:['websocket'],forceNew:true,reconnection:false});}
function once(s,e,t=7000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),7000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
async function nextMatching(s,pred,timeout=8000){const end=Date.now()+timeout;while(Date.now()<end){const snap=await once(s,'snapshot',Math.max(500,end-Date.now()));if(pred(snap))return snap;}throw new Error('matching snapshot timeout');}
(async()=>{
  const teacher=connect(),student=connect();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  const tr=await ack(teacher,'teacherJoin',{roomCode:'STATUS18',pin});
  assert.equal(tr.ok,true,tr.error);
  const anchorReal=Date.now(),anchorGame=tr.classGameMinutes,rate=tr.clockRateHoursPerSecond;
  const heartbeat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:anchorGame+(Date.now()-anchorReal)/1000*rate*60}),350);
  const joined=await ack(student,'joinClass',{roomCode:'STATUS18',name:'상태시험'});
  assert.equal(joined.ok,true,joined.error);
  assert.equal(joined.self.money,5000);assert.equal(joined.self.water,100);assert.equal(joined.self.food,100);
  await new Promise(r=>setTimeout(r,1800));
  const consumed=await nextMatching(student,s=>s.you.water<100&&s.you.food<100);
  assert.ok(consumed.you.water<100);assert.ok(consumed.you.food<100);
  student.emit('setTarget',{x:1185.5*16,y:357.5*16});
  await new Promise(r=>setTimeout(r,900));
  const entry=await ack(student,'enterPort');assert.equal(entry.ok,true,entry.error);
  await nextMatching(student,s=>s.you.mode==='city'&&!s.you.transition,6000);
  const supplied=await ack(student,'resupply');assert.equal(supplied.ok,true,supplied.error);
  assert.equal(supplied.self.water,100);assert.equal(supplied.self.food,100);assert.ok(supplied.self.money<5000);
  const html=require('node:fs').readFileSync('public/index.html','utf8');
  for(const id of ['moneyValue','waterValue','foodValue','messageWindow','messageLines'])assert.match(html,new RegExp(`id=["']${id}["']`));
  console.log(JSON.stringify({ok:true,consumed:{water:consumed.you.water,food:consumed.you.food},resupplyCost:supplied.cost,money:supplied.self.money,bottomGuide:true}));
  clearInterval(heartbeat);teacher.disconnect();student.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
