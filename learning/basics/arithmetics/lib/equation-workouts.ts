export type EquationKind =
  | "rational-equation"
  | "radical-equation"
  | "absolute-equation"
  | "biquadratic-equation";

export type EquationExpression =
  | {
    type: "rational";
    numeratorShift: number;
    firstDenominatorShift: number;
    rightNumerator: number;
    secondDenominatorShift: number;
  }
  | {
    type: "radical";
    firstOffset: number;
    secondOffset: number;
    result: number;
  }
  | {
    type: "absolute";
    insideCoefficient: number;
    insideConstant: number;
    rightCoefficient: number;
    rightConstant: number;
  }
  | {
    type: "biquadratic";
    quadraticCoefficient: number;
    constant: number;
  };

export type EquationProblem = {
  id: string;
  kind: EquationKind;
  label: string;
  expression: EquationExpression;
  answers: number[];
  restrictions?: number[];
};

export type EquationProblemSet = {
  seed: number;
  problems: EquationProblem[];
};

export type EquationChoice = {
  answers: number[];
  correct: boolean;
};

const KINDS: EquationKind[] = [
  "rational-equation",
  "radical-equation",
  "absolute-equation",
  "biquadratic-equation",
];
const LABELS: Record<EquationKind, string> = {
  "rational-equation": "분수방정식 · 정의역 확인",
  "radical-equation": "무리방정식 · 무연근 제거",
  "absolute-equation": "절댓값 · 경우 나누기",
  "biquadratic-equation": "고차방정식 · x² 치환",
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

function pick<T>(next: () => number, values: readonly T[]) {
  return values[Math.floor(next() * values.length)];
}

function buildRationalProblem(next: () => number, id: string): EquationProblem {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const numeratorShift = integer(next, -4, 4);
    const firstDenominatorShift = integer(next, -4, 4);
    const secondDenominatorShift = integer(next, -4, 4);
    const rightNumerator = integer(next, 2, 5);
    if (new Set([numeratorShift, firstDenominatorShift, secondDenominatorShift]).size < 3) continue;

    const rootSum = numeratorShift + secondDenominatorShift + rightNumerator;
    const rootProduct = numeratorShift * secondDenominatorShift + rightNumerator * firstDenominatorShift;
    const discriminant = rootSum * rootSum - 4 * rootProduct;
    const squareRoot = Math.sqrt(discriminant);
    if (!Number.isInteger(squareRoot) || (rootSum + squareRoot) % 2 !== 0) continue;
    const answers = [(rootSum - squareRoot) / 2, (rootSum + squareRoot) / 2];
    if (answers[0] === answers[1] || answers.includes(firstDenominatorShift) || answers.includes(secondDenominatorShift)) continue;
    return {
      id,
      kind: "rational-equation",
      label: LABELS["rational-equation"],
      expression: {
        type: "rational",
        numeratorShift,
        firstDenominatorShift,
        rightNumerator,
        secondDenominatorShift,
      },
      answers,
      restrictions: [firstDenominatorShift, secondDenominatorShift].sort((left, right) => left - right),
    };
  }
  return {
    id,
    kind: "rational-equation",
    label: LABELS["rational-equation"],
    expression: { type: "rational", numeratorShift: 3, firstDenominatorShift: 1, rightNumerator: 3, secondDenominatorShift: -1 },
    answers: [0, 5],
    restrictions: [-1, 1],
  };
}

function buildRadicalProblem(next: () => number, id: string): EquationProblem {
  const answer = integer(next, 2, 9);
  const firstRoot = integer(next, 2, 4);
  let secondRoot = integer(next, 1, 3);
  if (secondRoot === firstRoot) secondRoot = 1;
  return {
    id,
    kind: "radical-equation",
    label: LABELS["radical-equation"],
    expression: {
      type: "radical",
      firstOffset: firstRoot * firstRoot - answer,
      secondOffset: secondRoot * secondRoot - answer,
      result: firstRoot + secondRoot,
    },
    answers: [answer],
  };
}

function buildAbsoluteProblem(next: () => number, id: string): EquationProblem {
  const variants = [
    { insideCoefficient: 2, insideConstant: -3, rightCoefficient: 1, rightConstant: 3, answers: [0, 6] },
    { insideCoefficient: 3, insideConstant: -2, rightCoefficient: 1, rightConstant: 6, answers: [-2, 4] },
    { insideCoefficient: 3, insideConstant: 2, rightCoefficient: -1, rightConstant: 6, answers: [-4, 1] },
  ] as const;
  const variant = pick(next, variants);
  return {
    id,
    kind: "absolute-equation",
    label: LABELS["absolute-equation"],
    expression: { type: "absolute", ...variant },
    answers: [...variant.answers],
  };
}

