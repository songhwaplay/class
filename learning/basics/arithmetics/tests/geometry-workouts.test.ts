import test from "node:test";
import assert from "node:assert/strict";
import {
  conicProblems,
  conicMoveTangentProblems,
  planeVectorProblems,
  projectionProblems,
  vectorGeometryProblems,
  spaceCoordinateProblems,
} from "../lib/geometry-workouts.ts";

test("covers the geometry workout sequence without duplicate answers", () => {
  const sets = [
    conicProblems,
    conicMoveTangentProblems,
    planeVectorProblems,
    projectionProblems,
    vectorGeometryProblems,
    spaceCoordinateProblems,
  ];
  for (const problems of sets) {
    assert.equal(problems.length, 7);
    for (const problem of problems) {
      assert.equal(problem.choices.length, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
    }
  }
  assert.ok(projectionProblems.some(({ label }) => label === "스칼라 정사영"));
  assert.ok(projectionProblems.some(({ label }) => label === "벡터 정사영"));
  assert.ok(projectionProblems.some(({ label }) => label === "평행·수직 성분 분해"));
});
