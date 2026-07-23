import {
  FRACTION_DENOMINATORS,
  PAIRED_DENOMINATOR_ROWS,
  PRODUCT_DENOMINATOR_ROWS,
  PROPER_NUMERATOR_ROWS,
  toMixedFraction,
} from "./grade-five-fraction-one.ts";
import type { MixedFractionAnswer } from "./grade-five-fraction-one.ts";

export type GradeSixFractionOperand =
  | { kind: "fraction"; numerator: number; denominator: number }
  | { kind: "natural"; value: number };

export type GradeSixFractionProblem = {
  id: string;
  kind: "addition" | "subtraction" | "three-factor-product" | "fraction-division-natural" | "fraction-natural-product";
  operands: GradeSixFractionOperand[];
  operators: Array<"+" | "−" | "×" | "÷">;
  answer: MixedFractionAnswer;
};

export type GradeSixFractionSet = {
  seed: number;
  problems: GradeSixFractionProblem[];
};

const NATURAL_OPERATION_NUMERATOR: Record<number, number> = {
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

function fraction(numerator: number, denominator: number): GradeSixFractionOperand {
  return { kind: "fraction", numerator, denominator };
}

function natural(value: number): GradeSixFractionOperand {
  return { kind: "natural", value };
}

function denominatorIndex(denominator: number) {
  return FRACTION_DENOMINATORS.indexOf(denominator as (typeof FRACTION_DENOMINATORS)[number]);
}

function numeratorFromRows(next: () => number, denominator: number, rowStart: number, rowEnd: number) {
  return PROPER_NUMERATOR_ROWS[integer(next, rowStart, rowEnd)][denominatorIndex(denominator)];
}

function pairedDenominator(next: () => number, denominator: number) {
  const column = denominatorIndex(denominator);
  return pick(next, PAIRED_DENOMINATOR_ROWS.map((row) => row[column]));
}

// 6분수!A5:O35, 분수원본!A1:M15
function addOrSubtract(next: () => number, index: number, kind: "addition" | "subtraction"): GradeSixFractionProblem {
  const leftDenominator = pick(next, FRACTION_DENOMINATORS);
  const rightDenominator = pairedDenominator(next, leftDenominator);
  let leftNumerator = numeratorFromRows(next, leftDenominator, kind === "subtraction" ? 4 : 0, 6);
  let rightNumerator = numeratorFromRows(next, rightDenominator, 0, kind === "subtraction" ? 2 : 6);

  if (kind === "subtraction" && leftNumerator * rightDenominator < rightNumerator * leftDenominator) {
    [leftNumerator, rightNumerator] = [rightNumerator, leftNumerator];
    return {
      id: `grade-six-fraction-${index}`,
      kind,
      operands: [fraction(leftNumerator, rightDenominator), fraction(rightNumerator, leftDenominator)],
      operators: ["−"],
      answer: toMixedFraction(leftNumerator * leftDenominator - rightNumerator * rightDenominator, rightDenominator * leftDenominator),
    };
  }

  if (kind === "subtraction" && leftNumerator * rightDenominator === rightNumerator * leftDenominator) {
    leftNumerator = leftDenominator - 1;
    rightNumerator = 1;
  }

  const numerator = kind === "addition"
    ? leftNumerator * rightDenominator + rightNumerator * leftDenominator
    : leftNumerator * rightDenominator - rightNumerator * leftDenominator;
  return {
    id: `grade-six-fraction-${index}`,
    kind,
    operands: [fraction(leftNumerator, leftDenominator), fraction(rightNumerator, rightDenominator)],
    operators: [kind === "addition" ? "+" : "−"],
    answer: toMixedFraction(numerator, leftDenominator * rightDenominator),
  };
}

function productFraction(next: () => number) {
  const numerator = integer(next, 1, 15);
  const denominator = pick(next, PRODUCT_DENOMINATOR_ROWS.map((row) => row[numerator - 1]));
  return { numerator, denominator };
}

// 6분수!A41:O71, 분수원본!A18:Q35
function threeFactorProduct(next: () => number, index: number, naturalPosition: 0 | 1 | 2): GradeSixFractionProblem {
  const first = productFraction(next);
  const second = productFraction(next);
  const naturalValue = integer(next, 2, 15);
  const operands: GradeSixFractionOperand[] = [fraction(first.numerator, first.denominator), fraction(second.numerator, second.denominator)];
  operands.splice(naturalPosition, 0, natural(naturalValue));
  return {
    id: `grade-six-fraction-${index}`,
    kind: "three-factor-product",
    operands,
    operators: ["×", "×"],
    answer: toMixedFraction(naturalValue * first.numerator * second.numerator, first.denominator * second.denominator),
  };
}

function divisionNatural(next: () => number, numerator: number) {
  if (numerator === 4 || numerator === 8) return 2 * integer(next, 1, 4);
  if (numerator === 5) return integer(next, 2, 5);
  if (numerator === 6) return integer(next, 2, 4);
  return 3 * integer(next, 1, 4);
}

function multiplicationNatural(next: () => number, denominator: number) {
  if (denominator === 5) return 5 * integer(next, 2, 3);
  if (denominator === 6) return 3 * integer(next, 3, 5);
  if (denominator === 7) return integer(next, 2, 3);
  if (denominator === 8) return 2 * integer(next, 4, 6);
  if (denominator === 9) return 6 * integer(next, 1, 2);
  return 2 * integer(next, 2, 4);
}

// 6분수!A77:O89
function fractionAndNatural(next: () => number, index: number, kind: "fraction-division-natural" | "fraction-natural-product"): GradeSixFractionProblem {
  const denominator = integer(next, 5, 10);
  const numerator = NATURAL_OPERATION_NUMERATOR[denominator];
  const naturalValue = kind === "fraction-division-natural"
    ? divisionNatural(next, numerator)
    : multiplicationNatural(next, denominator);
  return {
    id: `grade-six-fraction-${index}`,
    kind,
    operands: [fraction(numerator, denominator), natural(naturalValue)],
    operators: [kind === "fraction-division-natural" ? "÷" : "×"],
    answer: kind === "fraction-division-natural"
      ? toMixedFraction(numerator, denominator * naturalValue)
      : toMixedFraction(numerator * naturalValue, denominator),
  };
}

export function createGradeSixFractionSet(seed: number): GradeSixFractionSet {
  const next = seededRandom(seed);
  return {
    seed,
    problems: [
      addOrSubtract(next, 0, "addition"),
      addOrSubtract(next, 1, "addition"),
      addOrSubtract(next, 2, "subtraction"),
      addOrSubtract(next, 3, "subtraction"),
      threeFactorProduct(next, 4, 0),
      threeFactorProduct(next, 5, 1),
      threeFactorProduct(next, 6, 2),
      threeFactorProduct(next, 7, 0),
      fractionAndNatural(next, 8, "fraction-division-natural"),
      fractionAndNatural(next, 9, "fraction-natural-product"),
    ],
  };
}
