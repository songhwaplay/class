"use client";

import { createCoordinateLineProblemSet, createCoordinateLineReviewProblems } from "../../../../lib/coordinate-line-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createCoordinateLineProblemSet>["problems"][number]): NumericWorksheetProblem {
  const answerLabels = problem.answerMode === "point" ? ["x", "y"] : problem.answerMode === "line" ? ["a", "b", "c"] : ["답"];
  return { ...problem, answers: problem.answer, answerLabels };
}

function answerLatex(problem: NumericWorksheetProblem, values: number[]) {
  if (problem.answerLabels.length === 1) return String(values[0]);
  if (problem.answerLabels.length === 2) return `(${values[0]},\\ ${values[1]})`;
  const [a, b, c] = values;
  return `${a}x${b < 0 ? "" : "+"}${b}y${c < 0 ? "" : "+"}${c}=0`;
}

export default function CoordinateLinesPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260726}
    subject="공통수학 2"
    title="좌표와 직선의 방정식"
    instruction="좌표와 직선의 방정식을 구하세요."
    createSet={(seed) => { const set = createCoordinateLineProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createCoordinateLineReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={answerLatex}
  />;
}
