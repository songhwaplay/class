import assert from "node:assert/strict";
import test from "node:test";

import { createMixedCalculationSet, evaluateMixedExpression, mixedCalculationBank } from "../lib/mixed-calculation.ts";

test("원본 혼합계산 문제은행 215개의 정답을 모두 검산한다", () => {
  assert.equal(mixedCalculationBank.length, 215);
  for (const [expression, expected] of mixedCalculationBank) {
    assert.equal(evaluateMixedExpression(expression), expected, expression);
  }
});

test("같은 seed는 중복 없는 같은 8문제를 만든다", () => {
  const first = createMixedCalculationSet(20260721);
  const second = createMixedCalculationSet(20260721);
  assert.deepEqual(first, second);
  assert.equal(first.length, 8);
  assert.equal(new Set(first.map((problem) => problem.id)).size, 8);
});

test("다른 seed는 다른 혼합계산 문제지를 만든다", () => {
  assert.notDeepEqual(createMixedCalculationSet(1), createMixedCalculationSet(2));
});
