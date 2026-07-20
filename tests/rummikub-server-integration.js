"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const serverRoot = path.join(projectRoot, "game-hub-server");
const { WebSocket } = require(path.join(serverRoot, "node_modules", "ws"));
const port = 22000 + Math.floor(Math.random() * 10000);

function waitForServer(process) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("서버 시작 시간이 초과되었습니다.")), 8000);
    let errors = "";
    process.stderr.on("data", chunk => { errors += chunk.toString(); });
    process.stdout.on("data", chunk => {
      if (!chunk.toString().includes("listening on port")) return;
      clearTimeout(timer);
      resolve();
    });
    process.once("exit", code => {
      clearTimeout(timer);
      reject(new Error(`서버가 일찍 종료되었습니다. (${code}) ${errors}`));
    });
  });
}

function connectClient() {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}`);
    const queue = [];
    const waiters = [];
    socket.on("message", raw => {
      const message = JSON.parse(raw.toString());
      const waiterIndex = waiters.findIndex(waiter => waiter.predicate(message));
      if (waiterIndex >= 0) {
        const [waiter] = waiters.splice(waiterIndex, 1);
        clearTimeout(waiter.timer);
        waiter.resolve(message);
      } else queue.push(message);
    });
    socket.once("error", reject);
    socket.once("open", () => {
      resolve({
        socket,
        send(message) { socket.send(JSON.stringify(message)); },
        waitFor(predicate, label = "메시지") {
          const queuedIndex = queue.findIndex(predicate);
          if (queuedIndex >= 0) return Promise.resolve(queue.splice(queuedIndex, 1)[0]);
          return new Promise((waitResolve, waitReject) => {
            const waiter = { predicate, resolve: waitResolve, timer: null };
            waiter.timer = setTimeout(() => {
              const index = waiters.indexOf(waiter);
              if (index >= 0) waiters.splice(index, 1);
              waitReject(new Error(`${label} 수신 시간이 초과되었습니다.`));
            }, 5000);
            waiters.push(waiter);
          });
        }
      });
    });
  });
}

async function run() {
  const server = spawn(process.execPath, [path.join(serverRoot, "server.js")], {
    cwd: serverRoot,
    env: { ...process.env, PORT: String(port), NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const clients = [];
  try {
    await waitForServer(server);

    const host = await connectClient();
    clients.push(host);
    const hostConnected = await host.waitFor(message => message.type === "CONNECTED", "방장 연결");
    host.send({ type: "CREATE_ROOM", gameId: "rummikub", roomCode: "2468", name: "방장" });
    await host.waitFor(message => message.type === "ROOM_CREATED", "방 생성");
    await host.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.phase === "lobby", "초기 상태");

    const guest = await connectClient();
    clients.push(guest);
    const guestConnected = await guest.waitFor(message => message.type === "CONNECTED", "참가자 연결");
    guest.send({ type: "JOIN_ROOM", gameId: "rummikub", roomCode: "2468", name: "하늘" });
    await guest.waitFor(message => message.type === "ROOM_JOINED", "방 입장");
    await host.waitFor(message => message.type === "PLAYER_JOINED", "참가자 입장 알림");
    await guest.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.players.length === 2, "2인 대기 상태");

    host.send({ type: "RUMMIKUB_ACTION", action: "START" });
    const hostStart = await host.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.phase === "playing", "방장 시작 상태");
    const guestStart = await guest.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.phase === "playing", "참가자 시작 상태");

    assert.equal(hostStart.state.hand.length, 14);
    assert.equal(guestStart.state.hand.length, 14);
    assert.notDeepEqual(hostStart.state.hand.map(tile => tile.id), guestStart.state.hand.map(tile => tile.id), "두 사람은 서로 다른 손패를 받아야 합니다.");
    assert.equal(hostStart.state.players.some(player => Object.hasOwn(player, "hand")), false, "상대 손패는 공개 상태에 들어가면 안 됩니다.");
    assert.equal(hostStart.state.turnPlayerId, hostConnected.playerId, "방장이 첫 차례여야 합니다.");

    host.send({ type: "RUMMIKUB_ACTION", action: "DRAW" });
    const hostAfterDraw = await host.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.revision > hostStart.state.revision, "방장 드로우 반영");
    const guestAfterHostDraw = await guest.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.revision > guestStart.state.revision, "참가자 동기화");
    assert.equal(hostAfterDraw.state.hand.length, 15, "뽑은 사람의 손패만 한 개 늘어야 합니다.");
    assert.equal(guestAfterHostDraw.state.hand.length, 14, "다른 사람의 손패는 바뀌면 안 됩니다.");
    assert.equal(hostAfterDraw.state.turnPlayerId, guestConnected.playerId, "드로우 뒤 다음 사람에게 차례가 넘어가야 합니다.");
    assert.equal(guestAfterHostDraw.state.players.find(player => player.id === hostConnected.playerId).tileCount, 15);

    guest.send({ type: "RUMMIKUB_ACTION", action: "DRAW" });
    const guestAfterDraw = await guest.waitFor(message => message.type === "RUMMIKUB_STATE" && message.state.revision > guestAfterHostDraw.state.revision, "참가자 드로우 반영");
    assert.equal(guestAfterDraw.state.hand.length, 15);
    assert.equal(guestAfterDraw.state.turnPlayerId, hostConnected.playerId);

    console.log("rummikub-server-integration: room, 2 clients, private hands and synchronized turns ok");
  } finally {
    for (const client of clients) {
      try { client.socket.close(4000, "TEST_COMPLETE"); } catch (_) {}
    }
    server.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
