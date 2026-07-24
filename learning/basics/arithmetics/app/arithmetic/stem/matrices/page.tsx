"use client";

import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";
import { createMatrixProblems } from "../../../../lib/stem-generated-workouts";

export default function Page() {
  const seed = 20260727;
  return <GeometryChoiceWorksheet subject="이공계 기초" title="행렬의 필수 계산" seed={seed} problems={createMatrixProblems(seed)} createSet={createMatrixProblems} />;
}
