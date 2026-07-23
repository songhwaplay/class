export const PRIME_NUMBERS_TO_100 = [
  2, 3, 5, 7,
  11, 13, 17, 19,
  23, 29,
  31, 37,
  41, 43, 47,
  53, 59,
  61, 67,
  71, 73, 79,
  83, 89,
  97,
] as const;

const PRIME_SET = new Set<number>(PRIME_NUMBERS_TO_100);

export const HUNDRED_CHART_NUMBERS = Array.from({ length: 100 }, (_, index) => index + 1);

export function isPrimeNumberTo100(number: number) {
  return PRIME_SET.has(number);
}

export function gradePrimeNumberSelection(selectedNumbers: Iterable<number>) {
  const selected = new Set(selectedNumbers);
  return Object.fromEntries(HUNDRED_CHART_NUMBERS.map((number) => [
    number,
    selected.has(number) === isPrimeNumberTo100(number),
  ]));
}
