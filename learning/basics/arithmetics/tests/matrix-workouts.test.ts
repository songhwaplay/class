import assert from "node:assert/strict";
import test from "node:test";

import { matrixProblems } from "../lib/matrix-workouts.ts";

test("공통수학1 행렬 학습지는 필수 기본 연산을 빠짐없이 다룬다", () => {
  assert.equal(matrixProblems.length, 7);
  assert.deepEqual(
    matrixProblems.map(({ label }) => label),
    [
      "행렬의 성분",
      "행렬의 덧셈",
      "행렬의 뺄셈",
      "행렬의 실수배",
      "행렬의 곱셈",
      "행렬의 곱의 성분",
      "행렬 방정식",
    ],
  );
  for (const problem of matrixProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("공통수학1 행렬 학습지는 심화 선형대수 내용을 섞지 않는다", () => {
  const content = JSON.stringify(matrixProblems);
  assert.doesNotMatch(content, /역행렬|행렬식|케일리|단위행렬/);
});
