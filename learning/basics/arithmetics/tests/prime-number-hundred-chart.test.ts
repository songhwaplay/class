import assert from "node:assert/strict";
import test from "node:test";

import {
  gradePrimeNumberSelection,
  HUNDRED_CHART_NUMBERS,
  isPrimeNumberTo100,
  PRIME_NUMBERS_TO_100,
} from "../lib/prime-number-hundred-chart.ts";

test("1부터 100까지 원본 소수 25개를 정확히 표시한다", () => {
  assert.equal(HUNDRED_CHART_NUMBERS.length, 100);
  assert.deepEqual(HUNDRED_CHART_NUMBERS, Array.from({ length: 100 }, (_, index) => index + 1));
  assert.deepEqual(PRIME_NUMBERS_TO_100, [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
  ]);
  assert.equal(isPrimeNumberTo100(1), false);
  assert.equal(isPrimeNumberTo100(97), true);
  assert.equal(isPrimeNumberTo100(100), false);
});

test("소수만 모두 고르면 100칸이 전부 정답 처리된다", () => {
  const results = gradePrimeNumberSelection(PRIME_NUMBERS_TO_100);
  assert.equal(Object.keys(results).length, 100);
  assert.equal(Object.values(results).filter(Boolean).length, 100);

  const withComposite = gradePrimeNumberSelection([...PRIME_NUMBERS_TO_100, 4]);
  assert.equal(withComposite[4], false);
  assert.equal(Object.values(withComposite).filter(Boolean).length, 99);
});
