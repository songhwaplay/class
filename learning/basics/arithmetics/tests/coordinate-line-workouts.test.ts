import test from "node:test";
import assert from "node:assert/strict";
import { coordinateLineAnswerLatex, createCoordinateLineProblemSet, createCoordinateLineReviewProblems, sameCoordinateLineAnswer } from "../lib/coordinate-line-workouts.ts";

test("each set covers five coordinate and line types", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const set = createCoordinateLineProblemSet(seed);
    assert.deepEqual(set.problems.map(({ kind }) => kind), ["distance", "internal-division", "two-point-line", "parallel-line", "perpendicular-line"]);
    assert.ok(set.problems.every(({ answer }) => answer.every(Number.isInteger)));
  }
});
test("line answers are normalized with positive first coefficient", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createCoordinateLineProblemSet(seed).problems.filter(({ answerMode }) => answerMode === "line")) {
      assert.ok(problem.answer[0] > 0);
    }
  }
});
test("answer comparison requires ordered exact entries", () => {
  assert.equal(sameCoordinateLineAnswer(["3", "-2", "5"], [3, -2, 5]), true);
  assert.equal(sameCoordinateLineAnswer(["3", "5", "-2"], [3, -2, 5]), false);
});
test("review problems preserve requested kinds and stop at two", () => {
  const kinds = createCoordinateLineProblemSet(1).problems.map(({ kind }) => kind);
  assert.deepEqual(createCoordinateLineReviewProblems([kinds[4], kinds[4], kinds[2]], 2).map(({ kind }) => kind), [kinds[4], kinds[2]]);
});
test("line display omits coefficients one and zero terms", () => {
  assert.equal(coordinateLineAnswerLatex({ id: "a", kind: "parallel-line", label: "", prompt: "", latex: "", answer: [1, 2, 1], answerMode: "line" }), "x+2y+1=0");
  assert.equal(coordinateLineAnswerLatex({ id: "b", kind: "parallel-line", label: "", prompt: "", latex: "", answer: [1, -1, 0], answerMode: "line" }), "x-y=0");
});
