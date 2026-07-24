import assert from "node:assert/strict";
import test from "node:test";

import { meanValueTheoremProblems } from "../lib/mean-value-theorem-workouts.ts";

test("평균값정리 학습지는 조건과 핵심 적용 유형을 다룬다", () => {
  assert.equal(meanValueTheoremProblems.length, 7);
  assert.deepEqual(
    meanValueTheoremProblems.map(({ label }) => label),
    [
      "평균변화율",
      "평균값정리의 조건",
      "평균값정리",
      "평균값정리",
      "롤의 정리",
      "유리함수의 평균값정리",
      "두 개의 c",
    ],
  );

  for (const problem of meanValueTheoremProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("평균값정리를 만족하는 c의 계산이 정확하다", () => {
  assert.equal(meanValueTheoremProblems[2].correctLatex, String.raw`c=2`);
  assert.equal(meanValueTheoremProblems[3].correctLatex, String.raw`c=\sqrt3`);
  assert.equal(meanValueTheoremProblems[5].correctLatex, String.raw`c=\sqrt2`);
  assert.equal(meanValueTheoremProblems[6].correctLatex, String.raw`c=\pm\frac{2\sqrt3}{3}`);
});
