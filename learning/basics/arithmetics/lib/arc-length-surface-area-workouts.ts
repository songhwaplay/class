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

export const arcLengthSurfaceAreaProblems: GeometryChoiceItem[] = [
  make(
    "as1",
    "곡선의 길이 공식",
    "곡선의 길이 L을 나타낸 것은?",
    String.raw`y=f(x),\quad a\le x\le b`,
    String.raw`L=\int_a^b\sqrt{1+\{f'(x)\}^2}\,dx`,
    [
      String.raw`L=\int_a^b\{1+f'(x)\}\,dx`,
      String.raw`L=\int_a^b\sqrt{1+f'(x)}\,dx`,
      String.raw`L=\int_a^b\{1+\{f'(x)\}^2\}\,dx`,
    ],
  ),
  make(
    "as2",
    "직선 선분의 길이",
    "곡선의 길이는?",
    String.raw`y=3x,\quad 0\le x\le2`,
    String.raw`2\sqrt{10}`,
    [String.raw`\sqrt{10}`, String.raw`6`, String.raw`2\sqrt3`],
  ),
  make(
    "as3",
    "적분이 간단해지는 곡선",
    "곡선의 길이는?",
    String.raw`y=\frac23x^{3/2},\quad 0\le x\le3`,
    String.raw`\frac{14}{3}`,
    [String.raw`\frac73`, String.raw`4`, String.raw`\frac{16}{3}`],
  ),
  make(
    "as4",
    "매개변수 곡선의 길이",
    "곡선의 길이는?",
    String.raw`x=3\cos t,\quad y=3\sin t,\quad 0\le t\le\frac{\pi}{2}`,
    String.raw`\frac{3\pi}{2}`,
    [String.raw`\frac{\pi}{2}`, String.raw`3\pi`, String.raw`6\pi`],
  ),
  make(
    "as5",
    "회전체의 겉넓이",
    "회전체의 겉넓이는?",
    String.raw`y=x,\quad 0\le x\le1,\quad x\text{축 둘레로 회전}`,
    String.raw`\sqrt2\pi`,
    [String.raw`\frac{\sqrt2\pi}{2}`, String.raw`2\sqrt2\pi`, String.raw`\pi`],
  ),
  make(
    "as6",
    "제곱근함수의 회전면",
    "회전체의 겉넓이는?",
    String.raw`y=\sqrt{x},\quad 0\le x\le4,\quad x\text{축 둘레로 회전}`,
    String.raw`\frac{\pi}{6}\left(17\sqrt{17}-1\right)`,
    [
      String.raw`\frac{\pi}{3}\left(17\sqrt{17}-1\right)`,
      String.raw`\frac{\pi}{6}\left(9\sqrt9-1\right)`,
      String.raw`\frac{\pi}{2}\left(17\sqrt{17}-1\right)`,
    ],
  ),
  make(
    "as7",
    "구의 겉넓이 유도",
    "회전하여 생기는 구의 겉넓이는?",
    String.raw`y=\sqrt{9-x^2},\quad -3\le x\le3,\quad x\text{축 둘레로 회전}`,
    String.raw`36\pi`,
    [String.raw`18\pi`, String.raw`27\pi`, String.raw`54\pi`],
  ),
];
