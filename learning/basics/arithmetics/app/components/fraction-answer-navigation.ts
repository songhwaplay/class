"use client";

import type { KeyboardEvent } from "react";

const FRACTION_ANSWER_SELECTOR = 'input[data-fraction-answer-input="true"]';

export function moveBetweenFractionAnswerInputs(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter" && event.key !== "Tab") return;

  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(FRACTION_ANSWER_SELECTOR))
    .filter((input) => !input.disabled);
  const currentIndex = inputs.indexOf(event.currentTarget);
  if (currentIndex < 0) return;

  const direction = event.key === "Tab" && event.shiftKey ? -1 : 1;
  const nextInput = inputs[currentIndex + direction];
  if (!nextInput) return;

  event.preventDefault();
  nextInput.focus();
  nextInput.select();
}
