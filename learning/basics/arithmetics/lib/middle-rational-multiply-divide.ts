import type { NumericWorksheetProblem } from "../app/arithmetic/high-school/components/numeric-choice-worksheet";

export type MiddleRationalMultiplyKind =
  | "integer-multiply"
  | "integer-divide"
  | "integer-three"
  | "fraction-multiply"
  | "fraction-cancel"
  | "fraction-divide"
  | "negative-fraction-divide"
  | "fraction-mixed";

const KINDS: MiddleRationalMultiplyKind[] = [
  "integer-multiply",
  "integer-divide",
  "integer-three",
  "fraction-multiply",
  "fraction-cancel",
  "fraction-divide",
  "negative-fraction-divide",
  "fraction-mixed",
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

function problem(
  id: string,
  kind: MiddleRationalMultiplyKind,
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

function build(kind: MiddleRationalMultiplyKind, next: () => number, id: string) {
  if (kind === "integer-multiply") {
    const a = nonzero(next, -12, 12);
    const b = nonzero(next, -12, 12);
    return problem(id, kind, "정수의 곱셈", `(${a})\\times(${b})`, a * b);
  }
  if (kind === "integer-divide") {
    const divisor = nonzero(next, -12, 12);
    const quotient = nonzero(next, -12, 12);
    return problem(id, kind, "정수의 나눗셈", `${divisor * quotient}\\div(${divisor})`, quotient);
  }
  if (kind === "integer-three") {
    const a = nonzero(next, -7, 7);
    const b = nonzero(next, -7, 7);
    const c = nonzero(next, -6, 6);
    return problem(id, kind, "세 정수의 계산", `(${a})\\times(${b})\\div(${c})`, a * b, c);
  }

  const d1 = integer(next, 2, 9);
  const d2 = integer(next, 2, 9);
  const n1 = nonzero(next, -d1 + 1, d1 - 1);
  const n2 = nonzero(next, -d2 + 1, d2 - 1);

  if (kind === "fraction-multiply") {
    return problem(id, kind, "유리수의 곱셈", `${latex(n1, d1)}\\times(${latex(n2, d2)})`, n1 * n2, d1 * d2);
  }
  if (kind === "fraction-cancel") {
    const common = integer(next, 2, 5);
    const leftNumerator = nonzero(next, 1, 6);
    const rightNumerator = nonzero(next, 1, 6);
    const sign = integer(next, 0, 1) ? -1 : 1;
    return problem(
      id,
      kind,
      "곱셈 전 약분",
      `${latex(sign * leftNumerator, common * d1)}\\times${latex(common * rightNumerator, d2)}`,
      sign * leftNumerator * rightNumerator,
      d1 * d2,
    );
  }
  if (kind === "fraction-divide") {
    return problem(id, kind, "유리수의 나눗셈", `${latex(n1, d1)}\\div(${latex(n2, d2)})`, n1 * d2, d1 * n2);
  }
  if (kind === "negative-fraction-divide") {
    return problem(
      id,
      kind,
      "음의 유리수 나눗셈",
      `${latex(-Math.abs(n1), d1)}\\div(${latex(n2, d2)})`,
      -Math.abs(n1) * d2,
      d1 * n2,
    );
  }

  const d3 = integer(next, 2, 8);
  const n3 = nonzero(next, -d3 + 1, d3 - 1);
  return problem(
    id,
    kind,
    "곱셈과 나눗셈의 혼합",
    `${latex(n1, d1)}\\times(${latex(n2, d2)})\\div(${latex(n3, d3)})`,
    n1 * n2 * d3,
    d1 * d2 * n3,
  );
}

export function createMiddleRationalMultiplyProblemSet(seed: number) {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => build(kind, next, `middle-rational-multiply-${index}`)),
  };
}

export function createMiddleRationalMultiplyReviewProblems(kinds: string[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)]
    .filter((kind): kind is MiddleRationalMultiplyKind => KINDS.includes(kind as MiddleRationalMultiplyKind))
    .slice(0, 2)
    .map((kind, index) => build(kind, next, `middle-rational-multiply-review-${index}-${seed}`));
}

export function formatMiddleRationalMultiplyChoice(
  _problem: NumericWorksheetProblem,
  values: number[],
) {
  return values.length === 1 ? String(values[0]) : latex(values[0], values[1]);
}
