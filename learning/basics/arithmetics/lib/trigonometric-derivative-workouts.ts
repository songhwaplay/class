export type TrigonometricDerivativeKind =
  | "sin-cos-chain"
  | "tangent-chain"
  | "trigonometric-power"
  | "polynomial-product"
  | "trigonometric-quotient";

export type TrigonometricFunction = "sin" | "cos" | "tan" | "sec²";

export type TrigonometricDerivativeAnswer = {
  coefficients: number[];
  functions: TrigonometricFunction[];
};

type SinCosChainProblem = {
  id: string;
  kind: "sin-cos-chain";
  label: string;
  sineCoefficient: number;
  sineRate: number;
  sineConstant: number;
  cosineCoefficient: number;
  cosineRate: number;
  cosineConstant: number;
  answer: TrigonometricDerivativeAnswer;
};

type TangentChainProblem = {
  id: string;
  kind: "tangent-chain";
  label: string;
  coefficient: number;
  rate: number;
  constant: number;
  answer: TrigonometricDerivativeAnswer;
};

type TrigonometricPowerProblem = {
  id: string;
  kind: "trigonometric-power";
  label: string;
  coefficient: number;
  power: number;
  rate: number;
  constant: number;
  trig: "sin" | "cos";
  answer: TrigonometricDerivativeAnswer;
};

type PolynomialProductProblem = {
  id: string;
  kind: "polynomial-product";
  label: string;
  coefficient: number;
  power: number;
  rate: number;
  trig: "sin" | "cos";
  answer: TrigonometricDerivativeAnswer;
};

type TrigonometricQuotientProblem = {
  id: string;
  kind: "trigonometric-quotient";
  label: string;
  coefficient: number;
  power: number;
  rate: number;
  trig: "sin" | "cos";
  answer: TrigonometricDerivativeAnswer;
};

export type TrigonometricDerivativeProblem =
  | SinCosChainProblem
  | TangentChainProblem
  | TrigonometricPowerProblem
  | PolynomialProductProblem
  | TrigonometricQuotientProblem;

export type TrigonometricDerivativeProblemSet = {
  seed: number;
  problems: TrigonometricDerivativeProblem[];
};

export type TrigonometricDerivativeChoice = {
  id: string;
  latex: string;
  correct: boolean;
  misconception: "correct" | "inner-derivative" | "sign" | "function-rule" | "power-rule" | "missing-term" | "denominator-power";
};

const KINDS: TrigonometricDerivativeKind[] = [
  "sin-cos-chain",
  "tangent-chain",
  "trigonometric-power",
  "polynomial-product",
  "trigonometric-quotient",
];

const LABELS: Record<TrigonometricDerivativeKind, string> = {
  "sin-cos-chain": "사인·코사인 · 합성함수와 부호",
  "tangent-chain": "탄젠트 · 안쪽 미분",
  "trigonometric-power": "삼각함수의 거듭제곱 · 합성함수",
  "polynomial-product": "다항식×삼각함수 · 곱의 미분",
  "trigonometric-quotient": "삼각함수÷다항식 · 몫의 미분",
};

const SIN_COS_VARIANTS = [
  { sineCoefficient: 2, sineRate: 3, sineConstant: 1, cosineCoefficient: 4, cosineRate: 2, cosineConstant: -1 },
  { sineCoefficient: 3, sineRate: 2, sineConstant: -2, cosineCoefficient: 2, cosineRate: 5, cosineConstant: 1 },
  { sineCoefficient: 4, sineRate: 3, sineConstant: -1, cosineCoefficient: 3, cosineRate: 2, cosineConstant: 2 },
] as const;

const TANGENT_VARIANTS = [
  { coefficient: 2, rate: 3, constant: 1 },
  { coefficient: 3, rate: 4, constant: -2 },
  { coefficient: 5, rate: 2, constant: -1 },
] as const;

const POWER_VARIANTS = [
  { coefficient: 2, power: 3, rate: 2, constant: 1, trig: "sin" as const },
  { coefficient: 3, power: 4, rate: 2, constant: -1, trig: "cos" as const },
  { coefficient: 2, power: 5, rate: 3, constant: 2, trig: "sin" as const },
] as const;

const PRODUCT_VARIANTS = [
  { coefficient: 2, power: 2, rate: 3, trig: "sin" as const },
  { coefficient: 3, power: 3, rate: 2, trig: "cos" as const },
  { coefficient: 1, power: 4, rate: 5, trig: "sin" as const },
] as const;

