export type GradeSixMixedCalculationProblem = {
  id: string;
  expression: string;
  answer: string;
  kind: "fraction" | "decimal";
};

type Rational = { numerator: number; denominator: number };

export function greatestCommonDivisor(left: number, right: number) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function rational(numerator: number, denominator = 1): Rational {
  const sign = denominator < 0 ? -1 : 1;
  const divisor = greatestCommonDivisor(numerator, denominator);
  return { numerator: sign * numerator / divisor, denominator: sign * denominator / divisor };
}

function add(left: Rational, right: Rational) {
  return rational(left.numerator * right.denominator + right.numerator * left.denominator, left.denominator * right.denominator);
}

function subtract(left: Rational, right: Rational) {
  return add(left, rational(-right.numerator, right.denominator));
}

function multiply(left: Rational, right: Rational) {
  return rational(left.numerator * right.numerator, left.denominator * right.denominator);
}

function divide(left: Rational, right: Rational) {
  return rational(left.numerator * right.denominator, left.denominator * right.numerator);
}

function formatFraction(value: Rational) {
  const whole = Math.trunc(value.numerator / value.denominator);
  const remainder = Math.abs(value.numerator % value.denominator);
  if (!remainder) return String(whole);
  if (!whole) return `${value.numerator}/${value.denominator}`;
  return `${whole} ${remainder}/${value.denominator}`;
}

function formatDecimal(value: Rational) {
  const result = value.numerator / value.denominator;
  return String(Number(result.toFixed(4)));
}

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

function fractionText(value: Rational) {
  return value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`;
}

export function normalizeGradeSixMixedAnswer(input: string) {
  const compact = input.trim().replace(/\s+/g, " ");
  const mixed = compact.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return formatFraction(add(rational(Number(mixed[1])), rational(Number(mixed[2]), Number(mixed[3]))));
  const fraction = compact.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) return formatFraction(rational(Number(fraction[1]), Number(fraction[2])));
  if (/^-?\d+(\.\d+)?$/.test(compact)) return String(Number(compact));
  return compact;
}

export function createGradeSixMixedCalculationSet(seed: number): GradeSixMixedCalculationProblem[] {
  const next = random(seed);
  const a = rational(integer(next, 1, 2) * integer(next, 4, 8) + integer(next, 1, 3), integer(next, 4, 8));
  const b = rational(integer(next, 1, 2) * integer(next, 4, 8) + integer(next, 1, 3), integer(next, 4, 8));
  const c = rational(integer(next, 1, 2) * integer(next, 4, 8) + integer(next, 1, 3), integer(next, 4, 8));
  const one = divide(a, b);
  const twoLeft = rational(integer(next, 666, 999), 100);
  const twoRight = rational(integer(next, 11, 55), 10);
  const twoDivisor = integer(next, 20, 50);
  const threeNatural = integer(next, 1, 3);
  const threeFraction = rational(integer(next, 2, 8), integer(next, 9, 15));
  const threeDecimal = rational(integer(next, 2, 9), 10);
  const fourDecimal = rational(integer(next, 7, 9), 10);
  const fourNatural = integer(next, 5, 8);
  const fourDenominator = next() < .5 ? 4 : 8;
  const fourSubtractDenominator = next() < .5 ? 4 : 8;
  const fiveNatural = integer(next, 6, 9);
  const fiveFractionDenominator = [4, 8, 16][integer(next, 0, 2)];
  const fiveDecimal = rational(integer(next, 101, 999), 100);
  const fiveMultiplier = integer(next, 3, 9);
  const sixNatural = integer(next, 2, 4);
  const sixFraction = rational(integer(next, 2, 6), integer(next, 4, 7));
  const sixDecimal = rational(integer(next, 12, 48), 100);
  const sixDivisor = integer(next, 4, 5);

  return [
    { id: "grade-six-mixed-1", expression: `(${fractionText(a)}) ÷ (${fractionText(b)}) × (${fractionText(c)})`, answer: formatFraction(multiply(one, c)), kind: "fraction" },
    { id: "grade-six-mixed-2", expression: `${formatDecimal(twoLeft)} − ${formatDecimal(twoRight)} ÷ ${twoDivisor}`, answer: formatDecimal(subtract(twoLeft, divide(twoRight, rational(twoDivisor)))), kind: "decimal" },
    { id: "grade-six-mixed-3", expression: `${threeNatural} + ${fractionText(threeFraction)} ÷ ${formatDecimal(threeDecimal)}`, answer: formatFraction(add(rational(threeNatural), divide(threeFraction, threeDecimal))), kind: "fraction" },
    { id: "grade-six-mixed-4", expression: `${formatDecimal(fourDecimal)} × (${fourNatural} + 1/${fourDenominator}) − 1/${fourSubtractDenominator}`, answer: formatDecimal(subtract(multiply(fourDecimal, add(rational(fourNatural), rational(1, fourDenominator))), rational(1, fourSubtractDenominator))), kind: "decimal" },
    { id: "grade-six-mixed-5", expression: `${fiveNatural} + 1/${fiveFractionDenominator} + ${formatDecimal(fiveDecimal)} × ${fiveMultiplier}`, answer: formatDecimal(add(add(rational(fiveNatural), rational(1, fiveFractionDenominator)), multiply(fiveDecimal, rational(fiveMultiplier)))), kind: "decimal" },
    { id: "grade-six-mixed-6", expression: `${sixNatural} + ${fractionText(sixFraction)} ÷ ${formatDecimal(sixDecimal)} ÷ ${sixDivisor}`, answer: formatFraction(add(rational(sixNatural), divide(divide(sixFraction, sixDecimal), rational(sixDivisor)))), kind: "fraction" },
  ];
}
