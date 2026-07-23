"use client";

import { createExponentialLogEquationProblemSet, createExponentialLogEquationReviewProblems } from "../../../../lib/exponential-log-equation-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createExponentialLogEquationProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answerLabels: problem.answers.map(() => "x") };
}

export default function ExponentialLogEquationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260801}
    subject="대수"
    title="지수·로그 방정식"
    instruction="지수와 로그의 성질 및 진수 조건을 확인하여 해를 구하세요."
    createSet={(seed) => { const set = createExponentialLogEquationProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createExponentialLogEquationReviewProblems(kinds as never[], seed).map(adapt)}
  />;
}
