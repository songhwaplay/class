import assert from "node:assert/strict";
import test from "node:test";

import {
  createGradeFiveFractionOneSet,
  greatestCommonDivisor,
  toMixedFraction,
} from "../lib/grade-five-fraction-one.ts";

test("5분수①은 원본 순서의 열 문제를 만든다", () => {
  const problemSet = createGradeFiveFractionOneSet(20260721);
  assert.equal(problemSet.problems.length, 10);
  assert.deepEqual(problemSet.problems.map((problem) => problem.kind), [
    "addition",
    "addition",
    "subtraction",
    "subtraction",
    "three-fraction-product",
    "three-fraction-product",
    "three-fraction-product",
    "three-fraction-product",
    "fraction-natural-product",
    "fraction-natural-product",
  ]);
  assert.deepEqual(createGradeFiveFractionOneSet(20260721), problemSet);
});

test("모든 피연산 분수와 답은 올바른 범위이고 답은 기약분수나 대분수이다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createGradeFiveFractionOneSet(seed).problems) {
      for (const operand of problem.operands) {
        if (operand.kind === "natural") {
          assert.ok(operand.value >= 2);
          continue;
        }
        assert.ok(operand.numerator > 0);
        assert.ok(operand.numerator < operand.denominator);
      }
      assert.ok(problem.answer.whole >= 0);
      assert.ok(problem.answer.numerator >= 0);
      assert.ok(problem.answer.numerator < problem.answer.denominator);
      if (problem.answer.numerator > 0) {
        assert.equal(greatestCommonDivisor(problem.answer.numerator, problem.answer.denominator), 1);
      }
    }
  }
});

test("자연수와 대분수 표기로 정확히 약분한다", () => {
  assert.deepEqual(toMixedFraction(12, 6), { whole: 2, numerator: 0, denominator: 1 });
  assert.deepEqual(toMixedFraction(17, 6), { whole: 2, numerator: 5, denominator: 6 });
  assert.deepEqual(toMixedFraction(3, 8), { whole: 0, numerator: 3, denominator: 8 });
});

test("뺄셈 문제의 결과는 항상 양수이다", () => {
  for (let seed = 1; seed <= 500; seed += 1) {
    for (const problem of createGradeFiveFractionOneSet(seed).problems.slice(2, 4)) {
      const answerUnits = problem.answer.whole * problem.answer.denominator + problem.answer.numerator;
      assert.ok(answerUnits > 0);
    }
  }
});
