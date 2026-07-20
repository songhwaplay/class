"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Blokus = require(path.resolve(__dirname, "..", "game-hub-server", "blokus"));

assert.equal(Blokus.PIECES.length, 21, "한 색은 서로 다른 21개 조각으로 구성되어야 합니다.");
assert.equal(
  Blokus.PIECES.reduce((sum, piece) => sum + piece.cells.length, 0),
  89,
  "한 색의 조각은 모두 89칸이어야 합니다."
);
assert.equal(new Set(Blokus.PIECES.map(piece => piece.id)).size, 21);
assert.equal(Blokus.ORIENTATIONS.I1.length, 1);
assert.equal(Blokus.ORIENTATIONS.I2.length, 2);
assert.equal(Blokus.ORIENTATIONS.X5.length, 1);
assert.equal(Blokus.ORIENTATIONS.F5.length, 8);
const freeShapeSignatures = Blokus.PIECES.map(piece =>
  Blokus.ORIENTATIONS[piece.id]
    .map(cells => cells.map(cell => `${cell.x},${cell.y}`).join(";"))
    .sort()[0]
);
assert.equal(new Set(freeShapeSignatures).size, 21, "회전·반전했을 때 서로 같은 조각이 중복되면 안 됩니다.");

const twoPlayer = Blokus.createGame("host", "가람");
Blokus.addPlayer(twoPlayer, "guest", "누리");
assert.equal(Blokus.startGame(twoPlayer).ok, true);
assert.deepEqual(twoPlayer.turnColors, ["blue", "red", "yellow", "green"]);
assert.equal(twoPlayer.colorOwners.blue, "host");
assert.equal(twoPlayer.colorOwners.yellow, "host", "2인전에서는 서로 마주 보는 두 색을 한 명이 맡아야 합니다.");
assert.equal(twoPlayer.colorOwners.red, "guest");
assert.equal(twoPlayer.colorOwners.green, "guest");

assert.equal(
  Blokus.validatePlacement(twoPlayer, "blue", "I2", [{ x: 1, y: 0 }, { x: 2, y: 0 }]).ok,
  false,
  "첫 조각은 시작 모서리를 덮어야 합니다."
);
assert.equal(Blokus.place(twoPlayer, "host", "I2", [{ x: 0, y: 0 }, { x: 1, y: 0 }]).ok, true);
assert.equal(twoPlayer.turnColorIndex, 1);
assert.equal(Blokus.place(twoPlayer, "host", "I1", [{ x: 19, y: 0 }]).ok, false, "차례가 아닌 사람은 둘 수 없습니다.");
assert.equal(Blokus.place(twoPlayer, "guest", "I1", [{ x: 19, y: 0 }]).ok, true);

twoPlayer.turnColorIndex = 0;
assert.equal(
  Blokus.validatePlacement(twoPlayer, "blue", "I1", [{ x: 2, y: 0 }]).ok,
  false,
  "같은 색 조각끼리는 변이 닿을 수 없습니다."
);
assert.equal(
  Blokus.validatePlacement(twoPlayer, "blue", "I1", [{ x: 2, y: 1 }]).ok,
  true,
  "같은 색 조각은 모서리로 이어져야 합니다."
);
assert.equal(
  Blokus.validatePlacement(twoPlayer, "blue", "I2", [{ x: 2, y: 1 }, { x: 2, y: 2 }]).ok,
  false,
  "이미 사용한 조각은 다시 놓을 수 없습니다."
);

const threePlayer = Blokus.createGame("a", "하나");
Blokus.addPlayer(threePlayer, "b", "두리");
Blokus.addPlayer(threePlayer, "c", "세나");
Blokus.startGame(threePlayer);
assert.deepEqual(threePlayer.turnColors, ["blue", "red", "yellow"]);
assert.equal(Blokus.stateFor(threePlayer, "a").placements.length, 0);
assert.equal(Blokus.stateFor(threePlayer, "a").remaining.blue.length, 21);
assert.equal(Blokus.stateFor(threePlayer, "a").activePlayerId, "a");

const blocked = Blokus.createGame("host", "가람");
Blokus.addPlayer(blocked, "guest", "누리");
Blokus.startGame(blocked);
blocked.turnColors = ["blue"];
blocked.colorOwners = { blue: "host" };
blocked.remaining = { blue: ["I1"] };
blocked.passed = { blue: false };
blocked.placedCount = { blue: 0 };
blocked.lastPiece = { blue: null };
blocked.placements = [{
  color: "red",
  pieceId: "blocked-board",
  order: 0,
  cells: Array.from({ length: 400 }, (_, index) => ({ x: index % 20, y: Math.floor(index / 20) }))
}];
assert.equal(Blokus.firstLegalPlacement(blocked, "blue"), null);
assert.equal(Blokus.pass(blocked, "host").ok, true);
assert.equal(blocked.phase, "ended");

const perfect = Blokus.createGame("host", "가람");
Blokus.addPlayer(perfect, "guest", "누리");
Blokus.startGame(perfect);
perfect.turnColors = ["blue"];
perfect.colorOwners = { blue: "host" };
perfect.remaining = { blue: ["I1"] };
perfect.passed = { blue: false };
perfect.placedCount = { blue: 0 };
perfect.lastPiece = { blue: null };
assert.equal(Blokus.place(perfect, "host", "I1", [{ x: 0, y: 0 }]).ok, true);
assert.equal(perfect.phase, "ended");
assert.equal(Blokus.colorScore(perfect, "blue"), 20, "한 칸 조각을 마지막으로 모두 놓으면 20점입니다.");

const htmlPath = path.resolve(__dirname, "..", "games", "blokus", "blokus.html");
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /allowedPlayerCounts:\s*\[2,\s*3,\s*4\]/);
  assert.match(html, /BLOKUS_ACTION/);
  assert.match(html, /rotate|회전/i);
  assert.match(html, /flip|뒤집/i);
}

const server = fs.readFileSync(path.resolve(__dirname, "..", "game-hub-server", "server.js"), "utf8");
assert.match(server, /blokus:\s*4/);
assert.match(server, /BLOKUS_ACTION/);
assert.match(server, /Blokus\.stateFor/);

console.log("blokus-unit: 21 pieces, 89 squares, orientations, corner rules, turns, pass and scoring ok");
