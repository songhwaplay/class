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

export const trigonometricAdditionProblems: GeometryChoiceItem[] = [
  make(
    "ta1",
    "사인 덧셈정리",
    "값은?",
    String.raw`\sin75^\circ`,
    String.raw`\frac{\sqrt6+\sqrt2}{4}`,
    [String.raw`\frac{\sqrt6-\sqrt2}{4}`, String.raw`\frac{\sqrt3+1}{2}`, String.raw`\frac{\sqrt2}{2}`],
  ),
  make(
    "ta2",
    "코사인 뺄셈정리",
    "값은?",
    String.raw`\cos15^\circ`,
    String.raw`\frac{\sqrt6+\sqrt2}{4}`,
    [String.raw`\frac{\sqrt6-\sqrt2}{4}`, String.raw`\frac{\sqrt3-1}{2}`, String.raw`\frac12`],
  ),
  make(
    "ta3",
    "탄젠트 덧셈정리",
    "값은?",
    String.raw`\tan75^\circ`,
    String.raw`2+\sqrt3`,
    [String.raw`2-\sqrt3`, String.raw`\sqrt3`, String.raw`1+\sqrt3`],
  ),
  make(
    "ta4",
    "합을 곱으로",
    "곱의 꼴로 나타낸 식은?",
    String.raw`\sin\alpha+\sin\beta`,
    String.raw`2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}`,
    [
      String.raw`2\cos\frac{\alpha+\beta}{2}\sin\frac{\alpha-\beta}{2}`,
      String.raw`2\sin\frac{\alpha-\beta}{2}\cos\frac{\alpha+\beta}{2}`,
      String.raw`2\cos\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}`,
    ],
  ),
  make(
    "ta5",
    "차를 곱으로",
    "곱의 꼴로 나타낸 식은?",
    String.raw`\sin\alpha-\sin\beta`,
    String.raw`2\cos\frac{\alpha+\beta}{2}\sin\frac{\alpha-\beta}{2}`,
    [
      String.raw`2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}`,
      String.raw`-2\cos\frac{\alpha+\beta}{2}\sin\frac{\alpha-\beta}{2}`,
      String.raw`2\cos\frac{\alpha-\beta}{2}\cos\frac{\alpha+\beta}{2}`,
    ],
  ),
  make(
    "ta6",
    "곱을 합으로",
    "합의 꼴로 나타낸 식은?",
    String.raw`2\sin\alpha\cos\beta`,
    String.raw`\sin(\alpha+\beta)+\sin(\alpha-\beta)`,
    [
      String.raw`\sin(\alpha+\beta)-\sin(\alpha-\beta)`,
      String.raw`\cos(\alpha-\beta)-\cos(\alpha+\beta)`,
      String.raw`\cos(\alpha+\beta)+\cos(\alpha-\beta)`,
    ],
  ),
  make(
    "ta7",
    "곱을 합으로",
    "합의 꼴로 나타낸 식은?",
    String.raw`2\cos\alpha\cos\beta`,
    String.raw`\cos(\alpha+\beta)+\cos(\alpha-\beta)`,
    [
      String.raw`\cos(\alpha+\beta)-\cos(\alpha-\beta)`,
      String.raw`\sin(\alpha+\beta)+\sin(\alpha-\beta)`,
      String.raw`\sin(\alpha+\beta)-\sin(\alpha-\beta)`,
    ],
  ),
];
