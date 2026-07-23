import test from "node:test";
import assert from "node:assert/strict";
import { createTrigonometricValueProblemSet, formatExactTrigValue, sameExactTrigValue } from "../lib/trigonometric-values-workouts.ts";
test("each set covers five useful trigonometric value skills", () => {
  const { problems } = createTrigonometricValueProblemSet(20260803);
  assert.deepEqual(problems.map(({ kind }) => kind), ["special-angle", "reference-angle", "pythagorean", "tangent-relation", "combined-value"]);
});
test("exact radical fraction answers are checked structurally", () => {
  const answer = { sign: -1 as const, numerator: 1, radical: 3 as const, denominator: 3 };
  assert.equal(formatExactTrigValue(answer), "-\\frac{\\sqrt{3}}{3}");
  assert.equal(sameExactTrigValue({ sign: -1, numerator: "1", radical: "3", denominator: "3" }, answer), true);
});
