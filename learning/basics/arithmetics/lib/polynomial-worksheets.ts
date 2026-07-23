export type PolynomialCoefficients = [cubic: number, quadratic: number, linear: number, constant: number];

export type PolynomialPracticeKind =
  | "square-and-product"
  | "negative-distribution"
  | "linear-times-quadratic"
  | "leading-term-cancellation";

export type PolynomialOperation =
  | {
    kind: "scaled";
    multiplier: number;
    polynomial: PolynomialCoefficients;
  }
  | {
    kind: "product";
    multiplier: number;
    left: PolynomialCoefficients;
    right: PolynomialCoefficients;
  }
  | {
    kind: "square";
    multiplier: number;
    base: PolynomialCoefficients;
  };

export type PolynomialProblem = {
  id: string;
  kind: PolynomialPracticeKind;
  label: string;
  operations: PolynomialOperation[];
  answer: PolynomialCoefficients;
};

export type PolynomialProblemSet = {
  seed: number;
  problems: PolynomialProblem[];
};

export type PolynomialChoice = {
  id: string;
  latex: string;
  correct: boolean;
  misconception: "correct" | "sign-distribution" | "omitted-operation" | "missing-cross-term" | "degree-alignment";
};

const PRACTICE_KINDS: PolynomialPracticeKind[] = [
  "square-and-product",
  "negative-distribution",
  "linear-times-quadratic",
  "leading-term-cancellation",
];

const PRACTICE_LABELS: Record<PolynomialPracticeKind, string> = {
  "square-and-product": "곱셈공식 · 두 식의 곱",
  "negative-distribution": "음수 배수 · 부호 처리",
  "linear-times-quadratic": "일차식×이차식 · 차수 정리",
  "leading-term-cancellation": "최고차항 소거 · 다단계 정리",
};

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

function nonZeroInteger(next: () => number, minimum: number, maximum: number) {
  let result = 0;
  while (result === 0) result = integer(next, minimum, maximum);
  return result;
}

function pick<T>(next: () => number, values: readonly T[]) {
  return values[Math.floor(next() * values.length)];
}

function linear(next: () => number): PolynomialCoefficients {
  return [0, 0, nonZeroInteger(next, -4, 4), nonZeroInteger(next, -5, 5)];
}

function quadratic(next: () => number): PolynomialCoefficients {
  return [0, nonZeroInteger(next, -3, 3), integer(next, -5, 5), nonZeroInteger(next, -6, 6)];
}

function cubic(next: () => number, leading?: number): PolynomialCoefficients {
  return [leading ?? nonZeroInteger(next, -3, 3), integer(next, -4, 4), integer(next, -5, 5), nonZeroInteger(next, -6, 6)];
}

function addPolynomials(left: PolynomialCoefficients, right: PolynomialCoefficients): PolynomialCoefficients {
  return left.map((value, index) => value + right[index]) as PolynomialCoefficients;
}

function scalePolynomial(polynomial: PolynomialCoefficients, multiplier: number): PolynomialCoefficients {
  return polynomial.map((value) => value * multiplier) as PolynomialCoefficients;
}

export function multiplyPolynomials(left: PolynomialCoefficients, right: PolynomialCoefficients): PolynomialCoefficients {
  const result: PolynomialCoefficients = [0, 0, 0, 0];
  for (let leftDegree = 0; leftDegree <= 3; leftDegree += 1) {
    for (let rightDegree = 0; rightDegree <= 3; rightDegree += 1) {
      const degree = leftDegree + rightDegree;
      if (degree > 3) continue;
      result[3 - degree] += left[3 - leftDegree] * right[3 - rightDegree];
    }
  }
  return result;
}

function evaluateOperation(operation: PolynomialOperation): PolynomialCoefficients {
  if (operation.kind === "scaled") {
    return scalePolynomial(operation.polynomial, operation.multiplier);
  }
  if (operation.kind === "square") {
    return scalePolynomial(multiplyPolynomials(operation.base, operation.base), operation.multiplier);
  }
  return scalePolynomial(multiplyPolynomials(operation.left, operation.right), operation.multiplier);
}

