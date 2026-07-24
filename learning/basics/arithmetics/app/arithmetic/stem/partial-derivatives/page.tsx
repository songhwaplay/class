"use client";

import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";
import { createPartialDerivativeProblems } from "../../../../lib/stem-generated-workouts";

export default function Page() {
  const seed = 20260725;
  return <GeometryChoiceWorksheet subject="이공계 기초" title="편미분" seed={seed} problems={createPartialDerivativeProblems(seed)} createSet={createPartialDerivativeProblems} />;
}
