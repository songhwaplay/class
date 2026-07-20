"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type DigitField = "topTens" | "topOnes" | "bottomTens" | "bottomOnes" | "resultHundreds" | "resultTens" | "resultOnes";
type DigitProblem = {
  id: string;
  top: number;
  operator: "+" | "−";
  bottom: number;
  result: number;
  hidden: DigitField[];
};
type ProblemSet = { seed: number; problems: DigitProblem[] };

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

function digits(problem: DigitProblem): Record<DigitField, string> {
  return {
    topTens: String(Math.floor(problem.top / 10)),
    topOnes: String(problem.top % 10),
    bottomTens: String(Math.floor(problem.bottom / 10)),
    bottomOnes: String(problem.bottom % 10),
    resultHundreds: problem.result >= 100 ? String(Math.floor(problem.result / 100)) : "",
    resultTens: problem.result >= 10 ? String(Math.floor(problem.result / 10) % 10) : "",
    resultOnes: String(problem.result % 10),
  };
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: DigitProblem[] = [];

  function additionGroup(group: number) {
    const topSpecs = [[1, 9, 0, 8], [1, 9, 0, 9], [1, 5, 0, 9]] as const;
    const bottomSpecs = [[1, 5, 0, 9], [1, 9, 0, 9], [1, 9, 0, 9]] as const;
    const hidden: DigitField[][] = [
      ["bottomOnes", "resultTens"],
      ["topTens", "resultOnes"],
      ["topOnes", "bottomTens"],
    ];
    const tops = topSpecs.map(([tensMin, tensMax, onesMin, onesMax]) =>
      integer(next, tensMin, tensMax) * 10 + integer(next, onesMin, onesMax),
    );
    const bottoms = bottomSpecs.map(([tensMin, tensMax, onesMin, onesMax]) =>
      integer(next, tensMin, tensMax) * 10 + integer(next, onesMin, onesMax),
    );
    tops.forEach((top, index) => {
      const bottom = bottoms[index];
      problems.push({ id: `digit-${group}-${index}`, top, operator: "+", bottom, result: top + bottom, hidden: hidden[index] });
    });
  }

  function subtractionGroup(group: number) {
    const tops = Array.from({ length: 3 }, () => ({
      tens: integer(next, 4, 9),
      ones: integer(next, 0, 8),
    }));
    const hidden: DigitField[][] = [
      ["bottomTens", "resultOnes"],
      ["topOnes", "resultTens"],
      ["topTens", "bottomOnes"],
    ];
    tops.forEach(({ tens, ones }, index) => {
      const bottomTensMaximum = index === 1 ? tens - 2 : tens - 1;
      const bottom = integer(next, 1, bottomTensMaximum) * 10 + integer(next, ones + 1, 9);
      const top = tens * 10 + ones;
      problems.push({ id: `digit-${group}-${index}`, top, operator: "−", bottom, result: top - bottom, hidden: hidden[index] });
    });
  }

  additionGroup(0);
  subtractionGroup(1);
  additionGroup(2);
  subtractionGroup(3);
  return { seed, problems };
}

function answerId(problem: DigitProblem, field: DigitField) {
  return `${problem.id}-${field}`;
}

export default function GradeTwoAdditionSubtractionTwoPage() {
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

  const expected = useMemo(
    () => questionSet.problems.flatMap((problem) => {
      const values = digits(problem);
      return problem.hidden.map((field) => [answerId(problem, field), values[field]] as const);
    }),
    [questionSet],
  );
  const completed = Object.values(answers).filter(Boolean).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 1) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, value]) => [id, answers[id] === value])));
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

  function renderDigit(problem: DigitProblem, field: DigitField, answerSheet: boolean) {
    const value = digits(problem)[field];
    if (!problem.hidden.includes(field)) return <span className="digit-value">{value}</span>;
    if (answerSheet) return <strong className="digit-static-answer">{value}</strong>;
    const id = answerId(problem, field);
    return (
      <input
        className="digit-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={answers[id] ?? ""}
        onChange={(event) => updateAnswer(id, event.target.value)}
        aria-label={`${id} 답`}
      />
    );
  }

  function renderNumber(problem: DigitProblem, fields: DigitField[], answerSheet: boolean) {
    return <span className="digit-number">{fields.map((field) => <span key={field}>{renderDigit(problem, field, answerSheet)}</span>)}</span>;
  }

  function renderProblem(problem: DigitProblem, answerSheet: boolean) {
    const ids = problem.hidden.map((field) => answerId(problem, field));
    const graded = ids.some((id) => id in results);
    const isCorrect = graded && ids.every((id) => results[id]);
    return (
      <div className={`digit-equation${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="digit-equation" key={problem.id}>
        <div className="digit-operation">
          <span className="digit-line"><i aria-hidden="true" />{renderNumber(problem, ["topTens", "topOnes"], answerSheet)}</span>
          <span className="digit-line"><i>{problem.operator}</i>{renderNumber(problem, ["bottomTens", "bottomOnes"], answerSheet)}</span>
          <b aria-hidden="true" />
          <span className="digit-line result"><i aria-hidden="true" />{renderNumber(problem, ["resultHundreds", "resultTens", "resultOnes"], answerSheet)}</span>
        </div>
        {!answerSheet && graded && (
          <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">
            {isCorrect ? "맞음" : "틀림"}
          </span>
        )}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet digit-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>2학년</span>
            <strong>덧셈뺄셈②{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>
        <div className="digit-grid">{questionSet.problems.map((problem) => renderProblem(problem, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page digit-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/24 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 2학년 덧셈뺄셈② 문제지">
        {renderSheet(false)}
      </div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 2학년 덧셈뺄셈② 전체 답지">
        {renderSheet(true)}
      </div>
    </main>
  );
}
