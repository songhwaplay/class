
'use strict';
const { io }=require('socket.io-client');
const assert=require('node:assert/strict');
const BASE=process.env.TEST_URL||'http://127.0.0.1:3000';
const ROOM=`CRM${Date.now().toString(36).slice(-5)}`;
function connect(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:5000});}
function once(s,e,p=()=>true,t=8000){return new Promise((res,rej)=>{const timer=setTimeout(()=>{s.off(e,on);rej(new Error(`timeout:${e}`));},t);function on(d){if(!p(d))return;clearTimeout(timer);s.off(e,on);res(d)}s.on(e,on)});}
function ack(s,e,p={}){return new Promise((res,rej)=>{const timer=setTimeout(()=>rej(new Error(`ack:${e}`)),8000);s.emit(e,p,d=>{clearTimeout(timer);res(d)})});}
(async()=>{
 const teacher=connect(),student=connect();await Promise.all([once(teacher,'connect'),once(student,'connect')]);
 const tj=await ack(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'});assert.equal(tj.ok,true,tj.error);
 const real=Date.now(),game=tj.classGameMinutes,rate=tj.clockRateHoursPerSecond;const beat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:game+(Date.now()-real)/1000*rate*60}),350);
 const pub=await ack(teacher,'teacherPublishStartChoices',{readyMissionId:'istanbul_crimea_map',startPlaceIds:['sevastopol','istanbul','genoa']});assert.equal(pub.ok,true,pub.error);
 const join=await ack(student,'joinClass',{roomCode:ROOM,name:'크림테스트'});assert.equal(join.ok,true,join.error);
 const option=join.mission.startOptions.find(o=>o.startPlace.id==='sevastopol');assert.ok(option);
 const chosen=await ack(student,'chooseStartCity',{optionId:option.id});assert.equal(chosen.ok,true,chosen.error);
 await once(student,'snapshot',s=>s.interaction?.canInteract&&s.progress?.stageIndex===0);
 const collect=await ack(student,'missionInteract',{});assert.equal(collect.ok,true,collect.error);
 await once(student,'snapshot',s=>s.interaction?.canInteract&&s.progress?.stageIndex===1);
 const land=await ack(student,'missionInteract',{});assert.equal(land.ok,true,land.error);assert.equal(land.self.mode,'land');
 const arrived=await once(student,'snapshot',s=>s.progress?.stageIndex>=3&&String(s.you?.noticeText||'').includes('크림반도')&&String(s.you?.noticeText||'').includes('도착'),10000);
 assert.equal(arrived.progress.status,'inProgress');
 console.log(JSON.stringify({ok:true,stageIndex:arrived.progress.stageIndex,notice:arrived.you.noticeText,mode:arrived.you.mode},null,2));
 clearInterval(beat);teacher.disconnect();student.disconnect();
})().catch(e=>{console.error(e);process.exit(1)});
