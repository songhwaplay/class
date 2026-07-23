"use client";

import { createIntegralReviews, createIntegralSet } from "../../../../lib/polynomial-integral-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

export default function PolynomialIntegralsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260809}
    subject="미적분Ⅰ"
    title="다항함수의 적분"
    instruction="부정적분과 정적분의 관계를 이용하여 값을 구하세요."
    createSet={(seed) => createIntegralSet(seed) as { seed: number; problems: NumericWorksheetProblem[] }}
    createReviews={(kinds, seed) => createIntegralReviews(kinds as never[], seed) as NumericWorksheetProblem[]}
  />;
}
