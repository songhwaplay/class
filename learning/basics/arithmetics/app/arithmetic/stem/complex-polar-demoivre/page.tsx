"use client";

import { complexPolarDemoivreProblems } from "../../../../lib/complex-polar-demoivre-workouts";
import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";

export default function ComplexPolarDemoivrePage() {
  return (
    <GeometryChoiceWorksheet
      subject="이공계 기초"
      title="복소수의 극형식과 드므아브르 정리"
      seed={20260901}
      problems={complexPolarDemoivreProblems}
    />
  );
}
