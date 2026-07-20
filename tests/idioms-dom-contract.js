"use strict";

const assert = require("node:assert");
const fs = require("node:fs");

const html = fs.readFileSync("idioms/index.html", "utf8");
const app = fs.readFileSync("idioms/app.js", "utf8");
const root = fs.readFileSync("index.html", "utf8");

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
assert.deepStrictEqual(duplicateIds, [], `중복된 HTML id: ${duplicateIds.join(", ")}`);

const idSet = new Set(htmlIds);
const referencedIds = [...app.matchAll(/byId\("([^"]+)"\)/g)].map((match) => match[1]);
const missingIds = [...new Set(referencedIds.filter((id) => !idSet.has(id)))];
assert.deepStrictEqual(missingIds, [], `app.js에서 참조하지만 HTML에 없는 id: ${missingIds.join(", ")}`);

["idioms-data.js", "idioms-core.js", "app.js"].forEach((file) => {
    assert.ok(html.includes(`src="${file}"`), `${file} 스크립트 연결이 필요합니다.`);
});
assert.ok(fs.existsSync("idioms/og.png"), "공유 미리보기 이미지가 필요합니다.");
assert.ok(html.includes('property="og:image" content="og.png"'), "공유 미리보기 메타 태그가 필요합니다.");
assert.ok(root.includes('href="idioms/index.html"'), "메인 학습 메뉴에 고사성어 링크가 필요합니다.");

console.log(`idioms DOM contract: ok (${htmlIds.length} ids)`);
