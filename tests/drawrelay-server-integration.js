"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const serverRoot = path.join(projectRoot, "game-hub-server");
const { WebSocket } = require(path.join(serverRoot, "node_modules", "ws"));
const port = 23000 + Math.floor(Math.random() * 9000);

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
      const index = waiters.findIndex(waiter => waiter.predicate(message));
      if (index >= 0) {
        const [waiter] = waiters.splice(index, 1);
        clearTimeout(waiter.timer);
        waiter.resolve(message);
      } else queue.push(message);
    });
    socket.once("error", reject);
    socket.once("open", () => resolve({
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
    }));
  });
}

async function waitForStep(clients, step, phase = "playing") {
  return Promise.all(clients.map((client, index) => client.waitFor(
    message => message.type === "DRAWRELAY_STATE" && message.state.phase === phase && (phase !== "playing" || message.state.step === step),
    `${index + 1}번 참가자 ${phase} ${step}단계`
  )));
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
    await host.waitFor(message => message.type === "CONNECTED", "방장 연결");
    host.send({ type: "CREATE_ROOM", gameId: "drawrelay", roomCode: "3579", name: "하나" });
    await host.waitFor(message => message.type === "ROOM_CREATED", "방 생성");
    await host.waitFor(message => message.type === "DRAWRELAY_STATE" && message.state.players.length === 1, "초기 상태");

    for (let index = 2; index <= 4; index += 1) {
      const guest = await connectClient();
      clients.push(guest);
      await guest.waitFor(message => message.type === "CONNECTED", `${index}번 연결`);
      guest.send({ type: "JOIN_ROOM", gameId: "drawrelay", roomCode: "3579", name: `참가자${index}` });
      await guest.waitFor(message => message.type === "ROOM_JOINED", `${index}번 입장`);
      await host.waitFor(message => message.type === "PLAYER_JOINED", `${index}번 입장 알림`);
      await guest.waitFor(message => message.type === "DRAWRELAY_STATE" && message.state.players.length === index, `${index}인 상태`);
    }

    host.send({ type: "DRAWRELAY_ACTION", action: "START", packId: "history" });
    const started = await waitForStep(clients, 0);
    const prompts = started.map(message => message.state.prompt.text);
    assert.equal(new Set(prompts).size, 4, "첫 제시어는 모두 달라야 합니다.");
    assert.equal(started.every(message => message.state.chains.length === 0), true, "진행 중 전체 책자는 비공개여야 합니다.");

    clients.forEach(client => client.send({ type: "DRAWRELAY_ACTION", action: "SUBMIT_DRAWING", strokes: [] }));
    const guessing = await waitForStep(clients, 1);
    assert.equal(guessing.every(message => message.state.actionType === "guess"), true);
    assert.equal(guessing.every(message => message.state.prompt.type === "drawing"), true);

    clients.forEach((client, index) => client.send({ type: "DRAWRELAY_ACTION", action: "SUBMIT_GUESS", text: `추측 ${index + 1}` }));
    await waitForStep(clients, 2);
    clients.forEach(client => client.send({ type: "DRAWRELAY_ACTION", action: "SUBMIT_DRAWING", strokes: [] }));
    await waitForStep(clients, 3);
    clients.forEach((client, index) => client.send({ type: "DRAWRELAY_ACTION", action: "SUBMIT_GUESS", text: `마지막 ${index + 1}` }));
    const revealed = await waitForStep(clients, 4, "reveal");
    assert.equal(revealed.every(message => message.state.chains.length === 4), true);
    assert.equal(revealed.every(message => message.state.chains.every(chain => chain.entries.length === 5)), true);

    console.log("drawrelay-server-integration: room, 4 clients, private prompts, synchronized relay and reveal ok");
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
