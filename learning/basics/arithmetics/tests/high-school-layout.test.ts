import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const css = fs.readFileSync(
  path.join(process.cwd(), "app/arithmetic/high-school/high-school.css"),
  "utf8",
);

test("고등 학습지는 공통 글자 크기 토큰을 사용한다", () => {
  for (const token of [
    "--high-school-title-size",
    "--high-school-subject-size",
    "--high-school-prompt-size",
    "--high-school-math-size",
    "--high-school-label-size",
  ]) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /font-size:\s*var\(--high-school-math-size\)\s*!important/);
});

test("일반 고등 연산 문제에는 줄 없는 계산 여백이 있다", () => {
  assert.match(css, /max-width:\s*46%/);
  assert.doesNotMatch(
    css,
    /\.polynomial-page \.worksheet-stage \.polynomial-question::after\s*\{/,
  );
  assert.doesNotMatch(css, /repeating-linear-gradient/);
});

test("서술형과 도형형 문제는 전체 폭 예외를 둔다", () => {
  for (const pageClass of [
    "combinatorics-page",
    "logic-page",
    "coordinate-page",
    "circle-page",
  ]) {
    assert.match(css, new RegExp(`polynomial-page\\.${pageClass}`));
  }
});

test("도형형 문제의 번호와 본문은 겹치지 않는다", () => {
  assert.match(
    css,
    /\.polynomial-page \.worksheet-stage \.geometry-choice-question\s*\{[^}]*padding-left:\s*42px;/s,
  );
});

test("7문제와 오답 보충 문제도 모든 행의 높이가 같다", () => {
  for (const count of [7, 8, 9]) {
    assert.match(
      css,
      new RegExp(`\\.polynomial-sheet-${count} \\.polynomial-problem-grid\\s*\\{\\s*grid-template-rows:\\s*repeat\\(${count},\\s*minmax\\(0,\\s*1fr\\)\\)`),
    );
  }
});
