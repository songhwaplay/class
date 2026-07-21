"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.resolve(__dirname, "..", "learning", "games", "connect6", "connect6.html"), "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, "육목에는 인라인 게임 스크립트가 하나 있어야 합니다.");

const context = vm.createContext({
    console,
    localStorage: { getItem: () => "" },
    document: { getElementById: () => null },
    window: { addEventListener() {} },
    setTimeout,
    clearTimeout
});
vm.runInContext(scripts[0][1], context, { filename: "connect6-inline.js" });

function winningLine(stones) {
    const expression = [
        "(() => {",
        "const board = emptyBoard();",
        "const stones = " + JSON.stringify(stones) + ";",
        "stones.forEach(([row, col]) => { board[boardIndex(row, col)] = 1; });",
        "const last = stones.at(-1);",
        "return findWinningLine(board, last[0], last[1], 1);",
        "})()"
    ].join("");
    return vm.runInContext(expression, context);
}

assert.equal(winningLine([[9, 3], [9, 4], [9, 5], [9, 6], [9, 7]]).length, 0, "다섯 개는 육목 승리가 아닙니다.");
assert.equal(winningLine([[9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8]]).length, 6, "가로 육목을 판정해야 합니다.");
assert.equal(winningLine([[2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10]]).length, 6, "세로 육목을 판정해야 합니다.");
assert.equal(winningLine([[3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8]]).length, 6, "대각선 육목을 판정해야 합니다.");
assert.equal(winningLine([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]]).length, 7, "육목 이상도 승리입니다.");

const firstMatch = vm.runInContext("createInitialState({players:{host:{},guest:{}}},null)", context);
assert.equal(firstMatch.board.length, 361, "19×19 육목판이어야 합니다.");
assert.equal(firstMatch.turn, 0);
assert.equal(firstMatch.stonesRemaining, 1, "흑의 첫 차례에는 돌 한 개만 놓아야 합니다.");
assert.equal(firstMatch.turnDeadline - firstMatch.hostNow, 20000, "한 차례 제한 시간은 20초여야 합니다.");

const openingNow = 100000;
const afterOpening = vm.runInContext(
    "createPlacementState(" + JSON.stringify(firstMatch) + ",9,9," + openingNow + ")",
    context
);
assert.equal(afterOpening.turn, 1, "흑의 첫 수 뒤에는 백 차례여야 합니다.");
assert.equal(afterOpening.stonesRemaining, 2, "첫 수 이후에는 한 차례에 두 개를 놓아야 합니다.");
assert.equal(afterOpening.openingMove, false);
assert.equal(afterOpening.turnDeadline, openingNow + 20000);

const whiteFirstNow = openingNow + 3000;
const afterWhiteFirst = vm.runInContext(
    "createPlacementState(" + JSON.stringify(afterOpening) + ",8,8," + whiteFirstNow + ")",
    context
);
assert.equal(afterWhiteFirst.turn, 1, "첫 번째 돌을 둔 뒤에도 같은 플레이어 차례여야 합니다.");
assert.equal(afterWhiteFirst.stonesRemaining, 1);
assert.equal(afterWhiteFirst.turnDeadline, afterOpening.turnDeadline, "두 번째 돌을 둘 때 제한 시간을 다시 늘리면 안 됩니다.");

const whiteSecondNow = openingNow + 6000;
const afterWhiteSecond = vm.runInContext(
    "createPlacementState(" + JSON.stringify(afterWhiteFirst) + ",8,9," + whiteSecondNow + ")",
    context
);
assert.equal(afterWhiteSecond.turn, 0, "두 번째 돌 뒤에는 상대 차례로 넘어가야 합니다.");
assert.equal(afterWhiteSecond.stonesRemaining, 2);
assert.equal(afterWhiteSecond.turnDeadline, whiteSecondNow + 20000);

const blackVictory = { ...firstMatch, winner: 1 };
const afterBlackVictory = vm.runInContext(
    "createInitialState({players:{host:{},guest:{}}}," + JSON.stringify(blackVictory) + ")",
    context
);
assert.deepEqual(Array.from(afterBlackVictory.playerOrder), ["guest", "host"], "재대국은 직전 패배자가 흑이어야 합니다.");

assert.match(html, /allowedPlayerCounts:\[2\]/, "육목은 2인 전용이어야 합니다.");
assert.match(html, /grid-template-columns:repeat\(19,1fr\)/, "화면에 19줄 판을 표시해야 합니다.");
assert.doesNotMatch(html, /localStorage\.setItem\s*\(/, "이름 변경은 인덱스에서만 허용해야 합니다.");

console.log("connect6-unit: 19x19 board, one-stone opening, two-stone turns, six-in-a-row ok");
