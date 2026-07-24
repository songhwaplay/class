"use client";

import { cayleyHamiltonRotationProblems } from "../../../../lib/cayley-hamilton-rotation-workouts";
import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";

export default function CayleyHamiltonRotationPage() {
  return (
    <GeometryChoiceWorksheet
      subject="이공계 기초"
      title="케일리–해밀턴 정리와 회전행렬"
      seed={20260903}
      problems={cayleyHamiltonRotationProblems}
    />
  );
}
