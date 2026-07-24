"use client";

import { conicIntegralAreaProblems } from "../../../../lib/conic-integral-area-workouts";
import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";

export default function ConicIntegralAreasPage() {
  return (
    <GeometryChoiceWorksheet
      subject="이공계 기초"
      title="이차곡선의 적분과 넓이"
      seed={20260904}
      problems={conicIntegralAreaProblems}
    />
  );
}
