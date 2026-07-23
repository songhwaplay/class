import type { NumericWorksheetProblem } from "../app/arithmetic/high-school/components/numeric-choice-worksheet";

export type MiddleExpressionValueKind =
  | "single-linear"
  | "linear-constant"
  | "negative-substitution"
  | "single-square"
  | "two-variables"
  | "two-variable-square"
  | "fraction-coefficient"
  | "fraction-expression";

const KINDS: MiddleExpressionValueKind[] = [
  "single-linear",
  "linear-constant",
  "negative-substitution",
  "single-square",
  "two-variables",
  "two-variable-square",
  "fraction-coefficient",
  "fraction-expression",
];

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

const integer = (next: () => number, min: number, max: number) =>
  min + Math.floor(next() * (max - min + 1));

function nonzero(next: () => number, min: number, max: number) {
  let value = 0;
  while (value === 0) value = integer(next, min, max);
  return value;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function reduce(numerator: number, denominator: number) {
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator) || 1;
  return [sign * numerator / divisor, Math.abs(denominator) / divisor];
}

function numberLatex(numerator: number, denominator = 1) {
  const [n, d] = reduce(numerator, denominator);
  return d === 1 ? String(n) : `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
}

function signed(value: number) {
  return value < 0 ? String(value) : `+${value}`;
}

function makeProblem(
  id: string,
  kind: MiddleExpressionValueKind,
  label: string,
  prompt: string,
  expression: string,
  numerator: number,
  denominator = 1,
): NumericWorksheetProblem {
  const answer = reduce(numerator, denominator);
  return {
    id,
    kind,
    label,
    prompt,
    latex: expression,
    answers: answer[1] === 1 ? [answer[0]] : answer,
    answerLabels: answer[1] === 1 ? ["답"] : ["분자", "분모"],
  };
}

function build(kind: MiddleExpressionValueKind, next: () => number, id: string) {
  const x = nonzero(next, -6, 6);
  const y = nonzero(next, -5, 5);
  const a = nonzero(next, -7, 7);
  const b = nonzero(next, -9, 9);

  if (kind === "single-linear") {
    return makeProblem(id, kind, "한 문자의 값", `x=${x}일 때 식의 값을 구하세요.`, `${a}x`, a * x);
  }
  if (kind === "linear-constant") {
    return makeProblem(id, kind, "일차식의 값", `x=${x}일 때 식의 값을 구하세요.`, `${a}x${signed(b)}`, a * x + b);
  }
  if (kind === "negative-substitution") {
    const negativeX = -Math.abs(x);
    return makeProblem(id, kind, "음수의 대입", `x=${negativeX}일 때 식의 값을 구하세요.`, `${a}x-${b < 0 ? `(${b})` : b}`, a * negativeX - b);
  }
  if (kind === "single-square") {
    const c = nonzero(next, -5, 5);
    return makeProblem(id, kind, "거듭제곱이 있는 식", `x=${x}일 때 식의 값을 구하세요.`, `${a}x^2${signed(c)}x${signed(b)}`, a * x * x + c * x + b);
  }
  if (kind === "two-variables") {
    const c = nonzero(next, -7, 7);
    return makeProblem(id, kind, "두 문자의 값", `x=${x},\\ y=${y}일 때 식의 값을 구하세요.`, `${a}x${c < 0 ? "" : "+"}${c}y`, a * x + c * y);
  }
  if (kind === "two-variable-square") {
    const c = nonzero(next, -4, 4);
    return makeProblem(id, kind, "두 문자와 거듭제곱", `x=${x},\\ y=${y}일 때 식의 값을 구하세요.`, `x^2${c < 0 ? "" : "+"}${c}xy+y^2`, x * x + c * x * y + y * y);
  }
  if (kind === "fraction-coefficient") {
    const denominator = integer(next, 2, 7);
    return makeProblem(id, kind, "분수 계수의 식", `x=${x}일 때 식의 값을 구하세요.`, `\\frac{${a}x${signed(b)}}{${denominator}}`, a * x + b, denominator);
  }

  let divisor = nonzero(next, -5, 5);
  while ((a * x + b) % divisor === 0) divisor = nonzero(next, -5, 5);
  return makeProblem(
    id,
    kind,
    "나눗셈으로 나타낸 식",
    `x=${x},\\ y=${divisor}일 때 식의 값을 구하세요.`,
    `\\frac{${a}x${signed(b)}}{y}`,
    a * x + b,
    divisor,
  );
}

export function createMiddleExpressionValueProblemSet(seed: number) {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => build(kind, next, `middle-expression-value-${index}`)),
  };
}

export function createMiddleExpressionValueReviewProblems(kinds: string[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)]
    .filter((kind): kind is MiddleExpressionValueKind => KINDS.includes(kind as MiddleExpressionValueKind))
    .slice(0, 2)
    .map((kind, index) => build(kind, next, `middle-expression-value-review-${index}-${seed}`));
}

export function formatMiddleExpressionValueChoice(
  _problem: NumericWorksheetProblem,
  values: number[],
) {
  return values.length === 1 ? String(values[0]) : numberLatex(values[0], values[1]);
}