const QUOTIENT_VARIANTS = [
  { coefficient: 1, power: 2, rate: 3, trig: "sin" as const },
  { coefficient: 2, power: 1, rate: 3, trig: "cos" as const },
  { coefficient: 3, power: 2, rate: 2, trig: "sin" as const },
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

function derivativeFunction(trig: "sin" | "cos"): "sin" | "cos" {
  return trig === "sin" ? "cos" : "sin";
}

function buildProblem(kind: TrigonometricDerivativeKind, next: () => number, id: string): TrigonometricDerivativeProblem {
  if (kind === "sin-cos-chain") {
    const variant = pick(next, SIN_COS_VARIANTS);
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: {
        coefficients: [variant.sineCoefficient * variant.sineRate, -variant.cosineCoefficient * variant.cosineRate],
        functions: ["cos", "sin"],
      },
    };
  }

  if (kind === "tangent-chain") {
    const variant = pick(next, TANGENT_VARIANTS);
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: { coefficients: [variant.coefficient * variant.rate], functions: ["sec²"] },
    };
  }

  if (kind === "trigonometric-power") {
    const variant = pick(next, POWER_VARIANTS);
    const sign = variant.trig === "sin" ? 1 : -1;
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: {
        coefficients: [sign * variant.coefficient * variant.power * variant.rate],
        functions: [derivativeFunction(variant.trig)],
      },
    };
  }

  if (kind === "polynomial-product") {
    const variant = pick(next, PRODUCT_VARIANTS);
    const derivativeSign = variant.trig === "sin" ? 1 : -1;
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: {
        coefficients: [variant.coefficient * variant.power, derivativeSign * variant.coefficient * variant.rate],
        functions: [variant.trig, derivativeFunction(variant.trig)],
      },
    };
  }

  const variant = pick(next, QUOTIENT_VARIANTS);
  const derivativeSign = variant.trig === "sin" ? 1 : -1;
  return {
    id,
    kind,
    label: LABELS[kind],
    ...variant,
    answer: {
      coefficients: [derivativeSign * variant.coefficient * variant.rate, -variant.coefficient * variant.power],
      functions: [derivativeFunction(variant.trig), variant.trig],
    },
  };
}

export function createTrigonometricDerivativeProblemSet(seed: number): TrigonometricDerivativeProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => buildProblem(kind, next, `trig-derivative-${index}`)),
  };
}

export function createTrigonometricDerivativeReviewProblems(kinds: TrigonometricDerivativeKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `trig-derivative-review-${index}-${seed}`)
  ));
}

function superscript(value: number) {
  const characters: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  };
  return String(value).split("").map((character) => characters[character]).join("");
}

function signedConstant(value: number) {
  if (value === 0) return "";
  return value > 0 ? ` + ${value}` : ` − ${Math.abs(value)}`;
}

function coefficient(value: number) {
  if (value === 1) return "";
  if (value === -1) return "−";
  return String(value).replace("-", "−");
}

function argument(rate: number, constant = 0) {
  return `${coefficient(rate)}x${signedConstant(constant)}`;
}

function xPower(power: number) {
  if (power === 0) return "";
  return power === 1 ? "x" : `x${superscript(power)}`;
}

function trigPower(trig: "sin" | "cos", power: number, trigArgument: string) {
  return power === 1 ? `${trig}(${trigArgument})` : `${trig}${superscript(power)}(${trigArgument})`;
}

function signedTerm(value: number, body: string, first: boolean) {
  const magnitude = Math.abs(value);
  const term = `${coefficient(magnitude)}${body}`;
  if (first) return value < 0 ? `−${term}` : term;
  return value < 0 ? ` − ${term}` : ` + ${term}`;
}

export function formatTrigonometricDerivativeProblem(problem: TrigonometricDerivativeProblem) {
  if (problem.kind === "sin-cos-chain") {
    return `${coefficient(problem.sineCoefficient)}sin(${argument(problem.sineRate, problem.sineConstant)}) + ${coefficient(problem.cosineCoefficient)}cos(${argument(problem.cosineRate, problem.cosineConstant)})`;
  }
  if (problem.kind === "tangent-chain") {
    return `${coefficient(problem.coefficient)}tan(${argument(problem.rate, problem.constant)})`;
  }
  if (problem.kind === "trigonometric-power") {
    return `${coefficient(problem.coefficient)}${trigPower(problem.trig, problem.power, argument(problem.rate, problem.constant))}`;
  }
  if (problem.kind === "polynomial-product") {
    return `${coefficient(problem.coefficient)}${xPower(problem.power)} ${problem.trig}(${argument(problem.rate)})`;
  }
  return `${coefficient(problem.coefficient)}${problem.trig}(${argument(problem.rate)})/${xPower(problem.power)}`;
}

