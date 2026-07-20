"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const gamePaths = [...indexHtml.matchAll(/href="(games\/[^"?#]+\.html)"/g)].map(match => match[1]);

assert.ok(gamePaths.length >= 16, "메인 화면에 연결된 게임 목록을 찾을 수 있어야 합니다.");

for (const relativePath of gamePaths) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  assert.match(html, /name="viewport"[^>]+viewport-fit=cover/, `${relativePath}: iPad 안전영역용 viewport-fit이 필요합니다.`);
  assert.match(html, /assets\/device-game\.css/, `${relativePath}: 공통 크롬북·태블릿·휴대폰 스타일을 불러와야 합니다.`);
}

const deviceCss = fs.readFileSync(path.join(root, "assets", "device-game.css"), "utf8");
assert.match(deviceCss, /pointer:\s*coarse/, "터치 기기용 규칙이 필요합니다.");
assert.match(deviceCss, /max-height:\s*800px/, "저높이 크롬북용 규칙이 필요합니다.");
assert.match(deviceCss, /min-height:\s*44px/, "주요 터치 버튼은 최소 44px이어야 합니다.");

console.log(`device-layout-contract: ${gamePaths.length} linked games cover Chromebook, iPad, tablet and phone baselines`);
