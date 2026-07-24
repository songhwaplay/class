"use client";

import { arcLengthSurfaceAreaProblems } from "../../../../lib/arc-length-surface-area-workouts";
import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";

export default function ArcLengthSurfaceAreaPage() {
  return (
    <GeometryChoiceWorksheet
      subject="이공계 기초"
      title="곡선의 길이와 회전체의 겉넓이"
      seed={20260905}
      problems={arcLengthSurfaceAreaProblems}
    />
  );
}