export function formatTrigonometricDerivativeAnswer(problem: TrigonometricDerivativeProblem) {
  const [first, second] = problem.answer.coefficients;
  const [firstFunction, secondFunction] = problem.answer.functions;
  if (problem.kind === "sin-cos-chain") {
    return `${signedTerm(first, `${firstFunction}(${argument(problem.sineRate, problem.sineConstant)})`, true)}${signedTerm(second, `${secondFunction}(${argument(problem.cosineRate, problem.cosineConstant)})`, false)}`;
  }
  if (problem.kind === "tangent-chain") {
    return signedTerm(first, `${firstFunction}(${argument(problem.rate, problem.constant)})`, true);
  }
  if (problem.kind === "trigonometric-power") {
    return signedTerm(first, `${trigPower(problem.trig, problem.power - 1, argument(problem.rate, problem.constant))} ${firstFunction}(${argument(problem.rate, problem.constant)})`, true);
  }
  if (problem.kind === "polynomial-product") {
    return `${signedTerm(first, `${xPower(problem.power - 1)} ${firstFunction}(${argument(problem.rate)})`, true)}${signedTerm(second, `${xPower(problem.power)} ${secondFunction}(${argument(problem.rate)})`, false)}`;
  }
  const numerator = `${signedTerm(first, `x ${firstFunction}(${argument(problem.rate)})`, true)}${signedTerm(second, `${secondFunction}(${argument(problem.rate)})`, false)}`;
  return `(${numerator})/${xPower(problem.power + 1)}`;
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

function latexArgument(rate: number, constant = 0) {
  return `${latexCoefficient(rate)}x${latexSignedConstant(constant)}`;
}

function latexXPower(power: number) {
  if (power === 0) return "";
  return power === 1 ? "x" : `x^{${power}}`;
}

function latexFunction(trig: TrigonometricFunction, trigArgument: string) {
  if (trig === "sec²") return `\\sec^{2}\\left(${trigArgument}\\right)`;
  return `\\${trig}\\left(${trigArgument}\\right)`;
}

function latexTrigPower(trig: "sin" | "cos", power: number, trigArgument: string) {
  if (power === 1) return latexFunction(trig, trigArgument);
  return `\\${trig}^{${power}}\\left(${trigArgument}\\right)`;
}

function latexSignedTerm(value: number, body: string, first: boolean) {
  const magnitude = Math.abs(value);
  const term = `${latexCoefficient(magnitude)}${body}`;
  if (first) return value < 0 ? `-${term}` : term;
  return value < 0 ? `-${term}` : `+${term}`;
}

export function formatTrigonometricDerivativeProblemLatex(problem: TrigonometricDerivativeProblem) {
  if (problem.kind === "sin-cos-chain") {
    return `f(x)=${latexCoefficient(problem.sineCoefficient)}${latexFunction("sin", latexArgument(problem.sineRate, problem.sineConstant))}+${latexCoefficient(problem.cosineCoefficient)}${latexFunction("cos", latexArgument(problem.cosineRate, problem.cosineConstant))}`;
  }
  if (problem.kind === "tangent-chain") {
    return `f(x)=${latexCoefficient(problem.coefficient)}${latexFunction("tan", latexArgument(problem.rate, problem.constant))}`;
  }
  if (problem.kind === "trigonometric-power") {
    return `f(x)=${latexCoefficient(problem.coefficient)}${latexTrigPower(problem.trig, problem.power, latexArgument(problem.rate, problem.constant))}`;
  }
  if (problem.kind === "polynomial-product") {
    return `f(x)=${latexCoefficient(problem.coefficient)}${latexXPower(problem.power)}${latexFunction(problem.trig, latexArgument(problem.rate))}`;
  }
  return `f(x)=\\dfrac{${latexCoefficient(problem.coefficient)}${latexFunction(problem.trig, latexArgument(problem.rate))}}{${latexXPower(problem.power)}}`;
}

export function formatTrigonometricDerivativeAnswerLatex(problem: TrigonometricDerivativeProblem) {
  const [first, second] = problem.answer.coefficients;
  const [firstFunction, secondFunction] = problem.answer.functions;
  if (problem.kind === "sin-cos-chain") {
    return `f^{\\prime}(x)=${latexSignedTerm(first, latexFunction(firstFunction, latexArgument(problem.sineRate, problem.sineConstant)), true)}${latexSignedTerm(second, latexFunction(secondFunction, latexArgument(problem.cosineRate, problem.cosineConstant)), false)}`;
  }
  if (problem.kind === "tangent-chain") {
    return `f^{\\prime}(x)=${latexSignedTerm(first, latexFunction(firstFunction, latexArgument(problem.rate, problem.constant)), true)}`;
  }
  if (problem.kind === "trigonometric-power") {
    const body = `${latexTrigPower(problem.trig, problem.power - 1, latexArgument(problem.rate, problem.constant))}${latexFunction(firstFunction, latexArgument(problem.rate, problem.constant))}`;
    return `f^{\\prime}(x)=${latexSignedTerm(first, body, true)}`;
  }
  if (problem.kind === "polynomial-product") {
    const firstBody = `${latexXPower(problem.power - 1)}${latexFunction(firstFunction, latexArgument(problem.rate))}`;
    const secondBody = `${latexXPower(problem.power)}${latexFunction(secondFunction, latexArgument(problem.rate))}`;
    return `f^{\\prime}(x)=${latexSignedTerm(first, firstBody, true)}${latexSignedTerm(second, secondBody, false)}`;
  }
  const firstBody = `x${latexFunction(firstFunction, latexArgument(problem.rate))}`;
  const secondBody = latexFunction(secondFunction, latexArgument(problem.rate));
  return `f^{\\prime}(x)=\\dfrac{${latexSignedTerm(first, firstBody, true)}${latexSignedTerm(second, secondBody, false)}}{${latexXPower(problem.power + 1)}}`;
}

function shuffleChoices(choices: TrigonometricDerivativeChoice[], id: string) {
  let seed = 2166136261;
  for (const character of id) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  const next = random(seed >>> 0);
  const shuffled = [...choices];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

function productChoiceLatex(
  problem: PolynomialProductProblem,
  firstCoefficient: number | null,
  secondCoefficient: number | null,
) {
  const trigArgument = latexArgument(problem.rate);
  const firstBody = `${latexXPower(problem.power - 1)}${latexFunction(problem.trig, trigArgument)}`;
  const secondBody = `${latexXPower(problem.power)}${latexFunction(derivativeFunction(problem.trig), trigArgument)}`;
  const terms: string[] = [];
  if (firstCoefficient !== null) terms.push(latexSignedTerm(firstCoefficient, firstBody, terms.length === 0));
  if (secondCoefficient !== null) terms.push(latexSignedTerm(secondCoefficient, secondBody, terms.length === 0));
  return terms.join("");
}

function quotientChoiceLatex(
  problem: TrigonometricQuotientProblem,
  firstCoefficient: number,
  secondCoefficient: number,
  denominatorPower: number,
) {
  const trigArgument = latexArgument(problem.rate);
  const firstBody = `x${latexFunction(derivativeFunction(problem.trig), trigArgument)}`;
  const secondBody = latexFunction(problem.trig, trigArgument);
  const numerator = `${latexSignedTerm(firstCoefficient, firstBody, true)}${latexSignedTerm(secondCoefficient, secondBody, false)}`;
  return `\\dfrac{${numerator}}{${latexXPower(denominatorPower)}}`;
}

function sinCosChoiceLatex(
  problem: SinCosChainProblem,
  firstCoefficient: number,
  secondCoefficient: number,
  firstFunction: "sin" | "cos",
  secondFunction: "sin" | "cos",
) {
  const firstBody = latexFunction(firstFunction, latexArgument(problem.sineRate, problem.sineConstant));
  const secondBody = latexFunction(secondFunction, latexArgument(problem.cosineRate, problem.cosineConstant));
  return `${latexSignedTerm(firstCoefficient, firstBody, true)}${latexSignedTerm(secondCoefficient, secondBody, false)}`;
}

function tangentChoiceLatex(problem: TangentChainProblem, coefficient: number, trig: "tan" | "sec²") {
  return latexSignedTerm(coefficient, latexFunction(trig, latexArgument(problem.rate, problem.constant)), true);
}

function powerChoiceLatex(problem: TrigonometricPowerProblem, coefficient: number) {
  const body = `${latexTrigPower(problem.trig, problem.power - 1, latexArgument(problem.rate, problem.constant))}${latexFunction(derivativeFunction(problem.trig), latexArgument(problem.rate, problem.constant))}`;
  return latexSignedTerm(coefficient, body, true);
}

export function createTrigonometricDerivativeChoices(
  problem: TrigonometricDerivativeProblem,
): TrigonometricDerivativeChoice[] {
  if (problem.kind === "sin-cos-chain") {
    const [first, second] = problem.answer.coefficients;
    return shuffleChoices([
      { id: `${problem.id}-correct`, latex: sinCosChoiceLatex(problem, first, second, "cos", "sin"), correct: true, misconception: "correct" },
      { id: `${problem.id}-inner-derivative`, latex: sinCosChoiceLatex(problem, problem.sineCoefficient, -problem.cosineCoefficient, "cos", "sin"), correct: false, misconception: "inner-derivative" },
      { id: `${problem.id}-sign`, latex: sinCosChoiceLatex(problem, first, -second, "cos", "sin"), correct: false, misconception: "sign" },
      { id: `${problem.id}-function-rule`, latex: sinCosChoiceLatex(problem, first, second, "sin", "cos"), correct: false, misconception: "function-rule" },
    ], problem.id);
  }

  if (problem.kind === "tangent-chain") {
    const [coefficient] = problem.answer.coefficients;
    return shuffleChoices([
      { id: `${problem.id}-correct`, latex: tangentChoiceLatex(problem, coefficient, "sec²"), correct: true, misconception: "correct" },
      { id: `${problem.id}-inner-derivative`, latex: tangentChoiceLatex(problem, problem.coefficient, "sec²"), correct: false, misconception: "inner-derivative" },
      { id: `${problem.id}-sign`, latex: tangentChoiceLatex(problem, -coefficient, "sec²"), correct: false, misconception: "sign" },
      { id: `${problem.id}-function-rule`, latex: tangentChoiceLatex(problem, coefficient, "tan"), correct: false, misconception: "function-rule" },
    ], problem.id);
  }

  if (problem.kind === "trigonometric-power") {
    const [coefficient] = problem.answer.coefficients;
    const derivativeSign = problem.trig === "sin" ? 1 : -1;
    return shuffleChoices([
      { id: `${problem.id}-correct`, latex: powerChoiceLatex(problem, coefficient), correct: true, misconception: "correct" },
      { id: `${problem.id}-inner-derivative`, latex: powerChoiceLatex(problem, derivativeSign * problem.coefficient * problem.power), correct: false, misconception: "inner-derivative" },
      { id: `${problem.id}-power-rule`, latex: powerChoiceLatex(problem, derivativeSign * problem.coefficient * problem.rate), correct: false, misconception: "power-rule" },
      { id: `${problem.id}-sign`, latex: powerChoiceLatex(problem, -coefficient), correct: false, misconception: "sign" },
    ], problem.id);
  }

  if (problem.kind === "polynomial-product") {
    const [first, second] = problem.answer.coefficients;
    const derivativeSign = problem.trig === "sin" ? 1 : -1;
    return shuffleChoices([
      {
        id: `${problem.id}-correct`,
        latex: productChoiceLatex(problem, first, second),
        correct: true,
        misconception: "correct",
      },
      {
        id: `${problem.id}-inner-derivative`,
        latex: productChoiceLatex(problem, first, derivativeSign * problem.coefficient),
        correct: false,
        misconception: "inner-derivative",
      },
      {
        id: `${problem.id}-sign`,
        latex: productChoiceLatex(problem, first, -second),
        correct: false,
        misconception: "sign",
      },
      {
        id: `${problem.id}-missing-term`,
        latex: productChoiceLatex(problem, first, null),
        correct: false,
        misconception: "missing-term",
      },
    ], problem.id);
  }

  if (problem.kind === "trigonometric-quotient") {
    const [first, second] = problem.answer.coefficients;
    const derivativeSign = problem.trig === "sin" ? 1 : -1;
    return shuffleChoices([
      {
        id: `${problem.id}-correct`,
        latex: quotientChoiceLatex(problem, first, second, problem.power + 1),
        correct: true,
        misconception: "correct",
      },
      {
        id: `${problem.id}-inner-derivative`,
        latex: quotientChoiceLatex(problem, derivativeSign * problem.coefficient, second, problem.power + 1),
        correct: false,
        misconception: "inner-derivative",
      },
      {
        id: `${problem.id}-sign`,
        latex: quotientChoiceLatex(problem, first, -second, problem.power + 1),
        correct: false,
        misconception: "sign",
      },
      {
        id: `${problem.id}-denominator-power`,
        latex: quotientChoiceLatex(problem, first, second, problem.power),
        correct: false,
        misconception: "denominator-power",
      },
    ], problem.id);
  }
  return [];
}
