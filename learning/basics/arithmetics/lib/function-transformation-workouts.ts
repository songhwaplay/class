export type FunctionTransformationKind = "compose-fg" | "compose-gf" | "composition-difference" | "linear-inverse" | "rational-inverse";
export type QuadraticCoefficients = [quadratic: number, linear: number, constant: number];
export type LinearCoefficients = [linear: number, constant: number];
export type FunctionTransformationProblem = {
  id: string; kind: FunctionTransformationKind; label: string; f?: QuadraticCoefficients; g?: LinearCoefficients;
  numerator?: LinearCoefficients; denominator?: LinearCoefficients;
  answer: { type: "polynomial"; coefficients: QuadraticCoefficients } | { type: "rational"; numerator: LinearCoefficients; denominator: LinearCoefficients };
};
const KINDS: FunctionTransformationKind[] = ["compose-fg", "compose-gf", "composition-difference", "linear-inverse", "rational-inverse"];
const LABELS: Record<FunctionTransformationKind, string> = {
  "compose-fg": "합성함수", "compose-gf": "합성 순서", "composition-difference": "두 합성함수의 차",
  "linear-inverse": "일차함수의 역함수", "rational-inverse": "분수함수의 역함수",
};
function random(seed: number) {
  let value = seed >>> 0;
  return () => { value += 0x6d2b79f5; let next = value; next = Math.imul(next ^ (next >>> 15), next | 1); next ^= next + Math.imul(next ^ (next >>> 7), next | 61); return ((next ^ (next >>> 14)) >>> 0) / 4294967296; };
}
function integer(next: () => number, min: number, max: number) { return min + Math.floor(next() * (max - min + 1)); }
function nonzero(next: () => number, min: number, max: number) { let value = 0; while (!value) value = integer(next, min, max); return value; }
function functions(next: () => number) {
  return { f: [nonzero(next, -2, 2), integer(next, -4, 4), integer(next, -5, 5)] as QuadraticCoefficients, g: [nonzero(next, -3, 3), integer(next, -4, 4)] as LinearCoefficients };
}
export function composeFG(f: QuadraticCoefficients, g: LinearCoefficients): QuadraticCoefficients {
  const [a, b, c] = f; const [m, n] = g;
  return [a * m * m, 2 * a * m * n + b * m, a * n * n + b * n + c];
}
export function composeGF(f: QuadraticCoefficients, g: LinearCoefficients): QuadraticCoefficients {
  const [a, b, c] = f; const [m, n] = g;
  return [m * a, m * b, m * c + n];
}
export function composeDifferenceAnswer(f: QuadraticCoefficients, g: LinearCoefficients): QuadraticCoefficients {
  const first = composeFG(f, g); const second = composeGF(f, g);
  return first.map((value, index) => value - second[index]) as QuadraticCoefficients;
}
function build(kind: FunctionTransformationKind, next: () => number, id: string): FunctionTransformationProblem {
  if (kind === "compose-fg" || kind === "compose-gf" || kind === "composition-difference") {
    const pair = functions(next);
    const answer = kind === "compose-fg" ? composeFG(pair.f, pair.g) : kind === "compose-gf" ? composeGF(pair.f, pair.g) : composeDifferenceAnswer(pair.f, pair.g);
    return { id, kind, label: LABELS[kind], ...pair, answer: { type: "polynomial", coefficients: answer } };
  }
  if (kind === "linear-inverse") {
    const linear = nonzero(next, -5, 5); const constant = integer(next, -7, 7);
    return { id, kind, label: LABELS[kind], numerator: [linear, constant], answer: { type: "rational", numerator: [1, -constant], denominator: [0, linear] } };
  }
  const numerator: LinearCoefficients = [nonzero(next, -4, 4), integer(next, -6, 6)];
  const denominator: LinearCoefficients = [nonzero(next, -3, 3), integer(next, -5, 5)];
  return { id, kind, label: LABELS[kind], numerator, denominator, answer: { type: "rational", numerator: [-denominator[1], numerator[1]], denominator: [denominator[0], -numerator[0]] } };
}
export function createFunctionTransformationProblemSet(seed: number) { const next = random(seed); return { seed, problems: KINDS.map((kind, index) => build(kind, next, `function-transformation-${index}`)) }; }
export function createFunctionTransformationReviewProblems(kinds: FunctionTransformationKind[], seed: number) {
  const next = random(seed); return [...new Set(kinds)].slice(0, 2).map((kind, index) => build(kind, next, `function-review-${index}-${seed}`));
}
export function formatQuadraticLatex([quadratic, linear, constant]: QuadraticCoefficients) {
  const terms = [{ coefficient: quadratic, variable: "x^{2}" }, { coefficient: linear, variable: "x" }, { coefficient: constant, variable: "" }].filter(({ coefficient }) => coefficient !== 0);
  if (!terms.length) return "0";
  return terms.map(({ coefficient, variable }, index) => {
    const magnitude = Math.abs(coefficient); const term = `${variable && magnitude === 1 ? "" : magnitude}${variable}`;
    return index === 0 ? `${coefficient < 0 ? "-" : ""}${term}` : `${coefficient < 0 ? " - " : " + "}${term}`;
  }).join("");
}
export function formatLinearLatex([linear, constant]: LinearCoefficients) { return formatQuadraticLatex([0, linear, constant]); }
export function formatFunctionProblem(problem: FunctionTransformationProblem) { return formatFunctionProblemLatex(problem); }
export function formatFunctionProblemLatex(problem: FunctionTransformationProblem) {
  if (problem.f && problem.g) {
    const target = problem.kind === "compose-fg" ? "f(g(x))" : problem.kind === "compose-gf" ? "g(f(x))" : "f(g(x))-g(f(x))";
    return `\\begin{aligned}&f(x)=${formatQuadraticLatex(problem.f)},\\quad g(x)=${formatLinearLatex(problem.g)}\\\\[0.5em]&${target}\\end{aligned}`;
  }
  if (problem.kind === "linear-inverse") return `\\begin{aligned}&f(x)=${formatLinearLatex(problem.numerator!)}\\\\[0.5em]&f^{-1}(x)\\end{aligned}`;
  return `\\begin{aligned}&f(x)=\\dfrac{${formatLinearLatex(problem.numerator!)}}{${formatLinearLatex(problem.denominator!)}}\\\\[0.5em]&f^{-1}(x)\\end{aligned}`;
}
export function formatFunctionAnswerLatex(problem: FunctionTransformationProblem) {
  if (problem.answer.type === "polynomial") return formatQuadraticLatex(problem.answer.coefficients);
  return `\\dfrac{${formatLinearLatex(problem.answer.numerator)}}{${formatLinearLatex(problem.answer.denominator)}}`;
}
