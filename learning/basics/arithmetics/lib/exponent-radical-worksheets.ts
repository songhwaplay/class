export type ExponentRadicalKind =
  | "exponent-laws"
  | "fractional-exponents"
  | "radical-square-difference"
  | "rationalize-denominators";

export type ExponentExpression = {
  type: "exponent";
  baseCoefficient: number;
  baseAExponent: number;
  baseBExponent: number;
  power: number;
  productCoefficient: number;
  productAExponent: number;
  productBExponent: number;
  denominatorCoefficient: number;
  denominatorAExponent: number;
  denominatorBExponent: number;
};

export type FractionalExponentTerm = {
  base: number;
  numerator: number;
  denominator: number;
};

export type FractionalExponentExpression = {
  type: "fractional-exponent";
  numeratorTerms: FractionalExponentTerm[];
  denominatorTerms: FractionalExponentTerm[];
};

export type RadicalSquareDifferenceExpression = {
  type: "radical-square-difference";
  firstCoefficient: number;
  firstRadicand: number;
  secondCoefficient: number;
  secondRadicand: number;
};

export type RationalizationExpression = {
  type: "rationalization";
  firstNumerator: number;
  secondNumerator: number;
  radicand: number;
  integerPart: number;
  operator: "add" | "subtract";
};

export type ExponentRadicalExpression =
  | ExponentExpression
  | FractionalExponentExpression
  | RadicalSquareDifferenceExpression
  | RationalizationExpression;

export type ExponentAnswer = {
  type: "exponent";
  coefficient: number;
  aExponent: number;
  bExponent: number;
};

export type RadicalAnswer = {
  type: "radical";
  coefficient: number;
  radicand: number;
};

export type IntegerAnswer = {
  type: "integer";
  value: number;
};

export type RationalizedAnswer = {
  type: "rationalized";
  integerPart: number;
  radicalCoefficient: number;
  radicand: number;
  denominator: number;
};

export type ExponentRadicalAnswer = ExponentAnswer | IntegerAnswer | RadicalAnswer | RationalizedAnswer;

export type ExponentRadicalProblem = {
  id: string;
  kind: ExponentRadicalKind;
  label: string;
  expression: ExponentRadicalExpression;
  answer: ExponentRadicalAnswer;
};

export type ExponentRadicalProblemSet = {
  seed: number;
  problems: ExponentRadicalProblem[];
};

export type ExponentRadicalChoice = {
  answer: ExponentRadicalAnswer;
  correct: boolean;
};

