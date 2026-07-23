"use client";

import { createSigmaRecurrenceReviews, createSigmaRecurrenceSet } from "../../../../lib/sigma-recurrence-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createSigmaRecurrenceSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: [problem.answer], answerLabels: ["답"] };
}

export default function SigmaRecurrencePage() {
  return <NumericChoiceWorksheet
    initialSeed={20260807}
    subject="대수"
    title="시그마와 점화식"
    instruction="합의 성질과 점화식을 이용하여 값을 구하세요."
    createSet={(seed) => { const set = createSigmaRecurrenceSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createSigmaRecurrenceReviews(kinds as never[], seed).map(adapt)}
  />;
}
