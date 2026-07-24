"use client";

import { determinantInverseProblems } from "../../../../lib/determinant-inverse-workouts";
import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";

export default function DeterminantsInversesPage() {
  return (
    <GeometryChoiceWorksheet
      subject="이공계 기초"
      title="행렬식과 역행렬"
      seed={20260902}
      problems={determinantInverseProblems}
    />
  );
}
