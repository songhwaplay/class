"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const DrawRelay = require(path.resolve(__dirname, "..", "game-hub-server", "drawrelay"));

function createPlayers(count) {
  const game = DrawRelay.createGame("p1", "하나");
  for (let index = 2; index <= count; index += 1) {
    assert.equal(DrawRelay.addPlayer(game, `p${index}`, `참가자${index}`).ok, true);
  }
  return game;
}

const threePlayer = createPlayers(3);
assert.equal(DrawRelay.startGame(threePlayer).ok, false, "3인전은 시작할 수 없어야 합니다.");
assert.match(DrawRelay.startGame(threePlayer).error, /4명부터 8명/);

const eightPlayer = createPlayers(8);
assert.equal(DrawRelay.addPlayer(eightPlayer, "p9", "아홉").ok, false, "9번째 참가자는 입장할 수 없어야 합니다.");
assert.equal(DrawRelay.startGame(eightPlayer, "society", () => 0.3).ok, true, "8인전까지 시작할 수 있어야 합니다.");

const game = createPlayers(4);
assert.equal(DrawRelay.startGame(game, "science", () => 0.42, 1000).ok, true);
assert.equal(game.phase, "playing");
assert.equal(game.actionType, "draw");
assert.equal(game.deadline, 61000);

const firstState = DrawRelay.stateFor(game, "p1");
const secondState = DrawRelay.stateFor(game, "p2");
assert.equal(firstState.prompt.type, "word");
assert.equal(secondState.prompt.type, "word");
assert.notEqual(firstState.prompt.text, secondState.prompt.text, "첫 제시어는 플레이어마다 달라야 합니다.");
assert.deepEqual(firstState.chains, [], "진행 중에는 전체 릴레이를 공개하면 안 됩니다.");

const rawDrawing = [{ color: "#not-allowed", width: 99, points: [[-4, 30.2], [1004, 800]] }];
assert.equal(DrawRelay.submit(game, "p1", { strokes: rawDrawing }, 2000).ok, true);
assert.equal(DrawRelay.stateFor(game, "p1").mySubmitted, true);
assert.equal(DrawRelay.stateFor(game, "p2").mySubmitted, false);
assert.equal(DrawRelay.stateFor(game, "p2").prompt.type, "word", "다른 사람의 제출 내용은 단계 종료 전 보이지 않아야 합니다.");
assert.equal(DrawRelay.submit(game, "p1", { strokes: [] }).ok, false, "같은 단계에 두 번 제출할 수 없어야 합니다.");

for (let index = 2; index <= 4; index += 1) {
  assert.equal(DrawRelay.submit(game, `p${index}`, { strokes: [{ color: "#3a86ff", width: 5, points: [[index, index]] }] }, 2000).ok, true);
}
assert.equal(game.step, 1);
assert.equal(game.actionType, "guess");
assert.equal(DrawRelay.assignedChainIndex(game, "p1"), 3, "책자는 다음 사람 방향으로 순환해야 합니다.");
assert.equal(Object.hasOwn(DrawRelay.stateFor(game, "p1").prompt, "authorId"), false, "진행 중에는 앞사람의 신원을 공개하지 않아야 합니다.");

for (let index = 1; index <= 4; index += 1) {
  assert.equal(DrawRelay.submit(game, `p${index}`, { text: `추측 ${index}` }, 3000).ok, true);
}
assert.equal(game.step, 2);
assert.equal(game.actionType, "draw");

for (let index = 1; index <= 4; index += 1) {
  assert.equal(DrawRelay.submit(game, `p${index}`, { strokes: [{ color: "#ef476f", width: 7, points: [[10, 10], [20, 20]] }] }, 4000).ok, true);
}
assert.equal(game.step, 3);
assert.equal(game.actionType, "guess");

for (let index = 1; index <= 4; index += 1) {
  assert.equal(DrawRelay.submit(game, `p${index}`, { text: `마지막 추측 ${index}` }, 5000).ok, true);
}
assert.equal(game.phase, "reveal");

const revealState = DrawRelay.stateFor(game, "p2");
assert.equal(revealState.chains.length, 4);
for (const chain of revealState.chains) {
  assert.equal(chain.entries.length, 5, "제시어와 네 사람의 결과가 모두 있어야 합니다.");
  assert.equal(new Set(chain.entries.slice(1).map(entry => entry.authorId)).size, 4, "각 플레이어는 책자마다 한 번씩 참여해야 합니다.");
}
const sanitizedStroke = revealState.chains[0].entries[1].strokes[0];
assert.equal(sanitizedStroke.color, "#172033");
assert.equal(sanitizedStroke.width, 24);
assert.deepEqual(sanitizedStroke.points, [[0, 30], [1000, 700]]);

assert.equal(DrawRelay.resetToLobby(game).ok, true);
assert.equal(game.phase, "lobby");
assert.deepEqual(game.chains, []);

const html = fs.readFileSync(path.resolve(__dirname, "..", "games", "drawrelay", "drawrelay.html"), "utf8");
assert.match(html, /gameId:\s*GAME_ID/);
assert.match(html, /minPlayers:\s*4/);
assert.match(html, /maxPlayers:\s*8/);
assert.match(html, /id=["']drawingCanvas["']/);
assert.match(html, /pointerdown/);
assert.match(html, /SUBMIT_DRAWING/);
assert.match(html, /SUBMIT_GUESS/);
assert.match(html, /다음 장 공개/);
assert.ok(fs.existsSync(path.resolve(__dirname, "..", "games", "drawrelay", "styles.css")));

const hub = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
assert.match(hub, /games\/drawrelay\/drawrelay\.html/);
assert.match(hub, />그림 릴레이</);

const server = fs.readFileSync(path.resolve(__dirname, "..", "game-hub-server", "server.js"), "utf8");
assert.match(server, /drawrelay:\s*8/);
assert.match(server, /DRAWRELAY_ACTION/);
assert.match(server, /DrawRelay\.stateFor/);
assert.match(server, /scheduleDrawRelayDeadline/);

console.log("drawrelay-unit: 4-8 players, private prompts, drawing sanitation, circulation and reveal ok");
