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

export const matrixProblems: GeometryChoiceItem[] = [
  item(
    "m1",
    "행렬의 성분",
    "두 행렬이 같을 때 $x$와 $y$는?",
    String.raw`\begin{pmatrix}x&-2\\3&y\end{pmatrix}=\begin{pmatrix}4&-2\\3&5\end{pmatrix}`,
    String.raw`x=4,\quad y=5`,
    [String.raw`x=5,\quad y=4`, String.raw`x=-4,\quad y=5`, String.raw`x=4,\quad y=-5`],
  ),
  item(
    "m2",
    "행렬의 덧셈",
    "$A+B$는?",
    String.raw`A=\begin{pmatrix}2&-1\\3&4\end{pmatrix},\quad B=\begin{pmatrix}-5&2\\1&-3\end{pmatrix}`,
    String.raw`\begin{pmatrix}-3&1\\4&1\end{pmatrix}`,
    [String.raw`\begin{pmatrix}7&-3\\2&7\end{pmatrix}`, String.raw`\begin{pmatrix}-3&-3\\4&-7\end{pmatrix}`, String.raw`\begin{pmatrix}3&1\\4&1\end{pmatrix}`],
  ),
  item(
    "m3",
    "행렬의 뺄셈",
    "$2A-B$는?",
    String.raw`A=\begin{pmatrix}1&3\\-2&4\end{pmatrix},\quad B=\begin{pmatrix}2&-1\\5&3\end{pmatrix}`,
    String.raw`\begin{pmatrix}0&7\\-9&5\end{pmatrix}`,
    [String.raw`\begin{pmatrix}0&5\\1&5\end{pmatrix}`, String.raw`\begin{pmatrix}4&5\\1&11\end{pmatrix}`, String.raw`\begin{pmatrix}-1&4\\-7&1\end{pmatrix}`],
  ),
  item(
    "m4",
    "행렬의 실수배",
    "$kA$의 $(2,1)$성분이 12일 때 $k$는?",
    String.raw`A=\begin{pmatrix}2&-1\\3&5\end{pmatrix}`,
    String.raw`k=4`,
    [String.raw`k=3`, String.raw`k=5`, String.raw`k=6`],
  ),
  item(
    "m5",
    "행렬의 곱셈",
    "$AB$는?",
    String.raw`A=\begin{pmatrix}1&2\\-1&3\end{pmatrix},\quad B=\begin{pmatrix}4&-2\\1&5\end{pmatrix}`,
    String.raw`\begin{pmatrix}6&8\\-1&17\end{pmatrix}`,
    [String.raw`\begin{pmatrix}4&10\\-1&15\end{pmatrix}`, String.raw`\begin{pmatrix}2&12\\-7&17\end{pmatrix}`, String.raw`\begin{pmatrix}6&-8\\1&17\end{pmatrix}`],
  ),
  item(
    "m6",
    "행렬의 곱의 성분",
    "$AB$의 $(1,2)$성분은?",
    String.raw`A=\begin{pmatrix}2&-1&3\\4&0&1\end{pmatrix},\quad B=\begin{pmatrix}1&2\\-2&5\\3&-1\end{pmatrix}`,
    String.raw`-4`,
    [String.raw`10`, String.raw`4`, String.raw`-10`],
  ),
  item(
    "m7",
    "행렬 방정식",
    "행렬 $X$는?",
    String.raw`2X+\begin{pmatrix}1&-3\\2&4\end{pmatrix}=\begin{pmatrix}7&5\\-4&10\end{pmatrix}`,
    String.raw`X=\begin{pmatrix}3&4\\-3&3\end{pmatrix}`,
    [String.raw`X=\begin{pmatrix}4&1\\-1&7\end{pmatrix}`, String.raw`X=\begin{pmatrix}3&1\\-3&7\end{pmatrix}`, String.raw`X=\begin{pmatrix}6&8\\-6&6\end{pmatrix}`],
  ),
];
