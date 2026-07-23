"use client";

import { createDerivativeApplicationReviews, createDerivativeApplicationSet } from "../../../../lib/derivative-application-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

export default function DerivativeApplicationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260810}
    subject="미적분Ⅰ"
    title="미분의 활용"
    instruction="도함수를 이용하여 접선, 극값과 변화율을 구하세요."
    createSet={(seed) => createDerivativeApplicationSet(seed) as { seed: number; problems: NumericWorksheetProblem[] }}
    createReviews={(kinds, seed) => createDerivativeApplicationReviews(kinds as never[], seed) as NumericWorksheetProblem[]}
  />;
}
