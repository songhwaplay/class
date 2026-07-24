import assert from "node:assert/strict";
import test from "node:test";

import { arcLengthSurfaceAreaProblems } from "../lib/arc-length-surface-area-workouts.ts";

test("곡선의 길이에서 회전체 겉넓이까지 단계적으로 다룬다", () => {
  assert.equal(arcLengthSurfaceAreaProblems.length, 7);
  assert.ok(arcLengthSurfaceAreaProblems.some(({ label }) => label === "매개변수 곡선의 길이"));
  assert.ok(arcLengthSurfaceAreaProblems.some(({ label }) => label === "구의 겉넓이 유도"));
  for (const problem of arcLengthSurfaceAreaProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("곡선 길이와 회전면 넓이 계산값이 정확하다", () => {
  assert.equal(arcLengthSurfaceAreaProblems[2].correctLatex, String.raw`\frac{14}{3}`);
  assert.equal(arcLengthSurfaceAreaProblems[4].correctLatex, String.raw`\sqrt2\pi`);
  assert.equal(arcLengthSurfaceAreaProblems[6].correctLatex, String.raw`36\pi`);
});
