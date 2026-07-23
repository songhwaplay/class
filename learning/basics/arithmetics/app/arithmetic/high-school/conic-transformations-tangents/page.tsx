"use client";

import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { conicMoveTangentProblems } from "../../../../lib/geometry-workouts";

export default function ConicTransformationsTangentsPage() {
  return <GeometryChoiceWorksheet title="이차곡선의 이동과 접선" seed={20260812} problems={conicMoveTangentProblems} />;
}
