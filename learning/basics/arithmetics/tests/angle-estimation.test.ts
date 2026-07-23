import assert from "node:assert/strict";
import test from "node:test";

import { ANGLE_ESTIMATION_VALUES, createAngleEstimationSet } from "../lib/angle-estimation.ts";

test("15도부터 180도까지 15도 간격의 12문제를 만든다", () => {
  assert.deepEqual(ANGLE_ESTIMATION_VALUES, [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]);
  const problems = createAngleEstimationSet(20260721);
  assert.equal(problems.length, 12);
  assert.deepEqual([...problems.map((problem) => problem.angle)].sort((left, right) => left - right), ANGLE_ESTIMATION_VALUES);
  assert.ok(problems.every((problem) => problem.angle >= 15 && problem.angle <= 180 && problem.angle % 15 === 0));
});

test("같은 시드는 같은 순서를 만들고 다른 시드는 순서를 바꾼다", () => {
  assert.deepEqual(createAngleEstimationSet(1234), createAngleEstimationSet(1234));
  assert.notDeepEqual(createAngleEstimationSet(1234), createAngleEstimationSet(5678));
});
