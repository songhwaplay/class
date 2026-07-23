"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { probabilityProblems } from "../../../../lib/high-school-foundation-workouts";
export default function ProbabilityRulesPage() {
  return <GeometryChoiceWorksheet subject="확통" title="확률의 계산" seed={20260819} problems={probabilityProblems} />;
}
