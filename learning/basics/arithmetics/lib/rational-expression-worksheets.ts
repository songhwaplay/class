export type RationalPolynomial = [quadratic: number, linear: number, constant: number];

export type RationalExpressionKind =
  | "multiply-and-cancel"
  | "divide-and-reciprocate"
  | "factor-and-common-denominator"
  | "compound-rational-expression";

export type RationalFraction = {
  numerator: RationalPolynomial;
  denominator: RationalPolynomial;
};

export type RationalOperation = {
  operator: "start" | "multiply" | "divide" | "add" | "subtract";
  fraction: RationalFraction;
};

export type RationalExpressionProblem = {
  id: string;
  kind: RationalExpressionKind;
  label: string;
  operations: RationalOperation[];
  answer: RationalFraction;
  restrictions: number[];
};

export type RationalExpressionProblemSet = {
  seed: number;
  problems: RationalExpressionProblem[];
};

export type RationalExpressionChoice = {
  id: string;
  latex: string;
  correct: boolean;
  misconception: "correct" | "reciprocal" | "factor-sign" | "operation-omission";
};

const ROOTS = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as const;
const PRACTICE_KINDS: RationalExpressionKind[] = [
  "multiply-and-cancel",
  "divide-and-reciprocate",
  "factor-and-common-denominator",
  "compound-rational-expression",
];
const PRACTICE_LABELS: Record<RationalExpressionKind, string> = {
  "multiply-and-cancel": "인수분해 · 연쇄 약분",
  "divide-and-reciprocate": "분수식의 나눗셈 · 역수",
  "factor-and-common-denominator": "인수분해 · 통분",
  "compound-rational-expression": "약분 후 덧셈·뺄셈",
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

function distinctRoots(next: () => number, count: number) {
  const roots = [...ROOTS];
  for (let index = roots.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [roots[index], roots[swapIndex]] = [roots[swapIndex], roots[index]];
  }
  return roots.slice(0, count);
}

function constant(value: number): RationalPolynomial {
  return [0, 0, value];
}

function linearFromRoot(root: number, multiplier = 1): RationalPolynomial {
  return [0, multiplier, -multiplier * root];
}

function quadraticFromRoots(firstRoot: number, secondRoot: number): RationalPolynomial {
  return [1, -(firstRoot + secondRoot), firstRoot * secondRoot];
}

function fraction(numerator: RationalPolynomial, denominator: RationalPolynomial): RationalFraction {
  return { numerator, denominator };
}

function buildProblem(
  kind: RationalExpressionKind,
  next: () => number,
  id: string,
): RationalExpressionProblem {
  let operations: RationalOperation[];
  let answer: RationalFraction;
  let restrictions: number[];

  if (kind === "multiply-and-cancel") {
    const [shared, remainingNumerator, sharedAcrossFractions, remainingDenominator] = distinctRoots(next, 4);
    operations = [
      {
        operator: "start",
        fraction: fraction(
          quadraticFromRoots(shared, remainingNumerator),
          quadraticFromRoots(shared, sharedAcrossFractions),
        ),
      },
      {
        operator: "multiply",
        fraction: fraction(
          linearFromRoot(sharedAcrossFractions),
          linearFromRoot(remainingDenominator),
        ),
      },
    ];
    answer = fraction(linearFromRoot(remainingNumerator), linearFromRoot(remainingDenominator));
    restrictions = [shared, sharedAcrossFractions, remainingDenominator];
  } else if (kind === "divide-and-reciprocate") {
    const [shared, cancelledByDivision, remainingDenominator, divisorDenominator] = distinctRoots(next, 4);
    operations = [
      {
        operator: "start",
        fraction: fraction(
          quadraticFromRoots(shared, cancelledByDivision),
          quadraticFromRoots(shared, remainingDenominator),
        ),
      },
      {
        operator: "divide",
        fraction: fraction(
          linearFromRoot(cancelledByDivision),
          linearFromRoot(divisorDenominator),
        ),
      },
    ];
    answer = fraction(linearFromRoot(divisorDenominator), linearFromRoot(remainingDenominator));
    restrictions = [shared, remainingDenominator, divisorDenominator, cancelledByDivision];
  } else if (kind === "factor-and-common-denominator") {
    const [firstRoot, secondRoot] = distinctRoots(next, 2);
    const firstNumerator = integer(next, 2, 5);
    const secondNumerator = integer(next, 2, 5);
    const subtract = next() < 0.5;
    const sign = subtract ? -1 : 1;
    operations = [
      {
        operator: "start",
        fraction: fraction(constant(firstNumerator), linearFromRoot(firstRoot)),
      },
      {
        operator: subtract ? "subtract" : "add",
        fraction: fraction(constant(secondNumerator), linearFromRoot(secondRoot)),
      },
    ];
    answer = fraction(
      [
        0,
        firstNumerator + sign * secondNumerator,
        -firstNumerator * secondRoot - sign * secondNumerator * firstRoot,
      ],
      quadraticFromRoots(firstRoot, secondRoot),
    );
    restrictions = [firstRoot, secondRoot];
  } else {
    const [cancelledRoot, sharedRoot, remainingDenominator] = distinctRoots(next, 3);
    const finalNumeratorShift = integer(next, 1, 3);
    operations = [
      {
        operator: "start",
        fraction: fraction(
          quadraticFromRoots(cancelledRoot, sharedRoot),
          quadraticFromRoots(sharedRoot, remainingDenominator),
        ),
      },
      {
        operator: "divide",
        fraction: fraction(
          linearFromRoot(cancelledRoot),
          linearFromRoot(remainingDenominator),
        ),
      },
      {
        operator: "subtract",
        fraction: fraction(
          constant(finalNumeratorShift),
          linearFromRoot(remainingDenominator),
        ),
      },
    ];
    answer = fraction(
      linearFromRoot(remainingDenominator + finalNumeratorShift),
      linearFromRoot(remainingDenominator),
    );
    restrictions = [cancelledRoot, sharedRoot, remainingDenominator];
  }

  return {
    id,
    kind,
    label: PRACTICE_LABELS[kind],
    operations,
    answer,
    restrictions: [...new Set(restrictions)].sort((left, right) => left - right),
  };
}

export function createRationalExpressionProblemSet(seed: number): RationalExpressionProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: PRACTICE_KINDS.map((kind, index) => buildProblem(kind, next, `rational-expression-${index}`)),
  };
}

