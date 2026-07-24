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

export const determinantInverseProblems: GeometryChoiceItem[] = [
  make(
    "di1",
    "2×2 행렬식",
    "$\\det A$는?",
    String.raw`A=\begin{pmatrix}3&2\\1&4\end{pmatrix}`,
    String.raw`\det A=10`,
    [String.raw`\det A=14`, String.raw`\det A=8`, String.raw`\det A=5`],
  ),
  make(
    "di2",
    "삼각행렬의 행렬식",
    "$\\det A$는?",
    String.raw`A=\begin{pmatrix}2&1&0\\0&-3&2\\0&0&4\end{pmatrix}`,
    String.raw`\det A=-24`,
    [String.raw`\det A=24`, String.raw`\det A=-12`, String.raw`\det A=9`],
  ),
  make(
    "di3",
    "역행렬이 없는 조건",
    "역행렬이 존재하지 않도록 하는 $k$는?",
    String.raw`A=\begin{pmatrix}k&2\\3&6\end{pmatrix}`,
    String.raw`k=1`,
    [String.raw`k=-1`, String.raw`k=2`, String.raw`k=3`],
  ),
  make(
    "di4",
    "2×2 역행렬",
    "$A^{-1}$은?",
    String.raw`A=\begin{pmatrix}2&1\\1&1\end{pmatrix}`,
    String.raw`A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}`,
    [
      String.raw`A^{-1}=\begin{pmatrix}2&-1\\-1&1\end{pmatrix}`,
      String.raw`A^{-1}=\begin{pmatrix}1&1\\1&2\end{pmatrix}`,
      String.raw`A^{-1}=\begin{pmatrix}2&1\\1&1\end{pmatrix}`,
    ],
  ),
  make(
    "di5",
    "역행렬과 연립방정식",
    "$x$와 $y$는?",
    String.raw`\begin{pmatrix}2&1\\1&-1\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}5\\1\end{pmatrix}`,
    String.raw`x=2,\quad y=1`,
    [String.raw`x=1,\quad y=2`, String.raw`x=3,\quad y=-1`, String.raw`x=2,\quad y=-1`],
  ),
  make(
    "di6",
    "곱의 행렬식",
    "$\\det(AB)$는?",
    String.raw`\det A=2,\quad\det B=-3`,
    String.raw`\det(AB)=-6`,
    [String.raw`\det(AB)=-1`, String.raw`\det(AB)=5`, String.raw`\det(AB)=6`],
  ),
  make(
    "di7",
    "역행렬의 행렬식",
    "$\\det(A^{-1})$은?",
    String.raw`\det A=-4`,
    String.raw`\det(A^{-1})=-\frac14`,
    [String.raw`\det(A^{-1})=\frac14`, String.raw`\det(A^{-1})=-4`, String.raw`\det(A^{-1})=4`],
  ),
];
