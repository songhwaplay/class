"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { vectorGeometryProblems } from "../../../../lib/geometry-workouts";
export default function VectorGeometryPage() {
  return <GeometryChoiceWorksheet title="도형과 벡터" seed={20260815} problems={vectorGeometryProblems} />;
}
