export type GradeSixDecimalOneProblem = {
  id: string;
  sourceNumber: number;
  dividend: number;
  divisor: number;
  answer: string;
};

export type GradeSixDecimalOneSet = {
  seed: number;
  problems: GradeSixDecimalOneProblem[];
};

// 연산.xlsm 6자연수원본!A2:D19, 6소수①!A1:I36
export const GRADE_SIX_DECIMAL_ONE_BANK = [
  [18, 24, "0.75"],
  [26, 40, "0.65"],
  [126, 40, "3.15"],
  [11, 4, "2.75"],
  [15, 40, "0.375"],
  [123, 150, "0.82"],
  [34, 40, "0.85"],
  [8, 50, "0.16"],
  [113, 20, "5.65"],
  [76, 25, "3.04"],
  [147, 150, "0.98"],
  [24, 30, "0.8"],
  [13, 5, "2.6"],
  [34, 50, "0.68"],
  [21, 50, "0.42"],
  [35, 40, "0.875"],
  [6, 8, "0.75"],
  [33, 60, "0.55"],
] as const;

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

function shuffle<T>(values: readonly T[], next: () => number) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createGradeSixDecimalOneSet(seed: number): GradeSixDecimalOneSet {
  const next = seededRandom(seed);
  return {
    seed,
    problems: shuffle(GRADE_SIX_DECIMAL_ONE_BANK, next).map(([dividend, divisor, answer], index) => ({
      id: `grade-six-decimal-one-${index}`,
      sourceNumber: GRADE_SIX_DECIMAL_ONE_BANK.findIndex((row) => row[0] === dividend && row[1] === divisor && row[2] === answer) + 1,
      dividend,
      divisor,
      answer,
    })),
  };
}
