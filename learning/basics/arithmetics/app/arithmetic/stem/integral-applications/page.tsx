"use client";

import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";
import { createIntegralApplicationProblems } from "../../../../lib/stem-generated-workouts";

export default function Page() {
  const seed = 20260728;
  return <GeometryChoiceWorksheet subject="이공계 기초" title="곡선 길이와 회전체" seed={seed} problems={createIntegralApplicationProblems(seed)} createSet={createIntegralApplicationProblems} />;
}
