import assert from "node:assert/strict";
import test from "node:test";

import {
  compareFractions,
  createGradeFiveFractionThreeSet,
} from "../lib/grade-five-fraction-three.ts";

test("5분수③은 원본의 열 가지 비교 전략 순서를 유지한다", () => {
  const problemSet = createGradeFiveFractionThreeSet(20260721);
  assert.equal(problemSet.problems.length, 10);
  assert.deepEqual(problemSet.problems.map((problem) => problem.kind), [
    "common-numerator",
    "intuitive",
    "hard-estimate",
    "common-numerator",
    "improper",
    "close-complement",
    "hard-estimate",
    "close-complement",
    "unit-fraction",
    "common-denominator",
  ]);
  assert.deepEqual(createGradeFiveFractionThreeSet(20260721), problemSet);
});

test("모든 비교 기호는 교차 곱으로 구한 정확한 답이다", () => {
  for (let seed = 1; seed <= 300; seed += 1) {
    for (const problem of createGradeFiveFractionThreeSet(seed).problems) {
      assert.ok(problem.left.numerator > 0);
      assert.ok(problem.left.denominator > 0);
      assert.ok(problem.right.numerator > 0);
      assert.ok(problem.right.denominator > 0);
      assert.notEqual(problem.answer, "=");
      assert.equal(problem.answer, compareFractions(problem.left, problem.right));
    }
  }
});

test("분자 통분과 직관 비교 문제는 전략이 눈에 보이게 만들어진다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const problems = createGradeFiveFractionThreeSet(seed).problems;
    for (const problem of [problems[0], problems[3]]) {
      const larger = Math.max(problem.left.numerator, problem.right.numerator);
      const smaller = Math.min(problem.left.numerator, problem.right.numerator);
      assert.equal(larger % smaller, 0);
    }

    const intuitive = problems[1];
    const leftDominates = intuitive.left.numerator > intuitive.right.numerator
      && intuitive.left.denominator < intuitive.right.denominator;
    const rightDominates = intuitive.right.numerator > intuitive.left.numerator
      && intuitive.right.denominator < intuitive.left.denominator;
    assert.ok(leftDominates || rightDominates);
  }
});

test("대분수·보수·단위분수·분모 통분 문제도 원본 특징을 지킨다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const problems = createGradeFiveFractionThreeSet(seed).problems;
    assert.ok(problems[4].left.numerator > problems[4].left.denominator);
    assert.ok(problems[4].right.numerator > problems[4].right.denominator);
    assert.ok(problems[5].left.numerator < problems[5].left.denominator);
    assert.ok(problems[5].right.numerator < problems[5].right.denominator);
    assert.ok(problems[7].left.numerator > problems[7].left.denominator);
    assert.ok(problems[7].right.numerator > problems[7].right.denominator);

    const unit = problems[8];
    const unitRelation = unit.left.denominator === unit.right.denominator * 2
      ? unit.left.numerator === unit.right.numerator * 2 - 1
      : unit.right.denominator === unit.left.denominator * 2
        && unit.right.numerator === unit.left.numerator * 2 - 1;
    assert.ok(unitRelation);

    const commonDenominator = problems[9];
    const denominatorRatio = commonDenominator.left.denominator * 3 === commonDenominator.right.denominator * 7
      || commonDenominator.right.denominator * 3 === commonDenominator.left.denominator * 7;
    assert.ok(denominatorRatio);
  }
});
