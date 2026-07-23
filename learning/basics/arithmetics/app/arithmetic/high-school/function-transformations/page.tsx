"use client";

import {
  createFunctionTransformationProblemSet,
  createFunctionTransformationReviewProblems,
  formatFunctionProblemLatex,
  formatLinearLatex,
  formatQuadraticLatex,
} from "../../../../lib/function-transformation-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createFunctionTransformationProblemSet>["problems"][number]): NumericWorksheetProblem {
  const polynomial = problem.answer.type === "polynomial";
  const answers = polynomial ? [...problem.answer.coefficients] : [...problem.answer.numerator, ...problem.answer.denominator];
  return {
    ...problem,
    prompt: polynomial ? "합성함수를 계산하여 식을 간단히 하세요." : "역함수를 구하세요.",
    latex: formatFunctionProblemLatex(problem),
    answers,
    answerLabels: answers.map((_, index) => String(index + 1)),
    answerMode: polynomial ? "polynomial" : "rational",
  } as NumericWorksheetProblem;
}

function answerLatex(problem: NumericWorksheetProblem, values: number[]) {
  const mode = (problem as NumericWorksheetProblem & { answerMode?: string }).answerMode;
  if (mode === "polynomial") return formatQuadraticLatex(values as [number, number, number]);
  return `\\frac{${formatLinearLatex(values.slice(0, 2) as [number, number])}}{${formatLinearLatex(values.slice(2, 4) as [number, number])}}`;
}

export default function FunctionTransformationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260729}
    subject="공통수학 2"
    title="합성함수와 역함수"
    instruction="함수의 합성과 역함수 계산을 수행하세요."
    createSet={(seed) => { const set = createFunctionTransformationProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createFunctionTransformationReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={answerLatex}
  />;
}
