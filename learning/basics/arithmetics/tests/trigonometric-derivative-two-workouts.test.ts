import assert from "node:assert/strict";
import test from "node:test";

import {
  createTrigonometricDerivativeTwoChoices,
  createTrigonometricDerivativeTwoProblemSet,
  createTrigonometricDerivativeTwoReviewProblems,
  formatTrigonometricDerivativeTwoProblemLatex,
  formatTrigonometricDerivativeTwoTemplateLatex,
} from "../lib/trigonometric-derivative-two-workouts.ts";

test("삼각미분 2는 sec·csc·cot과 복합 두 유형을 한 문제씩 만든다", () => {
  const first = createTrigonometricDerivativeTwoProblemSet(20260729);
  const second = createTrigonometricDerivativeTwoProblemSet(20260729);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 5);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 5);
});

test("sec·csc·cot 합성미분의 계수와 부호를 정확히 계산한다", () => {
  for (const problem of createTrigonometricDerivativeTwoProblemSet(20260729).problems) {
    assert.match(formatTrigonometricDerivativeTwoProblemLatex(problem), /f\(x\)=/);
    assert.match(problem.answer.latex, /f\^\{\\prime\}/);

    if (problem.kind === "secant-chain") {
      assert.equal(problem.answer.coefficient, problem.coefficient * problem.rate);
      assert.equal(problem.answer.pattern, "sec·tan");
      assert.match(formatTrigonometricDerivativeTwoTemplateLatex(problem), /A\\cdot P/);
    } else if (problem.kind === "cosecant-chain") {
      assert.equal(problem.answer.coefficient, -problem.coefficient * problem.rate);
      assert.equal(problem.answer.pattern, "csc·cot");
    } else if (problem.kind === "cotangent-chain") {
      assert.equal(problem.answer.coefficient, -problem.coefficient * problem.rate);
      assert.equal(problem.answer.pattern, "csc²");
    }
  }
});

test("복합 두 유형은 실수 원인이 다른 네 선택지를 만든다", () => {
  for (const problem of createTrigonometricDerivativeTwoProblemSet(20260729).problems) {
    const choices = createTrigonometricDerivativeTwoChoices(problem);
    assert.equal(choices.length, 4);
    assert.equal(choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(choices.map(({ latex }) => latex)).size, 4);
    assert.ok(choices.every(({ latex }) => latex.length > 7));
    assert.ok(choices.some(({ misconception }) => misconception === "inner-derivative"));
    assert.ok(choices.some(({ misconception }) => misconception === "missing-term"));
    assert.deepEqual(createTrigonometricDerivativeTwoChoices(problem), choices);
  }
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createTrigonometricDerivativeTwoProblemSet(21);
  const reviews = createTrigonometricDerivativeTwoReviewProblems(original.problems.map(({ kind }) => kind), 22);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});
