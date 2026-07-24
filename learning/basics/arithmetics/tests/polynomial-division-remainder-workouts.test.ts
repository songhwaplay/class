import assert from "node:assert/strict";
import test from "node:test";

import { polynomialDivisionRemainderProblems } from "../lib/polynomial-division-remainder-workouts.ts";

test("다항식 학습지는 곱셈부터 나머지의 결정까지 다룬다", () => {
  assert.equal(polynomialDivisionRemainderProblems.length, 7);
  assert.deepEqual(
    polynomialDivisionRemainderProblems.map(({ label }) => label),
    [
      "다항식의 곱셈",
      "다항식의 나눗셈",
      "몫과 나머지",
      "나머지정리",
      "인수정리",
      "이차식으로 나눈 나머지",
      "나머지의 결정",
    ],
  );

  for (const problem of polynomialDivisionRemainderProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});
