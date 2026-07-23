import assert from "node:assert/strict";
import test from "node:test";

import { greatestCommonDivisor } from "../lib/grade-five-fraction-one.ts";
import { createGradeSixFractionSet } from "../lib/grade-six-fraction.ts";

function fractionValue(operand: { kind: "fraction"; numerator: number; denominator: number }) {
  return operand.numerator / operand.denominator;
}

test("6분수는 원본 순서대로 열 문제를 만든다", () => {
  const set = createGradeSixFractionSet(20260721);
  assert.equal(set.problems.length, 10);
  assert.deepEqual(set.problems.map((problem) => problem.kind), [
    "addition",
    "addition",
    "subtraction",
    "subtraction",
    "three-factor-product",
    "three-factor-product",
    "three-factor-product",
    "three-factor-product",
    "fraction-division-natural",
    "fraction-natural-product",
  ]);
  assert.deepEqual(createGradeSixFractionSet(20260721), set);
});

test("모든 분수 피연산자는 진분수이고 답은 기약분수·대분수·자연수다", () => {
  for (let seed = 1; seed <= 250; seed += 1) {
    for (const problem of createGradeSixFractionSet(seed).problems) {
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

test("뺄셈의 왼쪽 분수는 오른쪽 분수보다 크다", () => {
  for (let seed = 1; seed <= 250; seed += 1) {
    for (const problem of createGradeSixFractionSet(seed).problems.slice(2, 4)) {
      const [left, right] = problem.operands;
      assert.equal(left.kind, "fraction");
      assert.equal(right.kind, "fraction");
      if (left.kind === "fraction" && right.kind === "fraction") {
        assert.ok(fractionValue(left) > fractionValue(right));
      }
    }
  }
});

test("세 수의 곱셈과 마지막 두 문제는 정확한 값을 만든다", () => {
  const naturalPositions = [0, 1, 2, 0];
  for (let seed = 1; seed <= 250; seed += 1) {
    const problems = createGradeSixFractionSet(seed).problems;
    problems.slice(4, 8).forEach((problem, index) => {
      assert.equal(problem.operands.filter((operand) => operand.kind === "natural").length, 1);
      assert.equal(problem.operands[naturalPositions[index]].kind, "natural");
      const expected = problem.operands.reduce((product, operand) => (
        product * (operand.kind === "natural" ? operand.value : operand.numerator / operand.denominator)
      ), 1);
      const actual = problem.answer.whole + problem.answer.numerator / problem.answer.denominator;
      assert.ok(Math.abs(expected - actual) < 1e-12);
    });

    const division = problems[8];
    const product = problems[9];
    const [divisionFraction, divisor] = division.operands;
    const [productFraction, multiplier] = product.operands;
    assert.equal(divisionFraction.kind, "fraction");
    assert.equal(divisor.kind, "natural");
    assert.equal(productFraction.kind, "fraction");
    assert.equal(multiplier.kind, "natural");
    if (divisionFraction.kind === "fraction" && divisor.kind === "natural") {
      const expected = fractionValue(divisionFraction) / divisor.value;
      const actual = division.answer.whole + division.answer.numerator / division.answer.denominator;
      assert.ok(Math.abs(expected - actual) < 1e-12);
    }
    if (productFraction.kind === "fraction" && multiplier.kind === "natural") {
      const expected = fractionValue(productFraction) * multiplier.value;
      const actual = product.answer.whole + product.answer.numerator / product.answer.denominator;
      assert.ok(Math.abs(expected - actual) < 1e-12);
    }
  }
});
