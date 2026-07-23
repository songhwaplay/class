import assert from "node:assert/strict";
import test from "node:test";

import {
  createEquationChoices,
  createEquationProblemSet,
  createEquationReviewProblems,
  formatEquationExpression,
  normalizeSolutionSet,
} from "../lib/equation-workouts.ts";

test("같은 시드로 네 가지 방정식 유형을 재현한다", () => {
  const first = createEquationProblemSet(20260724);
  assert.deepEqual(first, createEquationProblemSet(20260724));
  assert.equal(first.problems.length, 4);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 4);
  first.problems.forEach((problem) => assert.ok(formatEquationExpression(problem.expression).includes("=")));
});

test("해는 순서와 중복에 관계없이 같은 집합으로 정리한다", () => {
  assert.deepEqual(normalizeSolutionSet([5, 0]), [0, 5]);
  assert.deepEqual(normalizeSolutionSet([2, -1, 2, -2, 1]), [-2, -1, 1, 2]);
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createEquationProblemSet(17);
  const reviews = createEquationReviewProblems(original.problems.map(({ kind }) => kind), 18);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});

test("모든 문제는 서로 다른 4개 선택지와 정답 하나를 가진다", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const problem of createEquationProblemSet(seed).problems) {
      const choices = createEquationChoices(problem);
      assert.equal(choices.length, 4);
      assert.equal(choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(choices.map(({ answers }) => JSON.stringify(answers))).size, 4);
    }
  }
});
