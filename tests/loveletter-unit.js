"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const LoveLetter = require(path.resolve(__dirname, "..", "game-hub-server", "loveletter"));

function gameWithPlayers() {
    const game = LoveLetter.createGame("host", "방장");
    LoveLetter.addPlayer(game, "guest1", "하늘");
    LoveLetter.addPlayer(game, "guest2", "바다");
    return game;
}

function playingGame(hands, deck = [1, 2, 3]) {
    const game = gameWithPlayers();
    game.phase = "playing";
    game.round = 1;
    game.targetScore = 3;
    game.turnIndex = 0;
    game.deck = [...deck];
    game.setAside = 4;
    game.hands = {
        host: [...hands.host],
        guest1: [...hands.guest1],
        guest2: [...hands.guest2]
    };
    game.players.forEach(player => {
        player.alive = true;
        player.protected = false;
        player.discarded = [];
    });
    return game;
}

assert.equal(LoveLetter.BASE_DECK.length, 16, "클래식 덱은 16장이어야 합니다.");
assert.deepEqual(
    [...LoveLetter.BASE_DECK].sort((a, b) => a - b),
    [1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8],
    "카드별 수량이 클래식 규칙과 같아야 합니다."
);

const started = gameWithPlayers();
assert.equal(LoveLetter.startMatch(started, () => 0).ok, true);
assert.equal(started.targetScore, 3, "3인 게임은 하트 3개가 목표입니다.");
assert.equal(started.deck.length, 11, "비공개 1장, 시작 손패 3장, 첫 차례 드로우 1장을 제외해야 합니다.");
assert.equal(started.hands.host.length, 2, "첫 플레이어는 카드 두 장으로 차례를 시작합니다.");
assert.equal(started.hands.guest1.length, 1);

const fourPlayer = gameWithPlayers();
LoveLetter.addPlayer(fourPlayer, "guest3", "구름");
LoveLetter.startMatch(fourPlayer, () => 0);
assert.equal(fourPlayer.targetScore, 3, "4인 게임은 하트 3개가 목표입니다.");

const forcedQueen = playingGame({ host: [7, 5], guest1: [2], guest2: [3] });
assert.equal(
    LoveLetter.play(forcedQueen, "host", { card: 5, targetId: "host" }).ok,
    false,
    "왕자와 왕비를 함께 들고 있으면 왕비를 내야 합니다."
);
assert.equal(LoveLetter.play(forcedQueen, "host", { card: 7 }).ok, true);

const guard = playingGame({ host: [1, 2], guest1: [4], guest2: [6] });
assert.equal(LoveLetter.play(guard, "host", { card: 1, targetId: "guest1", guess: 4 }).ok, true);
assert.equal(guard.players.find(player => player.id === "guest1").alive, false, "근위병이 맞히면 대상이 탈락해야 합니다.");

const wizard = playingGame({ host: [2, 1], guest1: [6], guest2: [3] });
const wizardResult = LoveLetter.play(wizard, "host", { card: 2, targetId: "guest1" });
assert.equal(wizardResult.reveals.length, 1);
assert.equal(wizardResult.reveals[0].playerId, "host", "마법사 정보는 사용한 사람에게만 가야 합니다.");
assert.equal(wizardResult.reveals[0].card, 6);

const knight = playingGame({ host: [3, 7], guest1: [5], guest2: [2] });
const knightResult = LoveLetter.play(knight, "host", { card: 3, targetId: "guest1" });
assert.equal(knightResult.reveals.length, 2, "기사 비교 결과는 두 플레이어에게 각각 비밀로 보여야 합니다.");
assert.equal(knight.players.find(player => player.id === "guest1").alive, false);

const fairy = playingGame({ host: [4, 2], guest1: [1], guest2: [3] });
LoveLetter.play(fairy, "host", { card: 4 });
assert.equal(fairy.players.find(player => player.id === "host").protected, true, "요정을 내면 다음 자기 차례까지 보호되어야 합니다.");

const noTarget = playingGame({ host: [1, 2], guest1: [4], guest2: [6] });
noTarget.players.find(player => player.id === "guest1").protected = true;
noTarget.players.find(player => player.id === "guest2").protected = true;
LoveLetter.play(noTarget, "host", { card: 1, targetId: "guest1", guess: 4 });
assert.equal(noTarget.players.find(player => player.id === "guest1").alive, true, "보호된 플레이어에게 효과를 적용하면 안 됩니다.");

const prince = playingGame({ host: [5, 2], guest1: [8], guest2: [3] });
LoveLetter.play(prince, "host", { card: 5, targetId: "guest1" });
assert.equal(prince.players.find(player => player.id === "guest1").alive, false, "왕자로 공주를 버리게 하면 대상이 탈락해야 합니다.");

const princeSetAside = playingGame({ host: [5, 2], guest1: [3], guest2: [4] }, []);
princeSetAside.setAside = 6;
LoveLetter.play(princeSetAside, "host", { card: 5, targetId: "guest1" });
assert.equal(princeSetAside.players.find(player => player.id === "guest1").discarded.includes(3), true);
assert.equal(princeSetAside.revealedHands.guest1, 6, "더미가 비었으면 제외해 둔 카드로 왕자의 손패를 교체해야 합니다.");

const king = playingGame({ host: [6, 2], guest1: [7], guest2: [4] });
LoveLetter.play(king, "host", { card: 6, targetId: "guest1" });
assert.deepEqual(king.hands.host, [7]);
assert.equal(king.hands.guest1[0], 2, "왕은 두 플레이어의 남은 손패를 바꿔야 합니다.");

const princess = playingGame({ host: [8, 2], guest1: [5], guest2: [3] });
LoveLetter.play(princess, "host", { card: 8 });
assert.equal(princess.players.find(player => player.id === "host").alive, false, "공주를 직접 내도 탈락해야 합니다.");

const privacy = playingGame({ host: [2, 4], guest1: [6], guest2: [8] });
const hostView = LoveLetter.stateFor(privacy, "host");
assert.deepEqual(hostView.hand, [2, 4]);
assert.equal(hostView.players.some(player => Object.hasOwn(player, "hand")), false, "공개 상태에 다른 사람의 손패가 들어가면 안 됩니다.");
const guestView = LoveLetter.stateFor(privacy, "guest1");
assert.deepEqual(guestView.hand, [6], "각 플레이어에게 자기 손패만 전송해야 합니다.");

const projectRoot = path.resolve(__dirname, "..");
for (const file of ["guard.png", "wizard.png", "knight.png", "fairy.png", "prince.png", "king.png", "queen.png", "princess.png"]) {
    assert.equal(fs.existsSync(path.join(projectRoot, "assets", "images", "loveletter-cards", file)), true, `${file} 카드 이미지가 필요합니다.`);
}
const html = fs.readFileSync(path.join(projectRoot, "learning", "games", "loveletter", "loveletter.html"), "utf8");
assert.match(html, /allowedPlayerCounts:\[3,4\]/, "러브레터는 3~4인 전용이어야 합니다.");
assert.match(html, /sendServer\(\{type:"LOVELETTER_ACTION"/, "비밀 손패 게임은 서버 판정을 사용해야 합니다.");
const server = fs.readFileSync(path.join(projectRoot, "game-hub-server", "server.js"), "utf8");
assert.match(server, /loveletter:\s*4/, "서버의 러브레터 방 정원은 4명이어야 합니다.");
assert.match(server, /LOVELETTER_REVEAL/, "비밀 확인 결과는 대상 플레이어에게만 전송해야 합니다.");

console.log("loveletter-unit: deck, classroom scoring, card effects, hidden hands ok");
