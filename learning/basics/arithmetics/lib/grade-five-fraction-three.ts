export type FractionComparisonSign = "<" | "=" | ">";

export type FractionComparisonValue = {
  numerator: number;
  denominator: number;
};

export type GradeFiveFractionThreeKind =
  | "common-numerator"
  | "intuitive"
  | "hard-estimate"
  | "improper"
  | "close-complement"
  | "unit-fraction"
  | "common-denominator";

export type GradeFiveFractionThreeProblem = {
  id: string;
  kind: GradeFiveFractionThreeKind;
  left: FractionComparisonValue;
  right: FractionComparisonValue;
  answer: FractionComparisonSign;
};

export type GradeFiveFractionThreeSet = {
  seed: number;
  problems: GradeFiveFractionThreeProblem[];
};

// 연산.xlsm의 5분수③!A1:F89와 분수대소데이터!A2:H11에 있는
// 분자 통분 → 직관 비교 → 어림 → 대분수 → 보수 비교 순서를 옮겼다.
const WORKBOOK_KIND_ORDER: GradeFiveFractionThreeKind[] = [
  "common-numerator",
  "intuitive",
  "hard-estimate",
  "common-numerator",
  "improper",
  "close-complement",
  "hard-estimate",
  "close-complement",
  "unit-fraction",
  "common-denominator",
];

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

function chance(next: () => number) {
  return next() < 0.5;
}

function fraction(numerator: number, denominator: number): FractionComparisonValue {
  return { numerator, denominator };
}

export function compareFractions(left: FractionComparisonValue, right: FractionComparisonValue): FractionComparisonSign {
  const difference = left.numerator * right.denominator - right.numerator * left.denominator;
  if (difference < 0) return "<";
  if (difference > 0) return ">";
  return "=";
}

function makeProblem(
  index: number,
  kind: GradeFiveFractionThreeKind,
  left: FractionComparisonValue,
  right: FractionComparisonValue,
): GradeFiveFractionThreeProblem {
  return {
    id: `grade-five-fraction-three-${index}`,
    kind,
    left,
    right,
    answer: compareFractions(left, right),
  };
}

function maybeSwap(next: () => number, values: readonly [FractionComparisonValue, FractionComparisonValue]) {
  return chance(next) ? values : [values[1], values[0]] as const;
}

function commonNumeratorProblem(next: () => number, index: number) {
  const baseNumerator = integer(next, 12, 48);
  const scale = integer(next, 2, 4);
  const baseDenominator = integer(next, Math.max(baseNumerator + 20, 90), 260);
  const offset = chance(next) ? integer(next, 1, 3) : -integer(next, 1, 3);
  const pair = maybeSwap(next, [
    fraction(baseNumerator, baseDenominator),
    fraction(baseNumerator * scale, baseDenominator * scale + offset),
  ]);
  return makeProblem(index, "common-numerator", pair[0], pair[1]);
}

function intuitiveProblem(next: () => number, index: number) {
  const largerNumerator = integer(next, 45, 90);
  const smallerNumerator = integer(next, 12, largerNumerator - 12);
  const smallerDenominator = integer(next, largerNumerator + 80, 380);
  const largerDenominator = smallerDenominator + integer(next, 50, 180);
  const pair = maybeSwap(next, [
    fraction(largerNumerator, smallerDenominator),
    fraction(smallerNumerator, largerDenominator),
  ]);
  return makeProblem(index, "intuitive", pair[0], pair[1]);
}

function nearTargetFraction(next: () => number, target: 2 | 4) {
  const denominator = integer(next, 170, 480);
  const numerator = Math.max(1, Math.min(denominator - 1, Math.floor(denominator / target) + integer(next, -5, 5)));
  return fraction(numerator, denominator);
}

function hardEstimateProblem(next: () => number, index: number) {
  const target = chance(next) ? 2 : 4;
  const left = nearTargetFraction(next, target);
  let right = nearTargetFraction(next, target);
  while (compareFractions(left, right) === "=") {
    right = nearTargetFraction(next, target);
  }
  return makeProblem(index, "hard-estimate", left, right);
}

function improperProblem(next: () => number, index: number) {
  const smallerWhole = integer(next, 2, 4);
  const leftDenominator = integer(next, 11, 90);
  const rightDenominator = integer(next, 40, 120);
  const pair = maybeSwap(next, [
    fraction(smallerWhole * leftDenominator + integer(next, 1, leftDenominator - 1), leftDenominator),
    fraction((smallerWhole + 1) * rightDenominator + integer(next, 1, rightDenominator - 1), rightDenominator),
  ]);
  return makeProblem(index, "improper", pair[0], pair[1]);
}

function closeComplementValue(next: () => number, improper: boolean) {
  const denominator = integer(next, 320, 940);
  const distance = integer(next, 8, 70);
  return fraction(improper ? denominator + distance : denominator - distance, denominator);
}

function closeComplementProblem(next: () => number, index: number, improper: boolean) {
  const left = closeComplementValue(next, improper);
  let right = closeComplementValue(next, improper);
  while (compareFractions(left, right) === "=") {
    right = closeComplementValue(next, improper);
  }
  return makeProblem(index, "close-complement", left, right);
}

function unitFractionProblem(next: () => number, index: number) {
  const denominator = integer(next, 24, 90);
  const numerator = integer(next, 4, Math.floor(denominator / 2));
  const pair = maybeSwap(next, [
    fraction(numerator * 2 - 1, denominator * 2),
    fraction(numerator, denominator),
  ]);
  return makeProblem(index, "unit-fraction", pair[0], pair[1]);
}

function commonDenominatorProblem(next: () => number, index: number) {
  const unit = integer(next, 4, 12);
  const rightDenominator = unit * 3;
  const rightNumerator = integer(next, 2, Math.min(10, rightDenominator - 1));
  const leftDenominator = unit * 7;
  const direction = chance(next) ? 1 : -1;
  const leftNumerator = Math.max(1, Math.min(leftDenominator - 1, Math.round((rightNumerator * 7) / 3) + direction));
  const pair = maybeSwap(next, [
    fraction(leftNumerator, leftDenominator),
    fraction(rightNumerator, rightDenominator),
  ]);
  return makeProblem(index, "common-denominator", pair[0], pair[1]);
}

export function createGradeFiveFractionThreeSet(seed: number): GradeFiveFractionThreeSet {
  const next = seededRandom(seed);
  const problems = WORKBOOK_KIND_ORDER.map((kind, index) => {
    if (kind === "common-numerator") return commonNumeratorProblem(next, index);
    if (kind === "intuitive") return intuitiveProblem(next, index);
    if (kind === "hard-estimate") return hardEstimateProblem(next, index);
    if (kind === "improper") return improperProblem(next, index);
    if (kind === "close-complement") return closeComplementProblem(next, index, index === 7);
    if (kind === "unit-fraction") return unitFractionProblem(next, index);
    return commonDenominatorProblem(next, index);
  });
  return { seed, problems };
}
