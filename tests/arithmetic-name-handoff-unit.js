'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];

assert.ok(scripts.length > 0, '인덱스 인라인 스크립트를 찾지 못했습니다.');
scripts.forEach((match, index) => new vm.Script(match[1], { filename: `index.html#script${index + 1}` }));
assert.match(html, /href="\/arithmetic"/);
assert.match(html, /href="\/hanguksa"/);
assert.match(html, /href="https:\/\/world-voyage-classroom\.onrender\.com\/"/);
assert.doesNotMatch(html, /<a href="\/arithmetic"[^>]*data-player-handoff=/);

console.log(JSON.stringify({ ok: true, handoff: 'index-to-arithmetic' }));
