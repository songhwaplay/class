import type { NumericWorksheetProblem } from "../app/arithmetic/high-school/components/numeric-choice-worksheet";

export type MiddleRationalKind = "integer-add" | "integer-subtract" | "integer-three" | "same-denominator" | "unlike-denominators" | "negative-fractions" | "fraction-three" | "fraction-parentheses";
const KINDS: MiddleRationalKind[] = ["integer-add", "integer-subtract", "integer-three", "same-denominator", "unlike-denominators", "negative-fractions", "fraction-three", "fraction-parentheses"];

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
const integer = (next: () => number, min: number, max: number) => min + Math.floor(next() * (max - min + 1));
function nonzero(next: () => number, min: number, max: number) {
  let value = 0;
  while (value === 0) value = integer(next, min, max);
  return value;
}
function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function reduce(n: number, d: number) {
  const sign = d < 0 ? -1 : 1;
  const divisor = gcd(n, d) || 1;
  return [sign * n / divisor, Math.abs(d) / divisor];
}
function fractionLatex(n: number, d: number) {
  const [numerator, denominator] = reduce(n, d);
  return denominator === 1 ? String(numerator) : `${numerator < 0 ? "-" : ""}\\frac{${Math.abs(numerator)}}{${denominator}}`;
}
function build(kind: MiddleRationalKind, next: () => number, id: string): NumericWorksheetProblem {
  if (kind.startsWith("integer")) {
    const a = nonzero(next, -18, 18), b = nonzero(next, -18, 18), c = nonzero(next, -12, 12);
    if (kind === "integer-add") return { id, kind, label: "정수의 덧셈", prompt: "계산하세요.", latex: `${a}+(${b})`, answers: [a + b], answerLabels: ["답"] };
    if (kind === "integer-subtract") return { id, kind, label: "정수의 뺄셈", prompt: "계산하세요.", latex: `${a}-(${b})`, answers: [a - b], answerLabels: ["답"] };
    return { id, kind, label: "세 정수의 계산", prompt: "계산하세요.", latex: `${a}-(${b})+(${c})`, answers: [a - b + c], answerLabels: ["답"] };
  }
  const d1 = integer(next, 3, 9);
  let d2 = integer(next, 2, 10);
  while (d2 === d1) d2 = integer(next, 2, 10);
  const n1 = nonzero(next, -d1 + 1, d1 - 1), n2 = nonzero(next, -d2 + 1, d2 - 1);
  if (kind === "same-denominator") {
    const n3 = nonzero(next, -d1 + 1, d1 - 1);
    const answer = reduce(n1 + n3, d1);
    return { id, kind, label: "분모가 같은 유리수", prompt: "계산하세요.", latex: `${fractionLatex(n1, d1)}+(${fractionLatex(n3, d1)})`, answers: answer, answerLabels: ["분자", "분모"] };
  }
  const baseNumerator = kind === "negative-fractions" ? -Math.abs(n1) : n1;
  const thirdD = integer(next, 2, 8), thirdN = nonzero(next, -thirdD + 1, thirdD - 1);
  let numerator = baseNumerator * d2 + n2 * d1, denominator = d1 * d2;
  let latex = `${fractionLatex(baseNumerator, d1)}+(${fractionLatex(n2, d2)})`;
  let label = kind === "negative-fractions" ? "음의 유리수 계산" : "분모가 다른 유리수";
  if (kind === "fraction-three") {
    numerator = numerator * thirdD + thirdN * denominator;
    denominator *= thirdD;
    latex += `+(${fractionLatex(thirdN, thirdD)})`;
    label = "세 유리수의 계산";
  } else if (kind === "fraction-parentheses") {
    numerator = baseNumerator * d2 * thirdD - (n2 * thirdD + thirdN * d2) * d1;
    denominator = d1 * d2 * thirdD;
    latex = `${fractionLatex(baseNumerator, d1)}-\\left(${fractionLatex(n2, d2)}+(${fractionLatex(thirdN, thirdD)})\\right)`;
    label = "괄호가 있는 유리수 계산";
  }
  const answer = reduce(numerator, denominator);
  return { id, kind, label, prompt: "계산하세요.", latex, answers: answer[1] === 1 ? [answer[0]] : answer, answerLabels: answer[1] === 1 ? ["답"] : ["분자", "분모"] };
}
export function createMiddleRationalProblemSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => build(kind, next, `middle-rational-${index}`)) };
}
export function createMiddleRationalReviewProblems(kinds: string[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].filter((kind): kind is MiddleRationalKind => KINDS.includes(kind as MiddleRationalKind)).slice(0, 2).map((kind, index) => build(kind, next, `middle-rational-review-${index}-${seed}`));
}
export function formatMiddleRationalChoice(problem: NumericWorksheetProblem, values: number[]) {
  return values.length === 1 ? String(values[0]) : fractionLatex(values[0], values[1]);
}
