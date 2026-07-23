import assert from "node:assert/strict";
import test from "node:test";

import {
  createInequalityProblemSet,
  createInequalityReviewProblems,
  formatInequalitySolution,
  normalizeSolutionPieces,
} from "../lib/inequality-workouts.ts";

test("부등식 세트는 서로 다른 네 유형만 만든다", () => {
  const first = createInequalityProblemSet(20260725);
  const second = createInequalityProblemSet(20260725);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 4);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 4);
  first.problems.forEach((problem) => assert.ok(formatInequalitySolution(problem.solution).length > 2));
});

test("구간과 한 점은 입력 순서에 관계없이 같은 해집합으로 비교된다", () => {
  const first = [
    { kind: "interval" as const, left: 4, right: "inf" as const, leftClosed: true, rightClosed: false },
    { kind: "point" as const, value: 1 },
  ];
  assert.deepEqual(normalizeSolutionPieces([...first].reverse()), normalizeSolutionPieces(first));
});

test("오답 보충은 틀린 유형 중 최대 두 문제만 만든다", () => {
  const original = createInequalityProblemSet(17);
  const reviews = createInequalityReviewProblems(original.problems.map(({ kind }) => kind), 18);
  assert.equal(reviews.length, 2);
});
