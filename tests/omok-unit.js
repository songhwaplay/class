"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.resolve(__dirname, "..", "games", "omok", "omok.html"), "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, "오목에는 인라인 게임 스크립트가 하나 있어야 합니다.");

const context = vm.createContext({
    console,
    localStorage: { getItem: () => "" },
    document: { getElementById: () => null },
    window: { addEventListener() {} },
    setTimeout,
    clearTimeout
});
vm.runInContext(scripts[0][1], context, { filename: "omok-inline.js" });

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

assert.equal(winningLine([[7, 3], [7, 4], [7, 5], [7, 6]]).length, 0, "네 돌은 승리가 아닙니다.");
assert.equal(winningLine([[7, 3], [7, 4], [7, 5], [7, 6], [7, 7]]).length, 5, "가로 오목을 판정해야 합니다.");
assert.equal(winningLine([[2, 9], [3, 9], [4, 9], [5, 9], [6, 9]]).length, 5, "세로 오목을 판정해야 합니다.");
assert.equal(winningLine([[3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]).length, 5, "하향 대각선 오목을 판정해야 합니다.");
assert.equal(winningLine([[3, 11], [4, 10], [5, 9], [6, 8], [7, 7]]).length, 5, "상향 대각선 오목을 판정해야 합니다.");
assert.equal(winningLine([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]).length, 6, "금수 없는 간단 규칙에서는 장목도 승리입니다.");

const firstMatch = vm.runInContext("createInitialState({players:{host:{},guest:{}}},null)", context);
const blackVictory = { ...firstMatch, winner: 1 };
const afterBlackVictory = vm.runInContext(
    "createInitialState({players:{host:{},guest:{}}}," + JSON.stringify(blackVictory) + ")",
    context
);
const whiteVictory = { ...firstMatch, winner: 2 };
const afterWhiteVictory = vm.runInContext(
    "createInitialState({players:{host:{},guest:{}}}," + JSON.stringify(whiteVictory) + ")",
    context
);
const afterDraw = vm.runInContext(
    "createInitialState({players:{host:{},guest:{}}}," + JSON.stringify({ ...firstMatch, draw: true }) + ")",
    context
);
assert.deepEqual(Array.from(firstMatch.playerOrder), ["host", "guest"], "첫 대국은 방장이 흑이어야 합니다.");
assert.deepEqual(Array.from(afterBlackVictory.playerOrder), ["guest", "host"], "흑이 이기면 패배한 백이 다음 대국의 흑이어야 합니다.");
assert.deepEqual(Array.from(afterWhiteVictory.playerOrder), ["host", "guest"], "백이 이기면 패배한 흑이 다음 대국에서도 흑이어야 합니다.");
assert.deepEqual(Array.from(afterDraw.playerOrder), ["guest", "host"], "무승부면 흑백을 교대해야 합니다.");
assert.equal(afterBlackVictory.board.length, 225, "15×15 오목판을 만들어야 합니다.");
assert.equal(firstMatch.turnDeadline-firstMatch.hostNow, 15000, "각 차례의 제한 시간은 15초여야 합니다.");

console.log("omok-unit: win lines, 15-second timer, loser-first rematch ok");
