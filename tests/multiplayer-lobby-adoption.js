"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const gamesRoot = path.resolve(__dirname, "..", "games");
const expectedMultiplayerGames = [
    "avalon",
    "davincicode",
    "fruitbell",
    "janggi",
    "nimgame",
    "omok",
    "setgame",
    "traverse"
];
const expectedSinglePlayerGames = ["coinweighing", "hanoitower", "sphinx"];

const ordinaryGames = fs.readdirSync(gamesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
        const file = path.join(gamesRoot, entry.name, `${entry.name}.html`);
        return fs.existsSync(file) ? { id: entry.name, file } : null;
    })
    .filter(Boolean);

const multiplayerGames = ordinaryGames.filter(({ file }) => {
    const html = fs.readFileSync(file, "utf8");
    return html.includes("ClassroomMultiplayerLobby.create") ||
        (html.includes("CREATE ROOM") && html.includes("JOIN ROOM"));
});
const singlePlayerGames = ordinaryGames.filter(game => !multiplayerGames.includes(game));

assert.deepEqual(
    multiplayerGames.map(game => game.id).sort(),
    expectedMultiplayerGames,
    "멀티플레이 게임 분류가 바뀌었습니다. 새 게임의 공통 로비 적용 여부를 확인한 뒤 목록을 갱신하세요."
);
assert.deepEqual(
    singlePlayerGames.map(game => game.id).sort(),
    expectedSinglePlayerGames,
    "싱글플레이 게임 분류가 바뀌었습니다. 게임 유형을 확인한 뒤 목록을 갱신하세요."
);

for (const { id, file } of multiplayerGames) {
    const html = fs.readFileSync(file, "utf8");
    const context = `${id} (${path.relative(gamesRoot, file)})`;

    assert.match(html, /multiplayer-lobby\.css/, `${context}: 공통 로비 CSS가 필요합니다.`);
    assert.match(html, /multiplayer-lobby\.js/, `${context}: 공통 로비 스크립트가 필요합니다.`);
    assert.match(html, /ClassroomMultiplayerLobby\.create\s*\(/, `${context}: 공통 로비 인스턴스가 필요합니다.`);
    assert.match(html, /id=["']missingScreen["']/, `${context}: 메인 화면 이름 안내가 필요합니다.`);

    assert.doesNotMatch(html, /ClassroomNetwork\.createSocket\s*\(/, `${context}: 개별 소켓 연결을 만들면 안 됩니다.`);
    assert.doesNotMatch(html, /new\s+WebSocket\s*\(/, `${context}: 개별 WebSocket 연결을 만들면 안 됩니다.`);
    assert.doesNotMatch(html, /type\s*:\s*["'](?:CREATE_ROOM|JOIN_ROOM)["']/, `${context}: 방 요청은 공통 로비가 전담해야 합니다.`);
    assert.doesNotMatch(
        html,
        /localStorage\.setItem\s*\(\s*(?:NAME_KEY|["']classPlayerName["'])/,
        `${context}: 이름 변경은 index 페이지에서만 허용됩니다.`
    );
}

const templateFile = path.join(gamesRoot, "_multiplayer-template", "multiplayer-game.html");
const template = fs.readFileSync(templateFile, "utf8");
assert.match(template, /multiplayer-lobby\.css/, "멀티플레이 템플릿에 공통 로비 CSS가 필요합니다.");
assert.match(template, /multiplayer-lobby\.js/, "멀티플레이 템플릿에 공통 로비 스크립트가 필요합니다.");
assert.match(template, /ClassroomMultiplayerLobby\.create\s*\(/, "멀티플레이 템플릿에 공통 로비 인스턴스가 필요합니다.");
assert.match(template, /createStartData\s*:/, "멀티플레이 템플릿에 시작 상태 생성 예제가 필요합니다.");
assert.match(template, /onGameMessage\s*:/, "멀티플레이 템플릿에 게임 메시지 처리 예제가 필요합니다.");
assert.match(template, /id=["']missingScreen["']/, "멀티플레이 템플릿에 메인 화면 이름 안내가 필요합니다.");
assert.doesNotMatch(template, /ClassroomNetwork\.createSocket\s*\(/, "멀티플레이 템플릿에서 개별 소켓을 만들면 안 됩니다.");
assert.doesNotMatch(template, /new\s+WebSocket\s*\(/, "멀티플레이 템플릿에서 개별 WebSocket을 만들면 안 됩니다.");
assert.doesNotMatch(
    template,
    /localStorage\.setItem\s*\(\s*(?:NAME_KEY|["']classPlayerName["'])/,
    "멀티플레이 템플릿에서 이름을 변경하면 안 됩니다."
);

console.log(
    `multiplayer-lobby-adoption: ${multiplayerGames.length} multiplayer, ` +
    `${singlePlayerGames.length} single-player, starter template ok`
);
