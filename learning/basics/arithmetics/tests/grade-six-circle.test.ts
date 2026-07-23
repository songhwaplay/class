import assert from "node:assert/strict";
import test from "node:test";
import { createGradeSixCircleSet } from "../lib/grade-six-circle.ts";
test("6원은 둘레와 넓이 여덟 문제를 만든다", () => { const problems = createGradeSixCircleSet(20260722); assert.equal(problems.length, 8); assert.deepEqual(createGradeSixCircleSet(20260722), problems); assert.ok(problems.some((p) => p.target === "둘레")); assert.ok(problems.some((p) => p.target === "넓이")); });
