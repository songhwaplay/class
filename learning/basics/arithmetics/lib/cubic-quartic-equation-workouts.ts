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

export const cubicQuarticEquationProblems: GeometryChoiceItem[] = [
  item(
    "cq1",
    "삼차방정식의 해",
    "모든 해는?",
    String.raw`x^3-6x^2+11x-6=0`,
    String.raw`x=1,\ 2,\ 3`,
    [String.raw`x=-1,\ 2,\ 3`, String.raw`x=1,\ -2,\ 3`, String.raw`x=1,\ 2,\ -3`],
  ),
  item(
    "cq2",
    "인수정리의 활용",
    "모든 해는?",
    String.raw`x^3-4x^2+x+6=0`,
    String.raw`x=-1,\ 2,\ 3`,
    [String.raw`x=1,\ 2,\ 3`, String.raw`x=-1,\ -2,\ 3`, String.raw`x=-1,\ 2,\ -3`],
  ),
  item(
    "cq3",
    "중근이 있는 삼차방정식",
    "서로 다른 모든 해는?",
    String.raw`x^3-3x^2+4=0`,
    String.raw`x=-1,\ 2`,
    [String.raw`x=1,\ 2`, String.raw`x=-2,\ 1`, String.raw`x=-1,\ -2`],
  ),
  item(
    "cq4",
    "공통인수로 묶기",
    "모든 해는?",
    String.raw`x^3-4x=0`,
    String.raw`x=-2,\ 0,\ 2`,
    [String.raw`x=-4,\ 0,\ 4`, String.raw`x=-2,\ 2`, String.raw`x=0,\ 2,\ 4`],
  ),
  item(
    "cq5",
    "x²으로 치환",
    "모든 해는?",
    String.raw`x^4-5x^2+4=0`,
    String.raw`x=\pm1,\ \pm2`,
    [String.raw`x=\pm1,\ \pm4`, String.raw`x=\pm2,\ \pm4`, String.raw`x=1,\ 2`],
  ),
  item(
    "cq6",
    "사차방정식의 인수분해",
    "모든 해는?",
    String.raw`x^4-13x^2+36=0`,
    String.raw`x=\pm2,\ \pm3`,
    [String.raw`x=\pm1,\ \pm6`, String.raw`x=\pm2,\ \pm6`, String.raw`x=2,\ 3`],
  ),
  item(
    "cq7",
    "복이차식",
    "서로 다른 실근의 개수는?",
    String.raw`x^4-8x^2+16=0`,
    String.raw`2`,
    [String.raw`1`, String.raw`3`, String.raw`4`],
  ),
];
