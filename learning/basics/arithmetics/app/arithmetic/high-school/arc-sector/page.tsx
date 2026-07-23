"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { arcSectorProblems } from "../../../../lib/high-school-foundation-workouts";
export default function ArcSectorPage() {
  return <GeometryChoiceWorksheet subject="대수" title="호의 길이와 부채꼴" seed={20260818} problems={arcSectorProblems} />;
}
