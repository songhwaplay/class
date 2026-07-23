export type NaturalNumberDecompositionProblem = {
  id: string;
  number: number;
  factors: number[];
  answer: string;
};

export const naturalNumberDecompositionBank = [
  8, 12, 16, 18, 20, 22, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81,
  82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 102, 105,
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

export function primeFactors(value: number) {
  if (!Number.isInteger(value) || value < 2) throw new Error("2 이상의 자연수만 소인수분해할 수 있습니다.");
  const factors: number[] = [];
  let remaining = value;
  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    while (remaining % divisor === 0) {
      factors.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

export function formatPrimeFactorization(value: number) {
  return primeFactors(value).join("×");
}

export function normalizePrimeFactorInput(input: string) {
  return input
    .normalize("NFKC")
    .replace(/[xX*·⋅]/g, "×")
    .replace(/\s+/g, "")
    .replace(/×+/g, "×")
    .replace(/^×|×$/g, "");
}

export function isPrimeFactorizationAnswer(value: number, input: string) {
  const normalized = normalizePrimeFactorInput(input);
  if (!/^\d+(?:×\d+)*$/.test(normalized)) return false;
  const submitted = normalized.split("×").map(Number).sort((left, right) => left - right);
  const expected = primeFactors(value);
  return submitted.length === expected.length && submitted.every((factor, index) => factor === expected[index]);
}

export function createNaturalNumberDecompositionSet(seed: number, count = 15): NaturalNumberDecompositionProblem[] {
  const next = random(seed);
  const shuffled = [...naturalNumberDecompositionBank];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled.slice(0, count).map((number) => ({
    id: `natural-decomposition-${number}`,
    number,
    factors: primeFactors(number),
    answer: formatPrimeFactorization(number),
  }));
}
