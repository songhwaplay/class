"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type TimeProblem = {
  id: string;
  major: number;
  minor: number;
  majorUnit: "시간" | "분";
  minorUnit: "분" | "초";
  answerUnit: "분" | "초";
  result: number;
};
type ProblemSet = { seed: number; problems: TimeProblem[] };

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

function makeProblem(id: string, major: number, minor: number, kind: "hours" | "minutes"): TimeProblem {
  return kind === "hours"
    ? { id, major, minor, majorUnit: "시간", minorUnit: "분", answerUnit: "분", result: major * 60 + minor }
    : { id, major, minor, majorUnit: "분", minorUnit: "초", answerUnit: "초", result: major * 60 + minor };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const hours = shuffle(Array.from({ length: 8 }, (_, index) => index + 1), next).slice(0, 6);
  const minutes = shuffle(Array.from({ length: 8 }, (_, index) => index + 1), next).slice(0, 6);
  const problems = Array.from({ length: 6 }, (_, index) => {
    const minimum = index % 2 === 0 ? 1 : 11;
    return [
      makeProblem(`grade-three-time-hours-${index}`, hours[index], integer(next, minimum, 59), "hours"),
      makeProblem(`grade-three-time-minutes-${index}`, minutes[index], integer(next, minimum, 59), "minutes"),
    ];
  }).flat();
  return { seed, problems };
}

export default function GradeThreeTimeOnePage() {
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

  const expected = useMemo(() => questionSet.problems.map((problem) => [problem.id, String(problem.result)] as const), [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 3) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, answer]) => [id, answers[id] === answer])));
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

  function renderProblem(problem: TimeProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`time-conversion-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-three-time-question" key={problem.id}>
        <span className="time-conversion-number">{index + 1}</span>
        <span className="time-conversion-expression"><strong>{problem.major}</strong>{problem.majorUnit} <strong>{problem.minor}</strong>{problem.minorUnit}</span>
        <span>=</span>
        {answerSheet
          ? <strong className="time-conversion-static">{problem.result}</strong>
          : <input className="time-conversion-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${problem.id} 답`} />}
        <span className="time-conversion-unit">{problem.answerUnit}</span>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet time-conversion-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>시간①{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="time-conversion-grid">{questionSet.problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page time-conversion-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/12 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 시간① 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 시간① 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