export function combinePolynomialOperations(operations: PolynomialOperation[]): PolynomialCoefficients {
  return operations.reduce(
    (answer, operation) => addPolynomials(answer, evaluateOperation(operation)),
    [0, 0, 0, 0] as PolynomialCoefficients,
  );
}

function buildProblem(
  kind: PolynomialPracticeKind,
  next: () => number,
  id: string,
): PolynomialProblem {
  let operations: PolynomialOperation[];

  if (kind === "square-and-product") {
    operations = [
      { kind: "square", multiplier: pick(next, [2, 3, -2]), base: linear(next) },
      { kind: "product", multiplier: pick(next, [-1, 1]), left: linear(next), right: linear(next) },
      { kind: "scaled", multiplier: pick(next, [-3, -2, 2]), polynomial: quadratic(next) },
    ];
  } else if (kind === "negative-distribution") {
    operations = [
      { kind: "product", multiplier: pick(next, [-3, -2]), left: linear(next), right: linear(next) },
      { kind: "square", multiplier: pick(next, [1, 2]), base: linear(next) },
      { kind: "scaled", multiplier: -1, polynomial: quadratic(next) },
    ];
  } else if (kind === "linear-times-quadratic") {
    operations = [
      { kind: "product", multiplier: pick(next, [1, 2]), left: linear(next), right: quadratic(next) },
      { kind: "scaled", multiplier: pick(next, [-3, -2]), polynomial: cubic(next) },
      { kind: "product", multiplier: pick(next, [-1, 1]), left: linear(next), right: linear(next) },
    ];
  } else {
    const left = linear(next);
    const right = quadratic(next);
    const product = multiplyPolynomials(left, right);
    operations = [
      { kind: "product", multiplier: 1, left, right },
      { kind: "scaled", multiplier: -1, polynomial: cubic(next, product[0]) },
      { kind: "square", multiplier: pick(next, [-2, -1, 2]), base: linear(next) },
    ];
  }

  return {
    id,
    kind,
    label: PRACTICE_LABELS[kind],
    operations,
    answer: combinePolynomialOperations(operations),
  };
}

export function createPolynomialProblemSet(seed: number): PolynomialProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: PRACTICE_KINDS.map((kind, index) => buildProblem(kind, next, `polynomial-mixed-${index}`)),
  };
}

export function createPolynomialReviewProblems(
  kinds: PolynomialPracticeKind[],
  seed: number,
): PolynomialProblem[] {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `polynomial-review-${index}-${seed}`)
  ));
}

export function formatPolynomial([cubicCoefficient, quadraticCoefficient, linearCoefficient, constant]: PolynomialCoefficients) {
  const terms = [
    { coefficient: cubicCoefficient, variable: "x³" },
    { coefficient: quadraticCoefficient, variable: "x²" },
    { coefficient: linearCoefficient, variable: "x" },
    { coefficient: constant, variable: "" },
  ].filter(({ coefficient }) => coefficient !== 0);

  if (terms.length === 0) return "0";

  return terms.map(({ coefficient, variable }, index) => {
    const negative = coefficient < 0;
    const magnitude = Math.abs(coefficient);
    const number = variable && magnitude === 1 ? "" : String(magnitude);
    const term = `${number}${variable}`;
    if (index === 0) return `${negative ? "−" : ""}${term}`;
    return `${negative ? " − " : " + "}${term}`;
  }).join("");
}

export function formatPolynomialLatex([cubicCoefficient, quadraticCoefficient, linearCoefficient, constant]: PolynomialCoefficients) {
  const terms = [
    { coefficient: cubicCoefficient, variable: "x^{3}" },
    { coefficient: quadraticCoefficient, variable: "x^{2}" },
    { coefficient: linearCoefficient, variable: "x" },
    { coefficient: constant, variable: "" },
  ].filter(({ coefficient }) => coefficient !== 0);

  if (terms.length === 0) return "0";

  return terms.map(({ coefficient, variable }, index) => {
    const negative = coefficient < 0;
    const magnitude = Math.abs(coefficient);
    const number = variable && magnitude === 1 ? "" : String(magnitude);
    const term = `${number}${variable}`;
    if (index === 0) return `${negative ? "-" : ""}${term}`;
    return `${negative ? "-" : "+"}${term}`;
  }).join("");
}

