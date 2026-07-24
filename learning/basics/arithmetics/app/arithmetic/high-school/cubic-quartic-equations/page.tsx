"use client";

import { cubicQuarticEquationProblems } from "../../../../lib/cubic-quartic-equation-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function CubicQuarticEquationsPage() {
  return (
    <GeometryChoiceWorksheet
      subject="공통수학1"
      title="삼차방정식과 사차방정식"
      seed={20260825}
      problems={cubicQuarticEquationProblems}
    />
  );
}
