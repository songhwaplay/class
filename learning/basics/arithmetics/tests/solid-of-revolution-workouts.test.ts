import assert from "node:assert/strict";
import test from "node:test";

import { solidOfRevolutionProblems } from "../lib/solid-of-revolution-workouts.ts";

test("회전체의 부피 학습지는 원판법과 와셔법을 다룬다", () => {
  assert.equal(solidOfRevolutionProblems.length, 7);
  assert.ok(solidOfRevolutionProblems.some(({ label }) => label === "와셔법"));
  assert.ok(solidOfRevolutionProblems.some(({ label }) => label === "y축 회전·원판법"));
  for (const problem of solidOfRevolutionProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("회전체 부피 계산값이 정확하다", () => {
  assert.equal(solidOfRevolutionProblems[2].correctLatex, String.raw`\frac{16\pi}{15}`);
  assert.equal(solidOfRevolutionProblems[3].correctLatex, String.raw`\frac{72\sqrt3\pi}{5}`);
  assert.equal(solidOfRevolutionProblems[6].correctLatex, String.raw`\frac{2\pi}{15}`);
});