export function createRationalExpressionReviewProblems(
  kinds: RationalExpressionKind[],
  seed: number,
): RationalExpressionProblem[] {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => (
    buildProblem(kind, next, `rational-expression-review-${index}-${seed}`)
  ));
}

export function formatRationalPolynomial([quadratic, linear, constantTerm]: RationalPolynomial) {
  const terms = [
    { coefficient: quadratic, variable: "x²" },
    { coefficient: linear, variable: "x" },
    { coefficient: constantTerm, variable: "" },
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

const OPERATOR_SYMBOLS: Record<RationalOperation["operator"], string> = {
  start: "",
  multiply: " × ",
  divide: " ÷ ",
  add: " + ",
  subtract: " − ",
};

export function formatRationalExpression(operations: RationalOperation[]) {
  return operations.map(({ operator, fraction: value }) => (
    `${OPERATOR_SYMBOLS[operator]}(${formatRationalPolynomial(value.numerator)})/(${formatRationalPolynomial(value.denominator)})`
  )).join("");
}

function rationalPolynomialLatex(polynomial: RationalPolynomial) {
  const terms = polynomial.map((coefficient, index) => {
    if (coefficient === 0) return "";
    const power = 2 - index;
    const magnitude = Math.abs(coefficient);
    const variable = power === 2 ? "x^{2}" : power === 1 ? "x" : "";
    const number = variable && magnitude === 1 ? "" : String(magnitude);
    return `${coefficient < 0 ? "-" : "+"}${number}${variable}`;
  }).filter(Boolean);
  if (!terms.length) return "0";
  return terms.join("").replace(/^\+/, "");
}

export function formatRationalFractionLatex(value: RationalFraction) {
  return `\\dfrac{${rationalPolynomialLatex(value.numerator)}}{${rationalPolynomialLatex(value.denominator)}}`;
}

function choiceSeed(id: string) {
  let seed = 2166136261;
  for (const character of id) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

export function createRationalExpressionChoices(problem: RationalExpressionProblem): RationalExpressionChoice[] {
  const reciprocal: RationalFraction = {
    numerator: [...problem.answer.denominator] as RationalPolynomial,
    denominator: [...problem.answer.numerator] as RationalPolynomial,
  };
  const factorSign: RationalFraction = {
    numerator: [...problem.answer.numerator] as RationalPolynomial,
    denominator: [...problem.answer.denominator] as RationalPolynomial,
  };
  const signIndex = factorSign.numerator.findIndex((coefficient, index) => index > 0 && coefficient !== 0);
  factorSign.numerator[signIndex >= 0 ? signIndex : 2] *= -1;
  const omission: RationalFraction = problem.kind === "compound-rational-expression"
    ? { numerator: [0, 0, 1], denominator: [0, 0, 1] }
    : {
      numerator: [...problem.operations[0].fraction.numerator] as RationalPolynomial,
      denominator: [...problem.operations[0].fraction.denominator] as RationalPolynomial,
    };

  const raw = [
    { id: `${problem.id}-correct`, value: problem.answer, correct: true, misconception: "correct" as const },
    { id: `${problem.id}-reciprocal`, value: reciprocal, correct: false, misconception: "reciprocal" as const },
    { id: `${problem.id}-factor-sign`, value: factorSign, correct: false, misconception: "factor-sign" as const },
    { id: `${problem.id}-operation-omission`, value: omission, correct: false, misconception: "operation-omission" as const },
  ];
  const seen = new Set<string>();
  const choices = raw.map((choice, choiceIndex) => {
    const value = {
      numerator: [...choice.value.numerator] as RationalPolynomial,
      denominator: [...choice.value.denominator] as RationalPolynomial,
    };
    let latex = formatRationalFractionLatex(value);
    let adjustment = 1;
    while (seen.has(latex)) {
      value.numerator[(choiceIndex + adjustment) % 3] += adjustment;
      latex = formatRationalFractionLatex(value);
      adjustment += 1;
    }
    seen.add(latex);
    return { id: choice.id, latex, correct: choice.correct, misconception: choice.misconception };
  });
  const next = random(choiceSeed(problem.id));
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [choices[index], choices[target]] = [choices[target], choices[index]];
  }
  return choices;
}

export function evaluateRationalPolynomial(polynomial: RationalPolynomial, x: number) {
  return polynomial[0] * x * x + polynomial[1] * x + polynomial[2];
}

export function evaluateRationalFraction(value: RationalFraction, x: number) {
  return evaluateRationalPolynomial(value.numerator, x) / evaluateRationalPolynomial(value.denominator, x);
}

export function evaluateRationalExpression(problem: RationalExpressionProblem, x: number) {
  return problem.operations.reduce((result, operation, index) => {
    const value = evaluateRationalFraction(operation.fraction, x);
    if (index === 0 || operation.operator === "start") return value;
    if (operation.operator === "multiply") return result * value;
    if (operation.operator === "divide") return result / value;
    if (operation.operator === "add") return result + value;
    return result - value;
  }, 0);
}