const KINDS: ExponentRadicalKind[] = [
  "exponent-laws",
  "fractional-exponents",
  "radical-square-difference",
  "rationalize-denominators",
];
const LABELS: Record<ExponentRadicalKind, string> = {
  "exponent-laws": "음의 지수 · 곱과 나눗셈",
  "fractional-exponents": "분수 지수 · 음의 지수",
  "radical-square-difference": "근호식의 제곱 · 교차항",
  "rationalize-denominators": "켤레식 · 두 분모 유리화",
};
const FRACTIONAL_EXPONENT_VARIANTS = [
  {
    numeratorTerms: [{ base: 32, numerator: 3, denominator: 5 }, { base: 27, numerator: 2, denominator: 3 }],
    denominatorTerms: [{ base: 16, numerator: 3, denominator: 4 }, { base: 8, numerator: -1, denominator: 3 }],
    answer: 18,
  },
  {
    numeratorTerms: [{ base: 81, numerator: 3, denominator: 4 }, { base: 8, numerator: 2, denominator: 3 }],
    denominatorTerms: [{ base: 27, numerator: 1, denominator: 3 }, { base: 16, numerator: -1, denominator: 2 }],
    answer: 144,
  },
  {
    numeratorTerms: [{ base: 9, numerator: 3, denominator: 2 }, { base: 16, numerator: 1, denominator: 2 }],
    denominatorTerms: [{ base: 27, numerator: 1, denominator: 3 }, { base: 8, numerator: -1, denominator: 3 }],
    answer: 72,
  },
  {
    numeratorTerms: [{ base: 125, numerator: 2, denominator: 3 }, { base: 16, numerator: 3, denominator: 4 }],
    denominatorTerms: [{ base: 25, numerator: 1, denominator: 2 }, { base: 32, numerator: -1, denominator: 5 }],
    answer: 80,
  },
] as const;
const RADICAL_PAIRS = [
  [6, 3],
  [10, 5],
  [15, 5],
  [14, 7],
] as const;
const RATIONALIZATION_PAIRS = [
  [3, 1],
  [5, 1],
  [6, 1],
  [7, 1],
  [6, 2],
  [7, 2],
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

function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function pick<T>(next: () => number, values: readonly T[]) {
  return values[Math.floor(next() * values.length)];
}

function greatestCommonDivisor(left: number, right: number): number {
  let first = Math.abs(left);
  let second = Math.abs(right);
  while (second !== 0) [first, second] = [second, first % second];
  return first;
}

export function reduceRadical(radicand: number) {
  let outside = 1;
  let inside = radicand;
  for (let factor = 2; factor * factor <= inside; factor += 1) {
    while (inside % (factor * factor) === 0) {
      outside *= factor;
      inside /= factor * factor;
    }
  }
  return { outside, inside };
}

function normalizeRationalizedAnswer(answer: RationalizedAnswer): RationalizedAnswer {
  const divisor = greatestCommonDivisor(
    greatestCommonDivisor(answer.integerPart, answer.radicalCoefficient),
    answer.denominator,
  ) || 1;
  const sign = answer.denominator < 0 ? -1 : 1;
  return {
    ...answer,
    integerPart: answer.integerPart / divisor * sign,
    radicalCoefficient: answer.radicalCoefficient / divisor * sign,
    denominator: answer.denominator / divisor * sign,
  };
}

function buildProblem(kind: ExponentRadicalKind, next: () => number, id: string): ExponentRadicalProblem {
  let expression: ExponentRadicalExpression;
  let answer: ExponentRadicalAnswer;

  if (kind === "exponent-laws") {
    const baseCoefficient = integer(next, 2, 3);
    const power = 2;
    const baseAExponent = integer(next, -3, -1);
    const baseBExponent = integer(next, 2, 4);
    const productCoefficient = integer(next, 2, 5);
    const productAExponent = integer(next, 3, 6);
    const productBExponent = integer(next, -2, 1);
    const denominatorAExponent = integer(next, -1, 2);
    const denominatorBExponent = integer(next, 1, 3);
    expression = {
      type: "exponent",
      baseCoefficient,
      baseAExponent,
      baseBExponent,
      power,
      productCoefficient,
      productAExponent,
      productBExponent,
      denominatorCoefficient: baseCoefficient ** power,
      denominatorAExponent,
      denominatorBExponent,
    };
    answer = {
      type: "exponent",
      coefficient: productCoefficient,
      aExponent: baseAExponent * power + productAExponent - denominatorAExponent,
      bExponent: baseBExponent * power + productBExponent - denominatorBExponent,
    };
  } else if (kind === "fractional-exponents") {
    const variant = pick(next, FRACTIONAL_EXPONENT_VARIANTS);
    expression = {
      type: "fractional-exponent",
      numeratorTerms: [...variant.numeratorTerms],
      denominatorTerms: [...variant.denominatorTerms],
    };
    answer = {
      type: "integer",
      value: variant.answer,
    };
  } else if (kind === "radical-square-difference") {
    const [firstRadicand, secondRadicand] = pick(next, RADICAL_PAIRS);
    const firstCoefficient = integer(next, 1, 3);
    const secondCoefficient = integer(next, 1, 3);
    const reduced = reduceRadical(firstRadicand * secondRadicand);
    expression = {
      type: "radical-square-difference",
      firstCoefficient,
      firstRadicand,
      secondCoefficient,
      secondRadicand,
    };
    answer = {
      type: "radical",
      coefficient: 4 * firstCoefficient * secondCoefficient * reduced.outside,
      radicand: reduced.inside,
    };
  } else {
    const [radicand, integerPart] = pick(next, RATIONALIZATION_PAIRS);
    const firstNumerator = integer(next, 1, 4);
    const secondNumerator = integer(next, 1, 4);
    const operator = next() < 0.5 ? "add" : "subtract";
    const sign = operator === "add" ? 1 : -1;
    expression = {
      type: "rationalization",
      firstNumerator,
      secondNumerator,
      radicand,
      integerPart,
      operator,
    };
    answer = normalizeRationalizedAnswer({
      type: "rationalized",
      integerPart: integerPart * (firstNumerator - sign * secondNumerator),
      radicalCoefficient: firstNumerator + sign * secondNumerator,
      radicand,
      denominator: radicand - integerPart * integerPart,
    });
  }

  return { id, kind, label: LABELS[kind], expression, answer };
}

export function createExponentRadicalProblemSet(seed: number): ExponentRadicalProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => buildProblem(kind, next, `exponent-radical-${index}`)),
  };
}

export function createExponentRadicalReviewProblems(
  kinds: ExponentRadicalKind[],
  seed: number,
): ExponentRadicalProblem[] {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `exponent-radical-review-${index}-${seed}`)
  ));
}

function answerKey(answer: ExponentRadicalAnswer) {
  if (answer.type === "exponent") return `e:${answer.coefficient}:${answer.aExponent}:${answer.bExponent}`;
  if (answer.type === "integer") return `i:${answer.value}`;
  if (answer.type === "radical") return `r:${answer.coefficient}:${answer.radicand}`;
  return `q:${answer.integerPart}:${answer.radicalCoefficient}:${answer.radicand}:${answer.denominator}`;
}

