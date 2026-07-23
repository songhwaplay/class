import assert from "node:assert/strict";
import test from "node:test";

import {
  createDerivativeProblemSet,
  createDerivativeReviewProblems,
  formatDerivativeAnswer,
  formatDerivativeAnswerLatex,
  formatDerivativeProblem,
  formatDerivativeProblemLatex,
  formatDerivativeTemplate,
  formatDerivativeTemplateLatex,
} from "../lib/derivative-workouts.ts";

test("미분 세트는 반복 가치가 있는 네 유형만 만든다", () => {
  const first = createDerivativeProblemSet(20260727);
  const second = createDerivativeProblemSet(20260727);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 4);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 4);
});

test("곱·몫·지수로그·삼각함수 미분 계수를 정확히 계산한다", () => {
  const problems = createDerivativeProblemSet(20260727).problems;
  for (const problem of problems) {
    assert.equal(problem.answer.length, problem.kind === "product-chain" || problem.kind === "quotient-simplify" ? 3 : 2);
    assert.ok(formatDerivativeProblem(problem).length > 8);
    assert.ok(formatDerivativeTemplate(problem).includes("f′(x)"));
    assert.ok(formatDerivativeAnswer(problem).length > 8);
    assert.match(formatDerivativeProblemLatex(problem), /f\(x\)=/);
    assert.match(formatDerivativeTemplateLatex(problem), /f\^\{\\prime\}/);
    assert.match(formatDerivativeAnswerLatex(problem), /f\^\{\\prime\}/);
  }
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createDerivativeProblemSet(17);
  const reviews = createDerivativeReviewProblems(original.problems.map(({ kind }) => kind), 18);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), original.problems.slice(0, 2).map(({ kind }) => kind));
});
