"use client";

import { createTrigonometricValueProblemSet, createTrigonometricValueReviewProblems, formatExactTrigValue } from "../../../../lib/trigonometric-values-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";
import { rotateChoices } from "../../../../lib/worksheet-choice-utils";

function adapt(problem: ReturnType<typeof createTrigonometricValueProblemSet>["problems"][number]): NumericWorksheetProblem {
  const { sign, numerator, radical, denominator } = problem.answer;
  return { ...problem, answers: [sign, numerator, radical, denominator], answerLabels: ["값", "", "", ""] };
}

function exactLatex(_problem: NumericWorksheetProblem, values: number[]) {
  return formatExactTrigValue({ sign: values[0] < 0 ? -1 : 1, numerator: Math.abs(values[1]), radical: values[2] === 2 ? 2 : values[2] === 3 ? 3 : 0, denominator: Math.max(1, Math.abs(values[3])) });
}

function exactChoices(problem: NumericWorksheetProblem) {
  const [sign, numerator, radical, denominator] = problem.answers;
  const variants = [
    [sign, numerator, radical, denominator],
    [-sign, numerator, radical, denominator],
    numerator === denominator
      ? [sign, numerator + 1, radical, denominator]
      : [sign, denominator, radical, Math.max(1, numerator)],
    [sign, numerator, radical === 2 ? 3 : radical === 3 ? 2 : 2, denominator],
  ];
  return rotateChoices(variants.map((values, index) => ({ id: `${problem.id}-${index}`, values, correct: index === 0 })), problem.id);
}

export default function TrigonometricValuesPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260803}
    subject="대수"
    title="삼각함수의 값과 관계"
    instruction="각의 위치와 삼각함수의 기본 관계를 이용하여 값을 구하세요."
    createSet={(seed) => { const set = createTrigonometricValueProblemSet(seed); return { seed: set.seed, problems: set.problems.map(adapt) }; }}
    createReviews={(kinds, seed) => createTrigonometricValueReviewProblems(kinds as never[], seed).map(adapt)}
    formatChoice={exactLatex}
    makeChoices={exactChoices}
  />;
}
