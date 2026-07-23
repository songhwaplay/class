"use client";

import {
  createDerivativeProblemSet,
  createDerivativeReviewProblems,
  formatDerivativeAnswerLatex,
  formatDerivativeProblemLatex,
  type DerivativeProblem,
} from "../../../../lib/derivative-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: DerivativeProblem): NumericWorksheetProblem {
  return {
    ...problem,
    prompt: "도함수를 구하세요.",
    latex: `${formatDerivativeProblemLatex(problem)}\\quad f^{\\prime}(x)=?`,
    answers: [...problem.answer],
    answerLabels: problem.answer.map((_, index) => String.fromCharCode(65 + index)),
  };
}

function derivativeLatex(problem: NumericWorksheetProblem, values: number[]) {
  return formatDerivativeAnswerLatex({ ...problem, answer: values } as DerivativeProblem);
}

export default function DerivativePracticePage() {
  return <NumericChoiceWorksheet
    initialSeed={20260727}
    subject="미적분Ⅰ"
    title="미분"
    instruction="곱·몫·합성함수의 미분법을 적용하여 도함수를 구하세요."
    createSet={(seed) => { const set = createDerivativeProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createDerivativeReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={derivativeLatex}
    showPromptOnWorksheet={false}
  />;
}
