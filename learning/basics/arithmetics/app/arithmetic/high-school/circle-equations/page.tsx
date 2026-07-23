"use client";

import { createCircleProblemSet, createCircleReviewProblems } from "../../../../lib/circle-equation-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

function adapt(problem: ReturnType<typeof createCircleProblemSet>["problems"][number]): NumericWorksheetProblem {
  return { ...problem, answers: problem.answer, answerLabels: problem.answer.map((_, index) => String(index + 1)) };
}

function signedTerm(value: number, suffix: string) {
  if (value === 0) return "";
  return `${value < 0 ? "-" : "+"}${Math.abs(value) === 1 ? "" : Math.abs(value)}${suffix}`;
}

function answerLatex(problem: NumericWorksheetProblem, values: number[]) {
  const mode = (problem as NumericWorksheetProblem & { answerMode?: string }).answerMode;
  if (mode === "equation") return `x^2+y^2${signedTerm(values[0], "x")}${signedTerm(values[1], "y")}${signedTerm(values[2], "")}=0`;
  if (mode === "center-radius") return `\\text{중심 }(${values[0]},\\ ${values[1]}),\\quad r=${values[2]}`;
  if (mode === "two-points") return `(${values[0]},\\ ${values[1]}),\\quad (${values[2]},\\ ${values[3]})`;
  return String(values[0]);
}

export default function CircleEquationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260727}
    subject="공통수학 2"
    title="원의 방정식"
    instruction="원의 방정식과 관련된 값을 구하세요."
    createSet={(seed) => { const set = createCircleProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createCircleReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={answerLatex}
  />;
}
