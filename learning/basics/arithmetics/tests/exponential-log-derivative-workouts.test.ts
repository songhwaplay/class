import test from "node:test";
import assert from "node:assert/strict";
import {
  createExponentialLogDerivativeProblemSet,
  createExponentialLogDerivativeReviewProblems,
} from "../lib/exponential-log-derivative-workouts.ts";

test("지수·로그 미분은 원리가 다른 여섯 유형을 한 문제씩 만든다", () => {
  const problems = createExponentialLogDerivativeProblemSet(20260807).problems;
  assert.deepEqual(problems.map(({ kind }) => kind), [
    "natural-exponential-chain",
    "general-exponential-chain",
    "natural-log-chain",
    "general-log-chain",
    "polynomial-exponential-product",
    "logarithm-quotient",
  ]);
});

test("모든 문제는 서로 다른 네 보기와 정답 하나를 갖는다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createExponentialLogDerivativeProblemSet(seed).problems) {
      assert.equal(problem.choices.length, 4);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
      assert.ok(problem.answerLatex.startsWith("f^{\\prime}(x)="));
    }
  }
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const kinds = createExponentialLogDerivativeProblemSet(1).problems.map(({ kind }) => kind);
  const reviews = createExponentialLogDerivativeReviewProblems([kinds[0], kinds[0], kinds[4], kinds[5]], 2);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), [kinds[0], kinds[4]]);
});
