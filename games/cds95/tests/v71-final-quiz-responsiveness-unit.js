'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

const student = fs.readFileSync('public/index.html', 'utf8');
const applyStart = student.indexOf('function applyMissionState');
const renderStart = student.indexOf('function renderFinalQuiz(force=false)');
const replaceAt = student.indexOf('finalQuizQuestions.replaceChildren();', renderStart);
const guardAt = student.indexOf("if(!force&&finalQuizView.classList.contains('show')&&renderKey===lastFinalQuizRenderKey)return;", renderStart);

assert.ok(applyStart >= 0 && student.includes('renderFinalQuiz();', applyStart), '실시간 상태에서 최종 문제 갱신 호출 누락');
assert.ok(student.includes("lastFinalQuizRenderKey=''"), '최종 문제 렌더 키 상태 누락');
assert.ok(student.includes('function finalQuizRenderKey('), '최종 문제 렌더 키 생성 함수 누락');
assert.ok(guardAt >= 0, '같은 스냅샷에서 문항 DOM 재생성을 막는 가드 누락');
assert.ok(replaceAt > guardAt, 'DOM 교체보다 렌더 가드가 먼저 실행되어야 한다');
assert.ok(student.includes("input.addEventListener('change',()=>{updateFinalQuizSubmitState();saveFinalQuizDraft()})"), '클릭 직후 로컬 UI 갱신이 저장 요청보다 먼저 실행되지 않는다');
assert.ok(student.includes('finalQuizSaveTimer=setTimeout(()=>'), '답안 저장 묶음 전송 누락');
assert.ok(student.includes('},120);'), '답안 저장 지연 시간이 과도하거나 누락됨');
assert.ok(student.includes('touch-action:manipulation;user-select:none'), '터치 선택 반응 최적화 누락');

console.log(JSON.stringify({ok:true,stableQuestionDom:true,instantLocalSelection:true,draftSaveDebounceMs:120}));
