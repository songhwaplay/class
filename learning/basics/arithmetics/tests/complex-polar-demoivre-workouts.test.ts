import assert from "node:assert/strict";
import test from "node:test";

import { complexPolarDemoivreProblems } from "../lib/complex-polar-demoivre-workouts.ts";

test("극형식부터 드므아브르와 세제곱근까지 다룬다", () => {
  assert.equal(complexPolarDemoivreProblems.length, 7);
  assert.deepEqual(
    complexPolarDemoivreProblems.map(({ label }) => label),
    [
      "절댓값과 편각",
      "복소수의 극형식",
      "극형식에서 직교형식으로",
      "극형식의 곱셈",
      "극형식의 나눗셈",
      "드므아브르 정리",
      "복소수의 세제곱근",
    ],
  );
  for (const problem of complexPolarDemoivreProblems) {
    assert.match(problem.prompt ?? "", /\?$/);
    assert.equal(problem.choices.length, 4);
    assert.equal(problem.choices.filter(({ correct }) => correct).length, 1);
    assert.equal(new Set(problem.choices.map(({ latex }) => latex)).size, 4);
  }
});

test("극형식은 cos θ+i sin θ 표기를 사용한다", () => {
  const formulas = complexPolarDemoivreProblems.flatMap((problem) => [
    problem.latex,
    problem.correctLatex,
    ...problem.choices.map(({ latex }) => latex),
  ]);
  assert.ok(formulas.some((formula) => formula.includes(String.raw`\cos`) && formula.includes(String.raw`i\sin`)));
  assert.ok(formulas.every((formula) => !formula.includes("cis")));
});

test("문장 속 수학 기호는 인라인 수식으로 표시한다", () => {
  const prompts = complexPolarDemoivreProblems.map(({ prompt }) => prompt ?? "");
  assert.ok(prompts.includes("$a+bi$의 꼴로 나타낸 것은?"));
  assert.ok(prompts.includes("곱 $z_1z_2$는?"));
  assert.ok(prompts.includes("몫 $\\dfrac{z_1}{z_2}$는?"));
});
