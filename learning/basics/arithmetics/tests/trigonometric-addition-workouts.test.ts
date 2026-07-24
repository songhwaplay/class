import assert from "node:assert/strict";
import test from "node:test";

import { trigonometricAdditionProblems } from "../lib/trigonometric-addition-workouts.ts";

test("삼각함수 덧셈정리와 합·곱 변환을 함께 다룬다", () => {
  assert.equal(trigonometricAdditionProblems.length, 7);
  assert.ok(trigonometricAdditionProblems.some(({ label }) => label === "합을 곱으로"));
  assert.ok(trigonometricAdditionProblems.filter(({ label }) => label === "곱을 합으로").length >= 2);
  for (const problem of trigonometricAdditionProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("깨진 LaTeX 명령이 없다", () => {
  const formulas = trigonometricAdditionProblems.flatMap((problem) => [
    problem.latex,
    problem.correctLatex,
    ...problem.choices.map(({ latex }) => latex),
  ]);
  formulas.forEach((formula) => assert.ok(!formula.includes(String.raw`\\`)));
});
