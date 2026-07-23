export type TrigonometricDerivativeTwoKind =
  | "secant-chain"
  | "cosecant-chain"
  | "cotangent-chain"
  | "secant-power"
  | "derived-product";

export type DerivedTrigonometricPattern = "sec·tan" | "csc·cot" | "csc²";

export type TrigonometricDerivativeTwoAnswer = {
  coefficient: number | null;
  pattern: DerivedTrigonometricPattern | null;
  latex: string;
};

type ChainProblem = {
  id: string;
  kind: "secant-chain" | "cosecant-chain" | "cotangent-chain";
  label: string;
  coefficient: number;
  rate: number;
  constant: number;
  trig: "sec" | "csc" | "cot";
  answer: TrigonometricDerivativeTwoAnswer;
};

type SecantPowerProblem = {
  id: string;
  kind: "secant-power";
  label: string;
  coefficient: number;
  power: number;
  rate: number;
  constant: number;
  answer: TrigonometricDerivativeTwoAnswer;
};

type DerivedProductProblem = {
  id: string;
  kind: "derived-product";
  label: string;
  coefficient: number;
  power: number;
  rate: number;
  trig: "csc" | "cot";
  answer: TrigonometricDerivativeTwoAnswer;
};

export type TrigonometricDerivativeTwoProblem = ChainProblem | SecantPowerProblem | DerivedProductProblem;

export type TrigonometricDerivativeTwoChoice = {
  id: string;
  latex: string;
  correct: boolean;
  misconception: "correct" | "inner-derivative" | "sign" | "power" | "missing-term";
};

export type TrigonometricDerivativeTwoProblemSet = {
  seed: number;
  problems: TrigonometricDerivativeTwoProblem[];
};

const KINDS: TrigonometricDerivativeTwoKind[] = [
  "secant-chain",
  "cosecant-chain",
  "cotangent-chain",
  "secant-power",
  "derived-product",
];

const LABELS: Record<TrigonometricDerivativeTwoKind, string> = {
  "secant-chain": "sec · 합성함수",
  "cosecant-chain": "csc · 합성함수와 부호",
  "cotangent-chain": "cot · csc²로 변화",
  "secant-power": "sec 거듭제곱 · 합성함수",
  "derived-product": "파생 삼각함수 · 곱의 미분",
};

const CHAIN_VARIANTS = {
  "secant-chain": [
    { coefficient: 3, rate: 2, constant: -1 },
    { coefficient: 2, rate: 5, constant: 1 },
    { coefficient: 4, rate: 3, constant: 2 },
  ],
  "cosecant-chain": [
    { coefficient: 2, rate: 3, constant: 1 },
    { coefficient: 4, rate: 2, constant: -1 },
    { coefficient: 3, rate: 5, constant: -2 },
  ],
  "cotangent-chain": [
    { coefficient: 4, rate: 5, constant: -2 },
    { coefficient: 3, rate: 2, constant: 1 },
    { coefficient: 2, rate: 4, constant: -1 },
  ],
} as const;

const POWER_VARIANTS = [
  { coefficient: 2, power: 3, rate: 2, constant: -1 },
  { coefficient: 3, power: 2, rate: 4, constant: 1 },
  { coefficient: 2, power: 4, rate: 3, constant: 2 },
] as const;

