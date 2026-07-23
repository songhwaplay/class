'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
const pin = process.env.TEST_TEACHER_PIN || '2468';
function connect(){return io(url,{transports:['websocket'],forceNew:true,reconnection:false});}
function once(s,e,t=7000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`timeout:${e}`)),t);s.once(e,d=>{clearTimeout(timer);resolve(d)});});}
function ack(s,e,p={}){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`ack:${e}`)),7000);s.emit(e,p,d=>{clearTimeout(timer);resolve(d)});});}
(async()=>{
  const room=`A${Date.now().toString(36).slice(-6)}`,teacher=connect(),student=connect();
  await Promise.all([once(teacher,'connect'),once(student,'connect')]);
  assert.equal((await ack(teacher,'teacherJoin',{roomCode:room,pin})).ok,true);
  const joined=await ack(student,'joinClass',{roomCode:room,name:'수행미션학생'});assert.equal(joined.ok,true);
  const published=once(student,'missionPublished');
  const mission=await ack(teacher,'teacherPublishMission',{kind:'exploration',mode:'sea',title:'출발 해역 자유 탐험',instructions:'배를 움직여 해안선을 관찰하세요.',criteria:{minDistanceTiles:2,minTerrainTypes:1,requireReturnToCity:false}});assert.equal(mission.ok,true,mission.error);await published;
  const completed=once(student,'missionProgress');student.emit('input',{right:true});await new Promise(r=>setTimeout(r,750));student.emit('input',{right:false});
  const result=await completed;assert.equal(result.progress.status,'completed');assert.equal(Object.prototype.hasOwnProperty.call(result.progress,'distanceTiles'),false);
  const snapshot=await once(student,'snapshot');assert.equal(snapshot.progress.status,'completed');assert.equal(Object.prototype.hasOwnProperty.call(snapshot,'journal'),false);
  console.log(JSON.stringify({ok:true,mission:'exploration',completed:true,minimalState:true}));
  teacher.disconnect();student.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
