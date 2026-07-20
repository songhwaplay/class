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
        process.stderr.on("data", (chunk) => { errors += chunk.toString(); });
        process.stdout.on("data", (chunk) => {
            if (!chunk.toString().includes("listening on port")) return;
            clearTimeout(timer);
            resolve();
        });
        process.once("exit", (code) => {
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
            if (index >= 0) {
                const [waiter] = waiters.splice(index, 1);
                clearTimeout(waiter.timer);
                waiter.resolve(message);
            } else {
                queue.push(message);
            }
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
    client.send({ type: "JOIN_ROOM", gameId: "spelling", roomCode: "5724", name });
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
        host.send({ type: "CREATE_ROOM", gameId: "spelling", roomCode: "5724", name: "교사" });
        await host.waitFor((message) => message.type === "ROOM_CREATED", "학급 생성");
        await host.waitFor((message) => message.type === "SPELLING_STATE" && message.state.phase === "lobby", "초기 학급 상태");

        const first = await joinStudent("하늘", clients);
        await host.waitFor((message) => message.type === "PLAYER_JOINED" && String(message.playerId) === first.playerId, "첫 학생 입장");
        const second = await joinStudent("바다", clients);
        await host.waitFor((message) => message.type === "PLAYER_JOINED" && String(message.playerId) === second.playerId, "둘째 학생 입장");
        const twoStudents = await second.client.waitFor((message) => message.type === "SPELLING_STATE" && message.state.participants.length === 2, "2명 학급 상태");
        assert.deepEqual(twoStudents.state.participants.map((player) => player.name).sort(), ["바다", "하늘"]);

        const questionIds = Array.from({ length: 10 }, (_, index) => `question_${index + 1}`);
        host.send({ type: "SPELLING_ACTION", action: "START", questionIds });
        const hostStart = await host.waitFor((message) => message.type === "SPELLING_STATE" && message.state.phase === "running", "교사 시작 상태");
        const firstStart = await first.client.waitFor((message) => message.type === "SPELLING_STATE" && message.state.phase === "running", "첫 학생 시작 상태");
        const secondStart = await second.client.waitFor((message) => message.type === "SPELLING_STATE" && message.state.phase === "running", "둘째 학생 시작 상태");
        assert.deepEqual(firstStart.state.questionIds, questionIds, "모든 학생에게 같은 문항이 전달되어야 합니다.");
        assert.equal(firstStart.state.sessionId, secondStart.state.sessionId, "모든 학생의 순위전 세션이 같아야 합니다.");
        assert.equal(hostStart.state.rankings.length, 0);

        const late = await connectClient();
        clients.push(late);
        await late.waitFor((message) => message.type === "CONNECTED", "늦은 학생 연결");
        late.send({ type: "JOIN_ROOM", gameId: "spelling", roomCode: "5724", name: "노을" });
        const lateError = await late.waitFor((message) => message.type === "ERROR", "진행 중 입장 거절");
        assert.match(lateError.message, /이미 시작한/);

        first.client.send({
            type: "SPELLING_ACTION",
            action: "SUBMIT",
            sessionId: firstStart.state.sessionId,
            score: 8
        });
        const firstResult = await first.client.waitFor((message) => message.type === "SPELLING_STATE" && message.state.rankings.length === 1, "첫 결과");
        assert.equal(firstResult.state.rankings[0].name, "하늘");
        assert.equal(firstResult.state.rankings[0].score, 8);
        assert.ok(Number.isFinite(firstResult.state.rankings[0].elapsedMs), "완료 시간은 서버에서 기록되어야 합니다.");

        second.client.send({
            type: "SPELLING_ACTION",
            action: "SUBMIT",
            sessionId: secondStart.state.sessionId,
            score: 10
        });
        const finalState = await second.client.waitFor((message) => message.type === "SPELLING_STATE" && message.state.phase === "ended", "최종 순위");
        assert.deepEqual(finalState.state.rankings.map((entry) => [entry.rank, entry.name, entry.score]), [
            [1, "바다", 10],
            [2, "하늘", 8]
        ]);

        host.send({ type: "SPELLING_ACTION", action: "RESET" });
        const resetState = await host.waitFor((message) => message.type === "SPELLING_STATE" && message.state.phase === "lobby" && message.state.questionIds.length === 0 && message.state.participants.length === 2, "새 순위전 준비");
        assert.equal(resetState.state.participants.length, 2, "연결된 학생은 다음 순위전 대기실에 남아야 합니다.");

        console.log("spelling-server-integration: class room, synchronized questions, server ranking and reset ok");
    } finally {
        for (const client of clients) {
            try { client.socket.close(4000, "TEST_COMPLETE"); } catch (error) {}
        }
        server.kill();
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
