'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
const ROOM = `START${Date.now().toString(36).slice(-5)}`;
function connect(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:5000});}
function once(s,e,t=7000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),7000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
(async()=>{
  const teacher=connect(),a=connect(),b=connect();
  await Promise.all([once(teacher,'connect'),once(a,'connect'),once(b,'connect')]);
  const tj=await ack(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'});assert.equal(tj.ok,true,tj.error);
  const baseReal=Date.now(),baseGame=tj.classGameMinutes,rate=tj.clockRateHoursPerSecond;
  const heartbeat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:baseGame+(Date.now()-baseReal)/1000*rate*60}),400);
  const pub=await ack(teacher,'teacherPublishStartChoices',{
    readyMissionId:'lisbon_niagara_survey',
    startPlaceIds:['lisbon','london','havana']
  });
  assert.equal(pub.ok,true,pub.error);
  assert.equal(pub.mission.kind,'startChoiceSet');
  assert.equal(pub.mission.startOptions.length,3);
  assert.equal(new Set(pub.mission.startOptions.map(o=>o.title)).size,1,'모든 선택지는 같은 공통 미션이어야 함');
  const [aj,bj]=await Promise.all([
    ack(a,'joinClass',{roomCode:ROOM,name:'출발학생A'}),
    ack(b,'joinClass',{roomCode:ROOM,name:'출발학생B'})
  ]);
  assert.equal(aj.ok,true,aj.error);assert.equal(bj.ok,true,bj.error);
  assert.equal(aj.mission.kind,'startChoiceSet');
  assert.equal(aj.mission.startOptions.length,3);
  const optionA=aj.mission.startOptions[0],optionB=bj.mission.startOptions[1];
  assert.notEqual(optionA.startPlace.id,optionB.startPlace.id);
  const fullA=pub.mission.startOptions.find(o=>o.id===optionA.id);
  const fullB=pub.mission.startOptions.find(o=>o.id===optionB.id);
  const ar=await ack(a,'chooseStartCity',{optionId:optionA.id});
  const br=await ack(b,'chooseStartCity',{optionId:optionB.id});
  assert.equal(ar.ok,true,ar.error);assert.equal(br.ok,true,br.error);
  assert.equal(ar.mission.title,br.mission.title,'목표 미션은 같아야 함');
  assert.equal(ar.progress.selectedStartPlaceName,fullA.startPlace.name);
  assert.equal(br.progress.selectedStartPlaceName,fullB.startPlace.name);
  assert.ok(dist(ar.self,fullA.startPlace.point)<180,`${fullA.startPlace.name} 출발 좌표가 아님`);
  assert.ok(dist(br.self,fullB.startPlace.point)<180,`${fullB.startPlace.name} 출발 좌표가 아님`);
  assert.ok(dist(ar.self,br.self)>1000,'서로 다른 출발 도시인데 같은 위치에 생성됨');
  const retry=await ack(a,'chooseStartCity',{optionId:optionB.id});
  assert.equal(retry.ok,false);assert.match(retry.error,/변경할 수 없습니다/);
  const snap=await once(teacher,'teacherSnapshot');
  const pa=snap.progress.find(p=>p.name==='출발학생A'),pb=snap.progress.find(p=>p.name==='출발학생B');
  assert.equal(pa.selectedStartPlaceName,fullA.startPlace.name);
  assert.equal(pb.selectedStartPlaceName,fullB.startPlace.name);
  console.log(JSON.stringify({
    ok:true,room:ROOM,mission:pub.mission.title,
    starts:pub.mission.startOptions.map(o=>o.startPlace.name),
    studentA:pa.selectedStartPlaceName,studentB:pb.selectedStartPlaceName,
    sameGoal:ar.mission.title===br.mission.title,lockedAfterChoice:true
  },null,2));
  clearInterval(heartbeat);teacher.disconnect();a.disconnect();b.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
