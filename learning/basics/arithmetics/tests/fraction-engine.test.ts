import assert from "node:assert/strict";
import test from "node:test";
import { createQuestionSet, validateQuestionSet } from "../app/fraction-engine.ts";

test("generates deterministic and valid 16-question sets", () => {
  for (const seed of [0, 1, 20260720, 0xffffffff]) {
    const first = createQuestionSet(seed);
    const second = createQuestionSet(seed);
    assert.deepEqual(first, second);
    assert.deepEqual(validateQuestionSet(first), {
      count: true,
      leftCount: true,
      rightCount: true,
      leftDenominators: true,
      rightDenominators: true,
      leftProper: true,
      rightProper: true,
      uniqueIds: true,
    });
  }
});

test("different seeds produce different question sets", () => {
  assert.notDeepEqual(createQuestionSet(11).questions, createQuestionSet(12).questions);
});
