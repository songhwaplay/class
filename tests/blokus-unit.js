"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
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
const threePlayerStart = Blokus.startGame(threePlayer);
assert.equal(threePlayerStart.ok, false, "비대칭인 3인전은 시작할 수 없어야 합니다.");
assert.equal(threePlayer.phase, "lobby");
assert.match(threePlayerStart.error, /2명 또는 4명/);

const fourPlayer = Blokus.createGame("a", "하나");
Blokus.addPlayer(fourPlayer, "b", "두리");
Blokus.addPlayer(fourPlayer, "c", "세나");
Blokus.addPlayer(fourPlayer, "d", "네오");
assert.equal(Blokus.startGame(fourPlayer).ok, true);
assert.deepEqual(fourPlayer.turnColors, ["blue", "red", "yellow", "green"]);
assert.deepEqual(fourPlayer.turnColors.map(color => fourPlayer.colorOwners[color]), ["a", "b", "c", "d"]);

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

const htmlPath = path.resolve(__dirname, "..", "learning", "games", "blokus", "blokus.html");
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /allowedPlayerCounts:\s*\[2,\s*4\]/);
  assert.match(html, /BLOKUS_ACTION/);
  assert.match(html, /rotate|회전/i);
  assert.match(html, /flip|뒤집/i);
  assert.match(html, /function viewRotation\s*\(/, "플레이어별 보드 방향 계산이 필요합니다.");
  assert.match(html, /function toViewPoint\s*\(/, "서버 좌표를 화면 좌표로 변환해야 합니다.");
  assert.match(html, /function fromViewPoint\s*\(/, "화면에서 선택한 칸을 서버 좌표로 복원해야 합니다.");
  assert.match(html, /내 시작점이 왼쪽 아래/, "플레이어 시점 안내가 필요합니다.");
  assert.match(html, /assets\/images\/blokus-cover\.png/, "블로커스 표지 이미지를 사용해야 합니다.");
  assert.match(html, /assets\/sound\/blokus-bgm\.mp3/, "블로커스 배경음악을 사용해야 합니다.");
  assert.match(html, /assets\/sound\/music-control\.js/, "공통 음악 컨트롤을 연결해야 합니다.");
  assert.ok(fs.statSync(path.resolve(__dirname, "..", "assets", "images", "blokus-cover.webp")).size > 0);
  assert.ok(fs.statSync(path.resolve(__dirname, "..", "assets", "sound", "blokus-bgm.mp3")).size > 0);
  assert.doesNotMatch(html, /id=["']placeBtn["']/, "별도의 배치 확정 버튼이 없어야 합니다.");
  assert.match(
    html,
    /function selectBoardCell\s*\([^)]*\)\s*\{[\s\S]*?placeSelected\(\);/,
    "보드 칸을 클릭하면 즉시 배치를 요청해야 합니다."
  );
  const touchHelperSource = html.match(/function touchPressState\([^)]*\)\s*\{[\s\S]*?\n  \}/)?.[0];
  assert.ok(touchHelperSource, "터치 배치 상태 계산 함수가 필요합니다.");
  const touchPressState = vm.runInNewContext(`(${touchHelperSource})`);
  const firstTouch = touchPressState("touch", null, "0,19");
  assert.equal(firstTouch.touchLike, true);
  assert.equal(firstTouch.confirmedTouch, false, "첫 터치는 위치만 선택해야 합니다.");
  assert.equal(firstTouch.nextTouchKey, "0,19");
  const secondTouch = touchPressState("touch", firstTouch.nextTouchKey, "0,19");
  assert.equal(secondTouch.confirmedTouch, true, "같은 칸의 두 번째 터치가 배치를 확정해야 합니다.");
  assert.equal(secondTouch.nextTouchKey, null);
  const movedTouch = touchPressState("touch", "0,19", "1,19");
  assert.equal(movedTouch.confirmedTouch, false, "다른 칸을 터치하면 다시 첫 터치 상태여야 합니다.");
  assert.equal(movedTouch.nextTouchKey, "1,19");
  const mousePress = touchPressState("mouse", null, "0,19");
  assert.equal(mousePress.touchLike, false, "마우스는 터치 확인 단계를 거치지 않아야 합니다.");
  assert.equal(mousePress.nextTouchKey, null);
  assert.match(html, /같은 칸을 한 번 더 터치/, "터치 배치 확인 안내가 필요합니다.");
}

const server = fs.readFileSync(path.resolve(__dirname, "..", "game-hub-server", "server.js"), "utf8");
assert.match(server, /blokus:\s*4/);
assert.match(server, /BLOKUS_ACTION/);
assert.match(server, /Blokus\.stateFor/);

console.log("blokus-unit: 21 pieces, 89 squares, orientations, corner rules, turns, pass and scoring ok");
