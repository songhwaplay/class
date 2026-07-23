"use client";

import { createRationalRadicalProblemSet, createRationalRadicalReviewProblems } from "../../../../lib/rational-radical-function-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createRationalRadicalProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: problem.answer, answerLabels: problem.answerLabels };
}

export default function RationalRadicalFunctionsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260730}
    subject="공통수학 2"
    title="유리함수와 무리함수"
    instruction="그래프의 이동과 함수값을 이용하여 필요한 값을 구하세요."
    createSet={(seed) => { const set = createRationalRadicalProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createRationalRadicalReviewProblems(kinds as never[], seed).map(adapt)}
  />;
}
