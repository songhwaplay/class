export type DerivativeKind =
  | "product-chain"
  | "quotient-simplify"
  | "exponential-log-chain"
  | "trigonometric-product";

type ProductChainProblem = {
  id: string;
  kind: "product-chain";
  label: string;
  quadraticConstant: number;
  linearCoefficient: number;
  linearConstant: number;
  power: number;
  answer: [number, number, number];
};

type QuotientProblem = {
  id: string;
  kind: "quotient-simplify";
  label: string;
  quadraticCoefficient: number;
  quadraticConstant: number;
  denominatorRoot: number;
  answer: [number, number, number];
};

type ExponentialLogProblem = {
  id: string;
  kind: "exponential-log-chain";
  label: string;
  logCoefficient: number;
  quadraticConstant: number;
  exponentialCoefficient: number;
  exponentialRate: number;
  answer: [number, number];
};

type TrigonometricProductProblem = {
  id: string;
  kind: "trigonometric-product";
  label: string;
  coefficient: number;
  power: number;
  rate: number;
  trig: "sin" | "cos";
  answer: [number, number];
};

export type DerivativeProblem =
  | ProductChainProblem
  | QuotientProblem
  | ExponentialLogProblem
  | TrigonometricProductProblem;

export type DerivativeProblemSet = {
  seed: number;
  problems: DerivativeProblem[];
};

const KINDS: DerivativeKind[] = [
  "product-chain",
  "quotient-simplify",
  "exponential-log-chain",
  "trigonometric-product",
];

const LABELS: Record<DerivativeKind, string> = {
  "product-chain": "곱의 미분 · 합성함수",
  "quotient-simplify": "몫의 미분 · 분자 정리",
  "exponential-log-chain": "지수·로그 · 합성함수",
  "trigonometric-product": "삼각함수 · 곱의 미분",
};

const PRODUCT_VARIANTS = [
  { quadraticConstant: -1, linearCoefficient: 2, linearConstant: 3, power: 4 },
  { quadraticConstant: 2, linearCoefficient: 3, linearConstant: -1, power: 3 },
  { quadraticConstant: -4, linearCoefficient: 1, linearConstant: 2, power: 5 },
] as const;

const QUOTIENT_VARIANTS = [
  { quadraticCoefficient: 1, quadraticConstant: 1, denominatorRoot: 1 },
  { quadraticCoefficient: 2, quadraticConstant: -3, denominatorRoot: -2 },
  { quadraticCoefficient: 3, quadraticConstant: 2, denominatorRoot: 2 },
] as const;

const EXPONENTIAL_LOG_VARIANTS = [
  { logCoefficient: 2, quadraticConstant: 1, exponentialCoefficient: 3, exponentialRate: 2 },
  { logCoefficient: 3, quadraticConstant: 4, exponentialCoefficient: 2, exponentialRate: 3 },
  { logCoefficient: 1, quadraticConstant: 2, exponentialCoefficient: 4, exponentialRate: 2 },
] as const;

const TRIGONOMETRIC_VARIANTS = [
  { coefficient: 1, power: 2, rate: 3, trig: "sin" as const },
  { coefficient: 2, power: 3, rate: 2, trig: "cos" as const },
  { coefficient: 3, power: 2, rate: 4, trig: "sin" as const },
] as const;

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

function pick<T>(next: () => number, values: readonly T[]) {
  return values[Math.floor(next() * values.length)];
}

function buildProblem(kind: DerivativeKind, next: () => number, id: string): DerivativeProblem {
  if (kind === "product-chain") {
    const variant = pick(next, PRODUCT_VARIANTS);
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: [
        variant.linearCoefficient * (variant.power + 2),
        2 * variant.linearConstant,
        variant.power * variant.linearCoefficient * variant.quadraticConstant,
      ],
    };
  }

  if (kind === "quotient-simplify") {
    const variant = pick(next, QUOTIENT_VARIANTS);
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: [
        variant.quadraticCoefficient,
        -2 * variant.quadraticCoefficient * variant.denominatorRoot,
        -variant.quadraticConstant,
      ],
    };
  }

  if (kind === "exponential-log-chain") {
    const variant = pick(next, EXPONENTIAL_LOG_VARIANTS);
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: [
        2 * variant.logCoefficient,
        variant.exponentialCoefficient * variant.exponentialRate,
      ],
    };
  }

  const variant = pick(next, TRIGONOMETRIC_VARIANTS);
  return {
    id,
    kind,
    label: LABELS[kind],
    ...variant,
    answer: [variant.coefficient * variant.power, variant.coefficient * variant.rate],
  };
}

