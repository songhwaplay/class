"use client";

import GeometryChoiceWorksheet from "../../high-school/components/geometry-choice-worksheet";
import { createEulerFormulaProblems } from "../../../../lib/stem-generated-workouts";

export default function Page() {
  const seed = 20260726;
  return <GeometryChoiceWorksheet subject="이공계 기초" title="오일러 공식과 복소지수" seed={seed} problems={createEulerFormulaProblems(seed)} createSet={createEulerFormulaProblems} />;
}
