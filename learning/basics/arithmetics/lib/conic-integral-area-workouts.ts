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

export const conicIntegralAreaProblems: GeometryChoiceItem[] = [
  make(
    "ci1",
    "타원의 넓이",
    "타원의 넓이는?",
    String.raw`\frac{x^2}{9}+\frac{y^2}{4}=1`,
    String.raw`6\pi`,
    [String.raw`3\pi`, String.raw`12\pi`, String.raw`13\pi`],
  ),
  make(
    "ci2",
    "타원 윗부분의 적분",
    "적분값은?",
    String.raw`\int_{-3}^{3}2\sqrt{1-\frac{x^2}{9}}\,dx`,
    String.raw`3\pi`,
    [String.raw`\frac{3\pi}{2}`, String.raw`6\pi`, String.raw`9\pi`],
  ),
  make(
    "ci3",
    "타원의 사분면 넓이",
    "제1사분면 부분의 넓이는?",
    String.raw`\frac{x^2}{16}+\frac{y^2}{9}=1`,
    String.raw`3\pi`,
    [String.raw`6\pi`, String.raw`12\pi`, String.raw`\frac{3\pi}{2}`],
  ),
  make(
    "ci4",
    "포물선과 직선 사이의 넓이",
    "둘러싸인 부분의 넓이는?",
    String.raw`y^2=4x,\quad x=1`,
    String.raw`\frac83`,
    [String.raw`\frac43`, String.raw`2`, String.raw`\frac{16}{3}`],
  ),
  make(
    "ci5",
    "포물선과 x축 사이의 넓이",
    "둘러싸인 부분의 넓이는?",
    String.raw`y=4-x^2,\quad y=0`,
    String.raw`\frac{32}{3}`,
    [String.raw`\frac{16}{3}`, String.raw`8`, String.raw`\frac{64}{3}`],
  ),
  make(
    "ci6",
    "쌍곡선 아래의 넓이",
    "넓이는?",
    String.raw`y=\frac1x,\quad 1\le x\le e`,
    String.raw`1`,
    [String.raw`\frac12`, String.raw`e-1`, String.raw`e`],
  ),
  make(
    "ci7",
    "두 쌍곡선 사이의 넓이",
    "두 곡선 사이의 넓이는?",
    String.raw`y=\frac2x,\quad y=\frac1x,\quad 1\le x\le e`,
    String.raw`1`,
    [String.raw`\frac12`, String.raw`2`, String.raw`e`],
  ),
];
