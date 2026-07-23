export type LogarithmKind = "log-value" | "product-law" | "quotient-law" | "power-law" | "change-of-base";
export type LogarithmProblem = { id: string; kind: LogarithmKind; label: string; prompt: string; latex: string; answer: number };
const KINDS: LogarithmKind[] = ["log-value", "product-law", "quotient-law", "power-law", "change-of-base"];
function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; }; }
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function build(kind: LogarithmKind, next: () => number, id: string): LogarithmProblem {
  if (kind === "log-value") {
    const base = integer(next, 2, 5); const exponent = integer(next, 2, 6);
    return { id, kind, label: "로그의 값", prompt: "값을 구하세요.", latex: `\\log_{${base}}${base ** exponent}`, answer: exponent };
  }
  if (kind === "product-law") {
    const base = [4, 9][integer(next, 0, 1)]; const root = Math.sqrt(base); const p = integer(next, 1, 3); const q = integer(next, 2, 4);
    return { id, kind, label: "곱의 성질", prompt: "값을 구하세요.", latex: `\\log_{${base}}${root * base ** p}+\\log_{${base}}${base ** q / root}`, answer: p + q };
  }
  if (kind === "quotient-law") {
    const base = [4, 9][integer(next, 0, 1)]; const root = Math.sqrt(base); const p = integer(next, 3, 5); const q = integer(next, 1, p - 1);
    return { id, kind, label: "몫의 성질", prompt: "값을 구하세요.", latex: `\\log_{${base}}${root * base ** p}-\\log_{${base}}${root * base ** q}`, answer: p - q };
  }
  if (kind === "power-law") {
    const base = integer(next, 2, 5); const p = integer(next, 2, 4); const q = integer(next, 1, 3); const coefficient = integer(next, 2, 3);
    return { id, kind, label: "거듭제곱의 성질", prompt: "값을 구하세요.", latex: `${coefficient}\\log_{${base}}${base ** p}-\\log_{${base}}${base ** q}`, answer: coefficient * p - q };
  }
  const base = integer(next, 2, 4); const middleExponent = integer(next, 2, 3); const middle = base ** middleExponent; const lastExponent = integer(next, 2, 3); const last = middle ** lastExponent;
  return { id, kind, label: "밑변환과 역수", prompt: "값을 구하세요.", latex: `\\log_{${base}}${middle}\\cdot\\log_{${middle}}${base}+\\log_{${middle}}${last}`, answer: 1 + lastExponent };
}
export function createLogarithmProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `logarithm-${index}`)) }; }
export function createLogarithmReviewProblems(kinds: LogarithmKind[], seed: number) { const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `logarithm-review-${index}-${seed}`)); }
export function sameLogarithmAnswer(value: string, answer: number) { return /^-?\d+$/.test(value) && Number(value) === answer; }
