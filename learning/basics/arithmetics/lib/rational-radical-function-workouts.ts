export type RationalRadicalKind = "rational-asymptotes" | "rational-coefficient" | "rational-equation" | "radical-endpoint" | "radical-equation";
export type RationalRadicalProblem = { id: string; kind: RationalRadicalKind; label: string; prompt: string; latex: string; answer: number[]; answerLabels: string[] };
const KINDS: RationalRadicalKind[] = ["rational-asymptotes", "rational-coefficient", "rational-equation", "radical-endpoint", "radical-equation"];
function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function nonzero(next: () => number, min = -5, max = 5) { let value = 0; while (!value) value = integer(next, min, max); return value; }
function signed(value: number) { return value === 0 ? "" : `${value < 0 ? "-" : "+"}${Math.abs(value)}`; }
function rational(a: number, h: number, k: number) { return `y=\\dfrac{${a}}{x${signed(-h)}}${signed(k)}`; }
function radical(a: number, h: number, k: number) { const coefficient = a === 1 ? "" : a === -1 ? "-" : a; return `y=${coefficient}\\sqrt{x${signed(-h)}}${signed(k)}`; }
function point(x: number, y: number) { return `(${x},\\ ${y})`; }
function build(kind: RationalRadicalKind, next: () => number, id: string): RationalRadicalProblem {
  const h = integer(next, -5, 5); const k = integer(next, -5, 5); const a = nonzero(next);
  if (kind === "rational-asymptotes") return { id, kind, label: "점근선", prompt: "두 점근선의 방정식에 들어갈 값을 구하세요.", latex: rational(a, h, k), answer: [h, k], answerLabels: ["x", "y"] };
  if (kind === "rational-coefficient") {
    const offset = nonzero(next, -4, 4); const x = h + offset; const y = k + a;
    return { id, kind, label: "그래프가 지나는 점", prompt: "그래프가 주어진 점을 지날 때 상수의 값을 구하세요.", latex: `y=\\dfrac{c}{x${signed(-h)}}${signed(k)},\\qquad P${point(x, k + a * offset / offset)}`, answer: [a * offset], answerLabels: ["c"] };
  }
  if (kind === "rational-equation") {
    const offset = nonzero(next, -4, 4); const target = k + a; const x = h + 1;
    return { id, kind, label: "유리함수의 방정식", prompt: "주어진 함수값을 만족하는 값을 구하세요.", latex: `${rational(a * offset, h, k)},\\qquad y=${target}`, answer: [h + offset], answerLabels: ["x"] };
  }
  if (kind === "radical-endpoint") return { id, kind, label: "시작점", prompt: "그래프의 시작점 좌표를 구하세요.", latex: radical(a, h, k), answer: [h, k], answerLabels: ["x", "y"] };
  const step = integer(next, 1, 4); const x = h + step * step; const target = a * step + k;
  return { id, kind, label: "무리함수의 방정식", prompt: "주어진 함수값을 만족하는 값을 구하세요.", latex: `${radical(a, h, k)},\\qquad y=${target}`, answer: [x], answerLabels: ["x"] };
}
export function createRationalRadicalProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `rational-radical-${index}`)) }; }
export function createRationalRadicalReviewProblems(kinds: RationalRadicalKind[], seed: number) { const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `rational-radical-review-${index}-${seed}`)); }
export function sameRationalRadicalAnswer(values: string[], answer: number[]) { return values.length === answer.length && values.every((value, index) => /^-?\d+$/.test(value) && Number(value) === answer[index]); }
