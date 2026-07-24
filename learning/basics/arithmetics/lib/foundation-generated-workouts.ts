import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

type Next = () => number;

function rng(seed: number): Next {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function integer(next: Next, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

function pick<T>(next: Next, values: readonly T[]) {
  return values[Math.floor(next() * values.length)];
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? `${n}` : String.raw`\frac{${n}}{${d}}`;
}

function piFraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  if (d === 1) return n === 1 ? String.raw`\pi` : `${n}\\pi`;
  return n === 1 ? String.raw`\frac{\pi}{${d}}` : String.raw`\frac{${n}\pi}{${d}}`;
}

function choices(id: string, answer: string, candidates: string[]) {
  const values = [answer, ...candidates.filter((value) => value !== answer)];
  const unique = [...new Set(values)].slice(0, 4);
  for (let offset = 1; unique.length < 4; offset += 1) unique.push(`${answer}+${offset}`);
  return unique.map((latex, index) => ({ id: `${id}-${index}`, latex, correct: index === 0 }));
}

function item(id: string, label: string, latex: string, answer: string, distractors: string[]): GeometryChoiceItem {
  return { id, label, latex, correctLatex: answer, choices: choices(id, answer, distractors) };
}

export function createRadianProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const degree = pick(next, [30, 45, 60, 75, 105, 120, 135, 150, 210, 225, 300, 315] as const);
  const radian = piFraction(degree, 180);
  const baseNumerator = pick(next, [1, 2, 3, 4, 5, 7, 11] as const);
  const baseDenominator = pick(next, [3, 4, 6] as const);
  const base = piFraction(baseNumerator, baseDenominator);
  const turns = integer(next, 1, 3);
  const coterminal = piFraction(baseNumerator + 2 * baseDenominator * turns, baseDenominator);
  const quadrantNumerator = pick(next, [2, 3, 4, 5, 7, 8, 10, 11] as const);
  const quadrantDenominator = 6;
  const normalized = ((quadrantNumerator % 12) + 12) % 12;
  const quadrant = normalized < 3 ? 1 : normalized < 6 ? 2 : normalized < 9 ? 3 : 4;
  const referenceNumerator = Math.min(normalized % 6, 6 - (normalized % 6));
  const reference = piFraction(referenceNumerator || 1, 6);
  return [
    item("r1", "육십분법을 호도법으로", `${degree}^{\\circ}=?`, radian, [piFraction(180, degree), piFraction(degree, 360), piFraction(degree + 30, 180)]),
    item("r2", "호도법을 육십분법으로", `${radian}=?`, `${degree}^{\\circ}`, [`${180 - degree}^{\\circ}`, `${degree + 30}^{\\circ}`, `${degree * 2}^{\\circ}`]),
    item("r3", "동경이 같은 각", `${coterminal}`, base, [piFraction(baseNumerator + baseDenominator, baseDenominator), piFraction(baseNumerator + 2 * baseDenominator, baseDenominator), piFraction(Math.abs(baseNumerator - baseDenominator), baseDenominator)]),
    item("r4", "사분면", `\\theta=${piFraction(quadrantNumerator, quadrantDenominator)}`, `\\text{제${quadrant}사분면}`, [1, 2, 3, 4].filter((value) => value !== quadrant).map((value) => `\\text{제${value}사분면}`)),
    item("r5", "일반각", `\\theta=${base}\\text{와 동경이 같은 각}`, `2n\\pi+${base}`, [`n\\pi+${base}`, `2n\\pi-${base}`, `n\\pi-${base}`]),
    item("r6", "기준각", `\\theta=${piFraction(quadrantNumerator, quadrantDenominator)}`, reference, [piFraction(5, 6), piFraction(1, 3), piFraction(2, 3)]),
    item("r7", "회전수", `\\theta=${coterminal},\\quad \\frac{\\theta-${base}}{2\\pi}=?`, `${turns}`, [`${turns + 1}`, `${Math.max(0, turns - 1)}`, `${2 * turns}`]),
  ];
}

