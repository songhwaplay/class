import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  choose, createCombinationProblemSet, createPermutationProblemSet,
  createPermutationCombinationReviewProblems, factorial, samePermutationCombinationAnswer,
} from "../lib/permutations-combinations-workouts.ts";

test("factorial and combination helpers return exact values", () => {
  assert.equal(factorial(6), 720);
  assert.equal(choose(8, 3), 56);
  assert.equal(choose(4, 7), 0);
});
test("permutation set covers its five distinct types", () => {
  const kinds = createPermutationProblemSet(12).problems.map(({ kind }) => kind);
  assert.deepEqual(kinds, ["basic-permutation", "adjacent-arrangement", "circular-permutation", "repeated-permutation", "identical-permutation"]);
});
test("combination set covers its five distinct types", () => {
  const kinds = createCombinationProblemSet(12).problems.map(({ kind }) => kind);
  assert.deepEqual(kinds, ["basic-combination", "mixed-committee", "not-together-selection", "required-selection", "repeated-combination"]);
});
test("all generated answers are positive integers", () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const problems = [...createPermutationProblemSet(seed).problems, ...createCombinationProblemSet(seed).problems];
    assert.ok(problems.every(({ answer }) => Number.isInteger(answer) && answer > 0));
  }
});
test("new seeds vary wording as well as numbers", () => {
  for (const createSet of [createPermutationProblemSet, createCombinationProblemSet]) {
    const sets = Array.from({ length: 30 }, (_, seed) => createSet(seed + 100).problems);
    for (let index = 0; index < 5; index += 1) {
      assert.ok(new Set(sets.map((set) => set[index].prompt.replace(/\d+/g, "#"))).size >= 3);
    }
  }
});
test("review selection and answer comparison work", () => {
  const kinds = createPermutationProblemSet(1).problems.map(({ kind }) => kind);
  assert.equal(createPermutationCombinationReviewProblems([kinds[0], kinds[0], kinds[2]], 2).length, 2);
  assert.equal(samePermutationCombinationAnswer("120", 120), true);
  assert.equal(samePermutationCombinationAnswer("120.0", 120), false);
});
test("permutation and combination worksheets follow common-math order without pre-solve formulas", async () => {
  const page = await readFile(new URL("../app/arithmetic/high-school/combinatorics-worksheet.tsx", import.meta.url), "utf8");
  assert.match(page, /subject="공통수학 1"/);
  assert.match(page, /showLatexOnWorksheet=\{false\}/);
  assert.match(page, /NumericChoiceWorksheet/);
});
