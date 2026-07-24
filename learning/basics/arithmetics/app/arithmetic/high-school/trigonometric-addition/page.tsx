"use client";

import { trigonometricAdditionProblems } from "../../../../lib/trigonometric-addition-workouts";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";

export default function TrigonometricAdditionPage() {
  return (
    <GeometryChoiceWorksheet
      subject="미적분Ⅱ"
      title="삼각함수의 덧셈정리와 합·곱 변환"
      seed={20260829}
      problems={trigonometricAdditionProblems}
    />
  );
}
