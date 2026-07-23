import type { NumericWorksheetProblem } from "../app/arithmetic/high-school/components/numeric-choice-worksheet";

export type MiddleRationalMixedKind =
  | "integer-priority"
  | "integer-parentheses"
  | "integer-power"
  | "integer-nested"
  | "fraction-priority"
  | "fraction-parentheses"
  | "fraction-power"
  | "fraction-comprehensive";

const KINDS: MiddleRationalMixedKind[] = [
  "integer-priority",
  "integer-parentheses",
  "integer-power",
  "integer-nested",
  "fraction-priority",
  "fraction-parentheses",
  "fraction-power",
  "fraction-comprehensive",
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

function latex(numerator: number, denominator = 1) {
  const [n, d] = reduce(numerator, denominator);
  return d === 1 ? String(n) : `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
}

function makeProblem(
  id: string,
  kind: MiddleRationalMixedKind,
  label: string,
  expression: string,
  numerator: number,
  denominator = 1,
): NumericWorksheetProblem {
  const answer = reduce(numerator, denominator);
  return {
    id,
    kind,
    label,
    prompt: "계산하세요.",
    latex: expression,
    answers: answer[1] === 1 ? [answer[0]] : answer,
    answerLabels: answer[1] === 1 ? ["답"] : ["분자", "분모"],
  };
}

function build(kind: MiddleRationalMixedKind, next: () => number, id: string) {
  const a = nonzero(next, -9, 9);
  const b = nonzero(next, -7, 7);
  const c = nonzero(next, -6, 6);

  if (kind === "integer-priority") {
    return makeProblem(id, kind, "곱셈이 있는 정수 계산", `${a}+(${b})\\times(${c})`, a + b * c);
  }
  if (kind === "integer-parentheses") {
    return makeProblem(id, kind, "괄호가 있는 정수 계산", `(${a}-(${b}))\\times(${c})`, (a - b) * c);
  }
  if (kind === "integer-power") {
    const base = nonzero(next, -5, 5);
    const multiplier = nonzero(next, -5, 5);
    return makeProblem(id, kind, "거듭제곱과 부호", `-(${base})^2+(${multiplier})\\times(${c})`, -(base ** 2) + multiplier * c);
  }
  if (kind === "integer-nested") {
    const divisor = nonzero(next, -5, 5);
    const quotient = nonzero(next, -6, 6);
    const inner = divisor * quotient;
    return makeProblem(id, kind, "중괄호가 있는 계산", `${a}-\\left\\{${b}-(${inner})\\div(${divisor})\\right\\}`, a - (b - quotient));
  }

  const d1 = integer(next, 2, 8);
  const d2 = integer(next, 2, 8);
  const d3 = integer(next, 2, 7);
  const n1 = nonzero(next, -d1 + 1, d1 - 1);
  const n2 = nonzero(next, -d2 + 1, d2 - 1);
  const n3 = nonzero(next, -d3 + 1, d3 - 1);

  if (kind === "fraction-priority") {
    const numerator = n1 * d2 * d3 + n2 * n3 * d1;
    return makeProblem(id, kind, "유리수의 계산 순서", `${latex(n1, d1)}+(${latex(n2, d2)})\\times(${latex(n3, d3)})`, numerator, d1 * d2 * d3);
  }
  if (kind === "fraction-parentheses") {
    const numerator = (n1 * d2 - n2 * d1) * n3;
    return makeProblem(id, kind, "괄호가 있는 유리수 계산", `\\left(${latex(n1, d1)}-(${latex(n2, d2)})\\right)\\times(${latex(n3, d3)})`, numerator, d1 * d2 * d3);
  }
  if (kind === "fraction-power") {
    const baseNumerator = nonzero(next, -4, 4);
    const baseDenominator = integer(next, 2, 6);
    const numerator = baseNumerator ** 2 * d1 + n1 * baseDenominator ** 2;
    return makeProblem(id, kind, "분수의 거듭제곱", `\\left(${latex(baseNumerator, baseDenominator)}\\right)^2+(${latex(n1, d1)})`, numerator, baseDenominator ** 2 * d1);
  }

  const productNumerator = n2 * n3;
  const productDenominator = d2 * d3;
  const numerator = n1 * productNumerator - d1 * productDenominator;
  const denominator = d1 * productNumerator;
  return makeProblem(
    id,
    kind,
    "유리수 종합 계산",
    `${latex(n1, d1)}-\\left\\{${latex(n2, d2)}\\times(${latex(n3, d3)})\\right\\}^{-1}`,
    numerator,
    denominator,
  );
}

export function createMiddleRationalMixedProblemSet(seed: number) {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => build(kind, next, `middle-rational-mixed-${index}`)),
  };
}

export function createMiddleRationalMixedReviewProblems(kinds: string[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)]
    .filter((kind): kind is MiddleRationalMixedKind => KINDS.includes(kind as MiddleRationalMixedKind))
    .slice(0, 2)
    .map((kind, index) => build(kind, next, `middle-rational-mixed-review-${index}-${seed}`));
}

export function formatMiddleRationalMixedChoice(
  _problem: NumericWorksheetProblem,
  values: number[],
) {
  return values.length === 1 ? String(values[0]) : latex(values[0], values[1]);
}
