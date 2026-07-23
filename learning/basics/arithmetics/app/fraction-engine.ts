export type MixedToImproperQuestion = {
  id: string;
  number: number;
  type: "mixed-to-improper";
  prompt: { whole: number; numerator: number; denominator: number };
  expected: { numerator: number; denominator: number };
};

export type ImproperToMixedQuestion = {
  id: string;
  number: number;
  type: "improper-to-mixed";
  prompt: { numerator: number; denominator: number };
  expected: { whole: number; numerator: number; denominator: number };
};

export type FractionQuestion = MixedToImproperQuestion | ImproperToMixedQuestion;

export type FractionQuestionSet = {
  seed: number;
  version: "fraction-conversion-v1";
  questions: FractionQuestion[];
};

const LEFT_TABLE = [
  { denominator: 3, numerators: [1, 2, 1, 2, 2, 2] },
  { denominator: 4, numerators: [1, 3, 1, 3, 3, 3] },
  { denominator: 5, numerators: [1, 2, 3, 4, 3, 4] },
  { denominator: 6, numerators: [1, 5, 1, 5, 5, 5] },
  { denominator: 7, numerators: [1, 2, 3, 4, 5, 6] },
  { denominator: 8, numerators: [1, 3, 5, 7, 5, 7] },
  { denominator: 9, numerators: [1, 2, 4, 5, 7, 8] },
  { denominator: 10, numerators: [1, 3, 7, 7, 9, 3] },
] as const;

const RIGHT_TABLE = [
  { denominator: 3, numerators: [4, 5, 7, 8, 10, 11, 13, 14, 17, 19, 22] },
  { denominator: 4, numerators: [5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 27] },
  { denominator: 5, numerators: [6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18] },
  { denominator: 6, numerators: [7, 11, 13, 17, 19, 23, 25, 29, 31, 23, 25] },
  { denominator: 7, numerators: [8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19] },
  { denominator: 8, numerators: [9, 11, 13, 17, 19, 21, 11, 13, 17, 19, 23] },
  { denominator: 9, numerators: [10, 11, 13, 14, 17, 19, 22, 23, 25, 26, 28] },
  { denominator: 2, numerators: [3, 5, 7, 9, 11, 13, 15, 17, 19, 23, 25] },
] as const;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function shuffle(values: number[], random: () => number) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [values[index], values[swapWith]] = [values[swapWith], values[index]];
  }
  return values;
}

export function createQuestionSet(seed: number): FractionQuestionSet {
  const normalizedSeed = seed >>> 0;
  const random = seededRandom(normalizedSeed);
  const sourceOrder = shuffle([0, 1, 2, 3, 4, 5, 6, 7], random);

  const left: MixedToImproperQuestion[] = sourceOrder.map((sourceIndex, index) => {
    const source = LEFT_TABLE[sourceIndex];
    const whole = 1 + Math.floor(random() * 5);
    const numerator = pick(source.numerators, random);
    const denominator = source.denominator;

    return {
      id: `${normalizedSeed}-left-${index + 1}`,
      number: index + 1,
      type: "mixed-to-improper",
      prompt: { whole, numerator, denominator },
      expected: {
        numerator: whole * denominator + numerator,
        denominator,
      },
    };
  });

  const right: ImproperToMixedQuestion[] = sourceOrder.map((sourceIndex, index) => {
    const source = RIGHT_TABLE[sourceIndex];
    const numerator = pick(source.numerators, random);
    const denominator = source.denominator;
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;

    return {
      id: `${normalizedSeed}-right-${index + 1}`,
      number: index + 9,
      type: "improper-to-mixed",
      prompt: { numerator, denominator },
      expected: { whole, numerator: remainder, denominator },
    };
  });

  return {
    seed: normalizedSeed,
    version: "fraction-conversion-v1",
    questions: [...left, ...right],
  };
}

export function validateQuestionSet(set: FractionQuestionSet) {
  const left = set.questions.filter(
    (question): question is MixedToImproperQuestion => question.type === "mixed-to-improper",
  );
  const right = set.questions.filter(
    (question): question is ImproperToMixedQuestion => question.type === "improper-to-mixed",
  );

  const leftDenominators = left.map((question) => question.prompt.denominator).sort((a, b) => a - b);
  const rightDenominators = right.map((question) => question.prompt.denominator).sort((a, b) => a - b);

  return {
    count: set.questions.length === 16,
    leftCount: left.length === 8,
    rightCount: right.length === 8,
    leftDenominators: leftDenominators.join(",") === "3,4,5,6,7,8,9,10",
    rightDenominators: rightDenominators.join(",") === "2,3,4,5,6,7,8,9",
    leftProper: left.every(
      (question) =>
        question.prompt.numerator > 0 &&
        question.prompt.numerator < question.prompt.denominator &&
        question.expected.numerator ===
          question.prompt.whole * question.prompt.denominator + question.prompt.numerator,
    ),
    rightProper: right.every(
      (question) =>
        question.prompt.numerator > question.prompt.denominator &&
        question.expected.numerator > 0 &&
        question.expected.numerator < question.expected.denominator &&
        question.expected.whole * question.expected.denominator + question.expected.numerator ===
          question.prompt.numerator,
    ),
    uniqueIds: new Set(set.questions.map((question) => question.id)).size === 16,
  };
}
