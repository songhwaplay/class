export type ComplexKind = "i-power" | "mixed-calculation" | "multiply" | "divide" | "quadratic-roots";

export type ComplexProblem = {
  id: string;
  kind: ComplexKind;
  label: string;
  latex: string;
  answer: { real: number; imaginary: number };
  answerMode: "complex" | "conjugate-pair";
};

export type ComplexChoice = { id: string; latex: string; correct: boolean; misconception: "correct" | "real-sign" | "imaginary-sign" | "swap-parts" };

const KINDS: ComplexKind[] = ["i-power", "mixed-calculation", "multiply", "divide", "quadratic-roots"];
const LABELS: Record<ComplexKind, string> = {
  "i-power": "i의 거듭제곱 · 주기",
  "mixed-calculation": "복합 계산 · 전개와 정리",
  multiply: "복소수 · 곱셈",
  divide: "켤레복소수 · 나눗셈",
  "quadratic-roots": "이차방정식 · 켤레인 두 근",
};

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

function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function nonzero(next: () => number, minimum = -5, maximum = 5) {
  let value = 0;
  while (value === 0) value = integer(next, minimum, maximum);
  return value;
}

function complexLatex(real: number, imaginary: number) {
  if (imaginary === 0) return String(real);
  const imaginaryTerm = `${Math.abs(imaginary) === 1 ? "" : Math.abs(imaginary)}i`;
  if (real === 0) return `${imaginary < 0 ? "-" : ""}${imaginaryTerm}`;
  return `${real}${imaginary < 0 ? "-" : "+"}${imaginaryTerm}`;
}

function buildProblem(kind: ComplexKind, next: () => number, id: string): ComplexProblem {
  if (kind === "i-power") {
    const exponent = integer(next, 13, 48);
    const cycle = exponent % 4;
    const answer = cycle === 0 ? { real: 1, imaginary: 0 }
      : cycle === 1 ? { real: 0, imaginary: 1 }
        : cycle === 2 ? { real: -1, imaginary: 0 }
          : { real: 0, imaginary: -1 };
    return { id, kind, label: LABELS[kind], latex: `i^{${exponent}}`, answer, answerMode: "complex" };
  }
  if (kind === "mixed-calculation") {
    const a = nonzero(next, -5, 5); const b = nonzero(next, -5, 5); const c = nonzero(next, -7, 7); const d = nonzero(next, -7, 7);
    const subtract = integer(next, 0, 1) === 1;
    return {
      id, kind, label: LABELS[kind],
      latex: `\\left(${complexLatex(a, b)}\\right)^2${subtract ? "-" : "+"}\\left(${complexLatex(c, d)}\\right)`,
      answer: {
        real: subtract ? a * a - b * b - c : a * a - b * b + c,
        imaginary: subtract ? 2 * a * b - d : 2 * a * b + d,
      },
      answerMode: "complex",
    };
  }
  if (kind === "multiply") {
    const a = nonzero(next, -4, 4); const b = nonzero(next, -4, 4); const c = nonzero(next, -4, 4); const d = nonzero(next, -4, 4);
    return {
      id, kind, label: LABELS[kind],
      latex: `\\left(${complexLatex(a, b)}\\right)\\left(${complexLatex(c, d)}\\right)`,
      answer: { real: a * c - b * d, imaginary: a * d + b * c },
      answerMode: "complex",
    };
  }
  if (kind === "divide") {
    const resultReal = nonzero(next, -4, 4); const resultImaginary = nonzero(next, -4, 4);
    const divisorReal = nonzero(next, -3, 3); const divisorImaginary = nonzero(next, -3, 3);
    const numeratorReal = resultReal * divisorReal - resultImaginary * divisorImaginary;
    const numeratorImaginary = resultReal * divisorImaginary + resultImaginary * divisorReal;
    return {
      id, kind, label: LABELS[kind],
      latex: `\\frac{${complexLatex(numeratorReal, numeratorImaginary)}}{${complexLatex(divisorReal, divisorImaginary)}}`,
      answer: { real: resultReal, imaginary: resultImaginary },
      answerMode: "complex",
    };
  }
  const real = nonzero(next, -5, 5);
  const imaginary = integer(next, 1, 5);
  return {
    id, kind, label: LABELS[kind],
    latex: `x^2${-2 * real < 0 ? "" : "+"}${-2 * real}x+${real * real + imaginary * imaginary}=0`,
    answer: { real, imaginary },
    answerMode: "conjugate-pair",
  };
}

export function createComplexProblemSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => buildProblem(kind, next, `complex-${index}`)) };
}

export function createComplexReviewProblems(kinds: ComplexKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => buildProblem(kind, next, `complex-review-${index}-${seed}`));
}

export function sameComplexAnswer(real: string, imaginary: string, expected: ComplexProblem["answer"]) {
  if (!/^-?\d+$/.test(real) || !/^-?\d+$/.test(imaginary)) return false;
  return Number(real) === expected.real && Number(imaginary) === expected.imaginary;
}

export function formatComplexAnswerLatex(problem: ComplexProblem, real = problem.answer.real, imaginary = problem.answer.imaginary) {
  const term = `${Math.abs(imaginary) === 1 ? "" : Math.abs(imaginary)}i`;
  if (problem.answerMode === "conjugate-pair") return `x=${real}\\pm ${term}`;
  if (imaginary === 0) return String(real);
  if (real === 0) return `${imaginary < 0 ? "-" : ""}${term}`;
  return `${real}${imaginary < 0 ? "-" : "+"}${term}`;
}

export function createComplexChoices(problem: ComplexProblem): ComplexChoice[] {
  const { real, imaginary } = problem.answer;
  const variants = [
    { id: `${problem.id}-correct`, real, imaginary, correct: true, misconception: "correct" as const },
    { id: `${problem.id}-real-sign`, real: real === 0 ? 1 : -real, imaginary, correct: false, misconception: "real-sign" as const },
    { id: `${problem.id}-imaginary-sign`, real, imaginary: imaginary === 0 ? 1 : -imaginary, correct: false, misconception: "imaginary-sign" as const },
    { id: `${problem.id}-swap-parts`, real: imaginary, imaginary: real, correct: false, misconception: "swap-parts" as const },
  ];
  const seen = new Set<string>();
  const choices = variants.map((variant, index) => {
    let nextReal = variant.real;
    const nextImaginary = variant.imaginary;
    let latex = formatComplexAnswerLatex(problem, nextReal, nextImaginary);
    let adjustment = 1;
    while (seen.has(latex)) {
      nextReal += index + adjustment;
      latex = formatComplexAnswerLatex(problem, nextReal, nextImaginary);
      adjustment += 1;
    }
    seen.add(latex);
    return { id: variant.id, latex, correct: variant.correct, misconception: variant.misconception };
  });
  const next = random(problem.id.split("").reduce((seed, character) => Math.imul(seed ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0);
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [choices[index], choices[target]] = [choices[target], choices[index]];
  }
  return choices;
}
