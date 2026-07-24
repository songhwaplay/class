import assert from "node:assert/strict";
import test from "node:test";

import { binomialTheoremProblems } from "../lib/binomial-theorem-workouts.ts";

test("이항정리 학습지는 핵심 유형을 빠짐없이 다룬다", () => {
  assert.equal(binomialTheoremProblems.length, 7);
  assert.deepEqual(
    binomialTheoremProblems.map(({ label }) => label),
    [
      "특정 항의 계수",
      "상수항",
      "계수의 합",
      "계수의 교대합",
      "가운데 항",
      "이항계수",
      "이항계수의 합",
    ],
  );

  for (const problem of binomialTheoremProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("문장 속 문자식은 인라인 수식으로 표시한다", () => {
  const prompts = binomialTheoremProblems.map(({ prompt }) => prompt ?? "");
  assert.ok(prompts.includes("$x^3$의 계수는?"));
  assert.ok(prompts.includes("$x^4$의 계수는?"));
  assert.equal(prompts.some((prompt) => /^x\^\d/.test(prompt)), false);
});
