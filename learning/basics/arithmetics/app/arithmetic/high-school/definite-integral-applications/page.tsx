"use client";

import {
  createDefiniteIntegralApplicationReviews,
  createDefiniteIntegralApplicationSet,
} from "../../../../lib/definite-integral-application-workouts";
import NumericChoiceWorksheet, { type NumericWorksheetProblem } from "../components/numeric-choice-worksheet";

export default function DefiniteIntegralApplicationsPage() {
  return <NumericChoiceWorksheet
    initialSeed={20260812}
    subject="미적분Ⅱ"
    title="정적분의 활용"
    instruction=""
    createSet={(seed) => createDefiniteIntegralApplicationSet(seed) as { seed: number; problems: NumericWorksheetProblem[] }}
    createReviews={(kinds, seed) => createDefiniteIntegralApplicationReviews(kinds as never[], seed) as NumericWorksheetProblem[]}
    formatChoice={(_problem, values) => String(values[0])}
  />;
}
