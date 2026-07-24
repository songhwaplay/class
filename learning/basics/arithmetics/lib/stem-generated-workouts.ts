import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

type Next = () => number;

function rng(seed: number): Next {
  let state = seed >>> 0;
  state ^= state >>> 16;
  state = Math.imul(state, 0x7feb352d);
  state ^= state >>> 15;
  state = Math.imul(state, 0x846ca68b);
  state ^= state >>> 16;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function integer(next: Next, min: number, max: number) {
  return min + Math.floor(next() * (max - min + 1));
}

function choices(id: string, answer: string, alternatives: string[]) {
  const values = [...new Set([answer, ...alternatives])].slice(0, 4);
  for (let n = 1; values.length < 4; n += 1) values.push(`${answer}+${n}`);
  return values.map((latex, index) => ({ id: `${id}-${index}`, latex, correct: index === 0 }));
}

function item(id: string, label: string, latex: string, answer: string, alternatives: string[]): GeometryChoiceItem {
  return { id, label, latex, correctLatex: answer, choices: choices(id, answer, alternatives) };
}

export function createPartialDerivativeProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const a = integer(next, 2, 6);
  const b = integer(next, 2, 6);
  const m = integer(next, 2, 5);
  const n = integer(next, 2, 5);
  return [
    item("pd1", "\\partial f/\\partial x", `f(x,y)=${a}x^{${m}}+${b}xy`, `${a * m}x^{${m - 1}}+${b}y`, [`${a * m}x^{${m - 1}}+${b}x`, `${a}x^{${m - 1}}+${b}y`, `${a * m}x^{${m - 1}}`]),
    item("pd2", "\\partial f/\\partial y", `f(x,y)=${a}xy^{${n}}+${b}x^2`, `${a * n}xy^{${n - 1}}`, [`${a * n}y^{${n - 1}}`, `${a}xy^{${n - 1}}+${2 * b}x`, `${a * n}x^{${n - 1}}`]),
    item("pd3", "편미분값", `f(x,y)=x^2y+${a}y^2,\\quad f_x(${b},1)=?`, `${2 * b}`, [`${b * b}`, `${2 * b + 2 * a}`, `${b * b + a}`]),
    item("pd4", "혼합편미분", `f(x,y)=${a}x^2y^2+${b}xy,\\quad f_{xy}=?`, `${4 * a}xy+${b}`, [`${2 * a}xy+${b}`, `${4 * a}xy`, `${2 * a}x^2+${b}`]),
    item("pd5", "그래디언트", `f(x,y)=x^2+${a}xy+y^2,\\quad \\nabla f=?`, `(2x+${a}y,\\ ${a}x+2y)`, [`(2x+${a}x,\\ ${a}y+2y)`, `(x+${a}y,\\ ${a}x+y)`, `(2x,\\ 2y)`]),
    item("pd6", "전미분", `z=x^2+${a}xy+${b}y^2,\\quad dz=?`, `(2x+${a}y)dx+(${a}x+${2 * b}y)dy`, [`(2x+${a}y)dx+(${a}x+${b}y)dy`, `(2x+${a}x)dx+(${a}y+${2 * b}y)dy`, `2x\\,dx+${2 * b}y\\,dy`]),
  ];
}

export function createEulerFormulaProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const r = integer(next, 2, 7);
  const k = integer(next, 1, 3);
  return [
    item("eu1", "오일러 공식", `e^{i\\theta}=?`, `\\cos\\theta+i\\sin\\theta`, [`\\sin\\theta+i\\cos\\theta`, `\\cos\\theta-i\\sin\\theta`, `e^\\theta(\\cos\\theta+i\\sin\\theta)`]),
    item("eu2", "복소지수의 값", `e^{i\\pi}=?`, `-1`, [`1`, `i`, `-i`]),
    item("eu3", "극형식", `${r}(\\cos\\theta+i\\sin\\theta)=?`, `${r}e^{i\\theta}`, [`e^{${r}i\\theta}`, `${r}e^\\theta`, `e^{i${r}\\theta}`]),
    item("eu4", "드모아브르 정리", `(\\cos\\theta+i\\sin\\theta)^{${k + 2}}=?`, `\\cos${k + 2}\\theta+i\\sin${k + 2}\\theta`, [`\\cos\\theta^{${k + 2}}+i\\sin\\theta^{${k + 2}}`, `\\cos${k + 2}\\theta-i\\sin${k + 2}\\theta`, `${k + 2}(\\cos\\theta+i\\sin\\theta)`]),
    item("eu5", "복소수의 곱", `${r}e^{i\\pi/${k + 2}}\\cdot 2e^{i\\pi/${k + 3}}=?`, `${2 * r}e^{i(\\pi/${k + 2}+\\pi/${k + 3})}`, [`${2 * r}e^{i(\\pi/${k + 2}-\\pi/${k + 3})}`, `${r + 2}e^{i(\\pi/${k + 2}+\\pi/${k + 3})}`, `${2 * r}e^{i\\pi/${(k + 2) * (k + 3)}}`]),
    item("eu6", "복소수의 나눗셈", `\\frac{${2 * r}e^{i\\alpha}}{2e^{i\\beta}}=?`, `${r}e^{i(\\alpha-\\beta)}`, [`${r}e^{i(\\alpha+\\beta)}`, `${2 * r}e^{i(\\alpha-\\beta)}`, `${r}e^{i\\alpha/\\beta}`]),
  ];
}

