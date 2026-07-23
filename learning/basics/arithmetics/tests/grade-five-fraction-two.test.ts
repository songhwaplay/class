import assert from "node:assert/strict";
import test from "node:test";

import { greatestCommonDivisor } from "../lib/grade-five-fraction-one.ts";
import { createGradeFiveFractionTwoSet } from "../lib/grade-five-fraction-two.ts";

test("5분수②는 원본 순서의 열 문제를 만든다", () => {
  const problemSet = createGradeFiveFractionTwoSet(20260721);
  assert.equal(problemSet.problems.length, 10);
  assert.deepEqual(problemSet.problems.map((problem) => problem.kind), [
    "mixed-addition",
    "mixed-addition",
    "mixed-subtraction",
    "mixed-subtraction",
    "mixed-three-factor-product",
    "mixed-three-factor-product",
    "mixed-three-factor-product",
    "mixed-three-factor-product",
    "mixed-combination",
    "mixed-combination",
  ]);
  assert.deepEqual(createGradeFiveFractionTwoSet(20260721), problemSet);
});

test("모든 분수와 답은 올바른 범위이고 답은 기약분수나 대분수이다", () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    for (const problem of createGradeFiveFractionTwoSet(seed).problems) {
      for (const operand of problem.operands) {
        assert.ok(operand.numerator > 0);
        assert.ok(operand.numerator < operand.denominator);
        if (operand.kind === "mixed") assert.ok(operand.whole > 0);
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

test("3번과 4번은 분수 부분에서 받아내림이 필요한 뺄셈이다", () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    for (const problem of createGradeFiveFractionTwoSet(seed).problems.slice(2, 4)) {
      const [left, right] = problem.operands;
      assert.ok(left.numerator * right.denominator < right.numerator * left.denominator);
      const answerUnits = problem.answer.whole * problem.answer.denominator + problem.answer.numerator;
      assert.ok(answerUnits > 0);
    }
  }
});

test("마지막 두 혼합 계산도 항상 양수 답을 만든다", () => {
  for (let seed = 1; seed <= 500; seed += 1) {
    for (const problem of createGradeFiveFractionTwoSet(seed).problems.slice(8)) {
      const answerUnits = problem.answer.whole * problem.answer.denominator + problem.answer.numerator;
      assert.ok(answerUnits > 0);
      assert.deepEqual(problem.operators, ["+", "−"]);
    }
  }
});
