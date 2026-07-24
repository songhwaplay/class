import assert from "node:assert/strict";
import test from "node:test";

import { createMiddleRationalMixedProblemSet } from "../lib/middle-rational-mixed.ts";

test("중학교 혼합계산은 불필요한 양수 괄호와 반복 지시문을 쓰지 않는다", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    const { problems } = createMiddleRationalMixedProblemSet(seed);
    for (const problem of problems) {
      assert.equal(problem.prompt, "");
      assert.doesNotMatch(problem.latex, /\([1-9](?:\\frac)?\)/, problem.latex);
      assert.doesNotMatch(problem.latex, /\\times\([1-9]/, problem.latex);
      assert.doesNotMatch(problem.latex, /\\div\([1-9]/, problem.latex);
      assert.doesNotMatch(problem.latex, /\^\{-1\}/, problem.latex);
    }
  }
});
