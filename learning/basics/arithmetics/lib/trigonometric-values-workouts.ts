export type TrigonometricValueKind = "special-angle" | "reference-angle" | "pythagorean" | "tangent-relation" | "combined-value";
export type ExactTrigValue = { sign: 1 | -1; numerator: number; radical: 0 | 2 | 3; denominator: number };
export type TrigonometricValueProblem = { id: string; kind: TrigonometricValueKind; label: string; prompt: string; latex: string; answer: ExactTrigValue };
const KINDS: TrigonometricValueKind[] = ["special-angle", "reference-angle", "pythagorean", "tangent-relation", "combined-value"];
const VARIANTS: Record<TrigonometricValueKind, Array<Omit<TrigonometricValueProblem, "id" | "kind" | "label">>> = {
  "special-angle": [
    { prompt: "값을 구하세요.", latex: "\\sin\\frac{5\\pi}{6}", answer: { sign: 1, numerator: 1, radical: 0, denominator: 2 } },
    { prompt: "값을 구하세요.", latex: "\\cos\\frac{3\\pi}{4}", answer: { sign: -1, numerator: 1, radical: 2, denominator: 2 } },
    { prompt: "값을 구하세요.", latex: "\\tan\\frac{5\\pi}{3}", answer: { sign: -1, numerator: 1, radical: 3, denominator: 1 } },
  ],
  "reference-angle": [
    { prompt: "각을 변환하여 값을 구하세요.", latex: "\\sin\\left(\\pi+\\frac{\\pi}{3}\\right)", answer: { sign: -1, numerator: 1, radical: 3, denominator: 2 } },
    { prompt: "각을 변환하여 값을 구하세요.", latex: "\\cos\\left(2\\pi-\\frac{\\pi}{4}\\right)", answer: { sign: 1, numerator: 1, radical: 2, denominator: 2 } },
    { prompt: "각을 변환하여 값을 구하세요.", latex: "\\tan\\left(\\pi-\\frac{\\pi}{6}\\right)", answer: { sign: -1, numerator: 1, radical: 3, denominator: 3 } },
  ],
  "pythagorean": [
    { prompt: "제2사분면에 속하는 각에 대하여 값을 구하세요.", latex: "\\sin\\theta=\\frac35,\\qquad \\cos\\theta", answer: { sign: -1, numerator: 4, radical: 0, denominator: 5 } },
    { prompt: "제4사분면에 속하는 각에 대하여 값을 구하세요.", latex: "\\cos\\theta=\\frac5{13},\\qquad \\sin\\theta", answer: { sign: -1, numerator: 12, radical: 0, denominator: 13 } },
  ],
  "tangent-relation": [
    { prompt: "제1사분면에 속하는 각에 대하여 값을 구하세요.", latex: "\\sin\\theta=\\frac5{13},\\qquad \\tan\\theta", answer: { sign: 1, numerator: 5, radical: 0, denominator: 12 } },
    { prompt: "제3사분면에 속하는 각에 대하여 값을 구하세요.", latex: "\\cos\\theta=-\\frac8{17},\\qquad \\tan\\theta", answer: { sign: 1, numerator: 15, radical: 0, denominator: 8 } },
  ],
  "combined-value": [
    { prompt: "제3사분면에 속하는 각에 대하여 값을 구하세요.", latex: "\\tan\\theta=\\frac34,\\qquad \\sin\\theta+\\cos\\theta", answer: { sign: -1, numerator: 7, radical: 0, denominator: 5 } },
    { prompt: "제2사분면에 속하는 각에 대하여 값을 구하세요.", latex: "\\tan\\theta=-\\frac5{12},\\qquad \\sin\\theta-\\cos\\theta", answer: { sign: 1, numerator: 17, radical: 0, denominator: 13 } },
  ],
};
const LABELS: Record<TrigonometricValueKind, string> = { "special-angle": "특수각", "reference-angle": "각의 변환", "pythagorean": "기본 관계", "tangent-relation": "탄젠트의 관계", "combined-value": "여러 값의 결합" };
function random(seed: number) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; }; }
function build(kind: TrigonometricValueKind, next: () => number, id: string): TrigonometricValueProblem { const variant = VARIANTS[kind][Math.floor(next() * VARIANTS[kind].length)]; return { id, kind, label: LABELS[kind], ...variant, answer: { ...variant.answer } }; }
export function createTrigonometricValueProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `trigonometric-value-${index}`)) }; }
export function createTrigonometricValueReviewProblems(kinds: TrigonometricValueKind[], seed: number) { const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `trigonometric-value-review-${index}-${seed}`)); }
export function formatExactTrigValue(value: ExactTrigValue) { const sign = value.sign < 0 ? "-" : ""; const top = value.radical ? `${value.numerator === 1 ? "" : value.numerator}\\sqrt{${value.radical}}` : String(value.numerator); return value.denominator === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${value.denominator}}`; }
export function sameExactTrigValue(input: { sign: number; numerator: string; radical: string; denominator: string } | undefined, answer: ExactTrigValue) { return Boolean(input && Number(input.sign) === answer.sign && Number(input.numerator) === answer.numerator && Number(input.radical) === answer.radical && Number(input.denominator || "1") === answer.denominator); }
