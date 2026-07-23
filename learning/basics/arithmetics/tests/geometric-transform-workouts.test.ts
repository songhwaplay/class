import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTransformProblemSet, createTransformReviewProblems, sameTransformAnswer, transformAnswerLatex } from "../lib/geometric-transform-workouts.ts";

test("each set covers five geometric transformation types", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const problems = createTransformProblemSet(seed).problems;
    assert.deepEqual(problems.map(({ kind }) => kind), ["point-translation", "line-translation", "circle-translation", "point-reflection", "equation-reflection"]);
    assert.ok(problems.every(({ answer }) => answer.every(Number.isInteger)));
  }
});
test("answers use mathematical equations without unit or zero coefficients", () => {
  const line = { id: "a", kind: "line-translation" as const, label: "", prompt: "", latex: "", answer: [1, -1, 0], answerMode: "line" as const };
  const quadratic = { ...line, kind: "equation-reflection" as const, answer: [-1, 1, 0], answerMode: "quadratic" as const };
  assert.equal(transformAnswerLatex(line), "x-y=0");
  assert.equal(transformAnswerLatex(quadratic), "y=-x^2+x");
});
test("answer comparison and review selection are exact", () => {
  assert.equal(sameTransformAnswer(["-2", "3"], [-2, 3]), true);
  assert.equal(sameTransformAnswer(["3", "-2"], [-2, 3]), false);
  const kinds = createTransformProblemSet(2).problems.map(({ kind }) => kind);
  assert.deepEqual(createTransformReviewProblems([kinds[4], kinds[4], kinds[1]], 3).map(({ kind }) => kind), [kinds[4], kinds[1]]);
});
test("worksheet keeps the problem body wide and the answer area separate", async () => {
  const css = await readFile(new URL("../app/arithmetic/high-school/high-school.css", import.meta.url), "utf8");
  assert.match(css, /\.polynomial-page\.transform-page \.transform-question\s*\{\s*grid-template-columns: minmax\(0, 1fr\) 205px;/);
  assert.doesNotMatch(css, /\.transform-question\s*\{\s*grid-template-columns: 28px/);
});
