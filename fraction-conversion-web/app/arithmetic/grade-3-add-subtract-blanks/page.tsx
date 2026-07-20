"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type DigitField =
  | "topHundreds" | "topTens" | "topOnes"
  | "bottomHundreds" | "bottomTens" | "bottomOnes"
  | "resultThousands" | "resultHundreds" | "resultTens" | "resultOnes";
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
const ADDITION_HIDDEN: DigitField[][] = [
  ["topOnes", "bottomTens", "resultHundreds"],
  ["topHundreds", "bottomOnes", "resultTens"],
  ["topTens", "bottomHundreds", "resultOnes"],
];
const SUBTRACTION_HIDDEN: DigitField[][] = [
  ["topOnes", "bottomHundreds", "resultTens"],
  ["topTens", "bottomOnes", "resultHundreds"],
  ["topHundreds", "bottomTens", "resultOnes"],
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

function digits(problem: DigitProblem): Record<DigitField, string> {
  return {
    topHundreds: String(Math.floor(problem.top / 100)),
    topTens: String(Math.floor(problem.top / 10) % 10),
    topOnes: String(problem.top % 10),
    bottomHundreds: String(Math.floor(problem.bottom / 100)),
    bottomTens: String(Math.floor(problem.bottom / 10) % 10),
    bottomOnes: String(problem.bottom % 10),
    resultThousands: problem.result >= 1000 ? String(Math.floor(problem.result / 1000)) : "",
    resultHundreds: problem.result >= 100 ? String(Math.floor(problem.result / 100) % 10) : "",
    resultTens: String(Math.floor(problem.result / 10) % 10),
    resultOnes: String(problem.result % 10),
  };
}

function threeDigit(hundreds: number, tens: number, ones: number) {
  return hundreds * 100 + tens * 10 + ones;
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: DigitProblem[] = [];

  function additionGroup(group: number) {
    const topSpecs = [[4, 9, 0, 8, 2, 7], [1, 9, 0, 9, 4, 9], [1, 9, 0, 9, 0, 9]] as const;
    const bottomSpecs = [[1, 9, 0, 9, 4, 9], [1, 9, 0, 9, 2, 9], [1, 9, 0, 9, 0, 9]] as const;
    topSpecs.forEach((topSpec, index) => {
      const [topHundredsMin, topHundredsMax, topTensMin, topTensMax, topOnesMin, topOnesMax] = topSpec;
      const [bottomHundredsMin, bottomHundredsMax, bottomTensMin, bottomTensMax, bottomOnesMin, bottomOnesMax] = bottomSpecs[index];
      const top = threeDigit(
        integer(next, topHundredsMin, topHundredsMax),
        integer(next, topTensMin, topTensMax),
        integer(next, topOnesMin, topOnesMax),
      );
      const bottom = threeDigit(
        integer(next, bottomHundredsMin, bottomHundredsMax),
        integer(next, bottomTensMin, bottomTensMax),
        integer(next, bottomOnesMin, bottomOnesMax),
      );
      problems.push({ id: `grade-three-blank-${group}-${index}`, top, operator: "+", bottom, result: top + bottom, hidden: ADDITION_HIDDEN[index] });
    });
  }

  function subtractionGroup(group: number, secondGroup: boolean) {
    Array.from({ length: 3 }, (_, index) => {
      const topHundreds = integer(next, 4, 9);
      const topTens = integer(next, 0, 8);
      const topOnes = integer(next, 0, 8);
      const bottomHundredsMaximum = index === 1 || (index === 2 && !secondGroup) ? topHundreds - 2 : topHundreds - 1;
      const bottomTensMinimum = index === 0 || (index === 2 && secondGroup) ? topTens : 0;
      const top = threeDigit(topHundreds, topTens, topOnes);
      const bottom = threeDigit(
        integer(next, 1, bottomHundredsMaximum),
        integer(next, bottomTensMinimum, 9),
        integer(next, topOnes + 1, 9),
      );
      problems.push({ id: `grade-three-blank-${group}-${index}`, top, operator: "−", bottom, result: top - bottom, hidden: SUBTRACTION_HIDDEN[index] });
    });
  }

  additionGroup(0);
  subtractionGroup(1, false);
  additionGroup(2);
  subtractionGroup(3, true);
  return { seed, problems };
}

function answerId(problem: DigitProblem, field: DigitField) {
  return `${problem.id}-${field}`;
}

export default function GradeThreeAdditionSubtractionBlanksPage() {
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
  const correctProblems = questionSet.problems.filter((problem) => (
    problem.hidden.every((field) => results[answerId(problem, field)] === true)
  )).length;

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
      <div className={`digit-equation grade-three-blank-equation${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="grade-three-blank-equation" key={problem.id}>
        <div className="digit-operation">
          <span className="digit-line"><i aria-hidden="true" />{renderNumber(problem, ["topHundreds", "topTens", "topOnes"], answerSheet)}</span>
          <span className="digit-line"><i>{problem.operator}</i>{renderNumber(problem, ["bottomHundreds", "bottomTens", "bottomOnes"], answerSheet)}</span>
          <b aria-hidden="true" />
          <span className="digit-line result"><i aria-hidden="true" />{renderNumber(problem, ["resultThousands", "resultHundreds", "resultTens", "resultOnes"], answerSheet)}</span>
        </div>
        {!answerSheet && graded && (
          <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>
        )}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet digit-sheet grade-three-blank-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>덧셈뺄셈빈칸{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="digit-grid">{questionSet.problems.map((problem) => renderProblem(problem, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page digit-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correctProblems}<small>/12 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 덧셈뺄셈빈칸 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 덧셈뺄셈빈칸 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
