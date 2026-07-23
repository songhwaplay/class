"use client";

import { createLogarithmProblemSet, createLogarithmReviewProblems } from "../../../../lib/logarithm-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createLogarithmProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: [problem.answer], answerLabels: ["답"] };
}

export default function LogarithmsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260731}
    subject="대수"
    title="로그의 값과 성질"
    instruction="로그의 정의와 성질을 이용하여 값을 구하세요."
    createSet={(seed) => { const set = createLogarithmProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createLogarithmReviewProblems(kinds as never[], seed).map(adapt)}
    showPromptOnWorksheet={false}
  />;
}
