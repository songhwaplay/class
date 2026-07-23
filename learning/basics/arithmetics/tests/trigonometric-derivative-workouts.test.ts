import assert from "node:assert/strict";
import test from "node:test";

import {
  createTrigonometricDerivativeChoices,
  createTrigonometricDerivativeProblemSet,
  createTrigonometricDerivativeReviewProblems,
  formatTrigonometricDerivativeAnswer,
  formatTrigonometricDerivativeAnswerLatex,
  formatTrigonometricDerivativeProblem,
  formatTrigonometricDerivativeProblemLatex,
} from "../lib/trigonometric-derivative-workouts.ts";

test("삼각함수 미분 세트는 반복 가치가 다른 다섯 유형을 한 문제씩 만든다", () => {
  const first = createTrigonometricDerivativeProblemSet(20260728);
  const second = createTrigonometricDerivativeProblemSet(20260728);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 5);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 5);
});

test("각 유형은 안쪽 미분과 삼각함수 부호까지 정확히 계산한다", () => {
  for (const problem of createTrigonometricDerivativeProblemSet(20260728).problems) {
    if (problem.kind === "sin-cos-chain") {
      assert.deepEqual(problem.answer.coefficients, [problem.sineCoefficient * problem.sineRate, -problem.cosineCoefficient * problem.cosineRate]);
      assert.deepEqual(problem.answer.functions, ["cos", "sin"]);
    } else if (problem.kind === "tangent-chain") {
      assert.deepEqual(problem.answer.coefficients, [problem.coefficient * problem.rate]);
      assert.deepEqual(problem.answer.functions, ["sec²"]);
    } else if (problem.kind === "trigonometric-power") {
      const sign = problem.trig === "sin" ? 1 : -1;
      assert.deepEqual(problem.answer.coefficients, [sign * problem.coefficient * problem.power * problem.rate]);
      assert.deepEqual(problem.answer.functions, [problem.trig === "sin" ? "cos" : "sin"]);
    } else if (problem.kind === "polynomial-product") {
      const sign = problem.trig === "sin" ? 1 : -1;
      assert.deepEqual(problem.answer.coefficients, [problem.coefficient * problem.power, sign * problem.coefficient * problem.rate]);
      assert.deepEqual(problem.answer.functions, [problem.trig, problem.trig === "sin" ? "cos" : "sin"]);
    } else {
      const sign = problem.trig === "sin" ? 1 : -1;
      assert.deepEqual(problem.answer.coefficients, [sign * problem.coefficient * problem.rate, -problem.coefficient * problem.power]);
      assert.deepEqual(problem.answer.functions, [problem.trig === "sin" ? "cos" : "sin", problem.trig]);
    }

    assert.ok(formatTrigonometricDerivativeProblem(problem).length > 7);
    assert.ok(formatTrigonometricDerivativeAnswer(problem).length > 7);
    assert.match(formatTrigonometricDerivativeProblemLatex(problem), /f\(x\)=/);
    assert.match(formatTrigonometricDerivativeAnswerLatex(problem), /f\^\{\\prime\}/);
  }
});

test("오답 보충은 틀린 삼각함수 유형 중 최대 두 문제만 만든다", () => {
  const original = createTrigonometricDerivativeProblemSet(11);
  const reviews = createTrigonometricDerivativeReviewProblems(original.problems.map(({ kind }) => kind), 12);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});

test("모든 유형은 실제 실수 원인이 다른 네 개의 선택지를 만든다", () => {
  for (const problem of createTrigonometricDerivativeProblemSet(20260728).problems) {
    const choices = createTrigonometricDerivativeChoices(problem);
    assert.equal(choices.length, 4);
    assert.equal(choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(choices.map(({ latex }) => latex)).size, 4);
    assert.ok(choices.every(({ latex }) => latex.length > 7));

    const misconceptions = new Set(choices.map(({ misconception }) => misconception));
    assert.ok(misconceptions.has("correct"));
    assert.ok(misconceptions.has("inner-derivative"));
    assert.ok(misconceptions.has("sign"));
    const fourthMisconception = {
      "sin-cos-chain": "function-rule",
      "tangent-chain": "function-rule",
      "trigonometric-power": "power-rule",
      "polynomial-product": "missing-term",
      "trigonometric-quotient": "denominator-power",
    }[problem.kind];
    assert.ok(misconceptions.has(fourthMisconception));
    assert.deepEqual(createTrigonometricDerivativeChoices(problem), choices);
  }
});
