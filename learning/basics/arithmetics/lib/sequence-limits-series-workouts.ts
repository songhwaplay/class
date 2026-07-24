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

export const sequenceLimitsSeriesProblems: GeometryChoiceItem[] = [
  make(
    "ls1",
    "수열의 극한",
    "극한값은?",
    String.raw`\lim_{n\to\infty}\frac{3n+1}{n-2}`,
    String.raw`3`,
    [String.raw`0`, String.raw`1`, String.raw`\infty`],
  ),
  make(
    "ls2",
    "최고차항의 계수",
    "극한값은?",
    String.raw`\lim_{n\to\infty}\frac{2n^2-3}{5n^2+n}`,
    String.raw`\frac25`,
    [String.raw`\frac52`, String.raw`0`, String.raw`1`],
  ),
  make(
    "ls3",
    "유리화",
    "극한값은?",
    String.raw`\lim_{n\to\infty}\left(\sqrt{n^2+n}-n\right)`,
    String.raw`\frac12`,
    [String.raw`0`, String.raw`1`, String.raw`\infty`],
  ),
  make(
    "ls4",
    "무한등비급수",
    "급수의 합은?",
    String.raw`\sum_{k=0}^{\infty}\left(\frac13\right)^k`,
    String.raw`\frac32`,
    [String.raw`\frac12`, String.raw`1`, String.raw`3`],
  ),
  make(
    "ls5",
    "첫째항이 있는 등비급수",
    "급수의 합은?",
    String.raw`\sum_{n=1}^{\infty}2\left(\frac14\right)^{n-1}`,
    String.raw`\frac83`,
    [String.raw`\frac23`, String.raw`2`, String.raw`\frac{10}{3}`],
  ),
  make(
    "ls6",
    "급수의 수렴 조건",
    "급수가 수렴하는 $x$의 범위는?",
    String.raw`\sum_{n=0}^{\infty}(x-1)^n`,
    String.raw`0<x<2`,
    [String.raw`-1<x<1`, String.raw`0\le x\le2`, String.raw`x<0\ \text{또는}\ x>2`],
  ),
  make(
    "ls7",
    "부분분수와 무한급수",
    "급수의 합은?",
    String.raw`\sum_{n=1}^{\infty}\frac1{n(n+1)}`,
    String.raw`1`,
    [String.raw`\frac12`, String.raw`2`, String.raw`\infty`],
  ),
];
