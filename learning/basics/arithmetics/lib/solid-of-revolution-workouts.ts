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

export const solidOfRevolutionProblems: GeometryChoiceItem[] = [
  make(
    "sv1",
    "x축 회전·원판법",
    "회전체의 부피는?",
    String.raw`y=x,\quad 0\le x\le2,\quad x\text{축 둘레로 회전}`,
    String.raw`\frac{8\pi}{3}`,
    [String.raw`4\pi`, String.raw`\frac{4\pi}{3}`, String.raw`8\pi`],
  ),
  make(
    "sv2",
    "제곱근함수의 회전",
    "회전체의 부피는?",
    String.raw`y=\sqrt{x},\quad 0\le x\le4,\quad x\text{축 둘레로 회전}`,
    String.raw`8\pi`,
    [String.raw`4\pi`, String.raw`\frac{16\pi}{3}`, String.raw`16\pi`],
  ),
  make(
    "sv3",
    "포물선 영역의 회전",
    "회전체의 부피는?",
    String.raw`y=2x-x^2,\quad 0\le x\le2,\quad x\text{축 둘레로 회전}`,
    String.raw`\frac{16\pi}{15}`,
    [String.raw`\frac{8\pi}{15}`, String.raw`\frac{16\pi}{3}`, String.raw`\frac{32\pi}{15}`],
  ),
  make(
    "sv4",
    "와셔법",
    "회전체의 부피는?",
    String.raw`y=3,\quad y=x^2,\quad -\sqrt3\le x\le\sqrt3,\quad x\text{축 둘레로 회전}`,
    String.raw`\frac{72\sqrt3\pi}{5}`,
    [String.raw`\frac{36\sqrt3\pi}{5}`, String.raw`12\sqrt3\pi`, String.raw`18\sqrt3\pi`],
  ),
  make(
    "sv5",
    "y축 회전·원판법",
    "회전체의 부피는?",
    String.raw`0\le y\le x^2,\quad 0\le x\le1,\quad y\text{축 둘레로 회전}`,
    String.raw`\frac{\pi}{2}`,
    [String.raw`\frac{\pi}{3}`, String.raw`\pi`, String.raw`2\pi`],
  ),
  make(
    "sv6",
    "대칭인 영역의 회전",
    "회전체의 부피는?",
    String.raw`y=1-x^2,\quad -1\le x\le1,\quad x\text{축 둘레로 회전}`,
    String.raw`\frac{16\pi}{15}`,
    [String.raw`\frac{8\pi}{15}`, String.raw`\frac{4\pi}{3}`, String.raw`\frac{16\pi}{3}`],
  ),
  make(
    "sv7",
    "두 곡선 사이의 회전",
    "회전체의 부피는?",
    String.raw`y=x,\quad y=x^2,\quad 0\le x\le1,\quad x\text{축 둘레로 회전}`,
    String.raw`\frac{2\pi}{15}`,
    [String.raw`\frac{\pi}{15}`, String.raw`\frac{2\pi}{3}`, String.raw`\frac{4\pi}{15}`],
  ),
];
