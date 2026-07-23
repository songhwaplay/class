"use client";

import { createTrigEquationSet, piLatex } from "../../../../lib/trigonometric-equation-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";
import { rotateChoices } from "../../../../lib/worksheet-choice-utils";

function adapt(problem: ReturnType<typeof createTrigEquationSet>["problems"][number]): NumericWorksheetProblem {
  return {
    ...problem,
    answers: problem.answers.flatMap(({ n, d }) => [n, d]),
    answerLabels: problem.answers.flatMap(() => ["분자", "분모"]),
  };
}

function solutionLatex(problem: NumericWorksheetProblem, values: number[]) {
  const items = Array.from({ length: values.length / 2 }, (_, index) => piLatex({ n: values[index * 2], d: Math.max(1, Math.abs(values[index * 2 + 1])) }));
  const interval = (problem as NumericWorksheetProblem & { interval?: boolean }).interval;
  return `${interval ? "[" : "\\{"}${items.join(",\\ ")}${interval ? "]" : "\\}"}`;
}

function choices(problem: NumericWorksheetProblem) {
  const correct = [...problem.answers];
  const signError = [...correct]; signError[0] = -signError[0];
  const angleShift = correct.map((value, index) => index % 2 === 0 ? value + 1 : value);
  const lastError = [...correct]; lastError[lastError.length - 2] += 1;
  const denominatorError = [...correct]; denominatorError[1] += 1;
  const unique = [...new Map([correct, signError, angleShift, lastError, denominatorError].map((values) => [values.join(","), values])).values()].slice(0, 4);
  return rotateChoices(unique.map((values, index) => ({
    id: `${problem.id}-${index}`,
    values,
    correct: values.join(",") === correct.join(","),
  })), problem.id);
}

export default function TrigonometricEquationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260805}
    subject="대수"
    title="삼각방정식·부등식"
    instruction="주어진 구간에서 모든 해 또는 해의 구간을 구하세요."
    createSet={(seed) => { const set = createTrigEquationSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={() => []}
    formatChoice={solutionLatex}
    makeChoices={choices}
  />;
}
