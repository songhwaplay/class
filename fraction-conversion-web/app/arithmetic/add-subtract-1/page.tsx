"use client";

import { useEffect, useMemo, useState } from "react";

type Field = "left" | "right" | "result";
type Equation = {
  id: string;
  left: number;
  operator: "+" | "−";
  right: number;
  result: number;
  hidden: Field[];
};
type ProblemSet = {
  seed: number;
  additions: Equation[];
  subtractions: Equation[];
  mixed: Equation[];
};
type PrintMode = "worksheet" | "answers" | "both";
export type AdditionSubtractionVariant = "single-digit" | "two-digit" | "within-twenty" | "missing-parts";

const INITIAL_SEED = 20260720;

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createSingleDigitProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const totals = shuffle([9, 9, 8, 8, 7, 7, 6, 5, 4, 3], next);
  const differences = shuffle([7, 6, 5, 5, 4, 4, 3, 2, 1, 0], next);

  const additions = totals.map((result, index) => {
    const right = result === 3 ? integer(next, 0, 3) : integer(next, 2, result - 2);
    return {
      id: `addition-${index}`,
      left: result - right,
      operator: "+" as const,
      right,
      result,
      hidden: ["result" as const],
    };
  });

  const subtractions = differences.map((result, index) => {
    const left = integer(next, result + 2, 9);
    return {
      id: `subtraction-${index}`,
      left,
      operator: "−" as const,
      right: left - result,
      result,
      hidden: ["result" as const],
    };
  });

  const mixed: Equation[] = [];
  function subtraction(index: number, minimum: number, hidden: Field[], includeEndpoints = false) {
    const left = integer(next, minimum, 9);
    const right = integer(next, includeEndpoints ? 0 : 1, includeEndpoints ? left : left - 1);
    mixed.push({ id: `mixed-${index}`, left, operator: "−", right, result: left - right, hidden });
  }
  function addition(index: number, range: "inside" | "allow-zero" | "allow-result", hidden: Field[]) {
    const result = integer(next, 4, 9);
    const left = integer(next, range === "allow-zero" ? 0 : 1, range === "allow-result" ? result : result - 1);
    mixed.push({ id: `mixed-${index}`, left, operator: "+", right: result - left, result, hidden });
  }

  subtraction(0, 2, ["left"]);
  addition(1, "inside", ["right"]);
  subtraction(2, 2, ["left"]);
  subtraction(3, 4, ["right"], true);
  addition(4, "inside", ["left"]);
  subtraction(5, 4, ["right"], true);
  addition(6, "allow-zero", ["left"]);
  subtraction(7, 2, ["right"]);
  subtraction(8, 4, []);
  addition(9, "allow-result", ["left", "right"]);

  return { seed, additions, subtractions, mixed };
}

function createTwoDigitProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const twoDigit = () => integer(next, 2, 9) * 10 + integer(next, 2, 9);
  const boundedByDigits = (value: number) =>
    integer(next, 0, Math.floor(value / 10)) * 10 + integer(next, 0, value % 10);

  const additions = Array.from({ length: 10 }, (_, index) => {
    const result = twoDigit();
    const right = boundedByDigits(result);
    return {
      id: `addition-${index}`,
      left: result - right,
      operator: "+" as const,
      right,
      result,
      hidden: ["result" as const],
    };
  });

  const subtractions = Array.from({ length: 10 }, (_, index) => {
    const left = twoDigit();
    const right = boundedByDigits(left);
    return {
      id: `subtraction-${index}`,
      left,
      operator: "−" as const,
      right,
      result: left - right,
      hidden: ["result" as const],
    };
  });

  const patterns: Array<["+" | "−", Field]> = [
    ["−", "left"],
    ["+", "right"],
    ["−", "left"],
    ["−", "right"],
    ["+", "left"],
    ["−", "right"],
    ["+", "left"],
    ["−", "right"],
    ["−", "left"],
    ["+", "right"],
  ];

  const mixed = patterns.map(([operator, hidden], index) => {
    if (operator === "−") {
      const left = twoDigit();
      const right = boundedByDigits(left);
      return { id: `mixed-${index}`, left, operator, right, result: left - right, hidden: [hidden] };
    }
    const result = twoDigit();
    const right = boundedByDigits(result);
    return { id: `mixed-${index}`, left: result - right, operator, right, result, hidden: [hidden] };
  });

  return { seed, additions, subtractions, mixed };
}

