import assert from "node:assert/strict";
import test from "node:test";
import { createGradeSixMixedCalculationSet, normalizeGradeSixMixedAnswer } from "../lib/grade-six-mixed-calculation.ts";

test("6혼합계산은 분수와 소수 여섯 문제를 결정적으로 만든다", () => {
  const problems = createGradeSixMixedCalculationSet(20260722);
  assert.equal(problems.length, 6);
  assert.deepEqual(createGradeSixMixedCalculationSet(20260722), problems);
  assert.deepEqual(problems.map((problem) => problem.kind), ["fraction", "decimal", "fraction", "decimal", "decimal", "fraction"]);
});

test("분수와 대분수 답안을 기약분수 형태로 비교한다", () => {
  assert.equal(normalizeGradeSixMixedAnswer(" 1  2/4 "), "1 1/2");
  assert.equal(normalizeGradeSixMixedAnswer("6/8"), "3/4");
  assert.equal(normalizeGradeSixMixedAnswer("2.500"), "2.5");
});
