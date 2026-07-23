import assert from "node:assert/strict";
import test from "node:test";

import {
  combinePolynomialOperations,
  createPolynomialChoices,
  createPolynomialProblemSet,
  createPolynomialReviewProblems,
  formatPolynomial,
  formatPolynomialExpression,
  multiplyPolynomials,
} from "../lib/polynomial-worksheets.ts";

test("다항식의 곱과 복합식은 차수별 계수를 정확히 계산한다", () => {
  assert.deepEqual(
    multiplyPolynomials([0, 0, 2, -3], [0, 1, 4, -1]),
    [2, 5, -14, 3],
  );
  assert.deepEqual(combinePolynomialOperations([
    { kind: "square", multiplier: 2, base: [0, 0, 3, -1] },
    { kind: "product", multiplier: -1, left: [0, 0, 1, 2], right: [0, 0, 4, -3] },
    { kind: "scaled", multiplier: -3, polynomial: [0, 1, -2, 5] },
  ]), [0, 11, -11, -7]);
});

test("각 다항식 문제는 계산 실수 유형이 다른 네 선택지를 만든다", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const problem of createPolynomialProblemSet(seed).problems) {
      const choices = createPolynomialChoices(problem);
      assert.equal(choices.length, 4);
      assert.equal(choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(choices.map(({ latex }) => latex)).size, 4);
      assert.deepEqual(
        new Set(choices.map(({ misconception }) => misconception)),
        new Set([
          "correct",
          "sign-distribution",
          "omitted-operation",
          problem.kind === "linear-times-quadratic" ? "degree-alignment" : "missing-cross-term",
        ]),
      );
    }
  }
});

test("한 세트는 서로 다른 함정 네 문제만 내고 같은 seed에서 재현된다", () => {
  const first = createPolynomialProblemSet(20260721);
  const second = createPolynomialProblemSet(20260721);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 4);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 4);
  first.problems.forEach((problem) => {
    assert.deepEqual(problem.answer, combinePolynomialOperations(problem.operations));
  });
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createPolynomialProblemSet(17);
  const reviews = createPolynomialReviewProblems(original.problems.map(({ kind }) => kind), 18);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});

test("복합 전개식과 정리된 다항식을 자연스럽게 표기한다", () => {
  assert.equal(formatPolynomial([3, 0, -2, 3]), "3x³ − 2x + 3");
  assert.equal(formatPolynomial([0, 1, 0, -1]), "x² − 1");
  assert.equal(formatPolynomial([-1, 0, 1, 0]), "−x³ + x");
  assert.equal(formatPolynomial([0, 0, 0, 0]), "0");
  assert.equal(formatPolynomialExpression([
    { kind: "square", multiplier: 2, base: [0, 0, 3, -1] },
    { kind: "product", multiplier: -1, left: [0, 0, 1, 2], right: [0, 0, 4, -3] },
    { kind: "scaled", multiplier: -3, polynomial: [0, 1, -2, 5] },
  ]), "2(3x − 1)² − (x + 2)(4x − 3) − 3(x² − 2x + 5)");
});
