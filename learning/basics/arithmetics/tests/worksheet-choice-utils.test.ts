import assert from "node:assert/strict";
import test from "node:test";

import { createNumericChoices, rotateChoices } from "../lib/worksheet-choice-utils.ts";

test("숫자 및 계수형 답은 항상 서로 다른 4개 선택지를 만든다", () => {
  const tuples = [[0], [1], [-3], [0, 0], [1, -1], [-4, -2, 2, 4], [0, 0, 0, 0]];
  tuples.forEach((tuple, index) => {
    const choices = createNumericChoices(tuple, `tuple-${index}`);
    assert.equal(choices.length, 4);
    assert.equal(choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(choices.map(({ values }) => JSON.stringify(values))).size, 4);
  });
});

test("정답 위치를 첫 번째에 고정하지 않고 안정적으로 순환한다", () => {
  const choices = ["answer", "wrong-1", "wrong-2", "wrong-3"];
  const positions = new Set(Array.from({ length: 12 }, (_, index) => rotateChoices(choices, `problem-${index}`).indexOf("answer")));
  assert.ok(positions.size > 1);
  assert.deepEqual(rotateChoices(choices, "same-key"), rotateChoices(choices, "same-key"));
});
