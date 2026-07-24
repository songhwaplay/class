import assert from "node:assert/strict";
import test from "node:test";

import { sineCosineLawProblems } from "../lib/sine-cosine-law-workouts.ts";

test("사인법칙과 코사인법칙의 핵심 유형을 다룬다", () => {
  assert.equal(sineCosineLawProblems.length, 7);
  assert.ok(sineCosineLawProblems.some(({ label }) => label === "외접원의 반지름"));
  assert.ok(sineCosineLawProblems.some(({ label }) => label === "두 변과 끼인각의 넓이"));
  for (const problem of sineCosineLawProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});
