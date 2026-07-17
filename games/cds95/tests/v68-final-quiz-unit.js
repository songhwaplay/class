'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const FinalQuiz = require(path.join(root, 'lib', 'final-quiz.js'));
const cities = JSON.parse(fs.readFileSync(path.join(root, 'data', 'catalog', 'original-cities.json'), 'utf8'));
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const student = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const teacher = fs.readFileSync(path.join(root, 'public', 'teacher.html'), 'utf8');

const regions = [...new Set(cities.map((city) => city.region))].sort();
assert.deepEqual(regions.sort(), Object.keys(FinalQuiz.REGIONAL_QUESTIONS).sort(), '225개 도시의 모든 지역에 지역 문항이 있어야 한다');

const forbiddenCue = /(항상|절대로|전혀|오직|반드시|완전히)/;
const restrictiveOnly = /(^|[\s'"‘“(])[^\s'"’”()]+만(?=$|[\s.,!?…'’”)\]])/u;
const calculationPassages = new Set();

for (let run = 0; run < 80; run += 1) {
  const city = cities[run % cities.length];
  const quiz = FinalQuiz.createFinalQuiz(city);
  assert.equal(quiz.questionCount, 3);
  assert.equal(quiz.questions.length, 3);
  assert.deepEqual(quiz.questions.map((question) => question.type), ['regional-reading', 'general-reading', 'calculation']);
  assert.equal(quiz.targetPlaceId, city.id);
  assert.equal(quiz.targetRegion, city.region);
  assert.match(quiz.questions[0].passage, new RegExp(city.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  for (const question of quiz.questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(Number.isInteger(question.answerIndex));
    assert.ok(question.answerIndex >= 0 && question.answerIndex < 4);
    assert.ok(question.passage.length > 20);
    assert.ok(question.prompt.length > 5);
    for (const choice of question.choices) {
      assert.doesNotMatch(choice, forbiddenCue, `선지에 정답 단서가 되는 극단 표현이 있다: ${choice}`);
      assert.doesNotMatch(choice, restrictiveOnly, `선지에 '~만' 단서가 있다: ${choice}`);
    }
  }

  const hidden = FinalQuiz.publicQuiz(quiz, false);
  assert.ok(hidden.questions.every((question) => !Object.hasOwn(question, 'answerIndex') && !Object.hasOwn(question, 'explanation')));
  const shown = FinalQuiz.publicQuiz(quiz, true);
  assert.ok(shown.questions.every((question) => Number.isInteger(question.answerIndex) && question.explanation));

  const correctAnswers = quiz.questions.map((question) => question.answerIndex);
  const result = FinalQuiz.grade(quiz, correctAnswers);
  assert.equal(result.correctCount, 3);
  assert.deepEqual(result.correct, [true, true, true]);
  assert.throws(() => FinalQuiz.grade(quiz, correctAnswers.slice(0, 2)), /세 문제/);
  calculationPassages.add(quiz.questions[2].passage);
}
assert.ok(calculationPassages.size >= 8, '계산 문제의 숫자와 유형이 게임마다 달라져야 한다');


for (const target of [
  { id: 'strait', name: '시험 해협', region: '가상 지역', category: '해협' },
  { id: 'islands', name: '시험 제도', region: '가상 지역', category: '제도' },
  { id: 'delta', name: '시험 삼각주', region: '가상 지역', category: '삼각주' },
  { id: 'mountain', name: '시험 산맥', region: '가상 지역', category: '산맥' }
]) {
  const quiz = FinalQuiz.createFinalQuiz(target);
  assert.equal(quiz.questions.length, 3);
  assert.match(quiz.questions[0].passage, new RegExp(target.name));
  for (const choice of quiz.questions[0].choices) {
    assert.doesNotMatch(choice, forbiddenCue);
    assert.doesNotMatch(choice, restrictiveOnly);
  }
}

assert.match(server, /finalQuiz: FinalQuiz\.createFinalQuiz\(target\)/);
assert.match(server, /socket\.on\('submitFinalQuiz'/);
assert.match(server, /b\.progress\.finalCorrectCount/);
assert.match(server, /a\.progress\.completedAt/);
assert.match(student, /3문제 제출하고 완주/);
assert.match(student, /missionProgress\?\.finalQuizStatus==='answering'/);
assert.match(teacher, /최종 문제 \$\{score\}\/3 정답/);

console.log(JSON.stringify({
  ok: true,
  regions: regions.length,
  questionCount: 3,
  generatedCalculationVariants: calculationPassages.size,
  ranking: ['정답 수 내림차순', '제출 완료 시각 오름차순']
}));
