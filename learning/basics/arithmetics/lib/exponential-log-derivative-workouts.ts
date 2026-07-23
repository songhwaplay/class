export type ExponentialLogDerivativeKind =
  | "natural-exponential-chain"
  | "general-exponential-chain"
  | "natural-log-chain"
  | "general-log-chain"
  | "polynomial-exponential-product"
  | "logarithm-quotient";

export type ExponentialLogDerivativeChoice = {
  id: string;
  latex: string;
  correct: boolean;
};

export type ExponentialLogDerivativeProblem = {
  id: string;
  kind: ExponentialLogDerivativeKind;
  label: string;
  latex: string;
  answerLatex: string;
  choices: ExponentialLogDerivativeChoice[];
};

const KINDS: ExponentialLogDerivativeKind[] = [
  "natural-exponential-chain",
  "general-exponential-chain",
  "natural-log-chain",
  "general-log-chain",
  "polynomial-exponential-product",
  "logarithm-quotient",
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

function integer(next: () => number, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

function signed(value: number) {
  return value === 0 ? "" : value < 0 ? String(value) : `+${value}`;
}

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function choices(correct: string, distractors: string[], next: () => number) {
  const unique = [...new Set([correct, ...distractors])].slice(0, 4);
  return shuffle(unique.map((latex, index) => ({
    id: `choice-${index}-${latex}`,
    latex,
    correct: latex === correct,
  })), next);
}

function build(kind: ExponentialLogDerivativeKind, next: () => number, id: string): ExponentialLogDerivativeProblem {
  const c = integer(next, 2, 5);
  const a = integer(next, 2, 5);
  const b = integer(next, -4, 4);
  const argument = `${a}x${signed(b)}`;

  if (kind === "natural-exponential-chain") {
    const answer = `${c * a}e^{${argument}}`;
    return {
      id, kind, label: "자연지수함수의 합성미분",
      latex: `f(x)=${c}e^{${argument}}`,
      answerLatex: `f^{\\prime}(x)=${answer}`,
      choices: choices(answer, [`${c}e^{${argument}}`, `${c * a + 1}e^{${argument}}`, `-${c * a}e^{${argument}}`], next),
    };
  }

  if (kind === "general-exponential-chain") {
    const base = integer(next, 2, 7);
    const answer = `${c * a}\\cdot${base}^{${argument}}\\ln ${base}`;
    return {
      id, kind, label: "지수함수의 합성미분",
      latex: `f(x)=${c}\\cdot${base}^{${argument}}`,
      answerLatex: `f^{\\prime}(x)=${answer}`,
      choices: choices(answer, [
        `${c * a}\\cdot${base}^{${argument}}`,
        `${c}\\cdot${base}^{${argument}}\\ln ${base}`,
        `\\dfrac{${c * a}\\cdot${base}^{${argument}}}{\\ln ${base}}`,
      ], next),
    };
  }

  if (kind === "natural-log-chain") {
    const answer = `\\dfrac{${c * a}}{${argument}}`;
    return {
      id, kind, label: "자연로그함수의 합성미분",
      latex: `f(x)=${c}\\ln(${argument})`,
      answerLatex: `f^{\\prime}(x)=${answer}`,
      choices: choices(answer, [
        `\\dfrac{${c}}{${argument}}`,
        `${c * a}\\ln(${argument})`,
        `\\dfrac{${c * a}}{x}`,
      ], next),
    };
  }

  if (kind === "general-log-chain") {
    const base = integer(next, 2, 7);
    const answer = `\\dfrac{${c * a}}{(${argument})\\ln ${base}}`;
    return {
      id, kind, label: "로그함수의 합성미분",
      latex: `f(x)=${c}\\log_{${base}}(${argument})`,
      answerLatex: `f^{\\prime}(x)=${answer}`,
      choices: choices(answer, [
        `\\dfrac{${c * a}}{${argument}}`,
        `\\dfrac{${c}}{(${argument})\\ln ${base}}`,
        `\\dfrac{${c * a}\\ln ${base}}{${argument}}`,
      ], next),
    };
  }

  const power = integer(next, 2, 5);
  if (kind === "polynomial-exponential-product") {
    const answer = `x^{${power - 1}}e^{${a}x}(${power}+${a}x)`;
    return {
      id, kind, label: "다항함수와 지수함수의 곱",
      latex: `f(x)=x^{${power}}e^{${a}x}`,
      answerLatex: `f^{\\prime}(x)=${answer}`,
      choices: choices(answer, [
        `${power}x^{${power - 1}}e^{${a}x}`,
        `${a}x^{${power}}e^{${a}x}`,
        `x^{${power - 1}}e^{${a}x}(${power}-${a}x)`,
      ], next),
    };
  }

  const answer = `\\dfrac{1-${power}\\ln x}{x^{${power + 1}}}`;
  return {
    id, kind, label: "로그함수와 거듭제곱의 몫",
    latex: `f(x)=\\dfrac{\\ln x}{x^{${power}}}`,
    answerLatex: `f^{\\prime}(x)=${answer}`,
    choices: choices(answer, [
      `\\dfrac{1+${power}\\ln x}{x^{${power + 1}}}`,
      `\\dfrac{1-${power}\\ln x}{x^{${power}}}`,
      `\\dfrac{1}{x^{${power + 1}}}`,
    ], next),
  };
}

export function createExponentialLogDerivativeProblemSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => build(kind, next, `exponential-log-derivative-${index}`)) };
}

export function createExponentialLogDerivativeReviewProblems(kinds: ExponentialLogDerivativeKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `exponential-log-derivative-review-${index}-${seed}`));
}