function buildBiquadraticProblem(next: () => number, id: string): EquationProblem {
  const firstRoot = pick(next, [1, 2, 3]);
  const secondRoot = pick(next, [2, 3, 4].filter((value) => value !== firstRoot));
  const smaller = Math.min(firstRoot, secondRoot);
  const larger = Math.max(firstRoot, secondRoot);
  const firstSquare = smaller * smaller;
  const secondSquare = larger * larger;
  return {
    id,
    kind: "biquadratic-equation",
    label: LABELS["biquadratic-equation"],
    expression: {
      type: "biquadratic",
      quadraticCoefficient: -(firstSquare + secondSquare),
      constant: firstSquare * secondSquare,
    },
    answers: [-larger, -smaller, smaller, larger],
  };
}

function buildProblem(kind: EquationKind, next: () => number, id: string) {
  if (kind === "rational-equation") return buildRationalProblem(next, id);
  if (kind === "radical-equation") return buildRadicalProblem(next, id);
  if (kind === "absolute-equation") return buildAbsoluteProblem(next, id);
  return buildBiquadraticProblem(next, id);
}

export function createEquationProblemSet(seed: number): EquationProblemSet {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => buildProblem(kind, next, `equation-${index}`)) };
}

export function createEquationReviewProblems(kinds: EquationKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `equation-review-${index}-${seed}`)
  ));
}

function signedLinear(coefficient: number, constant: number) {
  const coefficientText = coefficient === 1 ? "x" : coefficient === -1 ? "−x" : `${coefficient}x`;
  if (constant === 0) return coefficientText;
  return `${coefficientText}${constant < 0 ? " − " : " + "}${Math.abs(constant)}`;
}

function shiftedX(root: number) {
  if (root === 0) return "x";
  return `x ${root > 0 ? "−" : "+"} ${Math.abs(root)}`;
}

export function formatEquationExpression(expression: EquationExpression) {
  if (expression.type === "rational") {
    return `(${shiftedX(expression.numeratorShift)})/(${shiftedX(expression.firstDenominatorShift)}) = ${expression.rightNumerator}/(${shiftedX(expression.secondDenominatorShift)})`;
  }
  if (expression.type === "radical") {
    const first = shiftedX(-expression.firstOffset).replace(/^x − 0$/, "x");
    const second = shiftedX(-expression.secondOffset).replace(/^x − 0$/, "x");
    return `√(${first}) + √(${second}) = ${expression.result}`;
  }
  if (expression.type === "absolute") {
    return `|${signedLinear(expression.insideCoefficient, expression.insideConstant)}| = ${signedLinear(expression.rightCoefficient, expression.rightConstant)}`;
  }
  const quadratic = expression.quadraticCoefficient < 0
    ? ` − ${Math.abs(expression.quadraticCoefficient)}x²`
    : ` + ${expression.quadraticCoefficient}x²`;
  const constant = expression.constant < 0 ? ` − ${Math.abs(expression.constant)}` : ` + ${expression.constant}`;
  return `x⁴${quadratic}${constant} = 0`;
}

export function normalizeSolutionSet(values: number[]) {
  return [...new Set(values)].sort((left, right) => left - right);
}

function solutionKey(values: number[]) {
  return normalizeSolutionSet(values).join(",");
}

export function createEquationChoices(problem: EquationProblem): EquationChoice[] {
  const correct = normalizeSolutionSet(problem.answers);
  const candidates = correct.length === 1
    ? [
      correct,
      [-correct[0]],
      [correct[0] + 1],
      [correct[0] - 1],
      [correct[0] + 2],
    ]
    : [
      correct,
      correct.map((value) => -value),
      correct.map((value) => value + 1),
      correct.slice(0, -1),
      correct.filter((value) => value >= 0),
      correct.map((value) => value - 1),
    ];
  const unique = [...new Map(candidates.map((answers) => [solutionKey(answers), normalizeSolutionSet(answers)])).values()]
    .filter((answers) => answers.length > 0)
    .slice(0, 4);
  const offset = [...problem.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % unique.length;
  return [...unique.slice(offset), ...unique.slice(0, offset)].map((answers) => ({
    answers,
    correct: solutionKey(answers) === solutionKey(correct),
  }));
}
