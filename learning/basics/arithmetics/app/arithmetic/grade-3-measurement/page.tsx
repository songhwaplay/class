"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Operator = "+" | "−";
type Range = readonly [number, number];
type Quantity = { major: number; minor: number };
type Problem = {
  id: string;
  majorUnit: "kg" | "L";
  minorUnit: "g" | "mL";
  operator: Operator;
  left: Quantity;
  right: Quantity;
  answer: Quantity;
};
type ProblemSet = { seed: number; problems: Problem[] };
type Answer = { major: string; minor: string };

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

function integer(next: () => number, [minimum, maximum]: Range) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function quantity(next: () => number, majorRange: Range, minorRange: Range): Quantity {
  return { major: integer(next, majorRange), minor: integer(next, minorRange) };
}

function twoDigitMajor(next: () => number, highRange: Range, lowRange: Range) {
  return integer(next, highRange) * 10 + integer(next, lowRange);
}

function makeProblem(id: string, majorUnit: "kg" | "L", operator: Operator, left: Quantity, right: Quantity): Problem {
  const leftTotal = left.major * 1000 + left.minor;
  const rightTotal = right.major * 1000 + right.minor;
  const total = operator === "+" ? leftTotal + rightTotal : leftTotal - rightTotal;
  return {
    id,
    majorUnit,
    minorUnit: majorUnit === "kg" ? "g" : "mL",
    operator,
    left,
    right,
    answer: { major: Math.floor(total / 1000), minor: total % 1000 },
  };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const firstKgLeft = quantity(next, [1, 9], [1, 666]);
  const firstLLeft = quantity(next, [1, 9], [100, 999]);
  const firstKgSubtractLeft = quantity(next, [2, 9], [1, 500]);
  const middleKgLeft = { major: twoDigitMajor(next, [5, 9], [1, 4]), minor: integer(next, [1, 500]) };
  const middleKgRight = { major: twoDigitMajor(next, [1, 4], [4, 9]), minor: integer(next, [200, 999]) };
  const middleLLeft = quantity(next, [2, 5], [1, 500]);
  const middleLRight = quantity(next, [1, middleLLeft.major - 1], [200, 999]);
  const lastLLeft = quantity(next, [2, 5], [1, 500]);
  const lastLRight = quantity(next, [1, lastLLeft.major - 1], [200, 999]);
  const lastKgLeft = { major: twoDigitMajor(next, [5, 9], [1, 4]), minor: integer(next, [1, 500]) };
  const lastKgRight = { major: twoDigitMajor(next, [1, 4], [4, 9]), minor: integer(next, [200, 999]) };

  return {
    seed,
    problems: [
      makeProblem("measurement-0", "kg", "+", firstKgLeft, quantity(next, [5, 9], [666, 999])),
      makeProblem("measurement-1", "L", "+", firstLLeft, quantity(next, [5, 9], [666, 999])),
      makeProblem("measurement-2", "kg", "−", firstKgSubtractLeft, quantity(next, [1, firstKgSubtractLeft.major - 1], [200, 999])),
      makeProblem("measurement-3", "kg", "−", middleKgLeft, middleKgRight),
      makeProblem("measurement-4", "L", "−", middleLLeft, middleLRight),
      makeProblem("measurement-5", "L", "−", lastLLeft, lastLRight),
      makeProblem("measurement-6", "kg", "+", quantity(next, [1, 9], [1, 666]), quantity(next, [5, 9], [777, 999])),
      makeProblem("measurement-7", "L", "+", quantity(next, [1, 9], [100, 999]), quantity(next, [5, 9], [666, 999])),
      makeProblem("measurement-8", "kg", "−", lastKgLeft, lastKgRight),
    ],
  };
}

function expectedField(value: string | undefined, expected: number) {
  return expected === 0 ? value === "" || value === "0" : value === String(expected);
}

export default function GradeThreeMeasurementPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const problems = useMemo(() => questionSet.problems, [questionSet]);
  const completed = problems.filter((problem) => {
    const answer = answers[problem.id];
    return Boolean((problem.answer.major === 0 || answer?.major) && (problem.answer.minor === 0 || answer?.minor));
  }).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, field: keyof Answer, value: string) {
    setAnswers((current) => ({
      ...current,
      [id]: {
        major: current[id]?.major ?? "",
        minor: current[id]?.minor ?? "",
        [field]: value.replace(/[^0-9]/g, "").slice(0, field === "major" ? 2 : 3),
      },
    }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => {
      const answer = answers[problem.id];
      return [problem.id, expectedField(answer?.major, problem.answer.major) && expectedField(answer?.minor, problem.answer.minor)];
    })));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderQuantity(value: Quantity, problem: Problem) {
    return <span className="measurement-quantity"><strong>{value.major}</strong><span>{problem.majorUnit}</span><strong>{value.minor}</strong><span>{problem.minorUnit}</span></span>;
  }

  function renderProblem(problem: Problem, index: number, answerSheet: boolean) {
    const answer = answers[problem.id] ?? { major: "", minor: "" };
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question measurement-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="measurement-question" key={problem.id}>
        <span className="measurement-number">{index + 1}</span>
        <div className="measurement-operation">
          <div className="measurement-operand">{renderQuantity(problem.left, problem)}</div>
          <div className="measurement-operand"><b>{problem.operator}</b>{renderQuantity(problem.right, problem)}</div>
          <div className="measurement-rule" />
          {answerSheet
            ? <span className="measurement-static-answer"><strong>{problem.answer.major || ""}</strong><span>{problem.answer.major > 0 ? problem.majorUnit : ""}</span><strong>{problem.answer.minor || ""}</strong><span>{problem.answer.minor > 0 ? problem.minorUnit : ""}</span></span>
            : <span className="measurement-answer">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answer.major} onChange={(event) => updateAnswer(problem.id, "major", event.target.value)} aria-label={`${index + 1}번 ${problem.majorUnit} 답`} /><span>{problem.majorUnit}</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={answer.minor} onChange={(event) => updateAnswer(problem.id, "minor", event.target.value)} aria-label={`${index + 1}번 ${problem.minorUnit} 답`} /><span>{problem.minorUnit}</span>
              </span>}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet measurement-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>무게,들이{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="measurement-grid">{questionSet.problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/9 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
          <div className="print-control">
            <button className="button ghost print-button" type="button" aria-expanded={printMenuOpen} aria-haspopup="menu" onClick={() => setPrintMenuOpen((open) => !open)}>인쇄</button>
            {printMenuOpen && <div className="print-menu" role="menu" aria-label="인쇄 자료 선택">
              <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
              <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
              <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
            </div>}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 무게,들이 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 무게,들이 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
