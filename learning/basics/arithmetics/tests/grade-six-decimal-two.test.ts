import assert from "node:assert/strict";
import test from "node:test";

import {
  createGradeSixDecimalTwoSet,
  roundDecimalQuotient,
} from "../lib/grade-six-decimal-two.ts";
import { formatDecimal } from "../lib/grade-five-decimals.ts";

test("6소수②는 원본처럼 곱셈 4문제와 두 반올림 구역 4문제씩을 만든다", () => {
  const problems = createGradeSixDecimalTwoSet(20260721).problems;
  assert.equal(problems.length, 12);
  assert.equal(problems.filter((problem) => problem.section === "multiplication").length, 4);
  assert.equal(problems.filter((problem) => problem.section === "hundredths").length, 4);
  assert.equal(problems.filter((problem) => problem.section === "tenths").length, 4);
});

test("소수 곱셈은 정수 자릿수 연산으로 정확한 답을 만든다", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const multiplication = createGradeSixDecimalTwoSet(seed).problems.slice(0, 4);
    multiplication.forEach((problem, index) => {
      assert.equal(problem.answer, formatDecimal(problem.leftUnits * problem.rightUnits, problem.leftPlaces + problem.rightPlaces));
      assert.ok(problem.leftUnits >= 77 && problem.leftUnits <= 99);
      assert.ok(problem.rightUnits >= 77 && problem.rightUnits <= 99);
      assert.ok(problem.leftPlaces >= (index === 1 || index === 2 ? 1 : 0) && problem.leftPlaces <= 2);
      assert.ok(problem.rightPlaces >= 0 && problem.rightPlaces <= 2);
    });
  }
});

test("나눗셈 답은 지정한 자리에서 정확하게 반올림한다", () => {
  assert.equal(roundDecimalQuotient(819, 2, 4, 2), "2.05");
  assert.equal(roundDecimalQuotient(829, 2, 3, 1), "2.8");
  assert.equal(roundDecimalQuotient(91, 0, 7, 2), "13");

  for (let seed = 1; seed <= 100; seed += 1) {
    const problems = createGradeSixDecimalTwoSet(seed).problems;
    problems.slice(4).forEach((problem, offset) => {
      const position = offset % 4;
      assert.equal(problem.leftPlaces, position === 1 ? 0 : 2);
      assert.ok(problem.rightUnits >= (position === 1 ? 6 : 2) && problem.rightUnits <= 9);
      assert.equal(
        problem.answer,
        roundDecimalQuotient(problem.leftUnits, problem.leftPlaces, problem.rightUnits, problem.section === "hundredths" ? 2 : 1),
      );
    });
  }
});

test("같은 시드는 같은 12문제를 만들고 다른 시드는 다른 문제를 만든다", () => {
  assert.deepEqual(createGradeSixDecimalTwoSet(1234), createGradeSixDecimalTwoSet(1234));
  assert.notDeepEqual(createGradeSixDecimalTwoSet(1234), createGradeSixDecimalTwoSet(5678));
});
