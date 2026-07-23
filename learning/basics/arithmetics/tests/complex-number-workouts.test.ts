import assert from "node:assert/strict";
import test from "node:test";
import {
  createComplexProblemSet,
  createComplexReviewProblems,
  sameComplexAnswer,
} from "../lib/complex-number-workouts.ts";

test("복소수 한 세트는 반복 가치가 다른 핵심 다섯 유형을 한 문제씩 만든다", () => {
  const set = createComplexProblemSet(20260723);
  assert.equal(set.problems.length, 5);
  assert.deepEqual(
    new Set(set.problems.map(({ kind }) => kind)).size,
    5,
  );
});

test("모든 복소수 문제는 정수 실수부와 허수부 정답을 갖는다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createComplexProblemSet(seed).problems) {
      assert.ok(Number.isInteger(problem.answer.real));
      assert.ok(Number.isInteger(problem.answer.imaginary));
      assert.equal(
        sameComplexAnswer(String(problem.answer.real), String(problem.answer.imaginary), problem.answer),
        true,
      );
    }
  }
});

test("단순 덧셈 대신 제곱 전개와 i² 정리가 필요한 복합 계산을 만든다", () => {
  for (let seed = 1; seed <= 50; seed += 1) {
    const problem = createComplexProblemSet(seed).problems.find(({ kind }) => kind === "mixed-calculation");
    assert.ok(problem);
    assert.match(problem.latex, /\}\)\^2|\\right\)\^2/);
  }
});

test("나눗셈 문제는 제시된 분자를 복원하는 정확한 몫을 만든다", () => {
  for (let seed = 1; seed <= 50; seed += 1) {
    const problem = createComplexProblemSet(seed).problems.find(({ kind }) => kind === "divide");
    assert.ok(problem);
    assert.match(problem.latex, /^\\frac/);
    assert.notEqual(problem.answer.imaginary, 0);
  }
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const reviews = createComplexReviewProblems(["multiply", "divide", "multiply"], 31);
  assert.equal(reviews.length, 2);
  assert.deepEqual(reviews.map(({ kind }) => kind), ["multiply", "divide"]);
});
