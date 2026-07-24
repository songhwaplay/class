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

export const meanValueTheoremProblems: GeometryChoiceItem[] = [
  item(
    "v1",
    "평균변화율",
    "구간에서의 평균변화율은?",
    String.raw`f(x)=x^2+1,\quad 1\le x\le3`,
    String.raw`4`,
    [String.raw`2`, String.raw`3`, String.raw`5`],
  ),
  item(
    "v2",
    "평균값정리의 조건",
    "평균값정리를 적용할 수 있는 조건은?",
    String.raw`a<b`,
    String.raw`\text{닫힌구간 }[a,b]\text{에서 연속이고 열린구간 }(a,b)\text{에서 미분 가능}`,
    [
      String.raw`\text{열린구간 }(a,b)\text{에서 연속이면 충분}`,
      String.raw`\text{닫힌구간 }[a,b]\text{에서 미분 가능하면 충분}`,
      String.raw`f(a)=f(b)\text{이어야 함}`,
    ],
  ),
  item(
    "v3",
    "평균값정리",
    "평균값정리를 만족하는 $c$는?",
    String.raw`f(x)=x^2,\quad 1\le x\le3`,
    String.raw`c=2`,
    [String.raw`c=1`, String.raw`c=\frac32`, String.raw`c=\frac52`],
  ),
  item(
    "v4",
    "평균값정리",
    "평균값정리를 만족하는 $c$는?",
    String.raw`f(x)=x^3,\quad 0\le x\le3`,
    String.raw`c=\sqrt3`,
    [String.raw`c=1`, String.raw`c=\frac32`, String.raw`c=3`],
  ),
  item(
    "v5",
    "롤의 정리",
    "롤의 정리를 만족하는 $c$는?",
    String.raw`f(x)=x^2-4x,\quad 0\le x\le4`,
    String.raw`c=2`,
    [String.raw`c=0`, String.raw`c=1`, String.raw`c=3`],
  ),
  item(
    "v6",
    "유리함수의 평균값정리",
    "평균값정리를 만족하는 $c$는?",
    String.raw`f(x)=\frac1x,\quad 1\le x\le2`,
    String.raw`c=\sqrt2`,
    [String.raw`c=\frac32`, String.raw`c=1`, String.raw`c=2`],
  ),
  item(
    "v7",
    "두 개의 c",
    "평균값정리를 만족하는 모든 $c$는?",
    String.raw`f(x)=x^3-3x,\quad -2\le x\le2`,
    String.raw`c=\pm\frac{2\sqrt3}{3}`,
    [String.raw`c=\pm\sqrt3`, String.raw`c=\pm1`, String.raw`c=0`],
  ),
];
