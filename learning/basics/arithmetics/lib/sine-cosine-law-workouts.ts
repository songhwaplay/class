import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

function make(
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
    choices: [answer, ...distractors].map((value, index) => ({
      id: `${id}-${index}`,
      latex: value,
      correct: index === 0,
    })),
  };
}

export const sineCosineLawProblems: GeometryChoiceItem[] = [
  make(
    "sc1",
    "사인법칙으로 변의 길이",
    "변 $b$의 길이는?",
    String.raw`A=30^\circ,\quad B=45^\circ,\quad a=4\sqrt2`,
    String.raw`b=8`,
    [String.raw`b=4`, String.raw`b=4\sqrt2`, String.raw`b=8\sqrt2`],
  ),
  make(
    "sc2",
    "외접원의 반지름",
    "외접원의 반지름 $R$은?",
    String.raw`A=30^\circ,\quad a=6`,
    String.raw`R=6`,
    [String.raw`R=3`, String.raw`R=12`, String.raw`R=3\sqrt3`],
  ),
  make(
    "sc3",
    "코사인법칙으로 변의 길이",
    "변 $c$의 길이는?",
    String.raw`a=5,\quad b=7,\quad C=60^\circ`,
    String.raw`c=\sqrt{39}`,
    [String.raw`c=\sqrt{29}`, String.raw`c=\sqrt{49}`, String.raw`c=\sqrt{74}`],
  ),
  make(
    "sc4",
    "코사인법칙으로 각의 크기",
    "각 $C$의 크기는?",
    String.raw`a=3,\quad b=4,\quad c=5`,
    String.raw`C=90^\circ`,
    [String.raw`C=30^\circ`, String.raw`C=45^\circ`, String.raw`C=60^\circ`],
  ),
  make(
    "sc5",
    "두 변과 끼인각의 넓이",
    "삼각형의 넓이는?",
    String.raw`a=6,\quad b=8,\quad C=30^\circ`,
    String.raw`12`,
    [String.raw`24`, String.raw`12\sqrt3`, String.raw`24\sqrt3`],
  ),
  make(
    "sc6",
    "사인법칙의 활용",
    "변 $b$의 길이는?",
    String.raw`A=45^\circ,\quad B=30^\circ,\quad a=6`,
    String.raw`b=3\sqrt2`,
    [String.raw`b=3`, String.raw`b=6\sqrt2`, String.raw`b=2\sqrt3`],
  ),
  make(
    "sc7",
    "코사인값 구하기",
    "$\\cos C$는?",
    String.raw`a=5,\quad b=5,\quad c=6`,
    String.raw`\cos C=\frac7{25}`,
    [String.raw`\cos C=\frac7{50}`, String.raw`\cos C=\frac{18}{25}`, String.raw`\cos C=\frac{11}{25}`],
  ),
];
