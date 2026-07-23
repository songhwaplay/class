import assert from "node:assert/strict";
import test from "node:test";

import {
  createGradeFiveDecimalSet,
  formatDecimal,
  matchesDecimalAnswer,
  normalizeDecimalInput,
  sanitizeDecimalInput,
} from "../lib/grade-five-decimals.ts";

test("5소수는 원본처럼 3×3 소수 곱셈 문제를 만든다", () => {
  const problemSet = createGradeFiveDecimalSet(20260721);
  assert.equal(problemSet.problems.length, 9);
  assert.deepEqual(problemSet.problems.map((problem) => problem.column), [0, 1, 2, 0, 1, 2, 0, 1, 2]);
  assert.deepEqual(createGradeFiveDecimalSet(20260721), problemSet);
});

test("피승수와 승수는 원본의 77~99 및 소수점 자리 규칙을 지킨다", () => {
  for (let seed = 1; seed <= 300; seed += 1) {
    for (const problem of createGradeFiveDecimalSet(seed).problems) {
      assert.ok(problem.left.digits >= 77 && problem.left.digits <= 99);
      assert.ok(problem.right.digits >= 77 && problem.right.digits <= 99);
      assert.ok(problem.left.places >= (problem.column === 0 ? 0 : 1));
      assert.ok(problem.left.places <= 2);
      assert.ok(problem.right.places >= 0 && problem.right.places <= 2);
      assert.equal(problem.left.text, formatDecimal(problem.left.digits, problem.left.places));
      assert.equal(problem.right.text, formatDecimal(problem.right.digits, problem.right.places));
    }
  }
});

test("정답은 부동소수점 오차 없이 두 정수의 곱과 소수 자릿수로 계산한다", () => {
  for (let seed = 1; seed <= 300; seed += 1) {
    for (const problem of createGradeFiveDecimalSet(seed).problems) {
      assert.equal(
        problem.answer,
        formatDecimal(problem.left.digits * problem.right.digits, problem.left.places + problem.right.places),
      );
    }
  }
  assert.equal(formatDecimal(6630, 2), "66.3");
  assert.equal(formatDecimal(6723, 3), "6.723");
  assert.equal(formatDecimal(8649, 4), "0.8649");
});

test("같은 값의 끝자리 0은 허용하고 여러 소수점은 제거한다", () => {
  assert.equal(normalizeDecimalInput("006.6300"), "6.63");
  assert.equal(normalizeDecimalInput(".850"), "0.85");
  assert.equal(matchesDecimalAnswer("66.300", "66.3"), true);
  assert.equal(matchesDecimalAnswer("66.03", "66.3"), false);
  assert.equal(matchesDecimalAnswer("", "66.3"), false);
  assert.equal(sanitizeDecimalInput("6..72a3"), "6.723");
});
