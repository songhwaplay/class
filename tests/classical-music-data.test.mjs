import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(
  new URL('../learning/arts/classical-music/app.js', import.meta.url),
  'utf8',
);
const dataSource = `${source.slice(0, source.indexOf('const $=s=>'))}
globalThis.__musicAudit = { pieces, allQuestions };`;
const context = vm.createContext({ encodeURIComponent, Math, Set });
vm.runInContext(dataSource, context);
const { pieces, allQuestions } = context.__musicAudit;

test('every classical piece owns exactly ten internally consistent questions', () => {
  assert.equal(pieces.length, 30);
  assert.equal(allQuestions.length, 300);

  for (const piece of pieces) {
    const questions = allQuestions.filter((question) => question.piece.no === piece.no);
    assert.equal(questions.length, 10, `${piece.no} ${piece.title}`);

    for (const question of questions) {
      assert.equal(question.choices.length, 3, question.id);
      assert.equal(new Set(question.choices).size, 3, question.id);
      assert.equal(question.choices[question.correct], question.answer, question.id);
      assert.match(question.explain, new RegExp(piece.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  }
});

test('corrected score facts remain attached to the intended works', () => {
  const byNo = Object.fromEntries(pieces.map((piece) => [piece.no, piece]));

  assert.match(byNo['06'].tempo, /Allegro/);
  assert.match(byNo['09'].meter, /^2박자/);
  assert.match(byNo['10'].tempo, /Andante/);
  assert.equal(byNo['12'].era, 'romantic');
  assert.match(byNo['15'].meter, /^12\/8박자/);
  assert.match(byNo['16'].lead, /피아노 네 손 원곡/);
  assert.match(byNo['19'].lead, /두 대의 피아노/);
  assert.match(byNo['20'].lead, /피아노 원곡/);
  assert.match(byNo['21'].tempo, /Largo/);
  assert.match(byNo['23'].meter, /^9\/8박자/);
  assert.match(byNo['24'].meter, /^2박자/);
  assert.match(byNo['28'].tempo, /Allegretto/);
});