export function createExponentRadicalChoices(problem: ExponentRadicalProblem): ExponentRadicalChoice[] {
  const correct = problem.answer;
  let candidates: ExponentRadicalAnswer[];

  if (correct.type === "exponent") {
    candidates = [
      correct,
      { ...correct, aExponent: -correct.aExponent },
      { ...correct, bExponent: correct.bExponent + 2 },
      { ...correct, aExponent: correct.aExponent + 2, bExponent: correct.bExponent - 2 },
      { ...correct, coefficient: correct.coefficient + 1 },
    ];
  } else if (correct.type === "integer") {
    candidates = [
      correct,
      { type: "integer", value: correct.value * 2 },
      { type: "integer", value: Math.max(1, Math.floor(correct.value / 2)) },
      { type: "integer", value: correct.value + 6 },
      { type: "integer", value: correct.value - 6 },
    ];
  } else if (correct.type === "radical") {
    candidates = [
      correct,
      { ...correct, coefficient: -correct.coefficient },
      { ...correct, coefficient: correct.coefficient + 4 },
      { ...correct, coefficient: Math.max(1, correct.coefficient - 4) },
      { ...correct, radicand: correct.radicand + 1 },
    ];
  } else {
    candidates = [
      correct,
      { ...correct, radicalCoefficient: -correct.radicalCoefficient },
      { ...correct, denominator: -correct.denominator },
      { ...correct, integerPart: -correct.integerPart },
      { ...correct, integerPart: correct.integerPart + correct.denominator },
    ];
  }

  const unique = [...new Map(candidates.map((answer) => [answerKey(answer), answer])).values()].slice(0, 4);
  const offset = [...problem.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % unique.length;
  const ordered = [...unique.slice(offset), ...unique.slice(0, offset)];
  return ordered.map((answer) => ({ answer, correct: answerKey(answer) === answerKey(correct) }));
}

const SUPERSCRIPTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export function superscript(value: number) {
  return String(value).split("").map((character) => SUPERSCRIPTS[character]).join("");
}

function formatPowerFactor(variable: string, exponent: number) {
  if (exponent === 0) return "";
  return `${variable}${exponent === 1 ? "" : superscript(exponent)}`;
}

function formatFractionalExponentTerm(term: FractionalExponentTerm) {
  return `${term.base}${superscript(term.numerator)}⁄${superscript(term.denominator)}`;
}

export function formatExponentRadicalExpression(expression: ExponentRadicalExpression) {
  if (expression.type === "exponent") {
    const base = `${expression.baseCoefficient}${formatPowerFactor("a", expression.baseAExponent)}${formatPowerFactor("b", expression.baseBExponent)}`;
    const product = `${expression.productCoefficient}${formatPowerFactor("a", expression.productAExponent)}${formatPowerFactor("b", expression.productBExponent)}`;
    const denominator = `${expression.denominatorCoefficient}${formatPowerFactor("a", expression.denominatorAExponent)}${formatPowerFactor("b", expression.denominatorBExponent)}`;
    return `((${base})${superscript(expression.power)} · ${product}) / (${denominator})`;
  }
  if (expression.type === "fractional-exponent") {
    const numerator = expression.numeratorTerms.map(formatFractionalExponentTerm).join(" · ");
    const denominator = expression.denominatorTerms.map(formatFractionalExponentTerm).join(" · ");
    return `(${numerator}) / (${denominator})`;
  }
  if (expression.type === "radical-square-difference") {
    const first = `${expression.firstCoefficient === 1 ? "" : expression.firstCoefficient}√${expression.firstRadicand}`;
    const second = `${expression.secondCoefficient === 1 ? "" : expression.secondCoefficient}√${expression.secondRadicand}`;
    return `(${first} + ${second})² − (${first} − ${second})²`;
  }
  const operator = expression.operator === "add" ? "+" : "−";
  return `${expression.firstNumerator}/(√${expression.radicand} − ${expression.integerPart}) ${operator} ${expression.secondNumerator}/(√${expression.radicand} + ${expression.integerPart})`;
}

export function formatExponentRadicalAnswer(answer: ExponentRadicalAnswer) {
  if (answer.type === "exponent") {
    return `${answer.coefficient}${formatPowerFactor("a", answer.aExponent)}${formatPowerFactor("b", answer.bExponent)}`;
  }
  if (answer.type === "integer") return String(answer.value);
  if (answer.type === "radical") {
    const coefficient = answer.coefficient === 1 ? "" : answer.coefficient === -1 ? "−" : String(answer.coefficient);
    return `${coefficient}√${answer.radicand}`;
  }
  const radical = `${Math.abs(answer.radicalCoefficient) === 1 ? "" : Math.abs(answer.radicalCoefficient)}√${answer.radicand}`;
  const numerator = answer.radicalCoefficient < 0
    ? `${answer.integerPart} − ${radical}`
    : `${answer.integerPart} + ${radical}`;
  return `(${numerator})/${answer.denominator}`;
}
