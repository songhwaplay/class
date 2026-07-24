"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { distributionProblems } from "../../../../lib/high-school-foundation-workouts";
import { createDistributionProblems } from "../../../../lib/foundation-generated-workouts";
export default function ProbabilityDistributionsPage() {
  return <GeometryChoiceWorksheet subject="확통" title="확률분포와 통계" seed={20260820} problems={distributionProblems} createSet={createDistributionProblems} />;
}
