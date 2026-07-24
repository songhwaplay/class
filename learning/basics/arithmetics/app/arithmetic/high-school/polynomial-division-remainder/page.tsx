"use client";

import { polynomialDivisionRemainderProblems } from "../../../../lib/polynomial-division-remainder-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function PolynomialDivisionRemainderPage() {
  return (
    <GeometryChoiceWorksheet
      subject="공통수학1"
      title="다항식의 곱셈·나눗셈과 나머지정리"
      seed={20260826}
      problems={polynomialDivisionRemainderProblems}
    />
  );
}