export function createDerivativeProblemSet(seed: number): DerivativeProblemSet {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => buildProblem(kind, next, `derivative-${index}`)) };
}

export function createDerivativeReviewProblems(kinds: DerivativeKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => buildProblem(kind, next, `derivative-review-${index}-${seed}`));
}

function superscript(value: number) {
  const characters: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return String(value).split("").map((character) => characters[character]).join("");
}

function signedConstant(value: number) {
  if (value === 0) return "";
  return value > 0 ? ` + ${value}` : ` − ${Math.abs(value)}`;
}

function coefficient(value: number) {
  if (value === 1) return "";
  if (value === -1) return "−";
  return String(value);
}

function binomial(linear: number, constant: number) {
  return `${coefficient(linear)}x${signedConstant(constant)}`;
}

function quadratic(coefficients: [number, number, number]) {
  const [a, b, c] = coefficients;
  const first = `${coefficient(a)}x²`;
  const second = b === 0 ? "" : b > 0 ? ` + ${coefficient(b)}x` : ` − ${coefficient(Math.abs(b))}x`;
  return `${first}${second}${signedConstant(c)}`;
}

export function formatDerivativeProblem(problem: DerivativeProblem) {
  if (problem.kind === "product-chain") {
    return `(x²${signedConstant(problem.quadraticConstant)})(${binomial(problem.linearCoefficient, problem.linearConstant)})${superscript(problem.power)}`;
  }
  if (problem.kind === "quotient-simplify") {
    return `(${coefficient(problem.quadraticCoefficient)}x²${signedConstant(problem.quadraticConstant)})/(${binomial(1, -problem.denominatorRoot)})`;
  }
  if (problem.kind === "exponential-log-chain") {
    return `${coefficient(problem.logCoefficient)}ln(x² + ${problem.quadraticConstant}) + ${coefficient(problem.exponentialCoefficient)}e^(${problem.exponentialRate}x)`;
  }
  return `${coefficient(problem.coefficient)}x${superscript(problem.power)} ${problem.trig}(${problem.rate}x)`;
}

export function formatDerivativeTemplate(problem: DerivativeProblem) {
  if (problem.kind === "product-chain") {
    return `f′(x) = (${binomial(problem.linearCoefficient, problem.linearConstant)})${superscript(problem.power - 1)}(Ax² + Bx + C)`;
  }
  if (problem.kind === "quotient-simplify") {
    return `f′(x) = (Ax² + Bx + C)/(${binomial(1, -problem.denominatorRoot)})²`;
  }
  if (problem.kind === "exponential-log-chain") {
    return `f′(x) = Ax/(x² + ${problem.quadraticConstant}) + Be^(${problem.exponentialRate}x)`;
  }
  const firstTrig = problem.trig;
  const secondTrig = problem.trig === "sin" ? "cos" : "sin";
  const operator = problem.trig === "sin" ? "+" : "−";
  return `f′(x) = Ax${superscript(problem.power - 1)} ${firstTrig}(${problem.rate}x) ${operator} Bx${superscript(problem.power)} ${secondTrig}(${problem.rate}x)`;
}

export function formatDerivativeAnswer(problem: DerivativeProblem) {
  if (problem.kind === "product-chain") {
    return `(${binomial(problem.linearCoefficient, problem.linearConstant)})${superscript(problem.power - 1)}(${quadratic(problem.answer)})`;
  }
  if (problem.kind === "quotient-simplify") {
    return `(${quadratic(problem.answer)})/(${binomial(1, -problem.denominatorRoot)})²`;
  }
  if (problem.kind === "exponential-log-chain") {
    return `${problem.answer[0]}x/(x² + ${problem.quadraticConstant}) + ${problem.answer[1]}e^(${problem.exponentialRate}x)`;
  }
  const firstTrig = problem.trig;
  const secondTrig = problem.trig === "sin" ? "cos" : "sin";
  const operator = problem.trig === "sin" ? "+" : "−";
  return `${problem.answer[0]}x${superscript(problem.power - 1)} ${firstTrig}(${problem.rate}x) ${operator} ${problem.answer[1]}x${superscript(problem.power)} ${secondTrig}(${problem.rate}x)`;
}

function latexCoefficient(value: number) {
  if (value === 1) return "";
  if (value === -1) return "-";
  return String(value);
}

