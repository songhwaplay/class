import { formatDecimal } from "./grade-five-decimals.ts";

export type GradeSixDecimalTwoSection = "multiplication" | "hundredths" | "tenths";

export type GradeSixDecimalTwoProblem = {
  id: string;
  section: GradeSixDecimalTwoSection;
  left: string;
  right: string;
  operator: "×" | "÷";
  answer: string;
  leftUnits: number;
  leftPlaces: number;
  rightUnits: number;
  rightPlaces: number;
};

export type GradeSixDecimalTwoSet = {
  seed: number;
  problems: GradeSixDecimalTwoProblem[];
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

function multiplicationProblem(next: () => number, index: number): GradeSixDecimalTwoProblem {
  const leftUnits = integer(next, 77, 99);
  const leftPlaces = integer(next, index === 1 || index === 2 ? 1 : 0, 2);
  const rightUnits = integer(next, 77, 99);
  const rightPlaces = integer(next, 0, 2);
  return {
    id: `grade-six-decimal-two-${index}`,
    section: "multiplication",
    left: formatDecimal(leftUnits, leftPlaces),
    right: formatDecimal(rightUnits, rightPlaces),
    operator: "×",
    answer: formatDecimal(leftUnits * rightUnits, leftPlaces + rightPlaces),
    leftUnits,
    leftPlaces,
    rightUnits,
    rightPlaces,
  };
}

export function roundDecimalQuotient(dividendUnits: number, dividendPlaces: number, divisor: number, answerPlaces: number) {
  const numerator = dividendUnits * (10 ** answerPlaces);
  const denominator = (10 ** dividendPlaces) * divisor;
  return formatDecimal(Math.floor(numerator / denominator + 0.5), answerPlaces);
}

function divisionProblem(
  next: () => number,
  position: number,
  section: "hundredths" | "tenths",
  answerPlaces: 2 | 1,
  index: number,
): GradeSixDecimalTwoProblem {
  const integerDividend = position === 1;
  const leftUnits = integer(next, integerDividend ? 77 : 777, integerDividend ? 99 : 999);
  const leftPlaces = integerDividend ? 0 : 2;
  const rightUnits = integer(next, integerDividend ? 6 : 2, 9);
  return {
    id: `grade-six-decimal-two-${index}`,
    section,
    left: formatDecimal(leftUnits, leftPlaces),
    right: String(rightUnits),
    operator: "÷",
    answer: roundDecimalQuotient(leftUnits, leftPlaces, rightUnits, answerPlaces),
    leftUnits,
    leftPlaces,
    rightUnits,
    rightPlaces: 0,
  };
}

// 연산.xlsm 6소수②!A1:W27의 RANDBETWEEN 수식과 4×3 배치를 옮겼다.
export function createGradeSixDecimalTwoSet(seed: number): GradeSixDecimalTwoSet {
  const next = seededRandom(seed);
  return {
    seed,
    problems: [
      ...Array.from({ length: 4 }, (_, index) => multiplicationProblem(next, index)),
      ...Array.from({ length: 4 }, (_, position) => divisionProblem(next, position, "hundredths", 2, position + 4)),
      ...Array.from({ length: 4 }, (_, position) => divisionProblem(next, position, "tenths", 1, position + 8)),
    ],
  };
}
