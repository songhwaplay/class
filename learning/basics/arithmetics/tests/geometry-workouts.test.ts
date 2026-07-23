import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  conicProblems,
  conicMoveTangentProblems,
  planeVectorProblems,
  projectionProblems,
  vectorGeometryProblems,
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
  assert.match(projectionProblems.find(({ id }) => id === "p4")?.latex ?? "", /comp/);
  assert.match(projectionProblems.find(({ id }) => id === "p5")?.latex ?? "", /proj/);
  assert.match(projectionProblems.find(({ id }) => id === "p6")?.latex ?? "", /a-\u005coperatorname\{proj\}/);
});

test("geometry worksheets render directly clickable multiple-choice answers", async () => {
  const source = await readFile(
    new URL("../app/arithmetic/high-school/components/geometry-choice-worksheet.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /className="geometry-inline-choices"/);
  assert.match(source, /onClick=\{\(\) => selectChoice\(problem\.id, choice\.id\)\}/);
  assert.match(source, /aria-pressed=\{selected\[problem\.id\] === choice\.id\}/);
});
