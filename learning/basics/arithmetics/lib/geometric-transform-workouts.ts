export type TransformKind = "point-translation" | "line-translation" | "circle-translation" | "point-reflection" | "equation-reflection";
export type TransformProblem = {
  id: string; kind: TransformKind; label: string; prompt: string; latex: string; answer: number[];
  answerMode: "point" | "line" | "circle" | "quadratic";
};
const KINDS: TransformKind[] = ["point-translation", "line-translation", "circle-translation", "point-reflection", "equation-reflection"];

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5; let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
function integer(next: () => number, minimum: number, maximum: number) { return minimum + Math.floor(next() * (maximum - minimum + 1)); }
function nonzero(next: () => number, minimum = -6, maximum = 6) { let value = 0; while (value === 0) value = integer(next, minimum, maximum); return value; }
function signed(value: number, variable = "") {
  if (value === 0) return "";
  const amount = Math.abs(value) === 1 && variable ? "" : Math.abs(value);
  return `${value < 0 ? "-" : "+"}${amount}${variable}`;
}
function point([x, y]: number[]) { return `(${x},\\ ${y})`; }
function line([a, b, c]: number[]) {
  const first = a === -1 ? "-x" : a === 1 ? "x" : `${a}x`;
  return `${first}${signed(b, "y")}${signed(c)}=0`;
}
function circle([h, k, radius]: number[]) {
  const x = h === 0 ? "x^2" : `(x${signed(-h)})^2`;
  const y = k === 0 ? "y^2" : `(y${signed(-k)})^2`;
  return `${x}+${y}=${radius ** 2}`;
}
function quadratic([a, b, c]: number[]) {
  const first = a === -1 ? "-x^2" : a === 1 ? "x^2" : `${a}x^2`;
  return `y=${first}${signed(b, "x")}${signed(c)}`;
}
function buildProblem(kind: TransformKind, next: () => number, id: string): TransformProblem {
  if (kind === "point-translation") {
    const source = [integer(next, -7, 7), integer(next, -7, 7)];
    const vector = [nonzero(next, -5, 5), nonzero(next, -5, 5)];
    return { id, kind, label: "점의 평행이동", prompt: "점을 주어진 방향으로 평행이동한 좌표를 구하세요.", latex: `P${point(source)}\\xrightarrow{\\ (x,y)\\mapsto(x${signed(vector[0])},\\ y${signed(vector[1])})\\ }P'`, answer: [source[0] + vector[0], source[1] + vector[1]], answerMode: "point" };
  }
  if (kind === "line-translation") {
    const a = nonzero(next, -4, 4); const b = nonzero(next, -4, 4); const c = integer(next, -8, 8);
    const p = nonzero(next, -4, 4); const q = nonzero(next, -4, 4);
    return { id, kind, label: "직선의 평행이동", prompt: "직선을 주어진 방향으로 평행이동한 뒤의 방정식을 구하세요.", latex: `${line([a, b, c])},\\qquad (x,y)\\mapsto(x${signed(p)},\\ y${signed(q)})`, answer: [a, b, c - a * p - b * q], answerMode: "line" };
  }
  if (kind === "circle-translation") {
    const source = [integer(next, -5, 5), integer(next, -5, 5), integer(next, 2, 7)];
    const p = nonzero(next, -4, 4); const q = nonzero(next, -4, 4);
    return { id, kind, label: "원의 평행이동", prompt: "원을 주어진 방향으로 평행이동한 뒤의 방정식을 구하세요.", latex: `${circle(source)},\\qquad (x,y)\\mapsto(x${signed(p)},\\ y${signed(q)})`, answer: [source[0] + p, source[1] + q, source[2]], answerMode: "circle" };
  }
  if (kind === "point-reflection") {
    const source = [nonzero(next), nonzero(next)];
    const choices = [
      { text: "x\\text{축}", answer: [source[0], -source[1]] },
      { text: "y\\text{축}", answer: [-source[0], source[1]] },
      { text: "y=x", answer: [source[1], source[0]] },
    ];
    const choice = choices[integer(next, 0, choices.length - 1)];
    return { id, kind, label: "점의 대칭이동", prompt: "점을 주어진 직선에 대하여 대칭이동한 좌표를 구하세요.", latex: `P${point(source)},\\qquad \\text{대칭축 }${choice.text}`, answer: choice.answer, answerMode: "point" };
  }
  const a = nonzero(next, -3, 3); const b = nonzero(next, -6, 6); const c = integer(next, -8, 8);
  return { id, kind, label: "그래프의 대칭이동", prompt: "그래프를 원점에 대하여 대칭이동한 뒤의 방정식을 구하세요.", latex: quadratic([a, b, c]), answer: [-a, b, -c], answerMode: "quadratic" };
}
export function createTransformProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => buildProblem(kind, next, `transform-${index}`)) }; }
export function createTransformReviewProblems(kinds: TransformKind[], seed: number) {
  const next = random(seed);
  return [...new Set(kinds)].slice(0, 2).map((kind, index) => buildProblem(kind, next, `transform-review-${index}-${seed}`));
}
export function sameTransformAnswer(values: string[], expected: number[]) {
  return values.length === expected.length && values.every((value, index) => /^-?\d+$/.test(value.trim()) && Number(value) === expected[index]);
}
export function transformAnswerLatex(problem: TransformProblem) {
  if (problem.answerMode === "point") return point(problem.answer);
  if (problem.answerMode === "line") return line(problem.answer);
  if (problem.answerMode === "circle") return circle(problem.answer);
  return quadratic(problem.answer);
}
