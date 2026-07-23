"use client";

import {
  createCombinationProblemSet,
  createPermutationCombinationReviewProblems,
  createPermutationProblemSet,
} from "../../../lib/permutations-combinations-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "./components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createPermutationProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: [problem.answer], answerLabels: ["답"] };
}

export default function CombinatoricsWorksheet({ mode }: { mode: "permutation" | "combination" }) {
  const title = mode === "permutation" ? "순열" : "조합";
  const createSet = mode === "permutation" ? createPermutationProblemSet : createCombinationProblemSet;
  return <NumericChoiceWorksheet
    initialSeed={mode === "permutation" ? 20260723 : 20260724}
    subject="공통수학 1"
    title={title}
    instruction="조건에 맞는 경우의 수를 계산하세요."
    createSet={(seed) => { const set = createSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createPermutationCombinationReviewProblems(kinds as never[], seed).map(adapt)}
    showLatexOnWorksheet={false}
  />;
}
