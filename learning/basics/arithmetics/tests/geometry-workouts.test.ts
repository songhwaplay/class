import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  conicProblems,
  conicMoveTangentProblems,
  planeVectorProblems,
  projectionProblems,
  vectorGeometryProblems,
  spaceCoordinateProblemSets,
  spaceCoordinateProblems,
} from "../lib/geometry-workouts.ts";

test("covers the geometry workout sequence without duplicate answers", () => {
  const sets = [
    conicProblems,
    conicMoveTangentProblems,
    planeVectorProblems,
    projectionProblems,
    vectorGeometryProblems,
    spaceCoordinateProblems,
  ];
  for (const problems of sets) {
    assert.equal(problems.length, 7);
    for (const problem of problems) {
      assert.equal(problem.choices.length, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
    }
  }
  assert.ok(projectionProblems.some(({ label }) => label === "스칼라 정사영"));
  assert.ok(projectionProblems.some(({ label }) => label === "벡터 정사영"));
  assert.ok(projectionProblems.some(({ label }) => label === "수직 성분"));
  assert.match(projectionProblems.find(({ id }) => id === "p4")?.latex ?? "", /a\\cdot\\vec b/);
  assert.match(projectionProblems.find(({ id }) => id === "p5")?.latex ?? "", /a_\{\\parallel\}=\?/);
  assert.match(projectionProblems.find(({ id }) => id === "p6")?.latex ?? "", /a_\{\\perp\}=\?/);
  assert.doesNotMatch(projectionProblems.map(({ latex }) => latex).join(" "), /operatorname|theta_x:/);
});

test("space-coordinate worksheets rotate genuinely different, nontrivial problem sets", () => {
  assert.equal(spaceCoordinateProblemSets.length, 3);
  const formulas = new Set<string>();
  for (const problems of spaceCoordinateProblemSets) {
    assert.equal(problems.length, 7);
    assert.equal(problems.some(({ label }) => label === "선분의 중점"), false);
    assert.equal(problems.some(({ label }) => label === "구의 방정식"), false);
    for (const problem of problems) {
      assert.equal(problem.choices.length, 4);
      assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
      assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
      if (!problem.id.startsWith("s")) {
        assert.match(problem.prompt ?? "", /\?$/, `${problem.id} needs an explicit question`);
      }
      assert.equal(formulas.has(problem.latex), false, `duplicate formula: ${problem.latex}`);
      formulas.add(problem.latex);
    }
  }
  assert.equal(formulas.size, 21);
});

test("geometry worksheets use the shared slide-over answer panel", async () => {
  const source = await readFile(
    new URL("../app/arithmetic/high-school/components/geometry-choice-worksheet.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /className="geometry-inline-choices"/);
  assert.match(source, />답안 입력<\/button>/);
  assert.match(source, /<WorksheetChoicePanel/);
  assert.match(source, /<MathFormula latex=\{problem\.latex\} displayStyle \/>/);
  assert.match(source, /polynomial-focus-label">\{problem\.label\}/);
  assert.match(source, /geometry-choice-prompt"><InlineMathText text=\{problem\.prompt\}/);
  assert.doesNotMatch(source, /polynomial-focus-label">\{targetQuestion/);
  assert.match(source, /<WorksheetChoicePanel[^>]*displayStyle/);
  assert.match(source, /onClose=\{\(\) => setPanelOpen\(false\)\}/);
});
