export type FractionOperand = {
  kind: "fraction";
  numerator: number;
  denominator: number;
};

export type NaturalOperand = {
  kind: "natural";
  value: number;
};

export type FractionOneOperand = FractionOperand | NaturalOperand;

export type MixedFractionAnswer = {
  whole: number;
  numerator: number;
  denominator: number;
};

export type GradeFiveFractionOneProblem = {
  id: string;
  kind: "addition" | "subtraction" | "three-fraction-product" | "fraction-natural-product";
  operator: "+" | "−" | "×";
  operands: FractionOneOperand[];
  answer: MixedFractionAnswer;
};

export type GradeFiveFractionOneSet = {
  seed: number;
  problems: GradeFiveFractionOneProblem[];
};

export const FRACTION_DENOMINATORS = [4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18] as const;

// 분수원본!B2:M8: 각 분모에 맞춘 진분수 분자표
export const PROPER_NUMERATOR_ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5],
  [1, 2, 1, 2, 3, 2, 3, 5, 3, 2, 5, 5],
  [1, 2, 1, 2, 3, 4, 3, 5, 5, 4, 7, 5],
  [3, 3, 5, 3, 5, 5, 7, 7, 11, 7, 9, 7],
  [3, 3, 5, 4, 5, 7, 7, 7, 11, 11, 11, 11],
  [3, 4, 5, 5, 7, 8, 9, 11, 13, 13, 13, 11],
  [3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 13],
] as const;

// 분수원본!B10:M15: 첫 분모와 짝을 이루는 다른 분모표
export const PAIRED_DENOMINATOR_ROWS = [
  [5, 6, 4, 4, 6, 5, 4, 4, 4, 5, 4, 6],
  [6, 7, 8, 4, 6, 6, 5, 4, 4, 6, 5, 9],
  [6, 10, 9, 5, 6, 6, 9, 6, 4, 9, 6, 10],
  [8, 10, 10, 5, 10, 12, 12, 8, 5, 9, 8, 10],
  [10, 10, 12, 6, 12, 15, 15, 10, 6, 10, 10, 12],
  [12, 15, 15, 6, 12, 15, 15, 15, 6, 10, 12, 12],
] as const;

// 분수원본!B19:Q28: 곱셈용 분자별 분모표
export const PRODUCT_DENOMINATOR_ROWS = [
  [4, 5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 15, 16],
  [5, 5, 5, 5, 8, 7, 9, 9, 10, 11, 12, 13, 16, 15, 16],
  [6, 5, 8, 5, 9, 7, 9, 9, 10, 11, 12, 13, 16, 15, 16],
  [8, 9, 8, 9, 6, 7, 12, 15, 10, 11, 14, 13, 14, 15, 16],
  [9, 15, 16, 9, 16, 7, 14, 9, 14, 11, 15, 13, 15, 15, 16],
  [10, 15, 4, 15, 12, 11, 15, 15, 14, 11, 14, 13, 16, 15, 16],
  [12, 5, 5, 5, 8, 11, 16, 9, 16, 13, 15, 13, 14, 15, 16],
  [14, 9, 8, 9, 9, 11, 8, 15, 16, 13, 16, 13, 15, 15, 16],
  [15, 15, 14, 15, 12, 13, 10, 9, 16, 13, 12, 13, 16, 15, 16],
  [16, 9, 16, 15, 16, 13, 10, 15, 16, 13, 14, 13, 14, 15, 16],
] as const;

// 분수원본!B30:Q35: 앞 분모와 약분되도록 고르는 다음 분자표
export const CANCELLATION_NUMERATOR_ROWS = [
  [1, 1, 1, 1, 2, 2, 1, 2, 3, 2, 1, 2, 1, 2, 3, 2],
  [1, 1, 1, 1, 2, 2, 1, 2, 3, 4, 1, 3, 13, 4, 5, 4],
  [1, 1, 1, 2, 3, 3, 7, 4, 3, 4, 11, 4, 13, 6, 6, 6],
  [1, 1, 1, 2, 4, 3, 7, 4, 6, 5, 11, 6, 13, 7, 9, 8],
  [1, 1, 1, 2, 5, 4, 7, 6, 6, 8, 11, 8, 13, 7, 10, 10],
  [1, 1, 1, 2, 5, 4, 7, 6, 6, 8, 11, 10, 13, 7, 12, 12],
] as const;

const NATURAL_PRODUCT_NUMERATOR: Record<number, number> = {
  5: 4,
  6: 5,
  7: 6,
  8: 5,
  9: 8,
  10: 9,
};

