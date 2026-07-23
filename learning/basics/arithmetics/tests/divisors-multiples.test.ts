import assert from "node:assert/strict";
import test from "node:test";

import {
  createDivisorMultipleSet,
  GCD_CANDIDATE_ROWS,
  greatestCommonDivisor,
  LCM_BASES,
  leastCommonMultiple,
} from "../lib/divisors-multiples.ts";

test("최대공약수와 최소공배수를 정확히 계산한다", () => {
  assert.equal(greatestCommonDivisor(92, 60), 4);
  assert.equal(greatestCommonDivisor(60, 100), 20);
  assert.equal(leastCommonMultiple(100, 75), 300);
  assert.equal(leastCommonMultiple(24, 18), 72);
});

test("원본 문제표에서 최대공약수 20문제와 최소공배수 10문제를 만든다", () => {
  const problemSet = createDivisorMultipleSet(20260721);
  assert.deepEqual(problemSet.columns.map((column) => column.length), [10, 10, 10]);
  assert.equal(GCD_CANDIDATE_ROWS.length, 21);
  assert.equal(LCM_BASES.length, 24);

  const problems = problemSet.columns.flat();
  assert.equal(new Set(problems.map((problem) => problem.id)).size, 30);
  assert.equal(problems.filter((problem) => problem.kind === "gcd").length, 20);
  assert.equal(problems.filter((problem) => problem.kind === "lcm").length, 10);
  for (const problem of problems) {
    const expected = problem.kind === "gcd"
      ? greatestCommonDivisor(problem.left, problem.right)
      : leastCommonMultiple(problem.left, problem.right);
    assert.equal(problem.answer, expected);
  }
});

test("같은 시드는 같은 문제를 만들고 다른 시드는 문제 구성을 바꾼다", () => {
  assert.deepEqual(createDivisorMultipleSet(1234), createDivisorMultipleSet(1234));
  assert.notDeepEqual(createDivisorMultipleSet(1234), createDivisorMultipleSet(5678));
});
