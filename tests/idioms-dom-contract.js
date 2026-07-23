"use strict";

const assert = require("node:assert");
const fs = require("node:fs");

const html = fs.readFileSync("learning/academics/classical-chinese-idioms/index.html", "utf8");
const app = fs.readFileSync("learning/academics/classical-chinese-idioms/app.js", "utf8");
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
assert.ok(!/탐험대|뜻만 외우지 말고|이야기 박사|멋진 도전/.test(html + app), "과장된 홍보 문구를 사용하지 않습니다.");
assert.ok(root.includes('href="learning/academics/classical-chinese-idioms/index.html"'), "메인 학습 메뉴에 고사성어 링크가 필요합니다.");

console.log(`idioms DOM contract: ok (${htmlIds.length} ids)`);
