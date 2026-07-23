"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type ReadingProblem = { id: string; number: number; answer: string };
type ProblemSet = { seed: number; sinoKorean: ReadingProblem[]; nativeKorean: ReadingProblem[] };

const INITIAL_SEED = 20260720;
const SINO_DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const NATIVE_TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const NATIVE_ONES = ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉"];

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

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function sinoKoreanReading(number: number) {
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  return `${tens === 1 ? "" : SINO_DIGITS[tens]}십${SINO_DIGITS[ones]}`;
}

function nativeKoreanReading(number: number) {
  return `${NATIVE_TENS[Math.floor(number / 10)]}${NATIVE_ONES[number % 10]}`;
}

function numberSequence(next: () => number) {
  const tens = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], next);
  const ones = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], next);
  return tens.map((ten, index) => ten * 10 + ones[index]);
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const sinoKorean = numberSequence(next).map((number, index) => ({
    id: `sino-${index}`,
    number,
    answer: sinoKoreanReading(number),
  }));
  const nativeKorean = numberSequence(next).map((number, index) => ({
    id: `native-${index}`,
    number,
    answer: nativeKoreanReading(number),
  }));
  return { seed, sinoKorean, nativeKorean };
}

function normalizeAnswer(value: string) {
  return value.normalize("NFC").replace(/\s+/g, "");
}

export default function NumberReadingOnePage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
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

  const allProblems = useMemo(
    () => [...questionSet.sinoKorean, ...questionSet.nativeKorean],
    [questionSet],
  );
  const completed = Object.values(answers).filter((value) => normalizeAnswer(value)).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.slice(0, 8) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(allProblems.map((problem) => [
      problem.id,
      normalizeAnswer(answers[problem.id] ?? "") === problem.answer,
    ])));
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

  function readingRow(problem: ReadingProblem, answerSheet: boolean) {
    const result = results[problem.id];
    return (
      <div
        className={`reading-row${result === true ? " is-correct" : result === false ? " is-wrong" : ""}`}
        data-testid="reading-row"
        key={problem.id}
      >
        <strong>{problem.number}</strong>
        <span>→</span>
        {answerSheet ? (
          <strong className="reading-static-answer">{problem.answer}</strong>
        ) : (
          <input
            className="reading-input"
            type="text"
            inputMode="text"
            maxLength={8}
            value={answers[problem.id] ?? ""}
            onChange={(event) => updateAnswer(problem.id, event.target.value)}
            aria-label={`${problem.id} 답`}
          />
        )}
        {!answerSheet && result !== undefined && (
          <span className={`counting-result ${result ? "correct" : "wrong"}`} role="status">
            {result ? "맞음" : "틀림"}
          </span>
        )}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet reading-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>1학년</span>
            <strong>수 읽기{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>

        <div className="reading-columns">
          <section className="reading-column sino" aria-label="한자(일 이 삼···)">
            <h2>▼ 한자(일 이 삼···)</h2>
            {questionSet.sinoKorean.map((problem) => readingRow(problem, answerSheet))}
          </section>
          <section className="reading-column native" aria-label="우리말(하나 둘 셋···)">
            <h2>▼ 우리말(하나 둘 셋···)</h2>
            {questionSet.nativeKorean.map((problem) => readingRow(problem, answerSheet))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page reading-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/18 정답</small></strong></div>
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

      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 수 읽기 문제지">
        {renderSheet(false)}
      </div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 수 읽기 전체 답지">
        {renderSheet(true)}
      </div>
    </main>
  );
}
