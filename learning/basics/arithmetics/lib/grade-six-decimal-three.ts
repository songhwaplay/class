import { formatDecimal } from "./grade-five-decimals.ts";

export type GradeSixDecimalThreeSection = "hundredths" | "tenths" | "remainder";

export type GradeSixDecimalThreeProblem = {
  id: string;
  section: GradeSixDecimalThreeSection;
  left: string;
  right: string;
  answer: string;
  remainder: string | null;
  leftUnits: number;
  leftPlaces: number;
  rightUnits: number;
  rightPlaces: number;
};

export type GradeSixDecimalThreeSet = {
  seed: number;
  problems: GradeSixDecimalThreeProblem[];
};

type OperandSpec = readonly [minimum: number, maximum: number, places: number];

const ROUNDING_SPECS: Record<"hundredths" | "tenths", readonly (readonly [OperandSpec, OperandSpec])[]> = {
  hundredths: [
    [[1, 99, 0], [1, 99, 2]],
    [[1, 19, 2], [2, 9, 1]],
    [[2, 9, 1], [1, 99, 2]],
    [[1, 99, 2], [1, 99, 2]],
  ],
  tenths: [
    [[1, 99, 2], [1, 99, 2]],
    [[1, 99, 2], [2, 9, 1]],
    [[2, 9, 1], [1, 99, 2]],
    [[1, 99, 0], [1, 99, 2]],
  ],
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

export function roundDecimalDivision(
  leftUnits: number,
  leftPlaces: number,
  rightUnits: number,
  rightPlaces: number,
  answerPlaces: number,
) {
  const numerator = leftUnits * (10 ** (rightPlaces + answerPlaces));
  const denominator = rightUnits * (10 ** leftPlaces);
  return formatDecimal(Math.floor(numerator / denominator + 0.5), answerPlaces);
}

export function decimalQuotientAndRemainder(
  leftUnits: number,
  leftPlaces: number,
  rightUnits: number,
  rightPlaces: number,
) {
  const commonPlaces = Math.max(leftPlaces, rightPlaces);
  const scaledLeft = leftUnits * (10 ** (commonPlaces - leftPlaces));
  const scaledRight = rightUnits * (10 ** (commonPlaces - rightPlaces));
  const quotient = Math.floor(scaledLeft / scaledRight);
  return {
    quotient: String(quotient),
    remainder: formatDecimal(scaledLeft - scaledRight * quotient, commonPlaces),
  };
}

function roundedProblem(
  next: () => number,
  section: "hundredths" | "tenths",
  position: number,
  index: number,
): GradeSixDecimalThreeProblem {
  const [leftSpec, rightSpec] = ROUNDING_SPECS[section][position];
  const [leftMinimum, leftMaximum, leftPlaces] = leftSpec;
  const [rightMinimum, rightMaximum, rightPlaces] = rightSpec;
  const leftUnits = integer(next, leftMinimum, leftMaximum);
  const rightUnits = integer(next, rightMinimum, rightMaximum);
  return {
    id: `grade-six-decimal-three-${index}`,
    section,
    left: formatDecimal(leftUnits, leftPlaces),
    right: formatDecimal(rightUnits, rightPlaces),
    answer: roundDecimalDivision(leftUnits, leftPlaces, rightUnits, rightPlaces, section === "hundredths" ? 2 : 1),
    remainder: null,
    leftUnits,
    leftPlaces,
    rightUnits,
    rightPlaces,
  };
}

function remainderProblem(next: () => number, position: number, index: number): GradeSixDecimalThreeProblem {
  let leftUnits: number;
  let leftPlaces: number;
  let rightUnits: number;
  let rightPlaces: number;

  if (position === 0) {
    leftUnits = integer(next, 11, 99);
    leftPlaces = 2;
    rightUnits = integer(next, 2, leftUnits - 1);
    rightPlaces = 2;
  } else if (position === 1) {
    rightUnits = integer(next, 1, 99);
    rightPlaces = 2;
    leftUnits = integer(next, Math.floor(rightUnits / 10) + 1, 99);
    leftPlaces = 1;
  } else if (position === 2) {
    rightUnits = integer(next, 2, 9);
    rightPlaces = 1;
    leftUnits = integer(next, rightUnits + 1, 99);
    leftPlaces = 1;
  } else {
    leftUnits = integer(next, 1, 99);
    leftPlaces = 0;
    rightUnits = integer(next, 3, 99);
    rightPlaces = 2;
  }

  const result = decimalQuotientAndRemainder(leftUnits, leftPlaces, rightUnits, rightPlaces);
  return {
    id: `grade-six-decimal-three-${index}`,
    section: "remainder",
    left: formatDecimal(leftUnits, leftPlaces),
    right: formatDecimal(rightUnits, rightPlaces),
    answer: result.quotient,
    remainder: result.remainder,
    leftUnits,
    leftPlaces,
    rightUnits,
    rightPlaces,
  };
}

// 연산.xlsm 6소수③!A1:X27의 RANDBETWEEN 수식과 4×3 배치를 옮겼다.
export function createGradeSixDecimalThreeSet(seed: number): GradeSixDecimalThreeSet {
  const next = seededRandom(seed);
  return {
    seed,
    problems: [
      ...Array.from({ length: 4 }, (_, position) => roundedProblem(next, "hundredths", position, position)),
      ...Array.from({ length: 4 }, (_, position) => roundedProblem(next, "tenths", position, position + 4)),
      ...Array.from({ length: 4 }, (_, position) => remainderProblem(next, position, position + 8)),
    ],
  };
}
