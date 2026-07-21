'use strict';
const fs = require('node:fs');
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const pin = process.env.TEST_TEACHER_PIN || '2468';
const stateFile = process.env.TEST_STATE_FILE;
function connect(){return io(url,{transports:['websocket'],forceNew:true,reconnection:false});}
function once(s,e,t=7000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),7000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
function forbiddenKeys(value,path='root',found=[]){
  if(!value||typeof value!=='object')return found;
  for(const [key,child] of Object.entries(value)){
    if(['distanceTiles','terrainDistanceTiles','visitedTerrains','returnCompleted','journals','journal','routes','pathHistory','missionHistory'].includes(key))found.push(`${path}.${key}`);
    forbiddenKeys(child,`${path}.${key}`,found);
  }
  return found;
}
(async()=>{
  const room=`M${Date.now().toString(36).slice(-6)}`,teacher=connect(),student=connect();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  assert.equal((await ack(teacher,'teacherJoin',{roomCode:room,pin})).ok,true);
  assert.equal((await ack(student,'joinClass',{roomCode:room,name:'최소상태학생'})).ok,true);
  const published=once(student,'missionPublished');
  const response=await ack(teacher,'teacherPublishMission',{kind:'exploration',mode:'sea',title:'자유 탐험',instructions:'주변 해안선을 살펴보며 이동하세요.',criteria:{minDistanceTiles:2,minTerrainTypes:1,requireReturnToCity:false}});
  assert.equal(response.ok,true,response.error);await published;
  const completed=once(student,'missionProgress');student.emit('input',{right:true});await new Promise(r=>setTimeout(r,800));student.emit('input',{right:false});
  const completion=await completed;assert.deepEqual(Object.keys(completion.progress).sort(),['cargoItemId','stageCount','stageIndex','status','statusLabel']);assert.equal(completion.progress.status,'completed');
  const snap=await once(student,'snapshot');assert.deepEqual(Object.keys(snap.progress).sort(),['cargoItemId','stageCount','stageIndex','status','statusLabel']);
  await new Promise(r=>setTimeout(r,500));
  if(stateFile){
    const saved=JSON.parse(fs.readFileSync(stateFile,'utf8'));
    const forbidden=forbiddenKeys(saved);assert.deepEqual(forbidden,[],`forbidden persisted keys: ${forbidden.join(', ')}`);
    const roomState=saved.rooms[response.mission.roomCode];assert.ok(roomState);assert.equal(Object.prototype.hasOwnProperty.call(roomState,'missionHistory'),false);
    const stored=roomState.progress['최소상태학생'][response.mission.id];assert.deepEqual(Object.keys(stored).sort(),['cargoItemId','completedAt','stageIndex','status']);assert.equal(stored.status,'completed');
  }
  console.log(JSON.stringify({ok:true,studentState:['cargoItemId','stageCount','stageIndex','status','statusLabel'],persistedState:['cargoItemId','completedAt','stageIndex','status'],detailedTrackingPersisted:false}));
  teacher.disconnect();student.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
