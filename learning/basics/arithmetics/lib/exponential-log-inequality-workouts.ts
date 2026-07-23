export type ExponentialLogInequalityKind = "increasing-exponential" | "decreasing-exponential" | "increasing-log" | "decreasing-log" | "substitution";
export type ExponentialLogInequalityProblem = {
  id: string; kind: ExponentialLogInequalityKind; label: string; prompt: string; latex: string;
  answerLatex: string; answerValues: number[];
};
const KINDS: ExponentialLogInequalityKind[] = ["increasing-exponential", "decreasing-exponential", "increasing-log", "decreasing-log", "substitution"];
function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function signed(value: number) { return value === 0 ? "" : value < 0 ? String(value) : `+${value}`; }
function build(kind: ExponentialLogInequalityKind, next: () => number, id: string): ExponentialLogInequalityProblem {
  if (kind === "increasing-exponential") {
    const variants = [
      { latex: "4^{x+1}>8^2", boundary: 2 },
      { latex: "9^{x-1}>27^2", boundary: 4 },
      { latex: "8^{x+1}>4^{x+2}", boundary: 1 },
    ];
    const variant = variants[integer(next, 0, variants.length - 1)];
    return { id, kind, label: "공통 밑으로 변환", prompt: "밑을 통일하여 부등식을 푸세요.", latex: variant.latex, answerLatex: `x>${variant.boundary}`, answerValues: [variant.boundary] };
  }
  if (kind === "decreasing-exponential") {
    const variants = [
      { latex: "\\left(\\frac14\\right)^{x-1}\\ge\\left(\\frac18\\right)^2", boundary: 4 },
      { latex: "\\left(\\frac19\\right)^{x-2}\\ge\\left(\\frac1{27}\\right)^2", boundary: 5 },
      { latex: "\\left(\\frac18\\right)^{x-1}\\ge\\left(\\frac14\\right)^{x+1}", boundary: 5 },
    ];
    const variant = variants[integer(next, 0, variants.length - 1)];
    return { id, kind, label: "감소하는 공통 밑", prompt: "밑을 통일하고 부등호 방향에 주의하여 푸세요.", latex: variant.latex, answerLatex: `x\\le${variant.boundary}`, answerValues: [variant.boundary] };
  }
  if (kind === "increasing-log") {
    const base = integer(next, 2, 4); const shift = integer(next, -5, 5); const exponent = integer(next, 2, 4); const right = shift + base ** exponent;
    return { id, kind, label: "증가하는 로그", prompt: "정의역을 확인하여 부등식을 푸세요.", latex: `\\log_{${base}}(x${signed(-shift)})<${exponent}`, answerLatex: `${shift}<x<${right}`, answerValues: [shift, right] };
  }
  if (kind === "decreasing-log") {
    const denominator = integer(next, 2, 4); const shift = integer(next, -5, 5); const exponent = integer(next, 2, 4); const right = shift + denominator ** exponent;
    return { id, kind, label: "감소하는 로그", prompt: "정의역을 확인하여 부등식을 푸세요.", latex: `\\log_{\\frac1{${denominator}}}(x${signed(-shift)})\\ge-${exponent}`, answerLatex: `${shift}<x\\le${right}`, answerValues: [shift, right] };
  }
  const variants = [
    { base: 2, left: 0, right: 2 },
    { base: 2, left: 1, right: 3 },
    { base: 3, left: 0, right: 2 },
    { base: 3, left: 1, right: 2 },
  ];
  const { base, left, right } = variants[integer(next, 0, variants.length - 1)];
  const sum = base ** left + base ** right;
  return { id, kind, label: "치환형 지수부등식", prompt: "부등식을 푸세요.", latex: `${base}^{2x}-${sum}\\cdot${base}^{x}+${base ** (left + right)}<0`, answerLatex: `${left}<x<${right}`, answerValues: [left, right] };
}
export function createExponentialLogInequalityProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `exponential-log-inequality-${index}`)) }; }
export function createExponentialLogInequalityReviewProblems(kinds: ExponentialLogInequalityKind[], seed: number) { const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `exponential-log-inequality-review-${index}-${seed}`)); }
export function sameInequalityBoundaries(values: string[], answers: number[]) { return values.length === answers.length && values.every((value, index) => /^-?\d+$/.test(value) && Number(value) === answers[index]); }
