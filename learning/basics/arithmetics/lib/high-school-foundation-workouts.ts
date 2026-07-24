import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

function item(id: string, label: string, latex: string, answer: string, distractors: string[]): GeometryChoiceItem {
  return {
    id,
    label,
    latex,
    correctLatex: answer,
    choices: [answer, ...distractors].map((value, index) => ({ id: `${id}-${index}`, latex: value, correct: index === 0 })),
  };
}

export const radianProblems: GeometryChoiceItem[] = [
  item("r1", "육십분법을 호도법으로", String.raw`150^\circ`, String.raw`\frac{5\pi}{6}`, [String.raw`\frac{3\pi}{5}`, String.raw`\frac{5\pi}{3}`, String.raw`\frac{6\pi}{5}`]),
  item("r2", "호도법을 육십분법으로", String.raw`\frac{7\pi}{12}`, String.raw`105^\circ`, [String.raw`75^\circ`, String.raw`120^\circ`, String.raw`210^\circ`]),
  item("r3", "동경이 같은 각", String.raw`\frac{17\pi}{6}`, String.raw`\frac{5\pi}{6}`, [String.raw`\frac{\pi}{6}`, String.raw`\frac{7\pi}{6}`, String.raw`\frac{11\pi}{6}`]),
  item("r4", "사분면", String.raw`\theta=-\frac{5\pi}{4}`, String.raw`\text{제2사분면}`, [String.raw`\text{제1사분면}`, String.raw`\text{제3사분면}`, String.raw`\text{제4사분면}`]),
  item("r5", "일반각", String.raw`\theta=\frac{\pi}{3}\text{과 동경이 같은 각}`, String.raw`2n\pi+\frac{\pi}{3}`, [String.raw`n\pi+\frac{\pi}{3}`, String.raw`2n\pi-\frac{\pi}{3}`, String.raw`n\pi-\frac{\pi}{3}`]),
  item("r6", "기준각", String.raw`\theta=\frac{7\pi}{6}`, String.raw`\frac{\pi}{6}`, [String.raw`\frac{5\pi}{6}`, String.raw`\frac{7\pi}{6}`, String.raw`\frac{\pi}{3}`]),
  item("r7", "각의 범위", String.raw`-2\pi<\theta\le2\pi,\quad \theta=\frac{\pi}{2}+2n\pi`, String.raw`\theta=-\frac{3\pi}{2},\ \frac{\pi}{2}`, [String.raw`\theta=-\frac{\pi}{2},\ \frac{3\pi}{2}`, String.raw`\theta=\frac{\pi}{2}`, String.raw`\theta=-\frac{3\pi}{2}`]),
];

export const arcSectorProblems: GeometryChoiceItem[] = [
  item("a1", "호의 길이", String.raw`r=6,\quad\theta=\frac{2\pi}{3}`, String.raw`l=4\pi`, [String.raw`l=2\pi`, String.raw`l=6\pi`, String.raw`l=8\pi`]),
  item("a2", "부채꼴의 넓이", String.raw`r=4,\quad\theta=\frac{3\pi}{4}`, String.raw`S=6\pi`, [String.raw`S=3\pi`, String.raw`S=12\pi`, String.raw`S=8\pi`]),
  item("a3", "중심각", String.raw`r=5,\quad l=3\pi`, String.raw`\theta=\frac{3\pi}{5}`, [String.raw`\theta=\frac{5\pi}{3}`, String.raw`\theta=\frac{3\pi}{10}`, String.raw`\theta=\frac{8\pi}{5}`]),
  item("a4", "반지름", String.raw`\theta=\frac{\pi}{3},\quad l=4\pi`, String.raw`r=12`, [String.raw`r=4`, String.raw`r=6`, String.raw`r=8`]),
  item("a5", "넓이와 호의 길이", String.raw`r=8,\quad l=6`, String.raw`S=24`, [String.raw`S=48`, String.raw`S=14`, String.raw`S=96`]),
  item("a6", "둘레", String.raw`r=3,\quad\theta=\frac{4\pi}{3}`, String.raw`6+4\pi`, [String.raw`3+4\pi`, String.raw`6+2\pi`, String.raw`9+4\pi`]),
  item("a7", "회전수", String.raw`5\pi\text{ rad}`, String.raw`\frac52\text{회}`, [String.raw`5\text{회}`, String.raw`\frac54\text{회}`, String.raw`10\text{회}`]),
];

