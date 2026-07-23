"use client";

import { createTrigonometricGraphProblemSet, createTrigonometricGraphReviewProblems } from "../../../../lib/trigonometric-graph-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

export default function TrigonometricGraphsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260804}
    subject="대수"
    title="삼각함수 그래프의 성질"
    instruction="그래프와 식의 관계를 이용하여 필요한 값을 구하세요."
    createSet={(seed) => createTrigonometricGraphProblemSet(seed) as { seed: number; problems: NumericWorksheetProblem[] }}
    createReviews={(kinds, seed) => createTrigonometricGraphReviewProblems(kinds as never[], seed) as NumericWorksheetProblem[]}
  />;
}
