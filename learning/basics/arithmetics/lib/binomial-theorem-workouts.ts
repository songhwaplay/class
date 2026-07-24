import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

function choices(id: string, answer: string, distractors: string[]) {
  return [answer, ...distractors].map((latex, index) => ({
    id: `${id}-${index}`,
    latex,
    correct: index === 0,
  }));
}

function item(
  id: string,
  label: string,
  prompt: string,
  latex: string,
  answer: string,
  distractors: string[],
): GeometryChoiceItem {
  return {
    id,
    label,
    prompt,
    latex,
    correctLatex: answer,
    choices: choices(id, answer, distractors),
  };
}

export const binomialTheoremProblems: GeometryChoiceItem[] = [
  item(
    "b1",
    "특정 항의 계수",
    String.raw`$x^3$의 계수는?`,
    String.raw`(2+x)^5`,
    String.raw`40`,
    [String.raw`20`, String.raw`80`, String.raw`10`],
  ),
  item(
    "b2",
    "상수항",
    "상수항은?",
    String.raw`\left(x+\frac{2}{x}\right)^6`,
    String.raw`160`,
    [String.raw`80`, String.raw`120`, String.raw`240`],
  ),
  item(
    "b3",
    "계수의 합",
    "각 항의 계수의 합은?",
    String.raw`(2x-1)^6`,
    String.raw`1`,
    [String.raw`0`, String.raw`64`, String.raw`729`],
  ),
  item(
    "b4",
    "계수의 교대합",
    "짝수 차수 항의 계수의 합에서 홀수 차수 항의 계수의 합을 뺀 값은?",
    String.raw`(2x-1)^5`,
    String.raw`-243`,
    [String.raw`243`, String.raw`-1`, String.raw`1`],
  ),
  item(
    "b5",
    "가운데 항",
    "가운데 항은?",
    String.raw`(a+b)^8`,
    String.raw`70a^4b^4`,
    [String.raw`56a^3b^5`, String.raw`56a^5b^3`, String.raw`28a^4b^4`],
  ),
  item(
    "b6",
    "이항계수",
    String.raw`$x^4$의 계수는?`,
    String.raw`(1+x)^7`,
    String.raw`35`,
    [String.raw`21`, String.raw`28`, String.raw`42`],
  ),
  item(
    "b7",
    "이항계수의 합",
    "값은?",
    String.raw`\sum_{k=0}^{8}\binom{8}{k}`,
    String.raw`256`,
    [String.raw`128`, String.raw`64`, String.raw`512`],
  ),
];
