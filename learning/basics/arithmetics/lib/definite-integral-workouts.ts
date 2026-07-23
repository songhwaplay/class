export type DefiniteIntegralKind =
  | "polynomial"
  | "symmetry"
  | "absolute-value"
  | "piecewise"
  | "exponential"
  | "trigonometric"
  | "area";

export type DefiniteIntegralChoice = {
  id: string;
  latex: string;
  correct: boolean;
};

export type DefiniteIntegralProblem = {
  id: string;
  kind: DefiniteIntegralKind;
  label: string;
  prompt: string;
  latex: string;
  answerLatex: string;
  choices: DefiniteIntegralChoice[];
};

const KINDS: DefiniteIntegralKind[] = [
  "polynomial",
  "symmetry",
  "absolute-value",
  "piecewise",
  "exponential",
  "trigonometric",
  "area",
];

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function integer(next: () => number, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function numericChoices(answer: number, next: () => number) {
  const offsets = answer === 0 ? [1, -1, 2] : [1, -1, answer > 0 ? 2 : -2];
  return makeChoices(String(answer), offsets.map((offset) => String(answer + offset)), next);
}

function makeChoices(correct: string, distractors: string[], next: () => number) {
  return shuffle(
    [...new Set([correct, ...distractors])].slice(0, 4).map((latex, index) => ({
      id: `choice-${index}-${latex}`,
      latex,
      correct: latex === correct,
    })),
    next,
  );
}

function build(
  kind: DefiniteIntegralKind,
  next: () => number,
  id: string,
): DefiniteIntegralProblem {
  if (kind === "polynomial") {
    const upper = integer(next, 2, 4);
    const quadratic = 3 * integer(next, 1, 3);
    const sampledLinear = 2 * integer(next, -3, 3);
    const sampledConstant = integer(next, -4, 5);
    const linear = sampledLinear === 0 ? 2 : sampledLinear;
    const constant = sampledConstant === 0 ? 1 : sampledConstant;
    const answer = (quadratic / 3) * upper ** 3 + (linear / 2) * upper ** 2 + constant * upper;
    return {
      id, kind, label: "다항함수", prompt: "정적분의 값을 구하세요.",
      latex: `\\int_{0}^{${upper}}\\left(${quadratic}x^2${linear < 0 ? "" : "+"}${linear}x${constant < 0 ? "" : "+"}${constant}\\right)\\,dx`,
      answerLatex: String(answer),
      choices: numericChoices(answer, next),
    };
  }

  if (kind === "symmetry") {
    const bound = integer(next, 2, 5);
    const oddCoefficient = integer(next, 2, 6);
    const constant = integer(next, 1, 5);
    const answer = 2 * bound * constant;
    return {
      id, kind, label: "대칭성", prompt: "함수의 홀짝성을 이용하여 값을 구하세요.",
      latex: `\\int_{-${bound}}^{${bound}}\\left(${oddCoefficient}x^3-${oddCoefficient + 1}x+${constant}\\right)\\,dx`,
      answerLatex: String(answer),
      choices: numericChoices(answer, next),
    };
  }

  if (kind === "absolute-value") {
    const left = integer(next, 2, 5);
    const right = left + 2;
    const answer = (left ** 2 + right ** 2) / 2;
    return {
      id, kind, label: "절댓값", prompt: "부호가 바뀌는 지점에서 구간을 나누어 계산하세요.",
      latex: `\\int_{-${left}}^{${right}}|x|\\,dx`,
      answerLatex: String(answer),
      choices: numericChoices(answer, next),
    };
  }

  if (kind === "piecewise") {
    const leftSlope = integer(next, 1, 4);
    const rightSlope = 2 * integer(next, 1, 3);
    const rightConstant = integer(next, 1, 4);
    const answer = 2 * leftSlope + (3 * rightSlope) / 2 + rightConstant;
    return {
      id, kind, label: "구간 분할", prompt: "함수의 식이 바뀌는 지점에서 정적분을 나누어 계산하세요.",
      latex: `f(x)=\\begin{cases}${leftSlope}x+${leftSlope}&(-1\\le x<1)\\\\${rightSlope}x+${rightConstant}&(1\\le x\\le2)\\end{cases},\\quad \\int_{-1}^{2}f(x)\\,dx`,
      answerLatex: String(answer),
      choices: numericChoices(answer, next),
    };
  }

  if (kind === "exponential") {
    const value = integer(next, 3, 8);
    const answer = value - 1;
    return {
      id, kind, label: "지수함수", prompt: "적분 구간과 지수함수의 관계를 이용하여 값을 구하세요.",
      latex: `\\int_{0}^{\\ln ${value}}e^x\\,dx`,
      answerLatex: String(answer),
      choices: numericChoices(answer, next),
    };
  }

  if (kind === "trigonometric") {
    const sine = integer(next, 2, 6);
    const cosine = integer(next, 2, 6);
    const answer = sine + cosine;
    return {
      id, kind, label: "삼각함수", prompt: "정적분의 값을 구하세요.",
      latex: `\\int_{0}^{\\frac{\\pi}{2}}\\left(${sine}\\sin x+${cosine}\\cos x\\right)\\,dx`,
      answerLatex: String(answer),
      choices: numericChoices(answer, next),
    };
  }

  const width = integer(next, 2, 4);
  const height = 3 * integer(next, 1, 3);
  const answer = (2 * height * width) / 3;
  const quadraticCoefficient = height % (width ** 2) === 0
    ? String(height / (width ** 2))
    : `\\dfrac{${height}}{${width ** 2}}`;
  return {
    id, kind, label: "두 그래프 사이의 넓이", prompt: "두 그래프로 둘러싸인 부분의 넓이를 구하세요.",
    latex: `y=${height},\\quad y=${quadraticCoefficient}x^2\\quad(-${width}\\le x\\le ${width})`,
    answerLatex: String(answer),
    choices: numericChoices(answer, next),
  };
}

export function createDefiniteIntegralProblemSet(seed: number) {
  const next = random(seed);
  return {
    seed,
    problems: KINDS.map((kind, index) => build(kind, next, `definite-integral-${index}`)),
  };
}

export function createDefiniteIntegralReviewProblems(
  kinds: DefiniteIntegralKind[],
  seed: number,
) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) =>
    build(kind, next, `definite-integral-review-${index}-${seed}`),
  );
}
