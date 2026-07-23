"use client";

import NumericChoiceWorksheet from "../../high-school/components/numeric-choice-worksheet";
import {
  createMiddleExpressionValueProblemSet,
  createMiddleExpressionValueReviewProblems,
  formatMiddleExpressionValueChoice,
} from "../../../../lib/middle-expression-values";

export default function MiddleExpressionValuesPage() {
  return (
    <NumericChoiceWorksheet
      initialSeed={20260727}
      subject="중학교 1학년"
      title="문자식과 식의 값"
      instruction="문자 대신 수를 대입하고 계산 순서를 지켜 값을 구하세요."
      createSet={createMiddleExpressionValueProblemSet}
      createReviews={createMiddleExpressionValueReviewProblems}
      formatChoice={formatMiddleExpressionValueChoice}
    />
  );
}