export function createArcSectorProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const r = integer(next, 3, 9);
  const denominator = pick(next, [2, 3, 4, 6] as const);
  const numerator = integer(next, 1, denominator * 2 - 1);
  const theta = piFraction(numerator, denominator);
  const lengthCoefficient = fraction(r * numerator, denominator);
  const areaCoefficient = fraction(r * r * numerator, 2 * denominator);
  const radius2 = integer(next, 3, 8);
  const length2 = integer(next, 2, 8);
  const turns = integer(next, 2, 7);
  return [
    item("a1", "호의 길이", `r=${r},\\quad\\theta=${theta},\\quad l=?`, `l=${lengthCoefficient}\\pi`, [`l=${areaCoefficient}\\pi`, `l=${r}\\pi`, `l=${numerator}\\pi`]),
    item("a2", "부채꼴의 넓이", `r=${r},\\quad\\theta=${theta},\\quad S=?`, `S=${areaCoefficient}\\pi`, [`S=${lengthCoefficient}\\pi`, `S=${r * r}\\pi`, `S=${r * numerator}\\pi`]),
    item("a3", "중심각", `r=${radius2},\\quad l=${length2}\\pi,\\quad\\theta=?`, `\\theta=${fraction(length2, radius2)}\\pi`, [`\\theta=${fraction(radius2, length2)}\\pi`, `\\theta=${fraction(length2, 2 * radius2)}\\pi`, `\\theta=${length2 * radius2}\\pi`]),
    item("a4", "반지름", `\\theta=\\frac{\\pi}{${denominator}},\\quad l=${r}\\pi,\\quad r=?`, `${r * denominator}`, [`${r}`, `${r + denominator}`, `${r * 2}`]),
    item("a5", "넓이와 호의 길이", `r=${radius2},\\quad l=${length2},\\quad S=?`, `${fraction(radius2 * length2, 2)}`, [`${radius2 * length2}`, `${radius2 + length2}`, `${radius2 * radius2}`]),
    item("a6", "부채꼴의 둘레", `r=${r},\\quad\\theta=${theta},\\quad L=?`, `2\\cdot${r}+${lengthCoefficient}\\pi`, [`${r}+${lengthCoefficient}\\pi`, `2\\cdot${r}+${areaCoefficient}\\pi`, `${2 * r}`]),
    item("a7", "회전수", `${turns}\\pi\\text{ rad},\\quad N=?`, `N=${fraction(turns, 2)}`, [`N=${turns}`, `N=${fraction(turns, 4)}`, `N=${turns * 2}`]),
  ];
}

export function createProbabilityProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const denominator = pick(next, [6, 8, 10, 12] as const);
  const a = integer(next, 1, denominator - 2);
  const b = integer(next, 1, denominator - a);
  const intersection = integer(next, 1, Math.min(a, b));
  const trials = integer(next, 3, 6);
  const successes = integer(next, 1, trials - 1);
  const pDenominator = pick(next, [2, 3, 4, 5] as const);
  const pNumerator = integer(next, 1, pDenominator - 1);
  const binomialNumerator = combination(trials, successes) * pNumerator ** successes * (pDenominator - pNumerator) ** (trials - successes);
  const binomialDenominator = pDenominator ** trials;
  return [
    item("q1", "여사건", `P(A)=${fraction(a, denominator)},\\quad P(A^c)=?`, fraction(denominator - a, denominator), [fraction(a, denominator), fraction(denominator - a - 1, denominator), fraction(denominator - a + 1, denominator)]),
    item("q2", "합사건", `P(A)=${fraction(a, denominator)},\\ P(B)=${fraction(b, denominator)},\\ P(A\\cap B)=${fraction(intersection, denominator)},\\ P(A\\cup B)=?`, fraction(a + b - intersection, denominator), [fraction(a + b, denominator), fraction(a + b + intersection, denominator), fraction(intersection, denominator)]),
    item("q3", "조건부확률", `P(A\\cap B)=${fraction(intersection, denominator)},\\quad P(B)=${fraction(b, denominator)},\\quad P(A\\mid B)=?`, fraction(intersection, b), [fraction(intersection, denominator), fraction(b, intersection), fraction(b - intersection, b)]),
    item("q4", "독립사건", `P(A)=${fraction(a, denominator)},\\quad P(B)=${fraction(b, denominator)},\\quad P(A\\cap B)=?`, fraction(a * b, denominator * denominator), [fraction(a + b, denominator), fraction(a + b - intersection, denominator), fraction(a * b, denominator)]),
    item("q5", "독립 시행", `P(\\text{성공})=${fraction(pNumerator, pDenominator)},\\quad ${trials}\\text{번 중 정확히 ${successes}번 성공할 확률은?}`, fraction(binomialNumerator, binomialDenominator), [fraction(pNumerator ** successes, pDenominator ** successes), fraction(successes, trials), fraction(binomialNumerator + 1, binomialDenominator)]),
    item("q6", "곱셈정리", `P(A)=${fraction(a, denominator)},\\quad P(B\\mid A)=${fraction(b, denominator)},\\quad P(A\\cap B)=?`, fraction(a * b, denominator * denominator), [fraction(a + b, denominator), fraction(a * b, denominator), fraction(b, denominator)]),
    item("q7", "전체확률", `P(A)=${fraction(a, denominator)},\\ P(B\\mid A)=${fraction(b, denominator)},\\ P(B\\mid A^c)=${fraction(intersection, denominator)},\\quad P(B)=?`, fraction(a * b + (denominator - a) * intersection, denominator * denominator), [fraction(a * b, denominator * denominator), fraction(b + intersection, denominator), fraction(intersection, denominator)]),
  ];
}

