import assert from "node:assert/strict";
import test from "node:test";

import {
  createGradeSixDecimalThreeSet,
  decimalQuotientAndRemainder,
  roundDecimalDivision,
} from "../lib/grade-six-decimal-three.ts";

test("6소수③은 두 반올림 구역과 몫·나머지 구역을 4문제씩 만든다", () => {
  const problems = createGradeSixDecimalThreeSet(20260721).problems;
  assert.equal(problems.length, 12);
  assert.equal(problems.filter((problem) => problem.section === "hundredths").length, 4);
  assert.equal(problems.filter((problem) => problem.section === "tenths").length, 4);
  assert.equal(problems.filter((problem) => problem.section === "remainder").length, 4);
});

test("두 소수의 나눗셈을 지정한 자리에서 정확하게 반올림한다", () => {
  assert.equal(roundDecimalDivision(91, 0, 11, 2, 2), "827.27");
  assert.equal(roundDecimalDivision(13, 2, 2, 1, 2), "0.65");
  assert.equal(roundDecimalDivision(42, 2, 55, 2, 1), "0.8");

  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createGradeSixDecimalThreeSet(seed).problems.slice(0, 8)) {
      assert.equal(
        problem.answer,
        roundDecimalDivision(
          problem.leftUnits,
          problem.leftPlaces,
          problem.rightUnits,
          problem.rightPlaces,
          problem.section === "hundredths" ? 2 : 1,
        ),
      );
    }
  }
});

test("몫과 나머지는 원래 나눗셈을 정확히 복원하고 나머지가 나누는 수보다 작다", () => {
  assert.deepEqual(decimalQuotientAndRemainder(58, 2, 54, 2), { quotient: "1", remainder: "0.04" });
  assert.deepEqual(decimalQuotientAndRemainder(64, 1, 29, 2), { quotient: "22", remainder: "0.02" });
  assert.deepEqual(decimalQuotientAndRemainder(5, 0, 6, 1), { quotient: "8", remainder: "0.2" });

  for (let seed = 1; seed <= 100; seed += 1) {
    for (const problem of createGradeSixDecimalThreeSet(seed).problems.slice(8)) {
      const result = decimalQuotientAndRemainder(problem.leftUnits, problem.leftPlaces, problem.rightUnits, problem.rightPlaces);
      assert.equal(problem.answer, result.quotient);
      assert.equal(problem.remainder, result.remainder);
      assert.ok(Number(problem.remainder) >= 0);
      assert.ok(Number(problem.remainder) < Number(problem.right));
      assert.ok(Math.abs(Number(problem.left) - (Number(problem.right) * Number(problem.answer) + Number(problem.remainder))) < 1e-10);
    }
  }
});

test("같은 시드는 같은 12문제를 만들고 다른 시드는 다른 문제를 만든다", () => {
  assert.deepEqual(createGradeSixDecimalThreeSet(1234), createGradeSixDecimalThreeSet(1234));
  assert.notDeepEqual(createGradeSixDecimalThreeSet(1234), createGradeSixDecimalThreeSet(5678));
});
