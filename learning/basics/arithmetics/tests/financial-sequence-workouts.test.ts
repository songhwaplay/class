import assert from "node:assert/strict";
import test from "node:test";

import { financialSequenceProblems } from "../lib/financial-sequence-workouts.ts";

test("원리합계 학습지는 단리·복리·적립을 구분한다", () => {
  assert.equal(financialSequenceProblems.length, 7);
  assert.deepEqual(
    financialSequenceProblems.map(({ label }) => label),
    [
      "단리의 원리합계",
      "복리의 원리합계",
      "복리에서 원금",
      "복리에서 이율",
      "매년 말 적립",
      "매년 초 적립",
      "단리와 복리의 비교",
    ],
  );
  for (const problem of financialSequenceProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});
