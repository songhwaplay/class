"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { planeVectorProblems } from "../../../../lib/geometry-workouts";
import { createPlaneVectorProblems } from "../../../../lib/geometry-generated-workouts";
export default function PlaneVectorsPage() {
  return <GeometryChoiceWorksheet title="평면벡터의 연산" seed={20260813} problems={planeVectorProblems} createSet={createPlaneVectorProblems} />;
}
