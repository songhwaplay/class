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
  const observer = io(BASE, { transports: ['websocket'], forceNew: true, reconnection: false });
  await Promise.all([once(student, 'connect'), once(observer, 'connect')]);
  const joined = await ack(student, 'joinSolo', { name: '해안탐험가', school: '송화초', grade: 6 });
  assert.equal(joined.ok, true, joined.error);
  const observedJoin = await ack(observer, 'joinSolo', { name: '배관찰자', school: '송화초', grade: 6 });
  assert.equal(observedJoin.ok, true, observedJoin.error);

  await once(student, 'snapshot', (snap) => snap.you.mode === 'sea' && !snap.you.transition);
  student.emit('setTarget', { x: 1182.5 * 16, y: 354.5 * 16 });
  const shore = await once(student, 'snapshot', (snap) => snap.you.mode === 'sea' && snap.portInteraction?.kind === 'shore');
  assert.equal(shore.portInteraction.actionLabel, '해안 상륙');

  const disembark = await ack(student, 'useShoreTransfer');
  assert.equal(disembark.ok, true, disembark.error);
  const land = await once(student, 'snapshot', (snap) => snap.you.mode === 'land' && !snap.you.transition && snap.portInteraction?.kind === 'shore');
  assert.equal(land.you.shipAnchoredAtShore, true);
  assert.ok(Number.isFinite(land.you.shipAnchorX));
  assert.ok(Number.isFinite(land.you.shipAnchorY));
  assert.ok(Number.isInteger(land.you.shipAnchorDir));
  const anchoredX = land.you.shipAnchorX;
  const anchoredY = land.you.shipAnchorY;
  const observedShip = await once(observer, 'snapshot', (snap) => snap.nearby.some((player) =>
    player.name === '해안탐험가'
    && player.shipAnchoredAtShore
    && Number.isFinite(player.shipAnchorX)
    && Number.isFinite(player.shipAnchorY)
  ));
  assert.equal(observedShip.nearby.find((player) => player.name === '해안탐험가').shipAnchoredAtShore, true);
  observer.emit('setTarget', { x: anchoredX, y: anchoredY });
  await once(observer, 'snapshot', (snap) =>
    snap.you.mode === 'sea'
    && Math.abs(snap.you.x - anchoredX) < 4
    && Math.abs(snap.you.y - anchoredY) < 4
  );

  const embark = await ack(student, 'useShoreTransfer');
  assert.equal(embark.ok, true, embark.error);
  const sea = await once(student, 'snapshot', (snap) => snap.you.mode === 'sea' && !snap.you.transition);
  assert.equal(sea.you.shipAnchoredAtShore, false);
  assert.ok(Math.abs(sea.you.x - anchoredX) < 0.1, `ship x moved: ${anchoredX} -> ${sea.you.x}`);
  assert.ok(Math.abs(sea.you.y - anchoredY) < 0.1, `ship y moved: ${anchoredY} -> ${sea.you.y}`);

  console.log(JSON.stringify({
    ok: true,
    disembarkedAtCoast: true,
    anchoredShipPublished: true,
    returnedToSameShip: true
  }));
  student.disconnect();
  observer.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
