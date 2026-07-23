export type AngleEstimationProblem = {
  id: string;
  angle: number;
};

export const ANGLE_ESTIMATION_VALUES = Array.from({ length: 12 }, (_, index) => (index + 1) * 15);

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

export function createAngleEstimationSet(seed: number): AngleEstimationProblem[] {
  const next = random(seed);
  return shuffle(ANGLE_ESTIMATION_VALUES, next).map((angle) => ({
    id: `angle-estimation-${angle}`,
    angle,
  }));
}
