import test from "node:test";
import assert from "node:assert/strict";
import {
  radianProblems,
  arcSectorProblems,
  probabilityProblems,
  distributionProblems,
} from "../lib/high-school-foundation-workouts.ts";

test("keeps foundational high-school workouts complete and unambiguous", () => {
  for (const problems of [radianProblems, arcSectorProblems, probabilityProblems, distributionProblems]) {
    assert.equal(problems.length, 7);
    for (const problem of problems) {
      assert.equal(problem.choices.length, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
    }
  }
  assert.ok(radianProblems.some(({ label }) => label === "육십분법을 호도법으로"));
  assert.ok(arcSectorProblems.some(({ label }) => label === "부채꼴의 넓이"));
  assert.ok(probabilityProblems.some(({ label }) => label === "조건부확률"));
  assert.ok(distributionProblems.some(({ label }) => label === "표준화"));
});
