export type NumericChoice = {
  id: string;
  values: number[];
  correct: boolean;
};

export function rotateChoices<T>(values: T[], stableKey: string): T[] {
  if (values.length < 2) return [...values];
  const offset = [...stableKey].reduce((sum, character) => sum + character.charCodeAt(0), 0) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function tupleKey(values: number[]) {
  return values.join(",");
}

export function createNumericChoices(values: number[], stableKey: string): NumericChoice[] {
  const correct = [...values];
  const candidates = values.length === 1
    ? [
      correct,
      [-values[0]],
      [values[0] + 1],
      [values[0] - 1],
      [values[0] + 2],
    ]
    : [
      correct,
      values.map((value) => -value),
      values.map((value) => value + 1),
      [...values].reverse(),
      values.map((value, index) => index === 0 ? value - 1 : value),
      values.slice(0, -1),
    ];
  for (let index = 0; index < values.length; index += 1) {
    const lower = [...values];
    lower[index] -= 1;
    candidates.push(lower);
    const higher = [...values];
    higher[index] += 2;
    candidates.push(higher);
  }
  const unique = [...new Map(candidates.map((candidate) => [tupleKey(candidate), candidate])).values()]
    .filter((candidate) => candidate.length === values.length)
    .slice(0, 4);
  return rotateChoices(unique, stableKey).map((candidate, index) => ({
    id: `${stableKey}-choice-${index}`,
    values: candidate,
    correct: tupleKey(candidate) === tupleKey(correct),
  }));
}