const PRODUCT_VARIANTS = [
  { coefficient: 2, power: 2, rate: 3, trig: "csc" as const },
  { coefficient: 3, power: 3, rate: 2, trig: "cot" as const },
  { coefficient: 1, power: 4, rate: 5, trig: "csc" as const },
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

function latexFunction(trig: "sec" | "csc" | "cot" | "tan", argument: string) {
  return `\\${trig}\\left(${argument}\\right)`;
}

function latexFunctionPower(trig: "sec" | "csc", power: number, argument: string) {
  if (power === 1) return latexFunction(trig, argument);
  return `\\${trig}^{${power}}\\left(${argument}\\right)`;
}

function latexXPower(power: number) {
  if (power === 0) return "";
  return power === 1 ? "x" : `x^{${power}}`;
}

function latexSignedTerm(value: number, body: string, first: boolean) {
  const term = `${latexCoefficient(Math.abs(value))}${body}`;
  if (first) return value < 0 ? `-${term}` : term;
  return value < 0 ? `-${term}` : `+${term}`;
}

function chainPattern(kind: ChainProblem["kind"]): DerivedTrigonometricPattern {
  if (kind === "secant-chain") return "sec·tan";
  if (kind === "cosecant-chain") return "csc·cot";
  return "csc²";
}

function chainSign(kind: ChainProblem["kind"]) {
  return kind === "secant-chain" ? 1 : -1;
}

function chainTrig(kind: ChainProblem["kind"]): ChainProblem["trig"] {
  if (kind === "secant-chain") return "sec";
  if (kind === "cosecant-chain") return "csc";
  return "cot";
}

function patternLatex(pattern: DerivedTrigonometricPattern, argument: string) {
  if (pattern === "sec·tan") return `${latexFunction("sec", argument)}${latexFunction("tan", argument)}`;
  if (pattern === "csc·cot") return `${latexFunction("csc", argument)}${latexFunction("cot", argument)}`;
  return latexFunctionPower("csc", 2, argument);
}

function buildProblem(kind: TrigonometricDerivativeTwoKind, next: () => number, id: string): TrigonometricDerivativeTwoProblem {
  if (kind === "secant-chain" || kind === "cosecant-chain" || kind === "cotangent-chain") {
    const variant = pick(next, CHAIN_VARIANTS[kind]);
    const pattern = chainPattern(kind);
    const coefficient = chainSign(kind) * variant.coefficient * variant.rate;
    const argument = latexArgument(variant.rate, variant.constant);
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      trig: chainTrig(kind),
      answer: {
        coefficient,
        pattern,
        latex: `f^{\\prime}(x)=${latexCoefficient(coefficient)}${patternLatex(pattern, argument)}`,
      },
    };
  }

  if (kind === "secant-power") {
    const variant = pick(next, POWER_VARIANTS);
    const coefficient = variant.coefficient * variant.power * variant.rate;
    const argument = latexArgument(variant.rate, variant.constant);
    const body = `${latexFunctionPower("sec", variant.power, argument)}${latexFunction("tan", argument)}`;
    return {
      id,
      kind,
      label: LABELS[kind],
      ...variant,
      answer: { coefficient: null, pattern: null, latex: `f^{\\prime}(x)=${latexCoefficient(coefficient)}${body}` },
    };
  }

  const variant = pick(next, PRODUCT_VARIANTS);
  const first = variant.coefficient * variant.power;
  const second = -variant.coefficient * variant.rate;
  const expression = productExpression(variant, first, second, true);
  return {
    id,
    kind,
    label: LABELS[kind],
    ...variant,
    answer: { coefficient: null, pattern: null, latex: `f^{\\prime}(x)=${expression}` },
  };
}

export function createTrigonometricDerivativeTwoProblemSet(seed: number): TrigonometricDerivativeTwoProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => buildProblem(kind, next, `trig-derivative-two-${index}`)),
  };
}

export function createTrigonometricDerivativeTwoReviewProblems(kinds: TrigonometricDerivativeTwoKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `trig-derivative-two-review-${index}-${seed}`)
  ));
}

export function isTrigonometricDerivativeTwoMultipleChoice(
  problem: TrigonometricDerivativeTwoProblem,
): problem is SecantPowerProblem | DerivedProductProblem {
  return problem.kind === "secant-power" || problem.kind === "derived-product";
}

export function formatTrigonometricDerivativeTwoProblemLatex(problem: TrigonometricDerivativeTwoProblem) {
  if (problem.kind === "secant-chain" || problem.kind === "cosecant-chain" || problem.kind === "cotangent-chain") {
    return `f(x)=${latexCoefficient(problem.coefficient)}${latexFunction(problem.trig, latexArgument(problem.rate, problem.constant))}`;
  }
  if (problem.kind === "secant-power") {
    return `f(x)=${latexCoefficient(problem.coefficient)}${latexFunctionPower("sec", problem.power, latexArgument(problem.rate, problem.constant))}`;
  }
  return `f(x)=${latexCoefficient(problem.coefficient)}${latexXPower(problem.power)}${latexFunction(problem.trig, latexArgument(problem.rate))}`;
}

export function formatTrigonometricDerivativeTwoTemplateLatex(problem: TrigonometricDerivativeTwoProblem) {
  if (isTrigonometricDerivativeTwoMultipleChoice(problem)) return "";
  return `f^{\\prime}(x)=A\\cdot P\\left(${latexArgument(problem.rate, problem.constant)}\\right)`;
}

