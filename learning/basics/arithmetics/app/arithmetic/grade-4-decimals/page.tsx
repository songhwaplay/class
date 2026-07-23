"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Operator = "+" | "−";
type DecimalProblem = { id: string; operator: Operator; left: string; right: string; answer: string };
type ProblemSet = { seed: number; problems: DecimalProblem[] };

const INITIAL_SEED = 20260721;

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

function powerOfTen(places: number) {
  return 10 ** places;
}

function formatDecimal(units: number, places: number) {
  if (places === 0) return String(units);
  const factor = powerOfTen(places);
  const whole = Math.floor(units / factor);
  const fraction = String(units % factor).padStart(places, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function makeProblem(
  index: number,
  operator: Operator,
  leftUnits: number,
  leftPlaces: number,
  rightUnits: number,
  rightPlaces: number,
): DecimalProblem {
  const places = Math.max(leftPlaces, rightPlaces);
  const alignedLeft = leftUnits * powerOfTen(places - leftPlaces);
  const alignedRight = rightUnits * powerOfTen(places - rightPlaces);
  const answerUnits = operator === "+" ? alignedLeft + alignedRight : alignedLeft - alignedRight;
  return {
    id: `grade-four-decimal-${index}`,
    operator,
    left: formatDecimal(leftUnits, leftPlaces),
    right: formatDecimal(rightUnits, rightPlaces),
    answer: formatDecimal(answerUnits, places),
  };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: DecimalProblem[] = [];

  // ①② 소수 둘째 자리까지의 뺄셈
  for (let index = 0; index < 2; index += 1) {
    const left = integer(next, 2, 9999);
    problems.push(makeProblem(index, "−", left, 2, integer(next, 1, left - 1), 2));
  }

  // ③ 80, 90, 100에서 소수 둘째 자리 수 빼기
  const wholeTens = integer(next, 8, 10) * 10;
  problems.push(makeProblem(2, "−", wholeTens, 0, integer(next, 1, wholeTens * 100 - 1), 2));

  // ④ 소수 첫째 자리와 둘째 자리의 덧셈
  problems.push(makeProblem(3, "+", integer(next, 1, 999), 1, integer(next, 1, 9999), 2));

  // ⑤ 소수 첫째 자리와 셋째 자리의 덧셈
  problems.push(makeProblem(4, "+", integer(next, 1, 444), 1, integer(next, 1, 44444), 3));

  // ⑥ 자연수에서 소수 둘째 자리 수 빼기
  const whole = integer(next, 1, 12);
  problems.push(makeProblem(5, "−", whole, 0, integer(next, 1, whole * 100 - 1), 2));

  // ⑦ 소수 첫째 자리에서 소수 셋째 자리 수 빼기
  const tenths = integer(next, 1, 999);
  problems.push(makeProblem(6, "−", tenths, 1, integer(next, 1, tenths * 100 - 1), 3));

  // ⑧ 소수 둘째 자리까지의 덧셈
  problems.push(makeProblem(7, "+", integer(next, 1, 9999), 2, integer(next, 1, 9999), 2));

  return { seed, problems };
}

function sanitizeDecimal(value: string) {
  const filtered = value.replace(/[^0-9.]/g, "");
  const decimalIndex = filtered.indexOf(".");
  if (decimalIndex === -1) return filtered.slice(0, 7);
  return `${filtered.slice(0, decimalIndex + 1)}${filtered.slice(decimalIndex + 1).replace(/\./g, "")}`.slice(0, 7);
}

function matchesDecimal(value: string | undefined, expected: string) {
  if (!value || !/^\d+(?:\.\d+)?$/.test(value)) return false;
  return Number(value) === Number(expected);
}

export default function GradeFourDecimalsPage() {
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

  const problems = useMemo(() => questionSet.problems, [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: sanitizeDecimal(value) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [problem.id, matchesDecimal(answers[problem.id], problem.answer)])));
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

  function renderProblem(problem: DecimalProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question grade-four-decimal-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-four-decimal-question" key={problem.id}>
        <span className="grade-four-decimal-index">{index + 1}</span>
        <div className="grade-four-decimal-expression">
          <strong>{problem.left}</strong>
          <span>{problem.operator}</span>
          <strong>{problem.right}</strong>
          <span>=</span>
          {answerSheet
            ? <span className="grade-four-decimal-static-answer">{problem.answer}</span>
            : <input className="grade-four-decimal-input" type="text" inputMode="decimal" maxLength={7} value={answers[problem.id] ?? ""} onChange={(event) => updateAnswer(problem.id, event.target.value)} aria-label={`${problem.id} 답`} />}
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet grade-four-decimal-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>4학년</span><strong>소수{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="grade-four-decimal-grid">
          {problems.map((problem, index) => renderProblem(problem, index, answerSheet))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 소수 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 소수 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
