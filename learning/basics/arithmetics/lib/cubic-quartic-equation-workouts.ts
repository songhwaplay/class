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
    "인수정리의 사용",
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
    "사차방정식 · 인수정리와 조립제법",
    "인수정리와 조립제법을 이용하여 모든 해를 구하세요.",
    String.raw`x^4-2x^3-4x^2+11x-6=0`,
    String.raw`x=1,\ 2,\ \frac{-1\pm\sqrt{13}}{2}`,
    [
      String.raw`x=1,\ 2,\ \frac{1\pm\sqrt{13}}{2}`,
      String.raw`x=-1,\ -2,\ \frac{-1\pm\sqrt{13}}{2}`,
      String.raw`x=1,\ 2,\ \frac{-1\pm\sqrt5}{2}`,
    ],
  ),
  item(
    "cq5",
    "사차방정식 · 완전제곱식과 합차",
    "완전제곱식을 만든 뒤 합차공식을 이용하여 모든 해를 구하세요.",
    String.raw`x^4-15x^2+25=0`,
    String.raw`x=\frac{-5\pm\sqrt5}{2},\ \frac{5\pm\sqrt5}{2}`,
    [
      String.raw`x=\frac{-5\pm\sqrt{15}}{2},\ \frac{5\pm\sqrt{15}}{2}`,
      String.raw`x=\frac{-5\pm\sqrt5}{2}`,
      String.raw`x=\pm5,\ \pm1`,
    ],
  ),
  item(
    "cq6",
    "사차방정식 · 상반방정식",
    "양변을 x^2으로 나눈 뒤 치환하여 모든 해를 구하세요.",
    String.raw`x^4-7x^3+14x^2-7x+1=0`,
    String.raw`x=2\pm\sqrt3,\ \frac{3\pm\sqrt5}{2}`,
    [
      String.raw`x=2\pm\sqrt5,\ \frac{3\pm\sqrt3}{2}`,
      String.raw`x=2\pm\sqrt3`,
      String.raw`x=\pm1,\ \pm2`,
    ],
  ),
  item(
    "cq7",
    "사차방정식 · 공통부분 치환",
    "공통부분을 한 문자로 치환하여 모든 해를 구하세요.",
    String.raw`(x^2-4x)^2-5(x^2-4x)+6=0`,
    String.raw`x=2\pm\sqrt6,\ 2\pm\sqrt7`,
    [
      String.raw`x=2\pm\sqrt6`,
      String.raw`x=2\pm\sqrt7`,
      String.raw`x=-2\pm\sqrt6,\ -2\pm\sqrt7`,
    ],
  ),
];