export function createMatrixProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const a = integer(next, 1, 5);
  const b = integer(next, 1, 5);
  const c = integer(next, 1, 5);
  const d = integer(next, 1, 5);
  const det = a * d - b * c;
  return [
    item("mx1", "행렬의 덧셈", `\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}+\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}=?`, `\\begin{pmatrix}${a + 1}&${b + 2}\\\\${c + 3}&${d + 4}\\end{pmatrix}`, [`\\begin{pmatrix}${a + 1}&${b + 3}\\\\${c + 2}&${d + 4}\\end{pmatrix}`, `\\begin{pmatrix}${a}&${2 * b}\\\\${3 * c}&${4 * d}\\end{pmatrix}`, `\\begin{pmatrix}${a + 4}&${b + 3}\\\\${c + 2}&${d + 1}\\end{pmatrix}`]),
    item("mx2", "행렬의 곱", `\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}\\begin{pmatrix}1\\\\2\\end{pmatrix}=?`, `\\begin{pmatrix}${a + 2 * b}\\\\${c + 2 * d}\\end{pmatrix}`, [`\\begin{pmatrix}${a + b}\\\\${2 * c + d}\\end{pmatrix}`, `\\begin{pmatrix}${a + 2 * c}\\\\${b + 2 * d}\\end{pmatrix}`, `\\begin{pmatrix}${a * b}\\\\${2 * c * d}\\end{pmatrix}`]),
    item("mx3", "행렬식", `\\det\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}=?`, `${det}`, [`${a * d + b * c}`, `${a * c - b * d}`, `${a + d - b - c}`]),
    item("mx4", "단위행렬", `AI_2=?`, `A`, [`I_2`, `2A`, `A^2`]),
    item("mx5", "역행렬의 조건", `A^{-1}\\text{가 존재할 조건은?}`, `\\det A\\ne0`, [`\\det A=0`, `A=0`, `\\det A=1`]),
    item("mx6", "케일리–해밀턴 정리", `A^2-(\\operatorname{tr}A)A+(\\det A)I_2=?`, `O`, [`I_2`, `A`, `A^{-1}`]),
  ];
}

export function createIntegralApplicationProblems(seed: number): GeometryChoiceItem[] {
  const next = rng(seed);
  const a = integer(next, 1, 4);
  const b = integer(next, 2, 5);
  return [
    item("ia1", "곡선의 길이", `y=${a}x,\\quad 0\\le x\\le${b},\\quad L=?`, `${b}\\sqrt{${1 + a * a}}`, [`${a * b}`, `${b * (1 + a * a)}`, `\\sqrt{${b * b + a * a}}`]),
    item("ia2", "회전체의 부피", `y=${a}x,\\quad 0\\le x\\le${b}\\text{를 }x\\text{축 둘레로 회전},\\quad V=?`, `\\frac{${a * a * b ** 3}\\pi}{3}`, [`${a * b * b}\\pi`, `\\frac{${a * b ** 3}\\pi}{3}`, `${a * a * b ** 3}\\pi`]),
    item("ia3", "원판법", `y=f(x)\\ge0,\\quad a\\le x\\le b,\\quad V_x=?`, `\\pi\\int_a^b[f(x)]^2dx`, [`2\\pi\\int_a^b f(x)dx`, `\\pi\\int_a^b f(x)dx`, `\\int_a^b[f(x)]^2dx`]),
    item("ia4", "회전체의 겉넓이", `y=f(x)\\ge0,\\quad a\\le x\\le b,\\quad S_x=?`, `2\\pi\\int_a^b f(x)\\sqrt{1+[f'(x)]^2}\\,dx`, [`\\pi\\int_a^b[f(x)]^2dx`, `2\\pi\\int_a^b f(x)f'(x)dx`, `\\int_a^b\\sqrt{1+[f'(x)]^2}\\,dx`]),
    item("ia5", "타원의 넓이", `\\frac{x^2}{${a * a}}+\\frac{y^2}{${b * b}}=1,\\quad A=?`, `${a * b}\\pi`, [`${a + b}\\pi`, `${a * a + b * b}\\pi`, `2${a * b}\\pi`]),
    item("ia6", "매개곡선의 길이", `x=x(t),\\ y=y(t),\\quad \\alpha\\le t\\le\\beta,\\quad L=?`, `\\int_\\alpha^\\beta\\sqrt{[x'(t)]^2+[y'(t)]^2}\\,dt`, [`\\int_\\alpha^\\beta(x'(t)+y'(t))dt`, `\\int_\\alpha^\\beta\\sqrt{x(t)^2+y(t)^2}\\,dt`, `\\int_\\alpha^\\beta x'(t)y'(t)dt`]),
  ];
}
