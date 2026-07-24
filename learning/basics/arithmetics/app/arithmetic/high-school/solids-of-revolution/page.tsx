"use client";

import { solidOfRevolutionProblems } from "../../../../lib/solid-of-revolution-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function SolidsOfRevolutionPage() {
  return (
    <GeometryChoiceWorksheet
      subject="미적분Ⅱ"
      title="회전체의 부피"
      seed={20260831}
      problems={solidOfRevolutionProblems}
    />
  );
}