function combination(n: number, r: number) {
  let value = 1;
  for (let i = 1; i <= r; i += 1) value = value * (n - i + 1) / i;
  return value;
}

export function createDistributionProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const n = pick(next, [10, 20, 25, 40, 50] as const);
  const pDenominator = pick(next, [2, 4, 5, 10] as const);
  const pNumerator = integer(next, 1, pDenominator - 1);
  const mean = fraction(n * pNumerator, pDenominator);
  const variance = fraction(n * pNumerator * (pDenominator - pNumerator), pDenominator ** 2);
  const mu = integer(next, 20, 80);
  const sigma = pick(next, [5, 10, 12, 15] as const);
  const z = pick(next, [-2, -1, 1, 2] as const);
  const sampleN = pick(next, [4, 9, 16, 25, 36] as const);
  const sampleSigma = fraction(sigma, Math.sqrt(sampleN));
  const e = integer(next, 1, 5);
  const e2 = e * e + integer(next, 1, 8);
  return [
    item("d1", "기댓값", `P(X=0,1,2)=\\frac14,\\frac12,\\frac14,\\quad E(X)=?`, `E(X)=1`, [`E(X)=\\frac12`, `E(X)=\\frac34`, `E(X)=2`]),
    item("d2", "분산", `E(X)=${e},\\quad E(X^2)=${e2},\\quad V(X)=?`, `V(X)=${e2 - e * e}`, [`V(X)=${e2}`, `V(X)=${e * e}`, `V(X)=${e2 - e}`]),
    item("d3", "이항분포의 평균", `X\\sim B\\left(${n},${fraction(pNumerator, pDenominator)}\\right),\\quad E(X)=?`, `E(X)=${mean}`, [`E(X)=${n}`, `E(X)=${pNumerator}`, `E(X)=${variance}`]),
    item("d4", "이항분포의 분산", `X\\sim B\\left(${n},${fraction(pNumerator, pDenominator)}\\right),\\quad V(X)=?`, `V(X)=${variance}`, [`V(X)=${mean}`, `V(X)=${n}`, `V(X)=${fraction(n * pNumerator, pDenominator ** 2)}`]),
    item("d5", "표준화", `X\\sim N(${mu},${sigma}^2),\\quad X=${mu + z * sigma},\\quad Z=?`, `Z=${z}`, [`Z=${z * sigma}`, `Z=${mu + z}`, `Z=${-z}`]),
    item("d6", "표본평균의 평균", `E(X)=${mu},\\quad n=${sampleN},\\quad E(\\overline X)=?`, `E(\\overline X)=${mu}`, [`E(\\overline X)=${fraction(mu, sampleN)}`, `E(\\overline X)=${mu * sampleN}`, `E(\\overline X)=${Math.sqrt(sampleN)}`]),
    item("d7", "표본평균의 표준편차", `\\sigma=${sigma},\\quad n=${sampleN},\\quad \\sigma_{\\overline X}=?`, `\\sigma_{\\overline X}=${sampleSigma}`, [`\\sigma_{\\overline X}=${sigma}`, `\\sigma_{\\overline X}=${fraction(sigma, sampleN)}`, `\\sigma_{\\overline X}=${sigma * Math.sqrt(sampleN)}`]),
  ];
}
