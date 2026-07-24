import assert from "node:assert/strict";
import test from "node:test";
import {
  createEulerFormulaProblems,
  createIntegralApplicationProblems,
  createMatrixProblems,
  createPartialDerivativeProblems,
} from "../lib/stem-generated-workouts.ts";

const factories = [
  createPartialDerivativeProblems,
  createEulerFormulaProblems,
  createMatrixProblems,
  createIntegralApplicationProblems,
];

test("STEM worksheets generate fresh, gradeable problem sets", () => {
  for (const factory of factories) {
    assert.notDeepEqual(factory(20260725), factory(314159265));
    for (const problem of factory(20260725)) {
      assert.equal(problem.choices.length, 4);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
      assert.equal(problem.choices.find(({ correct }) => correct)?.latex, problem.correctLatex);
    }
  }
});
