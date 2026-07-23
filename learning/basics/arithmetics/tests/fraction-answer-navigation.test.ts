import assert from "node:assert/strict";
import test from "node:test";

import { moveBetweenFractionAnswerInputs } from "../app/components/fraction-answer-navigation.ts";

type InputStub = {
  disabled: boolean;
  focused: boolean;
  selected: boolean;
  focus: () => void;
  select: () => void;
};

function inputStub(): InputStub {
  const input: InputStub = {
    disabled: false,
    focused: false,
    selected: false,
    focus() { input.focused = true; },
    select() { input.selected = true; },
  };
  return input;
}

function withInputs(inputs: InputStub[], run: () => void) {
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { querySelectorAll: () => inputs },
  });
  try {
    run();
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
    });
  }
}

function keyEvent(currentTarget: InputStub, key: string, shiftKey = false) {
  let prevented = false;
  return {
    currentTarget,
    key,
    shiftKey,
    preventDefault() { prevented = true; },
    get prevented() { return prevented; },
  };
}

test("Enter와 Tab은 분수 답의 다음 입력 칸으로 이동한다", () => {
  const inputs = [inputStub(), inputStub(), inputStub()];
  withInputs(inputs, () => {
    const enter = keyEvent(inputs[0], "Enter");
    moveBetweenFractionAnswerInputs(enter as never);
    assert.equal(enter.prevented, true);
    assert.equal(inputs[1].focused, true);
    assert.equal(inputs[1].selected, true);

    const tab = keyEvent(inputs[1], "Tab");
    moveBetweenFractionAnswerInputs(tab as never);
    assert.equal(tab.prevented, true);
    assert.equal(inputs[2].focused, true);
  });
});

test("Shift+Tab은 분수 답의 이전 입력 칸으로 이동한다", () => {
  const inputs = [inputStub(), inputStub(), inputStub()];
  withInputs(inputs, () => {
    const event = keyEvent(inputs[2], "Tab", true);
    moveBetweenFractionAnswerInputs(event as never);
    assert.equal(event.prevented, true);
    assert.equal(inputs[1].focused, true);
    assert.equal(inputs[1].selected, true);
  });
});
