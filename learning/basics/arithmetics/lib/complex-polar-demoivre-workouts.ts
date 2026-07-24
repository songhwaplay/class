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

export const complexPolarDemoivreProblems: GeometryChoiceItem[] = [
  make(
    "cp1",
    "절댓값과 편각",
    "절댓값 $r$과 주편각 $\\theta$는?",
    String.raw`z=1+i`,
    String.raw`r=\sqrt2,\quad\theta=\frac{\pi}{4}`,
    [String.raw`r=2,\quad\theta=\frac{\pi}{4}`, String.raw`r=\sqrt2,\quad\theta=\frac{3\pi}{4}`, String.raw`r=1,\quad\theta=\frac{\pi}{2}`],
  ),
  make(
    "cp2",
    "복소수의 극형식",
    "극형식으로 나타낸 것은?",
    String.raw`z=-\sqrt3+i`,
    String.raw`2\left(\cos\frac{5\pi}{6}+i\sin\frac{5\pi}{6}\right)`,
    [
      String.raw`2\left(\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}\right)`,
      String.raw`\sqrt3\left(\cos\frac{5\pi}{6}+i\sin\frac{5\pi}{6}\right)`,
      String.raw`2\left(\cos\frac{7\pi}{6}+i\sin\frac{7\pi}{6}\right)`,
    ],
  ),
  make(
    "cp3",
    "극형식에서 직교형식으로",
    "$a+bi$의 꼴로 나타낸 것은?",
    String.raw`2\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)`,
    String.raw`1+\sqrt3i`,
    [String.raw`\sqrt3+i`, String.raw`1-\sqrt3i`, String.raw`\sqrt3-i`],
  ),
  make(
    "cp4",
    "극형식의 곱셈",
    "곱 $z_1z_2$는?",
    String.raw`z_1=2\left(\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}\right),\quad z_2=3\left(\cos\frac{3\pi}{4}+i\sin\frac{3\pi}{4}\right)`,
    String.raw`6\left(\cos\frac{11\pi}{12}+i\sin\frac{11\pi}{12}\right)`,
    [
      String.raw`6\left(\cos\frac{7\pi}{12}+i\sin\frac{7\pi}{12}\right)`,
      String.raw`5\left(\cos\frac{11\pi}{12}+i\sin\frac{11\pi}{12}\right)`,
      String.raw`6\left(\cos\frac{3\pi}{8}+i\sin\frac{3\pi}{8}\right)`,
    ],
  ),
  make(
    "cp5",
    "극형식의 나눗셈",
    "몫 $\\dfrac{z_1}{z_2}$는?",
    String.raw`z_1=6\left(\cos\frac{5\pi}{6}+i\sin\frac{5\pi}{6}\right),\quad z_2=2\left(\cos\frac{\pi}{3}+i\sin\frac{\pi}{3}\right)`,
    String.raw`3\left(\cos\frac{\pi}{2}+i\sin\frac{\pi}{2}\right)`,
    [
      String.raw`3\left(\cos\frac{7\pi}{6}+i\sin\frac{7\pi}{6}\right)`,
      String.raw`4\left(\cos\frac{\pi}{2}+i\sin\frac{\pi}{2}\right)`,
      String.raw`3\left(\cos\frac{5\pi}{18}+i\sin\frac{5\pi}{18}\right)`,
    ],
  ),
  make(
    "cp6",
    "드므아브르 정리",
    "값은?",
    String.raw`\left\{2\left(\cos\frac{\pi}{6}+i\sin\frac{\pi}{6}\right)\right\}^3`,
    String.raw`8i`,
    [String.raw`-8i`, String.raw`8`, String.raw`4i`],
  ),
  make(
    "cp7",
    "복소수의 세제곱근",
    "모든 해는?",
    String.raw`z^3=8`,
    String.raw`z=2\left(\cos\frac{2k\pi}{3}+i\sin\frac{2k\pi}{3}\right),\quad k=0,1,2`,
    [
      String.raw`z=2\left(\cos\frac{k\pi}{3}+i\sin\frac{k\pi}{3}\right),\quad k=0,1,2`,
      String.raw`z=8\left(\cos\frac{2k\pi}{3}+i\sin\frac{2k\pi}{3}\right),\quad k=0,1,2`,
      String.raw`z=2\left(\cos\frac{2k\pi}{3}+i\sin\frac{2k\pi}{3}\right),\quad k=0,1`,
    ],
  ),
];
