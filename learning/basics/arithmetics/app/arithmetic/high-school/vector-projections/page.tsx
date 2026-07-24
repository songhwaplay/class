"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { projectionProblems } from "../../../../lib/geometry-workouts";
import { createProjectionProblems } from "../../../../lib/geometry-generated-workouts";
export default function VectorProjectionsPage() {
  return <GeometryChoiceWorksheet title="벡터의 내적과 정사영" seed={20260814} problems={projectionProblems} createSet={createProjectionProblems} />;
}
