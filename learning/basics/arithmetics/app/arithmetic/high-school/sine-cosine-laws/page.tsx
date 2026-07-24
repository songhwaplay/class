"use client";

import { sineCosineLawProblems } from "../../../../lib/sine-cosine-law-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function SineCosineLawsPage() {
  return (
    <GeometryChoiceWorksheet
      subject="대수"
      title="사인법칙과 코사인법칙"
      seed={20260827}
      problems={sineCosineLawProblems}
    />
  );
}
