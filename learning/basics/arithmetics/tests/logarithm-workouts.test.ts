import test from "node:test";
import assert from "node:assert/strict";
import { createLogarithmProblemSet, createLogarithmReviewProblems, sameLogarithmAnswer } from "../lib/logarithm-workouts.ts";
test("each set covers five distinct logarithm properties", () => {
  for (const seed of [1, 25, 20260731]) {
    const { problems } = createLogarithmProblemSet(seed);
    assert.deepEqual(problems.map(({ kind }) => kind), ["log-value", "product-law", "quotient-law", "power-law", "change-of-base"]);
    assert.equal(problems.length, 5);
  }
});
test("logarithm checking and review stay exact", () => {
  assert.equal(sameLogarithmAnswer("-2", -2), true);
  assert.equal(sameLogarithmAnswer("2.0", 2), false);
  assert.equal(createLogarithmReviewProblems(["product-law", "product-law", "power-law"], 3).length, 2);
});
