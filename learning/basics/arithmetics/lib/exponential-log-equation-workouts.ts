export type ExponentialLogEquationKind = "common-factor" | "different-base" | "substitution" | "single-log" | "combined-logs";
export type ExponentialLogEquationProblem = { id: string; kind: ExponentialLogEquationKind; label: string; prompt: string; latex: string; answers: number[] };
const KINDS: ExponentialLogEquationKind[] = ["common-factor", "different-base", "substitution", "single-log", "combined-logs"];
function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function signed(value: number) { return value === 0 ? "" : value < 0 ? String(value) : `+${value}`; }
function build(kind: ExponentialLogEquationKind, next: () => number, id: string): ExponentialLogEquationProblem {
  if (kind === "common-factor") {
    const base = integer(next, 2, 4);
    const exponentShift = integer(next, 1, 2);
    const coefficient = integer(next, 2, 5);
    const answer = integer(next, 1, 4);
    const right = (base ** exponentShift + coefficient) * base ** answer;
    return {
      id,
      kind,
      label: "지수식의 공통인수",
      prompt: "공통인수를 묶어 방정식을 푸세요.",
      latex: `${base}^{x+${exponentShift}}+${coefficient}\\cdot${base}^{x}=${right}`,
      answers: [answer],
    };
  }
  if (kind === "different-base") {
    const root = integer(next, 2, 3); const a = integer(next, -2, 3); const b = integer(next, -2, 2);
    return { id, kind, label: "서로 다른 밑", prompt: "밑을 통일하여 방정식을 푸세요.", latex: `${root ** 2}^{x${signed(a)}}=${root ** 3}^{x${signed(b)}}`, answers: [2 * a - 3 * b] };
  }
  if (kind === "substitution") {
    const base = integer(next, 2, 3); const first = integer(next, 1, 2); const second = integer(next, 3, 4); const sum = base ** first + base ** second;
    return { id, kind, label: "치환형 지수방정식", prompt: "방정식의 모든 해를 구하세요.", latex: `${base}^{2x}-${sum}\\cdot${base}^{x}+${base ** (first + second)}=0`, answers: [first, second] };
  }
  if (kind === "single-log") {
    const base = integer(next, 2, 4); const exponent = integer(next, 2, 4); const shift = integer(next, -6, 6);
    return { id, kind, label: "로그방정식", prompt: "방정식을 푸세요.", latex: `\\log_{${base}}(x${signed(-shift)})=${exponent}`, answers: [shift + base ** exponent] };
  }
  const base = integer(next, 2, 4); const p = integer(next, -3, 2); const q = integer(next, p + 1, p + 4); const answer = q + integer(next, 2, 5); const product = (answer - p) * (answer - q);
  return { id, kind, label: "로그의 결합", prompt: "정의역을 확인하여 방정식을 푸세요.", latex: `\\log_{${base}}(x${signed(-p)})+\\log_{${base}}(x${signed(-q)})=\\log_{${base}}${product}`, answers: [answer] };
}
export function createExponentialLogEquationProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `exponential-log-equation-${index}`)) }; }
export function createExponentialLogEquationReviewProblems(kinds: ExponentialLogEquationKind[], seed: number) { const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `exponential-log-equation-review-${index}-${seed}`)); }
export function sameEquationAnswers(values: string[], answers: number[]) { return values.length === answers.length && values.every((value, index) => /^-?\d+$/.test(value) && Number(value) === answers[index]); }