function latexSignedConstant(value: number) {
  if (value === 0) return "";
  return value > 0 ? `+${value}` : `-${Math.abs(value)}`;
}

function latexBinomial(linear: number, constant: number) {
  return `${latexCoefficient(linear)}x${latexSignedConstant(constant)}`;
}

function latexQuadratic([a, b, c]: [number, number, number]) {
  const first = `${latexCoefficient(a)}x^{2}`;
  const second = b === 0 ? "" : b > 0 ? `+${latexCoefficient(b)}x` : `-${latexCoefficient(Math.abs(b))}x`;
  return `${first}${second}${latexSignedConstant(c)}`;
}

function latexTrig(trig: "sin" | "cos", argument: string) {
  return `\\${trig}\\left(${argument}\\right)`;
}

export function formatDerivativeProblemLatex(problem: DerivativeProblem) {
  if (problem.kind === "product-chain") {
    return `f(x)=\\left(x^{2}${latexSignedConstant(problem.quadraticConstant)}\\right)\\left(${latexBinomial(problem.linearCoefficient, problem.linearConstant)}\\right)^{${problem.power}}`;
  }
  if (problem.kind === "quotient-simplify") {
    return `f(x)=\\dfrac{${latexCoefficient(problem.quadraticCoefficient)}x^{2}${latexSignedConstant(problem.quadraticConstant)}}{${latexBinomial(1, -problem.denominatorRoot)}}`;
  }
  if (problem.kind === "exponential-log-chain") {
    return `f(x)=${latexCoefficient(problem.logCoefficient)}\\ln\\left(x^{2}+${problem.quadraticConstant}\\right)+${latexCoefficient(problem.exponentialCoefficient)}e^{${problem.exponentialRate}x}`;
  }
  return `f(x)=${latexCoefficient(problem.coefficient)}x^{${problem.power}}\\,${latexTrig(problem.trig, `${problem.rate}x`)}`;
}

export function formatDerivativeTemplateLatex(problem: DerivativeProblem) {
  if (problem.kind === "product-chain") {
    return `f^{\\prime}(x)=\\left(${latexBinomial(problem.linearCoefficient, problem.linearConstant)}\\right)^{${problem.power - 1}}\\left(Ax^{2}+Bx+C\\right)`;
  }
  if (problem.kind === "quotient-simplify") {
    return `f^{\\prime}(x)=\\dfrac{Ax^{2}+Bx+C}{\\left(${latexBinomial(1, -problem.denominatorRoot)}\\right)^{2}}`;
  }
  if (problem.kind === "exponential-log-chain") {
    return `f^{\\prime}(x)=\\dfrac{Ax}{x^{2}+${problem.quadraticConstant}}+Be^{${problem.exponentialRate}x}`;
  }
  const firstTrig = problem.trig;
  const secondTrig = problem.trig === "sin" ? "cos" : "sin";
  const operator = problem.trig === "sin" ? "+" : "-";
  return `f^{\\prime}(x)=Ax^{${problem.power - 1}}${latexTrig(firstTrig, `${problem.rate}x`)}${operator}Bx^{${problem.power}}${latexTrig(secondTrig, `${problem.rate}x`)}`;
}

export function formatDerivativeAnswerLatex(problem: DerivativeProblem) {
  if (problem.kind === "product-chain") {
    return `f^{\\prime}(x)=\\left(${latexBinomial(problem.linearCoefficient, problem.linearConstant)}\\right)^{${problem.power - 1}}\\left(${latexQuadratic(problem.answer)}\\right)`;
  }
  if (problem.kind === "quotient-simplify") {
    return `f^{\\prime}(x)=\\dfrac{${latexQuadratic(problem.answer)}}{\\left(${latexBinomial(1, -problem.denominatorRoot)}\\right)^{2}}`;
  }
  if (problem.kind === "exponential-log-chain") {
    return `f^{\\prime}(x)=\\dfrac{${problem.answer[0]}x}{x^{2}+${problem.quadraticConstant}}+${problem.answer[1]}e^{${problem.exponentialRate}x}`;
  }
  const firstTrig = problem.trig;
  const secondTrig = problem.trig === "sin" ? "cos" : "sin";
  const operator = problem.trig === "sin" ? "+" : "-";
  return `f^{\\prime}(x)=${problem.answer[0]}x^{${problem.power - 1}}${latexTrig(firstTrig, `${problem.rate}x`)}${operator}${problem.answer[1]}x^{${problem.power}}${latexTrig(secondTrig, `${problem.rate}x`)}`;
}
