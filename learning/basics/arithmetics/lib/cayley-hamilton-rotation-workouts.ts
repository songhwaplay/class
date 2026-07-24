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

export const cayleyHamiltonRotationProblems: GeometryChoiceItem[] = [
  make(
    "ch1",
    "특성다항식",
    "특성다항식 $p(\\lambda)$는?",
    String.raw`A=\begin{pmatrix}2&1\\0&3\end{pmatrix}`,
    String.raw`p(\lambda)=\lambda^2-5\lambda+6`,
    [String.raw`p(\lambda)=\lambda^2+5\lambda+6`, String.raw`p(\lambda)=\lambda^2-6\lambda+5`, String.raw`p(\lambda)=\lambda^2-\lambda+6`],
  ),
  make(
    "ch2",
    "케일리–해밀턴 정리",
    "$A^2=aA+bI$일 때 $a$와 $b$는?",
    String.raw`A=\begin{pmatrix}1&1\\1&0\end{pmatrix}`,
    String.raw`a=1,\quad b=1`,
    [String.raw`a=1,\quad b=-1`, String.raw`a=2,\quad b=1`, String.raw`a=-1,\quad b=1`],
  ),
  make(
    "ch3",
    "행렬의 거듭제곱",
    "$A^5$를 $A$와 $I$로 나타낸 것은?",
    String.raw`A=\begin{pmatrix}1&1\\1&0\end{pmatrix}`,
    String.raw`A^5=5A+3I`,
    [String.raw`A^5=3A+2I`, String.raw`A^5=5A+2I`, String.raw`A^5=8A+5I`],
  ),
  make(
    "ch4",
    "케일리–해밀턴과 역행렬",
    "$A^{-1}$을 $A$와 $I$로 나타낸 것은?",
    String.raw`A^2=A+I`,
    String.raw`A^{-1}=A-I`,
    [String.raw`A^{-1}=A+I`, String.raw`A^{-1}=I-A`, String.raw`A^{-1}=2I-A`],
  ),
  make(
    "ch5",
    "회전행렬",
    "반시계 방향으로 π/3만큼 회전하는 행렬은?",
    String.raw`\theta=\frac{\pi}{3}`,
    String.raw`\begin{pmatrix}\frac12&-\frac{\sqrt3}{2}\\\frac{\sqrt3}{2}&\frac12\end{pmatrix}`,
    [
      String.raw`\begin{pmatrix}\frac12&\frac{\sqrt3}{2}\\-\frac{\sqrt3}{2}&\frac12\end{pmatrix}`,
      String.raw`\begin{pmatrix}\frac{\sqrt3}{2}&-\frac12\\\frac12&\frac{\sqrt3}{2}\end{pmatrix}`,
      String.raw`\begin{pmatrix}\frac12&-\frac12\\\frac{\sqrt3}{2}&\frac{\sqrt3}{2}\end{pmatrix}`,
    ],
  ),
  make(
    "ch6",
    "벡터의 회전",
    "반시계 방향으로 π/2만큼 회전한 벡터는?",
    String.raw`\mathbf v=\begin{pmatrix}2\\-1\end{pmatrix}`,
    String.raw`\begin{pmatrix}1\\2\end{pmatrix}`,
    [String.raw`\begin{pmatrix}-1\\-2\end{pmatrix}`, String.raw`\begin{pmatrix}-2\\1\end{pmatrix}`, String.raw`\begin{pmatrix}2\\1\end{pmatrix}`],
  ),
  make(
    "ch7",
    "회전행렬의 합성",
    "$R(\\alpha)R(\\beta)$는?",
    String.raw`R(\theta)=\begin{pmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{pmatrix}`,
    String.raw`R(\alpha+\beta)`,
    [String.raw`R(\alpha-\beta)`, String.raw`R(\alpha\beta)`, String.raw`R(\alpha)+R(\beta)`],
  ),
];
