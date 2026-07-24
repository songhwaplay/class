import assert from "node:assert/strict";
import test from "node:test";

import { determinantInverseProblems } from "../lib/determinant-inverse-workouts.ts";

test("행렬식과 역행렬의 필수 계산을 다룬다", () => {
  assert.equal(determinantInverseProblems.length, 7);
  assert.ok(determinantInverseProblems.some(({ label }) => label === "역행렬과 연립방정식"));
  assert.ok(determinantInverseProblems.some(({ label }) => label === "역행렬의 행렬식"));
  for (const problem of determinantInverseProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});
