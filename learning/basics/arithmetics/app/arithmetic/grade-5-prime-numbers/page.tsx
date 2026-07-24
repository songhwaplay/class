"use client";

import { useEffect, useState } from "react";
import {
  gradePrimeNumberSelection,
  HUNDRED_CHART_NUMBERS,
  isPrimeNumberTo100,
} from "../../../lib/prime-number-hundred-chart";

type PrintMode = "worksheet" | "answers" | "both";

export default function GradeFivePrimeNumbersPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(() => new Set());
  const [results, setResults] = useState<Record<number, boolean>>({});
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

  const correct = Object.values(results).filter(Boolean).length;

  function toggleNumber(number: number) {
    setSelectedNumbers((current) => {
      const next = new Set(current);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
    setResults((current) => {
      if (!(number in current)) return current;
      const next = { ...current };
      delete next[number];
      return next;
    });
  }

  function checkAll() {
    setResults(gradePrimeNumberSelection(selectedNumbers));
  }

  function resetAnswers() {
    setSelectedNumbers(new Set());
    setResults({});
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderNumber(number: number, answerSheet: boolean) {
    const isPrime = isPrimeNumberTo100(number);
    const selected = answerSheet ? isPrime : selectedNumbers.has(number);
    const graded = !answerSheet && number in results;
    const isCorrect = results[number] === true;
    const className = `prime-number-question${selected ? " is-selected" : ""}${answerSheet && isPrime ? " is-prime" : ""}${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`;
    const contents = (
      <>
        <span className="prime-number-value">{number}</span>
        {!answerSheet && graded && <span className="prime-number-result" role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </>
    );

    return answerSheet ? (
      <div className={className} data-testid="prime-number-question" key={number}>{contents}</div>
    ) : (
      <button
        className={className}
        data-testid="prime-number-question"
        type="button"
        aria-label={`${number}, ${selected ? "선택됨" : "선택 안 됨"}`}
        aria-pressed={selected}
        onClick={() => toggleNumber(number)}
        key={number}
      >
        {contents}
      </button>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet prime-number-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>5학년</span><strong>소수(素數) 찾기{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>1~100</small></div>
        </header>
        <p className="prime-number-guide">소수(素數, prime number)는 1보다 큰 자연수 중 약수가 1과 자기 자신뿐인 수입니다. 모두 찾아 ○표 하세요.</p>
        <div className="prime-number-grid">
          {HUNDRED_CHART_NUMBERS.map((number) => renderNumber(number, answerSheet))}
        </div>
        {!answerSheet && <p className="prime-number-selection-count">선택한 수 <strong>{selectedNumbers.size}</strong>개</p>}
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/100 정답</small></strong></div>
        <div className="toolbar">
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 하기</button>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 프라임넘버 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 5학년 프라임넘버 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