export const probabilityProblems: GeometryChoiceItem[] = [
  item("q1", "여사건", String.raw`P(A)=\frac{3}{8}`, String.raw`P(A^c)=\frac58`, [String.raw`\frac38`, String.raw`\frac18`, String.raw`\frac78`]),
  item("q2", "합사건", String.raw`P(A)=\frac12,\ P(B)=\frac25,\ P(A\cap B)=\frac15`, String.raw`P(A\cup B)=\frac7{10}`, [String.raw`\frac9{10}`, String.raw`\frac12`, String.raw`\frac15`]),
  item("q3", "조건부확률", String.raw`P(A\cap B)=\frac14,\quad P(B)=\frac35`, String.raw`P(A\mid B)=\frac5{12}`, [String.raw`\frac3{20}`, String.raw`\frac{12}{5}`, String.raw`\frac7{20}`]),
  item("q4", "독립사건", String.raw`P(A)=\frac23,\quad P(B)=\frac35`, String.raw`P(A\cap B)=\frac25`, [String.raw`\frac1{15}`, String.raw`\frac45`, String.raw`\frac{19}{15}`]),
  item("q5", "시행의 반복", String.raw`P(\text{성공})=\frac13,\quad 3\text{번 중 정확히 2번 성공}`, String.raw`\frac29`, [String.raw`\frac19`, String.raw`\frac13`, String.raw`\frac49`]),
  item("q6", "곱셈정리", String.raw`P(A)=\frac45,\quad P(B\mid A)=\frac12`, String.raw`P(A\cap B)=\frac25`, [String.raw`\frac3{10}`, String.raw`\frac45`, String.raw`\frac12`]),
  item("q7", "전확률", String.raw`P(A)=\frac14,\ P(B\mid A)=\frac23,\ P(B\mid A^c)=\frac13`, String.raw`P(B)=\frac5{12}`, [String.raw`\frac14`, String.raw`\frac12`, String.raw`\frac7{12}`]),
];

export const distributionProblems: GeometryChoiceItem[] = [
  item("d1", "기댓값", String.raw`P(X=0,1,2)=\frac14,\frac12,\frac14,\quad E(X)=?`, String.raw`E(X)=1`, [String.raw`E(X)=\frac12`, String.raw`E(X)=\frac34`, String.raw`E(X)=2`]),
  item("d2", "분산", String.raw`E(X)=2,\quad E(X^2)=7,\quad V(X)=?`, String.raw`V(X)=3`, [String.raw`V(X)=5`, String.raw`V(X)=7`, String.raw`V(X)=9`]),
  item("d3", "이항분포의 평균", String.raw`X\sim B(20,0.3),\quad E(X)=?`, String.raw`E(X)=6`, [String.raw`E(X)=3`, String.raw`E(X)=14`, String.raw`E(X)=20`]),
  item("d4", "이항분포의 분산", String.raw`X\sim B\left(10,\frac25\right),\quad V(X)=?`, String.raw`V(X)=\frac{12}{5}`, [String.raw`V(X)=4`, String.raw`V(X)=\frac{24}{5}`, String.raw`V(X)=\frac65`]),
  item("d5", "표준화", String.raw`X\sim N(50,10^2),\quad X=65,\quad Z=?`, String.raw`Z=1.5`, [String.raw`Z=0.15`, String.raw`Z=5`, String.raw`Z=15`]),
  item("d6", "표본평균의 평균", String.raw`E(X)=12,\quad n=25,\quad E(\overline X)=?`, String.raw`E(\overline X)=12`, [String.raw`E(\overline X)=\frac{12}{25}`, String.raw`E(\overline X)=60`, String.raw`E(\overline X)=300`]),
  item("d7", "표본평균의 표준편차", String.raw`\sigma=15,\quad n=25,\quad \sigma_{\overline X}=?`, String.raw`\sigma_{\overline X}=3`, [String.raw`\sigma_{\overline X}=\frac35`, String.raw`\sigma_{\overline X}=5`, String.raw`\sigma_{\overline X}=15`]),
];
