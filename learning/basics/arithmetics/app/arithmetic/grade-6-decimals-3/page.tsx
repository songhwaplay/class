"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createGradeSixDecimalThreeSet,
} from "../../../lib/grade-six-decimal-three";
import type {
  GradeSixDecimalThreeProblem,
  GradeSixDecimalThreeSection,
} from "../../../lib/grade-six-decimal-three";
import { matchesDecimalAnswer, sanitizeDecimalInput } from "../../../lib/grade-five-decimals";

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260721;
const SECTIONS: { id: GradeSixDecimalThreeSection; title: string; guide: string }[] = [
  { id: "hundredths", title: "소수 둘째 자리까지 반올림", guide: "몫을 소수 둘째 자리까지 나타내세요." },
  { id: "tenths", title: "소수 둘째 자리에서 반올림", guide: "몫을 소수 둘째 자리에서 반올림하세요." },
  { id: "remainder", title: "몫 ··· 나머지", guide: "몫은 자연수로 구하고 나머지를 쓰세요." },
];

function moveOnEnter(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-grade-six-decimal-three-input="true"]'));
  const index = inputs.indexOf(event.currentTarget);
  if (index < 0) return;
  event.preventDefault();
  inputs[(index + 1) % inputs.length]?.focus();
}

function sanitizeWholeInput(value: string, maximumLength = 4) {
  return value.replace(/\D/g, "").slice(0, maximumLength);
}

export default function GradeSixDecimalThreePage() {
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

  const problems = useMemo(() => createGradeSixDecimalThreeSet(seed).problems, [seed]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(problemId: string, key: string, value: string, wholeNumber = false) {
    setAnswers((current) => ({ ...current, [key]: wholeNumber ? sanitizeWholeInput(value) : sanitizeDecimalInput(value, 8) }));
    setResults((current) => {
      if (!(problemId in current)) return current;
      const next = { ...current };
      delete next[problemId];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => {
      if (problem.section !== "remainder") {
        return [problem.id, matchesDecimalAnswer(answers[problem.id], problem.answer)];
      }
      return [problem.id,
        matchesDecimalAnswer(answers[`${problem.id}-quotient`], problem.answer)
        && matchesDecimalAnswer(answers[`${problem.id}-remainder`], problem.remainder ?? ""),
      ];
    })));
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

  function renderRoundedAnswer(problem: GradeSixDecimalThreeProblem, answerSheet: boolean, index: number) {
    if (answerSheet) {
      return <strong className="grade-six-decimal-two-static-answer grade-six-decimal-three-static-answer">{problem.answer}</strong>;
    }
    return (
      <input
        className="grade-six-decimal-two-input grade-six-decimal-three-input grade-six-decimal-three-rounded-input"
        type="text"
        inputMode="decimal"
        maxLength={8}
        value={answers[problem.id] ?? ""}
        onChange={(event) => updateAnswer(problem.id, problem.id, event.target.value)}
        onKeyDown={moveOnEnter}
        data-grade-six-decimal-three-input="true"
        aria-label={`${index + 1}번 답`}
      />
    );
  }

  function renderRemainderAnswer(problem: GradeSixDecimalThreeProblem, answerSheet: boolean, index: number) {
    if (answerSheet) {
      return (
        <span className="grade-six-decimal-three-remainder-answer">
          <strong className="grade-six-decimal-two-static-answer grade-six-decimal-three-static-answer quotient">{problem.answer}</strong>
          <span>···</span>
          <strong className="grade-six-decimal-two-static-answer grade-six-decimal-three-static-answer remainder">{problem.remainder}</strong>
        </span>
      );
    }
    const quotientKey = `${problem.id}-quotient`;
    const remainderKey = `${problem.id}-remainder`;
    return (
      <span className="grade-six-decimal-three-remainder-answer">
        <input
          className="grade-six-decimal-two-input grade-six-decimal-three-input quotient"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={answers[quotientKey] ?? ""}
          onChange={(event) => updateAnswer(problem.id, quotientKey, event.target.value, true)}
          onKeyDown={moveOnEnter}
          data-grade-six-decimal-three-input="true"
          aria-label={`${index + 1}번 몫`}
        />
        <span>···</span>
        <input
          className="grade-six-decimal-two-input grade-six-decimal-three-input remainder"
          type="text"
          inputMode="decimal"
          maxLength={4}
          value={answers[remainderKey] ?? ""}
          onChange={(event) => updateAnswer(problem.id, remainderKey, event.target.value)}
          onKeyDown={moveOnEnter}
          data-grade-six-decimal-three-input="true"
          aria-label={`${index + 1}번 나머지`}
        />
      </span>
    );
  }

  function renderProblem(problem: GradeSixDecimalThreeProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-six-decimal-two-question grade-six-decimal-three-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-six-decimal-three-question" key={problem.id}>
        <span className="grade-six-decimal-two-index grade-six-decimal-three-index">{index + 1}</span>
        <div className="grade-six-decimal-two-expression grade-six-decimal-three-expression">
          <strong>{problem.left}</strong><span>÷</span><strong>{problem.right}</strong><span>=</span>
          {problem.section === "remainder"
            ? renderRemainderAnswer(problem, answerSheet, index)
            : renderRoundedAnswer(problem, answerSheet, index)}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-six-decimal-two-sheet grade-six-decimal-three-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>6학년</span><strong>소수③{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <div className="grade-six-decimal-two-sections grade-six-decimal-three-sections">
          {SECTIONS.map((section) => (
            <section className={`grade-six-decimal-two-section grade-six-decimal-three-section ${section.id}`} key={section.id}>
              <header><strong>{section.title}</strong><span>{section.guide}</span></header>
              <div className="grade-six-decimal-two-grid grade-six-decimal-three-grid">
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 6학년 소수③ 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 6학년 소수③ 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
