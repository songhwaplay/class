import assert from "node:assert/strict";
import test from "node:test";

import { sequenceLimitsSeriesProblems } from "../lib/sequence-limits-series-workouts.ts";

test("수열의 극한과 무한급수의 핵심 유형을 다룬다", () => {
  assert.equal(sequenceLimitsSeriesProblems.length, 7);
  assert.ok(sequenceLimitsSeriesProblems.some(({ label }) => label === "유리화"));
  assert.ok(sequenceLimitsSeriesProblems.some(({ label }) => label === "급수의 수렴 조건"));
  assert.ok(sequenceLimitsSeriesProblems.some(({ label }) => label === "부분분수와 무한급수"));
  for (const problem of sequenceLimitsSeriesProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});
