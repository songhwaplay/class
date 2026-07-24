import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function pick<T>(next: () => number, values: readonly T[]) {
  return values[Math.floor(next() * values.length)];
}

function choices(id: string, answer: string, distractors: string[]) {
  return [answer, ...distractors].map((latex, index) => ({
    id: `${id}-${index}`,
    latex,
    correct: index === 0,
  }));
}

function item(id: string, label: string, prompt: string, latex: string, answer: string, distractors: string[]): GeometryChoiceItem {
  return { id, label, prompt, latex, correctLatex: answer, choices: choices(id, answer, distractors) };
}

function decimal(value: number) {
  return Number(value.toFixed(2)).toString();
}

export function createStatisticalInferenceProblems(seed: number): GeometryChoiceItem[] {
  const next = random(seed);
  const population = pick(next, [400, 500, 600, 700, 800, 900] as const);
  const sample = pick(next, [30, 40, 50, 60, 80] as const);
  const normalMean = pick(next, [60, 65, 70, 75, 80] as const);
  const normalSigma = pick(next, [4, 5, 6, 8, 10] as const);
  const sampleMean = pick(next, [10, 12, 14, 15, 16, 18] as const);
  const sampleValues = [sampleMean - 3, sampleMean + 2, sampleMean - 1, sampleMean + 4, sampleMean - 2];
  const populationMean = pick(next, [40, 45, 50, 55, 60] as const);
  const rootN = pick(next, [4, 5, 6, 10] as const);
  const sampleN = rootN ** 2;
  const standardError = pick(next, [2, 3, 4] as const);
  const populationSigma = rootN * standardError;
  const confidenceMean = pick(next, [40, 45, 50, 55, 60] as const);
  const confidenceRootN = pick(next, [5, 10] as const);
  const confidenceN = confidenceRootN ** 2;
  const confidenceStep = pick(next, [1, 2] as const);
  const confidenceSigma = confidenceRootN * confidenceStep;
  const margin = 1.96 * confidenceStep;
  const lower = decimal(confidenceMean - margin);
  const upper = decimal(confidenceMean + margin);
  const width = decimal(2 * margin);

  return [
    item(
      `s1-${seed}`,
      "모집단과 표본",
      "모집단의 크기와 표본의 크기는?",
      String.raw`\text{학생 ${population}명 중 ${sample}명을 뽑아 조사한다.}`,
      String.raw`N=${population},\quad n=${sample}`,
      [String.raw`N=${sample},\quad n=${population}`, String.raw`N=${population + sample},\quad n=${sample}`, String.raw`N=${population},\quad n=${population - sample}`],
    ),
    item(
      `s2-${seed}`,
      "모평균과 모표준편차",
      "모평균 $\\mu$와 모표준편차 $\\sigma$는?",
      String.raw`X\sim N(${normalMean},${normalSigma}^2)`,
      String.raw`\mu=${normalMean},\quad \sigma=${normalSigma}`,
      [String.raw`\mu=${normalMean},\quad \sigma=${normalSigma ** 2}`, String.raw`\mu=${normalSigma},\quad \sigma=${normalMean}`, String.raw`\mu=${normalSigma ** 2},\quad \sigma=${normalSigma}`],
    ),
    item(
      `s3-${seed}`,
      "표본평균",
      "표본평균은?",
      sampleValues.join(",\\ "),
      String.raw`\overline{x}=${sampleMean}`,
      [String.raw`\overline{x}=${sampleMean - 2}`, String.raw`\overline{x}=${sampleMean - 1}`, String.raw`\overline{x}=${sampleMean + 1}`],
    ),
    item(
      `s4-${seed}`,
      "표본평균의 평균",
      "$E(\\overline X)$는?",
      String.raw`\mu=${populationMean},\quad \sigma=${populationSigma},\quad n=${sampleN}`,
      String.raw`E(\overline X)=${populationMean}`,
      [String.raw`E(\overline X)=${standardError}`, String.raw`E(\overline X)=\frac{${populationMean}}{${sampleN}}`, String.raw`E(\overline X)=${populationMean * rootN}`],
    ),
    item(
      `s5-${seed}`,
      "표본평균의 표준편차",
      "$\\sigma_{\\overline X}$는?",
      String.raw`\sigma=${populationSigma},\quad n=${sampleN}`,
      String.raw`\sigma_{\overline X}=${standardError}`,
      [String.raw`\sigma_{\overline X}=\frac{1}{${standardError}}`, String.raw`\sigma_{\overline X}=${rootN}`, String.raw`\sigma_{\overline X}=${populationSigma}`],
    ),
    item(
      `s6-${seed}`,
      "모평균의 신뢰구간",
      "신뢰도 $95\\%$의 모평균 $\\mu$의 신뢰구간은?",
      String.raw`\overline{x}=${confidenceMean},\quad \sigma=${confidenceSigma},\quad n=${confidenceN},\quad z_{0.025}=1.96`,
      String.raw`${lower}\le\mu\le${upper}`,
      [String.raw`${decimal(confidenceMean - margin / 2)}\le\mu\le${decimal(confidenceMean + margin / 2)}`, String.raw`${decimal(confidenceMean - margin * 2)}\le\mu\le${decimal(confidenceMean + margin * 2)}`, String.raw`${confidenceMean - confidenceStep}\le\mu\le${confidenceMean + confidenceStep}`],
    ),
    item(
      `s7-${seed}`,
      "신뢰구간의 폭",
      "신뢰도 $95\\%$의 신뢰구간의 폭은?",
      String.raw`\sigma=${confidenceSigma},\quad n=${confidenceN},\quad z_{0.025}=1.96`,
      width,
      [decimal(margin), decimal(width * 2), decimal(1.96 * confidenceSigma)],
    ),
  ];
}

export const statisticalInferenceProblems = createStatisticalInferenceProblems(20260823);
