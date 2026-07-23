export type DivisorMultipleKind = "gcd" | "lcm";

export type DivisorMultipleProblem = {
  id: string;
  kind: DivisorMultipleKind;
  left: number;
  right: number;
  answer: number;
};

export type DivisorMultipleProblemSet = {
  seed: number;
  columns: DivisorMultipleProblem[][];
};

// 약수원본!H3:V23의 최대공약수 후보표.
export const GCD_CANDIDATE_ROWS = [
  [40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96],
  [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115],
  [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108],
  [14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98, 105, 112],
  [40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120],
  [18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108],
  [20, 30, 40, 60, 80, 90],
  [22, 33, 44, 55, 66, 77, 88, 99],
  [24, 36, 48, 60, 72, 84, 96, 108],
  [26, 39, 52, 65, 78, 91, 104],
  [28, 42, 56, 70, 84, 98],
  [30, 45, 60, 75, 90, 105],
  [32, 48, 64, 80, 96, 112],
  [34, 51, 68, 85, 102],
  [36, 54, 72, 90, 108],
  [38, 57, 76, 95],
  [42, 63, 84, 105],
  [44, 66, 88, 110],
  [46, 69, 92, 115],
  [48, 72, 96, 120],
  [50, 75, 100, 125],
] as const;

// 약수원본!G26:J45에서 2부터 25까지의 2배·3배·4배를 사용한다.
export const LCM_BASES = Array.from({ length: 24 }, (_, index) => 25 - index);

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

function shuffle<T>(values: readonly T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function greatestCommonDivisor(left: number, right: number) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

export function leastCommonMultiple(left: number, right: number) {
  if (left === 0 || right === 0) return 0;
  return Math.abs((left / greatestCommonDivisor(left, right)) * right);
}

function combinations(values: readonly number[]) {
  const pairs: Array<[number, number]> = [];
  for (let left = 0; left < values.length - 1; left += 1) {
    for (let right = left + 1; right < values.length; right += 1) {
      pairs.push([values[left], values[right]]);
    }
  }
  return pairs;
}

export function createDivisorMultipleSet(seed: number): DivisorMultipleProblemSet {
  const next = random(seed);
  const usedPairs = new Set<string>();
  const gcdProblems = shuffle(GCD_CANDIDATE_ROWS, next).slice(0, 20).map((row, index) => {
    const candidates = shuffle(combinations(row), next);
    const pair = candidates.find(([left, right]) => !usedPairs.has(`${left}:${right}`)) ?? candidates[0];
    const [left, right] = next() < 0.5 ? pair : [pair[1], pair[0]];
    usedPairs.add(`${Math.min(left, right)}:${Math.max(left, right)}`);
    return {
      id: `divisor-multiple-gcd-${index}`,
      kind: "gcd" as const,
      left,
      right,
      answer: greatestCommonDivisor(left, right),
    };
  });

  const lcmProblems = shuffle(LCM_BASES, next).slice(0, 10).map((base, index) => {
    const choices: Array<[number, number]> = [[base * 2, base * 3], [base * 3, base * 4], [base * 4, base * 2]];
    const [left, right] = choices[Math.floor(next() * choices.length)];
    return {
      id: `divisor-multiple-lcm-${index}`,
      kind: "lcm" as const,
      left,
      right,
      answer: leastCommonMultiple(left, right),
    };
  });

  return {
    seed,
    columns: [gcdProblems.slice(0, 10), gcdProblems.slice(10), lcmProblems],
  };
}