function createWithinTwentyProblemSet(seed: number): ProblemSet {
  const next = random(seed);

  function addition(id: string): Equation {
    const result = integer(next, 11, 18);
    const right = integer(next, 6, 9);
    return {
      id,
      left: result - right,
      operator: "+",
      right,
      result,
      hidden: ["result"],
    };
  }

  function subtraction(id: string): Equation {
    const left = integer(next, 11, 18);
    const result = integer(next, 2, 9);
    return {
      id,
      left,
      operator: "−",
      right: left - result,
      result,
      hidden: ["result"],
    };
  }

  const additions = Array.from({ length: 10 }, (_, index) => addition(`addition-${index}`));
  const subtractions = Array.from({ length: 10 }, (_, index) => subtraction(`subtraction-${index}`));
  const mixedPattern: Array<"+" | "−"> = ["−", "−", "+", "−", "+", "−", "+", "−", "+", "−"];
  const mixed = mixedPattern.map((operator, index) =>
    operator === "+" ? addition(`mixed-${index}`) : subtraction(`mixed-${index}`),
  );

  return { seed, additions, subtractions, mixed };
}

function createMissingPartsProblemSet(seed: number): ProblemSet {
  const next = random(seed);

  function subtraction(id: string, hidden: Field): Equation {
    const left = integer(next, 11, 18);
    const result = integer(next, 2, 9);
    return { id, left, operator: "−", right: left - result, result, hidden: [hidden] };
  }

  function additionFromRight(id: string, hidden: Field): Equation {
    const result = integer(next, 11, 18);
    const right = integer(next, 6, 9);
    return { id, left: result - right, operator: "+", right, result, hidden: [hidden] };
  }

  function additionFromLeft(id: string, hidden: Field): Equation {
    const result = integer(next, 11, 18);
    const left = integer(next, 1, 9);
    return { id, left, operator: "+", right: result - left, result, hidden: [hidden] };
  }

  const additions = [
    subtraction("addition-0", "result"),
    subtraction("addition-1", "result"),
    subtraction("addition-2", "left"),
    subtraction("addition-3", "result"),
    additionFromRight("addition-4", "result"),
    subtraction("addition-5", "right"),
    subtraction("addition-6", "result"),
    additionFromRight("addition-7", "result"),
    additionFromLeft("addition-8", "left"),
    additionFromLeft("addition-9", "right"),
  ];

  const subtractions = [
    subtraction("subtraction-0", "left"),
    subtraction("subtraction-1", "right"),
    additionFromLeft("subtraction-2", "left"),
    subtraction("subtraction-3", "right"),
    subtraction("subtraction-4", "result"),
    subtraction("subtraction-5", "right"),
    additionFromLeft("subtraction-6", "left"),
    subtraction("subtraction-7", "right"),
    subtraction("subtraction-8", "result"),
    subtraction("subtraction-9", "right"),
  ];

  const mixed = [
    subtraction("mixed-0", "left"),
    additionFromLeft("mixed-1", "left"),
    subtraction("mixed-2", "left"),
    subtraction("mixed-3", "result"),
    additionFromLeft("mixed-4", "left"),
    subtraction("mixed-5", "right"),
    subtraction("mixed-6", "result"),
    additionFromLeft("mixed-7", "left"),
    subtraction("mixed-8", "left"),
    subtraction("mixed-9", "right"),
  ];

  return { seed, additions, subtractions, mixed };
}

function createProblemSet(seed: number, variant: AdditionSubtractionVariant): ProblemSet {
  if (variant === "two-digit") return createTwoDigitProblemSet(seed);
  if (variant === "within-twenty") return createWithinTwentyProblemSet(seed);
  if (variant === "missing-parts") return createMissingPartsProblemSet(seed);
  return createSingleDigitProblemSet(seed);
}

