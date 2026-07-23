import test from "node:test";
import assert from "node:assert/strict";
import {
  createTranscendentalIntegralProblemSet,
  createTranscendentalIntegralReviewProblems,
} from "../lib/transcendental-integral-workouts.ts";

test("여러 함수의 부정적분은 역미분 원리가 다른 여섯 유형을 만든다", () => {
  assert.deepEqual(createTranscendentalIntegralProblemSet(20260808).problems.map(({ kind }) => kind), [
    "natural-exponential", "general-exponential", "log-derivative",
    "sine-linear", "cosine-linear", "quadratic-substitution",
  ]);
});
test("모든 정답은 적분상수 C를 포함하고 네 보기는 중복되지 않는다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createTranscendentalIntegralProblemSet(seed).problems) {
      assert.match(problem.answerLatex, /\+C$/);
      assert.equal(problem.choices.length, 4);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    }
  }
});
test("오답 보충은 중복 유형을 제거하고 두 문제까지만 만든다", () => {
  const kinds = createTranscendentalIntegralProblemSet(1).problems.map(({ kind }) => kind);
  assert.deepEqual(createTranscendentalIntegralReviewProblems([kinds[0], kinds[0], kinds[5]], 2).map(({ kind }) => kind), [kinds[0], kinds[5]]);
});
