'use strict';

const assert = require('node:assert/strict');
const { io } = require('socket.io-client');

const url = process.env.TEST_URL || 'http://127.0.0.1:3000';
function once(socket, event, predicate = () => true, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, onEvent);
      reject(new Error(`timeout:${event}`));
    }, timeout);
    function onEvent(data) {
      if (!predicate(data)) return;
      clearTimeout(timer);
      socket.off(event, onEvent);
      resolve(data);
    }
    socket.on(event, onEvent);
  });
}
function ack(socket, event, payload = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`ack:${event}`)), 8000);
    socket.emit(event, payload, (result) => {
      clearTimeout(timer);
      resolve(result);
    });
  });
}

(async () => {
  const student = io(url, { transports: ['websocket'], forceNew: true, reconnection: false });
  await once(student, 'connect');
  const joined = await ack(student, 'joinSolo', { name: '속력검사' });
  assert.equal(joined.ok, true, joined.error);
  const initial = await once(student, 'snapshot', (snap) => snap.you.mode === 'sea');

  student.emit('input', { left: true });
  const moving = await once(student, 'snapshot', (snap) => snap.you.moving && snap.you.speedKmh > 0);
  student.emit('input', { left: false });
  assert.ok(moving.you.speedKmh >= 2 && moving.you.speedKmh <= 20, `unexpected sailing speed: ${moving.you.speedKmh}`);
  assert.ok(moving.classGameMinutes > initial.classGameMinutes, 'solo game clock must advance while sailing');

  const stopped = await once(student, 'snapshot', (snap) => !snap.you.moving && snap.you.speedKmh === 0);
  assert.equal(stopped.you.speedKmh, 0);
  console.log(JSON.stringify({
    ok: true,
    sailingSpeedKmh: moving.you.speedKmh,
    gameMinutesAdvanced: Math.round(moving.classGameMinutes - initial.classGameMinutes),
    stoppedSpeedKmh: stopped.you.speedKmh
  }));
  student.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
