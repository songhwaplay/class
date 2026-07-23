import assert from "node:assert/strict";
import test from "node:test";

import {
  createGradeSixDecimalOneSet,
  GRADE_SIX_DECIMAL_ONE_BANK,
} from "../lib/grade-six-decimal-one.ts";

test("6소수①은 원본의 자연수 나눗셈 18문제를 모두 사용한다", () => {
  assert.deepEqual(GRADE_SIX_DECIMAL_ONE_BANK, [
    [18, 24, "0.75"], [26, 40, "0.65"], [126, 40, "3.15"],
    [11, 4, "2.75"], [15, 40, "0.375"], [123, 150, "0.82"],
    [34, 40, "0.85"], [8, 50, "0.16"], [113, 20, "5.65"],
    [76, 25, "3.04"], [147, 150, "0.98"], [24, 30, "0.8"],
    [13, 5, "2.6"], [34, 50, "0.68"], [21, 50, "0.42"],
    [35, 40, "0.875"], [6, 8, "0.75"], [33, 60, "0.55"],
  ]);
  assert.equal(createGradeSixDecimalOneSet(20260721).problems.length, 18);
});

test("모든 소수 몫은 자연수 나눗셈의 정확한 값이다", () => {
  for (const [dividend, divisor, answer] of GRADE_SIX_DECIMAL_ONE_BANK) {
    assert.equal(Number(answer), dividend / divisor);
  }
});

test("같은 시드는 같은 순서를 만들고 모든 원본 문제를 한 번씩 포함한다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const first = createGradeSixDecimalOneSet(seed);
    const second = createGradeSixDecimalOneSet(seed);
    assert.deepEqual(first, second);
    assert.deepEqual([...first.problems.map((problem) => problem.sourceNumber)].sort((a, b) => a - b), Array.from({ length: 18 }, (_, index) => index + 1));
  }
  assert.notDeepEqual(createGradeSixDecimalOneSet(1), createGradeSixDecimalOneSet(2));
});
