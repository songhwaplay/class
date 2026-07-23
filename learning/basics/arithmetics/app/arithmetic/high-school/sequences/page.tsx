"use client";

import { createSequenceReviews, createSequenceSet } from "../../../../lib/sequence-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createSequenceSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: [problem.answer], answerLabels: ["답"] };
}

export default function SequencesPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260806}
    subject="대수"
    title="등차수열과 등비수열"
    instruction="수열의 규칙을 찾아 일반항과 합을 구하세요."
    createSet={(seed) => { const set = createSequenceSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createSequenceReviews(kinds as never[], seed).map(adapt)}
    showPromptOnWorksheet={false}
  />;
}
