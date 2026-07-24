"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { moveBetweenFractionAnswerInputs } from "../../components/fraction-answer-navigation";

type PrintMode = "worksheet" | "answers" | "both";
type ValueProblem = { id: string; kind: "value"; whole: number; numerator: number; denominator: number; answer: number };
type RelationProblem = { id: string; kind: "relation"; whole: number; part: number; selected: number; numerator: number; denominator: number };
type Problem = ValueProblem | RelationProblem;
type ProblemSet = { seed: number; valueProblems: ValueProblem[]; relationProblems: RelationProblem[] };
type Answer = { value: string; numerator: string; denominator: string };

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

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const valueProblems = Array.from({ length: 10 }, (_, index): ValueProblem => {
    const numerator = integer(next, 1, 8);
    const denominator = integer(next, numerator + 1, 9);
    const unit = integer(next, 1, 9);
    return {
      id: `grade-three-fraction-value-${index}`,
      kind: "value",
      whole: unit * denominator,
      numerator,
      denominator,
      answer: unit * numerator,
    };
  });
  const relationProblems = Array.from({ length: 5 }, (_, index): RelationProblem => {
    const numerator = integer(next, 1, 3);
    const denominator = integer(next, numerator + 1, 4);
    const part = integer(next, 2, 12);
    return {
      id: `grade-three-fraction-relation-${index}`,
      kind: "relation",
      whole: part * denominator,
      part,
      selected: part * numerator,
      numerator,
      denominator,
    };
  });
  return { seed, valueProblems, relationProblems };
}

function vowelEnding(number: number) {
  return [2, 4, 5, 9].includes(number % 10);
}

function FractionStack({ numerator, denominator, className = "", inputOrder = false }: { numerator: ReactNode; denominator: ReactNode; className?: string; inputOrder?: boolean }) {
  return (
    <span className={`grade-three-fraction-stack ${className}${inputOrder ? " input-order" : ""}`}>
      {inputOrder ? (
        <>
          <span className="grade-three-fraction-number denominator-slot">{denominator}</span>
          <span className="grade-three-fraction-line" aria-hidden="true" />
          <span className="grade-three-fraction-number numerator-slot">{numerator}</span>
        </>
      ) : (
        <>
          <span className="grade-three-fraction-number">{numerator}</span>
          <span className="grade-three-fraction-line" aria-hidden="true" />
          <span className="grade-three-fraction-number">{denominator}</span>
        </>
      )}
    </span>
  );
}

export default function GradeThreeFractionOnePage() {
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

  const problems = useMemo<Problem[]>(() => [...questionSet.valueProblems, ...questionSet.relationProblems], [questionSet]);
  const completed = problems.filter((problem) => {
    const answer = answers[problem.id];
    return problem.kind === "value" ? Boolean(answer?.value) : Boolean(answer?.numerator && answer?.denominator);
  }).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, field: keyof Answer, value: string) {
    setAnswers((current) => ({
      ...current,
      [id]: {
        value: current[id]?.value ?? "",
        numerator: current[id]?.numerator ?? "",
        denominator: current[id]?.denominator ?? "",
        [field]: value.replace(/[^0-9]/g, "").slice(0, field === "value" ? 2 : 1),
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
      const isCorrect = problem.kind === "value"
        ? answer?.value === String(problem.answer)
        : answer?.numerator === String(problem.numerator) && answer?.denominator === String(problem.denominator);
      return [problem.id, isCorrect];
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

  function resultClass(problem: Problem) {
    if (!(problem.id in results)) return "";
    return results[problem.id] ? " is-correct" : " is-wrong";
  }

  function renderValueProblem(problem: ValueProblem, index: number, answerSheet: boolean) {
    const answer = answers[problem.id] ?? { value: "", numerator: "", denominator: "" };
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-three-fraction-question value${resultClass(problem)}`} data-testid="grade-three-fraction-question" key={problem.id}>
        <span className="grade-three-fraction-index">{index + 1}</span>
        <span className="grade-three-fraction-word"><strong>{problem.whole}</strong>의</span>
        <span className="grade-three-fraction-word">
          <FractionStack numerator={problem.numerator} denominator={problem.denominator} />
          {[1, 3, 6, 7, 8].includes(problem.numerator) ? "은" : "는"}
        </span>
        {answerSheet
          ? <strong className="grade-three-fraction-static">{problem.answer}</strong>
          : <input className="grade-three-fraction-value-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answer.value} onChange={(event) => updateAnswer(problem.id, "value", event.target.value)} data-fraction-answer-input="true" onKeyDown={moveBetweenFractionAnswerInputs} aria-label={`${index + 1}번 답`} />}
        {!answerSheet && problem.id in results && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderRelationProblem(problem: RelationProblem, index: number, answerSheet: boolean) {
    const answer = answers[problem.id] ?? { value: "", numerator: "", denominator: "" };
    const isCorrect = results[problem.id] === true;
    const fraction = answerSheet
      ? <FractionStack className="grade-three-fraction-static" numerator={problem.numerator} denominator={problem.denominator} />
      : <FractionStack
          className="grade-three-fraction-answer"
          inputOrder
          numerator={<input className="grade-three-fraction-part-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={answer.numerator} onChange={(event) => updateAnswer(problem.id, "numerator", event.target.value)} data-fraction-answer-input="true" onKeyDown={moveBetweenFractionAnswerInputs} aria-label={`${index + 1}번 분자 답`} />}
          denominator={<input className="grade-three-fraction-part-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={answer.denominator} onChange={(event) => updateAnswer(problem.id, "denominator", event.target.value)} data-fraction-answer-input="true" onKeyDown={moveBetweenFractionAnswerInputs} aria-label={`${index + 1}번 분모 답`} />}
        />;
    return (
      <div className={`multiplication-question grade-three-fraction-question relation${resultClass(problem)}`} data-testid="grade-three-fraction-question" key={problem.id}>
        <span className="grade-three-fraction-index">{index + 1}</span>
        <span className="grade-three-fraction-sentence">
          <span className="grade-three-fraction-word"><strong>{problem.whole}</strong>{vowelEnding(problem.whole) ? "를" : "을"}</span>
          <span className="grade-three-fraction-word"><strong>{problem.part}</strong>씩</span>
          <span>묶으면</span>
          <span className="grade-three-fraction-word"><strong>{problem.selected}</strong>{vowelEnding(problem.selected) ? "는" : "은"}</span>
          <span className="grade-three-fraction-word"><strong>{problem.whole}</strong>의</span>
          <span className="grade-three-fraction-word">{fraction}입니다.</span>
        </span>
        {!answerSheet && problem.id in results && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-three-fraction-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>분수①{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="grade-three-fraction-content">
          <div className="grade-three-fraction-value-grid">{questionSet.valueProblems.map((problem, index) => renderValueProblem(problem, index, answerSheet))}</div>
          <div className="grade-three-fraction-relation-grid">{questionSet.relationProblems.map((problem, index) => renderRelationProblem(problem, index + 10, answerSheet))}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/15 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 분수① 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 분수① 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
