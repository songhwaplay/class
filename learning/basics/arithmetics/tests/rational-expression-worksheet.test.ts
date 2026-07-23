import assert from "node:assert/strict";
import test from "node:test";

import {
  createRationalExpressionChoices,
  createRationalExpressionProblemSet,
  createRationalExpressionReviewProblems,
  evaluateRationalExpression,
  evaluateRationalFraction,
  formatRationalExpression,
  formatRationalPolynomial,
} from "../lib/rational-expression-worksheets.ts";

test("각 분수식 문제는 서로 다른 네 개의 실제 오답 보기를 만든다", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const problem of createRationalExpressionProblemSet(seed).problems) {
      const choices = createRationalExpressionChoices(problem);
      assert.equal(choices.length, 4);
      assert.equal(choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(choices.map(({ latex }) => latex)).size, 4);
      assert.deepEqual(
        new Set(choices.map(({ misconception }) => misconception)),
        new Set(["correct", "reciprocal", "factor-sign", "operation-omission"]),
      );
    }
  }
});

test("한 세트는 서로 다른 분수식 함정 네 문제만 만든다", () => {
  const first = createRationalExpressionProblemSet(20260721);
  const second = createRationalExpressionProblemSet(20260721);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 4);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 4);
});

test("모든 생성 문제의 기약식은 원래 분수식과 같은 값을 갖는다", () => {
  const problemSet = createRationalExpressionProblemSet(20260721);
  for (const problem of problemSet.problems) {
    for (const x of [-7, -6, 0, 6, 7]) {
      if (problem.restrictions.includes(x)) continue;
      assert.ok(Math.abs(
        evaluateRationalExpression(problem, x) - evaluateRationalFraction(problem.answer, x),
      ) < 1e-10, `${problem.kind} failed at x=${x}`);
    }
  }
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createRationalExpressionProblemSet(17);
  const reviews = createRationalExpressionReviewProblems(original.problems.map(({ kind }) => kind), 18);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});

test("다항식과 분수식은 학생이 읽는 형태로 표기한다", () => {
  assert.equal(formatRationalPolynomial([1, -5, 6]), "x² − 5x + 6");
  assert.equal(formatRationalPolynomial([0, 1, -3]), "x − 3");
  assert.equal(formatRationalPolynomial([0, 0, -2]), "−2");
  const problem = createRationalExpressionProblemSet(20260721).problems[0];
  assert.match(formatRationalExpression(problem.operations), / × /);
  assert.match(formatRationalExpression(problem.operations), /x²/);
});