function choiceHash(id: string) {
  let seed = 2166136261;
  for (const character of id) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function shufflePolynomialChoices(choices: PolynomialChoice[], id: string) {
  const next = random(choiceHash(id));
  const shuffled = [...choices];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function createPolynomialChoices(problem: PolynomialProblem): PolynomialChoice[] {
  const negativeOperationIndex = problem.operations.findIndex(({ multiplier }) => multiplier < 0);
  const signOperationIndex = negativeOperationIndex >= 0 ? negativeOperationIndex : Math.min(1, problem.operations.length - 1);
  const signOperations = problem.operations.map((operation, index) => (
    index === signOperationIndex ? { ...operation, multiplier: -operation.multiplier } : operation
  )) as PolynomialOperation[];
  const signAnswer = combinePolynomialOperations(signOperations);
  const omittedAnswer = combinePolynomialOperations(problem.operations.slice(0, -1));
  const square = problem.operations.find((operation): operation is Extract<PolynomialOperation, { kind: "square" }> => operation.kind === "square");
  const structuralAnswer = [...problem.answer] as PolynomialCoefficients;
  if (square) {
    const linear = square.base[2];
    const constant = square.base[3];
    structuralAnswer[2] -= square.multiplier * 2 * linear * constant;
  } else {
    [structuralAnswer[1], structuralAnswer[2]] = [structuralAnswer[2], structuralAnswer[1]];
  }

  const rawChoices: Array<{ id: string; coefficients: PolynomialCoefficients; correct: boolean; misconception: PolynomialChoice["misconception"] }> = [
    { id: `${problem.id}-correct`, coefficients: problem.answer, correct: true, misconception: "correct" },
    { id: `${problem.id}-sign-distribution`, coefficients: signAnswer, correct: false, misconception: "sign-distribution" },
    { id: `${problem.id}-omitted-operation`, coefficients: omittedAnswer, correct: false, misconception: "omitted-operation" },
    {
      id: `${problem.id}-${square ? "missing-cross-term" : "degree-alignment"}`,
      coefficients: structuralAnswer,
      correct: false,
      misconception: square ? "missing-cross-term" : "degree-alignment",
    },
  ];
  const seen = new Set<string>();
  const choices = rawChoices.map((choice, choiceIndex) => {
    const coefficients = [...choice.coefficients] as PolynomialCoefficients;
    let latex = formatPolynomialLatex(coefficients);
    let adjustment = 1;
    while (seen.has(latex)) {
      const coefficientIndex = (choiceIndex + adjustment) % coefficients.length;
      coefficients[coefficientIndex] += adjustment;
      latex = formatPolynomialLatex(coefficients);
      adjustment += 1;
    }
    seen.add(latex);
    return { id: choice.id, latex, correct: choice.correct, misconception: choice.misconception };
  });
  return shufflePolynomialChoices(choices, problem.id);
}

function formatOperation(operation: PolynomialOperation) {
  const magnitude = Math.abs(operation.multiplier);
  const coefficient = magnitude === 1 ? "" : String(magnitude);

  if (operation.kind === "scaled") {
    return `${coefficient}(${formatPolynomial(operation.polynomial)})`;
  }
  if (operation.kind === "square") {
    return `${coefficient}(${formatPolynomial(operation.base)})²`;
  }
  return `${coefficient}(${formatPolynomial(operation.left)})(${formatPolynomial(operation.right)})`;
}

export function formatPolynomialExpression(operations: PolynomialOperation[]) {
  return operations.map((operation, index) => {
    const negative = operation.multiplier < 0;
    const term = formatOperation(operation);
    if (index === 0) return `${negative ? "−" : ""}${term}`;
    return `${negative ? " − " : " + "}${term}`;
  }).join("");
}
