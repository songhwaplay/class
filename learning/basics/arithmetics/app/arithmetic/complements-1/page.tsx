"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type SimpleProblem = { id: string; left: number; operator: "+" | "−"; right: number; result: number; hidden: "left" | "right" | "result" };
type TripleProblem = { id: string; values: [number, number, number]; result: number };
type ProblemSet = { seed: number; subtractions: SimpleProblem[]; pairs: SimpleProblem[]; triples: TripleProblem[] };

const INITIAL_SEED = 20260720;
const SUBTRACTION_RANGES: Array<[number, number]> = [
  [3, 9], [1, 9], [2, 9], [3, 9], [5, 8],
  [3, 9], [1, 9], [2, 9], [3, 9], [5, 8],
];

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

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const subtractions = SUBTRACTION_RANGES.map(([minimum, maximum], index) => {
    const right = integer(next, minimum, maximum);
    return { id: `subtract-${index}`, left: 10, operator: "−" as const, right, result: 10 - right, hidden: "result" as const };
  });

  const pairs = Array.from({ length: 10 }, (_, index) => {
    const left = integer(next, 1, 9);
    return {
      id: `pair-${index}`,
      left,
      operator: "+" as const,
      right: 10 - left,
      result: 10,
      hidden: (index % 2 === 0 ? "left" : "right") as "left" | "right",
    };
  });

  const triples = Array.from({ length: 10 }, (_, index) => {
    const first = integer(next, 1, 9);
    const extra = integer(next, 2, 9);
    const values = shuffle([first, 10 - first, extra], next) as [number, number, number];
    return { id: `triple-${index}`, values, result: 10 + extra };
  });

  return { seed, subtractions, pairs, triples };
}

function ResultMark({ value }: { value?: boolean }) {
  if (value === undefined) return null;
  return <span className={`counting-result ${value ? "correct" : "wrong"}`} role="status">{value ? "맞음" : "틀림"}</span>;
}

export default function ComplementsOnePage() {
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

  const expected = useMemo(() => [
    ...questionSet.subtractions.map((problem) => [problem.id, String(problem.result)] as const),
    ...questionSet.pairs.map((problem) => [problem.id, String(problem[problem.hidden])] as const),
    ...questionSet.triples.map((problem) => [problem.id, String(problem.result)] as const),
  ], [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 2) }));
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

  function answerBox(id: string, answer: number, answerSheet: boolean, twoDigits = false) {
    return answerSheet ? (
      <strong className={`complement-static-answer${twoDigits ? " wide" : ""}`}>{answer}</strong>
    ) : (
      <input
        className={`complement-input${twoDigits ? " wide" : ""}`}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={twoDigits ? 2 : 1}
        value={answers[id] ?? ""}
        onChange={(event) => updateAnswer(id, event.target.value)}
        aria-label={`${id} 답`}
      />
    );
  }

  function simpleRow(problem: SimpleProblem, answerSheet: boolean) {
    const number = (field: "left" | "right" | "result") =>
      problem.hidden === field ? answerBox(problem.id, problem[field], answerSheet) : <strong>{problem[field]}</strong>;
    return (
      <div className={`complement-row simple${results[problem.id] === true ? " is-correct" : results[problem.id] === false ? " is-wrong" : ""}`} data-testid="complement-row" key={problem.id}>
        {number("left")}<span>{problem.operator}</span>{number("right")}<span>=</span>{number("result")}
        {!answerSheet && <ResultMark value={results[problem.id]} />}
      </div>
    );
  }

  function tripleRow(problem: TripleProblem, answerSheet: boolean) {
    return (
      <div className={`complement-row triple${results[problem.id] === true ? " is-correct" : results[problem.id] === false ? " is-wrong" : ""}`} data-testid="complement-row" key={problem.id}>
        <strong>{problem.values[0]}</strong><span>+</span><strong>{problem.values[1]}</strong><span>+</span><strong>{problem.values[2]}</strong><span>=</span>
        {answerBox(problem.id, problem.result, answerSheet, true)}
        {!answerSheet && <ResultMark value={results[problem.id]} />}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet complement-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>1학년</span>
            <strong>10으로 모으거나 가르기{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>

        <div className="complement-columns">
          <section className="complement-column column-1" aria-label="10에서 빼기">
            {questionSet.subtractions.map((problem) => simpleRow(problem, answerSheet))}
          </section>
          <section className="complement-column column-2" aria-label="두 수로 10 만들기">
            {questionSet.pairs.map((problem) => simpleRow(problem, answerSheet))}
          </section>
          <section className="complement-column column-3" aria-label="세 수 더하기">
            {questionSet.triples.map((problem) => tripleRow(problem, answerSheet))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page complement-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/30 정답</small></strong></div>
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

      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 보수 문제지">
        {renderSheet(false)}
      </div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 보수 전체 답지">
        {renderSheet(true)}
      </div>
    </main>
  );
}
