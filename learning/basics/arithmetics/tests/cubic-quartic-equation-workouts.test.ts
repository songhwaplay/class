import assert from "node:assert/strict";
import test from "node:test";

import { cubicQuarticEquationProblems } from "../lib/cubic-quartic-equation-workouts.ts";

test("삼차·사차방정식 학습지는 핵심 풀이 전략을 다룬다", () => {
  assert.equal(cubicQuarticEquationProblems.length, 7);
  assert.deepEqual(
    cubicQuarticEquationProblems.map(({ label }) => label),
    [
      "삼차방정식의 해",
      "인수정리의 활용",
      "중근이 있는 삼차방정식",
      "공통인수로 묶기",
      "x²으로 치환",
      "사차방정식의 인수분해",
      "복이차식",
    ],
  );

  for (const problem of cubicQuarticEquationProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});
