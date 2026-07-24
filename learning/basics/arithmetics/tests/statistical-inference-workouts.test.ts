import assert from "node:assert/strict";
import test from "node:test";

import { createStatisticalInferenceProblems, statisticalInferenceProblems } from "../lib/statistical-inference-workouts.ts";

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

test("새 시드마다 수치와 정답이 달라진다", () => {
  const first = createStatisticalInferenceProblems(101);
  const second = createStatisticalInferenceProblems(202);
  assert.notDeepEqual(
    first.map(({ latex, correctLatex }) => [latex, correctLatex]),
    second.map(({ latex, correctLatex }) => [latex, correctLatex]),
  );
});

test("질문 속 통계 기호는 인라인 수식으로 표시한다", () => {
  const prompts = statisticalInferenceProblems.map(({ prompt }) => prompt ?? "");
  assert.ok(prompts.includes("$E(\\overline X)$는?"));
  assert.ok(prompts.includes("$\\sigma_{\\overline X}$는?"));
  assert.ok(prompts.some((prompt) => prompt.includes("$\\mu$")));
});
