export type DecimalFactor = {
  digits: number;
  places: 0 | 1 | 2;
  text: string;
};

export type GradeFiveDecimalProblem = {
  id: string;
  column: 0 | 1 | 2;
  left: DecimalFactor;
  right: DecimalFactor;
  answer: string;
};

export type GradeFiveDecimalSet = {
  seed: number;
  problems: GradeFiveDecimalProblem[];
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

export function formatDecimal(units: number, places: number) {
  if (places === 0) return String(units);
  const factor = 10 ** places;
  const whole = Math.floor(units / factor);
  const fraction = String(units % factor).padStart(places, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function makeFactor(next: () => number, minimumPlaces: 0 | 1, maximumPlaces: 2): DecimalFactor {
  const digits = integer(next, 77, 99);
  const places = integer(next, minimumPlaces, maximumPlaces) as 0 | 1 | 2;
  return { digits, places, text: formatDecimal(digits, places) };
}

function makeProblem(next: () => number, index: number): GradeFiveDecimalProblem {
  const column = (index % 3) as 0 | 1 | 2;
  // 연산.xlsm 5소수!A2:Q21의 세 열 규칙:
  // 첫째 열은 두 수 모두 자연수·소수 첫째/둘째 자리, 나머지는 첫 수가 소수이다.
  const left = makeFactor(next, column === 0 ? 0 : 1, 2);
  const right = makeFactor(next, 0, 2);
  return {
    id: `grade-five-decimal-${index}`,
    column,
    left,
    right,
    answer: formatDecimal(left.digits * right.digits, left.places + right.places),
  };
}

export function createGradeFiveDecimalSet(seed: number): GradeFiveDecimalSet {
  const next = seededRandom(seed);
  return {
    seed,
    problems: Array.from({ length: 9 }, (_, index) => makeProblem(next, index)),
  };
}

export function sanitizeDecimalInput(value: string, maximumLength = 9) {
  const filtered = value.replace(/[^0-9.]/g, "");
  const decimalIndex = filtered.indexOf(".");
  if (decimalIndex === -1) return filtered.slice(0, maximumLength);
  return `${filtered.slice(0, decimalIndex + 1)}${filtered.slice(decimalIndex + 1).replace(/\./g, "")}`.slice(0, maximumLength);
}

export function normalizeDecimalInput(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || !/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const [rawWhole, rawFraction = ""] = trimmed.split(".");
  const whole = rawWhole.replace(/^0+(?=\d)/, "") || "0";
  const fraction = rawFraction.replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function matchesDecimalAnswer(value: string | undefined, expected: string) {
  return normalizeDecimalInput(value) === normalizeDecimalInput(expected);
}
