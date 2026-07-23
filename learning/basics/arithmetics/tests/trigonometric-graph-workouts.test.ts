import test from "node:test";
import assert from "node:assert/strict";
import { createTrigonometricGraphProblemSet, sameGraphAnswers } from "../lib/trigonometric-graph-workouts.ts";
test("graph set covers five distinct calculations", () => { assert.deepEqual(createTrigonometricGraphProblemSet(20260804).problems.map(({ kind }) => kind), ["range", "sine-period", "phase-shift", "determine-coefficients", "tangent-properties"]); });
test("graph answers require all values", () => { assert.equal(sameGraphAnswers(["2", "-3"], [2, -3]), true); assert.equal(sameGraphAnswers(["2"], [2, -3]), false); });
test("period and phase-shift prompts name n explicitly", () => {
  const problems = createTrigonometricGraphProblemSet(20260804).problems.filter(({ kind }) => kind === "sine-period" || kind === "phase-shift");
  assert.ok(problems.every(({ prompt, answerLabels }) => prompt.includes("n의 값") && answerLabels[0] === "n"));
  assert.ok(problems.every(({ prompt }) => !prompt.includes("미지수")));
});
