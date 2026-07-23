import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  composeDifferenceAnswer, composeFG, composeGF, createFunctionTransformationProblemSet,
  createFunctionTransformationReviewProblems, formatFunctionAnswerLatex, formatFunctionProblemLatex,
} from "../lib/function-transformation-workouts.ts";

test("one set covers five distinct composition and inverse-function skills", () => {
  const first = createFunctionTransformationProblemSet(20260726);
  assert.deepEqual(first, createFunctionTransformationProblemSet(20260726));
  assert.deepEqual(first.problems.map(({ kind }) => kind), ["compose-fg", "compose-gf", "composition-difference", "linear-inverse", "rational-inverse"]);
});
test("both composition orders and their difference are calculated exactly", () => {
  assert.deepEqual(composeFG([1, -2, 3], [2, -1]), [4, -8, 6]);
  assert.deepEqual(composeGF([1, -2, 3], [2, -1]), [2, -4, 5]);
  assert.deepEqual(composeDifferenceAnswer([1, -2, 3], [2, -1]), [2, -4, 1]);
});
test("answers and problems are emitted as mathematical LaTeX", () => {
  for (const problem of createFunctionTransformationProblemSet(17).problems) {
    assert.match(formatFunctionProblemLatex(problem), /\\begin\{gathered\}/);
    assert.ok(formatFunctionAnswerLatex(problem).length > 2);
  }
});
test("review problems preserve wrong types and stop at two", () => {
  const kinds = createFunctionTransformationProblemSet(17).problems.map(({ kind }) => kind);
  assert.deepEqual(createFunctionTransformationReviewProblems([kinds[4], kinds[4], kinds[1]], 18).map(({ kind }) => kind), [kinds[4], kinds[1]]);
});
test("worksheet names the actual skill and hides type labels before solving", async () => {
  const page = await readFile(new URL("../app/arithmetic/high-school/function-transformations/page.tsx", import.meta.url), "utf8");
  assert.match(page, /title="합성함수와 역함수"/);
  assert.match(page, /instruction="함수의 합성과 역함수 계산을 수행하세요/);
  assert.match(page, /NumericChoiceWorksheet/);
});
test("complete function expressions are used as four-choice answers", async () => {
  const page = await readFile(new URL("../app/arithmetic/high-school/function-transformations/page.tsx", import.meta.url), "utf8");
  assert.match(page, /formatChoice=\{answerLatex\}/);
  assert.match(page, /formatQuadraticLatex/);
  assert.match(page, /formatLinearLatex/);
  assert.doesNotMatch(page, /<input/);
});
