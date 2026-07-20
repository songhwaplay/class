"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Rummikub = require(path.resolve(__dirname, "..", "game-hub-server", "rummikub"));

const tile = id => Rummikub.BASE_TILES.find(candidate => candidate.id === id);
const ids = group => group.map(item => item.id);

assert.equal(Rummikub.BASE_TILES.length, 104, "조커를 제외한 타일은 104개여야 합니다.");
assert.equal(new Set(Rummikub.BASE_TILES.map(item => item.id)).size, 104, "모든 타일 ID가 달라야 합니다.");
assert.equal(Rummikub.groupType([tile("red-4-1"), tile("red-5-1"), tile("red-6-1")]), "run");
assert.equal(Rummikub.groupType([tile("red-8-1"), tile("blue-8-1"), tile("black-8-1")]), "set");
assert.equal(Rummikub.groupType([tile("red-8-1"), tile("red-8-2"), tile("black-8-1")]), null, "그룹에서 같은 색을 중복할 수 없습니다.");
assert.equal(Rummikub.groupType([tile("blue-4-1"), tile("blue-6-1"), tile("blue-7-1")]), null, "런의 숫자는 연속이어야 합니다.");

const started = Rummikub.createGame("host", "방장");
Rummikub.addPlayer(started, "guest1", "하늘");
Rummikub.addPlayer(started, "guest2", "바다");
assert.equal(Rummikub.startGame(started, () => 0).ok, true);
assert.equal(started.phase, "playing");
assert.equal(started.hands.host.length, 14);
assert.equal(started.hands.guest1.length, 14);
assert.equal(started.deck.length, 62, "3명이 14개씩 받은 뒤 62개가 남아야 합니다.");
const hostView = Rummikub.stateFor(started, "host");
assert.equal(hostView.hand.length, 14);
assert.equal(Object.hasOwn(hostView.players[1], "hand"), false, "다른 사람의 손패는 공개하면 안 됩니다.");

function playingGame({ hand, board = [], opened = false }) {
  const game = Rummikub.createGame("host", "방장");
  Rummikub.addPlayer(game, "guest", "하늘");
  game.phase = "playing";
  game.players[0].opened = opened;
  game.hands = { host: hand.map(tile), guest: [tile("orange-13-2")] };
  game.board = board.map(group => group.map(tile));
  game.deck = [];
  game.turnIndex = 0;
  game.passCount = 0;
  return game;
}

const lowOpening = playingGame({ hand: ["red-1-1", "red-2-1", "red-3-1"] });
assert.equal(Rummikub.play(lowOpening, "host", [["red-1-1", "red-2-1", "red-3-1"]]).ok, false);
assert.equal(lowOpening.hands.host.length, 3, "실패한 제출은 상태를 바꾸면 안 됩니다.");

const validOpening = playingGame({ hand: ["red-10-1", "red-11-1", "red-12-1", "blue-1-1"] });
assert.equal(Rummikub.play(validOpening, "host", [["red-12-1", "red-10-1", "red-11-1"]]).ok, true);
assert.equal(validOpening.players[0].opened, true);
assert.deepEqual(ids(validOpening.board[0]), ["red-10-1", "red-11-1", "red-12-1"], "런은 숫자순으로 정렬해야 합니다.");
assert.equal(validOpening.hands.host.length, 1);

const unopenedRearrange = playingGame({
  hand: ["red-4-1", "blue-10-1", "black-10-1", "orange-10-1"],
  board: [["red-1-1", "red-2-1", "red-3-1"]]
});
const alteredOpening = Rummikub.play(unopenedRearrange, "host", [
  ["red-1-1", "red-2-1", "red-3-1", "red-4-1"],
  ["blue-10-1", "black-10-1", "orange-10-1"]
]);
assert.equal(alteredOpening.ok, false, "최초 등록 전에는 기존 보드를 건드릴 수 없습니다.");

const rearrange = playingGame({
  opened: true,
  hand: ["red-4-1", "blue-9-1"],
  board: [["red-1-1", "red-2-1", "red-3-1"]]
});
assert.equal(Rummikub.play(rearrange, "host", [["red-1-1", "red-2-1", "red-3-1", "red-4-1"]]).ok, true);
assert.equal(rearrange.hands.host.length, 1);

const drawGame = playingGame({ hand: ["black-1-1"] });
drawGame.deck = [tile("orange-5-1")];
assert.equal(Rummikub.draw(drawGame, "host").ok, true);
assert.equal(drawGame.hands.host.length, 2);
assert.equal(drawGame.players[drawGame.turnIndex].id, "guest");

const exhausted = playingGame({ hand: ["black-1-1"] });
assert.equal(Rummikub.draw(exhausted, "host").ok, true);
assert.equal(Rummikub.draw(exhausted, "guest").ok, true);
assert.equal(exhausted.phase, "ended", "빈 더미에서 모두 차례를 넘기면 게임이 끝나야 합니다.");
assert.equal(exhausted.winnerId, "host", "손패 점수가 가장 낮은 사람이 승리해야 합니다.");

const winner = playingGame({ opened: true, hand: ["red-4-1"], board: [["red-1-1", "red-2-1", "red-3-1"]] });
assert.equal(Rummikub.play(winner, "host", [["red-1-1", "red-2-1", "red-3-1", "red-4-1"]]).ok, true);
assert.equal(winner.phase, "ended");
assert.equal(winner.winnerId, "host");

const htmlPath = path.resolve(__dirname, "..", "games", "rummikub", "rummikub.html");
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /allowedPlayerCounts:\[2,3,4\]/, "루미큐브는 2~4인을 지원해야 합니다.");
  assert.match(html, /RUMMIKUB_ACTION/, "서버 판정 방식으로 동작해야 합니다.");
  assert.match(html, /id="sortNumberBtn"/, "내 타일 숫자순 정렬 버튼이 있어야 합니다.");
  assert.match(html, /id="sortColorBtn"/, "내 타일 색상순 정렬 버튼이 있어야 합니다.");
  assert.match(html, /function compareRackTiles\(/, "내 타일 정렬 로직이 있어야 합니다.");
  assert.doesNotMatch(html, /joker|조커/i, "조커 규칙과 타일을 포함하면 안 됩니다.");
}
const server = fs.readFileSync(path.resolve(__dirname, "..", "game-hub-server", "server.js"), "utf8");
assert.match(server, /rummikub:\s*4/, "서버의 루미큐브 방 정원은 4명이어야 합니다.");
assert.match(server, /RUMMIKUB_ACTION/, "루미큐브 행동을 서버가 처리해야 합니다.");
assert.match(server, /Rummikub\.stateFor/, "플레이어별 비공개 상태를 전송해야 합니다.");

console.log("rummikub-unit: 104 tiles, groups, opening, rearrangement, draw, privacy and victory ok");
