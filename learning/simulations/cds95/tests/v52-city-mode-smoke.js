'use strict';
const {io}=require('socket.io-client');
const assert=require('node:assert/strict');
const BASE=process.env.TEST_URL||'http://127.0.0.1:3000';
const ROOM=String(Math.floor(100000+Math.random()*900000));
function c(){return io(BASE,{transports:['websocket'],forceNew:true,reconnection:false,timeout:7000});}
function once(s,e,p=()=>true,t=15000){return new Promise((r,j)=>{const x=setTimeout(()=>{s.off(e,on);j(new Error(`timeout:${e}`));},t);function on(d){if(!p(d))return;clearTimeout(x);s.off(e,on);r(d)}s.on(e,on)});}
function ack(s,e,p={}){return new Promise((r,j)=>{const x=setTimeout(()=>j(new Error(`ack:${e}`)),10000);s.emit(e,p,d=>{clearTimeout(x);r(d)})});}
(async()=>{
 const teacher=c(),student=c();await Promise.all([once(teacher,'connect'),once(student,'connect')]);
 const tj=await ack(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'});assert.equal(tj.ok,true,tj.error);
 const pub=await ack(teacher,'teacherPublishArrivalRace',{targetPlaceId:'gibraltar_strait',startPlaceIds:['lisbon','london','amsterdam','original_city_195']});assert.equal(pub.ok,true,pub.error);
 const join=await ack(student,'joinClass',{roomCode:ROOM,name:'도시학생'});assert.equal(join.ok,true,join.error);
 const choose=await ack(student,'chooseStartCity',{optionId:'lisbon'});assert.equal(choose.ok,true,choose.error);
 const go=await ack(teacher,'teacherStartArrivalRace',{});assert.equal(go.ok,true,go.error);
 const sea=await once(student,'snapshot',x=>x.you.mode==='sea'&&x.portInteraction?.placeId==='lisbon');
 const landStart=await ack(student,'useCatalogPort',{placeId:sea.portInteraction.placeId});assert.equal(landStart.ok,true,landStart.error);
 const land=await once(student,'snapshot',x=>x.you.mode==='land'&&x.cityInteraction?.placeId==='lisbon',15000);
 const enterAt=land.classGameMinutes;
 const entered=await ack(student,'enterCity',{placeId:'lisbon'});assert.equal(entered.ok,true,entered.error);assert.equal(entered.self.mode,'city');assert.equal(entered.self.transition,null);assert.match(entered.self.currentCityImage,/city_000\.png\?v=52$/);
 const cityA=await once(student,'snapshot',x=>x.you.mode==='city'&&x.you.currentCityId==='lisbon');
 await new Promise(r=>setTimeout(r,450));
 const cityB=await once(student,'snapshot',x=>x.you.mode==='city'&&x.classGameMinutes>cityA.classGameMinutes);
 assert.ok(cityB.classGameMinutes>cityA.classGameMinutes,'도시 내부에서 학급 시간이 멈춤');
 const left=await ack(student,'leaveCity',{});assert.equal(left.ok,true,left.error);assert.equal(left.self.mode,'land');assert.equal(left.self.transition,null);
 console.log(JSON.stringify({ok:true,city:'리스본',image:entered.self.currentCityImage,clockAdvancedMinutes:Math.round(cityB.classGameMinutes-cityA.classGameMinutes),enterExitImmediate:true,enterAt:Math.round(enterAt)}));
 teacher.disconnect();student.disconnect();
})().catch(e=>{console.error(e);process.exit(1)});
