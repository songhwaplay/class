'use strict';
const { io } = require('socket.io-client');

const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
const ROOM = `CAT${Date.now().toString(36).slice(-5)}`;

function connect() {
  return io(BASE, { transports:['websocket'], reconnection:false, timeout:5000 });
}
function emitAck(socket, event, payload) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${event} 응답 시간 초과`)), 6000);
    socket.emit(event, payload, (result) => { clearTimeout(timer); resolve(result); });
  });
}
function waitFor(socket, event, predicate, timeout=8000) {
  return new Promise((resolve, reject) => {
    const timer=setTimeout(()=>{socket.off(event,on);reject(new Error(`${event} 대기 시간 초과`));},timeout);
    function on(data){if(!predicate(data))return;clearTimeout(timer);socket.off(event,on);resolve(data);}
    socket.on(event,on);
  });
}

(async()=>{
  const teacher=connect(), student=connect();
  await Promise.all([waitFor(teacher,'connect',()=>true),waitFor(student,'connect',()=>true)]);
  const tj=await emitAck(teacher,'teacherJoin',{roomCode:ROOM,pin:'2468'});
  if(!tj.ok)throw new Error(tj.error);
  const clockStart=tj.classGameMinutes,clockReal=Date.now();
  const clockHeartbeat=setInterval(()=>teacher.emit('teacherClockSync',{gameMinutes:clockStart+(Date.now()-clockReal)/1000*tj.clockRateHoursPerSecond*60}),400);
  const pub=await emitAck(teacher,'teacherPublishGeneratedMission',{
    templateId:'transport',sourcePlaceId:'lisbon',targetPlaceId:'lisbon',itemId:'survey_tools',
    sourceFacility:'지도제작소',targetFacility:'항구 창고',markerMode:'hidden'
  });
  if(!pub.ok)throw new Error(pub.error);
  if(pub.mission.kind!=='staged'||pub.mission.stages.length!==2)throw new Error('단계형 미션 생성 실패');
  const joined=await emitAck(student,'joinClass',{roomCode:ROOM,name:'카탈로그학생'});
  if(!joined.ok)throw new Error(joined.error);
  const target=pub.mission.stages[0].point;
  student.emit('setTarget',target);
  await waitFor(student,'snapshot',s=>s.interaction?.canInteract===true&&s.progress?.stageIndex===0,10000);
  const first=await emitAck(student,'missionInteract',{});
  if(!first.ok||first.progress.stageIndex!==1||first.progress.cargoItemId!=='survey_tools')throw new Error('물품 구입 단계 실패');
  await waitFor(student,'snapshot',s=>s.interaction?.canInteract===true&&s.progress?.stageIndex===1,5000);
  const second=await emitAck(student,'missionInteract',{});
  if(!second.ok||second.progress.status!=='completed'||second.progress.cargoItemId!==null)throw new Error('물품 전달 완료 실패');
  const landed=await emitAck(student,'useCatalogPort',{placeId:'lisbon'});
  if(!landed.ok||landed.self.mode!=='sea'||!landed.self.transition)throw new Error('카탈로그 항구 상륙 시작 실패');
  await waitFor(student,'snapshot',s=>s.you.mode==='land'&&!s.you.transition,5000);
  const embarked=await emitAck(student,'useCatalogPort',{placeId:'lisbon'});
  if(!embarked.ok||embarked.self.mode!=='land'||!embarked.self.transition)throw new Error('카탈로그 항구 승선 시작 실패');
  await waitFor(student,'snapshot',s=>s.you.mode==='sea'&&!s.you.transition,5000);
  const ready=await emitAck(teacher,'teacherPublishGeneratedMission',{readyMissionId:'lisbon_niagara_survey'});
  if(!ready.ok||ready.mission.stages.length!==4||!ready.mission.atlasInstruction.includes('나이아가라 폭포'))throw new Error('기본 미션팩 생성 실패');
  console.log(JSON.stringify({ok:true,room:ROOM,title:pub.mission.title,stages:pub.mission.stages.length,status:second.progress.status,globalPortTransition:true,readyMission:ready.mission.title},null,2));
  clearInterval(clockHeartbeat);teacher.disconnect();student.disconnect();
})().catch((error)=>{console.error(error);process.exit(1);});
