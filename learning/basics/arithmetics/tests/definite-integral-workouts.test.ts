import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefiniteIntegralProblemSet,
  createDefiniteIntegralReviewProblems,
} from "../lib/definite-integral-workouts.ts";

test("정적분 계산은 서로 다른 원리의 일곱 유형을 만든다", () => {
  const set = createDefiniteIntegralProblemSet(20260810);
  assert.equal(set.problems.length, 7);
  assert.deepEqual(set.problems.map(({ kind }) => kind), [
    "polynomial",
    "symmetry",
    "absolute-value",
    "piecewise",
    "exponential",
    "trigonometric",
    "area",
  ]);
  for (const problem of set.problems) {
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.ok(problem.prompt.length > 0);
  }
});

test("정적분 오답 보충은 중복 유형을 제거하고 두 문제까지만 만든다", () => {
  const reviews = createDefiniteIntegralReviewProblems(
    ["absolute-value", "absolute-value", "area"],
    17,
  );
  assert.deepEqual(reviews.map(({ kind }) => kind), ["absolute-value", "area"]);
});

test("정적분 문제 생성은 같은 시드에서 재현된다", () => {
  assert.deepEqual(
    createDefiniteIntegralProblemSet(41),
    createDefiniteIntegralProblemSet(41),
  );
});
