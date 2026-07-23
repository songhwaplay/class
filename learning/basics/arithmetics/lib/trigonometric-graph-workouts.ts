export type TrigonometricGraphKind = "range" | "sine-period" | "phase-shift" | "determine-coefficients" | "tangent-properties";
export type TrigonometricGraphProblem = { id: string; kind: TrigonometricGraphKind; label: string; prompt: string; latex: string; answerLabels: string[]; answers: number[] };
const KINDS: TrigonometricGraphKind[] = ["range", "sine-period", "phase-shift", "determine-coefficients", "tangent-properties"];
function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function signed(value: number) { return value === 0 ? "" : value < 0 ? String(value) : `+${value}`; }
function build(kind: TrigonometricGraphKind, next: () => number, id: string): TrigonometricGraphProblem {
  if (kind === "range") { const a = integer(next, 2, 5); const c = integer(next, -3, 3); return { id, kind, label: "최댓값과 최솟값", prompt: "최댓값과 최솟값을 구하세요.", latex: `y=${a}\\sin 2x${signed(c)}`, answerLabels: ["최댓값", "최솟값"], answers: [c + a, c - a] }; }
  if (kind === "sine-period") { const n = integer(next, 2, 5); return { id, kind, label: "주기", prompt: "주기를 구하여 n의 값을 구하세요.", latex: `y=\\cos ${2 * n}x,\\qquad T=\\frac{\\pi}{n}`, answerLabels: ["n"], answers: [n] }; }
  if (kind === "phase-shift") { const n = integer(next, 2, 6); return { id, kind, label: "평행이동", prompt: "가로 방향의 이동량을 구하여 n의 값을 구하세요.", latex: `y=\\sin\\left(x-\\frac{\\pi}{${n}}\\right),\\qquad \\text{이동량}=\\frac{\\pi}{n}`, answerLabels: ["n"], answers: [n] }; }
  if (kind === "determine-coefficients") { const a = integer(next, 2, 5); const c = integer(next, -3, 3); return { id, kind, label: "계수 결정", prompt: "그래프가 두 점을 지날 때 두 계수를 구하세요.", latex: `y=a\\sin x+c,\\quad (0,${c}),\\ \\left(\\frac{\\pi}{2},${a + c}\\right)`, answerLabels: ["a", "c"], answers: [a, c] }; }
  const b = integer(next, 2, 5); return { id, kind, label: "탄젠트의 주기와 점근선", prompt: "주기와 가장 가까운 양의 점근선을 식의 꼴로 나타내세요.", latex: `y=\\tan ${b}x,\\qquad T=\\frac{\\pi}{m},\\quad x=\\frac{\\pi}{n}`, answerLabels: ["m", "n"], answers: [b, 2 * b] };
}
export function createTrigonometricGraphProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `trigonometric-graph-${index}`)) }; }
export function createTrigonometricGraphReviewProblems(kinds: TrigonometricGraphKind[], seed: number) { const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `trigonometric-graph-review-${index}-${seed}`)); }
export function sameGraphAnswers(values: string[], answers: number[]) { return values.length === answers.length && values.every((value, index) => /^-?\d+$/.test(value) && Number(value) === answers[index]); }
