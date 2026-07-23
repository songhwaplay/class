'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'teacher.html'), 'utf8');
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
assert(html.includes(".filter(item=>item.pr.status!=='completed')"), '완료자를 교사 지도에서 제외하는 필터가 없습니다.');
assert(html.includes('완료자는 순위표에만 표시되며 지도에서는 숨김'), '지도 숨김 안내가 없습니다.');
assert(!html.includes('지도에서 자유 탐험 중인 위치를 볼 수 있습니다.'), '완료자 위치 공개 안내가 남아 있습니다.');
assert(html.includes('도착 순위'), '완료 순위표가 유지되지 않았습니다.');
console.log(JSON.stringify({ ok: true, test: 'teacher-map-completed-hidden-unit' }));
