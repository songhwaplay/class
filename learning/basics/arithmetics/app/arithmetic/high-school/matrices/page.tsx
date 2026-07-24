"use client";

import { matrixProblems } from "../../../../lib/matrix-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function MatricesPage() {
  return (
    <GeometryChoiceWorksheet
      subject="공통수학1"
      title="행렬의 뜻과 기본 연산"
      seed={20260821}
      problems={matrixProblems}
    />
  );
}
