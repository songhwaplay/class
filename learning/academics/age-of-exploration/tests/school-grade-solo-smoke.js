'use strict';

const assert = require('node:assert/strict');
const { io } = require('socket.io-client');

const BASE = process.env.TEST_URL || 'http://127.0.0.1:3000';

function once(socket, event, predicate = () => true, timeout = 12000) {
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

async function connect() {
  const socket = io(BASE, { transports: ['websocket'], forceNew: true, reconnection: false });
  await once(socket, 'connect');
  return socket;
}

(async () => {
  const alpha = await connect();
  const bravo = await connect();
  const charlie = await connect();

  assert.equal((await ack(alpha, 'joinSolo', { name: 'Alpha', school: 'Songhwa', grade: 5 })).ok, true);
  assert.equal((await ack(bravo, 'joinSolo', { name: 'Bravo', school: 'Songhwa', grade: 5 })).ok, true);
  assert.equal((await ack(charlie, 'joinSolo', { name: 'Charlie', school: 'Songhwa', grade: 6 })).ok, true);

  const shared = await once(alpha, 'snapshot', (snap) =>
    snap.sharedSolo === true &&
    snap.online === 2 &&
    snap.nearby.some((player) => player.name === 'Bravo')
  );
  const isolated = await once(charlie, 'snapshot', (snap) =>
    snap.sharedSolo === true &&
    snap.online === 1 &&
    snap.nearby.length === 0
  );

  assert.equal(shared.nearby.length, 1);
  assert.equal(isolated.online, 1);
  alpha.disconnect();
  bravo.disconnect();
  charlie.disconnect();
  console.log(JSON.stringify({ ok: true, sameSchoolGradeVisible: true, differentGradeIsolated: true }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
