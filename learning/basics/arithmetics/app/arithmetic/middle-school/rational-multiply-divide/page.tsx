"use client";

import NumericChoiceWorksheet from "../../high-school/components/numeric-choice-worksheet";
import {
  createMiddleRationalMultiplyProblemSet,
  createMiddleRationalMultiplyReviewProblems,
  formatMiddleRationalMultiplyChoice,
} from "../../../../lib/middle-rational-multiply-divide";

export default function MiddleRationalMultiplyDividePage() {
  return (
    <NumericChoiceWorksheet
      initialSeed={20260725}
      subject="중학교 1학년"
      title="정수와 유리수의 곱셈·나눗셈"
      instruction="부호를 먼저 판단하고 약분하여 계산하세요."
      createSet={createMiddleRationalMultiplyProblemSet}
      createReviews={createMiddleRationalMultiplyReviewProblems}
      formatChoice={formatMiddleRationalMultiplyChoice}
    />
  );
}
