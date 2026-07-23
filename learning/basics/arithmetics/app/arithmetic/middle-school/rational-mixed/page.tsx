"use client";

import NumericChoiceWorksheet from "../../high-school/components/numeric-choice-worksheet";
import {
  createMiddleRationalMixedProblemSet,
  createMiddleRationalMixedReviewProblems,
  formatMiddleRationalMixedChoice,
} from "../../../../lib/middle-rational-mixed";

export default function MiddleRationalMixedPage() {
  return (
    <NumericChoiceWorksheet
      initialSeed={20260726}
      subject="중학교 1학년"
      title="정수와 유리수의 혼합계산"
      instruction="거듭제곱, 괄호, 곱셈·나눗셈 순서를 지켜 계산하세요."
      createSet={createMiddleRationalMixedProblemSet}
      createReviews={createMiddleRationalMixedReviewProblems}
      formatChoice={formatMiddleRationalMixedChoice}
    />
  );
}
