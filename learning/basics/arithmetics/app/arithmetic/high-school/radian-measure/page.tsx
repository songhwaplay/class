"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { radianProblems } from "../../../../lib/high-school-foundation-workouts";
import { createRadianProblems } from "../../../../lib/foundation-generated-workouts";
export default function RadianMeasurePage() {
  return <GeometryChoiceWorksheet subject="대수" title="일반각과 호도법" seed={20260817} problems={radianProblems} createSet={createRadianProblems} />;
}
