export type IntegrationTechniqueKind =
  | "power-substitution"
  | "log-substitution"
  | "trig-substitution"
  | "parts-exponential"
  | "parts-trigonometric"
  | "parts-logarithm";

export type IntegrationTechniqueChoice = { id: string; latex: string; correct: boolean };
export type IntegrationTechniqueProblem = {
  id: string;
  kind: IntegrationTechniqueKind;
  label: string;
  prompt: string;
  latex: string;
  answerLatex: string;
  choices: IntegrationTechniqueChoice[];
};

const KINDS: IntegrationTechniqueKind[] = [
  "power-substitution",
  "log-substitution",
  "trig-substitution",
  "parts-exponential",
  "parts-trigonometric",
  "parts-logarithm",
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
function signed(value: number) { return value < 0 ? String(value) : `+${value}`; }
function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
function choices(correct: string, distractors: string[], next: () => number) {
  return shuffle([...new Set([correct, ...distractors])].slice(0, 4).map((latex, index) => ({
    id: `choice-${index}-${latex}`, latex, correct: latex === correct,
  })), next);
}

function build(kind: IntegrationTechniqueKind, next: () => number, id: string): IntegrationTechniqueProblem {
  const rate = integer(next, 2, 5);
  const shift = integer(next, 1, 4);

  if (kind === "power-substitution") {
    const power = integer(next, 2, 4);
    const coefficient = 2 * rate * (power + 1);
    const inside = `${rate}x^2${signed(shift)}`;
    const answer = `\\left(${inside}\\right)^{${power + 1}}+C`;
    return {
      id, kind, label: "치환적분 · 거듭제곱", prompt: "괄호 안의 식을 치환하여 부정적분을 구하세요.",
      latex: `\\int ${coefficient}x\\left(${inside}\\right)^{${power}}\\,dx`,
      answerLatex: answer,
      choices: choices(answer, [
        `${coefficient}\\left(${inside}\\right)^{${power + 1}}+C`,
        `x^2\\left(${inside}\\right)^{${power + 1}}+C`,
        `\\left(${inside}\\right)^{${power}}+C`,
      ], next),
    };
  }

  if (kind === "log-substitution") {
    const answer = `\\ln\\left|${rate}x${signed(shift)}\\right|+C`;
    return {
      id, kind, label: "치환적분 · 로그형", prompt: "분모를 치환하여 부정적분을 구하세요.",
      latex: `\\int\\dfrac{${rate}}{${rate}x${signed(shift)}}\\,dx`,
      answerLatex: answer,
      choices: choices(answer, [
        `${rate}\\ln\\left|${rate}x${signed(shift)}\\right|+C`,
        `\\dfrac{1}{${rate}x${signed(shift)}}+C`,
        `\\ln|x|+C`,
      ], next),
    };
  }

  if (kind === "trig-substitution") {
    const power = integer(next, 2, 4);
    const coefficient = rate * (power + 1);
    const argument = `${rate}x${signed(shift)}`;
    const answer = `\\sin^{${power + 1}}(${argument})+C`;
    return {
      id, kind, label: "치환적분 · 삼각함수", prompt: "삼각함수의 안쪽 함수를 치환하여 부정적분을 구하세요.",
      latex: `\\int ${coefficient}\\cos(${argument})\\sin^{${power}}(${argument})\\,dx`,
      answerLatex: answer,
      choices: choices(answer, [
        `\\cos^{${power + 1}}(${argument})+C`,
        `${coefficient}\\sin^{${power + 1}}(${argument})+C`,
        `-\\sin^{${power + 1}}(${argument})+C`,
      ], next),
    };
  }

  if (kind === "parts-exponential") {
    const answer = `\\dfrac{e^{${rate}x}(${rate}x-1)}{${rate ** 2}}+C`;
    return {
      id, kind, label: "부분적분 · 지수함수", prompt: "부분적분을 이용하여 부정적분을 구하세요.",
      latex: `\\int xe^{${rate}x}\\,dx`,
      answerLatex: answer,
      choices: choices(answer, [
        `\\dfrac{xe^{${rate}x}}{${rate}}+C`,
        `\\dfrac{e^{${rate}x}(${rate}x+1)}{${rate ** 2}}+C`,
        `e^{${rate}x}(x-1)+C`,
      ], next),
    };
  }

  if (kind === "parts-trigonometric") {
    const answer = `-\\dfrac{x\\cos(${rate}x)}{${rate}}+\\dfrac{\\sin(${rate}x)}{${rate ** 2}}+C`;
    return {
      id, kind, label: "부분적분 · 삼각함수", prompt: "부분적분을 이용하여 부정적분을 구하세요.",
      latex: `\\int x\\sin(${rate}x)\\,dx`,
      answerLatex: answer,
      choices: choices(answer, [
        `\\dfrac{x\\cos(${rate}x)}{${rate}}-\\dfrac{\\sin(${rate}x)}{${rate ** 2}}+C`,
        `-\\dfrac{x\\cos(${rate}x)}{${rate}}+C`,
        `\\dfrac{x\\sin(${rate}x)}{${rate}}+\\dfrac{\\cos(${rate}x)}{${rate ** 2}}+C`,
      ], next),
    };
  }

  const coefficient = integer(next, 2, 5);
  const answer = `${coefficient}x\\ln x-${coefficient}x+C`;
  return {
    id, kind, label: "부분적분 · 로그함수", prompt: "1을 한 인수로 보고 부분적분을 이용하세요.",
    latex: `\\int ${coefficient}\\ln x\\,dx`,
    answerLatex: answer,
    choices: choices(answer, [
      `${coefficient}x\\ln x+C`,
      `${coefficient}\\dfrac{1}{x}+C`,
      `${coefficient}\\ln x-${coefficient}x+C`,
    ], next),
  };
}

export function createIntegrationTechniqueProblemSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => build(kind, next, `integration-technique-${index}`)) };
}
export function createIntegrationTechniqueReviewProblems(kinds: IntegrationTechniqueKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) =>
    build(kind, next, `integration-technique-review-${index}-${seed}`),
  );
}
