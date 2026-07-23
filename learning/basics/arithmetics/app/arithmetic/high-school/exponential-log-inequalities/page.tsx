"use client";

import { createExponentialLogInequalityProblemSet, createExponentialLogInequalityReviewProblems } from "../../../../lib/exponential-log-inequality-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createExponentialLogInequalityProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: problem.answerValues, answerLabels: problem.answerValues.map(() => "경계") };
}

function solutionLatex(problem: NumericWorksheetProblem, values: number[]) {
  if (problem.kind === "increasing-exponential") return `x>${values[0]}`;
  if (problem.kind === "decreasing-exponential") return `x\\le ${values[0]}`;
  if (problem.kind === "decreasing-log") return `${values[0]}<x\\le ${values[1]}`;
  return `${values[0]}<x<${values[1]}`;
}

export default function ExponentialLogInequalitiesPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260802}
    subject="대수"
    title="지수·로그 부등식"
    instruction="밑의 범위와 진수 조건을 확인하여 부등식을 푸세요."
    createSet={(seed) => { const set = createExponentialLogInequalityProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createExponentialLogInequalityReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={solutionLatex}
  />;
}
