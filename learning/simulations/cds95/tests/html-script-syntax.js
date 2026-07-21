'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const file of ['public/index.html', 'public/teacher.html']) {
  const html = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) throw new Error(`${file}: 인라인 스크립트를 찾지 못했습니다.`);
  scripts.forEach((match, index) => new vm.Script(match[1], { filename:`${file}#script${index + 1}` }));
}
console.log(JSON.stringify({ ok:true, files:['public/index.html','public/teacher.html'] }));
