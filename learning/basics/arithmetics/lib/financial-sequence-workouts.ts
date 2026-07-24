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

export const financialSequenceProblems: GeometryChoiceItem[] = [
  make(
    "fs1",
    "단리의 원리합계",
    "3년 후 원리합계는?",
    String.raw`\text{원금 }100\text{만 원},\quad \text{연이율 }5\%`,
    String.raw`115\text{만 원}`,
    [String.raw`105\text{만 원}`, String.raw`110\text{만 원}`, String.raw`115.7625\text{만 원}`],
  ),
  make(
    "fs2",
    "복리의 원리합계",
    "2년 후 원리합계는?",
    String.raw`\text{원금 }100\text{만 원},\quad \text{연이율 }10\%`,
    String.raw`121\text{만 원}`,
    [String.raw`110\text{만 원}`, String.raw`120\text{만 원}`, String.raw`122\text{만 원}`],
  ),
  make(
    "fs3",
    "복리에서 원금",
    "처음 예금한 원금은?",
    String.raw`\text{연이율 }10\%,\quad 2\text{년 후 }121\text{만 원}`,
    String.raw`100\text{만 원}`,
    [String.raw`99\text{만 원}`, String.raw`101\text{만 원}`, String.raw`110\text{만 원}`],
  ),
  make(
    "fs4",
    "복리에서 이율",
    "연이율은?",
    String.raw`100\text{만 원}\longrightarrow121\text{만 원}\quad(2\text{년})`,
    String.raw`10\%`,
    [String.raw`5\%`, String.raw`10.5\%`, String.raw`21\%`],
  ),
  make(
    "fs5",
    "매년 말 적립",
    "3년째 말의 적립금은?",
    String.raw`\text{매년 말 }100\text{만 원},\quad \text{연이율 }10\%`,
    String.raw`331\text{만 원}`,
    [String.raw`300\text{만 원}`, String.raw`330\text{만 원}`, String.raw`364.1\text{만 원}`],
  ),
  make(
    "fs6",
    "매년 초 적립",
    "3년째 말의 적립금은?",
    String.raw`\text{매년 초 }100\text{만 원},\quad \text{연이율 }10\%`,
    String.raw`364.1\text{만 원}`,
    [String.raw`300\text{만 원}`, String.raw`331\text{만 원}`, String.raw`366.3\text{만 원}`],
  ),
  make(
    "fs7",
    "단리와 복리의 비교",
    "2년 후 복리 원리합계에서 단리 원리합계를 뺀 값은?",
    String.raw`\text{원금 }100\text{만 원},\quad \text{연이율 }10\%`,
    String.raw`1\text{만 원}`,
    [String.raw`0\text{만 원}`, String.raw`10\text{만 원}`, String.raw`11\text{만 원}`],
  ),
];
