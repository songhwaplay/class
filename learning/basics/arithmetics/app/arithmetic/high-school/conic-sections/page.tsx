"use client";

import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { conicProblems } from "../../../../lib/geometry-workouts";
import { createConicProblems } from "../../../../lib/geometry-generated-workouts";

export default function ConicSectionsPage() {
  return <GeometryChoiceWorksheet title="이차곡선의 방정식" seed={20260811} problems={conicProblems} createSet={createConicProblems} />;
}
