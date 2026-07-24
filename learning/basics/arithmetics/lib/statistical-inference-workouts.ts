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

export const statisticalInferenceProblems: GeometryChoiceItem[] = [
  item(
    "s1",
    "모집단과 표본",
    "모집단의 크기와 표본의 크기는?",
    String.raw`\text{학생 600명 중 50명을 뽑아 조사한다.}`,
    String.raw`N=600,\quad n=50`,
    [String.raw`N=50,\quad n=600`, String.raw`N=650,\quad n=50`, String.raw`N=600,\quad n=550`],
  ),
  item(
    "s2",
    "모평균과 모표준편차",
    "모평균 μ와 모표준편차 σ는?",
    String.raw`X\sim N(70,8^2)`,
    String.raw`\mu=70,\quad \sigma=8`,
    [String.raw`\mu=70,\quad \sigma=64`, String.raw`\mu=8,\quad \sigma=70`, String.raw`\mu=64,\quad \sigma=8`],
  ),
  item(
    "s3",
    "표본평균",
    "표본평균은?",
    String.raw`12,\ 15,\ 9,\ 14,\ 10`,
    String.raw`\overline{x}=12`,
    [String.raw`\overline{x}=10`, String.raw`\overline{x}=11`, String.raw`\overline{x}=13`],
  ),
  item(
    "s4",
    "표본평균의 평균",
    String.raw`E(\overline X)는?`,
    String.raw`\mu=50,\quad \sigma=12,\quad n=36`,
    String.raw`E(\overline X)=50`,
    [String.raw`E(\overline X)=2`, String.raw`E(\overline X)=\frac{25}{18}`, String.raw`E(\overline X)=300`],
  ),
  item(
    "s5",
    "표본평균의 표준편차",
    String.raw`\sigma_{\overline X}는?`,
    String.raw`\sigma=12,\quad n=36`,
    String.raw`\sigma_{\overline X}=2`,
    [String.raw`\sigma_{\overline X}=\frac13`, String.raw`\sigma_{\overline X}=6`, String.raw`\sigma_{\overline X}=12`],
  ),
  item(
    "s6",
    "모평균의 신뢰구간",
    String.raw`신뢰도 95\%의 모평균 \mu의 신뢰구간은?`,
    String.raw`\overline{x}=50,\quad \sigma=10,\quad n=100,\quad z_{0.025}=1.96`,
    String.raw`48.04\le\mu\le51.96`,
    [String.raw`49.02\le\mu\le50.98`, String.raw`40.2\le\mu\le59.8`, String.raw`48\le\mu\le52`],
  ),
  item(
    "s7",
    "신뢰구간의 폭",
    String.raw`신뢰도 95\%의 신뢰구간의 폭은?`,
    String.raw`\sigma=5,\quad n=100,\quad z_{0.025}=1.96`,
    String.raw`1.96`,
    [String.raw`0.98`, String.raw`3.92`, String.raw`9.8`],
  ),
];
