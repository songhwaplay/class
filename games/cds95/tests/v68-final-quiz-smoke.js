'use strict';
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';
const PIN = process.env.TEST_TEACHER_PIN || '2468';
function connect() { return io(BASE, { transports: ['websocket'], forceNew: true, reconnection: false, timeout: 8000 }); }
function once(socket, event, predicate = () => true, timeout = 25000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.off(event, onEvent); reject(new Error(`timeout:${event}`)); }, timeout);
    function onEvent(data) {
      if (!predicate(data)) return;
      clearTimeout(timer); socket.off(event, onEvent); resolve(data);
    }
    socket.on(event, onEvent);
  });
}
function ack(socket, event, payload = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`ack:${event}`)), timeout);
    socket.emit(event, payload, (data) => { clearTimeout(timer); resolve(data); });
  });
}
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

(async () => {
  const teacher = connect();
  const students = [connect(), connect(), connect()];
  await Promise.all([once(teacher, 'connect'), ...students.map((student) => once(student, 'connect'))]);

  const created = await ack(teacher, 'teacherCreateClass', { pin: PIN });
  assert.equal(created.ok, true, created.error);
  const roomCode = created.roomCode;

  const published = await ack(teacher, 'teacherPublishArrivalRace', {
    targetPlaceId: 'bosporus',
    startPlaceIds: ['istanbul', 'lisbon', 'london', 'havana']
  });
  assert.equal(published.ok, true, published.error);
  assert.equal(published.mission.finalQuiz.questions.length, 3);
  const correct = published.mission.finalQuiz.questions.map((question) => question.answerIndex);

  for (let index = 0; index < students.length; index += 1) {
    const joined = await ack(students[index], 'joinClass', { roomCode, name: `퀴즈학생${index + 1}` });
    assert.equal(joined.ok, true, joined.error);
    const option = joined.mission.startOptions.find((item) => item.startPlace.id === 'istanbul');
    assert.ok(option, '이스탄불 출발 선택지가 필요하다');
    const chosen = await ack(students[index], 'chooseStartCity', { optionId: option.id });
    assert.equal(chosen.ok, true, chosen.error);
  }

  const started = await ack(teacher, 'teacherStartArrivalRace');
  assert.equal(started.ok, true, started.error);

  const arrivalPromises = students.map((student) => once(
    student,
    'snapshot',
    (snapshot) => snapshot.progress?.finalQuizStatus === 'answering' && snapshot.progress?.finalQuiz?.questions?.length === 3,
    30000
  ));
  for (const student of students) student.emit('setTarget', published.mission.targetPlace.point);
  const arrivals = await Promise.all(arrivalPromises);
  for (const snapshot of arrivals) {
    assert.equal(snapshot.progress.status, 'inProgress');
    assert.ok(snapshot.progress.finalQuiz.questions.every((question) => !Object.hasOwn(question, 'answerIndex')));
  }

  const twoCorrect = [...correct];
  twoCorrect[2] = (twoCorrect[2] + 1) % published.mission.finalQuiz.questions[2].choices.length;
  const first = await ack(students[0], 'submitFinalQuiz', { answers: twoCorrect });
  assert.equal(first.ok, true, first.error);
  assert.equal(first.progress.finalCorrectCount, 2);
  assert.equal(first.progress.finishRank, 1);

  await sleep(30);
  const second = await ack(students[1], 'submitFinalQuiz', { answers: correct });
  assert.equal(second.ok, true, second.error);
  assert.equal(second.progress.finalCorrectCount, 3);
  assert.equal(second.progress.finishRank, 1, '더 늦어도 정답 수가 많으면 1위여야 한다');

  await sleep(30);
  const third = await ack(students[2], 'submitFinalQuiz', { answers: correct });
  assert.equal(third.ok, true, third.error);
  assert.equal(third.progress.finalCorrectCount, 3);
  assert.equal(third.progress.finishRank, 2, '동점이면 먼저 제출한 학생 뒤여야 한다');

  const board = await once(teacher, 'teacherSnapshot', (snapshot) => snapshot.progress?.filter((item) => item.status === 'completed').length === 3);
  const ranked = board.progress
    .filter((item) => item.status === 'completed')
    .sort((a, b) => a.finishRank - b.finishRank)
    .map((item) => ({ name: item.name, score: item.finalCorrectCount, rank: item.finishRank }));
  assert.deepEqual(ranked, [
    { name: '퀴즈학생2', score: 3, rank: 1 },
    { name: '퀴즈학생3', score: 3, rank: 2 },
    { name: '퀴즈학생1', score: 2, rank: 3 }
  ]);

  console.log(JSON.stringify({ ok: true, roomCode, target: '보스포루스 해협', ranked }, null, 2));
  teacher.disconnect();
  students.forEach((student) => student.disconnect());
})().catch((error) => { console.error(error); process.exit(1); });
