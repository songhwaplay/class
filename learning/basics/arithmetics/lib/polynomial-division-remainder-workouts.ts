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

export const polynomialDivisionRemainderProblems: GeometryChoiceItem[] = [
  item(
    "pr1",
    "다항식의 곱셈",
    "전개한 식은?",
    String.raw`(x^2-2x+3)(x+4)`,
    String.raw`x^3+2x^2-5x+12`,
    [String.raw`x^3+2x^2+5x+12`, String.raw`x^3-6x^2-5x+12`, String.raw`x^3+2x^2-8x+12`],
  ),
  item(
    "pr2",
    "다항식의 나눗셈",
    "몫은?",
    String.raw`(2x^3+3x^2-11x-6)\div(x-2)`,
    String.raw`2x^2+7x+3`,
    [String.raw`2x^2-x-3`, String.raw`2x^2+7x-3`, String.raw`2x^2-x+3`],
  ),
  item(
    "pr3",
    "몫과 나머지",
    "몫 $Q(x)$와 나머지 $R$은?",
    String.raw`x^3-2x^2+4x-5=(x-2)Q(x)+R`,
    String.raw`Q(x)=x^2+4,\quad R=3`,
    [String.raw`Q(x)=x^2-4,\quad R=3`, String.raw`Q(x)=x^2+4,\quad R=-3`, String.raw`Q(x)=x^2+2x+4,\quad R=3`],
  ),
  item(
    "pr4",
    "나머지정리",
    "$x+1$로 나눈 나머지는?",
    String.raw`f(x)=x^4-3x^2+2x-5`,
    String.raw`-9`,
    [String.raw`-5`, String.raw`-3`, String.raw`9`],
  ),
  item(
    "pr5",
    "인수정리",
    "$x-2$가 인수가 되도록 하는 $k$는?",
    String.raw`f(x)=x^3+kx^2-5x+6`,
    String.raw`k=-1`,
    [String.raw`k=1`, String.raw`k=-2`, String.raw`k=2`],
  ),
  item(
    "pr6",
    "이차식으로 나눈 나머지",
    "$x^2+x-2$로 나눈 나머지는?",
    String.raw`x^4+x^3-5x^2-x+7`,
    String.raw`2x+1`,
    [String.raw`2x-1`, String.raw`x+2`, String.raw`-2x+1`],
  ),
  item(
    "pr7",
    "나머지의 결정",
    "$x^2-1$로 나눈 나머지는?",
    String.raw`f(1)=2,\quad f(-1)=-4`,
    String.raw`3x-1`,
    [String.raw`3x+1`, String.raw`x-3`, String.raw`-3x-1`],
  ),
];
