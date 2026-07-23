import test from "node:test";
import assert from "node:assert/strict";
import { createExponentialLogInequalityProblemSet, sameInequalityBoundaries } from "../lib/exponential-log-inequality-workouts.ts";
test("each set covers five exponent and logarithm inequality structures", () => {
  const { problems } = createExponentialLogInequalityProblemSet(20260802);
  assert.deepEqual(problems.map(({ kind }) => kind), ["increasing-exponential", "decreasing-exponential", "increasing-log", "decreasing-log", "substitution"]);
  assert.equal(problems.filter(({ answerValues }) => answerValues.length === 2).length, 3);
});
test("inequality boundary checking stays exact", () => {
  assert.equal(sameInequalityBoundaries(["-2", "5"], [-2, 5]), true);
  assert.equal(sameInequalityBoundaries(["5", "-2"], [-2, 5]), false);
});
test("substitution problems keep coefficients small enough to expose the structure", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const problem = createExponentialLogInequalityProblemSet(seed).problems.find(({ kind }) => kind === "substitution");
    assert.ok(problem);
    assert.doesNotMatch(problem.latex, /738|6561|729/);
    assert.ok(["2^{2x}-5\\cdot2^{x}+4<0", "2^{2x}-10\\cdot2^{x}+16<0", "3^{2x}-10\\cdot3^{x}+9<0", "3^{2x}-12\\cdot3^{x}+27<0"].includes(problem.latex));
  }
});
test("exponential inequalities require converting different visible bases", () => {
  for (let seed = 0; seed < 30; seed += 1) {
    const [increasing, decreasing] = createExponentialLogInequalityProblemSet(seed).problems;
    assert.match(increasing.latex, /4.*8|8.*4|9.*27/);
    assert.match(decreasing.latex, /4.*8|8.*4|9.*27/);
  }
});