function answerId(equation: Equation, field: Field) {
  return `${equation.id}-${field}`;
}

function expectedEntries(set: ProblemSet) {
  return [...set.additions, ...set.subtractions, ...set.mixed].flatMap((equation) =>
    equation.hidden.map((field) => [answerId(equation, field), String(equation[field])] as const),
  );
}

function EquationRow({
  equation,
  answerSheet,
  answers,
  results,
  onAnswer,
  maxLength,
}: {
  equation: Equation;
  answerSheet: boolean;
  answers: Record<string, string>;
  results: Record<string, boolean>;
  onAnswer: (id: string, value: string) => void;
  maxLength: number;
}) {
  const hiddenIds = equation.hidden.map((field) => answerId(equation, field));
  const graded = hiddenIds.some((id) => id in results);
  const rowCorrect = graded && hiddenIds.every((id) => results[id]);

  function number(field: Field) {
    const id = answerId(equation, field);
    if (!answerSheet && equation.hidden.includes(field)) {
      const result = results[id];
      return (
        <input
          className={`addsub-input ${result === true ? "is-correct" : result === false ? "is-wrong" : ""}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={maxLength}
          value={answers[id] ?? ""}
          onChange={(event) => onAnswer(id, event.target.value.replace(/[^0-9]/g, ""))}
          aria-label={`${equation.id} ${field} 답`}
        />
      );
    }
    return <strong>{equation[field]}</strong>;
  }

  return (
    <div className={`addsub-equation-row${graded ? (rowCorrect ? " is-correct" : " is-wrong") : ""}`}>
      {number("left")}
      <span>{equation.operator}</span>
      {number("right")}
      <span>=</span>
      {number("result")}
      {!answerSheet && equation.hidden.length > 0 && graded && (
        <span className={`counting-result ${rowCorrect ? "correct" : "wrong"}`} role="status">
          {rowCorrect ? "맞음" : "틀림"}
        </span>
      )}
    </div>
  );
}

export function AdditionSubtractionWorksheet({ variant }: { variant: AdditionSubtractionVariant }) {
  const title =
    variant === "two-digit"
      ? "덧셈뺄셈②"
      : variant === "within-twenty"
        ? "덧셈뺄셈③"
        : variant === "missing-parts"
          ? "덧셈뺄셈④"
          : "덧셈뺄셈①";
  const maxLength = variant === "single-digit" ? 1 : 2;
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED, variant));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 16) / 794, (window.innerHeight - 68) / 1123, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const expected = useMemo(() => expectedEntries(questionSet), [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, value]) => [id, answers[id] === value])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0, variant));
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderSheet(answerSheet: boolean) {
    const columns = [questionSet.additions, questionSet.subtractions, questionSet.mixed];
    return (
      <div className={`a4-sheet counting-sheet addsub-sheet${variant === "single-digit" ? "" : " two-digit"}`} style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>1학년</span>
            <strong>{title}{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>

        <div className="addsub-columns">
          {columns.map((equations, columnIndex) => (
            <section className={`addsub-column column-${columnIndex + 1}`} key={columnIndex} aria-label={`${columnIndex + 1}단`}>
              {equations.map((equation) => (
                <EquationRow
                  key={equation.id}
                  equation={equation}
                  answerSheet={answerSheet}
                  answers={answers}
                  results={results}
                  onAnswer={updateAnswer}
                  maxLength={maxLength}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page addsub-page">
      <div className="counting-toolbar addsub-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/30 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
          <div className="print-control">
            <button className="button ghost print-button" type="button" aria-expanded={printMenuOpen} aria-haspopup="menu" onClick={() => setPrintMenuOpen((open) => !open)}>인쇄</button>
            {printMenuOpen && (
              <div className="print-menu" role="menu" aria-label="인쇄 자료 선택">
                <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
              </div>
            )}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>

      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label={`A4 ${title} 문제지`}>
        {renderSheet(false)}
      </div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label={`A4 ${title} 전체 답지`}>
        {renderSheet(true)}
      </div>
    </main>
  );
}

export default function AdditionSubtractionOnePage() {
  return <AdditionSubtractionWorksheet variant="single-digit" />;
}
