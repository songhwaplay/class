import assert from "node:assert/strict";
import test from "node:test";

import { cayleyHamiltonRotationProblems } from "../lib/cayley-hamilton-rotation-workouts.ts";

test("케일리–해밀턴 정리와 회전행렬의 핵심 유형을 다룬다", () => {
  assert.equal(cayleyHamiltonRotationProblems.length, 7);
  assert.ok(cayleyHamiltonRotationProblems.some(({ label }) => label === "행렬의 거듭제곱"));
  assert.ok(cayleyHamiltonRotationProblems.some(({ label }) => label === "회전행렬의 합성"));
  for (const problem of cayleyHamiltonRotationProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("피보나치 행렬의 거듭제곱과 역행렬 공식이 정확하다", () => {
  assert.equal(cayleyHamiltonRotationProblems[2].correctLatex, String.raw`A^5=5A+3I`);
  assert.equal(cayleyHamiltonRotationProblems[3].correctLatex, String.raw`A^{-1}=A-I`);
});
