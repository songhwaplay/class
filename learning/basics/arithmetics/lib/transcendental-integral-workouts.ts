export type TranscendentalIntegralKind =
  | "natural-exponential"
  | "general-exponential"
  | "log-derivative"
  | "sine-linear"
  | "cosine-linear"
  | "quadratic-substitution";

export type TranscendentalIntegralChoice = { id: string; latex: string; correct: boolean };
export type TranscendentalIntegralProblem = {
  id: string;
  kind: TranscendentalIntegralKind;
  label: string;
  latex: string;
  answerLatex: string;
  choices: TranscendentalIntegralChoice[];
};

const KINDS: TranscendentalIntegralKind[] = [
  "natural-exponential",
  "general-exponential",
  "log-derivative",
  "sine-linear",
  "cosine-linear",
  "quadratic-substitution",
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
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function signed(value: number) { return value === 0 ? "" : value < 0 ? String(value) : `+${value}`; }
function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
function makeChoices(correct: string, distractors: string[], next: () => number) {
  return shuffle([...new Set([correct, ...distractors])].slice(0, 4).map((latex, index) => ({
    id: `choice-${index}-${latex}`, latex, correct: latex === correct,
  })), next);
}

function build(kind: TranscendentalIntegralKind, next: () => number, id: string): TranscendentalIntegralProblem {
  const rate = integer(next, 2, 5);
  const factor = integer(next, 2, 5);
  const constant = integer(next, -4, 4);
  const argument = `${rate}x${signed(constant)}`;

  if (kind === "natural-exponential") {
    const integrand = rate * factor;
    const answer = `${factor}e^{${argument}}+C`;
    return { id, kind, label: "자연지수함수의 역미분", latex: `\\int ${integrand}e^{${argument}}\\,dx`, answerLatex: answer,
      choices: makeChoices(answer, [`${integrand}e^{${argument}}+C`, `\\dfrac{${factor}}{${rate}}e^{${argument}}+C`, `${factor}e^{x${signed(constant)}}+C`], next) };
  }
  if (kind === "general-exponential") {
    const base = integer(next, 2, 7);
    const integrand = rate * factor;
    const answer = `\\dfrac{${factor}\\cdot${base}^{${argument}}}{\\ln ${base}}+C`;
    return { id, kind, label: "지수함수의 역미분", latex: `\\int ${integrand}\\cdot${base}^{${argument}}\\,dx`, answerLatex: answer,
      choices: makeChoices(answer, [`${factor}\\cdot${base}^{${argument}}\\ln ${base}+C`, `${factor}\\cdot${base}^{${argument}}+C`, `\\dfrac{${integrand}\\cdot${base}^{${argument}}}{\\ln ${base}}+C`], next) };
  }
  if (kind === "log-derivative") {
    const numerator = rate * factor;
    const answer = `${factor}\\ln\\left|${argument}\\right|+C`;
    return { id, kind, label: "로그미분형의 역미분", latex: `\\int \\dfrac{${numerator}}{${argument}}\\,dx`, answerLatex: answer,
      choices: makeChoices(answer, [`${numerator}\\ln\\left|${argument}\\right|+C`, `${factor}\\ln x+C`, `\\dfrac{${factor}}{${argument}}+C`], next) };
  }
  if (kind === "sine-linear") {
    const integrand = rate * factor;
    const answer = `-${factor}\\cos(${argument})+C`;
    return { id, kind, label: "사인함수의 역미분", latex: `\\int ${integrand}\\sin(${argument})\\,dx`, answerLatex: answer,
      choices: makeChoices(answer, [`${factor}\\cos(${argument})+C`, `${factor}\\sin(${argument})+C`, `-${integrand}\\cos(${argument})+C`], next) };
  }
  if (kind === "cosine-linear") {
    const integrand = rate * factor;
    const answer = `${factor}\\sin(${argument})+C`;
    return { id, kind, label: "코사인함수의 역미분", latex: `\\int ${integrand}\\cos(${argument})\\,dx`, answerLatex: answer,
      choices: makeChoices(answer, [`-${factor}\\sin(${argument})+C`, `${factor}\\cos(${argument})+C`, `${integrand}\\sin(${argument})+C`], next) };
  }
  const quadratic = integer(next, 2, 4);
  const integrand = 2 * quadratic * factor;
  const exponent = `${quadratic}x^{2}${signed(constant)}`;
  const answer = `${factor}e^{${exponent}}+C`;
  return { id, kind, label: "치환이 필요한 지수함수", latex: `\\int ${integrand}x e^{${exponent}}\\,dx`, answerLatex: answer,
    choices: makeChoices(answer, [`${integrand}e^{${exponent}}+C`, `${factor}x e^{${exponent}}+C`, `${factor}e^{${quadratic}x${signed(constant)}}+C`], next) };
}

export function createTranscendentalIntegralProblemSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => build(kind, next, `transcendental-integral-${index}`)) };
}
export function createTranscendentalIntegralReviewProblems(kinds: TranscendentalIntegralKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `transcendental-integral-review-${index}-${seed}`));
}
