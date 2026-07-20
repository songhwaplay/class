"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Operator = "+" | "−";
type TimePart = "hours" | "minutes" | "seconds";
type TimeValue = { hours: number; minutes: number; seconds: number };
type TimeProblem = { id: string; operator: Operator; parts: TimePart[]; left: TimeValue; right: TimeValue; result: TimeValue };
type ProblemSet = { seed: number; problems: TimeProblem[] };

const INITIAL_SEED = 20260720;
const UNIT_LABELS: Record<TimePart, string> = { hours: "시간", minutes: "분", seconds: "초" };

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

function value(hours = 0, minutes = 0, seconds = 0): TimeValue {
  return { hours, minutes, seconds };
}

function makeProblem(id: string, operator: Operator, parts: TimePart[], left: TimeValue, right: TimeValue): TimeProblem {
  const leftTotal = left.hours * 3600 + left.minutes * 60 + left.seconds;
  const rightTotal = right.hours * 3600 + right.minutes * 60 + right.seconds;
  const total = operator === "+" ? leftTotal + rightTotal : leftTotal - rightTotal;
  return {
    id,
    operator,
    parts,
    left,
    right,
    result: value(Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60),
  };
}

function hoursMinutesAddition(next: () => number, id: string) {
  return makeProblem(id, "+", ["hours", "minutes"], value(integer(next, 1, 12), integer(next, 1, 59)), value(integer(next, 1, 11), integer(next, 30, 59)));
}

function minutesSecondsSubtraction(next: () => number, id: string, narrow = false) {
  const leftMinutes = narrow ? integer(next, 11, 16) : integer(next, 30, 59);
  return makeProblem(id, "−", ["minutes", "seconds"], value(0, leftMinutes, integer(next, 1, 40)), value(0, integer(next, narrow ? 9 : leftMinutes - 9, leftMinutes - 1), integer(next, 30, 59)));
}

function hoursMinutesSubtraction(next: () => number, id: string) {
  const leftHours = integer(next, 4, 8);
  return makeProblem(id, "−", ["hours", "minutes"], value(leftHours, integer(next, 1, 40)), value(integer(next, 1, leftHours - 1), integer(next, 30, 60)));
}

function minutesSecondsAddition(next: () => number, id: string) {
  return makeProblem(id, "+", ["minutes", "seconds"], value(0, integer(next, 1, 59), integer(next, 1, 59)), value(0, integer(next, 30, 59), integer(next, 30, 59)));
}

function mixedSubtractions(next: () => number): TimeProblem[] {
  const firstLeftHours = integer(next, 4, 11);
  const firstLeftSeconds = integer(next, 1, 20);
  const secondLeftHours = integer(next, 4, 11);
  const secondLeftMinutes = integer(next, 1, 20);
  return [
    makeProblem("grade-three-time-two-mixed-0", "−", ["hours", "minutes", "seconds"], value(firstLeftHours, 0, firstLeftSeconds), value(integer(next, 1, firstLeftHours - 1), integer(next, firstLeftSeconds + 1, 59), 0)),
    makeProblem("grade-three-time-two-mixed-1", "−", ["hours", "minutes", "seconds"], value(secondLeftHours, secondLeftMinutes, 0), value(integer(next, 1, secondLeftHours), 0, integer(next, secondLeftMinutes + 1, 59))),
  ];
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  return {
    seed,
    problems: [
      hoursMinutesAddition(next, "grade-three-time-two-hm-add-0"),
      minutesSecondsSubtraction(next, "grade-three-time-two-ms-subtract-0"),
      hoursMinutesSubtraction(next, "grade-three-time-two-hm-subtract-0"),
      minutesSecondsAddition(next, "grade-three-time-two-ms-add-0"),
      hoursMinutesAddition(next, "grade-three-time-two-hm-add-1"),
      minutesSecondsSubtraction(next, "grade-three-time-two-ms-subtract-1", true),
      ...mixedSubtractions(next),
    ],
  };
}

export default function GradeThreeTimeTwoPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
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

  const expected = useMemo(() => questionSet.problems.map((problem) => [problem.id, problem.parts.map((part) => String(problem.result[part]))] as const), [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, part: TimePart, answer: string) {
    setAnswers((current) => ({ ...current, [`${id}-${part}`]: answer.replace(/[^0-9]/g, "").slice(0, 2) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, values]) => [id, questionSet.problems.find((problem) => problem.id === id)!.parts.every((part, index) => answers[`${id}-${part}`] === values[index])] )));
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

  function renderValue(problem: TimeProblem, time: TimeValue) {
    return <div className={`time-calculation-value ${problem.parts.length === 2 ? "two" : "three"}`}>{problem.parts.map((part) => <span key={part} style={{ display: "contents" }}><strong>{time[part]}</strong><span>{UNIT_LABELS[part]}</span></span>)}</div>;
  }

  function renderAnswer(problem: TimeProblem, answerSheet: boolean) {
    return (
      <div className={`time-calculation-value ${problem.parts.length === 2 ? "two" : "three"}`}>
        {problem.parts.map((part) => <span key={part} style={{ display: "contents" }}>
          {answerSheet
            ? <strong className="time-calculation-static">{problem.result[part]}</strong>
            : <input className="time-calculation-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={answers[`${problem.id}-${part}`] ?? ""} onChange={(event) => updateAnswer(problem.id, part, event.target.value)} aria-label={`${problem.id} ${UNIT_LABELS[part]} 답`} />}
          <span>{UNIT_LABELS[part]}</span>
        </span>)}
      </div>
    );
  }

  function renderProblem(problem: TimeProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`time-calculation-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-three-time-two-question" key={problem.id}>
        <span className="time-calculation-number">{index + 1}</span>
        <div className="time-calculation-line"><b aria-hidden="true" />{renderValue(problem, problem.left)}</div>
        <div className="time-calculation-line"><b>{problem.operator}</b>{renderValue(problem, problem.right)}</div>
        <span className="time-calculation-rule" aria-hidden="true" />
        <div className="time-calculation-line"><b aria-hidden="true" />{renderAnswer(problem, answerSheet)}</div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet time-calculation-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>시간②{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="time-calculation-grid">{questionSet.problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page time-calculation-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/8 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 시간② 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 시간② 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
