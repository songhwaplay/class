import {
  CANCELLATION_NUMERATOR_ROWS,
  FRACTION_DENOMINATORS,
  PAIRED_DENOMINATOR_ROWS,
  PRODUCT_DENOMINATOR_ROWS,
  PROPER_NUMERATOR_ROWS,
  toMixedFraction,
} from "./grade-five-fraction-one.ts";
import type { MixedFractionAnswer } from "./grade-five-fraction-one.ts";

export type GradeFiveFractionTwoOperand = {
  kind: "fraction" | "mixed";
  whole: number;
  numerator: number;
  denominator: number;
};

export type GradeFiveFractionTwoProblem = {
  id: string;
  kind: "mixed-addition" | "mixed-subtraction" | "mixed-three-factor-product" | "mixed-combination";
  operands: GradeFiveFractionTwoOperand[];
  operators: Array<"+" | "−" | "×">;
  answer: MixedFractionAnswer;
};

export type GradeFiveFractionTwoSet = {
  seed: number;
  problems: GradeFiveFractionTwoProblem[];
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

function denominatorIndex(denominator: number) {
  return FRACTION_DENOMINATORS.indexOf(denominator as (typeof FRACTION_DENOMINATORS)[number]);
}

function numeratorFromRows(next: () => number, denominator: number, rowStart: number, rowEnd: number) {
  const column = denominatorIndex(denominator);
  return PROPER_NUMERATOR_ROWS[integer(next, rowStart, rowEnd)][column];
}

function pairedDenominator(next: () => number, baseDenominator: number) {
  const column = denominatorIndex(baseDenominator);
  return pick(next, PAIRED_DENOMINATOR_ROWS.map((row) => row[column]));
}

function mixed(whole: number, numerator: number, denominator: number): GradeFiveFractionTwoOperand {
  return { kind: "mixed", whole, numerator, denominator };
}

function fraction(numerator: number, denominator: number): GradeFiveFractionTwoOperand {
  return { kind: "fraction", whole: 0, numerator, denominator };
}

function improperNumerator(value: GradeFiveFractionTwoOperand) {
  return value.whole * value.denominator + value.numerator;
}

function mixedAddOrSubtract(next: () => number, index: number, kind: "mixed-addition" | "mixed-subtraction"): GradeFiveFractionTwoProblem {
  const leftDenominator = pick(next, FRACTION_DENOMINATORS);
  const rightDenominator = pairedDenominator(next, leftDenominator);
  const subtraction = kind === "mixed-subtraction";
  const left = mixed(
    subtraction ? integer(next, 12, 15) : integer(next, 1, 9),
    numeratorFromRows(next, leftDenominator, 0, subtraction ? 1 : 6),
    leftDenominator,
  );
  const right = mixed(
    subtraction ? integer(next, left.whole - 3, left.whole - 1) : integer(next, 1, 9),
    numeratorFromRows(next, rightDenominator, subtraction ? 4 : 0, 6),
    rightDenominator,
  );
  const numerator = subtraction
    ? improperNumerator(left) * rightDenominator - improperNumerator(right) * leftDenominator
    : improperNumerator(left) * rightDenominator + improperNumerator(right) * leftDenominator;
  return {
    id: `grade-five-fraction-two-${index}`,
    kind,
    operands: [left, right],
    operators: [subtraction ? "−" : "+"],
    answer: toMixedFraction(numerator, leftDenominator * rightDenominator),
  };
}

function productDenominator(next: () => number, numerator: number) {
  return pick(next, PRODUCT_DENOMINATOR_ROWS.slice(0, 4).map((row) => row[numerator - 1]));
}

function cancellationNumerator(next: () => number, denominator: number) {
  return pick(next, CANCELLATION_NUMERATOR_ROWS.map((row) => row[denominator - 1]));
}

function mixedProduct(next: () => number, index: number, derivationOrder: readonly [number, number, number]): GradeFiveFractionTwoProblem {
  const numerators = [0, 0, 0];
  const denominators = [0, 0, 0];
  const anchor = derivationOrder[0];
  numerators[anchor] = integer(next, 2, 5);
  denominators[anchor] = productDenominator(next, numerators[anchor]);

  for (let orderIndex = 1; orderIndex < derivationOrder.length; orderIndex += 1) {
    const current = derivationOrder[orderIndex];
    const previous = derivationOrder[orderIndex - 1];
    numerators[current] = cancellationNumerator(next, denominators[previous]);
    denominators[current] = productDenominator(next, numerators[current]);
  }

  const whole = integer(next, 1, 2);
  const operands = [
    mixed(whole, numerators[0], denominators[0]),
    fraction(numerators[1], denominators[1]),
    fraction(numerators[2], denominators[2]),
  ];
  const numerator = improperNumerator(operands[0]) * numerators[1] * numerators[2];
  const denominator = denominators[0] * denominators[1] * denominators[2];
  return {
    id: `grade-five-fraction-two-${index}`,
    kind: "mixed-three-factor-product",
    operands,
    operators: ["×", "×"],
    answer: toMixedFraction(numerator, denominator),
  };
}

function mixedCombination(next: () => number, index: number): GradeFiveFractionTwoProblem {
  const firstDenominator = pick(next, FRACTION_DENOMINATORS);
  const secondDenominator = pairedDenominator(next, firstDenominator);
  const thirdDenominator = pairedDenominator(next, secondDenominator);
  const first = mixed(integer(next, 6, 9), numeratorFromRows(next, firstDenominator, 0, 6), firstDenominator);
  const second = mixed(integer(next, 3, 5), numeratorFromRows(next, secondDenominator, 0, 6), secondDenominator);
  const third = mixed(integer(next, 3, 5), numeratorFromRows(next, thirdDenominator, 4, 6), thirdDenominator);
  const denominator = firstDenominator * secondDenominator * thirdDenominator;
  const numerator = improperNumerator(first) * secondDenominator * thirdDenominator
    + improperNumerator(second) * firstDenominator * thirdDenominator
    - improperNumerator(third) * firstDenominator * secondDenominator;
  return {
    id: `grade-five-fraction-two-${index}`,
    kind: "mixed-combination",
    operands: [first, second, third],
    operators: ["+", "−"],
    answer: toMixedFraction(numerator, denominator),
  };
}

export function createGradeFiveFractionTwoSet(seed: number): GradeFiveFractionTwoSet {
  const next = seededRandom(seed);
  return {
    seed,
    problems: [
      mixedAddOrSubtract(next, 0, "mixed-addition"),
      mixedAddOrSubtract(next, 1, "mixed-addition"),
      mixedAddOrSubtract(next, 2, "mixed-subtraction"),
      mixedAddOrSubtract(next, 3, "mixed-subtraction"),
      mixedProduct(next, 4, [2, 1, 0]),
      mixedProduct(next, 5, [1, 2, 0]),
      mixedProduct(next, 6, [0, 2, 1]),
      mixedProduct(next, 7, [2, 1, 0]),
      mixedCombination(next, 8),
      mixedCombination(next, 9),
    ],
  };
}
