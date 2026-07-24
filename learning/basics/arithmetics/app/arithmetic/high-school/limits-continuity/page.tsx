"use client";

import { createLimitReviews, createLimitSet } from "../../../../lib/limit-continuity-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

export default function LimitsContinuityPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260808}
    subject="미적분Ⅰ"
    title="함수의 극한과 연속"
    showPromptOnWorksheet={false}
    instruction="식의 구조와 좌우 극한을 확인하여 값을 구하세요."
    createSet={(seed) => createLimitSet(seed) as { seed: number; problems: NumericWorksheetProblem[] }}
    createReviews={(kinds, seed) => createLimitReviews(kinds as never[], seed) as NumericWorksheetProblem[]}
  />;
}
