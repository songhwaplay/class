export type IntegralKind =
  | "antiderivative"
  | "integration-constant"
  | "definite-integral"
  | "variable-upper-bound"
  | "area-between-curves";

export type IntegralProblem = {
  id: string;
  kind: IntegralKind;
  label: string;
  prompt: string;
  latex: string;
  answerLabels: string[];
  answers: number[];
};

const KINDS: IntegralKind[] = [
  "antiderivative",
  "integration-constant",
  "definite-integral",
  "variable-upper-bound",
  "area-between-curves",
];

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function integer(next: () => number, minimum: number, maximum: number) {
  return Math.floor(next() * (maximum - minimum + 1)) + minimum;
}

function signed(value: number) {
  if (value === 0) return "";
  return value < 0 ? String(value) : `+${value}`;
}

function build(kind: IntegralKind, next: () => number, id: string): IntegralProblem {
  if (kind === "antiderivative") {
    const a = integer(next, 2, 5);
    const b = integer(next, -5, 5) || 2;
    const c = integer(next, -6, 6) || -3;
    return {
      id, kind, label: "부정적분의 계수", prompt: "부정적분을 완성하도록 계수를 구하세요.",
      latex: `\\int\\left(${3 * a}x^2${signed(2 * b)}x${signed(c)}\\right)dx=ax^3+bx^2+cx+C`,
      answerLabels: ["a", "b", "c"], answers: [a, b, c],
    };
  }
  if (kind === "integration-constant") {
    const a = integer(next, 2, 5);
    const b = integer(next, -4, 4);
    const constant = integer(next, -8, 8);
    const value = a + b + constant;
    return {
      id, kind, label: "적분상수 결정", prompt: "조건을 만족하는 적분상수를 구하세요.",
      latex: `F'(x)=${2 * a}x${signed(b)},\\qquad F(1)=${value},\\qquad F(x)=${a}x^2${signed(b)}x+C`,
      answerLabels: ["C"], answers: [constant],
    };
  }
  if (kind === "definite-integral") {
    const a = integer(next, 2, 5);
    const n = integer(next, 2, 5);
    const b = integer(next, -4, 4);
    return {
      id, kind, label: "정적분", prompt: "정적분의 값을 구하세요.",
      latex: `\\int_0^{${n}}\\left(${2 * a}x${signed(b)}\\right)dx`,
      answerLabels: ["값"], answers: [a * n * n + b * n],
    };
  }
  if (kind === "variable-upper-bound") {
    const c = integer(next, 1, 4);
    const x = integer(next, 2, 4);
    return {
      id, kind, label: "정적분으로 정의된 함수", prompt: "미분한 뒤 주어진 함수값을 구하세요.",
      latex: `F(x)=\\int_1^{x^2}(t${signed(c)})dt,\\qquad F'(${x})`,
      answerLabels: [`F'(${x})`], answers: [2 * x * (x * x + c)],
    };
  }
  const n = [3, 6][integer(next, 0, 1)];
  const k = integer(next, 1, 3);
  return {
    id, kind, label: "두 곡선 사이의 넓이", prompt: "두 곡선으로 둘러싸인 부분의 넓이를 구하세요.",
    latex: `y=${k * n}x-${k}x^2,\\qquad y=0`,
    answerLabels: ["넓이"], answers: [k * n ** 3 / 6],
  };
}

export function createIntegralSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => build(kind, next, `integral-${index}`)) };
}

export function createIntegralReviews(kinds: IntegralKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `integral-review-${index}-${seed}`));
}

export function sameIntegralAnswers(values: string[], expected: number[]) {
  return values.length === expected.length
    && values.every((value, index) => value.trim() !== "" && Number(value) === expected[index]);
}