function shuffleChoices(choices: TrigonometricDerivativeTwoChoice[], id: string) {
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

function secantPowerExpression(problem: SecantPowerProblem, coefficient: number, power: number, includeTangent: boolean) {
  const argument = latexArgument(problem.rate, problem.constant);
  const tangent = includeTangent ? latexFunction("tan", argument) : "";
  return `${latexCoefficient(coefficient)}${latexFunctionPower("sec", power, argument)}${tangent}`;
}

function productExpression(
  problem: Pick<DerivedProductProblem, "coefficient" | "power" | "rate" | "trig">,
  firstCoefficient: number,
  secondCoefficient: number,
  includeFirst: boolean,
) {
  const argument = latexArgument(problem.rate);
  const firstBody = `${latexXPower(problem.power - 1)}${latexFunction(problem.trig, argument)}`;
  const derivativeBody = problem.trig === "csc"
    ? `${latexFunction("csc", argument)}${latexFunction("cot", argument)}`
    : latexFunctionPower("csc", 2, argument);
  const secondBody = `${latexXPower(problem.power)}${derivativeBody}`;
  const terms: string[] = [];
  if (includeFirst) terms.push(latexSignedTerm(firstCoefficient, firstBody, true));
  terms.push(latexSignedTerm(secondCoefficient, secondBody, terms.length === 0));
  return terms.join("");
}

export function createTrigonometricDerivativeTwoChoices(
  problem: TrigonometricDerivativeTwoProblem,
): TrigonometricDerivativeTwoChoice[] {
  if (problem.kind === "secant-chain" || problem.kind === "cosecant-chain" || problem.kind === "cotangent-chain") {
    const argument = latexArgument(problem.rate, problem.constant);
    const correctCoefficient = chainSign(problem.kind) * problem.coefficient * problem.rate;
    const correctPattern = chainPattern(problem.kind);
    const alternatePattern: DerivedTrigonometricPattern = correctPattern === "sec·tan" ? "csc·cot" : "sec·tan";
    return shuffleChoices([
      { id: `${problem.id}-correct`, latex: `${latexCoefficient(correctCoefficient)}${patternLatex(correctPattern, argument)}`, correct: true, misconception: "correct" },
      { id: `${problem.id}-inner`, latex: `${latexCoefficient(chainSign(problem.kind) * problem.coefficient)}${patternLatex(correctPattern, argument)}`, correct: false, misconception: "inner-derivative" },
      { id: `${problem.id}-sign`, latex: `${latexCoefficient(-correctCoefficient)}${patternLatex(correctPattern, argument)}`, correct: false, misconception: "sign" },
      { id: `${problem.id}-pattern`, latex: `${latexCoefficient(correctCoefficient)}${patternLatex(alternatePattern, argument)}`, correct: false, misconception: "missing-term" },
    ], problem.id);
  }

  if (problem.kind === "secant-power") {
    const correct = problem.coefficient * problem.power * problem.rate;
    return shuffleChoices([
      { id: `${problem.id}-correct`, latex: secantPowerExpression(problem, correct, problem.power, true), correct: true, misconception: "correct" },
      { id: `${problem.id}-inner`, latex: secantPowerExpression(problem, problem.coefficient * problem.power, problem.power, true), correct: false, misconception: "inner-derivative" },
      { id: `${problem.id}-power`, latex: secantPowerExpression(problem, correct, problem.power - 1, true), correct: false, misconception: "power" },
      { id: `${problem.id}-missing`, latex: secantPowerExpression(problem, correct, problem.power, false), correct: false, misconception: "missing-term" },
    ], problem.id);
  }

  if (problem.kind === "derived-product") {
    const first = problem.coefficient * problem.power;
    const second = -problem.coefficient * problem.rate;
    return shuffleChoices([
      { id: `${problem.id}-correct`, latex: productExpression(problem, first, second, true), correct: true, misconception: "correct" },
      { id: `${problem.id}-inner`, latex: productExpression(problem, first, -problem.coefficient, true), correct: false, misconception: "inner-derivative" },
      { id: `${problem.id}-sign`, latex: productExpression(problem, first, -second, true), correct: false, misconception: "sign" },
      { id: `${problem.id}-missing`, latex: productExpression(problem, first, second, false), correct: false, misconception: "missing-term" },
    ], problem.id);
  }

  return [];
}
