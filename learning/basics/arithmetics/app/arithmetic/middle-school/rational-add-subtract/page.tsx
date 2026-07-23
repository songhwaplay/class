"use client";

import NumericChoiceWorksheet from "../../high-school/components/numeric-choice-worksheet";
import {
  createMiddleRationalProblemSet,
  createMiddleRationalReviewProblems,
  formatMiddleRationalChoice,
} from "../../../../lib/middle-rational-add-subtract";

export default function MiddleRationalAddSubtractPage() {
  return (
    <NumericChoiceWorksheet
      initialSeed={20260724}
      subject="중학교 1학년"
      title="정수와 유리수의 덧셈·뺄셈"
      instruction="부호와 괄호에 주의하여 계산하세요."
      createSet={createMiddleRationalProblemSet}
      createReviews={createMiddleRationalReviewProblems}
      formatChoice={formatMiddleRationalChoice}
    />
  );
}