function seededRandom(seed: number) {
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

function pick<T>(next: () => number, values: readonly T[]): T {
  return values[integer(next, 0, values.length - 1)];
}

export function greatestCommonDivisor(left: number, right: number) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function toMixedFraction(numerator: number, denominator: number): MixedFractionAnswer {
  const divisor = greatestCommonDivisor(numerator, denominator);
  const reducedNumerator = numerator / divisor;
  const reducedDenominator = denominator / divisor;
  return {
    whole: Math.floor(reducedNumerator / reducedDenominator),
    numerator: reducedNumerator % reducedDenominator,
    denominator: reducedDenominator,
  };
}

function fraction(numerator: number, denominator: number): FractionOperand {
  return { kind: "fraction", numerator, denominator };
}

function natural(value: number): NaturalOperand {
  return { kind: "natural", value };
}

function denominatorIndex(denominator: number) {
  return FRACTION_DENOMINATORS.indexOf(denominator as (typeof FRACTION_DENOMINATORS)[number]);
}

function numeratorFromRows(next: () => number, denominator: number, rowStart: number, rowEnd: number) {
  const column = denominatorIndex(denominator);
  const row = integer(next, rowStart, rowEnd);
  return PROPER_NUMERATOR_ROWS[row][column];
}

function pairedDenominator(next: () => number, baseDenominator: number) {
  const column = denominatorIndex(baseDenominator);
  return pick(next, PAIRED_DENOMINATOR_ROWS.map((row) => row[column]));
}

function addOrSubtractProblem(next: () => number, index: number, kind: "addition" | "subtraction"): GradeFiveFractionOneProblem {
  const leftDenominator = pick(next, FRACTION_DENOMINATORS);
  const rightDenominator = pairedDenominator(next, leftDenominator);
  const leftNumerator = kind === "addition"
    ? numeratorFromRows(next, leftDenominator, 0, 6)
    : numeratorFromRows(next, leftDenominator, 4, 6);
  const rightNumerator = kind === "addition"
    ? numeratorFromRows(next, rightDenominator, 0, 6)
    : numeratorFromRows(next, rightDenominator, 0, 2);
  const commonNumerator = kind === "addition"
    ? leftNumerator * rightDenominator + rightNumerator * leftDenominator
    : leftNumerator * rightDenominator - rightNumerator * leftDenominator;
  return {
    id: `grade-five-fraction-one-${index}`,
    kind,
    operator: kind === "addition" ? "+" : "−",
    operands: [fraction(leftNumerator, leftDenominator), fraction(rightNumerator, rightDenominator)],
    answer: toMixedFraction(commonNumerator, leftDenominator * rightDenominator),
  };
}

function productDenominator(next: () => number, numerator: number) {
  return pick(next, PRODUCT_DENOMINATOR_ROWS.map((row) => row[numerator - 1]));
}

function cancellationNumerator(next: () => number, denominator: number) {
  return pick(next, CANCELLATION_NUMERATOR_ROWS.map((row) => row[denominator - 1]));
}

function threeFractionProduct(next: () => number, index: number, derivationOrder: readonly [number, number, number]): GradeFiveFractionOneProblem {
  const numerators = [0, 0, 0];
  const denominators = [0, 0, 0];
  const anchor = derivationOrder[0];
  numerators[anchor] = integer(next, 2, 15);
  denominators[anchor] = productDenominator(next, numerators[anchor]);

  for (let orderIndex = 1; orderIndex < derivationOrder.length; orderIndex += 1) {
    const current = derivationOrder[orderIndex];
    const previous = derivationOrder[orderIndex - 1];
    numerators[current] = cancellationNumerator(next, denominators[previous]);
    denominators[current] = productDenominator(next, numerators[current]);
  }

  const numerator = numerators.reduce((product, value) => product * value, 1);
  const denominator = denominators.reduce((product, value) => product * value, 1);
  return {
    id: `grade-five-fraction-one-${index}`,
    kind: "three-fraction-product",
    operator: "×",
    operands: numerators.map((value, operandIndex) => fraction(value, denominators[operandIndex])),
    answer: toMixedFraction(numerator, denominator),
  };
}

function naturalMultiplier(next: () => number, denominator: number) {
  if (denominator === 5) return 5 * integer(next, 2, 3);
  if (denominator === 6) return 3 * integer(next, 3, 5);
  if (denominator === 7) return integer(next, 2, 3);
  if (denominator === 8) return 2 * integer(next, 4, 6);
  if (denominator === 9) return 6 * integer(next, 1, 2);
  return 2 * integer(next, 2, 4);
}

function fractionNaturalProduct(next: () => number, index: number): GradeFiveFractionOneProblem {
  const denominator = integer(next, 5, 10);
  const numerator = NATURAL_PRODUCT_NUMERATOR[denominator];
  const multiplier = naturalMultiplier(next, denominator);
  return {
    id: `grade-five-fraction-one-${index}`,
    kind: "fraction-natural-product",
    operator: "×",
    operands: [fraction(numerator, denominator), natural(multiplier)],
    answer: toMixedFraction(numerator * multiplier, denominator),
  };
}

export function createGradeFiveFractionOneSet(seed: number): GradeFiveFractionOneSet {
  const next = seededRandom(seed);
  const problems: GradeFiveFractionOneProblem[] = [
    addOrSubtractProblem(next, 0, "addition"),
    addOrSubtractProblem(next, 1, "addition"),
    addOrSubtractProblem(next, 2, "subtraction"),
    addOrSubtractProblem(next, 3, "subtraction"),
    threeFractionProduct(next, 4, [0, 2, 1]),
    threeFractionProduct(next, 5, [1, 2, 0]),
    threeFractionProduct(next, 6, [2, 1, 0]),
    threeFractionProduct(next, 7, [0, 2, 1]),
    fractionNaturalProduct(next, 8),
    fractionNaturalProduct(next, 9),
  ];
  return { seed, problems };
}
