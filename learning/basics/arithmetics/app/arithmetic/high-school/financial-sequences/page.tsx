"use client";

import { financialSequenceProblems } from "../../../../lib/financial-sequence-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function FinancialSequencesPage() {
  return (
    <GeometryChoiceWorksheet
      subject="대수"
      title="등비수열의 활용·원리합계와 적립"
      seed={20260828}
      problems={financialSequenceProblems}
    />
  );
}
