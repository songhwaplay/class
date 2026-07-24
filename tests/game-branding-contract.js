"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const index = read("index.html");
const indexVisibleText = index
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ");

const indexLabels = [
  ["과일 종 대결", "Fruit Bell"],
  ["육목", "Connect Six"],
  ["궁정 추리", "Court Deduction"],
  ["숫자 타일", "Number Tiles"],
  ["코너 블록", "Corner Blocks"],
  ["패턴 3장", "Pattern Trio"],
  ["숫자 암호", "Number Code"],
  ["도형 건너기", "Shape Crossing"],
  ["원정대 추리", "Quest Deduction"],
  ["라스트 카드", "Last Card"]
];

for (const [ko, en] of indexLabels) {
  assert.ok(index.includes(`<strong>${ko}</strong>`), `index: ${ko} 명칭이 필요합니다.`);
  assert.ok(index.includes(`<small>(${en})</small>`), `index: ${en} 영문명이 필요합니다.`);
}

assert.doesNotMatch(
  indexVisibleText,
  /할리갈리|Halli Galli|러브레터|Love Letter|루미큐브|Rummikub|블로커스|Blokus|다빈치 코드|Da Vinci Code|트래버스|Traverse|레지스탕스|The Resistance|Connect6|<strong>세트<\/strong>/i,
  "index에는 기존 상품명을 노출하면 안 됩니다."
);

const pageContracts = [
  ["learning/games/fruitbell/fruitbell.html", /FRUIT BELL/, /과일 종 대결/],
  ["learning/games/connect6/connect6.html", /CONNECT SIX/, /<title>육목 · 온라인 대전<\/title>/],
  ["learning/games/loveletter/loveletter.html", /궁정 추리/, /Court Deduction/],
  ["learning/games/rummikub/rummikub.html", /숫자 타일/, /NUMBER TILES/],
  ["learning/games/blokus/blokus.html", /코너 블록/, /CORNER BLOCKS/],
  ["learning/games/setgame/setgame.html", /PATTERN TRIO/, /pattern3-bg\.webp/],
  ["learning/games/davincicode/davincicode.html", /NUMBER CODE/, /숫자 암호/],
  ["learning/games/traverse/traverse.html", /SHAPE CROSSING/, /도형 건너기/],
  ["learning/games/avalon/avalon.html", /QUEST DEDUCTION/, /원정대 추리/],
  ["learning/games/lastcard/lastcard.html", /LAST/, /라스트 카드/]
];

for (const [relative, ...patterns] of pageContracts) {
  const html = read(relative);
  patterns.forEach(pattern => assert.match(html, pattern, `${relative}: 새 독자 명칭이 필요합니다.`));
}

const visibleLobbyEnglishTitles = [
  ["learning/games/omok/omok.html", /<p class="subtitle">FIVE IN A ROW · 2 PLAYERS<\/p>/],
  ["learning/games/janggi/janggi.html", /<div class="sub">KOREAN CHESS · 1대1 대국<\/div>/],
  ["learning/games/diamondgame/diamondgame.html", /<p class="subtitle">DIAMOND GAME · 2–3 PLAYERS<\/p>/],
  ["learning/games/loveletter/loveletter.html", /<p class="subtitle">COURT DEDUCTION · 3–4 PLAYERS<\/p>/],
  ["learning/games/drawrelay/drawrelay.html", /<div class="hero-note">DRAW RELAY · 4–8 PLAYERS · 모두 동시에 진행<\/div>/]
];

for (const [relative, titlePattern] of visibleLobbyEnglishTitles) {
  assert.match(read(relative), titlePattern, `${relative}: the lobby must visibly pair its English title with the Korean title.`);
}

const patternTrio = read("learning/games/setgame/setgame.html");
assert.doesNotMatch(patternTrio, /youtube\.com|youtu\.be/, "패턴 3장은 외부 상품 규칙 영상을 사용하면 안 됩니다.");
assert.match(patternTrio, /\["triangle", "hexagon", "circle"\]/, "패턴 3장은 독자 도형 구성을 사용해야 합니다.");
assert.match(patternTrio, /\["blue", "orange", "teal"\]/, "패턴 3장은 독자 색상 구성을 사용해야 합니다.");

const quest = read("learning/games/avalon/avalon.html");
assert.match(quest, /Merlin:"예언자"/, "원정대 추리의 역할명을 독자화해야 합니다.");
assert.match(quest, /Assassin:"추격자"/, "원정대 추리의 역할명을 독자화해야 합니다.");
assert.match(quest, /roleCardTitleOverlay/, "기존 카드 이미지의 제목을 독자 역할명으로 가려야 합니다.");
assert.match(quest, /applyQuestRules\(\)/, "원정대 추리의 규칙 설명을 독자 문구로 교체해야 합니다.");

const questCardDir = path.join(root, "assets", "images", "avalon-cards");
const questRoleCardFiles = fs.readdirSync(questCardDir).filter(name =>
  /^(role-card-back|merlin-|percival-|assassin-|morgana-|mordred-|oberon-|loyal-servant-|minion-)/.test(name)
);
assert.equal(questRoleCardFiles.length, 25, "원정대 추리 역할 카드 25장이 모두 있어야 합니다.");
const questRoleCardHashes = new Set(questRoleCardFiles.map(name =>
  crypto.createHash("sha256").update(fs.readFileSync(path.join(questCardDir, name))).digest("hex")
));
assert.equal(questRoleCardHashes.size, 1, "원정대 추리 역할 카드는 독자 제작한 공통 카드 아트를 사용해야 합니다.");

const lastCard = `${read("learning/games/lastcard/lastcard.html")}\n${read("learning/games/lastcard/cards.css")}\n${read("learning/games/lastcard/game.js")}`;
assert.doesNotMatch(lastCard, /\bUNO\b/i, "라스트 카드에는 기존 상품명을 노출하면 안 됩니다.");
assert.match(lastCard, /EMBER/, "라스트 카드는 독자 색상 체계를 사용해야 합니다.");
assert.match(lastCard, /SHIFT/, "라스트 카드는 독자 액션 명칭을 사용해야 합니다.");

const server = read("game-hub-server/server.js");
assert.doesNotMatch(server, /러브레터 방|루미큐브 방|블로커스 방|아발론 방|수업용 아발론/, "서버 안내에도 기존 상품명을 노출하면 안 됩니다.");

console.log("game-branding-contract: 10 independent game brands and server messages ok");
