import assert from "node:assert/strict";
import test from "node:test";

import {
  createNaturalNumberDecompositionSet,
  formatPrimeFactorization,
  isPrimeFactorizationAnswer,
  naturalNumberDecompositionBank,
  primeFactors,
} from "../lib/natural-number-decomposition.ts";

test("원본 소인수식 문제은행 84개를 정확히 복원한다", () => {
  assert.equal(naturalNumberDecompositionBank.length, 84);
  assert.deepEqual(naturalNumberDecompositionBank.slice(0, 6), [8, 12, 16, 18, 20, 22]);
  assert.deepEqual(naturalNumberDecompositionBank.slice(-4), [99, 100, 102, 105]);
  for (const number of naturalNumberDecompositionBank) {
    assert.equal(primeFactors(number).reduce((product, factor) => product * factor, 1), number);
  }
});

test("소수는 그대로, 합성수는 반복된 소인수의 곱으로 나타낸다", () => {
  assert.equal(formatPrimeFactorization(29), "29");
  assert.equal(formatPrimeFactorization(72), "2×2×2×3×3");
  assert.equal(formatPrimeFactorization(100), "2×2×5×5");
});

test("같은 seed는 중복 없는 같은 15문제를 만든다", () => {
  const first = createNaturalNumberDecompositionSet(20260721);
  const second = createNaturalNumberDecompositionSet(20260721);
  assert.deepEqual(first, second);
  assert.equal(first.length, 15);
  assert.equal(new Set(first.map((problem) => problem.number)).size, 15);
  assert.notDeepEqual(first, createNaturalNumberDecompositionSet(1));
});

test("곱셈 기호 입력 차이는 허용하고 합성 인수는 오답 처리한다", () => {
  assert.equal(isPrimeFactorizationAnswer(72, "2 x 2 * 2 · 3 ⋅ 3"), true);
  assert.equal(isPrimeFactorizationAnswer(72, "3×2×3×2×2"), true);
  assert.equal(isPrimeFactorizationAnswer(72, "8×9"), false);
  assert.equal(isPrimeFactorizationAnswer(29, "29"), true);
  assert.equal(isPrimeFactorizationAnswer(29, "1×29"), false);
});
