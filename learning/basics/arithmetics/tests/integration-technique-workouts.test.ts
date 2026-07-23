import assert from "node:assert/strict";
import test from "node:test";
import {
  createIntegrationTechniqueProblemSet,
  createIntegrationTechniqueReviewProblems,
} from "../lib/integration-technique-workouts.ts";

test("치환적분과 부분적분은 계산법이 다른 여섯 유형을 만든다", () => {
  const set = createIntegrationTechniqueProblemSet(20260811);
  assert.deepEqual(set.problems.map(({ kind }) => kind), [
    "power-substitution",
    "log-substitution",
    "trig-substitution",
    "parts-exponential",
    "parts-trigonometric",
    "parts-logarithm",
  ]);
  for (const problem of set.problems) {
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.match(problem.answerLatex, /\+C$/);
  }
});

test("적분법 오답 보충은 중복을 제거하고 두 유형까지만 만든다", () => {
  const reviews = createIntegrationTechniqueReviewProblems(
    ["parts-exponential", "parts-exponential", "log-substitution"],
    9,
  );
  assert.deepEqual(reviews.map(({ kind }) => kind), ["parts-exponential", "log-substitution"]);
});

test("적분법 문제는 같은 시드에서 재현된다", () => {
  assert.deepEqual(
    createIntegrationTechniqueProblemSet(31),
    createIntegrationTechniqueProblemSet(31),
  );
});
