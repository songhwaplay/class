import test from "node:test";
import assert from "node:assert/strict";
import { createExponentialLogEquationProblemSet, sameEquationAnswers } from "../lib/exponential-log-equation-workouts.ts";
test("each set covers five equation structures worth practicing", () => {
  const { problems } = createExponentialLogEquationProblemSet(20260801);
  assert.deepEqual(problems.map(({ kind }) => kind), ["common-factor", "different-base", "substitution", "single-log", "combined-logs"]);
  assert.equal(problems.find(({ kind }) => kind === "substitution")?.answers.length, 2);
});
test("the first exponential equation requires factoring instead of merely comparing exponents", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const problem = createExponentialLogEquationProblemSet(seed).problems[0];
    assert.equal(problem.kind, "common-factor");
    assert.match(problem.latex, /\^\{x\+\d+\}\+\d+\\cdot\d+\^\{x\}=\d+/);
    assert.doesNotMatch(problem.latex, /^(\d+)\^\{[^}]+\}=\1\^\{/);
  }
});
test("equation answers require every exact ordered integer", () => {
  assert.equal(sameEquationAnswers(["1", "3"], [1, 3]), true);
  assert.equal(sameEquationAnswers(["3", "1"], [1, 3]), false);
  assert.equal(sameEquationAnswers(["1"], [1, 3]), false);
});
