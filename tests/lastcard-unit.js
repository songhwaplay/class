"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const LastCard = require(path.resolve(__dirname, "..", "game-hub-server", "lastcard"));

function number(id, color, value) {
  return { id, color, kind: "number", value };
}

function action(id, color, kind) {
  return { id, color, kind, value: kind };
}

function gameWithPlayers(count = 3) {
  const game = LastCard.createGame("host", "방장");
  for (let index = 1; index < count; index += 1) {
    LastCard.addPlayer(game, `guest${index}`, `학생${index}`);
  }
  return game;
}

function playingGame(count = 3) {
  const game = gameWithPlayers(count);
  game.phase = "playing";
  game.round = 1;
  game.turnIndex = 0;
  game.direction = 1;
  game.activeColor = "ember";
  game.discard = [number("top", "ember", 5)];
  game.deck = [
    number("draw-a", "tide", 1),
    number("draw-b", "leaf", 2),
    number("draw-c", "volt", 3),
    number("draw-d", "tide", 4)
  ];
  game.hands = Object.fromEntries(game.players.map(player => [player.id, []]));
  return game;
}

assert.equal(LastCard.buildDeck().length, 68, "라스트 카드 기본 덱은 68장이어야 합니다.");
assert.equal(new Set(LastCard.buildDeck().map(card => card.id)).size, 68, "모든 카드 ID는 고유해야 합니다.");

const started = gameWithPlayers(4);
assert.equal(LastCard.startMatch(started, () => 0).ok, true);
assert.equal(started.phase, "playing");
assert.equal(started.players.every(player => started.hands[player.id].length === 7), true);
assert.equal(started.discard.length, 1);
assert.equal(started.discard[0].kind, "number", "첫 공개 카드는 숫자 카드여야 합니다.");
assert.equal(started.deck.length, 39, "4명에게 7장씩 나눠주고 첫 카드 1장을 공개해야 합니다.");

assert.equal(LastCard.isPlayable(number("same-color", "ember", 9), number("top", "ember", 5), "ember"), true);
assert.equal(LastCard.isPlayable(number("same-number", "tide", 5), number("top", "ember", 5), "ember"), true);
assert.equal(LastCard.isPlayable(number("miss", "tide", 9), number("top", "ember", 5), "ember"), false);
assert.equal(LastCard.isPlayable({ id: "shift", color: "shift", kind: "shift", value: "shift" }, number("top", "ember", 5), "ember"), true);

const skip = playingGame();
skip.hands.host = [action("skip", "ember", "skip"), number("keep", "tide", 8)];
assert.equal(LastCard.playCard(skip, "host", { cardId: "skip", callLast: true }).ok, true);
assert.equal(skip.turnIndex, 2, "SKIP은 다음 플레이어를 건너뛰어야 합니다.");

const turnTwo = playingGame(2);
turnTwo.hands.host = [action("turn", "ember", "turn"), number("keep", "leaf", 8)];
LastCard.playCard(turnTwo, "host", { cardId: "turn", callLast: true });
assert.equal(turnTwo.direction, -1);
assert.equal(turnTwo.turnIndex, 0, "2인 게임의 TURN은 카드를 낸 플레이어에게 다시 차례가 와야 합니다.");

const drawTwo = playingGame();
drawTwo.hands.host = [action("draw2", "ember", "draw2"), number("keep", "leaf", 8)];
drawTwo.hands.guest1 = [number("g1", "tide", 2)];
LastCard.playCard(drawTwo, "host", { cardId: "draw2", callLast: true }, () => 0);
assert.equal(drawTwo.hands.guest1.length, 3, "+2 대상은 카드 두 장을 받아야 합니다.");
assert.equal(drawTwo.turnIndex, 2, "+2 대상의 차례는 건너뛰어야 합니다.");

const missedLast = playingGame();
missedLast.hands.host = [number("play", "ember", 7), number("keep", "leaf", 8)];
LastCard.playCard(missedLast, "host", { cardId: "play", callLast: false }, () => 0);
assert.equal(missedLast.hands.host.length, 3, "LAST 선언을 놓치면 카드 두 장을 받아야 합니다.");

const calledLast = playingGame();
calledLast.hands.host = [number("play", "ember", 7), number("keep", "leaf", 8)];
LastCard.playCard(calledLast, "host", { cardId: "play", callLast: true }, () => 0);
assert.equal(calledLast.hands.host.length, 1, "LAST 선언에 성공하면 한 장만 남아야 합니다.");

const shifted = playingGame();
shifted.hands.host = [
  { id: "shift", color: "shift", kind: "shift", value: "shift" },
  number("keep", "leaf", 8)
];
assert.equal(LastCard.playCard(shifted, "host", { cardId: "shift" }).ok, false, "SHIFT 색상을 반드시 골라야 합니다.");
assert.equal(LastCard.playCard(shifted, "host", { cardId: "shift", color: "tide", callLast: true }).ok, true);
assert.equal(shifted.activeColor, "tide");

const winner = playingGame();
winner.hands.host = [number("last", "ember", 1)];
LastCard.playCard(winner, "host", { cardId: "last" });
assert.equal(winner.phase, "finished");
assert.equal(winner.winnerId, "host");

const privacy = playingGame();
privacy.hands.host = [number("mine", "ember", 2)];
privacy.hands.guest1 = [number("secret", "tide", 3)];
const hostState = LastCard.stateFor(privacy, "host");
assert.equal(hostState.hand[0].id, "mine");
assert.equal(hostState.players.some(player => Object.hasOwn(player, "hand")), false, "공개 상태에 상대 손패가 포함되면 안 됩니다.");
assert.equal(hostState.players.find(player => player.id === "guest1").handCount, 1);

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "learning", "games", "lastcard", "lastcard.html"), "utf8");
const client = fs.readFileSync(path.join(root, "learning", "games", "lastcard", "game.js"), "utf8");
assert.match(client, /ClassroomMultiplayerLobby\.create\s*\(/, "라스트 카드는 공통 멀티플레이 로비를 사용해야 합니다.");
assert.match(client, /allowedPlayerCounts:\s*\[2,3,4\]/, "라스트 카드는 2~4인용이어야 합니다.");
assert.match(html, /multiplayer-lobby\.js/, "라스트 카드 화면은 공통 멀티플레이 로비를 불러와야 합니다.");
const server = fs.readFileSync(path.join(root, "game-hub-server", "server.js"), "utf8");
assert.match(server, /lastcard:\s*4/, "서버의 라스트 카드 정원은 4명이어야 합니다.");
assert.match(server, /LASTCARD_ACTION/, "서버가 라스트 카드 행동을 처리해야 합니다.");

console.log("lastcard-unit: deck, actions, LAST penalty, privacy and victory ok");
