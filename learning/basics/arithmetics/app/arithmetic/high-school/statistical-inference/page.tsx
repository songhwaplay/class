"use client";

import { statisticalInferenceProblems } from "../../../../lib/statistical-inference-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function StatisticalInferencePage() {
  return (
    <GeometryChoiceWorksheet
      subject="확률과 통계"
      title="모집단과 표본·통계적 추정"
      seed={20260823}
      problems={statisticalInferenceProblems}
    />
  );
}
