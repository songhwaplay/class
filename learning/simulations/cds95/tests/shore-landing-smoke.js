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

(async () => {
  const student = io(BASE, { transports: ['websocket'], forceNew: true, reconnection: false });
  await once(student, 'connect');
  const joined = await ack(student, 'joinSolo', { name: '해안탐험가' });
  assert.equal(joined.ok, true, joined.error);

  await once(student, 'snapshot', (snap) => snap.you.mode === 'sea' && !snap.you.transition);
  student.emit('setTarget', { x: 1182.5 * 16, y: 354.5 * 16 });
  const shore = await once(student, 'snapshot', (snap) => snap.you.mode === 'sea' && snap.portInteraction?.kind === 'shore');
  assert.equal(shore.portInteraction.actionLabel, '해안 상륙');

  const disembark = await ack(student, 'useShoreTransfer');
  assert.equal(disembark.ok, true, disembark.error);
  const land = await once(student, 'snapshot', (snap) => snap.you.mode === 'land' && !snap.you.transition && snap.portInteraction?.kind === 'shore');
  assert.equal(land.you.shipAnchoredAtShore, true);

  const embark = await ack(student, 'useShoreTransfer');
  assert.equal(embark.ok, true, embark.error);
  const sea = await once(student, 'snapshot', (snap) => snap.you.mode === 'sea' && !snap.you.transition);
  assert.equal(sea.you.shipAnchoredAtShore, false);

  console.log(JSON.stringify({
    ok: true,
    disembarkedAtCoast: true,
    returnedToSameShip: true
  }));
  student.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
