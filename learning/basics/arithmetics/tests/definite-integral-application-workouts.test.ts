import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefiniteIntegralApplicationReviews,
  createDefiniteIntegralApplicationSet,
} from "../lib/definite-integral-application-workouts.ts";

test("정적분의 활용은 넓이와 이동거리 여섯 유형을 만든다", () => {
  const set = createDefiniteIntegralApplicationSet(20260812);
  assert.deepEqual(set.problems.map(({ kind }) => kind), [
    "axis-crossing-area",
    "between-curves",
    "intersection-split",
    "linear-velocity-distance",
    "quadratic-velocity-distance",
    "position-total-distance",
  ]);
  for (const problem of set.problems) {
    assert.equal(problem.answers.length, 1);
    assert.ok(problem.answers[0] > 0);
    assert.ok(problem.prompt.length > 0);
  }
});

test("정적분 활용 보충 문제는 중복 유형을 제거한다", () => {
  const reviews = createDefiniteIntegralApplicationReviews(
    ["between-curves", "between-curves", "position-total-distance"],
    7,
  );
  assert.deepEqual(reviews.map(({ kind }) => kind), ["between-curves", "position-total-distance"]);
});

test("정적분 활용 문제는 같은 시드에서 재현된다", () => {
  assert.deepEqual(
    createDefiniteIntegralApplicationSet(19),
    createDefiniteIntegralApplicationSet(19),
  );
});
