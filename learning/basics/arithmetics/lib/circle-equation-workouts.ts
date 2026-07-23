export type CircleKind = "center-to-equation" | "equation-to-center" | "three-points" | "line-intersections" | "tangent-parameter";
export type CircleProblem = {
  id: string;
  kind: CircleKind;
  label: string;
  prompt: string;
  latex: string;
  answer: number[];
  answerMode: "equation" | "center-radius" | "two-points" | "scalar";
};

const KINDS: CircleKind[] = ["center-to-equation", "equation-to-center", "three-points", "line-intersections", "tangent-parameter"];
const LATTICE_CIRCLES = [
  { radius: 5, offsets: [[5, 0], [3, 4], [-4, 3], [-3, -4], [0, -5]] },
  { radius: 10, offsets: [[10, 0], [6, 8], [-8, 6], [-6, -8], [0, -10]] },
  { radius: 13, offsets: [[13, 0], [5, 12], [-12, 5], [-5, -12], [0, -13]] },
] as const;

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}
function circleCoefficients(h: number, k: number, radius: number) {
  return [-2 * h, -2 * k, h * h + k * k - radius * radius];
}
function signed(value: number, suffix = "") {
  if (value === 0) return "";
  const coefficient = Math.abs(value) === 1 && suffix ? "" : Math.abs(value);
  return `${value < 0 ? "-" : "+"}${coefficient}${suffix}`;
}
function circleGeneralLatex([d, e, f]: number[]) {
  return `x^2+y^2${signed(d, "x")}${signed(e, "y")}${signed(f)}=0`;
}
function pointLatex([x, y]: readonly number[]) {
  return `(${x},\\ ${y})`;
}
function normalizeLine(first: readonly number[], second: readonly number[]) {
  let a = first[1] - second[1];
  let b = second[0] - first[0];
  let c = first[0] * second[1] - second[0] * first[1];
  const gcd = (x: number, y: number): number => y === 0 ? Math.abs(x) : gcd(y, x % y);
  const divisor = gcd(gcd(a, b), c) || 1;
  a /= divisor; b /= divisor; c /= divisor;
  if (a < 0 || (a === 0 && b < 0)) { a *= -1; b *= -1; c *= -1; }
  return [a, b, c];
}
function lineLatex([a, b, c]: number[]) {
  const x = a === 0 ? "" : `${a === -1 ? "-" : a === 1 ? "" : a}x`;
  const y = b === 0 ? "" : `${x && b > 0 ? "+" : b < 0 ? "-" : ""}${Math.abs(b) === 1 ? "" : Math.abs(b)}y`;
  return `${x}${y}${signed(c)}=0`;
}

function buildProblem(kind: CircleKind, next: () => number, id: string): CircleProblem {
  const h = integer(next, -5, 5);
  const k = integer(next, -5, 5);
  const lattice = LATTICE_CIRCLES[integer(next, 0, LATTICE_CIRCLES.length - 1)];
  const radius = lattice.radius;
  const coefficients = circleCoefficients(h, k, radius);
  if (kind === "center-to-equation") {
    return { id, kind, label: "중심과 반지름", prompt: "중심과 반지름이 다음과 같은 원을 일반형으로 나타내세요.", latex: `\\text{중심 }${pointLatex([h, k])},\\qquad r=${radius}`, answer: coefficients, answerMode: "equation" };
  }
  if (kind === "equation-to-center") {
    return { id, kind, label: "완전제곱식", prompt: "원의 중심과 반지름을 구하세요.", latex: circleGeneralLatex(coefficients), answer: [h, k, radius], answerMode: "center-radius" };
  }
  if (kind === "three-points") {
    const points = [lattice.offsets[0], lattice.offsets[1], lattice.offsets[2]].map(([x, y]) => [h + x, k + y]);
    return { id, kind, label: "세 점을 지나는 원", prompt: "세 점을 지나는 원을 일반형으로 나타내세요.", latex: `A${pointLatex(points[0])},\\quad B${pointLatex(points[1])},\\quad C${pointLatex(points[2])}`, answer: coefficients, answerMode: "equation" };
  }
  if (kind === "line-intersections") {
    const firstIndex = integer(next, 0, lattice.offsets.length - 1);
    let secondIndex = integer(next, 0, lattice.offsets.length - 1);
    while (secondIndex === firstIndex) secondIndex = integer(next, 0, lattice.offsets.length - 1);
    const points = [lattice.offsets[firstIndex], lattice.offsets[secondIndex]]
      .map(([x, y]) => [h + x, k + y])
      .sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    const line = normalizeLine(points[0], points[1]);
    return { id, kind, label: "원과 직선의 교점", prompt: "원과 직선의 두 교점의 좌표를 구하세요. 가로 좌표가 작은 점부터 입력하세요.", latex: `${circleGeneralLatex(coefficients)},\\qquad ${lineLatex(line)}`, answer: points.flat(), answerMode: "two-points" };
  }
  const parameter = h + radius;
  return { id, kind, label: "접선 조건", prompt: "직선이 원에 접할 때, 주어진 조건을 만족하는 값을 구하세요.", latex: `${circleGeneralLatex(coefficients)},\\qquad x=m`, answer: [parameter], answerMode: "scalar" };
}

export function createCircleProblemSet(seed: number) {
  const next = random(seed);
  return { seed, problems: KINDS.map((kind, index) => buildProblem(kind, next, `circle-${index}`)) };
}
export function createCircleReviewProblems(kinds: CircleKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => buildProblem(kind, next, `circle-review-${index}-${seed}`));
}
export function sameCircleAnswer(values: string[], expected: number[]) {
  return values.length === expected.length && values.every((value, index) => /^-?\d+$/.test(value.trim()) && Number(value) === expected[index]);
}
export function circleAnswerLatex(problem: CircleProblem) {
  if (problem.answerMode === "equation") return circleGeneralLatex(problem.answer);
  if (problem.answerMode === "center-radius") return `\\text{중심 }${pointLatex(problem.answer.slice(0, 2))},\\quad r=${problem.answer[2]}`;
  if (problem.answerMode === "two-points") return `${pointLatex(problem.answer.slice(0, 2))},\\quad ${pointLatex(problem.answer.slice(2, 4))}`;
  return String(problem.answer[0]);
}
