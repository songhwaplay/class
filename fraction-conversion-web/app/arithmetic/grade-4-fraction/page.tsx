"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Operator = "+" | "−";
type FractionValue = { whole: number; numerator: number; denominator: number };
type Problem = { id: string; operator: Operator; left: FractionValue; right: FractionValue; answer: FractionValue };
type ProblemSet = { seed: number; problems: Problem[] };
type Answer = { whole: string; numerator: string; denominator: string };

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

function value(whole: number, numerator: number, denominator: number): FractionValue {
  return { whole, numerator, denominator };
}

function createProblem(id: number, operator: Operator, left: FractionValue, right: FractionValue): Problem {
  const denominator = left.denominator || right.denominator;
  const leftUnits = left.whole * denominator + left.numerator;
  const rightUnits = right.whole * denominator + right.numerator;
  const resultUnits = operator === "+" ? leftUnits + rightUnits : leftUnits - rightUnits;
  return {
    id: `grade-four-fraction-${id}`,
    operator,
    left,
    right,
    answer: value(Math.floor(resultUnits / denominator), resultUnits % denominator, denominator),
  };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: Problem[] = [];

  // ① 대분수 + 자연수
  let denominator = integer(next, 3, 9);
  problems.push(createProblem(0, "+",
    value(integer(next, 2, 9), integer(next, 1, denominator - 1), denominator),
    value(integer(next, 2, 9), 0, denominator),
  ));

  // ② 자연수 + 대분수
  denominator = integer(next, 3, 9);
  problems.push(createProblem(1, "+",
    value(integer(next, 2, 9), 0, denominator),
    value(integer(next, 2, 9), integer(next, 1, denominator - 1), denominator),
  ));

  // ③ 분자끼리 더하면 분모보다 큰 대분수 덧셈
  denominator = integer(next, 3, 9);
  problems.push(createProblem(2, "+",
    value(integer(next, 2, 9), integer(next, 1, denominator - 1), denominator),
    value(integer(next, 2, 9), integer(next, 1, denominator - 1), denominator),
  ));

  // ④ 분수 부분의 합이 1인 대분수 덧셈
  denominator = integer(next, 3, 9);
  let numerator = integer(next, 1, denominator - 1);
  problems.push(createProblem(3, "+",
    value(integer(next, 2, 9), numerator, denominator),
    value(integer(next, 2, 9), denominator - numerator, denominator),
  ));

  // ⑤ 받아올림이 생기는 대분수 덧셈
  denominator = integer(next, 3, 9);
  numerator = integer(next, 1, denominator - 1);
  problems.push(createProblem(4, "+",
    value(integer(next, 2, 9), numerator, denominator),
    value(integer(next, 2, 9), integer(next, numerator, denominator - 1), denominator),
  ));

  // ⑥ 자연수 - 대분수
  denominator = integer(next, 3, 9);
  const whole = integer(next, 4, 9);
  problems.push(createProblem(5, "−",
    value(whole, 0, denominator),
    value(integer(next, 1, whole - 2), integer(next, 1, denominator - 1), denominator),
  ));

  // ⑦ 대분수 - 자연수
  denominator = integer(next, 3, 9);
  const leftWhole = integer(next, 2, 9);
  problems.push(createProblem(6, "−",
    value(leftWhole, integer(next, 1, denominator - 1), denominator),
    value(integer(next, 1, leftWhole - 1), 0, denominator),
  ));

  // ⑧ 받아내림이 없는 대분수 뺄셈
  denominator = integer(next, 3, 9);
  const leftNumerator = integer(next, 2, denominator - 1);
  const minuendWhole = integer(next, 2, 9);
  problems.push(createProblem(7, "−",
    value(minuendWhole, leftNumerator, denominator),
    value(integer(next, 1, minuendWhole - 1), integer(next, 1, leftNumerator - 1), denominator),
  ));

  // ⑨⑩ 받아내림이 있는 대분수 뺄셈
  for (let index = 8; index < 10; index += 1) {
    denominator = integer(next, 4, 9);
    const minuendWhole = integer(next, 4, 9);
    problems.push(createProblem(index, "−",
      value(minuendWhole, integer(next, 1, 2), denominator),
      value(integer(next, 1, minuendWhole - 2), integer(next, 3, denominator - 1), denominator),
    ));
  }

  return { seed, problems };
}

