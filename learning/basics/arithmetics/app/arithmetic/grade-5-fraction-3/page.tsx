"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  createGradeFiveFractionThreeSet,
} from "../../../lib/grade-five-fraction-three";
import type {
  FractionComparisonSign,
  FractionComparisonValue,
  GradeFiveFractionThreeProblem,
} from "../../../lib/grade-five-fraction-three";

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260721;
const COMPARISON_SIGNS: FractionComparisonSign[] = ["<", "=", ">"];

function FractionStack({ numerator, denominator }: { numerator: ReactNode; denominator: ReactNode }) {
  return (
    <span className="grade-five-fraction-one-stack">
      <span className="grade-five-fraction-one-number">{numerator}</span>
      <span className="grade-five-fraction-one-line" aria-hidden="true" />
      <span className="grade-five-fraction-one-number">{denominator}</span>
    </span>
  );
}

function FractionValue({ value }: { value: FractionComparisonValue }) {
  return (
    <span className="grade-five-fraction-one-value grade-five-fraction-three-value">
      <FractionStack numerator={value.numerator} denominator={value.denominator} />
    </span>
  );
}

export default function GradeFiveFractionThreePage() {
  const [seed, setSeed] = useState(INITIAL_SEED);
  const [answers, setAnswers] = useState<Record<string, FractionComparisonSign>>({});
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

  const problemSet = useMemo(() => createGradeFiveFractionThreeSet(seed), [seed]);
  const problems = useMemo(() => problemSet.problems, [problemSet]);
  const completed = Object.keys(answers).length;
  const correct = Object.values(results).filter(Boolean).length;

  function chooseAnswer(id: string, answer: FractionComparisonSign) {
    setAnswers((current) => ({ ...current, [id]: answer }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, answers[problem.id] === problem.answer])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("고른 답이 사라집니다. 새 문제를 만들까요?")) return;
    setSeed((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderAnswer(problem: GradeFiveFractionThreeProblem, answerSheet: boolean) {
    if (answerSheet) {
      return <span className="grade-five-fraction-three-static-answer">{problem.answer}</span>;
    }
    return (
      <span className="grade-five-fraction-three-choices" role="group" aria-label={`${problem.id} 비교 기호`}>
        {COMPARISON_SIGNS.map((sign) => (
          <button
            className={`grade-five-fraction-three-choice${answers[problem.id] === sign ? " is-selected" : ""}`}
            type="button"
            aria-label={`${problem.id} ${sign} 선택`}
            aria-pressed={answers[problem.id] === sign}
            onClick={() => chooseAnswer(problem.id, sign)}
            key={sign}
          >
            {sign}
          </button>
        ))}
      </span>
    );
  }

  function renderProblem(problem: GradeFiveFractionThreeProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-five-fraction-one-question grade-five-fraction-three-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-five-fraction-three-question" key={problem.id}>
        <span className="grade-five-fraction-one-index">{index + 1}</span>
        <div className="grade-five-fraction-three-expression">
          <FractionValue value={problem.left} />
          {renderAnswer(problem, answerSheet)}
          <FractionValue value={problem.right} />
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-five-fraction-one-sheet grade-five-fraction-three-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>5학년</span><strong>분수③{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <p className="grade-five-fraction-one-guide">두 분수의 크기를 비교해 &lt;, =, &gt; 중 알맞은 기호를 선택하세요.</p>
        <div className="grade-five-fraction-one-columns grade-five-fraction-three-columns">
          {[problems.slice(0, 5), problems.slice(5)].map((column, columnIndex) => (
            <div className="grade-five-fraction-one-column" key={columnIndex}>
              {column.map((problem, rowIndex) => renderProblem(problem, columnIndex * 5 + rowIndex, answerSheet))}
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
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 고르기</button>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 분수③ 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 분수③ 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
