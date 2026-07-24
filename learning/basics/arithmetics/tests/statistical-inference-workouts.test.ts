import assert from "node:assert/strict";
import test from "node:test";

import { statisticalInferenceProblems } from "../lib/statistical-inference-workouts.ts";

test("통계적 추정 학습지는 모집단부터 신뢰구간까지 순서대로 다룬다", () => {
  assert.equal(statisticalInferenceProblems.length, 7);
  assert.deepEqual(
    statisticalInferenceProblems.map(({ label }) => label),
    [
      "모집단과 표본",
      "모평균과 모표준편차",
      "표본평균",
      "표본평균의 평균",
      "표본평균의 표준편차",
      "모평균의 신뢰구간",
      "신뢰구간의 폭",
    ],
  );

  for (const problem of statisticalInferenceProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("모평균의 95% 신뢰구간과 폭이 정확하다", () => {
  assert.equal(statisticalInferenceProblems[5].correctLatex, String.raw`48.04\le\mu\le51.96`);
  assert.equal(statisticalInferenceProblems[6].correctLatex, String.raw`1.96`);
});
