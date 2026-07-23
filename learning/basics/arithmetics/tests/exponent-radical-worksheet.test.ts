import assert from "node:assert/strict";
import test from "node:test";

import {
  createExponentRadicalChoices,
  createExponentRadicalProblemSet,
  createExponentRadicalReviewProblems,
  formatExponentRadicalAnswer,
  formatExponentRadicalExpression,
  reduceRadical,
  superscript,
} from "../lib/exponent-radical-worksheets.ts";

test("같은 시드로 네 가지 지수·근호 유형을 재현한다", () => {
  const first = createExponentRadicalProblemSet(20260723);
  assert.deepEqual(first, createExponentRadicalProblemSet(20260723));
  assert.equal(first.problems.length, 4);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 4);
});

test("근호 안의 제곱인수를 밖으로 정확히 꺼낸다", () => {
  assert.deepEqual(reduceRadical(18), { outside: 3, inside: 2 });
  assert.deepEqual(reduceRadical(75), { outside: 5, inside: 3 });
  assert.deepEqual(reduceRadical(14), { outside: 1, inside: 14 });
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createExponentRadicalProblemSet(17);
  const reviews = createExponentRadicalReviewProblems(original.problems.map(({ kind }) => kind), 18);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});

test("모든 문제는 서로 다른 4개 선택지와 정답 하나를 가진다", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const problem of createExponentRadicalProblemSet(seed).problems) {
      const choices = createExponentRadicalChoices(problem);
      assert.equal(choices.length, 4);
      assert.equal(choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(choices.map(({ answer }) => JSON.stringify(answer))).size, 4);
    }
  }
});

test("문제와 답을 읽기 쉬운 수학식으로 표시한다", () => {
  assert.equal(superscript(-23), "⁻²³");
  for (const problem of createExponentRadicalProblemSet(20260723).problems) {
    assert.ok(formatExponentRadicalExpression(problem.expression).length > 5);
    assert.ok(formatExponentRadicalAnswer(problem.answer).length > 1);
  }
});
