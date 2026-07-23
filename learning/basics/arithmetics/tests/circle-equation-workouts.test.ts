import test from "node:test";
import assert from "node:assert/strict";
import { circleAnswerLatex, createCircleProblemSet, createCircleReviewProblems, sameCircleAnswer } from "../lib/circle-equation-workouts.ts";

test("each set covers five circle equation types with integer answers", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const set = createCircleProblemSet(seed);
    assert.deepEqual(set.problems.map(({ kind }) => kind), ["center-to-equation", "equation-to-center", "three-points", "line-intersections", "tangent-parameter"]);
    assert.ok(set.problems.every(({ answer }) => answer.every(Number.isInteger)));
  }
});
test("circle equation display omits unit and zero coefficients", () => {
  const problem = { id: "a", kind: "center-to-equation" as const, label: "", prompt: "", latex: "", answer: [1, -1, 0], answerMode: "equation" as const };
  assert.equal(circleAnswerLatex(problem), "x^2+y^2+x-y=0");
});
test("answer comparison requires exact ordered entries", () => {
  assert.equal(sameCircleAnswer(["1", "-2", "3"], [1, -2, 3]), true);
  assert.equal(sameCircleAnswer(["1", "3", "-2"], [1, -2, 3]), false);
});
test("review problems preserve requested kinds and stop at two", () => {
  const kinds = createCircleProblemSet(1).problems.map(({ kind }) => kind);
  assert.deepEqual(createCircleReviewProblems([kinds[3], kinds[3], kinds[1]], 2).map(({ kind }) => kind), [kinds[3], kinds[1]]);
});
