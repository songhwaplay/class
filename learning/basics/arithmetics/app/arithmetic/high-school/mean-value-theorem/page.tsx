"use client";

import { meanValueTheoremProblems } from "../../../../lib/mean-value-theorem-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function MeanValueTheoremPage() {
  return (
    <GeometryChoiceWorksheet
      subject="미적분Ⅰ"
      title="평균값정리"
      seed={20260824}
      problems={meanValueTheoremProblems}
    />
  );
}
