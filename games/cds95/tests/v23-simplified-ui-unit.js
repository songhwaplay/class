'use strict';
const fs=require('node:fs');const assert=require('node:assert/strict');
const student=fs.readFileSync('public/index.html','utf8');const teacher=fs.readFileSync('public/teacher.html','utf8');const server=fs.readFileSync('server.js','utf8');
for(const token of ['missionBanner','choiceRequired','출발 도시 네 곳 중 하나를 선택하세요','CURRENT_TAIL_FACTOR=.30','CURRENT_HEAD_FACTOR=.08'])assert.ok(student.includes(token),`학생 화면 누락: ${token}`);
for(const token of ['도착 도시·지형','출발 도시 1','출발 도시 4','실시간 도착 순위','TV 전체화면'])assert.ok(teacher.includes(token),`교사 화면 누락: ${token}`);
for(const forbidden of ['전원 리스본 복귀','리스본 복귀','추가 입장 잠금','전체 일시정지','weatherFx','CDS95Weather'])assert.ok(!teacher.includes(forbidden)&&!student.includes(forbidden),`제거되지 않은 UI: ${forbidden}`);
assert.ok(server.includes('CURRENT_TAIL_FACTOR = 0.30'));assert.ok(server.includes('CURRENT_HEAD_FACTOR = 0.08'));assert.ok(!server.includes("socket.on('teacherReturnAll'"));assert.ok(!server.includes("socket.on('teacherReturnStudent'"));
console.log(JSON.stringify({ok:true,studentMissionVisible:true,teacherSimple:true,weatherRemoved:true,returnRemoved:true}));
