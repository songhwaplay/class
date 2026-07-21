"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const serverRoot = path.join(root, "game-hub-server");
const { WebSocket } = require(path.join(serverRoot, "node_modules", "ws"));
const port = 24000 + Math.floor(Math.random() * 8000);

function waitForServer(server) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("서버 시작 시간이 초과되었습니다.")), 8000);
        let errors = "";
        server.stderr.on("data", (chunk) => { errors += chunk.toString(); });
        server.stdout.on("data", (chunk) => {
            if (!chunk.toString().includes("listening on port")) return;
            clearTimeout(timer);
            resolve();
        });
        server.once("exit", (code) => {
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
        socket.on("message", (raw) => {
            const message = JSON.parse(raw.toString());
            const index = waiters.findIndex((waiter) => waiter.predicate(message));
            if (index < 0) {
                queue.push(message);
                return;
            }
            const [waiter] = waiters.splice(index, 1);
            clearTimeout(waiter.timer);
            waiter.resolve(message);
        });
        socket.once("error", reject);
        socket.once("open", () => {
            resolve({
                socket,
                send(message) { socket.send(JSON.stringify(message)); },
                waitFor(predicate, label) {
                    const queuedIndex = queue.findIndex(predicate);
                    if (queuedIndex >= 0) return Promise.resolve(queue.splice(queuedIndex, 1)[0]);
                    return new Promise((waitResolve, waitReject) => {
                        const waiter = { predicate, resolve: waitResolve, timer: null };
                        waiter.timer = setTimeout(() => {
                            const waiterIndex = waiters.indexOf(waiter);
                            if (waiterIndex >= 0) waiters.splice(waiterIndex, 1);
                            waitReject(new Error(`${label} 수신 시간이 초과되었습니다.`));
                        }, 5000);
                        waiters.push(waiter);
                    });
                }
            });
        });
    });
}

async function joinStudent(name, clients) {
    const client = await connectClient();
    clients.push(client);
    await client.waitFor((message) => message.type === "CONNECTED", `${name} 연결`);
    client.send({ type: "JOIN_ROOM", gameId: "digestion", roomCode: "7351", name });
    const joined = await client.waitFor((message) => message.type === "ROOM_JOINED", `${name} 입장`);
    return { client, playerId: String(joined.playerId) };
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
        await host.waitFor((message) => message.type === "CONNECTED", "교사 연결");
        host.send({ type: "CREATE_ROOM", gameId: "digestion", roomCode: "7351", name: "교사" });
        await host.waitFor((message) => message.type === "ROOM_CREATED", "학급 생성");
        await host.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.phase === "lobby", "초기 상태");

        const first = await joinStudent("하늘", clients);
        await host.waitFor((message) => message.type === "PLAYER_JOINED" && String(message.playerId) === first.playerId, "첫 학생 입장");
        const second = await joinStudent("바다", clients);
        await host.waitFor((message) => message.type === "PLAYER_JOINED" && String(message.playerId) === second.playerId, "둘째 학생 입장");
        const ready = await second.client.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.participants.length === 2, "2명 대기 상태");
        assert.deepEqual(ready.state.participants.map((player) => player.name).sort(), ["바다", "하늘"]);

        host.send({ type: "DIGESTION_ACTION", action: "START" });
        const hostStart = await host.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.phase === "running", "교사 출발 상태");
        const firstStart = await first.client.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.phase === "running", "첫 학생 출발 상태");
        const secondStart = await second.client.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.phase === "running", "둘째 학생 출발 상태");
        assert.equal(firstStart.state.sessionId, secondStart.state.sessionId, "모든 학생이 같은 탐험을 시작해야 합니다.");
        assert.equal(hostStart.state.rankings.length, 0);

        const late = await connectClient();
        clients.push(late);
        await late.waitFor((message) => message.type === "CONNECTED", "늦은 학생 연결");
        late.send({ type: "JOIN_ROOM", gameId: "digestion", roomCode: "7351", name: "노을" });
        const lateError = await late.waitFor((message) => message.type === "ERROR", "진행 중 입장 거절");
        assert.match(lateError.message, /이미 출발한/);

        first.client.send({ type: "DIGESTION_ACTION", action: "SUBMIT", sessionId: firstStart.state.sessionId, score: 7 });
        const firstResult = await first.client.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.rankings.length === 1, "첫 완주 결과");
        assert.equal(firstResult.state.rankings[0].name, "하늘");
        assert.equal(firstResult.state.rankings[0].score, 7);
        assert.ok(Number.isFinite(firstResult.state.rankings[0].elapsedMs));

        second.client.send({ type: "DIGESTION_ACTION", action: "SUBMIT", sessionId: secondStart.state.sessionId, score: 10 });
        const finalState = await second.client.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.phase === "ended", "최종 순위");
        assert.deepEqual(finalState.state.rankings.map((entry) => [entry.rank, entry.name, entry.score]), [
            [1, "바다", 10],
            [2, "하늘", 7]
        ]);

        host.send({ type: "DIGESTION_ACTION", action: "RESET" });
        const reset = await host.waitFor((message) => message.type === "DIGESTION_STATE" && message.state.phase === "lobby" && message.state.participants.length === 2, "새 탐험 준비");
        assert.equal(reset.state.rankings.length, 0);

        console.log("digestion-server-integration: synchronized start, ranking, late-join guard and reset ok");
    } finally {
        for (const client of clients) {
            try { client.socket.close(4000, "TEST_COMPLETE"); } catch (_) {}
        }
        server.kill();
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
