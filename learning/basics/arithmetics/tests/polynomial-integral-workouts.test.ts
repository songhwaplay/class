import assert from "node:assert/strict";
import test from "node:test";
import { createIntegralReviews, createIntegralSet, sameIntegralAnswers } from "../lib/polynomial-integral-workouts.ts";

test("적분 세트는 계산 원리가 다른 다섯 유형을 만든다", () => {
  const first = createIntegralSet(20260809);
  const second = createIntegralSet(20260809);
  assert.deepEqual(first, second);
  assert.equal(first.problems.length, 5);
  assert.equal(new Set(first.problems.map(({ kind }) => kind)).size, 5);
});

test("부정적분은 소문자 미정계수와 표준 적분상수 C를 쓴다", () => {
  const problem = createIntegralSet(20260809).problems.find(({ kind }) => kind === "antiderivative");
  assert.ok(problem);
  assert.deepEqual(problem.answerLabels, ["a", "b", "c"]);
  assert.match(problem.latex, /=ax\^3\+bx\^2\+cx\+C$/);
  assert.doesNotMatch(problem.latex, /\+K/);
});

test("정적분으로 정의된 함수는 상한의 합성미분을 포함한다", () => {
  const problem = createIntegralSet(20260809).problems.find(({ kind }) => kind === "variable-upper-bound");
  assert.ok(problem);
  assert.match(problem.latex, /\\int_1\^\{x\^2\}/);
  assert.match(problem.answerLabels[0], /^F'/);
  assert.ok(problem.answers[0] > 0);
});

test("넓이 문제는 교점과 정적분 계산이 모두 필요하다", () => {
  const problem = createIntegralSet(20260809).problems.find(({ kind }) => kind === "area-between-curves");
  assert.ok(problem);
  assert.match(problem.latex, /x\^2/);
  assert.equal(Number.isInteger(problem.answers[0]), true);
});

test("채점과 오답 보충은 빈 답과 중복 유형을 처리한다", () => {
  assert.equal(sameIntegralAnswers(["2", "-3"], [2, -3]), true);
  assert.equal(sameIntegralAnswers(["", "-3"], [2, -3]), false);
  const reviews = createIntegralReviews(["definite-integral", "definite-integral", "antiderivative"], 3);
  assert.deepEqual(reviews.map(({ kind }) => kind), ["definite-integral", "antiderivative"]);
});
