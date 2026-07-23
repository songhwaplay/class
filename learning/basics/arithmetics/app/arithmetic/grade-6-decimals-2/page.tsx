"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createGradeSixDecimalTwoSet,
} from "../../../lib/grade-six-decimal-two";
import type {
  GradeSixDecimalTwoProblem,
  GradeSixDecimalTwoSection,
} from "../../../lib/grade-six-decimal-two";
import { matchesDecimalAnswer, sanitizeDecimalInput } from "../../../lib/grade-five-decimals";

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260721;
const SECTIONS: { id: GradeSixDecimalTwoSection; title: string; guide: string }[] = [
  { id: "multiplication", title: "소수의 곱셈", guide: "계산하세요." },
  { id: "hundredths", title: "소수 둘째 자리까지 반올림", guide: "몫을 소수 둘째 자리까지 나타내세요." },
  { id: "tenths", title: "소수 둘째 자리에서 반올림", guide: "몫을 소수 둘째 자리에서 반올림하세요." },
];

function moveOnEnter(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-grade-six-decimal-two-input="true"]'));
  const index = inputs.indexOf(event.currentTarget);
  if (index < 0) return;
  event.preventDefault();
  inputs[(index + 1) % inputs.length]?.focus();
}

export default function GradeSixDecimalTwoPage() {
  const [seed, setSeed] = useState(INITIAL_SEED);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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

  const problems = useMemo(() => createGradeSixDecimalTwoSet(seed).problems, [seed]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: sanitizeDecimalInput(value, 8) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, matchesDecimalAnswer(answers[problem.id], problem.answer)])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
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

  function renderAnswer(problem: GradeSixDecimalTwoProblem, answerSheet: boolean, index: number) {
    if (answerSheet) return <strong className="grade-six-decimal-two-static-answer">{problem.answer}</strong>;
    return (
      <input
        className="grade-six-decimal-two-input"
        type="text"
        inputMode="decimal"
        maxLength={8}
        value={answers[problem.id] ?? ""}
        onChange={(event) => updateAnswer(problem.id, event.target.value)}
        onKeyDown={moveOnEnter}
        data-grade-six-decimal-two-input="true"
        aria-label={`${index + 1}번 답`}
      />
    );
  }

  function renderProblem(problem: GradeSixDecimalTwoProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-six-decimal-two-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-six-decimal-two-question" key={problem.id}>
        <span className="grade-six-decimal-two-index">{index + 1}</span>
        <div className="grade-six-decimal-two-expression">
          <strong>{problem.left}</strong><span>{problem.operator}</span><strong>{problem.right}</strong><span>=</span>
          {renderAnswer(problem, answerSheet, index)}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-six-decimal-two-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>6학년</span><strong>소수②{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <div className="grade-six-decimal-two-sections">
          {SECTIONS.map((section) => (
            <section className={`grade-six-decimal-two-section ${section.id}`} key={section.id}>
              <header><strong>{section.title}</strong><span>{section.guide}</span></header>
              <div className="grade-six-decimal-two-grid">
                {problems.map((problem, index) => problem.section === section.id ? renderProblem(problem, index, answerSheet) : null)}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/12 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 6학년 소수② 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 6학년 소수② 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
