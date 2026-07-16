const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('public/index.html', 'utf8');
assert.match(html, /#messageWindow\{[^}]*height:118px[^}]*padding:7px 12px 10px/);
assert.match(html, /#messageLines\{[^}]*grid-template-rows:repeat\(4,minmax\(17px,auto\)\)[^}]*gap:2px[^}]*line-height:1\.45/);
assert.match(html, /\.guideLine\{min-height:17px/);
assert.match(html, /\.actionPrompt\{bottom:142px\}/);
assert.match(html, /#messageWindow\{left:8px;right:8px;bottom:8px;height:106px/);
console.log('v48 message window layout ok');