function FractionStack({ numerator, denominator, className = "" }: { numerator: ReactNode; denominator: ReactNode; className?: string }) {
  return (
    <span className={`grade-four-fraction-stack ${className}`}>
      <span className="grade-four-fraction-number">{numerator}</span>
      <span className="grade-four-fraction-line" aria-hidden="true" />
      <span className="grade-four-fraction-number">{denominator}</span>
    </span>
  );
}

function MixedValue({ fraction }: { fraction: FractionValue }) {
  return (
    <span className="grade-four-fraction-value">
      <strong>{fraction.whole}</strong>
      {fraction.numerator > 0 && <FractionStack numerator={fraction.numerator} denominator={fraction.denominator} />}
    </span>
  );
}

export default function GradeFourFractionPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
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

  const problems = useMemo(() => questionSet.problems, [questionSet]);
  const completed = Object.values(answers).filter((answer) => answer.whole || answer.numerator || answer.denominator).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, field: keyof Answer, input: string) {
    const maximumLength = field === "whole" ? 2 : 1;
    setAnswers((current) => ({
      ...current,
      [id]: {
        whole: current[id]?.whole ?? "",
        numerator: current[id]?.numerator ?? "",
        denominator: current[id]?.denominator ?? "",
        [field]: input.replace(/[^0-9]/g, "").slice(0, maximumLength),
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
      const fractionCorrect = problem.answer.numerator === 0
        ? (!answer?.numerator || answer.numerator === "0") && (!answer?.denominator || answer.denominator === String(problem.answer.denominator))
        : answer?.numerator === String(problem.answer.numerator) && answer?.denominator === String(problem.answer.denominator);
      return [problem.id, answer?.whole === String(problem.answer.whole) && fractionCorrect];
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

  function renderAnswer(problem: Problem, answerSheet: boolean) {
    if (answerSheet) return <span className="grade-four-fraction-static-answer"><MixedValue fraction={problem.answer} /></span>;
    const answer = answers[problem.id] ?? { whole: "", numerator: "", denominator: "" };
    return (
      <span className="grade-four-fraction-answer">
        <input className="grade-four-fraction-whole-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answer.whole} onChange={(event) => updateAnswer(problem.id, "whole", event.target.value)} aria-label={`${problem.id} 자연수 부분`} />
        <FractionStack
          className="answer"
          numerator={<input className="grade-four-fraction-part-input numerator" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={answer.numerator} onChange={(event) => updateAnswer(problem.id, "numerator", event.target.value)} aria-label={`${problem.id} 분자`} />}
          denominator={<input className="grade-four-fraction-part-input denominator" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={answer.denominator} onChange={(event) => updateAnswer(problem.id, "denominator", event.target.value)} aria-label={`${problem.id} 분모`} />}
        />
      </span>
    );
  }

  function renderProblem(problem: Problem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-four-fraction-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-four-fraction-question" key={problem.id}>
        <span className="grade-four-fraction-index">{index + 1}</span>
        <div className="grade-four-fraction-expression">
          <MixedValue fraction={problem.left} />
          <span className="grade-four-fraction-operator">{problem.operator}</span>
          <MixedValue fraction={problem.right} />
          <span>=</span>
          {renderAnswer(problem, answerSheet)}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-four-fraction-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>4학년</span><strong>분수{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="grade-four-fraction-columns">
          {[questionSet.problems.slice(0, 5), questionSet.problems.slice(5)].map((column, columnIndex) => (
            <div className="grade-four-fraction-column" key={columnIndex}>
              {column.map((problem, index) => renderProblem(problem, columnIndex * 5 + index, answerSheet))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/10 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 분수 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 분수 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
