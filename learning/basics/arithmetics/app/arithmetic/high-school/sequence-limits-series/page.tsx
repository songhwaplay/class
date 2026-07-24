"use client";

import { sequenceLimitsSeriesProblems } from "../../../../lib/sequence-limits-series-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function SequenceLimitsSeriesPage() {
  return (
    <GeometryChoiceWorksheet
      subject="미적분Ⅱ"
      title="수열의 극한과 급수"
      seed={20260830}
      problems={sequenceLimitsSeriesProblems}
    />
  );
}
