import assert from "node:assert/strict";
import test from "node:test";

import { conicIntegralAreaProblems } from "../lib/conic-integral-area-workouts.ts";

test("타원·포물선·쌍곡선의 넓이를 고르게 다룬다", () => {
  assert.equal(conicIntegralAreaProblems.length, 7);
  assert.ok(conicIntegralAreaProblems.filter(({ label }) => label.includes("타원")).length >= 3);
  assert.ok(conicIntegralAreaProblems.filter(({ label }) => label.includes("포물선")).length >= 2);
  assert.ok(conicIntegralAreaProblems.filter(({ label }) => label.includes("쌍곡선")).length >= 2);
  for (const problem of conicIntegralAreaProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("이차곡선 넓이 계산값이 정확하다", () => {
  assert.equal(conicIntegralAreaProblems[0].correctLatex, String.raw`6\pi`);
  assert.equal(conicIntegralAreaProblems[3].correctLatex, String.raw`\frac83`);
  assert.equal(conicIntegralAreaProblems[4].correctLatex, String.raw`\frac{32}{3}`);
});
