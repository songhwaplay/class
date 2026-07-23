"use client";

import { createTransformProblemSet, createTransformReviewProblems } from "../../../../lib/geometric-transform-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createTransformProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: problem.answer, answerLabels: problem.answer.map((_, index) => String(index + 1)) };
}

function signed(value: number, suffix: string) {
  return `${value < 0 ? "-" : "+"}${Math.abs(value) === 1 ? "" : Math.abs(value)}${suffix}`;
}

function answerLatex(problem: NumericWorksheetProblem, values: number[]) {
  const mode = (problem as NumericWorksheetProblem & { answerMode?: string }).answerMode;
  if (mode === "point") return `(${values[0]},\\ ${values[1]})`;
  if (mode === "line") return `${values[0]}x${signed(values[1], "y")}${signed(values[2], "")}=0`;
  if (mode === "circle") return `(x${values[0] > 0 ? "-" : "+"}${Math.abs(values[0])})^2+(y${values[1] > 0 ? "-" : "+"}${Math.abs(values[1])})^2=${values[2] ** 2}`;
  return `y=${values[0]}x^2${signed(values[1], "x")}${signed(values[2], "")}`;
}

export default function GeometricTransformationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260728}
    subject="공통수학 2"
    title="도형의 이동"
    instruction="평행이동과 대칭이동 뒤의 좌표 또는 방정식을 구하세요."
    createSet={(seed) => { const set = createTransformProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createTransformReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={answerLatex}
  />;
}
